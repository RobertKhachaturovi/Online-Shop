import {
  ApplicationConfig,
  provideZoneChangeDetection,
  importProvidersFrom,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import {
  provideTranslateHttpLoader,
  TranslateHttpLoader,
} from '@ngx-translate/http-loader';
import { provideStore } from '@ngxs/store';
import {
  LanguageState,
  CartState,
  AuthState,
  UserState,
  FavoritesState,
  CompareState,
  ProductsState,
} from './state';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    provideStore([
      LanguageState,
      CartState,
      AuthState,
      UserState,
      FavoritesState,
      CompareState,
      ProductsState,
    ]),
    ...provideTranslateHttpLoader({
      prefix: 'assets/i18n/',
      suffix: '.json',
    }),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: TranslateHttpLoader,
        defaultLanguage: 'ka',
      })
    ),
  ],
};
