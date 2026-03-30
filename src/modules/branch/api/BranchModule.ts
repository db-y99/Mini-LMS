/**
 * Branch Module - Public API
 * Handles branch and user management
 */

import { Branch, User } from '@/types';
import { storageService } from '@/services/storageService';

export class BranchModule {
  /**
   * Get branch by ID
   */
  async getBranch(branchId: string): Promise<Branch | null> {
    const branches = await storageService.getBranches();
    return branches.find(b => b.id === branchId) || null;
  }

  /**
   * Get all branches
   */
  async getBranches(): Promise<Branch[]> {
    return storageService.getBranches();
  }

  /**
   * Create or update branch
   */
  async saveBranch(branch: Branch): Promise<boolean> {
    return storageService.saveBranch(branch);
  }

  /**
   * Create branch
   */
  async createBranch(branch: Branch): Promise<Branch> {
    await storageService.saveBranch(branch);
    return branch;
  }

  /**
   * Update branch
   */
  async updateBranch(branchId: string, updates: Partial<Branch>): Promise<Branch> {
    const branch = await this.getBranch(branchId);
    if (!branch) {
      throw new Error(`Branch ${branchId} not found`);
    }

    const updatedBranch = { ...branch, ...updates, updatedAt: new Date() };
    await storageService.saveBranch(updatedBranch);
    return updatedBranch;
  }

  /**
   * Delete branch
   */
  async deleteBranch(branchId: string): Promise<boolean> {
    return storageService.deleteBranch(branchId);
  }

  /**
   * Get users by branch
   * TODO: Move to UserModule when implemented
   */
  async getUsersByBranch(branchId: string): Promise<User[]> {
    // Temporarily disabled - will be moved to UserModule
    console.warn('getUsersByBranch is temporarily disabled');
    return [];
  }

  /**
   * Assign user to branch
   * TODO: Move to UserModule when implemented
   */
  async assignUserToBranch(userId: string, branchId: string): Promise<void> {
    // Temporarily disabled - will be moved to UserModule
    console.warn('assignUserToBranch is temporarily disabled');
  }

  /**
   * Get branch statistics
   */
  async getBranchStatistics(branchId: string): Promise<{
    totalLoans: number;
    activeLoans: number;
    totalDisbursed: number;
    totalUsers: number;
  }> {
    // TODO: Implement statistics calculation
    return {
      totalLoans: 0,
      activeLoans: 0,
      totalDisbursed: 0,
      totalUsers: 0
    };
  }
}

// Export singleton instance
export const branchModule = new BranchModule();
