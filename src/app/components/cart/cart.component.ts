import { Component, OnInit } from '@angular/core';
import { ToolsService } from '../../tools.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ReceiptModalComponent } from './receipt-modal.component';
import { Router } from '@angular/router';
import { PaymentModalComponent } from '../payment-modal/payment-modal.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  loading = false;
  error = false;
  cartTotal = 0;
  closeCheckoutAnimation() {
    console.log('Closing checkout animation');
    this.showCheckoutAnimation = false;
    this.confettiPieces = [];
  }
  imgLoadError = false;

  showCheckoutAnimation = false;
  showRemoveAnimation = false;
  showResetAnimation = false;
  confettiPieces: any[] = [];

  constructor(
    private toolsService: ToolsService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.loading = true;
    this.error = false;

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
            this.error = true;
            this.loading = false;
          },
        });
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  addToCart(product: any) {
    const productId = product._id || product.id || product.productId;
    const currentItem = this.cartItems.find(
      (item) => item.product?._id === productId
    );
    const newQty = (currentItem?.quantity || 0) + 1;

    if (currentItem) {
      currentItem.quantity = newQty;
    } else {
      this.cartItems.push({
        product: product,
        quantity: newQty,
        productId: productId,
      });
    }
    this.updateCartTotal();

    this.toolsService.addToCart(productId, newQty).subscribe({
      next: () => {
        console.log('Product added to cart successfully');
      },
      error: (error) => {
        if (currentItem) {
          currentItem.quantity = (currentItem.quantity || 1) - 1;
          if (currentItem.quantity <= 0) {
            this.cartItems = this.cartItems.filter(
              (item) => item !== currentItem
            );
          }
        } else {
          this.cartItems = this.cartItems.filter(
            (item) => item.productId !== productId
          );
        }
        this.updateCartTotal();
        console.error('Failed to add to cart:', error);
        alert('შეცდომა მოხდა კალათაში დამატებისას');
      },
    });
  }

  removeFromCart(product: any) {
    this.showRemoveAnimation = true;

    const productId = product._id || product.id || product.productId;
    this.cartItems = this.cartItems.filter(
      (item) =>
        (item.product?._id || item.product?.id || item.productId) !== productId
    );
    this.updateCartTotal();

    this.toolsService.removeFromCart(productId).subscribe({
      next: () => {
        setTimeout(() => {
          this.showRemoveAnimation = false;
          this.loadCart();
        }, 2000);
      },
      error: () => {
        this.showRemoveAnimation = false;
        this.loadCart();
      },
    });
  }

  updateCartQuantity(item: any, quantity: number) {
    if (quantity < 1) return;

    const oldQuantity = item.quantity;
    item.quantity = quantity;
    this.updateCartTotal();

    const productId = item.product?._id || item.productId;
    this.toolsService.addToCart(productId, quantity).subscribe({
      next: () => {
        console.log('Quantity updated successfully');
      },
      error: (error) => {
        item.quantity = oldQuantity;
        this.updateCartTotal();
        console.error('Failed to update quantity:', error);
        alert('შეცდომა მოხდა რაოდენობის განახლებისას');
      },
    });
  }

  resetCart() {
    this.showResetAnimation = true;

    this.cartItems = [];
    this.cartTotal = 0;

    this.toolsService.resetCart().subscribe({
      next: () => {
        setTimeout(() => {
          this.showResetAnimation = false;
          this.loadCart();
        }, 2000);
      },
      error: () => {
        this.showResetAnimation = false;
        this.loadCart();
      },
    });
  }

  checkoutCart() {
    this.openPaymentModal();
  }
  openPaymentModal() {
    const dialogRef = this.dialog.open(PaymentModalComponent, {
      width: '600px',
      disableClose: true,
    });

    dialogRef.componentInstance.totalAmount = this.cartTotal;
    dialogRef.componentInstance.cartItems = this.cartItems;

    dialogRef.afterClosed().subscribe((paymentData) => {
      if (paymentData) {
        this.processPaymentAndCheckout(paymentData);
      } else {
        console.log('Payment cancelled');
      }
    });
  }

  processPaymentAndCheckout(paymentData: any) {
    console.log('Payment Data:', paymentData);

    this.showCheckoutAnimation = true;
    this.createConfetti();

    const snapshotItems = this.cartItems.map((item) => ({ ...item }));
    const snapshotTotal = this.cartTotal;
    const snapshotReceiptNumber = 'INV-' + Date.now();
    const snapshotDate = new Date().toLocaleString('ka-GE');

    this.toolsService.checkoutCart().subscribe({
      next: () => {
        setTimeout(() => {
          this.showCheckoutAnimation = false;
          this.confettiPieces = [];
          this.openReceiptModal(
            snapshotItems,
            snapshotTotal,
            snapshotReceiptNumber,
            snapshotDate
          );
          this.cartItems = [];
          this.cartTotal = 0;
        }, 4000);
      },
      error: () => {
        this.showCheckoutAnimation = false;
        this.confettiPieces = [];
        alert('შეკვეთის გაგზავნისას მოხდა შეცდომა!');
      },
    });
  }

  openReceiptModal(
    items: any[] = this.cartItems,
    total: number = this.cartTotal,
    receiptNumber: string = 'INV-' + Date.now(),
    currentDate: string = new Date().toLocaleString('ka-GE')
  ) {
    this.saveReceiptToHistory(receiptNumber, currentDate, items, total);

    const receiptHtml = this.generateReceiptHtml(
      items,
      total,
      receiptNumber,
      currentDate
    );
    const dialogRef = this.dialog.open(ReceiptModalComponent, {
      width: '650px',
      data: { receiptHtml },
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe(() => {
      this.router.navigate(['/home']);
    });
  }

  generateReceiptHtml(
    items: any[] = this.cartItems,
    total: number = this.cartTotal,
    receiptNumber: string = 'INV-' + Date.now(),
    currentDate: string = new Date().toLocaleString('ka-GE')
  ): string {
    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="text-align:center; border-bottom:2px solid #007bff; padding-bottom:16px; margin-bottom:16px;">
          <h1 style="font-size:22px; color:#007bff; margin:0;">🛒 ონლაინ მაღაზია</h1>
          <div style="font-size:13px; color:#666;">ქვითარი #${receiptNumber}</div>
          <div style="font-size:13px; color:#666;">თარიღი: ${currentDate}</div>
        </div>
        <div>
          ${items
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
                item.product?.price?.current ??
                item.product?.price ??
                item.price?.current ??
                item.price ??
                0
              } ₾</div>
                </div>
              </div>
              <div style="font-weight:bold; color:#007ბff;">${(
                item.quantity *
                (item.product?.price?.current ??
                  item.product?.price ??
                  item.price?.current ??
                  item.price ??
                  0)
              ).toFixed(2)} ₾</div>
            </div>
          `
            )
            .join('')}
        </div>
        <div style="border-top:2pxsolid #007bff; padding-top:16px; margin-top:16px; text-align:right; font-size:16px; font-weight:bold;">
          სრული ჯამური ფასი: ${total.toFixed(2)} ₾
        </div>
        <div style="text-align:center; margin-top:24px; color:#666; font-size:12px;">
          <p>გმადლობთ შეკვეთისთვის! 🎉</p>
          <p>თქვენი შეკვეთა წარმატებით დაფიქსირდა</p>
          <p>ქვითარი #${receiptNumber}</p>
        </div>
      </div>
    `;
  }

  saveReceiptToHistory(
    receiptNumber: string,
    date: string,
    items: any[] = this.cartItems,
    total: number = this.cartTotal
  ) {
    const receiptData = {
      receiptNumber,
      date,
      items: items.map((item) => ({
        title: item.product?.title,
        quantity: item.quantity,
        price:
          item.product?.price?.current ??
          item.product?.price ??
          item.price?.current ??
          item.price ??
          0,
        image: item.product?.images?.[0],
        stock: item.product?.stock,
      })),
      total,
    };

    console.log('📝 saving receiptData =', receiptData);

    const existingReceipts = JSON.parse(
      localStorage.getItem('receiptHistory') || '[]'
    );
    existingReceipts.unshift(receiptData);
    const limitedReceipts = existingReceipts.slice(0, 50);

    localStorage.setItem('receiptHistory', JSON.stringify(limitedReceipts));
  }

  printReceipt() {
    const receiptHtml = this.generateReceiptHtml();
    const printWindow = window.open('', '_blank', 'width=600,height=800');
    if (!printWindow) {
      alert('გთხოვთ დაუშვათ პოპ-აპები');
      return;
    }
    printWindow.document.write(
      '<html><head><title>ქვითარი</title></head><body>' +
        receiptHtml +
        '</body></html>'
    );
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }

  createConfetti() {
    this.confettiPieces = [];
    for (let i = 0; i < 50; i++) {
      this.confettiPieces.push({
        id: i,
        left: Math.random() * 100,
        animationDelay: Math.random() * 3,
        color: [
          '#ff6b6b',
          '#4ecdc4',
          '#45b7d1',
          '#96ceb4',
          '#feca57',
          '#ff9ff3',
        ][Math.floor(Math.random() * 6)],
      });
    }
  }

  updateCartTotal() {
    this.cartTotal = this.cartItems.reduce((sum, item) => {
      const price =
        item.product?.price?.current ||
        item.product?.price ||
        item.price?.current ||
        item.price ||
        0;
      return sum + item.quantity * price;
    }, 0);
  }

  closeRemoveAnimation() {
    this.showRemoveAnimation = false;
  }

  closeResetAnimation() {
    this.showResetAnimation = false;
  }
}
