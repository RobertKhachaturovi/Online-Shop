import { Injectable } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { LanguageState } from './state/language.state';

@Injectable({
  providedIn: 'root',
})
export class LanguageRoutingService {
  constructor(private router: Router, private store: Store) {}

  private resolveLang(): string {
    try {
      const lang = this.store.selectSnapshot(LanguageState.getCurrentLanguage);
      if (lang) {
        return lang;
      }
    } catch {}

    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('language');
      if (stored) {
        return stored;
      }
    }

    return 'ka';
  }

  createLink(commands: any[] = []): any[] {
    const lang = this.resolveLang();
    return ['/', lang, ...commands];
  }

  navigate(commands: any[] = [], extras?: NavigationExtras) {
    return this.router.navigate(this.createLink(commands), extras);
  }
}
