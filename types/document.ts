/**
 * Document & Template Types
 */

export interface DocumentTemplate {
  id: string;
  name: string;
  code: string;
  type: 'contract' | 'agreement' | 'notice' | 'report' | 'letter' | 'other';
  description: string;
  content: string; // HTML or Markdown content with variables
  variables: string[]; // List of variable names used in template
  version: number;
  isActive: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface Document {
  id: string;
  templateId: string;
  templateName: string;
  
  // Entity reference
  entityType: 'loan' | 'customer' | 'branch' | 'user';
  entityId: string;
  
  // Content
  content: string; // Generated content
  variables: Record<string, any>; // Variables used for generation
  
  // Status
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'signed';
  
  // Approval
  approvedAt?: Date;
  approvedBy?: string;
  
  // Signature
  signedAt?: Date;
  signedBy?: string;
  signature?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface CreateTemplateDTO {
  name: string;
  code: string;
  type: 'contract' | 'agreement' | 'notice' | 'report' | 'letter' | 'other';
  description: string;
  content: string;
  variables: string[];
  isActive: boolean;
}

export interface UpdateTemplateDTO extends Partial<CreateTemplateDTO> {}

export interface GenerateDocumentDTO {
  templateId: string;
  entityType: 'loan' | 'customer' | 'branch' | 'user';
  entityId: string;
  variables: Record<string, any>;
}
