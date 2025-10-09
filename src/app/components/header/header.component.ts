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
import { SigninComponent } from '../signin/signin.component';
import { SignupComponent } from '../signup/signup.component';
import { CommonModule } from '@angular/common';
import { ToolsService } from '../../tools.service';
import { Subscription } from 'rxjs';

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
        <div class="loading-spinner" *ngIf="isLoading"></div>
      </div>

      <div class="header-actions">
        <div *ngIf="!isLoggedIn" class="auth-buttons">
          <button class="header-btn signin-btn" (click)="openSignInModal()">
            <span class="material-icons">login</span>
            Log In
          </button>
          <button class="header-btn signup-btn" (click)="openSignUpModal()">
            <span class="material-icons">person_add</span>
            Sign Up
          </button>
          <button class="header-btn profile-btn" (click)="goToProfile()">
            <span class="material-icons">account_circle</span>
            Profile
          </button>
        </div>

        <div *ngIf="isLoggedIn" class="user-actions">
          <button class="header-btn profile-btn" (click)="goToProfile()">
            <span class="material-icons">account_circle</span>
            Profile
          </button>
          <button class="header-btn logout-btn" (click)="logout()">
            <span class="material-icons">logout</span>
            Log Out
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

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private toolsService: ToolsService
  ) {}

  ngOnInit() {
    // Check initial auth state
    this.isLoggedIn = !!sessionStorage.getItem('user');

    // Subscribe to auth state changes
    this.authSubscription = this.toolsService.authState$.subscribe(
      (isLoggedIn) => {
        this.isLoggedIn = isLoggedIn;
      }
    );
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
  }

  onSearch(value: string) {
    this.search.emit(value);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  openSignInModal() {
    this.dialog.open(SigninComponent, {
      width: '450px',
      disableClose: false,
    });
  }

  openSignUpModal() {
    this.dialog.open(SignupComponent, {
      width: '500px',
      disableClose: false,
    });
  }

  logout() {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('userEmail');
    this.toolsService.setAuthState(false);
    this.router.navigate(['/home']);
  }

  goToHomeAndRefresh() {
    this.isLoading = true;

    this.router.navigate(['/']).then(() => {
      setTimeout(() => {
        window.location.reload();
      }, 300);
    });
  }
}
