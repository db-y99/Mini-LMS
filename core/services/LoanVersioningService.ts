/**
 * Loan Versioning Service
 * Tracks all major changes to loans with full snapshots
 * Provides audit trail and point-in-time recovery
 */

import { LoanApplication, User } from '../../types';
import { storageService } from '../../services/storageService';

/**
 * Loan Version
 */
export interface LoanVersion {
  id: string;
  loan_id: string;
  version: number;
  
  // Full snapshot of loan at this version
  snapshot: LoanApplication;
  
  // Version metadata
  version_type: 'original' | 'restructure' | 'amendment' | 'write_off' | 'status_change';
  reason: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
  
  // Changes from previous version
  changes?: VersionChange[];
  
  // Effective dates
  effective_from: string;
  effective_to?: string; // null = current version
}

/**
 * Version Change
 */
interface VersionChange {
  field: string;
  old_value: any;
  new_value: any;
}

/**
 * Loan Versioning Service
 */
export class LoanVersioningService {
  private readonly STORAGE_KEY = 'Mini-LMS_loan_versions';

  /**
   * Create new version of loan
   */
  async createVersion(
    loan: LoanApplication,
    versionType: LoanVersion['version_type'],
    reason: string,
    user: User
  ): Promise<LoanVersion> {
    const currentVersion = loan.version || 0;
    const newVersion = currentVersion + 1;

    // Get previous version for comparison
    const previousVersion = await this.getVersion(loan.id, currentVersion);
    
    // Calculate changes
    const changes = previousVersion 
      ? this.calculateChanges(previousVersion.snapshot, loan)
      : undefined;

    // Create new version
    const version: LoanVersion = {
      id: this.generateUUID(),
      loan_id: loan.id,
      version: newVersion,
      snapshot: this.deepClone(loan), // Full snapshot
      version_type: versionType,
      reason,
      created_by: user.id,
      created_by_name: user.fullName,
      created_at: new Date().toISOString(),
      changes,
      effective_from: new Date().toISOString(),
      effective_to: undefined // Current version
    };

    // Close previous version
    if (previousVersion) {
      await this.closeVersion(previousVersion.id);
    }

    // Save new version
    await this.saveVersion(version);

    // Update loan version number
    loan.version = newVersion;
    await storageService.saveLoan(loan);

    return version;
  }

  /**
   * Get specific version of loan
   */
  async getVersion(loanId: string, version: number): Promise<LoanVersion | null> {
    const versions = await this.getAllVersions(loanId);
    return versions.find(v => v.version === version) || null;
  }

  /**
   * Get all versions of loan
   */
  async getAllVersions(loanId: string): Promise<LoanVersion[]> {
    const allVersions = await this.loadVersions();
    return allVersions
      .filter(v => v.loan_id === loanId)
      .sort((a, b) => a.version - b.version);
  }

  /**
   * Get current version of loan
   */
  async getCurrentVersion(loanId: string): Promise<LoanVersion | null> {
    const versions = await this.getAllVersions(loanId);
    return versions.find(v => !v.effective_to) || null;
  }

  /**
   * Get version at specific date
   */
  async getVersionAt(loanId: string, date: Date): Promise<LoanVersion | null> {
    const versions = await this.getAllVersions(loanId);
    
    for (const version of versions) {
      const effectiveFrom = new Date(version.effective_from);
      const effectiveTo = version.effective_to ? new Date(version.effective_to) : new Date();
      
      if (date >= effectiveFrom && date <= effectiveTo) {
        return version;
      }
    }
    
    return null;
  }

  /**
   * Get version history (timeline)
   */
  async getVersionHistory(loanId: string): Promise<LoanVersion[]> {
    return await this.getAllVersions(loanId);
  }

  /**
   * Compare two versions
   */
  async compareVersions(
    loanId: string,
    version1: number,
    version2: number
  ): Promise<VersionChange[]> {
    const v1 = await this.getVersion(loanId, version1);
    const v2 = await this.getVersion(loanId, version2);

    if (!v1 || !v2) {
      throw new Error('Version not found');
    }

    return this.calculateChanges(v1.snapshot, v2.snapshot);
  }

  /**
   * Restore loan to specific version
   */
  async restoreVersion(
    loanId: string,
    version: number,
    user: User,
    reason: string
  ): Promise<LoanApplication> {
    const targetVersion = await this.getVersion(loanId, version);
    
    if (!targetVersion) {
      throw new Error(`Version ${version} not found`);
    }

    // Get current loan
    const loans = await storageService.getLoans();
    const currentLoan = loans.find(l => l.id === loanId);
    
    if (!currentLoan) {
      throw new Error('Loan not found');
    }

    // Create restoration snapshot
    const restoredLoan: LoanApplication = {
      ...targetVersion.snapshot,
      id: loanId, // Keep same ID
      updatedAt: new Date(),
      version: currentLoan.version // Will be incremented by createVersion
    };

    // Create new version for restoration
    await this.createVersion(
      restoredLoan,
      'amendment',
      `Restored to version ${version}: ${reason}`,
      user
    );

    // Save restored loan
    await storageService.saveLoan(restoredLoan);

    return restoredLoan;
  }

  /**
   * Check if should create version
   */
  shouldCreateVersion(
    oldLoan: LoanApplication,
    newLoan: LoanApplication
  ): { should: boolean; type?: LoanVersion['version_type']; reason?: string } {
    // Always version on these status changes
    const versionTriggerStatuses = [
      'DISBURSED',
      'RESTRUCTURED',
      'WRITE_OFF',
      'SETTLED',
      'BAD_DEBT'
    ];

    if (versionTriggerStatuses.includes(newLoan.status)) {
      return {
        should: true,
        type: this.getVersionType(newLoan.status),
        reason: `Status changed to ${newLoan.status}`
      };
    }

    // Version on major field changes
    const majorFields = [
      'loanAmount',
      'loanDuration',
      'interestRate',
      'monthlyPayment'
    ];

    for (const field of majorFields) {
      if ((oldLoan as any)[field] !== (newLoan as any)[field]) {
        return {
          should: true,
          type: 'amendment',
          reason: `${field} changed from ${(oldLoan as any)[field]} to ${(newLoan as any)[field]}`
        };
      }
    }

    return { should: false };
  }

  /**
   * Get version type based on status
   */
  private getVersionType(status: string): LoanVersion['version_type'] {
    const typeMap: Record<string, LoanVersion['version_type']> = {
      'DISBURSED': 'original',
      'RESTRUCTURED': 'restructure',
      'WRITE_OFF': 'write_off'
    };

    return typeMap[status] || 'status_change';
  }

  /**
   * Calculate changes between two loan snapshots
   */
  private calculateChanges(
    oldLoan: LoanApplication,
    newLoan: LoanApplication
  ): VersionChange[] {
    const changes: VersionChange[] = [];

    // Fields to track
    const trackedFields = [
      'status',
      'loanAmount',
      'loanDuration',
      'interestRate',
      'monthlyPayment',
      'totalPayment',
      'approval_level',
      'rejection_stage',
      'recovery_status',
      'dpd',
      'overdue_level',
      'is_frozen',
      'risk_score',
      'risk_grade'
    ];

    for (const field of trackedFields) {
      const oldValue = (oldLoan as any)[field];
      const newValue = (newLoan as any)[field];

      if (oldValue !== newValue) {
        changes.push({
          field,
          old_value: oldValue,
          new_value: newValue
        });
      }
    }

    return changes;
  }

  /**
   * Close version (set effective_to)
   */
  private async closeVersion(versionId: string): Promise<void> {
    const versions = await this.loadVersions();
    const version = versions.find(v => v.id === versionId);

    if (version) {
      version.effective_to = new Date().toISOString();
      await this.saveVersions(versions);
    }
  }

  /**
   * Save version
   */
  private async saveVersion(version: LoanVersion): Promise<void> {
    const versions = await this.loadVersions();
    versions.push(version);
    await this.saveVersions(versions);
  }

  /**
   * Load all versions from storage
   */
  private async loadVersions(): Promise<LoanVersion[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const versions = JSON.parse(stored);
      return versions.map((v: any) => ({
        ...v,
        snapshot: {
          ...v.snapshot,
          createdAt: new Date(v.snapshot.createdAt),
          updatedAt: new Date(v.snapshot.updatedAt)
        }
      }));
    } catch (error) {
      console.error('Failed to load versions:', error);
      return [];
    }
  }

  /**
   * Save all versions to storage
   */
  private async saveVersions(versions: LoanVersion[]): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(versions));
    } catch (error) {
      console.error('Failed to save versions:', error);
      throw error;
    }
  }

  /**
   * Deep clone object
   */
  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Generate UUID
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Clear all versions (for testing)
   */
  async clearAllVersions(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Get version statistics
   */
  async getVersionStats(loanId: string): Promise<{
    total_versions: number;
    version_types: Record<string, number>;
    first_version_date: string;
    last_version_date: string;
  }> {
    const versions = await this.getAllVersions(loanId);

    const stats = {
      total_versions: versions.length,
      version_types: {} as Record<string, number>,
      first_version_date: versions[0]?.created_at || '',
      last_version_date: versions[versions.length - 1]?.created_at || ''
    };

    // Count by type
    for (const version of versions) {
      stats.version_types[version.version_type] = 
        (stats.version_types[version.version_type] || 0) + 1;
    }

    return stats;
  }

  /**
   * Export version history
   */
  async exportVersionHistory(loanId: string): Promise<string> {
    const versions = await this.getAllVersions(loanId);
    return JSON.stringify(versions, null, 2);
  }

  /**
   * Get version summary (for UI display)
   */
  async getVersionSummary(loanId: string): Promise<Array<{
    version: number;
    type: string;
    reason: string;
    created_by: string;
    created_at: string;
    changes_count: number;
    is_current: boolean;
  }>> {
    const versions = await this.getAllVersions(loanId);

    return versions.map(v => ({
      version: v.version,
      type: v.version_type,
      reason: v.reason,
      created_by: v.created_by_name,
      created_at: v.created_at,
      changes_count: Array.isArray(v.changes) ? v.changes.length : 0,
      is_current: !v.effective_to
    }));
  }
}

// Singleton instance
export const loanVersioningService = new LoanVersioningService();
