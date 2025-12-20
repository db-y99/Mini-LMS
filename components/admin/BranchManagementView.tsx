import React, { useState } from 'react';
import { Plus, Building2, MapPin, Search, ToggleLeft, ToggleRight, Pencil, Trash2 } from 'lucide-react';

interface Branch {
  id: string;
  code: string;
  name: string;
  province: string;
  address: string;
  manager: string;
  phone: string;
  isActive: boolean;
}

export const BranchManagementView: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [search, setSearch] = useState('');
  const [newBranch, setNewBranch] = useState<Partial<Branch>>({
    code: '',
    name: '',
    province: '',
    address: '',
    manager: '',
    phone: ''
  });

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranch.code || !newBranch.name) return;

    const branch: Branch = {
      id: `b-${Date.now()}`,
      code: newBranch.code!,
      name: newBranch.name!,
      province: newBranch.province || 'Không xác định',
      address: newBranch.address || '',
      manager: newBranch.manager || 'Chưa gán',
      phone: newBranch.phone || '',
      isActive: true
    };

    setBranches(prev => [branch, ...prev]);
    setNewBranch({
      code: '',
      name: '',
      province: '',
      address: '',
      manager: '',
      phone: ''
    });
  };

  const handleToggleActive = (id: string) => {
    setBranches(prev =>
      prev.map(b => (b.id === id ? { ...b, isActive: !b.isActive } : b))
    );
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xoá chi nhánh này khỏi danh sách?')) return;
    setBranches(prev => prev.filter(b => b.id !== id));
  };

  const filteredBranches = branches.filter(b => {
    const key = `${b.code} ${b.name} ${b.province}`.toLowerCase();
    return key.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Chi nhánh</h1>
          <p className="text-slate-600 text-sm">
            Quản trị danh sách chi nhánh, trạng thái hoạt động và thông tin quản lý.
          </p>
        </div>
      </div>

      {/* Top actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <form
          onSubmit={handleCreateBranch}
          className="bg-white border border-slate-200 rounded-xl p-4 lg:col-span-2 space-y-3"
        >
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-slate-900 text-sm">
              Thêm chi nhánh mới (Demo – lưu tạm trên trình duyệt)
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Mã chi nhánh *
              </label>
              <input
                type="text"
                value={newBranch.code || ''}
                onChange={e => setNewBranch(prev => ({ ...prev, code: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="VD: HCM-02"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Tên chi nhánh *
              </label>
              <input
                type="text"
                value={newBranch.name || ''}
                onChange={e => setNewBranch(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Chi nhánh Hồ Chí Minh 2"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Tỉnh / Thành phố
              </label>
              <input
                type="text"
                value={newBranch.province || ''}
                onChange={e => setNewBranch(prev => ({ ...prev, province: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Hồ Chí Minh"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Địa chỉ
              </label>
              <input
                type="text"
                value={newBranch.address || ''}
                onChange={e => setNewBranch(prev => ({ ...prev, address: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Số nhà, đường, quận/huyện"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                SĐT liên hệ
              </label>
              <input
                type="text"
                value={newBranch.phone || ''}
                onChange={e => setNewBranch(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="090x xxx xxx"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Thêm chi nhánh
            </button>
          </div>
        </form>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <h2 className="font-semibold text-slate-900 text-sm">
              Tìm kiếm / Lọc
            </h2>
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tìm theo mã, tên chi nhánh, tỉnh/thành..."
          />
          <p className="text-xs text-slate-500">
            Tổng cộng <span className="font-semibold">{filteredBranches.length}</span> chi nhánh phù hợp.
          </p>
        </div>
      </div>

      {/* Branch table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-slate-900">
              Danh sách chi nhánh
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left">Mã</th>
                <th className="px-4 py-2 text-left">Tên chi nhánh</th>
                <th className="px-4 py-2 text-left">Tỉnh/TP</th>
                <th className="px-4 py-2 text-left">Địa chỉ</th>
                <th className="px-4 py-2 text-left">Quản lý</th>
                <th className="px-4 py-2 text-left">Trạng thái</th>
                <th className="px-4 py-2 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredBranches.map(branch => (
                <tr
                  key={branch.id}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-4 py-2 font-semibold text-slate-900">
                    {branch.code}
                  </td>
                  <td className="px-4 py-2 text-slate-800">
                    {branch.name}
                  </td>
                  <td className="px-4 py-2 text-slate-700">
                    <div className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {branch.province}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    {branch.address}
                  </td>
                  <td className="px-4 py-2 text-slate-700">
                    <div className="flex flex-col">
                      <span>{branch.manager}</span>
                      {branch.phone && (
                        <span className="text-xs text-slate-400">{branch.phone}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleToggleActive(branch.id)}
                      className="inline-flex items-center gap-1 text-xs font-medium"
                    >
                      {branch.isActive ? (
                        <>
                          <ToggleRight className="w-4 h-4 text-green-500" />
                          <span className="text-green-600">Đang hoạt động</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-500">Tạm dừng</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100"
                        title="Sửa nhanh (demo)"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(branch.id)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                        title="Xoá khỏi danh sách (demo)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBranches.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-sm text-slate-500"
                  >
                    Không tìm thấy chi nhánh phù hợp với tiêu chí lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


