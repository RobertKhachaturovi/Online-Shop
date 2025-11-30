import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, TranslateModule],

  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss',
})
export class FavoritesComponent implements OnInit {
  favorites: any[] = [];
  public Math = Math;
  selectedFavoriteId: string | null = null;

  getUserEmail() {
    return sessionStorage.getItem('userEmail') || '';
  }

  ngOnInit() {
    this.loadFavorites();
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

  removeFavorite(productId: string) {
    const email = this.getUserEmail();
    if (!email) return;
    this.favorites = this.favorites.filter((p) => p.id !== productId);
    localStorage.setItem(`favorites_${email}`, JSON.stringify(this.favorites));
  }

  selectFavorite(productId: string) {
    this.selectedFavoriteId = productId;
  }
}
