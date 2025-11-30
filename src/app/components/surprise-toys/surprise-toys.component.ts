import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageRoutingService } from '../../language-routing.service';

interface Product {
  id: string;
  name: string;
  avatar: string;
}

@Component({
  selector: 'app-surprise-toys',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './surprise-toys.component.html',
  styleUrls: ['./surprise-toys.component.scss'],
})
export class SurpriseToysComponent implements OnInit {
  products: Product[] = [];
  visibleProducts: Product[] = [];
  selectedProduct: Product | null = null;
  voiceText: string = '';
  isRecording: boolean = false;
  recognition: any;
  selectedLang: string = 'ka-GE';

  purchasedItems: any[] = [];
  total: number = 0;
  receiptNumber: string = '';
  date: string = '';
  isWrappingComplete: boolean = false;

  private itemsPerPage = 10;
  private currentPage = 1;

  constructor(
    private router: Router,
    private languageRouter: LanguageRoutingService
  ) {}

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const state = navigation.extras.state as any;
      this.purchasedItems = state.purchasedItems || [];
      this.total = state.total || 0;
      this.receiptNumber = state.receiptNumber || '';
      this.date = state.date || '';
    }

    fetch('https://681a64511ac115563508e4a5.mockapi.io/products/toys')
      .then((res) => res.json())
      .then((data) => {
        this.products = data;
        this.updateVisibleProducts();
      })
      .catch((err) => console.error(err));

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.interimResults = false;
      this.recognition.continuous = false;

      this.recognition.onresult = (event: any) => {
        this.voiceText = event.results[0][0].transcript;
      };

      this.recognition.onerror = (event: any) => {
        console.error('Recognition error:', event.error);
        this.isRecording = false;
      };

      this.recognition.onend = () => {
        this.isRecording = false;
      };
    } else {
      alert('არ მუშაობს');
    }
  }

  private updateVisibleProducts() {
    const end = this.itemsPerPage * this.currentPage;
    this.visibleProducts = this.products.slice(0, end);
  }

  showMore() {
    this.currentPage++;
    this.updateVisibleProducts();
  }

  selectProduct(product: Product) {
    this.selectedProduct = product;
    this.voiceText = '';
  }

  startRecording() {
    if (!this.recognition) return;
    this.voiceText = '';
    this.isRecording = true;
    this.recognition.lang = this.selectedLang;
    this.recognition.start();
  }

  stopRecording() {
    if (!this.recognition) return;
    this.recognition.stop();
    this.isRecording = false;
  }

  resetSelection() {
    this.selectedProduct = null;
    this.voiceText = '';
  }

  wrapGift() {
    if (!this.selectedProduct || !this.voiceText) {
      alert('გთხოვთ აირჩიოთ სათამაშო და ჩაწეროთ ხმოვანი შეტყობინება');
      return;
    }

    const giftData = {
      product: this.selectedProduct,
      message: this.voiceText,
    };
    localStorage.setItem('selectedGift', JSON.stringify(giftData));

    this.isWrappingComplete = true;

    setTimeout(() => {
      this.showFinalPresentation();
    }, 3000);
  }

  showFinalPresentation() {
    this.languageRouter.navigate(['final-presentation'], {
      state: {
        purchasedItems: this.purchasedItems,
        giftProduct: this.selectedProduct,
        voiceMessage: this.voiceText,
        total: this.total,
        receiptNumber: this.receiptNumber,
        date: this.date,
      },
    });
  }
}
