/**
 * Base Entity
 * All domain entities should extend this
 */

export abstract class Entity {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(id: string) {
    this.id = id;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Update the entity's timestamp
   */
  protected touch(): void {
    this.updatedAt = new Date();
  }

  /**
   * Check if entity is equal to another
   */
  equals(other: Entity): boolean {
    return this.id === other.id;
  }
}
