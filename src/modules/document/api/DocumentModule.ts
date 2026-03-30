/**
 * Document Module - Public API
 * Handles document templates and generation
 */

import { DocumentTemplate, Document, CreateTemplateDTO, UpdateTemplateDTO, GenerateDocumentDTO } from '@/types/document';

class DocumentModuleImpl {
  private templates: DocumentTemplate[] = [];
  private documents: Document[] = [];

  /**
   * Get all templates
   */
  async getTemplates(filter?: { type?: string; isActive?: boolean }): Promise<DocumentTemplate[]> {
    let filtered = [...this.templates];

    if (filter) {
      if (filter.type) {
        filtered = filtered.filter(t => t.type === filter.type);
      }
      if (filter.isActive !== undefined) {
        filtered = filtered.filter(t => t.isActive === filter.isActive);
      }
    }

    return filtered;
  }

  /**
   * Get template by ID
   */
  async getTemplate(id: string): Promise<DocumentTemplate | null> {
    return this.templates.find(t => t.id === id) || null;
  }

  /**
   * Create template
   */
  async createTemplate(data: CreateTemplateDTO, userId: string): Promise<DocumentTemplate> {
    const template: DocumentTemplate = {
      id: `tmpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId,
      updatedBy: userId
    };

    this.templates.push(template);
    return template;
  }

  /**
   * Update template
   */
  async updateTemplate(id: string, data: UpdateTemplateDTO, userId: string): Promise<DocumentTemplate> {
    const index = this.templates.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Template ${id} not found`);
    }

    // Increment version if content changed
    const versionIncrement = data.content ? 1 : 0;

    this.templates[index] = {
      ...this.templates[index],
      ...data,
      version: this.templates[index].version + versionIncrement,
      updatedAt: new Date(),
      updatedBy: userId
    };

    return this.templates[index];
  }

  /**
   * Delete template
   */
  async deleteTemplate(id: string): Promise<void> {
    const index = this.templates.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Template ${id} not found`);
    }

    this.templates.splice(index, 1);
  }

  /**
   * Generate document from template
   */
  async generateDocument(data: GenerateDocumentDTO, userId: string): Promise<Document> {
    const template = await this.getTemplate(data.templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Replace variables in template content
    let content = template.content;
    for (const [key, value] of Object.entries(data.variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, String(value));
    }

    const document: Document = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      templateId: template.id,
      templateName: template.name,
      entityType: data.entityType,
      entityId: data.entityId,
      content,
      variables: data.variables,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId,
      updatedBy: userId
    };

    this.documents.push(document);
    return document;
  }

  /**
   * Get documents
   */
  async getDocuments(filter?: {
    entityType?: string;
    entityId?: string;
    status?: string;
  }): Promise<Document[]> {
    let filtered = [...this.documents];

    if (filter) {
      if (filter.entityType) {
        filtered = filtered.filter(d => d.entityType === filter.entityType);
      }
      if (filter.entityId) {
        filtered = filtered.filter(d => d.entityId === filter.entityId);
      }
      if (filter.status) {
        filtered = filtered.filter(d => d.status === filter.status);
      }
    }

    return filtered;
  }

  /**
   * Get document by ID
   */
  async getDocument(id: string): Promise<Document | null> {
    return this.documents.find(d => d.id === id) || null;
  }

  /**
   * Update document status
   */
  async updateDocumentStatus(
    id: string,
    status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'signed',
    userId: string,
    notes?: string
  ): Promise<Document> {
    const index = this.documents.findIndex(d => d.id === id);
    if (index === -1) {
      throw new Error(`Document ${id} not found`);
    }

    this.documents[index] = {
      ...this.documents[index],
      status,
      updatedAt: new Date(),
      updatedBy: userId
    };

    if (status === 'approved') {
      this.documents[index].approvedAt = new Date();
      this.documents[index].approvedBy = userId;
    } else if (status === 'signed') {
      this.documents[index].signedAt = new Date();
      this.documents[index].signedBy = userId;
    }

    return this.documents[index];
  }

  /**
   * Sign document
   */
  async signDocument(id: string, userId: string, signature: string): Promise<Document> {
    const document = await this.updateDocumentStatus(id, 'signed', userId);
    
    // Store signature (in real app, this would be encrypted)
    this.documents[this.documents.findIndex(d => d.id === id)].signature = signature;
    
    return document;
  }

  /**
   * Get template variables
   */
  getTemplateVariables(templateId: string): string[] {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) return [];

    // Extract variables from template content ({{variable}})
    const regex = /{{(\w+)}}/g;
    const matches = template.content.matchAll(regex);
    return Array.from(matches, m => m[1]);
  }

  /**
   * Preview document
   */
  async previewDocument(templateId: string, variables: Record<string, any>): Promise<string> {
    const template = await this.getTemplate(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    let content = template.content;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, String(value));
    }

    return content;
  }
}

// Export singleton instance
export const documentModule = new DocumentModuleImpl();
export { DocumentModuleImpl as DocumentModule };
