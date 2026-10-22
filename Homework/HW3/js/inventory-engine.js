export class InventoryEngine {
  constructor(initialStock) {
    this.stock = initialStock;
    this.isLocked = false;
    this.lockTimeoutId = null;
  }

  reserveItem() {
    if (this.stock <= 0 || this.isLocked) {
      return { success: false, message: 'Out of stock or locked' };
    }

    this.isLocked = true;
    
    this.lockTimeoutId = setTimeout(() => {
      this.isLocked = false;
      this.lockTimeoutId = null;
    }, 15000);

    return { success: true, message: 'Locked successfully' };
  }

  checkout() {
    if (this.isLocked && this.stock > 0) {
      this.stock -= 1;
      this.isLocked = false;
      
      if (this.lockTimeoutId) {
        clearTimeout(this.lockTimeoutId);
        this.lockTimeoutId = null;
      }

      return { success: true, remainingStock: this.stock };
    }
    
    return { success: false, message: 'Checkout failed: Item not locked or out of stock' };
  }

  cancelLock() {
    this.isLocked = false;
    if (this.lockTimeoutId) {
      clearTimeout(this.lockTimeoutId);
      this.lockTimeoutId = null;
    }
  }
}