import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-toastify';

// Mock data (same as yours)
const orders = [
  { id: 'O001', citizen: 'Saman Perera', area: 'Colombo 7', date: '2025-02-10', status: 'Completed', value: 'LKR 850' },
  { id: 'O002', citizen: 'Priya Fernando', area: 'Kandy', date: '2025-02-08', status: 'Pending', value: 'LKR 320' },
];

const users = [
  { id: 'U001', name: 'Kamal Silva', role: 'Collector', status: 'Active', joined: '2024-11-15' },
  { id: 'U002', name: 'Nimal Perera', role: 'Citizen', status: 'Inactive', joined: '2025-01-10' },
];

const prices = [
  { item: 'Iron/Steel', category: 'Metal', price: 'LKR 200/kg', lastUpdated: '2025-01-30' },
  { item: 'Paper', category: 'Paper', price: 'LKR 100/kg', lastUpdated: '2025-01-25' },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('orders');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const downloadExcel = (data: any[], sheetName: string, fileName: string) => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      let maxw = 10;
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cell = worksheet[XLSX.utils.encode_cell({ c: C, r: R })];
        if (cell?.v) {
          const len = String(cell.v).length;
          if (len > maxw) maxw = len;
        }
      }
      worksheet['!cols'] = worksheet['!cols'] || [];
      worksheet['!cols'][C] = { wch: maxw + 2 };
    }

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
    toast.success(`Downloaded ${fileName}.xlsx`);
  };

  const handleGenerateReport = () => {
    let dataToExport: any[] = [];
    let fileName = '';

    if (activeTab === 'orders') {
      dataToExport = orders.map(o => ({
        'Order ID': o.id,
        Citizen: o.citizen,
        Area: o.area,
        Date: o.date,
        Status: o.status,
        Value: o.value,
      }));
      fileName = 'Orders_Report';
    } else if (activeTab === 'users') {
      dataToExport = users.map(u => ({
        'User ID': u.id,
        Name: u.name,
        Role: u.role,
        Status: u.status,
        'Joined Date': u.joined,
      }));
      fileName = 'Users_Report';
    } else if (activeTab === 'prices') {
      dataToExport = prices.map(p => ({
        'Item Name': p.item,
        Category: p.category,
        'Current Price': p.price,
        'Last Updated': p.lastUpdated,
      }));
      fileName = 'Price_List_Report';
    }

    downloadExcel(dataToExport, activeTab.toUpperCase(), fileName);
  };

  return (
    <div className="space-y-8 md:space-y-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">
            Reports
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            Generate and download reports for orders, users, and prices
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gray-100 w-full sm:w-fit overflow-x-auto flex justify-start">
          <TabsTrigger value="orders" className="min-w-[120px]">Orders Report</TabsTrigger>
          <TabsTrigger value="users" className="min-w-[120px]">Users Report</TabsTrigger>
          <TabsTrigger value="prices" className="min-w-[120px]">Price List Report</TabsTrigger>
        </TabsList>

        {/* Filters - shown for Orders & Users */}
        {(activeTab === 'orders' || activeTab === 'users') && (
          <Card className="border-none shadow-md">
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label>Date From</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date To</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="h-10"
                  />
                </div>

                {activeTab === 'orders' && (
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {activeTab === 'users' && (
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select defaultValue="all">
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-end">
                  <Button
                    className="w-full bg-teal-700 hover:bg-teal-800 h-10"
                    onClick={handleGenerateReport}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Excel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Report Tables */}
        <TabsContent value="orders">
          <Card className="border-none shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Citizen</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell>{o.id}</TableCell>
                        <TableCell>{o.citizen}</TableCell>
                        <TableCell>{o.area}</TableCell>
                        <TableCell>{o.date}</TableCell>
                        <TableCell>
                          <Badge variant={o.status === 'Completed' ? 'default' : 'secondary'}>
                            {o.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{o.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="border-none shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>{u.id}</TableCell>
                        <TableCell>{u.name}</TableCell>
                        <TableCell>{u.role}</TableCell>
                        <TableCell>
                          <Badge variant={u.status === 'Active' ? 'default' : 'destructive'}>
                            {u.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{u.joined}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prices">
          <Card className="border-none shadow-lg overflow-hidden">
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prices.map((p, i) => (
                      <TableRow key={i}>
                        <TableCell>{p.item}</TableCell>
                        <TableCell>{p.category}</TableCell>
                        <TableCell>{p.price}</TableCell>
                        <TableCell>{p.lastUpdated}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end mt-6">
                <Button
                  className="bg-teal-700 hover:bg-teal-800"
                  onClick={() => handleGenerateReport()}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Price List (Excel)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}