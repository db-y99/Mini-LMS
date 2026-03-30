/**
 * Module Registry
 * Central export point for all modules
 * 
 * IMPORTANT: Other parts of the application should ONLY import from this file
 * Never import directly from module internals
 */

// ========== API MODULES (Business Logic) ==========

// Loan Module
export { loanModule, LoanModule } from './loan/api/LoanModule';

// Workflow Module
export { workflowModule, WorkflowModule } from './workflow/api/WorkflowModule';

// Event Module
export { eventModule, EventModule } from './event/api/EventModule';

// Versioning Module
export { versioningModule, VersioningModule } from './versioning/api/VersioningModule';

// Payment Module
export { paymentModule, PaymentModule } from './payment/api/PaymentModule';
export type { Payment, RepaymentSchedule } from './payment/api/PaymentModule';

// Branch Module
export { branchModule, BranchModule } from './branch/api/BranchModule';

// Product Module
export { productModule, ProductModule } from './product/api/ProductModule';

// Document Module
export { documentModule, DocumentModule } from './document/api/DocumentModule';

// ========== UI MODULES (Components) ==========

// Note: UI modules are imported directly in pages using '@modules/{module}/ui'
// Examples:
// - import { AdminDashboardView } from '@modules/admin/ui';
// - import { LoanListView } from '@modules/loans/ui';
// - import { CollectionDashboardView } from '@modules/collection/ui';
