import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cart: any[] = [];

  constructor() {
    const saved = localStorage.getItem('cart');
    this.cart = saved ? JSON.parse(saved) : [];
  }

  getCart() {
    return this.cart;
  }

  addToCart(product: any) {
    const found = this.cart.find((p) => p._id === product._id);
    if (found) {
      found.quantity = (found.quantity || 1) + 1;
    } else {
      this.cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }

  clearCart() {
    this.cart = [];
    localStorage.removeItem('cart');
  }
}
