import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { LanguageState } from '../../state/language.state';
import { Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { LanguageRoutingService } from '../../language-routing.service';

@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, MatIconModule],
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.scss'],
})
export class CompareComponent implements OnInit, OnDestroy {
  items: any[] = [];
  bestIndex: number | null = null;
  comparisonTable: any[] = [];
  showWarning = false;
  private languageSubscription?: Subscription;

  constructor(
    private translate: TranslateService,
    private store: Store,
    private cdr: ChangeDetectorRef,
    private languageRouter: LanguageRoutingService
  ) {}

  ngOnInit() {
    const savedLang = localStorage.getItem('language') || 'ka';
    if (savedLang !== this.translate.currentLang) {
      this.translate.use(savedLang).subscribe(() => {
        this.cdr.detectChanges();
      });
    }

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

    const data = localStorage.getItem('compareList');
    this.items = data ? JSON.parse(data) : [];
  }

  ngOnDestroy() {
    this.languageSubscription?.unsubscribe();
  }

  removeProduct(index: number) {
    this.items.splice(index, 1);
    localStorage.setItem('compareList', JSON.stringify(this.items));
    if (this.items.length < 2) {
      this.comparisonTable = [];
      this.bestIndex = null;
      this.showWarning = true;
    }
  }
  resetCompare() {
    localStorage.removeItem('compareList');
    window.location.reload();
  }

  goToHome() {
    this.languageRouter.navigate(['home']);
  }

  checkBestProduct() {
    if (this.items.length < 2) {
      alert(this.translate.instant('COMPARE_MIN_2_PRODUCTS_REQUIRED'));
      return;
    }

    let best = this.items[0];
    let bestI = 0;

    this.items.forEach((p, i) => {
      const price = p.price?.current || p.price;
      const bestPrice = best.price?.current || best.price;

      if (p.rating > best.rating) {
        best = p;
        bestI = i;
      } else if (p.rating === best.rating) {
        if (price < bestPrice) {
          best = p;
          bestI = i;
        }
      }
    });

    this.bestIndex = bestI;
    this.comparisonTable = this.items.map((p, i) => ({
      id: p._id || p.id,
      title: p.title,
      price: p.price?.current || p.price,
      rating: p.rating,
      isBest: i === bestI,
    }));
  }

  goToProductDetail(productId: string) {
    if (!productId) {
      console.error('Product ID not found');
      return;
    }
    this.languageRouter.navigate(['product-detail', productId]);
  }
}
