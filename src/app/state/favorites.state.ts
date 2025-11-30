import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';

export class LoadFavorites {
  static readonly type = '[Favorites] Load Favorites';
  constructor(public payload: string) {}
}

export class AddToFavorites {
  static readonly type = '[Favorites] Add To Favorites';
  constructor(public payload: { product: any; userEmail: string }) {}
}

export class RemoveFromFavorites {
  static readonly type = '[Favorites] Remove From Favorites';
  constructor(public payload: { productId: string; userEmail: string }) {}
}

export class ClearFavorites {
  static readonly type = '[Favorites] Clear Favorites';
  constructor(public payload: string) {}
}

export class SetFavorites {
  static readonly type = '[Favorites] Set Favorites';
  constructor(public payload: { favorites: any[]; userEmail: string }) {}
}
export interface FavoritesStateModel {
  favorites: any[];
  userEmail: string | null;
}
function isBrowser(): boolean {
  return typeof window !== 'undefined' && !!window.localStorage;
}

function loadFavoritesFromStorage(userEmail: string): any[] {
  if (!isBrowser() || !userEmail) return [];
  try {
    const favs = localStorage.getItem(`favorites_${userEmail}`);
    return favs ? JSON.parse(favs) : [];
  } catch {
    return [];
  }
}

function saveFavoritesToStorage(userEmail: string, favorites: any[]) {
  if (!isBrowser() || !userEmail) return;
  try {
    localStorage.setItem(`favorites_${userEmail}`, JSON.stringify(favorites));
  } catch {}
}
@State<FavoritesStateModel>({
  name: 'favorites',
  defaults: {
    favorites: [],
    userEmail: null,
  },
})
@Injectable()
export class FavoritesState {
  @Selector()
  static getFavorites(state: FavoritesStateModel): any[] {
    return state.favorites;
  }

  @Selector()
  static getUserEmail(state: FavoritesStateModel): string | null {
    return state.userEmail;
  }

  @Selector()
  static isFavorite(state: FavoritesStateModel) {
    return (productId: string) => {
      return state.favorites.some(
        (fav) => fav.id === productId || fav._id === productId
      );
    };
  }

  @Action(LoadFavorites)
  loadFavorites(ctx: StateContext<FavoritesStateModel>, action: LoadFavorites) {
    const favorites = loadFavoritesFromStorage(action.payload);
    ctx.patchState({
      favorites: favorites,
      userEmail: action.payload,
    });
  }

  @Action(AddToFavorites)
  addToFavorites(
    ctx: StateContext<FavoritesStateModel>,
    action: AddToFavorites
  ) {
    const state = ctx.getState();
    const { product, userEmail } = action.payload;
    const productId = product._id || product.id;

    if (!productId) return;

    const isAlreadyFavorite = state.favorites.some(
      (fav) => fav.id === productId || fav._id === productId
    );

    if (isAlreadyFavorite) return;

    const newFavorite = {
      id: productId,
      title: product.title,
      image: product.images?.[0] || product.image || '',
      price: product.price?.current || product.price,
      rating: product.rating,
    };

    const newFavorites = [...state.favorites, newFavorite];
    saveFavoritesToStorage(userEmail, newFavorites);

    ctx.patchState({
      favorites: newFavorites,
      userEmail: userEmail,
    });
  }

  @Action(RemoveFromFavorites)
  removeFromFavorites(
    ctx: StateContext<FavoritesStateModel>,
    action: RemoveFromFavorites
  ) {
    const state = ctx.getState();
    const { productId, userEmail } = action.payload;

    const newFavorites = state.favorites.filter(
      (fav) => fav.id !== productId && fav._id !== productId
    );

    saveFavoritesToStorage(userEmail, newFavorites);

    ctx.patchState({
      favorites: newFavorites,
    });
  }

  @Action(ClearFavorites)
  clearFavorites(
    ctx: StateContext<FavoritesStateModel>,
    action: ClearFavorites
  ) {
    saveFavoritesToStorage(action.payload, []);
    ctx.patchState({
      favorites: [],
    });
  }

  @Action(SetFavorites)
  setFavorites(ctx: StateContext<FavoritesStateModel>, action: SetFavorites) {
    const { favorites, userEmail } = action.payload;
    saveFavoritesToStorage(userEmail, favorites);
    ctx.patchState({
      favorites: favorites,
      userEmail: userEmail,
    });
  }
}
