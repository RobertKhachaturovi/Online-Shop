import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LanguageRoutingService } from '../../language-routing.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-final-presentation',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './final-presentation.component.html',
  styleUrls: ['./final-presentation.component.scss'],
})
export class FinalPresentationComponent implements OnInit {
  purchasedItems: any[] = [];
  giftProduct: any = null;
  voiceMessage: string = '';
  total: number = 0;
  receiptNumber: string = '';
  date: string = '';
  showConfetti: boolean = false;
  confettiPieces: any[] = [];

  constructor(
    private router: Router,
    private languageRouter: LanguageRoutingService
  ) {}

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    console.log('Navigation object:', navigation);
    if (navigation?.extras?.state) {
      const state = navigation.extras.state as any;
      console.log('Router state:', state);
      this.purchasedItems = state.purchasedItems || [];
      this.giftProduct = state.giftProduct;
      this.voiceMessage = state.voiceMessage || '';
      this.total = state.total || 0;
      this.receiptNumber = state.receiptNumber || '';
      this.date = state.date || '';
      console.log('Loaded from router state:', {
        purchasedItems: this.purchasedItems,
        giftProduct: this.giftProduct,
        total: this.total,
      });
      this.calculateTotal();

      setTimeout(() => {
        this.showConfetti = true;
        this.createConfetti();
      }, 1000);
    } else {
      console.log('No router state found');
    }

    if (!this.purchasedItems.length || !this.giftProduct) {
      this.loadDataFromLocalStorage();
    }

    console.log('Final Presentation Data:', {
      purchasedItems: this.purchasedItems,
      giftProduct: this.giftProduct,
      voiceMessage: this.voiceMessage,
      total: this.total,
      receiptNumber: this.receiptNumber,
      date: this.date,
    });

    setTimeout(() => {
      this.showConfetti = true;
      this.createConfetti();
    }, 1000);
  }

  goHome() {
    for (const key of Object.keys(localStorage)) {
      if (
        key.startsWith('cart') ||
        key.startsWith('selectedGift') ||
        key.startsWith('purchased')
      ) {
        localStorage.removeItem(key);
      }
    }
    this.languageRouter.navigate(['home']);
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

  generateReceiptHtml(): string {
    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="text-align:center; border-bottom:2px solid #007bff; padding-bottom:16px; margin-bottom:16px;">
          <h1 style="font-size:22px; color:#007bff; margin:0;">🛒 ონლაინ მაღაზია</h1>
          <div style="font-size:13px; color:#666;">ქვითარი #${
            this.receiptNumber
          }</div>
          <div style="font-size:13px; color:#666;">თარიღი: ${this.date}</div>
        </div>
        <div>
          ${this.purchasedItems
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
                  } | ერთეულის ფასი: ${
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
        ${
          this.giftProduct
            ? `
          <div style="border-top:1px solid #eee; padding-top:16px; margin-top:16px;">
            <h3 style="color:#ff6b6b; text-align:center;">🎁 საჩუქარი</h3>
            <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #eee; padding:10px 0;">
              <div style="display:flex; align-items:center;">
                <img src="${this.giftProduct.avatar}" style="width:80px; height:80px; object-fit:cover; border-radius:8px; margin-right:15px; border:2px solid #ff6b6b; box-shadow:0 2px 8px rgba(255,107,107,0.3);">
                <div>
                  <div style="font-weight:bold;">${this.giftProduct.name}</div>
                  <div style="font-size:12px; color:#666;">შეტყობინება: "${this.voiceMessage}"</div>
                </div>
              </div>
              <div style="font-weight:bold; color:#ff6b6b;">უფასო</div>
            </div>
          </div>
        `
            : ''
        }
        <div style="border-top:2px solid #007bff; padding-top:16px; margin-top:16px; text-align:right; font-size:16px; font-weight:bold;">
          სრული ჯამური ფასი: ${this.total.toFixed(2)} ₾
        </div>
        <div style="text-align:center; margin-top:24px; color:#666; font-size:12px;">
          <p>გმადლობთ შეკვეთისთვის! 🎉</p>
          <p>თქვენი შეკვეთა წარმატებით დაფიქსირდა</p>
          <p>ქვითარი #${this.receiptNumber}</p>
        </div>
      </div>
    `;
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

  loadDataFromLocalStorage() {
    try {
      console.log('Loading data from localStorage...');
      console.log('All localStorage keys:', Object.keys(localStorage));

      const receiptHistory = JSON.parse(
        localStorage.getItem('receiptHistory') || '[]'
      );
      console.log('Receipt history:', receiptHistory);

      if (receiptHistory.length > 0) {
        const latestReceipt = receiptHistory[0];
        this.purchasedItems = (latestReceipt.items || []).map((item: any) => ({
          product: {
            title: item.title,
            images: [item.image],
            price: { current: item.price },
            stock: item.stock,
          },
          quantity: item.quantity,
        }));
        console.log('Converted purchasedItems:', this.purchasedItems);
        this.total = latestReceipt.total || 0;
        this.receiptNumber = latestReceipt.receiptNumber || '';
        this.date = latestReceipt.date || '';
        console.log('Loaded from receipt history:', latestReceipt);
        console.log('Converted purchasedItems:', this.purchasedItems);
      }
      if (!this.purchasedItems.length) {
        const cartRaw = localStorage.getItem('cart');
        if (cartRaw) {
          try {
            const cart = JSON.parse(cartRaw);
            if (Array.isArray(cart) && cart.length > 0) {
              this.purchasedItems = cart.map((item: any) => ({
                product: {
                  title: item.title || item.product?.title || item.name,
                  images:
                    item.images ||
                    (item.image ? [item.image] : item.product?.images) ||
                    [],
                  price: {
                    current:
                      item.price?.current ??
                      item.price ??
                      item.product?.price?.current ??
                      item.product?.price ??
                      0,
                  },
                  stock: item.stock ?? item.product?.stock,
                },
                quantity: item.quantity || 1,
              }));
              this.calculateTotal();
              if (!this.date) {
                this.date = new Date().toLocaleString('ka-GE');
              }
            }
          } catch (e) {
            console.warn('Failed to parse cart from localStorage', e);
          }
        }
      }

      const giftData = localStorage.getItem('selectedGift');
      console.log('Gift data from localStorage:', giftData);

      if (giftData) {
        const parsedGift = JSON.parse(giftData);
        this.giftProduct = parsedGift.product;
        this.voiceMessage = parsedGift.message || '';
        console.log('Loaded gift data:', parsedGift);
      }

      if (!this.purchasedItems.length && !this.giftProduct) {
        console.log('No data found in localStorage, using test data');
        this.loadTestData();
      } else {
        console.log('Data loaded from localStorage successfully');
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }
  calculateTotal() {
    this.total = this.purchasedItems.reduce((sum, item) => {
      const price =
        item.product?.price?.current ??
        item.product?.price ??
        item.price?.current ??
        item.price ??
        0;
      return sum + price * (item.quantity || 0);
    }, 0);
  }

  loadTestData() {
    this.purchasedItems = [
      {
        product: {
          title: 'ტესტ პროდუქტი',
          images: ['https://via.placeholder.com/100x100?text=Test+Product'],
          price: { current: 25.99 },
          stock: 10,
        },
        quantity: 2,
      },
    ];
    this.total = 51.98;
    this.receiptNumber = 'TEST-' + Date.now();
    this.date = new Date().toLocaleString('ka-GE');

    this.giftProduct = {
      name: 'ტესტ სათამაშო',
      avatar: 'https://via.placeholder.com/100x100?text=Test+Toy',
    };
    this.voiceMessage = 'ტესტ შეტყობინება';

    console.log('Loaded test data:', {
      purchasedItems: this.purchasedItems,
      giftProduct: this.giftProduct,
      total: this.total,
    });
  }
}
