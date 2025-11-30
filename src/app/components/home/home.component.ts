import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { CartStateService, normalizeCartItems } from '../../cart-state.service';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { ToolsService } from '../../tools.service';
import { MatDialog } from '@angular/material/dialog';
import { AuthModalComponent } from '../auth-modal/auth-modal.component';
import { SideDrawerComponent } from '../side-drawer/side-drawer.component';
import { ReceiptSearchComponent } from '../receipt-search/receipt-search.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../cart.service';
import { Observable, Subscription, filter, combineLatest } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Store, Select } from '@ngxs/store';
import { LanguageState, SetLanguage } from '../../state/language.state';
import { ChangeDetectorRef, ApplicationRef } from '@angular/core';
import { CurrencyExchangeComponent } from '../exchange/exchange.component';
import { CompareComponent } from '../compare/compare.component';
import { LanguageRoutingService } from '../../language-routing.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    SideDrawerComponent,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
    CurrencyExchangeComponent,
    CompareComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  public allProducts: any;
  public pageList: number[] = [];
  public selectedCategoryId: number | null = null;
  public searchString: string = '';
  public brands: string[] = [];
  public selectedBrand: string | null = null;
  public onlyDiscounted: boolean = false;
  public Math = Math;
  isLoading = true;
  public minRating: number = 0;
  public onlyInStock: boolean = false;
  public expandedCardId: string | null = null;
  public minPrice: number | null = null;
  public maxPrice: number | null = null;
  public showSuccessMap = new Map<string, boolean>();
  public randomQuote: any;
  public lastSearch: string = '';
  public priceSortDirection: 'asc' | 'desc' | null = null;
  public isDrawerOpen = false;
  public currentPage: number = 1;
  public itemsPerPage: number | 'ALL' = 9;
  public isClientSideFiltering: boolean = false;
  public allProductsForFiltering: any[] = [];
  public showSuggestions: boolean = false;
  favorites: any[] = [];
  public brandsWithImages: { name: string; image: string }[] = [];
  public showBrandPanel = false;
  public itemsPerPageOptions = [6, 9, 18, 36, 'ALL'];
  public showBest: boolean = false;
  public cartCount: number = 0;
  private authSubscription?: Subscription;
  private routerSubscription?: Subscription;
  private languageSubscription?: Subscription;
  @Select(LanguageState.getCurrentLanguage)
  currentLanguage$!: Observable<string>;
  get itemsPerPageNumber(): number {
    return this.itemsPerPage === 'ALL' ? 38 : this.itemsPerPage;
  }

  public showScrollUp = false;
  public showScrollDown = true;

  get bestProducts() {
    if (!Array.isArray(this.allProducts) || this.allProducts.length === 0) {
      return [];
    }
    const productsCopy = [...this.allProducts];
    productsCopy.sort((a, b) => {
      const ratingA = typeof a.rating === 'number' ? a.rating : -1;
      const ratingB = typeof b.rating === 'number' ? b.rating : -1;
      const fiveA = Math.round(ratingA) === 5 ? 1 : 0;
      const fiveB = Math.round(ratingB) === 5 ? 1 : 0;
      if (fiveB !== fiveA) return fiveB - fiveA;
      if (ratingB !== ratingA) return ratingB - ratingA;
      const priceA = this.getProductCurrentPrice(a);
      const priceB = this.getProductCurrentPrice(b);
      return priceB - priceA;
    });
    return productsCopy.slice(0, 9);
  }
  toggleBestProducts() {
    this.showBest = !this.showBest;
  }

  get remainingProducts() {
    if (!Array.isArray(this.allProducts) || this.allProducts.length === 0) {
      return [];
    }
    const bestProductIds = this.bestProducts.map((p) => p._id);
    return this.allProducts.filter((p) => !bestProductIds.includes(p._id));
  }

  private getProductCurrentPrice(item: any): number {
    if (!item) return 0;
    if (item.price && typeof item.price.current === 'number')
      return item.price.current;
    if (typeof item.price === 'number') return item.price;
    return 0;
  }

  constructor(
    private renderer: Renderer2,
    private tools: ToolsService,
    private dialog: MatDialog,
    private router: Router,
    private cartService: CartService,
    private cartState: CartStateService,
    private translate: TranslateService,
    private store: Store,
    private cdr: ChangeDetectorRef,
    private appRef: ApplicationRef,
    public languageRouter: LanguageRoutingService
  ) {
    this.allProduct(1);

    this.tools.getCart().subscribe((data: any) => {
      console.log(data);

      this.cartCount = data.products.length;
      console.log(this.cartCount);
    });
  }

  addToCompare(item: any) {
    let compareList = JSON.parse(localStorage.getItem('compareList') || '[]');

    if (!compareList.find((p: any) => p._id === item._id)) {
      compareList.push(item);
      localStorage.setItem('compareList', JSON.stringify(compareList));
    }

    this.languageRouter.navigate(['compare']);
  }

  ngOnInit() {
    console.log('=== HOME COMPONENT INITIALIZED ===');
    const savedLang = localStorage.getItem('language') || 'ka';
    if (savedLang !== this.translate.currentLang) {
      this.translate.use(savedLang).subscribe(() => {
        this.cdr.detectChanges();
      });
    }

    this.translate.onLangChange.subscribe((event) => {
      console.log('Language changed in home component:', event.lang);
      this.cdr.detectChanges();
    });

    this.languageSubscription = this.currentLanguage$.subscribe(
      (lang: string) => {
        if (lang) {
          console.log('Language changed from store:', lang);
          if (lang !== this.translate.currentLang) {
            this.translate.use(lang).subscribe(() => {
              this.cdr.detectChanges();
            });
          } else {
            this.cdr.detectChanges();
          }
        }
      }
    );

    this.tools.getBrands().subscribe((brands) => {
      this.brands = brands;
    });
    this.allProduct(1);
    this.tools.getAllProductPrices(1, 6).subscribe((prices) => {
      console.log(prices);
    });
    this.tools.getRandomQuote().subscribe((quote) => {
      console.log('QUOTE:', quote);
      this.randomQuote = quote;
    });
    this.loadFavorites();
    const lastSearch = localStorage.getItem('lastSearch');
    if (lastSearch) {
      this.lastSearch = lastSearch;
    }
    this.buildBrandsWithImages();
    this.syncCartCountFromServer();

    this.authSubscription = this.tools.authState$.subscribe(
      (isAuthenticated) => {
        if (!isAuthenticated) {
          this.cartState.setCount(0);
        } else {
          this.syncCartCountFromServer();
        }
      }
    );

    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.url === '/' || event.urlAfterRedirects === '/') {
          this.syncCartCountFromServer();
        }
      });
  }

  ngOnDestroy() {
    this.authSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
    this.languageSubscription?.unsubscribe();
  }

  allProduct(page: number) {
    this.isLoading = true;
    const pageSize = this.itemsPerPageNumber;

    this.tools.productsAll(page, pageSize).subscribe({
      next: (data: any) => {
        this.allProducts = data.products;
        this.setupPagination(data.total, data.limit);
      },
      error: (err) => {
        console.error(err);
      },
      complete: () => {
        setTimeout(() => {
          this.isLoading = false;
        }, 400);
      },
    });
  }

  showCategory(categoryId: number, page: number = 1) {
    const pageSize = this.itemsPerPageNumber;
    this.selectedCategoryId = categoryId;
    this.tools
      .getProductsByCategory(categoryId, page, pageSize)
      .subscribe((data: any) => {
        this.allProducts = data.products;
        this.setupPagination(data.total, data.limit);
        this.buildBrandsWithImages();
      });
  }

  setupPagination(total: number, limit: number) {
    let pageNum = Math.ceil(total / limit);
    this.pageList = [];
    for (let i = 1; i <= pageNum; i++) {
      this.pageList.push(i);
    }
  }

  updateClientSidePagination(totalItems: number) {
    const pageSize = this.itemsPerPageNumber;
    const totalPages = Math.ceil(totalItems / pageSize);
    this.pageList = [];
    for (let i = 1; i <= totalPages; i++) {
      this.pageList.push(i);
    }
    if (this.currentPage > totalPages) {
      this.currentPage = 1;
    }
    if (this.pageList.length === 0) {
      this.pageList = [1];
    }
  }
  onpageClick(pageIndex: number) {
    this.currentPage = pageIndex;
    this.showBest = false;
    if (this.selectedCategoryId !== null) {
      this.showCategory(this.selectedCategoryId, pageIndex);
    } else {
      this.allProduct(pageIndex);
    }
  }

  onCardAction(product: any) {
    const id = product._id;
    if (!id) {
      console.error('Product ID not found:', product);
      return;
    }
    console.log('Navigating to product detail:', id);
    this.showSuggestions = false;
    this.languageRouter.navigate(['product-detail', id]);
  }

  hideSuggestions() {
    this.showSuggestions = false;
  }

  onCategorySelected(categoryId: number | null) {
    this.selectedCategoryId = categoryId;
    if (categoryId === null) {
      this.allProduct(1);
    } else {
      this.showCategory(categoryId);
    }
  }

  get filteredProducts() {
    let products = this.allProducts;

    if (this.selectedBrand === 'iPhone') {
      products = products.filter((p: any) =>
        p.title?.toLowerCase().includes('iphone')
      );
    } else if (this.selectedBrand) {
      products = products.filter((p: any) => p.brand === this.selectedBrand);
    }

    if (this.searchString && this.searchString.trim().length > 0) {
      const search = this.searchString.toLowerCase();
      products = products.filter(
        (item: any) =>
          item.title?.toLowerCase().includes(search) ||
          item.description?.toLowerCase().includes(search) ||
          item.brand?.toLowerCase().includes(search)
      );
    }

    if (this.minPrice !== null || this.maxPrice !== null) {
      products = products.filter((item: any) => {
        const price = item.price?.current || item.price;
        const minPrice = this.minPrice || 0;
        const maxPrice = this.maxPrice || Infinity;
        return price >= minPrice && price <= maxPrice;
      });
    }

    if (this.onlyDiscounted) {
      products = products.filter(
        (item: any) =>
          item.price?.beforeDiscount &&
          item.price?.beforeDiscount > item.price?.current
      );
    }

    if (this.minRating > 0) {
      products = products.filter(
        (item: any) => item.rating && item.rating >= this.minRating
      );
    }

    if (this.onlyInStock) {
      products = products.filter((item: any) => item.stock > 0);
    }

    if (this.priceSortDirection) {
      const dir = this.priceSortDirection;
      products = [...products].sort((a: any, b: any) => {
        const priceA = a?.price?.current ?? a?.price ?? 0;
        const priceB = b?.price?.current ?? b?.price ?? 0;
        return dir === 'asc' ? priceA - priceB : priceB - priceA;
      });
    }
    return products;
  }

  get paginatedProducts() {
    const filtered = this.filteredProducts;
    if (!filtered) return [];

    const hasActiveFilters =
      this.searchString ||
      this.minPrice !== null ||
      this.maxPrice !== null ||
      this.onlyDiscounted ||
      this.minRating > 0 ||
      this.onlyInStock;

    const pageSize = this.itemsPerPageNumber;

    if (hasActiveFilters) {
      this.isClientSideFiltering = true;
      this.updateClientSidePagination(filtered.length);
      const startIndex = (this.currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      return filtered.slice(startIndex, endIndex);
    } else {
      this.isClientSideFiltering = false;
      return filtered;
    }
  }

  onSearch(value: string) {
    console.log('Home search:', value);
    this.searchString = value;
    localStorage.setItem('lastSearch', value);
    this.lastSearch = value;

    this.showSuggestions = !!(value && value.trim().length > 1);

    this.currentPage = 1;

    if (value && value.trim().length > 0) {
      const filtered = this.filteredProducts;
      if (filtered) {
        this.updateClientSidePagination(filtered.length);
      }
    } else {
      this.allProduct(1);
    }
  }

  onSearchInputFocus() {
    const lastSearch = localStorage.getItem('lastSearch');
    if (lastSearch) {
      this.searchString = lastSearch;
      this.lastSearch = lastSearch;
    }
  }

  onBrandSelect(brand: string | null) {
    this.selectedBrand = brand;
    if (!brand) {
      if (this.selectedCategoryId !== null) {
        this.showCategory(this.selectedCategoryId, 1);
      } else {
        this.allProduct(1);
      }
    } else {
      if (this.selectedCategoryId !== null) {
        this.loadProductsByCategoryAndBrand(this.selectedCategoryId, brand, 1);
      } else {
        const pageSize = this.itemsPerPageNumber;
        this.tools
          .getProductsByBrand(brand, 1, pageSize)
          .subscribe((data: any) => {
            this.allProducts = data.products;
            this.setupPagination(data.total, data.limit);
          });
      }
    }
  }

  loadProductsByCategoryAndBrand(
    categoryId: number,
    brand: string,
    page: number = 1
  ) {
    const pageSize = this.itemsPerPageNumber;
    this.tools
      .getProductsByCategory(categoryId, page, pageSize)
      .subscribe((data: any) => {
        this.allProducts = data.products.filter((p: any) => p.brand === brand);
        this.setupPagination(this.allProducts.length, data.limit);
        this.buildBrandsWithImages();
      });
  }
  getProductPrice(productId: number) {
    this.tools.getProductPriceById(productId).subscribe((price) => {
      console.log(price);
    });
  }

  onPriceFilter(event: { min: number | null; max: number | null }) {
    this.minPrice = event.min;
    this.maxPrice = event.max;
    this.currentPage = 1;
  }

  onDiscountedFilter(onlyDiscounted: boolean) {
    this.onlyDiscounted = onlyDiscounted;
    this.currentPage = 1;
  }

  onRatingFilter(minRating: number) {
    this.minRating = minRating;
    this.currentPage = 1;
  }

  onInStockFilter(onlyInStock: boolean) {
    this.onlyInStock = onlyInStock;
    this.currentPage = 1;
  }

  onSortChange(direction: 'asc' | 'desc' | null) {
    this.priceSortDirection = direction;
    this.currentPage = 1;
  }

  toggleExpand(cardId: string) {
    this.expandedCardId = this.expandedCardId === cardId ? null : cardId;
  }

  get filteredSuggestions() {
    if (
      !this.searchString ||
      !this.allProducts ||
      this.searchString.trim().length <= 1
    ) {
      return [];
    }

    const search = this.searchString.toLowerCase();
    return this.allProducts
      .filter(
        (item: any) =>
          (item.title && item.title.toLowerCase().includes(search)) ||
          (item.description &&
            item.description.toLowerCase().includes(search)) ||
          (item.brand && item.brand.toLowerCase().includes(search))
      )
      .slice(0, 5);
  }

  addToCart(item: any, event?: MouseEvent) {
    const isAuthenticated = !!sessionStorage.getItem('user');
    if (!isAuthenticated) {
      const dialogRef = this.dialog.open(AuthModalComponent, {
        width: '400px',
        disableClose: false,
        data: { message: 'კალათაში დასამატებლად გთხოვთ გაიაროთ ავტორიზაცია' },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result === true) {
          this.addToCartAfterAuth(item, event);
        }
      });
      return;
    }

    this.addToCartAfterAuth(item, event);
  }

  private addToCartAfterAuth(item: any, event?: MouseEvent) {
    const productId = item._id || item.id;

    this.tools.getCart().subscribe({
      next: (data: any) => {
        const items = normalizeCartItems(data);
        const existing = items.find(
          (i: any) =>
            i?.productId === productId ||
            i?.id === productId ||
            (i?.product &&
              (i.product._id === productId || i.product.id === productId))
        );
        const newQty = (existing?.quantity || 0) + 1;

        this.tools.addToCart(productId, newQty).subscribe({
          next: () => {
            this.showSuccessMap.set(productId, true);
            setTimeout(() => {
              this.showSuccessMap.set(productId, false);
            }, 3000);
            this.animateFlyToCart(event, item);
            this.cartCount++;
          },
          error: (err) => {
            if (err?.error?.errorKeys?.includes('errors.token_expired')) {
              alert(
                'სესიის ვადა ამოიწურა, გთხოვთ გაიაროთ ავტორიზაცია თავიდან!'
              );
              sessionStorage.removeItem('user');
              this.tools.setAuthState(false);
              return;
            }
            alert('მარაგი ამოიწურა');
            console.error('შეცდომა კალათაში დამატებისას:', err);
          },
        });
      },
      error: () => {
        this.tools.addToCart(productId, 1).subscribe({
          next: () => {
            this.showSuccessMap.set(productId, true);
            setTimeout(() => {
              this.showSuccessMap.set(productId, false);
            }, 3000);
            this.animateFlyToCart(event, item);
            this.cartState.increment(1);
          },
          error: (err) => {
            if (err?.error?.errorKeys?.includes('errors.token_expired')) {
              alert(
                'სესიის ვადა ამოიწურა, გთხოვთ გაიაროთ ავტორიზაცია თავიდან!'
              );
              sessionStorage.removeItem('user');
              this.tools.setAuthState(false);
              return;
            }
            alert('დაფიქსირდა შეცდომა კალათაში დამატებისას!');
            console.error('შეცდომა კალათაში დამატებისას:', err);
          },
        });
      },
    });
  }

  private animateFlyToCart(event: MouseEvent | undefined, item: any) {
    try {
      const sourceImg: HTMLImageElement | null =
        this.findProductImageElement(item);
      const cartAnchor = document.querySelector(
        '.floating-cart-btn'
      ) as HTMLElement | null;
      if (!sourceImg || !cartAnchor) return;

      const imgRect = sourceImg.getBoundingClientRect();
      const cartRect = cartAnchor.getBoundingClientRect();

      const clone = sourceImg.cloneNode(true) as HTMLImageElement;
      clone.style.position = 'fixed';
      clone.style.left = imgRect.left + 'px';
      clone.style.top = imgRect.top + 'px';
      clone.style.width = imgRect.width + 'px';
      clone.style.height = imgRect.height + 'px';
      clone.style.zIndex = '2000';
      clone.style.pointerEvents = 'none';
      clone.style.transition =
        'transform 1.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 1.2s ease, width 1.6s ease, height 1.6s ease';
      clone.style.borderRadius = '8px';
      document.body.appendChild(clone);

      const translateX =
        cartRect.left + cartRect.width / 2 - (imgRect.left + imgRect.width / 2);
      const translateY =
        cartRect.top + cartRect.height / 2 - (imgRect.top + imgRect.height / 2);

      requestAnimationFrame(() => {
        clone.style.transform = `translate(${translateX}px, ${translateY}px) scale(0.3)`;
        clone.style.opacity = '0.25';
        clone.style.width = Math.max(40, imgRect.width * 0.3) + 'px';
        clone.style.height = Math.max(40, imgRect.height * 0.3) + 'px';
      });

      const onArrive = () => {
        setTimeout(() => {
          clone.remove();
          cartAnchor.animate(
            [
              { transform: 'scale(1)' },
              { transform: 'scale(1.18)' },
              { transform: 'scale(1)' },
            ],
            { duration: 360, easing: 'ease-out' }
          );
        }, 120);
      };
      clone.addEventListener('transitionend', onArrive, { once: true });
    } catch {}
  }

  private findProductImageElement(item: any): HTMLImageElement | null {
    try {
      const productId = item._id || item.id;
      const candidates = Array.from(
        document.querySelectorAll('.modern-card')
      ) as HTMLElement[];
      for (const card of candidates) {
        const titleEl = card.querySelector('.product-title');
        if (
          titleEl &&
          titleEl.textContent &&
          item.title &&
          titleEl.textContent.trim() === String(item.title).trim()
        ) {
          const img = card.querySelector(
            'img.modern-card-img'
          ) as HTMLImageElement | null;
          if (img) return img;
        }
      }
      const anyImg = document.querySelector(
        'img.modern-card-img'
      ) as HTMLImageElement | null;
      return anyImg;
    } catch {
      return null;
    }
  }

  openReceiptSearch() {
    this.dialog.open(ReceiptSearchComponent, {
      width: '650px',
      disableClose: false,
    });
  }

  onDrawerToggled(open: boolean) {
    this.isDrawerOpen = open;
    if (open) {
      document.body.classList.add('drawer-open');
    } else {
      document.body.classList.remove('drawer-open');
    }
  }

  getUserEmail() {
    return sessionStorage.getItem('userEmail') || '';
  }

  loadFavorites() {
    const email = this.getUserEmail();
    if (!email) {
      this.favorites = [];
      return;
    }
    const favs = localStorage.getItem(`favorites_${email}`);
    this.favorites = favs ? JSON.parse(favs) : [];
  }

  private syncCartCountFromServer() {
    try {
      const isAuthenticated = !!sessionStorage.getItem('user');
      if (!isAuthenticated) {
        this.cartState.setCount(0);
        return;
      }

      this.tools.getCart().subscribe({
        next: (data: any) => {
          this.cartState.syncFromPayload(data);

          const items = normalizeCartItems(data);
          if (!items || items.length === 0) {
            localStorage.removeItem('cart');
            this.cartState.setCount(0);
          }
        },
        error: () => {
          try {
            const local = localStorage.getItem('cart');
            if (local) {
              const arr = JSON.parse(local);
              this.cartState.syncFromPayload(arr);
            } else {
              this.cartState.setCount(0);
            }
          } catch {
            this.cartState.setCount(0);
          }
        },
      });
    } catch {
      this.cartState.setCount(0);
    }
  }
  openExchangeModal() {
    this.dialog.open(CurrencyExchangeComponent, {
      width: '350px',
    });
  }
  isFavorite(product: any): boolean {
    return this.favorites.some((p) => p.id === (product._id || product.id));
  }

  toggleFavorite(product: any) {
    const email = this.getUserEmail();
    if (!email) {
      this.dialog.open(AuthModalComponent, {
        width: '400px',
        disableClose: false,
        data: {
          message: 'ფავორიტებში დასამატებლად გთხოვთ გაიაროთ ავტორიზაცია',
        },
      });
      return;
    }
    const id = product._id || product.id;
    if (this.isFavorite(product)) {
      this.favorites = this.favorites.filter((p) => p.id !== id);
    } else {
      this.favorites.push({
        id,
        title: product.title,
        image: product.images?.[0] || product.image || '',
        price: product.price?.current || product.price,
      });
    }
    localStorage.setItem(`favorites_${email}`, JSON.stringify(this.favorites));
  }
  clearFavoritesUI() {
    this.favorites = [];
  }

  goToFavorites() {
    this.languageRouter.navigate(['favorites']);
  }

  buildBrandsWithImages() {
    const brandMap = new Map<string, string>();
    for (const product of this.allProducts) {
      if (!brandMap.has(product.brand)) {
        brandMap.set(product.brand, product.images[0]);
      }
    }
    this.brandsWithImages = Array.from(brandMap.entries()).map(
      ([name, image]) => ({ name, image })
    );
    const appleIdx = this.brandsWithImages.findIndex((b) => b.name === 'Apple');
    if (appleIdx > -1) {
      const apple = this.brandsWithImages.splice(appleIdx, 1)[0];
      this.brandsWithImages.unshift(apple);
    }
  }

  selectBrand(brand: string | null) {
    this.selectedBrand = brand;
  }

  onItemsPerPageChange(newValue: number | 'ALL') {
    this.itemsPerPage = newValue;
    this.currentPage = 1;
    if (this.selectedCategoryId !== null) {
      this.showCategory(this.selectedCategoryId, 1);
    } else if (this.selectedBrand) {
      const pageSize = this.itemsPerPageNumber;
      this.tools
        .getProductsByBrand(this.selectedBrand, 1, pageSize)
        .subscribe((data: any) => {
          this.allProducts = data.products;
          this.setupPagination(data.total, data.limit);
          this.buildBrandsWithImages();
        });
    } else {
      this.allProduct(1);
    }
  }

  getImageForCard(item: any, index: number): string {
    if (!item.images || item.images.length === 0) {
      return '';
    }

    const imageIndex = index % item.images.length;
    return item.images[imageIndex];
  }

  buyNow(item: any) {
    const productId = item._id || item.id || item.productId;
    this.tools.addToCart(productId, 1).subscribe(() => {
      this.languageRouter.navigate(['placing-order']);
    });
  }
  public brandModelSuggestions: string[] = [];
}
