import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { swalConfirm, swalError, swalSuccess } from '../../../lib/swal';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import {
  getPickupRequests,
  getCollectors,
  updatePickupRequestStatus,
  assignCollectorToPickupRequest,
  type PickupRequest,
  type Collector,
} from '../../../services/AdminService';
import { cancelAdminPickupRequest } from '../../../services/pickupCancel';
import { formatDisplayDateTime, getDateLocaleFromLanguage } from '../../../lib/formatDate';

const PAGE_SIZE = 10;

export function CollectionListsPage() {
  const { t, i18n } = useTranslation();
  const dateLocale = getDateLocaleFromLanguage(i18n.language);
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [reassignRequest, setReassignRequest] = useState<PickupRequest | null>(null);
  const [selectedCollectorId, setSelectedCollectorId] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchRequests();
    fetchCollectors();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const res = await getPickupRequests();
    if (res.success) {
      const formatted = res.data.map((req) => ({
        ...req,
        rough_weight: Number(req.rough_weight || 0),
        estimated_earnings: Number(req.estimated_earnings || 0),
      }));
      setRequests(formatted);
      setCurrentPage(1);
    } else {
      await swalError(t('admin.collections.toastLoadFail'), res.message);
    }
    setLoading(false);
  };

  const fetchCollectors = async () => {
    const res = await getCollectors();
    if (res.success) setCollectors(res.data);
  };

  const collectionStatusLabel = (raw: string) => {
    const s = raw.toLowerCase();
    if (s === 'pending') return t('admin.collections.statusPending');
    if (s === 'scheduled') return t('admin.collections.statusScheduled');
    if (s === 'assigned') return t('admin.collections.statusAssigned');
    if (s === 'completed') return t('admin.collections.statusCompleted');
    if (s === 'cancelled') return t('admin.collections.statusCancelled');
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    const ok = await swalConfirm({
      title: t('admin.collections.confirmStatus', { status: collectionStatusLabel(newStatus) }),
      confirmButtonText: 'OK',
      cancelButtonText: t('admin.common.cancel'),
    });
    if (!ok) return;

    const res = await updatePickupRequestStatus(requestId, newStatus);
    if (res.success) {
      await swalSuccess(t('admin.collections.toastStatusSet', { status: collectionStatusLabel(newStatus) }));
      fetchRequests();
    } else {
      await swalError(t('admin.collections.toastStatusFail'), res.message);
    }
  };

  const handleReassign = (req: PickupRequest) => {
    setReassignRequest(req);
    setSelectedCollectorId('');
    setReassignModalOpen(true);
  };

  const handleReassignSubmit = async () => {
    if (!reassignRequest || !selectedCollectorId) return;

    const res = await assignCollectorToPickupRequest(reassignRequest._id, selectedCollectorId);
    if (res.success) {
      await swalSuccess(t('admin.collections.toastReassignOk'));
      setReassignModalOpen(false);
      fetchRequests();
    } else {
      await swalError(t('admin.collections.toastReassignFail'), res.message);
    }
  };

  const handleCancelPickupApi = async (req: PickupRequest) => {
    const ok = await swalConfirm({
      title: t('admin.collections.confirmCancelPickup'),
      text: t('admin.collections.confirmCancelPickupText', { citizen: req.citizen_name }),
      confirmButtonText: t('admin.collections.btnCancelRequest'),
      cancelButtonText: t('admin.common.cancel'),
    });
    if (!ok) return;

    const citizenId = req.citizen_id?.trim();
    const res = await cancelAdminPickupRequest(req._id, {
      ...(citizenId ? { citizenId } : {}),
      status: 'cancelled',
    });
    if (res.success) {
      await swalSuccess(t('admin.collections.toastCancelOk'));
      fetchRequests();
    } else {
      await swalError(t('admin.collections.toastCancelFail'), res.message);
    }
  };

  const filteredRequests = statusFilter === 'all'
    ? requests
    : requests.filter(r => r.status.toLowerCase() === statusFilter.toLowerCase());

  const hasActionableRows = filteredRequests.some(
    r => r.status.toLowerCase() === 'pending' || r.status.toLowerCase() === 'assigned'
  );

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedRequests = filteredRequests.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getPageNumbers = (): number[] => {
    const delta = 2;
    const left = Math.max(1, safePage - delta);
    const right = Math.min(totalPages, safePage + delta);
    const range: number[] = [];
    for (let i = left; i <= right; i++) range.push(i);
    return range;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    const key = status.toLowerCase();
    return (
      <Badge className={colors[key] || 'bg-gray-100 text-gray-800'}>{collectionStatusLabel(status)}</Badge>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-10 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-gray-900 mb-1 sm:mb-2">
            {t('admin.collections.title')}
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            {t('admin.collections.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-36 sm:w-44">
              <SelectValue placeholder={t('admin.collections.filterPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin.collections.filterAll')}</SelectItem>
              <SelectItem value="pending">{t('admin.collections.statusPending')}</SelectItem>
              <SelectItem value="assigned">{t('admin.collections.statusAssigned')}</SelectItem>
              <SelectItem value="completed">{t('admin.collections.statusCompleted')}</SelectItem>
              <SelectItem value="cancelled">{t('admin.collections.statusCancelled')}</SelectItem>
            </SelectContent>
          </Select>
{/* 
          <Button variant="outline" size="icon" onClick={fetchRequests}>
            <RefreshCw className="h-4 w-4" />
          </Button> */}
        </div>
      </div>

      {/* Table Card */}
      <Card className="border-none shadow-lg">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-10 text-center text-gray-500">{t('admin.collections.loading')}</div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-xl font-medium">{t('admin.collections.emptyTitle')}</p>
              <p className="mt-3">{t('admin.collections.emptyHint')}</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>{t('admin.collections.thCitizen')}</TableHead>
                      <TableHead>{t('admin.collections.thArea')}</TableHead>
                      <TableHead>{t('admin.collections.thItem')}</TableHead>
                      <TableHead>{t('admin.collections.thWeight')}</TableHead>
                      <TableHead>{t('admin.collections.thEarnings')}</TableHead>
                      <TableHead>{t('admin.collections.thActualWeight')}</TableHead>
                      <TableHead>{t('admin.collections.thActualEarnings')}</TableHead>
                      <TableHead>{t('admin.collections.thPriority')}</TableHead>
                      <TableHead>{t('admin.collections.thCollector')}</TableHead>
                      <TableHead>{t('admin.collections.thStatus')}</TableHead>
                      <TableHead>{t('admin.collections.thDate')}</TableHead>
                      {hasActionableRows && (
                        <TableHead className="text-right">{t('admin.common.actions')}</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedRequests.map((req) => (
                      <TableRow key={req._id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{req.citizen_name}</TableCell>
                        <TableCell>{req.citizen_area}</TableCell>
                        <TableCell>{req.item_name}</TableCell>
                        <TableCell>{Number(req.rough_weight).toFixed(2)}</TableCell>
                        <TableCell>{Number(req.estimated_earnings).toFixed(2)}</TableCell>
                        <TableCell>{Number(req.actual_weight).toFixed(2)}</TableCell>
                        <TableCell>{Number(req.final_price).toFixed(2)}</TableCell>
                        <TableCell className="capitalize">{req.priority}</TableCell>
                        <TableCell>
                          {req.assigned_collector ? (
                            <span className="font-medium text-blue-700">{req.assigned_collector}</span>
                          ) : (
                            <span className="text-gray-500">{t('admin.collections.unassigned')}</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(req.status)}</TableCell>
                        <TableCell>{formatDisplayDateTime(req.created_at, dateLocale)}</TableCell>

                        {hasActionableRows && (
                          <TableCell className="text-right space-x-2">
                            {(req.status.toLowerCase() === 'pending' || req.status.toLowerCase() === 'assigned') && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => void handleCancelPickupApi(req)}
                              >
                                <XCircle className="h-4 w-4 mr-1" /> {t('admin.collections.btnCancelRequest')}
                              </Button>
                            )}

                            {req.status.toLowerCase() === 'assigned' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleReassign(req)}
                                >
                                  {t('admin.collections.btnReassign')}
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusChange(req._id, 'completed')}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" /> {t('admin.collections.btnComplete')}
                                </Button>
                              </>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {pagedRequests.map((req) => (
                  <div key={req._id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900">{req.citizen_name}</p>
                        <p className="text-sm text-gray-500">{req.citizen_area}</p>
                      </div>
                      {getStatusBadge(req.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <div>
                        <span className="text-gray-500">{t('admin.collections.thItem')}: </span>
                        <span className="text-gray-800">{req.item_name}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">{t('admin.collections.thPriority')}: </span>
                        <span className="text-gray-800 capitalize">{req.priority}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">{t('admin.collections.thWeight')}: </span>
                        <span className="text-gray-800">{Number(req.rough_weight).toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">{t('admin.collections.thEarnings')}: </span>
                        <span className="text-gray-800">{Number(req.estimated_earnings).toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">{t('admin.collections.thActualWeight')}: </span>
                        <span className="text-gray-800">{Number(req.actual_weight).toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">{t('admin.collections.thActualEarnings')}: </span>
                        <span className="text-gray-800">{Number(req.final_price).toFixed(2)}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">{t('admin.collections.thCollector')}: </span>
                        {req.assigned_collector ? (
                          <span className="font-medium text-blue-700">{req.assigned_collector}</span>
                        ) : (
                          <span className="text-gray-500">{t('admin.collections.unassigned')}</span>
                        )}
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">{t('admin.collections.thDate')}: </span>
                        <span className="text-gray-800">{formatDisplayDateTime(req.created_at, dateLocale)}</span>
                      </div>
                    </div>

                    {(req.status.toLowerCase() === 'pending' || req.status.toLowerCase() === 'assigned') && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => void handleCancelPickupApi(req)}
                        >
                          <XCircle className="h-4 w-4 mr-1" /> {t('admin.collections.btnCancelRequest')}
                        </Button>

                        {req.status.toLowerCase() === 'assigned' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReassign(req)}
                            >
                              {t('admin.collections.btnReassign')}
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(req._id, 'completed')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" /> {t('admin.collections.btnComplete')}
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 p-4 sm:p-6 text-gray-600">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safePage === 1}
                    onClick={() => goToPage(safePage - 1)}
                  >
                    {t('admin.priceManagement.prev')}
                  </Button>

                  <div className="flex gap-2">
                    {getPageNumbers().map((page) => (
                      <Button
                        key={page}
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(page)}
                        className={
                          page === safePage
                            ? 'bg-teal-700 text-white border-teal-700 hover:bg-teal-800'
                            : ''
                        }
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safePage === totalPages}
                    onClick={() => goToPage(safePage + 1)}
                  >
                    {t('admin.priceManagement.next')}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Reassign Modal */}
      <Dialog open={reassignModalOpen} onOpenChange={setReassignModalOpen}>
        <DialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)] mx-auto">
          <DialogHeader>
            <DialogTitle>{t('admin.collections.modalReassign')}</DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-6">
            {reassignRequest && (
              <div className="p-3 bg-gray-50 rounded border space-y-1 text-sm">
                <p>
                  <strong>{t('admin.collections.summaryCitizen')}</strong> {reassignRequest.citizen_name}
                </p>
                <p>
                  <strong>{t('admin.collections.summaryItem')}</strong> {reassignRequest.item_name}
                </p>
                <p>
                  <strong>{t('admin.collections.summaryCollector')}</strong>{' '}
                  {reassignRequest.assigned_collector || t('admin.collections.none')}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>{t('admin.collections.newCollector')}</Label>
              <Select value={selectedCollectorId} onValueChange={setSelectedCollectorId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('admin.collections.selectCollectorPh')} />
                </SelectTrigger>
                <SelectContent>
                  {collectors.map(c => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.full_name} ({c.area})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setReassignModalOpen(false)}>
              {t('admin.common.cancel')}
            </Button>
            <Button
              disabled={!selectedCollectorId}
              onClick={handleReassignSubmit}
              className="bg-teal-700 hover:bg-teal-800 text-white"
            >
              {t('admin.collections.btnReassign')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}