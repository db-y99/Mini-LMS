/**
 * Storage Service - Abstraction layer for data persistence
 * 
 * This service provides a unified interface for data storage that can be
 * easily swapped between localStorage and database later.
 */

import { LoanApplication, Customer, AuditLogEntry, User } from '../types';

const STORAGE_KEYS = {
  LOANS: 'Mini-LMS_loans',
  CUSTOMERS: 'Mini-LMS_customers',
  AUDIT_LOGS: 'Mini-LMS_audit_logs',
  USERS: 'Mini-LMS_users',
  SETTINGS: 'Mini-LMS_settings'
} as const;

class StorageService {
  // ========== Loans ==========
  async getLoans(): Promise<LoanApplication[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LOANS);
      if (!stored) return [];
      
      const loans = JSON.parse(stored);
      // Convert date strings back to Date objects
      return loans.map((loan: any) => ({
        ...loan,
        createdAt: new Date(loan.createdAt),
        updatedAt: new Date(loan.updatedAt),
        customer: {
          ...loan.customer,
          createdAt: new Date(loan.customer.createdAt),
          updatedAt: new Date(loan.customer.updatedAt)
        },
        documents: loan.documents.map((doc: any) => ({
          ...doc,
          uploadedAt: new Date(doc.uploadedAt)
        }))
      }));
    } catch (error) {
      console.error('Failed to load loans from storage:', error);
      return [];
    }
  }

  async saveLoan(loan: LoanApplication): Promise<boolean> {
    try {
      const loans = await this.getLoans();
      const existingIndex = loans.findIndex(l => l.id === loan.id);
      
      if (existingIndex >= 0) {
        loans[existingIndex] = loan;
      } else {
        loans.push(loan);
      }
      
      localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
      return true;
    } catch (error) {
      console.error('Failed to save loan:', error);
      return false;
    }
  }

  async deleteLoan(loanId: string): Promise<boolean> {
    try {
      const loans = await this.getLoans();
      const filtered = loans.filter(l => l.id !== loanId);
      localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Failed to delete loan:', error);
      return false;
    }
  }

  async clearLoans(): Promise<boolean> {
    try {
      localStorage.removeItem(STORAGE_KEYS.LOANS);
      return true;
    } catch (error) {
      console.error('Failed to clear loans:', error);
      return false;
    }
  }

  // ========== Customers ==========
  async getCustomers(): Promise<Customer[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      if (!stored) return [];
      
      const customers = JSON.parse(stored);
      return customers.map((customer: any) => ({
        ...customer,
        createdAt: new Date(customer.createdAt),
        updatedAt: new Date(customer.updatedAt)
      }));
    } catch (error) {
      console.error('Failed to load customers from storage:', error);
      return [];
    }
  }

  async saveCustomer(customer: Customer): Promise<boolean> {
    try {
      const customers = await this.getCustomers();
      const existingIndex = customers.findIndex(c => c.id === customer.id);
      
      if (existingIndex >= 0) {
        customers[existingIndex] = customer;
      } else {
        customers.push(customer);
      }
      
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
      return true;
    } catch (error) {
      console.error('Failed to save customer:', error);
      return false;
    }
  }

  // ========== Audit Logs ==========
  async getAuditLogs(): Promise<AuditLogEntry[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (!stored) return [];
      
      const logs = JSON.parse(stored);
      return logs.map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp)
      }));
    } catch (error) {
      console.error('Failed to load audit logs from storage:', error);
      return [];
    }
  }

  async saveAuditLog(log: AuditLogEntry): Promise<boolean> {
    try {
      const logs = await this.getAuditLogs();
      
      // Check if log already exists (by ID)
      const existingIndex = logs.findIndex(l => l.id === log.id);
      if (existingIndex >= 0) {
        logs[existingIndex] = log;
      } else {
        logs.unshift(log); // Add to beginning
      }
      
      // Keep only last 1000 logs to prevent storage overflow
      const trimmed = logs.slice(0, 1000);
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(trimmed));
      return true;
    } catch (error) {
      console.error('Failed to save audit log:', error);
      return false;
    }
  }

  async saveAllAuditLogs(logs: AuditLogEntry[]): Promise<boolean> {
    try {
      // Keep only last 1000 logs to prevent storage overflow
      const trimmed = logs.slice(0, 1000);
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(trimmed));
      return true;
    } catch (error) {
      console.error('Failed to save audit logs:', error);
      return false;
    }
  }

  async clearAuditLogs(): Promise<boolean> {
    try {
      localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
      return true;
    } catch (error) {
      console.error('Failed to clear audit logs:', error);
      return false;
    }
  }

  // ========== Utility ==========
  async clearAll(): Promise<boolean> {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Failed to clear storage:', error);
      return false;
    }
  }

  async exportData(): Promise<string> {
    try {
      const data = {
        loans: await this.getLoans(),
        customers: await this.getCustomers(),
        auditLogs: await this.getAuditLogs(),
        exportedAt: new Date().toISOString()
      };
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }

  async importData(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString);
      
      if (data.loans) {
        localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(data.loans));
      }
      if (data.customers) {
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(data.customers));
      }
      if (data.auditLogs) {
        localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(data.auditLogs));
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
}

export const storageService = new StorageService();

