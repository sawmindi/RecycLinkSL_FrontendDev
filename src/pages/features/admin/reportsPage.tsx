import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { Download, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-toastify';
import { swalError } from '@/lib/swal';
import { formatDisplayDate, getDateLocaleFromLanguage, normalizeApiDateOnly } from '@/lib/formatDate';
import {
  getPickupRequests,
  getUsers,
  getItems,
  type PickupRequest,
  type AdminUser,
  type PriceItem,
} from '@/services/AdminService';

function dateInApiRange(value: string | null | undefined, from: string, to: string): boolean {
  if (!from && !to) return true;
  const day = normalizeApiDateOnly(value);
  if (!day) return false;
  if (from && day < from) return false;
  if (to && day > to) return false;
  return true;
}

function formatLkr(n: number): string {
  const v = Number.isFinite(n) ? n : 0;
  return `LKR ${v.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ReportsPage() {
  const { t, i18n } = useTranslation();
  const dateLocale = getDateLocaleFromLanguage(i18n.language);

  const [activeTab, setActiveTab] = useState('orders');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');

  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [priceItems, setPriceItems] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(true);

  const pickupStatusLabel = useCallback(
    (raw: string) => {
      const s = raw.toLowerCase();
      if (s === 'pending') return t('admin.collections.statusPending');
      if (s === 'assigned') return t('admin.collections.statusAssigned');
      if (s === 'completed') return t('admin.collections.statusCompleted');
      if (s === 'cancelled') return t('admin.collections.statusCancelled');
      if (s === 'scheduled') return t('admin.reports.statusScheduled');
      return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : '—';
    },
    [t]
  );

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [pr, ur, it] = await Promise.all([getPickupRequests(), getUsers(), getItems()]);

    if (pr.success) {
      setPickups(
        pr.data.map((req) => ({
          ...req,
          rough_weight: Number(req.rough_weight || 0),
          estimated_earnings: Number(req.estimated_earnings || 0),
        }))
      );
    } else {
      await swalError(t('admin.reports.toastLoadPickups'), pr.message);
      setPickups([]);
    }

    if (ur.success) {
      setUsers(ur.data);
    } else {
      await swalError(t('admin.reports.toastLoadUsers'), ur.message);
      setUsers([]);
    }

    if (it.success) {
      setPriceItems(it.data);
    } else {
      await swalError(t('admin.reports.toastLoadPrices'), it.message);
      setPriceItems([]);
    }

    setLoading(false);
  }, [t]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const filteredPickups = useMemo(() => {
    return pickups.filter((req) => {
      if (!dateInApiRange(req.created_at, dateFrom, dateTo)) return false;
      if (orderStatusFilter === 'all') return true;
      return (req.status || '').toLowerCase() === orderStatusFilter.toLowerCase();
    });
  }, [pickups, dateFrom, dateTo, orderStatusFilter]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (!dateInApiRange(u.joined_date, dateFrom, dateTo)) return false;
      if (userStatusFilter === 'all') return true;
      if (userStatusFilter === 'active') return u.is_active;
      if (userStatusFilter === 'inactive') return !u.is_active;
      return true;
    });
  }, [users, dateFrom, dateTo, userStatusFilter]);

  const filteredPrices = useMemo(() => {
    return priceItems.filter((p) => dateInApiRange(p.last_updated, dateFrom, dateTo));
  }, [priceItems, dateFrom, dateTo]);

  const pickupStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      assigned: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      scheduled: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
      completed: 'bg-green-100 text-green-800 hover:bg-green-100',
      cancelled: 'bg-red-100 text-red-800 hover:bg-red-100',
    };
    const key = status.toLowerCase();
    return (
      <Badge className={colors[key] || 'bg-gray-100 text-gray-800 hover:bg-gray-100'}>
        {pickupStatusLabel(status)}
      </Badge>
    );
  };

  const downloadExcel = (data: Record<string, string | number | boolean | null | undefined>[], sheetName: string, fileName: string) => {
    if (data.length === 0) {
      toast.error(t('admin.reports.toastNoExport'));
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));

    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      let maxw = 10;
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cell = worksheet[XLSX.utils.encode_cell({ c: C, r: R })];
        if (cell?.v != null) {
          const len = String(cell.v).length;
          if (len > maxw) maxw = len;
        }
      }
      worksheet['!cols'] = worksheet['!cols'] || [];
      worksheet['!cols'][C] = { wch: Math.min(maxw + 2, 50) };
    }

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
    toast.success(t('admin.reports.toastExported', { name: fileName }));
  };

  const handleGenerateReport = () => {
    if (activeTab === 'orders') {
      const rows = filteredPickups.map((o) => ({
        [t('admin.reports.exportCitizen')]: o.citizen_name,
        [t('admin.reports.exportArea')]: o.citizen_area,
        [t('admin.reports.exportDate')]: normalizeApiDateOnly(o.created_at) || formatDisplayDate(o.created_at, dateLocale),
        [t('admin.reports.exportStatus')]: pickupStatusLabel(o.status),
        [t('admin.reports.exportValue')]: formatLkr(Number(o.estimated_earnings || 0)),
        [t('admin.reports.exportItem')]: o.item_name,
      }));
      downloadExcel(rows, 'ORDERS', t('admin.reports.fileOrders'));
      return;
    }

    if (activeTab === 'users') {
      const rows = filteredUsers.map((u) => ({
        [t('admin.reports.exportName')]: u.full_name,
        [t('admin.reports.exportRole')]: u.role,
        [t('admin.reports.exportStatus')]: u.is_active ? t('admin.common.active') : t('admin.common.inactive'),
        [t('admin.reports.exportJoined')]: normalizeApiDateOnly(u.joined_date) || formatDisplayDate(u.joined_date, dateLocale),
        [t('admin.reports.exportEmail')]: u.email ?? '',
        [t('admin.reports.exportMobile')]: u.mobile_number,
        [t('admin.reports.exportArea')]: u.area,
      }));
      downloadExcel(rows, 'USERS', t('admin.reports.fileUsers'));
      return;
    }

    const rows = filteredPrices.map((p) => ({
      [t('admin.reports.exportItemName')]: p.item_name,
      [t('admin.reports.exportCategory')]: p.category_name ?? '',
      [t('admin.reports.exportPriceLkr')]: Number(p.current_price),
      [t('admin.reports.exportPriceDisplay')]: `${Number(p.current_price).toFixed(2)} ${t('admin.priceManagement.perKg')}`,
      [t('admin.reports.exportLastUpdated')]: normalizeApiDateOnly(p.last_updated) || formatDisplayDate(p.last_updated, dateLocale),
      [t('admin.reports.exportItemStatus')]: p.status === 'active' ? t('admin.common.active') : t('admin.common.inactive'),
    }));
    downloadExcel(rows, 'PRICES', t('admin.reports.filePrices'));
  };

  const showDateFilters = activeTab === 'orders' || activeTab === 'users' || activeTab === 'prices';

  return (
    <div className="space-y-6 sm:space-y-8 md:space-y-10 px-2 sm:px-4 md:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-gray-900 mb-1 sm:mb-2">
            {t('admin.reports.title')}
          </h1>
          <p className="text-base md:text-lg text-gray-600">{t('admin.reports.subtitle')}</p>
        </div>
        {/* <Button
          variant="outline"
          size="icon"
          onClick={() => void loadAll()}
          disabled={loading}
          aria-label={t('admin.reports.refresh')}
          className="self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button> */}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Tabs — scrollable on mobile */}
        <TabsList className="bg-gray-100 w-full sm:w-fit overflow-x-auto flex justify-start">
          <TabsTrigger value="orders" className="flex-1 sm:flex-none min-w-[100px]">
            {t('admin.reports.tabOrders')}
          </TabsTrigger>
          <TabsTrigger value="users" className="flex-1 sm:flex-none min-w-[100px]">
            {t('admin.reports.tabUsers')}
          </TabsTrigger>
          <TabsTrigger value="prices" className="flex-1 sm:flex-none min-w-[100px]">
            {t('admin.reports.tabPrices')}
          </TabsTrigger>
        </TabsList>

        {/* Filters card */}
        {showDateFilters && (
          <Card className="border-none shadow-md">
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label>{t('admin.reports.dateFrom')}</Label>
                  <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-10" />
                </div>
                <div className="space-y-2">
                  <Label>{t('admin.reports.dateTo')}</Label>
                  <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-10" />
                </div>

                {activeTab === 'orders' && (
                  <div className="space-y-2">
                    <Label>{t('admin.common.status')}</Label>
                    <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder={t('admin.reports.allStatuses')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('admin.collections.filterAll')}</SelectItem>
                        <SelectItem value="pending">{t('admin.collections.statusPending')}</SelectItem>
                        <SelectItem value="scheduled">{t('admin.reports.statusScheduled')}</SelectItem>
                        <SelectItem value="assigned">{t('admin.collections.statusAssigned')}</SelectItem>
                        <SelectItem value="completed">{t('admin.collections.statusCompleted')}</SelectItem>
                        <SelectItem value="cancelled">{t('admin.collections.statusCancelled')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {activeTab === 'users' && (
                  <div className="space-y-2">
                    <Label>{t('admin.common.status')}</Label>
                    <Select value={userStatusFilter} onValueChange={setUserStatusFilter}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder={t('admin.reports.allStatuses')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('admin.collections.filterAll')}</SelectItem>
                        <SelectItem value="active">{t('admin.common.active')}</SelectItem>
                        <SelectItem value="inactive">{t('admin.common.inactive')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-end sm:col-span-2 lg:col-span-1">
                  <Button className="w-full bg-teal-700 hover:bg-teal-800 h-10" onClick={handleGenerateReport}>
                    <Download className="mr-2 h-4 w-4" />
                    {t('admin.reports.downloadExcel')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card className="border-none shadow-lg overflow-hidden">
            <CardContent className="p-0">
              {loading ? (
                <div className="p-10 text-center text-gray-500">{t('admin.reports.loading')}</div>
              ) : filteredPickups.length === 0 ? (
                <div className="text-center py-16 text-gray-500 px-4">
                  <p className="text-lg font-medium">{t('admin.reports.emptyOrders')}</p>
                </div>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('admin.reports.thCitizen')}</TableHead>
                          <TableHead>{t('admin.reports.thArea')}</TableHead>
                          <TableHead>{t('admin.reports.thItem')}</TableHead>
                          <TableHead>{t('admin.reports.thDate')}</TableHead>
                          <TableHead>{t('admin.common.status')}</TableHead>
                          <TableHead>{t('admin.reports.thValue')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPickups.map((o) => (
                          <TableRow key={o._id}>
                            <TableCell>{o.citizen_name}</TableCell>
                            <TableCell>{o.citizen_area}</TableCell>
                            <TableCell>{o.item_name}</TableCell>
                            <TableCell>{formatDisplayDate(o.created_at, dateLocale)}</TableCell>
                            <TableCell>{pickupStatusBadge(o.status)}</TableCell>
                            <TableCell>{formatLkr(Number(o.estimated_earnings || 0))}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile cards */}
                  <div className="md:hidden divide-y divide-gray-100">
                    {filteredPickups.map((o) => (
                      <div key={o._id} className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-gray-900">{o.citizen_name}</p>
                            <p className="text-sm text-gray-500">{o.citizen_area}</p>
                          </div>
                          {pickupStatusBadge(o.status)}
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                          <div>
                            <span className="text-gray-500">{t('admin.reports.thItem')}: </span>
                            <span className="text-gray-800">{o.item_name}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">{t('admin.reports.thDate')}: </span>
                            <span className="text-gray-800">{formatDisplayDate(o.created_at, dateLocale)}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-500">{t('admin.reports.thValue')}: </span>
                            <span className="text-gray-800 font-medium">{formatLkr(Number(o.estimated_earnings || 0))}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card className="border-none shadow-lg overflow-hidden">
            <CardContent className="p-0">
              {loading ? (
                <div className="p-10 text-center text-gray-500">{t('admin.reports.loading')}</div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-16 text-gray-500 px-4">
                  <p className="text-lg font-medium">{t('admin.reports.emptyUsers')}</p>
                </div>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('admin.reports.thName')}</TableHead>
                          <TableHead>{t('admin.reports.thRole')}</TableHead>
                          <TableHead>{t('admin.common.status')}</TableHead>
                          <TableHead>{t('admin.reports.thJoined')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((u) => (
                          <TableRow key={u._id}>
                            <TableCell>{u.full_name}</TableCell>
                            <TableCell>{u.role}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  u.is_active
                                    ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                    : 'bg-red-100 text-red-800 hover:bg-red-100'
                                }
                              >
                                {u.is_active ? t('admin.common.active') : t('admin.common.inactive')}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDisplayDate(u.joined_date, dateLocale)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile cards */}
                  <div className="md:hidden divide-y divide-gray-100">
                    {filteredUsers.map((u) => (
                      <div key={u._id} className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-gray-900">{u.full_name}</p>
                          <Badge
                            className={
                              u.is_active
                                ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                : 'bg-red-100 text-red-800 hover:bg-red-100'
                            }
                          >
                            {u.is_active ? t('admin.common.active') : t('admin.common.inactive')}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                          <div>
                            <span className="text-gray-500">{t('admin.reports.thRole')}: </span>
                            <span className="text-gray-800">{u.role}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">{t('admin.reports.thJoined')}: </span>
                            <span className="text-gray-800">{formatDisplayDate(u.joined_date, dateLocale)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prices Tab */}
        <TabsContent value="prices">
          <Card className="border-none shadow-lg overflow-hidden">
            <CardContent className="p-0">
              {loading ? (
                <div className="p-10 text-center text-gray-500">{t('admin.reports.loading')}</div>
              ) : filteredPrices.length === 0 ? (
                <div className="text-center py-16 text-gray-500 px-4">
                  <p className="text-lg font-medium">{t('admin.reports.emptyPrices')}</p>
                </div>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('admin.reports.thItem')}</TableHead>
                          <TableHead>{t('admin.reports.thCategory')}</TableHead>
                          <TableHead>{t('admin.reports.thPrice')}</TableHead>
                          <TableHead>{t('admin.reports.thLastUpdated')}</TableHead>
                          <TableHead>{t('admin.common.status')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPrices.map((p) => (
                          <TableRow key={p._id} className={p.status === 'inactive' ? 'opacity-60 bg-gray-50' : ''}>
                            <TableCell className="font-medium">{p.item_name}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                                {p.category_name ?? '—'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {Number(p.current_price).toFixed(2)} {t('admin.priceManagement.perKg')}
                            </TableCell>
                            <TableCell>{formatDisplayDate(p.last_updated, dateLocale)}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  p.status === 'active'
                                    ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                    : 'bg-red-100 text-red-800 hover:bg-red-100'
                                }
                              >
                                {p.status === 'active' ? t('admin.common.active') : t('admin.common.inactive')}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile cards */}
                  <div className="md:hidden divide-y divide-gray-100">
                    {filteredPrices.map((p) => (
                      <div
                        key={p._id}
                        className={`p-4 space-y-3 ${p.status === 'inactive' ? 'opacity-60 bg-gray-50' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-gray-900">{p.item_name}</p>
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700 mt-1">
                              {p.category_name ?? '—'}
                            </Badge>
                          </div>
                          <Badge
                            className={
                              p.status === 'active'
                                ? 'bg-green-100 text-green-800 hover:bg-green-100 shrink-0'
                                : 'bg-red-100 text-red-800 hover:bg-red-100 shrink-0'
                            }
                          >
                            {p.status === 'active' ? t('admin.common.active') : t('admin.common.inactive')}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                          <div>
                            <span className="text-gray-500">{t('admin.reports.thPrice')}: </span>
                            <span className="text-gray-800 font-medium">
                              {Number(p.current_price).toFixed(2)} {t('admin.priceManagement.perKg')}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">{t('admin.reports.thLastUpdated')}: </span>
                            <span className="text-gray-800">{formatDisplayDate(p.last_updated, dateLocale)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}