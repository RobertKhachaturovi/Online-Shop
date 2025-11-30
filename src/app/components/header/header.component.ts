import {
  Component,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ToolsService } from '../../tools.service';
import { Subscription, Observable } from 'rxjs';
import { SigninComponent } from '../signin/signin.component';
import { SignupComponent } from '../signup/signup.component';
import { CartStateService } from '../../cart-state.service';
import { Store, Select } from '@ngxs/store';
import { SetLanguage, LanguageState } from '../../state/language.state';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() search = new EventEmitter<string>();

  @Select(LanguageState.getCurrentLanguage)
  currentLanguage$!: Observable<string>;

  currentLanguage: string = 'ka';
  isLoading: boolean = false;
  isLoggedIn: boolean = false;
  menuOpen: boolean = false;

  private authSubscription: Subscription = new Subscription();
  private languageSubscription?: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private toolsService: ToolsService,
    private cartState: CartStateService,
    private translate: TranslateService,
    private store: Store
  ) {}

  ngOnInit() {
    this.isLoggedIn = !!sessionStorage.getItem('user');
    this.authSubscription = this.toolsService.authState$.subscribe(
      (status) => (this.isLoggedIn = status)
    );
    const urlLang = this.route.snapshot.firstChild?.params['lang'];
    const savedLang = urlLang || localStorage.getItem('language') || 'ka';
    this.currentLanguage = savedLang;
    this.translate.use(savedLang);
    this.store.dispatch(new SetLanguage(savedLang));
    this.languageSubscription = this.currentLanguage$.subscribe((lang) => {
      if (lang && lang !== this.currentLanguage) {
        this.currentLanguage = lang;
        this.translate.use(lang);
      }
    });
    this.route.queryParams.subscribe((params) => {
      if (params['search']) {
        this.onSearch(params['search']);
      }
    });
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
    this.languageSubscription?.unsubscribe();
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
  changeLanguage(event: Event) {
    const target = event.target as HTMLSelectElement;
    const lang = target.value;

    localStorage.setItem('language', lang);
    this.store.dispatch(new SetLanguage(lang));
    this.translate.use(lang);

    const parts = this.router.url.split('/').filter(Boolean);
    parts[0] = lang;
    this.router.navigate(['/' + parts.join('/')]);
  }

  openSignInModal() {
    this.dialog.open(SigninComponent, { width: '400px' });
  }

  openSignUpModal() {
    this.dialog.open(SignupComponent, { width: '400px' });
  }

  goToProfile() {
    this.router.navigate(['/', this.currentLanguage, 'profile']);
  }

  goToHomeAndRefresh() {
    this.isLoading = true;
    this.router
      .navigate(['/', this.currentLanguage, 'home'])
      .then(() => setTimeout(() => (this.isLoading = false), 500));
  }

  logout() {
    sessionStorage.clear();
    localStorage.removeItem('refreshToken');
    this.isLoggedIn = false;
    this.toolsService.setAuthState(false);
    this.cartState.setCount(0);

    this.router.navigate(['/', this.currentLanguage, 'home']);
  }

  onSearch(value: string) {
    const currentLang = this.currentLanguage || 'ka';
    this.router.navigate(['/', currentLang, 'home'], {
      queryParams: { search: value },
    });
    this.search.emit(value);
  }
}
