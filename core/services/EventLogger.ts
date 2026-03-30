/**
 * Event Logger Service
 * Immutable event log system for complete audit trail
 * All loan-related events are logged here
 */

import { LoanApplication, User } from '../../types';
import { storageService } from '../../services/storageService';
import { CanonicalLoanStatus } from '../../constants/status';

/**
 * Event Types
 */
export type LoanEventType =
  // Status changes
  | 'STATUS_CHANGED'
  | 'STATUS_CHANGE_FAILED'
  
  // Loan lifecycle
  | 'LOAN_CREATED'
  | 'LOAN_UPDATED'
  | 'LOAN_DELETED'
  
  // Approval & rejection
  | 'APPROVAL_GRANTED'
  | 'APPROVAL_REJECTED'
  | 'REJECTION_RECORDED'
  
  // Documents
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_VERIFIED'
  | 'DOCUMENT_REJECTED'
  | 'DOCUMENT_DELETED'
  
  // Assessment
  | 'ASSESSMENT_STARTED'
  | 'ASSESSMENT_COMPLETED'
  | 'ASSESSMENT_REPORT_CREATED'
  | 'SUPPLEMENT_REQUESTED'
  | 'SUPPLEMENT_PROVIDED'
  
  // Security
  | 'SECURITY_CHECK_STARTED'
  | 'SECURITY_CHECK_PASSED'
  | 'SECURITY_CHECK_FAILED'
  | 'FRAUD_DETECTED'
  | 'BLACKLIST_CHECK'
  
  // Collateral
  | 'DEVICE_LOCK_REQUESTED'
  | 'DEVICE_LOCKED'
  | 'DEVICE_UNLOCK_REQUESTED'
  | 'COLLATERAL_VERIFIED'
  | 'COLLATERAL_REJECTED'
  
  // Contract
  | 'CONTRACT_GENERATED'
  | 'CONTRACT_SENT'
  | 'CONTRACT_SIGNED'
  | 'CONTRACT_REJECTED'
  | 'CONTRACT_EXPIRED'
  
  // Disbursement
  | 'DISBURSEMENT_DRAFTED'
  | 'DISBURSEMENT_APPROVED'
  | 'DISBURSEMENT_PROCESSING'
  | 'DISBURSEMENT_COMPLETED'
  | 'DISBURSEMENT_FAILED'
  
  // Repayment
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_SCHEDULED'
  | 'PAYMENT_OVERDUE'
  | 'PAYMENT_REMINDER_SENT'
  
  // Collection
  | 'COLLECTION_STARTED'
  | 'COLLECTION_ACTION_TAKEN'
  | 'RESTRUCTURE_REQUESTED'
  | 'RESTRUCTURE_APPROVED'
  | 'WRITE_OFF_INITIATED'
  | 'WRITE_OFF_COMPLETED'
  
  // Loan state
  | 'LOAN_FROZEN'
  | 'LOAN_UNFROZEN'
  | 'LOAN_ASSIGNED'
  | 'LOAN_REASSIGNED'
  
  // Version
  | 'VERSION_CREATED'
  | 'VERSION_RESTORED'
  
  // Commission
  | 'COMMISSION_CALCULATED'
  | 'COMMISSION_PAID'
  
  // System
  | 'SYSTEM_ERROR'
  | 'VALIDATION_ERROR'
  | 'PERMISSION_DENIED';

/**
 * Loan Event
 */
export interface LoanEvent {
  id: string;
  loan_id: string;
  loan_number?: string; // For easier tracking
  
  // Event details
  event_type: LoanEventType;
  event_data: Record<string, any>;
  event_description?: string; // Human-readable description
  
  // User context
  created_by: string;
  created_by_name?: string;
  created_by_role: string;
  
  // Timestamp
  created_at: string;
  
  // Additional context
  branch_id?: string;
  ip_address?: string;
  user_agent?: string;
  
  // Correlation (for tracking related events)
  correlation_id?: string;
  parent_event_id?: string;
  
  // Metadata
  metadata?: Record<string, any>;
}

/**
 * Event Filter
 */
export interface EventFilter {
  loan_id?: string;
  event_types?: LoanEventType[];
  created_by?: string;
  branch_id?: string;
  date_from?: Date;
  date_to?: Date;
  correlation_id?: string;
  limit?: number;
  offset?: number;
}

/**
 * Event Statistics
 */
export interface EventStatistics {
  total_events: number;
  events_by_type: Record<LoanEventType, number>;
  events_by_user: Record<string, number>;
  events_by_date: Array<{ date: string; count: number }>;
  most_active_loans: Array<{ loan_id: string; event_count: number }>;
}

/**
 * Event Logger Service
 */
export class EventLogger {
  private readonly STORAGE_KEY = 'Mini-LMS_event_log';

  /**
   * Log an event (main entry point)
   */
  async log(
    loanId: string,
    eventType: LoanEventType,
    eventData: Record<string, any>,
    user: User,
    options?: {
      description?: string;
      correlation_id?: string;
      parent_event_id?: string;
      ip_address?: string;
      user_agent?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<LoanEvent> {
    // Get loan for context
    const loan = await this.getLoan(loanId);
    
    const event: LoanEvent = {
      id: this.generateUUID(),
      loan_id: loanId,
      loan_number: loan?.id || loanId,
      event_type: eventType,
      event_data: eventData,
      event_description: options?.description || this.generateDescription(eventType, eventData),
      created_by: user.id,
      created_by_name: user.fullName,
      created_by_role: user.role,
      created_at: new Date().toISOString(),
      branch_id: loan?.branchId,
      ip_address: options?.ip_address,
      user_agent: options?.user_agent,
      correlation_id: options?.correlation_id,
      parent_event_id: options?.parent_event_id,
      metadata: options?.metadata
    };

    await this.saveEvent(event);
    return event;
  }

  /**
   * Log status change
   */
  async logStatusChange(
    loanId: string,
    fromStatus: CanonicalLoanStatus,
    toStatus: CanonicalLoanStatus,
    user: User,
    reason?: string,
    metadata?: Record<string, any>
  ): Promise<LoanEvent> {
    return await this.log(
      loanId,
      'STATUS_CHANGED',
      {
        from_status: fromStatus,
        to_status: toStatus,
        reason
      },
      user,
      {
        description: `Trạng thái thay đổi từ ${fromStatus} sang ${toStatus}`,
        metadata
      }
    );
  }

  /**
   * Log document upload
   */
  async logDocumentUpload(
    loanId: string,
    documentType: string,
    fileName: string,
    user: User
  ): Promise<LoanEvent> {
    return await this.log(
      loanId,
      'DOCUMENT_UPLOADED',
      {
        document_type: documentType,
        file_name: fileName
      },
      user,
      {
        description: `Tải lên tài liệu: ${fileName}`
      }
    );
  }

  /**
   * Log approval
   */
  async logApproval(
    loanId: string,
    approvalType: string,
    approvalLevel: string,
    user: User,
    notes?: string
  ): Promise<LoanEvent> {
    return await this.log(
      loanId,
      'APPROVAL_GRANTED',
      {
        approval_type: approvalType,
        approval_level: approvalLevel,
        notes
      },
      user,
      {
        description: `Phê duyệt: ${approvalType} (${approvalLevel})`
      }
    );
  }

  /**
   * Log rejection
   */
  async logRejection(
    loanId: string,
    rejectionStage: string,
    reason: string,
    user: User
  ): Promise<LoanEvent> {
    return await this.log(
      loanId,
      'REJECTION_RECORDED',
      {
        rejection_stage: rejectionStage,
        reason
      },
      user,
      {
        description: `Từ chối tại giai đoạn ${rejectionStage}: ${reason}`
      }
    );
  }

  /**
   * Log disbursement
   */
  async logDisbursement(
    loanId: string,
    amount: number,
    bankAccount: string,
    user: User,
    status: 'drafted' | 'approved' | 'processing' | 'completed' | 'failed'
  ): Promise<LoanEvent> {
    const eventTypeMap = {
      drafted: 'DISBURSEMENT_DRAFTED' as LoanEventType,
      approved: 'DISBURSEMENT_APPROVED' as LoanEventType,
      processing: 'DISBURSEMENT_PROCESSING' as LoanEventType,
      completed: 'DISBURSEMENT_COMPLETED' as LoanEventType,
      failed: 'DISBURSEMENT_FAILED' as LoanEventType
    };

    return await this.log(
      loanId,
      eventTypeMap[status],
      {
        amount,
        bank_account: bankAccount,
        status
      },
      user,
      {
        description: `Giải ngân ${amount.toLocaleString('vi-VN')} VND - ${status}`
      }
    );
  }

  /**
   * Log payment
   */
  async logPayment(
    loanId: string,
    amount: number,
    installmentNumber: number,
    user: User
  ): Promise<LoanEvent> {
    return await this.log(
      loanId,
      'PAYMENT_RECEIVED',
      {
        amount,
        installment_number: installmentNumber
      },
      user,
      {
        description: `Nhận thanh toán kỳ ${installmentNumber}: ${amount.toLocaleString('vi-VN')} VND`
      }
    );
  }

  /**
   * Log loan freeze
   */
  async logFreeze(
    loanId: string,
    reason: string,
    user: User
  ): Promise<LoanEvent> {
    return await this.log(
      loanId,
      'LOAN_FROZEN',
      { reason },
      user,
      {
        description: `Đóng băng khoản vay: ${reason}`
      }
    );
  }

  /**
   * Log loan unfreeze
   */
  async logUnfreeze(
    loanId: string,
    reason: string,
    user: User
  ): Promise<LoanEvent> {
    return await this.log(
      loanId,
      'LOAN_UNFROZEN',
      { reason },
      user,
      {
        description: `Mở băng khoản vay: ${reason}`
      }
    );
  }

  /**
   * Get timeline for loan
   */
  async getTimeline(loanId: string, limit?: number): Promise<LoanEvent[]> {
    const events = await this.loadEvents();
    const loanEvents = events
      .filter(e => e.loan_id === loanId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return limit ? loanEvents.slice(0, limit) : loanEvents;
  }

  /**
   * Get events by filter
   */
  async getEvents(filter: EventFilter): Promise<LoanEvent[]> {
    let events = await this.loadEvents();

    // Apply filters
    if (filter.loan_id) {
      events = events.filter(e => e.loan_id === filter.loan_id);
    }

    if (filter.event_types && filter.event_types.length > 0) {
      events = events.filter(e => filter.event_types!.includes(e.event_type));
    }

    if (filter.created_by) {
      events = events.filter(e => e.created_by === filter.created_by);
    }

    if (filter.branch_id) {
      events = events.filter(e => e.branch_id === filter.branch_id);
    }

    if (filter.date_from) {
      events = events.filter(e => new Date(e.created_at) >= filter.date_from!);
    }

    if (filter.date_to) {
      events = events.filter(e => new Date(e.created_at) <= filter.date_to!);
    }

    if (filter.correlation_id) {
      events = events.filter(e => e.correlation_id === filter.correlation_id);
    }

    // Sort by date descending
    events.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Apply pagination
    const offset = filter.offset || 0;
    const limit = filter.limit || events.length;
    
    return events.slice(offset, offset + limit);
  }

  /**
   * Get event by ID
   */
  async getEvent(eventId: string): Promise<LoanEvent | null> {
    const events = await this.loadEvents();
    return events.find(e => e.id === eventId) || null;
  }

  /**
   * Get related events (by correlation_id)
   */
  async getRelatedEvents(correlationId: string): Promise<LoanEvent[]> {
    const events = await this.loadEvents();
    return events
      .filter(e => e.correlation_id === correlationId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  /**
   * Get statistics
   */
  async getStatistics(filter?: Partial<EventFilter>): Promise<EventStatistics> {
    const events = filter ? await this.getEvents(filter as EventFilter) : await this.loadEvents();

    const stats: EventStatistics = {
      total_events: events.length,
      events_by_type: {} as Record<LoanEventType, number>,
      events_by_user: {},
      events_by_date: [],
      most_active_loans: []
    };

    // Count by type
    for (const event of events) {
      stats.events_by_type[event.event_type] = 
        (stats.events_by_type[event.event_type] || 0) + 1;
    }

    // Count by user
    for (const event of events) {
      const userName = event.created_by_name || event.created_by;
      stats.events_by_user[userName] = (stats.events_by_user[userName] || 0) + 1;
    }

    // Count by date
    const dateMap = new Map<string, number>();
    for (const event of events) {
      const date = new Date(event.created_at).toISOString().split('T')[0];
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
    }
    stats.events_by_date = Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Most active loans
    const loanMap = new Map<string, number>();
    for (const event of events) {
      loanMap.set(event.loan_id, (loanMap.get(event.loan_id) || 0) + 1);
    }
    stats.most_active_loans = Array.from(loanMap.entries())
      .map(([loan_id, event_count]) => ({ loan_id, event_count }))
      .sort((a, b) => b.event_count - a.event_count)
      .slice(0, 10);

    return stats;
  }

  /**
   * Export events to JSON
   */
  async exportEvents(filter?: EventFilter): Promise<string> {
    const events = filter ? await this.getEvents(filter) : await this.loadEvents();
    return JSON.stringify(events, null, 2);
  }

  /**
   * Clear all events (for testing only)
   */
  async clearAllEvents(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Generate human-readable description
   */
  private generateDescription(eventType: LoanEventType, eventData: Record<string, any>): string {
    const descriptions: Record<LoanEventType, string> = {
      STATUS_CHANGED: `Trạng thái thay đổi từ ${eventData.from_status} sang ${eventData.to_status}`,
      STATUS_CHANGE_FAILED: `Thay đổi trạng thái thất bại: ${eventData.error}`,
      LOAN_CREATED: 'Tạo khoản vay mới',
      LOAN_UPDATED: 'Cập nhật thông tin khoản vay',
      LOAN_DELETED: 'Xóa khoản vay',
      APPROVAL_GRANTED: `Phê duyệt: ${eventData.approval_type}`,
      APPROVAL_REJECTED: `Từ chối phê duyệt: ${eventData.reason}`,
      REJECTION_RECORDED: `Từ chối khoản vay: ${eventData.reason}`,
      DOCUMENT_UPLOADED: `Tải lên tài liệu: ${eventData.file_name}`,
      DOCUMENT_VERIFIED: `Xác minh tài liệu: ${eventData.document_type}`,
      DOCUMENT_REJECTED: `Từ chối tài liệu: ${eventData.reason}`,
      DOCUMENT_DELETED: `Xóa tài liệu: ${eventData.file_name}`,
      ASSESSMENT_STARTED: 'Bắt đầu thẩm định',
      ASSESSMENT_COMPLETED: 'Hoàn thành thẩm định',
      ASSESSMENT_REPORT_CREATED: 'Tạo báo cáo thẩm định',
      SUPPLEMENT_REQUESTED: `Yêu cầu bổ sung: ${eventData.reason}`,
      SUPPLEMENT_PROVIDED: 'Cung cấp thông tin bổ sung',
      SECURITY_CHECK_STARTED: 'Bắt đầu kiểm tra an ninh',
      SECURITY_CHECK_PASSED: 'Kiểm tra an ninh thành công',
      SECURITY_CHECK_FAILED: `Kiểm tra an ninh thất bại: ${eventData.reason}`,
      FRAUD_DETECTED: `Phát hiện gian lận: ${eventData.indicators}`,
      BLACKLIST_CHECK: 'Kiểm tra danh sách đen',
      DEVICE_LOCK_REQUESTED: 'Yêu cầu khóa thiết bị',
      DEVICE_LOCKED: 'Đã khóa thiết bị',
      DEVICE_UNLOCK_REQUESTED: 'Yêu cầu mở khóa thiết bị',
      COLLATERAL_VERIFIED: 'Xác minh tài sản đảm bảo',
      COLLATERAL_REJECTED: `Từ chối tài sản: ${eventData.reason}`,
      CONTRACT_GENERATED: 'Tạo hợp đồng',
      CONTRACT_SENT: 'Gửi hợp đồng',
      CONTRACT_SIGNED: 'Ký hợp đồng',
      CONTRACT_REJECTED: `Từ chối hợp đồng: ${eventData.reason}`,
      CONTRACT_EXPIRED: 'Hợp đồng hết hạn',
      DISBURSEMENT_DRAFTED: `Soạn thảo giải ngân: ${eventData.amount?.toLocaleString('vi-VN')} VND`,
      DISBURSEMENT_APPROVED: 'Phê duyệt giải ngân',
      DISBURSEMENT_PROCESSING: 'Đang xử lý giải ngân',
      DISBURSEMENT_COMPLETED: 'Hoàn thành giải ngân',
      DISBURSEMENT_FAILED: `Giải ngân thất bại: ${eventData.error}`,
      PAYMENT_RECEIVED: `Nhận thanh toán: ${eventData.amount?.toLocaleString('vi-VN')} VND`,
      PAYMENT_SCHEDULED: `Lên lịch thanh toán kỳ ${eventData.installment_number}`,
      PAYMENT_OVERDUE: `Quá hạn thanh toán kỳ ${eventData.installment_number}`,
      PAYMENT_REMINDER_SENT: 'Gửi nhắc nhở thanh toán',
      COLLECTION_STARTED: 'Bắt đầu thu hồi nợ',
      COLLECTION_ACTION_TAKEN: `Hành động thu hồi: ${eventData.action}`,
      RESTRUCTURE_REQUESTED: 'Yêu cầu tái cấu trúc',
      RESTRUCTURE_APPROVED: 'Phê duyệt tái cấu trúc',
      WRITE_OFF_INITIATED: 'Khởi tạo xóa nợ',
      WRITE_OFF_COMPLETED: 'Hoàn thành xóa nợ',
      LOAN_FROZEN: `Đóng băng khoản vay: ${eventData.reason}`,
      LOAN_UNFROZEN: `Mở băng khoản vay: ${eventData.reason}`,
      LOAN_ASSIGNED: `Phân công cho ${eventData.assigned_to_name}`,
      LOAN_REASSIGNED: `Chuyển phân công từ ${eventData.from_user} sang ${eventData.to_user}`,
      VERSION_CREATED: `Tạo phiên bản ${eventData.version}: ${eventData.version_type}`,
      VERSION_RESTORED: `Khôi phục về phiên bản ${eventData.version}`,
      COMMISSION_CALCULATED: `Tính hoa hồng: ${eventData.amount?.toLocaleString('vi-VN')} VND`,
      COMMISSION_PAID: `Thanh toán hoa hồng: ${eventData.amount?.toLocaleString('vi-VN')} VND`,
      SYSTEM_ERROR: `Lỗi hệ thống: ${eventData.error}`,
      VALIDATION_ERROR: `Lỗi xác thực: ${eventData.error}`,
      PERMISSION_DENIED: `Từ chối quyền truy cập: ${eventData.action}`
    };

    return descriptions[eventType] || eventType;
  }

  /**
   * Save event to storage
   */
  private async saveEvent(event: LoanEvent): Promise<void> {
    const events = await this.loadEvents();
    events.push(event);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(events));
  }

  /**
   * Load all events from storage
   */
  private async loadEvents(): Promise<LoanEvent[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load events:', error);
      return [];
    }
  }

  /**
   * Get loan from storage
   */
  private async getLoan(loanId: string): Promise<LoanApplication | null> {
    const loans = await storageService.getLoans();
    return loans.find(l => l.id === loanId) || null;
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
}

// Singleton instance
export const eventLogger = new EventLogger();
