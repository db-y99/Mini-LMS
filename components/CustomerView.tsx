'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Download, Plus, Eye, MoreHorizontal, Phone, Mail, MapPin, Star, ShieldAlert, UserCheck, Users, Trophy, UserX } from 'lucide-react';
import { useWorkflow } from '../contexts/WorkflowContext';
import { useAuth } from '../contexts/AuthContext';

interface CustomerDisplayItem {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  tier: string;
  score: number;
  totalLoans: number;
  totalAmount: string;
  status: string;
}

export const CustomerView: React.FC = () => {
  const { loans, refreshLoans } = useWorkflow();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Extract unique customers from loans data
  const customers: CustomerDisplayItem[] = useMemo(() => {
    const customerMap = new Map<string, CustomerDisplayItem>();

    // Filter loans based on user role (CS can only see customers they worked with)
    let filteredLoans = loans;
    if (user?.role === 'cskh') {
      filteredLoans = loans.filter(loan => loan.createdBy === user.id);
    }

    filteredLoans.forEach(loan => {
      const customerId = loan.customer.id;
      const existing = customerMap.get(customerId);

      if (existing) {
        // Update existing customer stats
        existing.totalLoans += 1;
        existing.totalAmount = (parseInt(existing.totalAmount.replace(/,/g, '')) + loan.loanAmount).toLocaleString();
      } else {
        // Create new customer entry
        customerMap.set(customerId, {
          id: `KH-${customerId.slice(-3).toUpperCase()}`,
          name: loan.customer.fullName,
          phone: loan.customer.phoneNumber,
          email: loan.customer.email,
          address: `${loan.customer.district}, ${loan.customer.province}`,
          tier: calculateCustomerTier(loan.loanAmount, filteredLoans.filter(l => l.customerId === customerId).length),
          score: Math.floor(Math.random() * 300) + 500, // Mock credit score for now
          totalLoans: 1,
          totalAmount: loan.loanAmount.toLocaleString(),
          status: loan.status === 'rejected' ? 'warning' : 'active'
        });
      }
    });

    return Array.from(customerMap.values());
  }, [loans, user]);

  // Calculate customer KPIs
  const customerKPIs = useMemo(() => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status === 'active').length;
    const vipCustomers = customers.filter(c => ['gold', 'platinum'].includes(c.tier)).length;
    const riskyCustomers = customers.filter(c => c.status === 'warning' || c.tier === 'black').length;

    return {
      totalCustomers,
      activeCustomers,
      vipCustomers,
      riskyCustomers
    };
  }, [customers]);

  const calculateCustomerTier = (loanAmount: number, loanCount: number): string => {
    const totalValue = loanAmount * loanCount;

    if (totalValue >= 500000000) return 'platinum';
    if (totalValue >= 200000000) return 'gold';
    if (totalValue >= 100000000) return 'silver';
    if (totalValue >= 50000000) return 'bronze';
    return 'black';
  };

  // Filter customers based on search
  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return customers;

    const search = searchTerm.toLowerCase();
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(search) ||
      customer.phone.includes(search) ||
      (customer.email && customer.email.toLowerCase().includes(search)) ||
      customer.id.toLowerCase().includes(search)
    );
  }, [customers, searchTerm]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await refreshLoans();
      } catch (error) {
        console.error('Failed to load customer data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [refreshLoans]);

  const getTierBadge = (tier: string) => {
    switch (tier) {
        case 'platinum':
            return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-slate-100 border border-slate-600"><Trophy className="w-3 h-3 mr-1 text-purple-400" /> Platinum</span>;
        case 'gold':
            return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200"><Star className="w-3 h-3 mr-1 text-amber-500 fill-amber-500" /> Gold</span>;
        case 'silver':
            return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200"><Star className="w-3 h-3 mr-1 text-slate-400 fill-slate-400" /> Silver</span>;
        case 'bronze':
            return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-orange-50 text-orange-700 border border-orange-100"><Star className="w-3 h-3 mr-1 text-orange-400" /> Bronze</span>;
        default: // black/blocked
            return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700 border border-red-200"><ShieldAlert className="w-3 h-3 mr-1" /> Blacklist</span>;
    }
  };

  const getScoreColor = (score: number) => {
      if (score >= 750) return 'text-green-600';
      if (score >= 650) return 'text-blue-600';
      if (score >= 550) return 'text-amber-600';
      return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">

      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Quản lý khách hàng</h2>
          <p className="text-slate-500 mt-1 text-sm">Thông tin khách hàng, lịch sử tín dụng và xếp hạng thành viên.</p>
        </div>
        <div className="flex gap-3">
            <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span>Xuất danh sách</span>
            </button>
            <button className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span>Thêm khách hàng</span>
            </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                  <p className="text-slate-500 text-sm font-medium">Tổng khách hàng</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{customerKPIs.totalCustomers.toLocaleString()}</h3>
                  <p className="text-green-600 text-xs font-medium mt-1">Khách hàng thực tế</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
              </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                  <p className="text-slate-500 text-sm font-medium">Khách đang vay</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{customerKPIs.activeCustomers}</h3>
                  <p className="text-slate-400 text-xs font-medium mt-1">{customerKPIs.totalCustomers > 0 ? Math.round((customerKPIs.activeCustomers / customerKPIs.totalCustomers) * 100) : 0}% tổng số</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                  <UserCheck className="w-6 h-6 text-green-600" />
              </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                  <p className="text-slate-500 text-sm font-medium">Khách hàng VIP</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{customerKPIs.vipCustomers}</h3>
                  <p className="text-amber-600 text-xs font-medium mt-1">Gold & Platinum</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                  <Trophy className="w-6 h-6 text-amber-600" />
              </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                  <p className="text-slate-500 text-sm font-medium">Nợ xấu / Rủi ro</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{customerKPIs.riskyCustomers}</h3>
                  <p className="text-red-600 text-xs font-medium mt-1">Cần chú ý</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                  <ShieldAlert className="w-6 h-6 text-red-600" />
              </div>
          </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
         <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
                type="text" 
                placeholder="Tìm tên, SĐT, Email..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="flex items-center gap-3 w-full md:w-auto">
             <button className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                 <Filter className="w-4 h-4" />
                 Lọc
             </button>
             <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none cursor-pointer">
                 <option>Tất cả hạng</option>
                 <option>Platinum</option>
                 <option>Gold</option>
                 <option>Silver</option>
             </select>
         </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-4 font-semibold">Khách hàng</th>
                        <th className="px-6 py-4 font-semibold">Liên hệ</th>
                        <th className="px-6 py-4 font-semibold">Khu vực</th>
                        <th className="px-6 py-4 font-semibold">Hạng & Điểm TD</th>
                        <th className="px-6 py-4 font-semibold">Tổng dư nợ</th>
                        <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredCustomers.length > 0 ? filteredCustomers.map((customer, i) => (
                        <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 border border-slate-200">
                                        {customer.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer">{customer.name}</p>
                                        <p className="text-xs text-slate-400">{customer.id}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{customer.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{customer.email}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                    {customer.address}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col items-start gap-1.5">
                                    {getTierBadge(customer.tier)}
                                    <span className={`text-xs font-bold ${getScoreColor(customer.score)}`}>
                                        Credit Score: {customer.score}
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div>
                                    <p className="font-bold text-slate-900">{customer.totalAmount} đ</p>
                                    <p className="text-xs text-slate-500">{customer.totalLoans} khoản vay</p>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                <div className="flex flex-col items-center gap-2">
                                    <UserX className="w-8 h-8 text-slate-300" />
                                    <p>Không có khách hàng nào</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
        
        {/* Pagination Footer */}
        {filteredCustomers.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="text-sm text-slate-500">
                    Hiển thị 1-{Math.min(filteredCustomers.length, 10)} trong {filteredCustomers.length} khách hàng
                </span>
                <div className="flex gap-2">
                    <button className="px-3 py-1 bg-white border border-slate-200 rounded text-sm text-slate-600 hover:bg-slate-50" disabled>
                        Trước
                    </button>
                    <button className="px-3 py-1 bg-white border border-slate-200 rounded text-sm text-slate-600 hover:bg-slate-50" disabled={filteredCustomers.length <= 10}>
                        Sau
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};