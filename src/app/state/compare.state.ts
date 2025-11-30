import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';

export class LoadCompareList {
  static readonly type = '[Compare] Load Compare List';
}

export class AddToCompare {
  static readonly type = '[Compare] Add To Compare';
  constructor(public payload: any) {}
}

export class RemoveFromCompare {
  static readonly type = '[Compare] Remove From Compare';
  constructor(public payload: string) {}
}

export class ClearCompare {
  static readonly type = '[Compare] Clear Compare';
}

export class SetCompareList {
  static readonly type = '[Compare] Set Compare List';
  constructor(public payload: any[]) {}
}

export interface CompareStateModel {
  items: any[];
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && !!window.localStorage;
}

function loadCompareFromStorage(): any[] {
  if (!isBrowser()) return [];
  try {
    const data = localStorage.getItem('compareList');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveCompareToStorage(items: any[]) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem('compareList', JSON.stringify(items));
  } catch {}
}
@State<CompareStateModel>({
  name: 'compare',
  defaults: {
    items: loadCompareFromStorage(),
  },
})
@Injectable()
export class CompareState {
  @Selector()
  static getItems(state: CompareStateModel): any[] {
    return state.items;
  }

  @Selector()
  static getCount(state: CompareStateModel): number {
    return state.items.length;
  }

  @Selector()
  static isInCompare(state: CompareStateModel) {
    return (productId: string) => {
      return state.items.some(
        (item) => item.id === productId || item._id === productId
      );
    };
  }

  @Action(LoadCompareList)
  loadCompareList(ctx: StateContext<CompareStateModel>) {
    const items = loadCompareFromStorage();
    ctx.patchState({
      items: items,
    });
  }

  @Action(AddToCompare)
  addToCompare(ctx: StateContext<CompareStateModel>, action: AddToCompare) {
    const state = ctx.getState();
    const product = action.payload;
    const productId = product._id || product.id;

    if (!productId) return;

    const isAlreadyInCompare = state.items.some(
      (item) => item.id === productId || item._id === productId
    );

    if (isAlreadyInCompare) return;

    const newItems = [...state.items, product];
    saveCompareToStorage(newItems);

    ctx.patchState({
      items: newItems,
    });
  }

  @Action(RemoveFromCompare)
  removeFromCompare(
    ctx: StateContext<CompareStateModel>,
    action: RemoveFromCompare
  ) {
    const state = ctx.getState();
    const newItems = state.items.filter(
      (item) => item.id !== action.payload && item._id !== action.payload
    );

    saveCompareToStorage(newItems);

    ctx.patchState({
      items: newItems,
    });
  }

  @Action(ClearCompare)
  clearCompare(ctx: StateContext<CompareStateModel>) {
    saveCompareToStorage([]);
    ctx.patchState({
      items: [],
    });
  }

  @Action(SetCompareList)
  setCompareList(ctx: StateContext<CompareStateModel>, action: SetCompareList) {
    saveCompareToStorage(action.payload);
    ctx.patchState({
      items: action.payload,
    });
  }
}
