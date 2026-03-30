/**
 * Versioning Module - Public API
 * Handles loan versioning and history
 */

import { loanVersioningService, LoanVersion } from '@/core/services/LoanVersioningService';
import { LoanApplication, User } from '@/types';

export class VersioningModule {
  /**
   * Create new version of loan
   */
  async createVersion(
    loan: LoanApplication,
    versionType: LoanVersion['version_type'],
    reason: string,
    user: User
  ): Promise<LoanVersion> {
    return loanVersioningService.createVersion(loan, versionType, reason, user);
  }

  /**
   * Get version by ID
   */
  async getVersion(loanId: string, version: number): Promise<LoanVersion | null> {
    return loanVersioningService.getVersion(loanId, version);
  }

  /**
   * Get all versions for a loan
   */
  async getVersions(loanId: string): Promise<LoanVersion[]> {
    return loanVersioningService.getAllVersions(loanId);
  }

  /**
   * Get current version
   */
  async getCurrentVersion(loanId: string): Promise<LoanVersion | null> {
    return loanVersioningService.getCurrentVersion(loanId);
  }

  /**
   * Get version history
   */
  async getVersionHistory(loanId: string): Promise<LoanVersion[]> {
    return loanVersioningService.getVersionHistory(loanId);
  }

  /**
   * Compare versions
   */
  async compareVersions(
    loanId: string,
    version1: number,
    version2: number
  ): Promise<any> {
    return loanVersioningService.compareVersions(loanId, version1, version2);
  }

  /**
   * Restore to version
   */
  async restoreToVersion(
    loanId: string,
    version: number,
    user: User,
    reason: string = 'Manual restoration'
  ): Promise<LoanApplication> {
    return loanVersioningService.restoreVersion(loanId, version, user, reason);
  }
}

// Export singleton instance
export const versioningModule = new VersioningModule();
