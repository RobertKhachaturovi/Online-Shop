import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ToolsService } from '../../tools.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ReceiptModalComponent } from './receipt-modal.component';
import { PaymentModalComponent } from '../payment-modal/payment-modal.component';
import { GiftDialogComponent } from '../gift-dialog/gift-dialog.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { LanguageState } from '../../state/language.state';
import { LanguageRoutingService } from '../../language-routing.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslateModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit, OnDestroy {
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
  private languageSubscription?: Subscription;

  constructor(
    private toolsService: ToolsService,
    private dialog: MatDialog,
    private translate: TranslateService,
    private store: Store,
    private cdr: ChangeDetectorRef,
    private languageRouter: LanguageRoutingService
  ) {}

  ngOnInit() {
    this.translate.onLangChange.subscribe(() => {
      this.cdr.detectChanges();
    });
    this.languageSubscription = this.store
      .select(LanguageState.getCurrentLanguage)
      .subscribe((lang: string) => {
        if (lang && lang !== this.translate.currentLang) {
          this.translate.use(lang).subscribe(() => {
            this.cdr.detectChanges();
          });
        }
      });

    this.loadCart();
  }

  ngOnDestroy() {
    this.languageSubscription?.unsubscribe();
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
          localStorage.removeItem('cart');
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
            this.persistCartToLocalStorage();
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
        alert(this.translate.instant('ERROR_ADDING_TO_CART'));
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
        alert(this.translate.instant('ERROR_UPDATING_QUANTITY'));
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
    const decrementedSnapshotItems = snapshotItems.map((item: any) => {
      const currentStock = item.product?.stock ?? 0;
      const newStock = Math.max(0, currentStock - (item.quantity ?? 0));
      return {
        ...item,
        product: {
          ...item.product,
          stock: newStock,
        },
      };
    });
    const snapshotTotal = this.cartTotal;
    const snapshotReceiptNumber = 'INV-' + Date.now();
    const snapshotDate = new Date().toLocaleString('ka-GE');

    this.toolsService.checkoutCart().subscribe({
      next: () => {
        setTimeout(() => {
          this.showCheckoutAnimation = false;
          this.confettiPieces = [];
          this.openGiftDialog(
            decrementedSnapshotItems,
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
        alert(this.translate.instant('ERROR_CHECKOUT'));
      },
    });
  }

  openGiftDialog(
    items: any[] = this.cartItems,
    total: number = this.cartTotal,
    receiptNumber: string = 'INV-' + Date.now(),
    currentDate: string = new Date().toLocaleString('ka-GE')
  ) {
    this.saveReceiptToHistory(receiptNumber, currentDate, items, total);

    const dialogRef = this.dialog.open(GiftDialogComponent, {
      width: '500px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((giftChoice) => {
      if (giftChoice === 'yes') {
        this.languageRouter.navigate(['surprise-toys'], {
          state: {
            purchasedItems: items,
            total,
            receiptNumber,
            date: currentDate,
          },
        });
      } else {
        this.navigateToFinalPresentation(
          items,
          total,
          receiptNumber,
          currentDate
        );
      }
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
      this.languageRouter.navigate(['home']);
    });
  }

  generateReceiptHtml(
    items: any[] = this.cartItems,
    total: number = this.cartTotal,
    receiptNumber: string = 'INV-' + Date.now(),
    currentDate: string = new Date().toLocaleString('ka-GE')
  ): string {
    const onlineShop = this.translate.instant('ONLINE_SHOP');
    const receiptNum = this.translate.instant('RECEIPT_NUMBER');
    const dateLabel = this.translate.instant('DATE');
    const quantityLabel = this.translate.instant('QUANTITY');
    const stockLabel = this.translate.instant('STOCK');
    const unitPriceLabel = this.translate.instant('UNIT_PRICE');
    const fullTotalPrice = this.translate.instant('FULL_TOTAL_PRICE');
    const thankYou = this.translate.instant('THANK_YOU_ORDER');
    const orderRecorded = this.translate.instant('ORDER_SUCCESSFULLY_RECORDED');

    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="text-align:center; border-bottom:2px solid #007bff; padding-bottom:16px; margin-bottom:16px;">
          <h1 style="font-size:22px; color:#007bff; margin:0;">${onlineShop}</h1>
          <div style="font-size:13px; color:#666;">${receiptNum}${receiptNumber}</div>
          <div style="font-size:13px; color:#666;">${dateLabel} ${currentDate}</div>
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
                  <div style="font-size:12px; color:#666;">${quantityLabel} ${
                item.quantity
              } | ${stockLabel} ${
                item.product?.stock || 'N/A'
              } | ${unitPriceLabel} ${
                item.product?.price?.current ??
                item.product?.price ??
                item.price?.current ??
                item.price ??
                0
              } ₾</div>
                </div>
              </div>
              <div style="font-weight:bold; color:#007bff;">${(
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
        <div style="border-top:2px solid #007bff; padding-top:16px; margin-top:16px; text-align:right; font-size:16px; font-weight:bold;">
          ${fullTotalPrice} ${total.toFixed(2)} ₾
        </div>
        <div style="text-align:center; margin-top:24px; color:#666; font-size:12px;">
          <p>${thankYou}</p>
          <p>${orderRecorded}</p>
          <p>${receiptNum}${receiptNumber}</p>
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
      alert(this.translate.instant('ALLOW_POPUPS'));
      return;
    }
    const receiptTitle = this.translate.instant('RECEIPT');
    printWindow.document.write(
      '<html><head><title>' +
        receiptTitle +
        '</title></head><body>' +
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
    this.persistCartToLocalStorage();
  }

  closeRemoveAnimation() {
    this.showRemoveAnimation = false;
  }

  closeResetAnimation() {
    this.showResetAnimation = false;
  }

  private persistCartToLocalStorage() {
    try {
      if (!this.cartItems || this.cartItems.length === 0) {
        localStorage.removeItem('cart');
        return;
      }
      const simplified = this.cartItems.map((item: any) => ({
        title: item.product?.title,
        quantity: item.quantity,
        price:
          item.product?.price?.current ??
          item.product?.price ??
          item.price?.current ??
          item.price ??
          0,
        image: item.product?.images?.[0] || null,
        stock: item.product?.stock ?? null,
      }));
      localStorage.setItem('cart', JSON.stringify(simplified));
    } catch (e) {
      console.warn('Failed to persist cart to localStorage', e);
    }
  }

  private navigateToFinalPresentation(
    items: any[],
    total: number,
    receiptNumber: string,
    date: string
  ) {
    this.languageRouter.navigate(['final-presentation'], {
      state: {
        purchasedItems: items,
        total,
        receiptNumber,
        date,
      },
    });
  }
}
