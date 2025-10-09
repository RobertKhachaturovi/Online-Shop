import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToolsService } from '../../tools.service';
import { ReceiptModalComponent } from '../cart/receipt-modal.component';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-placing-order',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div
      class="checkout-animation-overlay"
      *ngIf="showCheckoutAnimation"
      (click)="closeCheckoutAnimation()"
    >
      <div
        class="checkout-animation-container"
        (click)="$event.stopPropagation()"
      >
        <div class="checkout-line"></div>
        <div class="checkout-photo">
          <img
            src="https://png.pngtree.com/png-vector/20250607/ourmid/pngtree-realistic-3d-shopping-cart-with-product-boxes-for-e-commerce-and-png-image_16486581.png"
            alt="Checkout Animation"
          />
        </div>
        <div class="checkout-text">
          <mat-icon>shopping_bag</mat-icon>
          <span>Order Placed!</span>
          <div class="subtitle">Your order has been successfully submitted</div>
        </div>
        <div class="checkout-confetti">
          <div
            class="confetti-piece"
            *ngFor="let piece of confettiPieces"
            [style.--color]="piece.color"
            [style.--left]="piece.left + '%'"
            [style.--delay]="piece.animationDelay + 's'"
          ></div>
        </div>
      </div>
    </div>

    <div *ngIf="cartItems && cartItems.length > 0">
      <div class="cart-container">
        <h2>Placing Order</h2>
        <ul>
          <li *ngFor="let item of cartItems" class="cart-item">
            <img
              [src]="item.product?.images?.[0] || 'https://via.placeholder.com/60x60?text=No+Image'"
              class="cart-img"
            />
            <div class="cart-model">
              <span class="cart-model-label">მოდელი:</span>
              <span class="cart-model-value">{{ item.product?.title }}</span>
            </div>
            <div class="cart-qty">რაოდენობა: {{ item.quantity }}</div>
            <div class="cart-qty">
              ერთეულის ფასი:
              {{ item.product?.price?.current || item.product?.price }} ₾
            </div>
            <div class="cart-total">
              ჯამური ფასი:
              {{
                item.quantity *
                  (item.product?.price?.current || item.product?.price)
                  | number : '1.0-0'
              }}
              ₾
            </div>
          </li>
        </ul>
        <div class="cart-summary">
          <span>სრული ჯამური ფასი:</span>
          <span class="cart-summary-total"
            >{{ cartTotal | number : '1.0-0' }} ₾</span
          >
        </div>
        <button
          class="checkout-btn"
          (click)="checkoutCart()"
          [disabled]="!cartItems.length"
        >
          Check Out
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      @import '../cart/cart.component.scss';
    `,
  ],
})
export class PlacingOrderComponent {
  loading = false;
  showCheckoutAnimation = false;
  confettiPieces: any[] = [];
  cartItems: any[] = [];
  cartTotal = 0;
  orderForm: FormGroup;
  showInvoiceModal = false;
  invoiceSubmitted = false;

  constructor(
    private toolsService: ToolsService,
    private dialog: MatDialog,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.loadCart();
    this.orderForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      idCode: ['', Validators.required],
      phone: ['', Validators.required],
      phone2: [''],
      city: ['', Validators.required],
      district: ['', Validators.required],
      address: ['', Validators.required],
      payment: ['', Validators.required],
    });
  }

  loadCart() {
    this.loading = true;
    this.toolsService.getCart().subscribe({
      next: (data: any) => {
        const items = data.products || data.cart || [];
        if (!items.length) {
          this.cartItems = [];
          this.cartTotal = 0;
          this.loading = false;
          return;
        }
        const requests = items.map((item: any) =>
          this.toolsService.getProductById(item.productId).pipe(
            map((product: any) => ({
              ...item,
              product,
            }))
          )
        );
        forkJoin(requests).subscribe({
          next: (fullItems) => {
            this.cartItems = fullItems as any[];
            this.cartTotal = this.cartItems.reduce((sum, item) => {
              const price =
                item.product?.price?.current ||
                item.product?.price ||
                item.price?.current ||
                item.price ||
                0;
              return sum + item.quantity * price;
            }, 0);
            this.loading = false;
          },
          error: () => {
            this.loading = false;
          },
        });
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  checkoutCart() {
    this.showCheckoutAnimation = true;
    this.createConfetti();
    const cartItemsCopy = [...this.cartItems];
    const cartTotalCopy = this.cartTotal;
    this.toolsService.checkoutCart().subscribe({
      next: () => {
        this.cartItems = [];
        this.cartTotal = 0;
        setTimeout(() => {
          this.showCheckoutAnimation = false;
          this.confettiPieces = [];
          this.cartItems = cartItemsCopy;
          this.cartTotal = cartTotalCopy;
          this.openReceiptModal();
          this.cartItems = [];
          this.cartTotal = 0;
        }, 4000);
      },
      error: () => {
        this.showCheckoutAnimation = false;
        this.confettiPieces = [];
        alert('შეცდომა შეკვეთის გაგზავნისას!');
      },
    });
  }

  openReceiptModal() {
    const receiptNumber = 'INV-' + Date.now();
    const currentDate = new Date().toLocaleString('ka-GE');
    const receiptHtml = this.generateReceiptHtml();
    const dialogRef = this.dialog.open(ReceiptModalComponent, {
      width: '650px',
      data: { receiptHtml },
      disableClose: false,
    });
    dialogRef.afterClosed().subscribe(() => {
      this.router.navigate(['/home']);
    });
  }

  generateReceiptHtml(): string {
    const currentDate = new Date().toLocaleString('ka-GE');
    const receiptNumber = 'INV-' + Date.now();
    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="text-align:center; border-bottom:2px solid #007bff; padding-bottom:16px; margin-bottom:16px;">
          <h1 style="font-size:22px; color:#007bff; margin:0;">🛒 ონლაინ მაღაზია</h1>
          <div style="font-size:13px; color:#666;">ქვითარი #${receiptNumber}</div>
          <div style="font-size:13px; color:#666;">თარიღი: ${currentDate}</div>
        </div>
        <div>
          ${this.cartItems
            .map(
              (item) => `
            <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #eee; padding:10px 0;">
              <div style="display:flex; align-items:center;">
                <img src="${
                  item.product?.images?.[0] ||
                  'https://via.placeholder.com/80x80?text=No+Image'
                }" style="width:80px; height:80px; object-fit:cover; border-radius:8px; margin-right:15px; border:2px solid #e0e0e0; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                <div>
                  <div style="font-weight:bold;">${item.product?.title}</div>
                  <div style="font-size:12px; color:#666;">რაოდენობა: ${
                    item.quantity
                  } | მარაგი: ${
                item.product?.stock || 'N/A'
              } | ერთეულის ფასი: ${
                item.product?.price?.current || item.product?.price
              } ₾</div>
                </div>
              </div>
              <div style="font-weight:bold; color:#007bff;">${(
                item.quantity *
                (item.product?.price?.current || item.product?.price)
              ).toFixed(2)}
            </div>
          `
            )
            .join('')}
        </div>
        <div style="border-top:2px solid #007bff; padding-top:16px; margin-top:16px; text-align:right; font-size:16px; font-weight:bold;">
          სრული ჯამური ფასი: ${this.cartTotal.toFixed(2)} ₾
        </div>
        <div style="text-align:center; margin-top:24px; color:#666; font-size:12px;">
          <p>გმადლობთ შეკვეთისთვის! 🎉</p>
          <p>თქვენი შეკვეთა წარმატებით დაფიქსირდა</p>
          <p>ქვითარი #${receiptNumber}</p>
        </div>
      </div>
    `;
  }

  createConfetti() {
    this.confettiPieces = Array.from({ length: 40 }, (_, i) => ({
      color: `hsl(${Math.random() * 360}, 80%, 60%)`,
      left: Math.random() * 100,
      animationDelay: Math.random() * 2,
    }));
  }

  closeCheckoutAnimation() {
    this.showCheckoutAnimation = false;
    this.confettiPieces = [];
  }

  openInvoiceModal() {
    this.invoiceSubmitted = true;
    if (this.orderForm.invalid) return;
    this.showInvoiceModal = true;
  }

  closeInvoiceModal() {
    this.showInvoiceModal = false;
  }

  confirmCheckout() {
    this.showInvoiceModal = false;
    this.checkoutCart();
  }
}
