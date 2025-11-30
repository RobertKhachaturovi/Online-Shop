import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { ToolsService } from '../../tools.service';
import { AuthModalComponent } from '../auth-modal/auth-modal.component';
import { CartStateService } from '../../cart-state.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { LanguageState } from '../../state/language.state';
import { LanguageRoutingService } from '../../language-routing.service';

@Component({
  selector: 'app-side-drawer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    TranslateModule,
  ],
  templateUrl: './side-drawer.component.html',
  styleUrls: ['./side-drawer.component.scss'],
})
export class SideDrawerComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  isDrawerOpen = false;
  showNavItems = false;
  isMobile = false;
  resizeListener: any;

  showCategories = false;
  showBrands = false;
  togglePriceFilter = false;
  showExtraSort = false;
  showExtraFilters = false;
  showRatingDropdown = false;

  brands: string[] = [];
  allBrands: string[] = [
    'asus',
    'samsung',
    'xiaomi',
    'apple',
    'honor',
    'oneplus',
    'lenovo',
    'hp',
    'acer',
    'dell',
    'msi',
    'lg',
  ];
  selectedBrand: string | null = null;
  selectedCategoryId: number | null = null;

  minPrice: number | null = null;
  maxPrice: number | null = null;
  onlyDiscounted = false;
  onlyInStock = false;
  minRating = 0;

  ratingOptions = [
    { value: 5, label: '5 Only' },
    { value: 4, label: '4 And up' },
    { value: 3, label: '3 And up' },
    { value: 2, label: '2 And up' },
    { value: 1, label: '1 And up' },
  ];

  private authSub?: Subscription;
  private languageSubscription?: Subscription;

  @Output() drawerToggled = new EventEmitter<boolean>();
  @Output() categorySelected = new EventEmitter<number | null>();
  @Output() brandSelected = new EventEmitter<string | null>();
  @Output() priceFilter = new EventEmitter<{
    min: number | null;
    max: number | null;
  }>();
  @Output() discountedFilter = new EventEmitter<boolean>();
  @Output() inStockFilter = new EventEmitter<boolean>();
  @Output() ratingFilter = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<'asc' | 'desc' | null>();

  constructor(
    private tools: ToolsService,
    private dialog: MatDialog,
    private cartState: CartStateService,
    private translate: TranslateService,
    private store: Store,
    private cdr: ChangeDetectorRef,
    public languageRouter: LanguageRoutingService
  ) {}

  ngOnInit() {
    this.isAuthenticated = !!sessionStorage.getItem('user');
    this.authSub = this.tools.authState$.subscribe((state) => {
      this.isAuthenticated = state;
    });

    this.tools.getBrands().subscribe((brands) => {
      this.brands = brands;
    });

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

    this.checkIsMobile(true);
    this.resizeListener = () => this.checkIsMobile();
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy() {
    this.authSub?.unsubscribe();
    this.languageSubscription?.unsubscribe();
    window.removeEventListener('resize', this.resizeListener);
  }

  checkIsMobile(forceEmit = false) {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 900;

    if (this.isMobile) {
      this.showNavItems = true;
      if (!this.isDrawerOpen || forceEmit || !wasMobile) {
        this.isDrawerOpen = true;
        this.drawerToggled.emit(true);
      }
    } else {
      if (wasMobile && this.isDrawerOpen) {
        this.isDrawerOpen = false;
        this.drawerToggled.emit(false);
      }
      if (!this.showNavItems) {
        this.showNavItems = true;
      }
    }
  }

  toggleFilter(
    filter:
      | 'categories'
      | 'brands'
      | 'price'
      | 'extraSort'
      | 'extraFilters'
      | 'rating'
  ) {
    this.showCategories = filter === 'categories';
    this.showBrands = filter === 'brands';
    this.togglePriceFilter = filter === 'price';
    this.showExtraSort = filter === 'extraSort';
    this.showExtraFilters = filter === 'extraFilters';
    this.showRatingDropdown = filter === 'rating';
  }
  onCategorySelect(categoryId: number | null) {
    this.selectedCategoryId = categoryId;
    this.categorySelected.emit(categoryId);

    if (categoryId === null) {
      this.brands = this.allBrands;
      this.selectedBrand = null;
    } else {
      this.tools.getProductsByCategory(categoryId, 1).subscribe((data: any) => {
        const brandsSet = new Set<string>(
          data.products.map((p: any) => p.brand)
        );
        this.brands = Array.from(brandsSet);
        this.selectedBrand = null;
      });
    }
  }

  onBrandSelect(brand: string | null) {
    this.selectedBrand = brand;
    this.brandSelected.emit(brand);
  }

  onPriceFilter() {
    this.priceFilter.emit({ min: this.minPrice, max: this.maxPrice });
  }

  onDiscountFilter() {
    this.discountedFilter.emit(this.onlyDiscounted);
  }

  onInStockFilter() {
    this.inStockFilter.emit(this.onlyInStock);
  }

  toggleRatingDropdown() {
    this.toggleFilter('rating');
  }

  selectRating(value: number) {
    this.minRating = value;
    this.ratingFilter.emit(value);
    this.showRatingDropdown = false;
  }

  openDrawer() {
    this.isDrawerOpen = true;
    this.drawerToggled.emit(this.isDrawerOpen);
  }

  closeDrawer() {
    if (this.isMobile) return;
    this.isDrawerOpen = false;
    this.drawerToggled.emit(this.isDrawerOpen);
  }

  toggleDrawer() {
    if (this.isMobile) {
      this.isDrawerOpen = true;
      this.drawerToggled.emit(true);
      return;
    }
    this.isDrawerOpen = !this.isDrawerOpen;
    this.drawerToggled.emit(this.isDrawerOpen);
  }

  toggleNavItems() {
    this.showNavItems = !this.showNavItems;
  }

  logout() {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('userEmail');
    this.tools.setAuthState(false);
    this.cartState.setCount(0);
    this.languageRouter.navigate(['home']);
  }

  goToCart() {
    this.languageRouter.navigate(['cart']);
  }

  openAuthModal() {
    const dialogRef = this.dialog.open(AuthModalComponent, {
      width: '400px',
      disableClose: false,
      data: { message: this.translate.instant('PLEASE_AUTHORIZE') },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true)
        console.log(this.translate.instant('AUTHORIZATION_SUCCESSFUL'));
    });
  }

  getRatingLabel(value: number): string {
    const labels: { [key: number]: string } = {
      5: this.translate.instant('RATING_5_ONLY'),
      4: this.translate.instant('RATING_4_AND_UP'),
      3: this.translate.instant('RATING_3_AND_UP'),
      2: this.translate.instant('RATING_2_AND_UP'),
      1: this.translate.instant('RATING_1_AND_UP'),
    };
    return labels[value] || '';
  }

  onSort(direction: 'asc' | 'desc' | null) {
    this.sortChange.emit(direction);
  }

  resetFilters() {
    this.selectedCategoryId = null;
    this.selectedBrand = null;
    this.minPrice = null;
    this.maxPrice = null;
    this.onlyDiscounted = false;
    this.onlyInStock = false;
    this.minRating = 0;

    this.showCategories = false;
    this.showBrands = false;
    this.togglePriceFilter = false;
    this.showExtraSort = false;
    this.showExtraFilters = false;
    this.showRatingDropdown = false;

    this.brands = this.allBrands;

    this.categorySelected.emit(null);
    this.brandSelected.emit(null);
    this.priceFilter.emit({ min: null, max: null });
    this.discountedFilter.emit(false);
    this.inStockFilter.emit(false);
    this.ratingFilter.emit(0);
    this.sortChange.emit(null);
  }
}
