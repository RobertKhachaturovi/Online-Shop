import {
  Component,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ToolsService } from '../../tools.service';
import { Subscription } from 'rxjs';
import { SigninComponent } from '../signin/signin.component';
import { SignupComponent } from '../signup/signup.component';
import { CartStateService } from '../../cart-state.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="header-content">
      <div class="header-logo">
        <img
          class="logo-img"
          src="https://www.codester.com/static/uploads/items/000/035/35801/preview/003.jpg"
          alt="TechnoZone Logo"
        />
        <span
          class="technozone-text"
          (click)="goToHomeAndRefresh()"
          [class.loading]="isLoading"
        >
          {{ isLoading ? 'TechnoZone...' : 'TechnoZone' }}
        </span>
        <div class="header-loader" *ngIf="isLoading"></div>
      </div>

      <div class="header-actions">
        <div *ngIf="!isLoggedIn" class="auth-buttons">
          <button class="header-btn signin-btn" (click)="openSignInModal()">
            <span class="material-icons">login</span> Log In
          </button>
          <button class="header-btn signup-btn" (click)="openSignUpModal()">
            <span class="material-icons">person_add</span> Sign Up
          </button>
        </div>

        <div *ngIf="isLoggedIn" class="user-actions">
          <button class="header-btn profile-btn" (click)="goToProfile()">
            <span class="material-icons">account_circle</span> Profile
          </button>
          <button class="header-btn logout-btn" (click)="logout()">
            <span class="material-icons">logout</span> Log Out
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() search = new EventEmitter<string>();
  searchString: string = '';
  isLoading: boolean = false;
  isLoggedIn: boolean = false;
  private authSubscription: Subscription = new Subscription();
  menuOpen: boolean = false;
  cartCount: number = 0;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
  constructor(
    private router: Router,
    private dialog: MatDialog,
    private toolsService: ToolsService,
    private cartState: CartStateService
  ) {}

  ngOnInit() {
    this.isLoggedIn = !!sessionStorage.getItem('user');
    this.authSubscription = this.toolsService.authState$.subscribe(
      (status) => (this.isLoggedIn = status)
    );

    // Subscribe to shared cart count
    this.cartState.count$.subscribe((cnt) => (this.cartCount = cnt));

    // Initialize cart count from backend/local
    try {
      this.toolsService.getCart().subscribe({
        next: (data: any) => this.cartState.syncFromPayload(data),
        error: () => {
          try {
            const local = localStorage.getItem('cart');
            const arr = local ? JSON.parse(local) : [];
            this.cartState.syncFromPayload(arr);
          } catch {
            this.cartState.setCount(0);
          }
        },
      });
    } catch {
      // ignore
    }
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
  }

  openSignInModal() {
    this.dialog.open(SigninComponent, { width: '400px' });
  }

  openSignUpModal() {
    this.dialog.open(SignupComponent, { width: '400px' });
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  goToHomeAndRefresh() {
    this.isLoading = true;
    this.router
      .navigate(['/'])
      .then(() => setTimeout(() => (this.isLoading = false), 500));
  }

  logout() {
    sessionStorage.removeItem('user');
    this.isLoggedIn = false;
    this.toolsService.setAuthState(false);
    // Clear cart count when user logs out
    this.cartState.setCount(0);
    this.router.navigate(['/']);
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }
}
