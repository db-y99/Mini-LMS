'use client';
import React, { useState, useEffect } from 'react';
import {
  Package, Plus, Edit, Trash2, Eye, EyeOff, Search,
  DollarSign, Calendar, Percent, Shield, Users, TrendingUp
} from 'lucide-react';
import { LoanProduct } from '@/types/product';

export const LoanProductManagementView: React.FC = () => {
  const [products, setProducts] = useState<LoanProduct[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<LoanProduct | null>(null);

  // Mock data
  useEffect(() => {
    const mockProducts: LoanProduct[] = [
      {
        id: '1',
        code: 'PHONE_LOAN_01',
        name: 'Vay cầm điện thoại',
        description: 'Sản phẩm vay nhanh với tài sản đảm bảo là điện thoại di động',
        minAmount: 1000000,
        maxAmount: 20000000,
        minDuration: 1,
        maxDuration: 12,
        interestRate: 24,
        interestType: 'fixed',
        processingFee: 2,
        lateFee: 0.5,
        earlyRepaymentFee: 1,
        collateralRequired: true,
        collateralTypes: ['phone'],
        minCollateralValue: 120,
        minAge: 18,
        maxAge: 60,
        minIncome: 3000000,
        minCreditScore: 600,
        isActive: true,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin',
        updatedBy: 'admin'
      }
    ];
    setProducts(mockProducts);
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
                         product.code.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' ||
                         (filter === 'active' && product.isActive) ||
                         (filter === 'inactive' && !product.isActive);
    return matchesSearch && matchesFilter;
  });

  const handleCreate = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEdit = (product: LoanProduct) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDelete = (productId: string) => {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      setProducts(products.filter(p => p.id !== productId));
    }
  };

  const handleToggleStatus = (productId: string) => {
    setProducts(products.map(p =>
      p.id === productId ? { ...p, isActive: !p.isActive } : p
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý sản phẩm vay</h1>
          <p className="text-slate-600 text-sm">
            Cấu hình các sản phẩm vay và điều kiện cho vay
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Tạo sản phẩm mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-medium text-slate-500">Tổng sản phẩm</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{products.length}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Eye className="w-5 h-5 text-green-600" />
            <span className="text-xs font-medium text-slate-500">Đang hoạt động</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {products.filter(p => p.isActive).length}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span className="text-xs font-medium text-slate-500">Công khai</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {products.filter(p => p.isPublic).length}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <span className="text-xs font-medium text-slate-500">Lãi suất TB</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {products.length > 0
              ? (products.reduce((sum, p) => sum + p.interestRate, 0) / products.length).toFixed(1)
              : 0}%
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">
              <Search className="inline w-3 h-3 mr-1" />
              Tìm kiếm
            </label>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tìm theo tên hoặc mã sản phẩm..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">
              Trạng thái
            </label>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <span className="text-sm font-semibold text-slate-900">
            Danh sách sản phẩm ({filteredProducts.length})
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          {filteredProducts.map(product => (
            <div key={product.id} className="p-4 hover:bg-slate-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-base font-semibold text-slate-900">{product.name}</h3>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                      {product.code}
                    </span>
                    {product.isActive ? (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                        Hoạt động
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                        Tạm dừng
                      </span>
                    )}
                    {product.isPublic && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                        Công khai
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{product.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                        <DollarSign className="w-3 h-3" />
                        Hạn mức
                      </div>
                      <div className="text-sm font-medium text-slate-900">
                        {(product.minAmount / 1000000).toFixed(1)}M - {(product.maxAmount / 1000000).toFixed(1)}M
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                        <Calendar className="w-3 h-3" />
                        Thời hạn
                      </div>
                      <div className="text-sm font-medium text-slate-900">
                        {product.minDuration} - {product.maxDuration} tháng
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                        <Percent className="w-3 h-3" />
                        Lãi suất
                      </div>
                      <div className="text-sm font-medium text-slate-900">
                        {product.interestRate}%/năm
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                        <Shield className="w-3 h-3" />
                        Tài sản ĐB
                      </div>
                      <div className="text-sm font-medium text-slate-900">
                        {product.collateralRequired ? product.collateralTypes.join(', ') : 'Không'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleToggleStatus(product.id)}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                    title={product.isActive ? 'Tạm dừng' : 'Kích hoạt'}
                  >
                    {product.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                    title="Chỉnh sửa"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              Không tìm thấy sản phẩm nào
            </div>
          )}
        </div>
      </div>

      {/* Modal placeholder */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Tạo sản phẩm mới'}
            </h2>
            <p className="text-slate-600 mb-4">Form sẽ được implement sau...</p>
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
