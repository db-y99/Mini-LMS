'use client';
import React, { useState, useEffect } from 'react';
import {
  FileSearch, Download, Eye, Search, Filter, Calendar,
  TrendingUp, TrendingDown, BarChart3, PieChart, FileText,
  CheckCircle, XCircle, Clock, AlertTriangle, Star,
  DollarSign, Users, Target, Zap, Printer, X
} from 'lucide-react';
import { AssessmentReport } from '../../types';

interface AssessmentReportExtended extends AssessmentReport {
  loanId: string;
  customerName: string;
  loanAmount: number;
  finalDecision: 'approved' | 'rejected' | 'pending_review';
  processingTime: number; // hours
  documentsVerified: boolean;
  incomeVerified: boolean;
  collateralVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ReportStats {
  totalReports: number;
  approvedReports: number;
  rejectedReports: number;
  pendingReports: number;
  averageProcessingTime: number;
  averageRiskScore: number;
  totalLoanAmount: number;
  conversionRate: number;
}

interface ReportFilter {
  dateFrom: string;
  dateTo: string;
  status: string;
  riskLevel: string;
  assessor: string;
}

export const AssessmentReportsView: React.FC = () => {
  const [reports, setReports] = useState<AssessmentReportExtended[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<AssessmentReportExtended | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState<ReportFilter>({
    dateFrom: '',
    dateTo: '',
    status: 'all',
    riskLevel: 'all',
    assessor: 'all'
  });

  useEffect(() => {
    setLoading(true);
    // Load reports from API or storage
    setTimeout(() => {
      setReports([]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.assessorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.loanId.includes(searchTerm);

    const matchesStatus = filters.status === 'all' || report.finalDecision === filters.status;
    const matchesRisk = filters.riskLevel === 'all' || report.riskLevel === filters.riskLevel;
    const matchesAssessor = filters.assessor === 'all' || report.assessorId === filters.assessor;

    const matchesDate = (!filters.dateFrom || report.createdAt >= new Date(filters.dateFrom)) &&
                       (!filters.dateTo || report.createdAt <= new Date(filters.dateTo));

    return matchesSearch && matchesStatus && matchesRisk && matchesAssessor && matchesDate;
  });

  const stats: ReportStats = {
    totalReports: reports.length,
    approvedReports: reports.filter(r => r.finalDecision === 'approved').length,
    rejectedReports: reports.filter(r => r.finalDecision === 'rejected').length,
    pendingReports: reports.filter(r => r.finalDecision === 'pending_review').length,
    averageProcessingTime: reports.reduce((sum, r) => sum + r.processingTime, 0) / reports.length,
    averageRiskScore: reports.reduce((sum, r) => sum + r.creditScore, 0) / reports.length,
    totalLoanAmount: reports.reduce((sum, r) => sum + r.loanAmount, 0),
    conversionRate: (reports.filter(r => r.finalDecision === 'approved').length / reports.length) * 100
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'pending_review': return 'text-amber-600 bg-amber-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-amber-600 bg-amber-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleExportReport = (format: 'pdf' | 'excel') => {
    // Export functionality - implement API call here
    console.log(`Exporting reports as ${format}`);
    alert(`Đang xuất báo cáo định dạng ${format.toUpperCase()}...`);
  };

  const uniqueAssessors = [...new Set(reports.map(r => ({ id: r.assessorId, name: r.assessorName })))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Báo cáo Thẩm định</h1>
          <p className="text-slate-600">Quản lý và xem báo cáo thẩm định chi tiết</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExportReport('pdf')}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Xuất PDF
          </button>
          <button
            onClick={() => handleExportReport('excel')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Tổng báo cáo</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalReports}</p>
            </div>
            <FileSearch className="w-8 h-8 text-slate-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Đã duyệt</p>
              <p className="text-2xl font-bold text-green-600">{stats.approvedReports}</p>
              <p className="text-xs text-slate-500">
                {stats.conversionRate.toFixed(1)}% tỷ lệ duyệt
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Từ chối</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejectedReports}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">TG xử lý TB</p>
              <p className="text-2xl font-bold text-blue-600">{stats.averageProcessingTime.toFixed(1)}h</p>
            </div>
            <Clock className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Từ ngày
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Đến ngày
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Trạng thái
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
              <option value="pending_review">Chờ xem xét</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mức độ rủi ro
            </label>
            <select
              value={filters.riskLevel}
              onChange={(e) => setFilters(prev => ({ ...prev, riskLevel: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="low">Thấp</option>
              <option value="medium">Trung bình</option>
              <option value="high">Cao</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Thẩm định viên
            </label>
            <select
              value={filters.assessor}
              onChange={(e) => setFilters(prev => ({ ...prev, assessor: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả</option>
              {uniqueAssessors.map(assessor => (
                <option key={assessor.id} value={assessor.id}>{assessor.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <div className="relative w-full">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Số tiền vay
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Điểm tín dụng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Mức độ rủi ro
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Quyết định
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Thẩm định viên
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">
                            {report.customerName}
                          </div>
                          <div className="text-sm text-slate-500">
                            {report.loanId}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">
                        {formatCurrency(report.loanAmount)}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500 fill-current" />
                        <span className="text-sm font-medium text-slate-900">
                          {report.creditScore}/100
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(report.riskLevel)}`}>
                        {report.riskLevel === 'low' ? 'Thấp' :
                         report.riskLevel === 'medium' ? 'Trung bình' : 'Cao'}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.finalDecision)}`}>
                        {report.finalDecision === 'approved' ? 'Duyệt' :
                         report.finalDecision === 'rejected' ? 'Từ chối' : 'Chờ xem xét'}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {report.assessorName}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {report.createdAt.toLocaleDateString('vi-VN')}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setShowDetailModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredReports.length === 0 && (
              <div className="text-center py-12">
                <FileSearch className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  {searchTerm ? 'Không tìm thấy báo cáo nào' : 'Chưa có báo cáo thẩm định nào'}
                </h3>
                <p className="text-slate-600">
                  {searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Các báo cáo thẩm định sẽ hiển thị ở đây'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  Chi tiết Báo cáo Thẩm định - {selectedReport.loanId}
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Thông tin cơ bản</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Khách hàng:</span>
                      <span className="font-medium">{selectedReport.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Số tiền vay:</span>
                      <span className="font-medium">{formatCurrency(selectedReport.loanAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Thẩm định viên:</span>
                      <span className="font-medium">{selectedReport.assessorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Ngày tạo:</span>
                      <span className="font-medium">{selectedReport.createdAt.toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Kết quả thẩm định</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Điểm tín dụng:</span>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500 fill-current" />
                        <span className="font-medium">{selectedReport.creditScore}/100</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Mức độ rủi ro:</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(selectedReport.riskLevel)}`}>
                        {selectedReport.riskLevel === 'low' ? 'Thấp' :
                         selectedReport.riskLevel === 'medium' ? 'Trung bình' : 'Cao'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Quyết định:</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedReport.finalDecision)}`}>
                        {selectedReport.finalDecision === 'approved' ? 'Duyệt' :
                         selectedReport.finalDecision === 'rejected' ? 'Từ chối' : 'Chờ xem xét'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Thời gian xử lý:</span>
                      <span className="font-medium">{selectedReport.processingTime.toFixed(1)} giờ</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Analysis */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Phân tích tài chính</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="text-sm text-slate-600 mb-1">Tỷ lệ nợ/thu nhập</div>
                    <div className="text-lg font-bold text-slate-900">
                      {(selectedReport.debtToIncomeRatio * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="text-sm text-slate-600 mb-1">Tỷ lệ vay/giá trị</div>
                    <div className="text-lg font-bold text-slate-900">
                      {(selectedReport.loanToValueRatio * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="text-sm text-slate-600 mb-1">Giá trị tài sản thế chấp</div>
                    <div className="text-lg font-bold text-slate-900">
                      {formatCurrency(selectedReport.collateralValue)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Factors & Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Yếu tố rủi ro</h4>
                  <ul className="space-y-2">
                    {selectedReport.riskFactors.map((factor, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Khuyến nghị</h4>
                  <ul className="space-y-2">
                    {selectedReport.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Verification Status */}
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Trạng thái xác minh</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-3 rounded-lg ${selectedReport.documentsVerified ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center gap-2">
                      {selectedReport.documentsVerified ?
                        <CheckCircle className="w-4 h-4 text-green-600" /> :
                        <XCircle className="w-4 h-4 text-red-600" />
                      }
                      <span className="text-sm font-medium">Giấy tờ</span>
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg ${selectedReport.incomeVerified ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center gap-2">
                      {selectedReport.incomeVerified ?
                        <CheckCircle className="w-4 h-4 text-green-600" /> :
                        <XCircle className="w-4 h-4 text-red-600" />
                      }
                      <span className="text-sm font-medium">Thu nhập</span>
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg ${selectedReport.collateralVerified ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center gap-2">
                      {selectedReport.collateralVerified ?
                        <CheckCircle className="w-4 h-4 text-green-600" /> :
                        <XCircle className="w-4 h-4 text-red-600" />
                      }
                      <span className="text-sm font-medium">Tài sản thế chấp</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 bg-slate-50">
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Đóng
                </button>
                <button
                  onClick={() => handleExportReport('pdf')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Xuất PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
