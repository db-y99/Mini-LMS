export const ROLES = {
  ADMIN: 'admin',
  CSKH: 'cskh',
  SECURITY: 'security',
  ASSESSMENT: 'assessment',
  ACCOUNTANT: 'accountant',
  CUSTOMER: 'customer',
  IT: 'it',
  COLLECTION: 'collection',
  LEGAL: 'legal',
  BRANCH_MANAGER: 'branch_manager',
  SYSTEM: 'system'
} as const;

export type RoleKey = keyof typeof ROLES;
export type UserRoleCode = typeof ROLES[RoleKey];

export const ROLE_DESCRIPTIONS: Record<UserRoleCode, string> = {
  admin: 'Admin duyệt & vận hành',
  cskh: 'Chăm sóc khách hàng - tạo hồ sơ',
  security: 'Security/Kỹ thuật - khóa thiết bị, kiểm tra bảo mật',
  assessment: 'Thẩm định tín dụng',
  accountant: 'Kế toán - lập/duyệt giải ngân',
  customer: 'Khách hàng - ký hợp đồng',
  it: 'IT hỗ trợ/giám sát',
  collection: 'Thu hồi nợ',
  legal: 'Pháp chế - xử lý pháp lý',
  branch_manager: 'Quản lý chi nhánh',
  system: 'Hệ thống (tự động)'
};

