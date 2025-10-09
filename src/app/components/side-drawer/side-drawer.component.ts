import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { ToolsService } from '../../tools.service';
import { AuthModalComponent } from '../auth-modal/auth-modal.component';

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
  ],
  templateUrl: './side-drawer.component.html',
  styleUrl: './side-drawer.component.scss',
})
export class SideDrawerComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  showCategories = false;
  showBrands = false;
  togglePriceFilter = false;
  showExtraSort = false;
  brands: string[] = [];
  selectedBrand: string | null = null;
  selectedCategoryId: number | null = null;
  private authSub?: Subscription;

  minPrice: number | null = null;
  maxPrice: number | null = null;

  onlyDiscounted = false;
  onlyInStock = false;
  minRating: number = 0;
  showRatingDropdown = false;
  showExtraFilters = false;

  isDrawerOpen = false;
  showNavItems = false;
  isMobile = false;
  resizeListener: any;
  @Output() drawerToggled = new EventEmitter<boolean>();

  @Output() categorySelected = new EventEmitter<number | null>();
  @Output() brandSelected = new EventEmitter<string | null>();
  @Output() priceFilter = new EventEmitter<{
    min: number | null;
    max: number | null;
  }>();
  @Output() discountedFilter = new EventEmitter<boolean>();
  @Output() ratingFilter = new EventEmitter<number>();
  @Output() inStockFilter = new EventEmitter<boolean>();
  @Output() sortChange = new EventEmitter<'asc' | 'desc' | null>();

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

  ratingOptions = [
    { value: 5, label: '5 Only' },
    { value: 4, label: '4 And up' },
    { value: 3, label: '3 And up' },
    { value: 2, label: '2 And up' },
    { value: 1, label: '1 And up' },
  ];

  constructor(
    private tools: ToolsService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.isAuthenticated = !!sessionStorage.getItem('user');
    this.authSub = this.tools.authState$.subscribe((state) => {
      this.isAuthenticated = state;
    });
    this.tools.getBrands().subscribe((brands) => {
      this.brands = brands;
    });
    this.checkIsMobile();
    this.resizeListener = () => this.checkIsMobile();
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy() {
    this.authSub?.unsubscribe();
    window.removeEventListener('resize', this.resizeListener);
  }

  checkIsMobile() {
    this.isMobile = window.innerWidth < 900;
    if (!this.isMobile) {
      this.showNavItems = true;
    }
  }

  toggleCategoryList() {
    this.showCategories = !this.showCategories;
  }

  onCategorySelect(categoryId: number | null) {
    this.selectedCategoryId = categoryId;
    this.categorySelected.emit(categoryId);

    if (categoryId === null) {
      this.brands = this.allBrands;
      this.selectedBrand = null;
    } else {
      this.tools.getProductsByCategory(categoryId, 1).subscribe((data: any) => {
        const brandsSet = new Set(data.products.map((p: any) => p.brand));
        this.brands = Array.from(brandsSet) as string[];
        this.selectedBrand = null;
      });
    }
  }

  onBrandSelect(brand: string | null) {
    this.selectedBrand = brand;
    this.brandSelected.emit(brand);
  }

  logout() {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('userEmail');
    this.tools.setAuthState(false);
    this.router.navigate(['/']);
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
    this.showRatingDropdown = !this.showRatingDropdown;
  }

  selectRating(value: number) {
    this.minRating = value;
    this.ratingFilter.emit(value);
    this.showRatingDropdown = false;
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  openAuthModal() {
    const dialogRef = this.dialog.open(AuthModalComponent, {
      width: '400px',
      disableClose: false,
      data: { message: 'გთხოვთ გაიაროთ ავტორიზაცია' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        console.log('ავტორიზაცია წარმატებულია');
      }
    });
  }

  openDrawer() {
    this.isDrawerOpen = true;
    this.drawerToggled.emit(this.isDrawerOpen);
  }

  closeDrawer() {
    this.isDrawerOpen = false;
    this.drawerToggled.emit(this.isDrawerOpen);
  }

  toggleDrawer() {
    this.isDrawerOpen = !this.isDrawerOpen;
    this.drawerToggled.emit(this.isDrawerOpen);
  }

  toggleNavItems() {
    this.showNavItems = !this.showNavItems;
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
    this.showRatingDropdown = false;
    this.showExtraFilters = false;

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
