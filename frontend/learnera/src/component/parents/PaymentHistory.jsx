import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarIcon, Download, IndianRupee } from 'lucide-react';
import api from '../../api';

const PaymentHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    status: 'ALL'
  });

  // Fetch all transactions initially
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Apply filters whenever filters state changes
  useEffect(() => {
    applyFilters();
  }, [filters, transactions]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get('parents/payment-history/');
      setTransactions(response.data);
      setFilteredTransactions(response.data);
    } catch (error) {
      toast.error('Failed to fetch payment history');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Apply start date filter
    if (filters.startDate) {
      filtered = filtered.filter(transaction => 
        new Date(transaction.transaction_date) >= filters.startDate
      );
    }

    // Apply end date filter
    if (filters.endDate) {
      filtered = filtered.filter(transaction => 
        new Date(transaction.transaction_date) <= filters.endDate
      );
    }

    // Apply status filter
    if (filters.status !== 'ALL') {
      filtered = filtered.filter(transaction => 
        transaction.status === filters.status
      );
    }

    setFilteredTransactions(filtered);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      SUCCESS: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      REFUNDED: 'bg-blue-100 text-blue-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100'}`}>
        {status}
      </span>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Payment History</CardTitle>
        <CardDescription>View and track all your payment transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.startDate ? format(filters.startDate, 'PPP') : 'Start Date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.startDate}
                onSelect={(date) => setFilters({ ...filters, startDate: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.endDate ? format(filters.endDate, 'PPP') : 'End Date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.endDate}
                onSelect={(date) => setFilters({ ...filters, endDate: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ ...filters, status: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="SUCCESS">Successful</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="REFUNDED">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transactions Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Fee Category</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{format(new Date(transaction.transaction_date), 'PPP')}</TableCell>
                    <TableCell>{transaction.student_name}</TableCell>
                    <TableCell>{transaction.fee_category}</TableCell>
                    <TableCell>{transaction.section}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <IndianRupee className="h-4 w-4 mr-1" />
                        {parseFloat(transaction.amount_paid).toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell>{transaction.payment_method}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={transaction.status !== 'SUCCESS'}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentHistory;