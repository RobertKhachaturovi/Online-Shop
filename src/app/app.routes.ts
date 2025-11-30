import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CartComponent } from './components/cart/cart.component';
import { AuthPageComponent } from './components/auth-page/auth-page.component';
import { authGuard } from './auth.guard';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { ProfileComponent } from './components/profile/profile.component';
import { FavoritesComponent } from './components/favorites/favorites.component';
import { SurpriseToysComponent } from './components/surprise-toys/surprise-toys.component';
import { FinalPresentationComponent } from './components/final-presentation/final-presentation.component';
import { CompareComponent } from './components/compare/compare.component';

export const routes: Routes = [
  {
    path: ':lang',
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'cart', component: CartComponent },
      { path: 'auth', component: AuthPageComponent },
      { path: 'product-detail/:id', component: ProductDetailComponent },
      {
        path: 'profile',
        canActivate: [authGuard],
        component: ProfileComponent,
      },
      { path: 'favorites', component: FavoritesComponent },
      { path: 'surprise-toys', component: SurpriseToysComponent },
      { path: 'final-presentation', component: FinalPresentationComponent },
      { path: 'compare', component: CompareComponent },
      {
        path: 'placing-order',
        loadComponent: () =>
          import('./components/placing-order/placing-order.component').then(
            (m) => m.PlacingOrderComponent
          ),
      },
      {
        path: 'help',
        loadComponent: () =>
          import('./components/help-chat/help-chat.component').then(
            (m) => m.HelpChatComponent
          ),
      },
    ],
  },
  { path: '', redirectTo: '/ka/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/ka/home' },
];
