/**
 * Product Module - Public API
 * Handles loan product management
 */

import { LoanProduct, CreateLoanProductDTO, UpdateLoanProductDTO, LoanProductFilter } from '@/types/product';

class ProductModuleImpl {
  private products: LoanProduct[] = [];

  /**
   * Get all loan products
   */
  async getProducts(filter?: LoanProductFilter): Promise<LoanProduct[]> {
    let filtered = [...this.products];

    if (filter) {
      if (filter.isActive !== undefined) {
        filtered = filtered.filter(p => p.isActive === filter.isActive);
      }
      if (filter.isPublic !== undefined) {
        filtered = filtered.filter(p => p.isPublic === filter.isPublic);
      }
      if (filter.collateralRequired !== undefined) {
        filtered = filtered.filter(p => p.collateralRequired === filter.collateralRequired);
      }
      if (filter.search) {
        const search = filter.search.toLowerCase();
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(search) ||
          p.code.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search)
        );
      }
    }

    return filtered;
  }

  /**
   * Get product by ID
   */
  async getProduct(id: string): Promise<LoanProduct | null> {
    return this.products.find(p => p.id === id) || null;
  }

  /**
   * Get product by code
   */
  async getProductByCode(code: string): Promise<LoanProduct | null> {
    return this.products.find(p => p.code === code) || null;
  }

  /**
   * Create loan product
   */
  async createProduct(data: CreateLoanProductDTO, userId: string): Promise<LoanProduct> {
    const product: LoanProduct = {
      id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId,
      updatedBy: userId
    };

    this.products.push(product);
    return product;
  }

  /**
   * Update loan product
   */
  async updateProduct(id: string, data: UpdateLoanProductDTO, userId: string): Promise<LoanProduct> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Product ${id} not found`);
    }

    this.products[index] = {
      ...this.products[index],
      ...data,
      updatedAt: new Date(),
      updatedBy: userId
    };

    return this.products[index];
  }

  /**
   * Delete loan product
   */
  async deleteProduct(id: string): Promise<void> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Product ${id} not found`);
    }

    this.products.splice(index, 1);
  }

  /**
   * Activate/deactivate product
   */
  async toggleProductStatus(id: string, isActive: boolean, userId: string): Promise<LoanProduct> {
    return this.updateProduct(id, { isActive }, userId);
  }

  /**
   * Check if loan amount is valid for product
   */
  async validateLoanAmount(productId: string, amount: number): Promise<boolean> {
    const product = await this.getProduct(productId);
    if (!product) return false;

    return amount >= product.minAmount && amount <= product.maxAmount;
  }

  /**
   * Check if loan duration is valid for product
   */
  async validateLoanDuration(productId: string, duration: number): Promise<boolean> {
    const product = await this.getProduct(productId);
    if (!product) return false;

    return duration >= product.minDuration && duration <= product.maxDuration;
  }

  /**
   * Calculate interest for product
   */
  async calculateInterest(productId: string, amount: number, duration: number): Promise<number> {
    const product = await this.getProduct(productId);
    if (!product) throw new Error('Product not found');

    // Simple interest calculation
    const monthlyRate = product.interestRate / 12 / 100;
    return amount * monthlyRate * duration;
  }

  /**
   * Get product statistics
   */
  async getProductStats(productId: string): Promise<{
    totalLoans: number;
    totalAmount: number;
    averageAmount: number;
    averageDuration: number;
  }> {
    // TODO: Implement with actual loan data
    return {
      totalLoans: 0,
      totalAmount: 0,
      averageAmount: 0,
      averageDuration: 0
    };
  }
}

// Export singleton instance
export const productModule = new ProductModuleImpl();
export { ProductModuleImpl as ProductModule };
