'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuditLogEntry, UserRole } from '../types';
import { storageService } from '../services/storageService';

interface AuditContextType {
  auditLogs: AuditLogEntry[];
  logAction: (action: Omit<AuditLogEntry, 'id' | 'timestamp'>) => Promise<boolean>;
  getLogsByUser: (userId: string) => AuditLogEntry[];
  getLogsByResource: (resourceType: string, resourceId?: string) => AuditLogEntry[];
  getLogsByDateRange: (startDate: Date, endDate: Date) => AuditLogEntry[];
  getRecentLogs: (limit?: number) => AuditLogEntry[];
  clearLogs: () => void;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

// Mock audit logs removed - using empty array
const mockAuditLogs: AuditLogEntry[] = [];

interface AuditProviderProps {
  children: ReactNode;
}

export const AuditProvider: React.FC<AuditProviderProps> = ({ children }) => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load audit logs from localStorage on mount
  useEffect(() => {
    const loadAuditLogs = async () => {
      try {
        const storedLogs = await storageService.getAuditLogs();
        
        // Filter out mock audit logs (audit_001, audit_002, audit_003, audit_004, audit_005) if they exist
        const mockLogIds = ['audit_001', 'audit_002', 'audit_003', 'audit_004', 'audit_005'];
        const hasMockData = storedLogs.some(log => mockLogIds.includes(log.id));
        
        if (hasMockData) {
          // Remove mock logs and save cleaned data
          const cleanedLogs = storedLogs.filter(log => !mockLogIds.includes(log.id));
          // Clear all and save only cleaned logs
          await storageService.clearAuditLogs();
          for (const log of cleanedLogs) {
            await storageService.saveAuditLog(log);
          }
          setAuditLogs(cleanedLogs);
        } else {
          setAuditLogs(storedLogs);
        }
      } catch (error) {
        console.error('Failed to load audit logs:', error);
        setAuditLogs([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuditLogs();
  }, []);

  // Note: We save individual logs in logAction, so no need for useEffect here

  const logAction = async (action: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<boolean> => {
    try {
      const newLog: AuditLogEntry = {
        ...action,
        id: `audit_${Date.now()}`,
        timestamp: new Date()
      };

      setAuditLogs(prev => [newLog, ...prev]);

      // Save to localStorage
      await storageService.saveAuditLog(newLog);

      console.log('Audit log created:', newLog);

      return true;
    } catch (error) {
      console.error('Failed to log audit action:', error);
      return false;
    }
  };

  const getLogsByUser = (userId: string): AuditLogEntry[] => {
    return auditLogs.filter(log => log.userId === userId);
  };

  const getLogsByResource = (resourceType: string, resourceId?: string): AuditLogEntry[] => {
    return auditLogs.filter(log => {
      if (resourceId) {
        return log.resourceType === resourceType && log.resourceId === resourceId;
      }
      return log.resourceType === resourceType;
    });
  };

  const getLogsByDateRange = (startDate: Date, endDate: Date): AuditLogEntry[] => {
    return auditLogs.filter(log =>
      log.timestamp >= startDate && log.timestamp <= endDate
    );
  };

  const getRecentLogs = (limit: number = 10): AuditLogEntry[] => {
    return auditLogs.slice(0, limit);
  };

  const clearLogs = async () => {
    setAuditLogs([]);
    // Clear from localStorage
    await storageService.clearAuditLogs();
  };

  const value: AuditContextType = {
    auditLogs,
    logAction,
    getLogsByUser,
    getLogsByResource,
    getLogsByDateRange,
    getRecentLogs,
    clearLogs
  };

  return (
    <AuditContext.Provider value={value}>
      {children}
    </AuditContext.Provider>
  );
};

export const useAudit = (): AuditContextType => {
  const context = useContext(AuditContext);
  if (context === undefined) {
    throw new Error('useAudit must be used within an AuditProvider');
  }
  return context;
};
