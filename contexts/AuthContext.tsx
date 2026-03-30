'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, Permission, AuthContextType } from '../types';

// Permission mapping for each role
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'create_loan', 'view_loan', 'edit_loan', 'approve_loan', 'reject_loan', 'disburse_loan',
    'manage_users', 'manage_roles', 'view_audit_logs', 'manage_commission',
    'view_reports', 'manage_system', 'manage_cache'
  ],
  cskh: [
    'create_loan', 'view_loan', 'edit_loan'
  ],
  security: [
    'view_loan', 'approve_loan', 'reject_loan'
  ],
  assessment: [
    'view_loan', 'approve_loan', 'reject_loan'
  ],
  accountant: [
    'view_loan', 'disburse_loan', 'view_reports'
  ],
  customer: [
    'view_loan'
  ],
  it: [
    'create_loan', 'view_loan', 'edit_loan', 'approve_loan', 'reject_loan', 'disburse_loan',
    'manage_users', 'manage_roles', 'view_audit_logs', 'manage_commission',
    'view_reports', 'manage_system', 'manage_cache'
  ],
  collection: ['view_loan', 'view_reports'],
  legal: ['view_loan', 'view_reports'],
  branch_manager: ['view_loan', 'approve_loan', 'view_reports'],
  system: ['view_loan', 'view_reports']
};

// Mock user data for demo
const MOCK_USERS: Record<UserRole, Omit<User, 'id' | 'createdAt' | 'updatedAt'>> = {
  admin: {
    username: 'admin',
    email: 'admin@Mini-LMS.vn',
    fullName: 'System Admin',
    role: 'admin',
    permissions: ROLE_PERMISSIONS.admin,
    isActive: true,
    lastLogin: new Date()
  },
  cskh: {
    username: 'cskh',
    email: 'cskh@Mini-LMS.vn',
    fullName: 'Trần Minh Tú',
    role: 'cskh',
    permissions: ROLE_PERMISSIONS.cskh,
    isActive: true,
    lastLogin: new Date()
  },
  security: {
    username: 'security',
    email: 'security@Mini-LMS.vn',
    fullName: 'Lê Thanh Hải',
    role: 'security',
    permissions: ROLE_PERMISSIONS.security,
    isActive: true,
    lastLogin: new Date()
  },
  assessment: {
    username: 'assessment',
    email: 'assessment@Mini-LMS.vn',
    fullName: 'Nguyễn Văn Nam',
    role: 'assessment',
    permissions: ROLE_PERMISSIONS.assessment,
    isActive: true,
    lastLogin: new Date()
  },
  accountant: {
    username: 'accountant',
    email: 'accountant@Mini-LMS.vn',
    fullName: 'Phạm Thị Mai',
    role: 'accountant',
    permissions: ROLE_PERMISSIONS.accountant,
    isActive: true,
    lastLogin: new Date()
  },
  customer: {
    username: 'customer',
    email: 'customer@example.com',
    fullName: 'Nguyễn Văn A',
    role: 'customer',
    permissions: ROLE_PERMISSIONS.customer,
    isActive: true,
    lastLogin: new Date()
  },
  it: {
    username: 'it',
    email: 'it@Mini-LMS.vn',
    fullName: 'IT Support',
    role: 'it',
    permissions: ROLE_PERMISSIONS.it,
    isActive: true,
    lastLogin: new Date()
  },
  collection: {
    username: 'collection',
    email: 'collection@Mini-LMS.vn',
    fullName: 'Vũ Thị Lan',
    role: 'collection',
    permissions: ROLE_PERMISSIONS.collection,
    isActive: true,
    lastLogin: new Date()
  },
  legal: {
    username: 'legal',
    email: 'legal@Mini-LMS.vn',
    fullName: 'Hoàng Minh Đức',
    role: 'legal',
    permissions: ROLE_PERMISSIONS.legal,
    isActive: true,
    lastLogin: new Date()
  },
  branch_manager: {
    username: 'branch_manager',
    email: 'bm@Mini-LMS.vn',
    fullName: 'Nguyễn Thị Hương',
    role: 'branch_manager',
    permissions: ROLE_PERMISSIONS.branch_manager,
    isActive: true,
    lastLogin: new Date()
  },
  system: {
    username: 'system',
    email: 'system@Mini-LMS.vn',
    fullName: 'System',
    role: 'system',
    permissions: ROLE_PERMISSIONS.system,
    isActive: true,
    lastLogin: new Date()
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const savedUser = localStorage.getItem('Mini-LMS_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          // Validate user data structure
          if (userData && userData.id && userData.role && userData.permissions) {
            // Convert date strings back to Date objects
            if (userData.createdAt) userData.createdAt = new Date(userData.createdAt);
            if (userData.updatedAt) userData.updatedAt = new Date(userData.updatedAt);
            if (userData.lastLogin) userData.lastLogin = new Date(userData.lastLogin);

            setUser(userData);
            setIsAuthenticated(true);
            console.log('Restored user session:', userData.fullName);
          } else {
            console.warn('Invalid user data in localStorage, clearing...');
            localStorage.removeItem('Mini-LMS_user');
          }
        } else {
          // Auto-login for development (optional)
          // Uncomment the line below for easier development
          login('cskh');
        }
      } catch (error) {
        console.error('Failed to restore user session:', error);
        localStorage.removeItem('Mini-LMS_user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthState();
  }, []);

  const login = (role: UserRole, userData: Partial<User> = {}) => {
    const mockUserData = MOCK_USERS[role];

    const fullUser: User = {
      id: `user_${role}_${Date.now()}`,
      ...mockUserData,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setUser(fullUser);
    setIsAuthenticated(true);

    // Save to localStorage for persistence
    localStorage.setItem('Mini-LMS_user', JSON.stringify(fullUser));

    // Log login event (in real app, this would be sent to audit log service)
    console.log(`User ${fullUser.fullName} (${role}) logged in at ${new Date().toISOString()}`);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('Mini-LMS_user');

    // Log logout event
    console.log(`User logged out at ${new Date().toISOString()}`);
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return permissions.some(permission => user.permissions.includes(permission));
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasPermission,
    hasAnyPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Utility hook for role-based rendering
export const useRoleAccess = (allowedRoles: UserRole[]): boolean => {
  const { user } = useAuth();
  if (!user) return false;
  return allowedRoles.includes(user.role);
};

// Utility hook for permission-based rendering
export const usePermissionAccess = (requiredPermissions: Permission[]): boolean => {
  const { hasAnyPermission } = useAuth();
  return hasAnyPermission(requiredPermissions);
};
