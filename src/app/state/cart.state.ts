import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
export class SetCartCount {
  static readonly type = '[Cart] Set Count';
  constructor(public payload: number) {}
}

export class IncrementCartCount {
  static readonly type = '[Cart] Increment Count';
  constructor(public payload: number = 1) {}
}

export class SyncCartFromPayload {
  static readonly type = '[Cart] Sync From Payload';
  constructor(public payload: any) {}
}

export class SetCartItems {
  static readonly type = '[Cart] Set Items';
  constructor(public payload: any[]) {}
}

export class AddToCart {
  static readonly type = '[Cart] Add Item';
  constructor(public payload: { productId: string; quantity: number }) {}
}

export class RemoveFromCart {
  static readonly type = '[Cart] Remove Item';
  constructor(public payload: string) {}
}

export class ClearCart {
  static readonly type = '[Cart] Clear';
}
export interface CartStateModel {
  count: number;
  items: any[];
  isLoading: boolean;
}
function isBrowser(): boolean {
  return typeof window !== 'undefined' && !!window.localStorage;
}

function readStoredCartCount(): number {
  if (!isBrowser()) return 0;
  try {
    const raw = window.localStorage.getItem('cartCountSnapshot');
    const parsed = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

function persistCartCount(value: number) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem('cartCountSnapshot', String(value));
  } catch {}
}

function normalizeCartItems(payload: any): any[] {
  if (!payload) return [];

  const candidates = [
    payload,
    payload?.products,
    payload?.cart,
    payload?.cart?.products,
    payload?.cart?.items,
    payload?.items,
    payload?.data,
    payload?.data?.products,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

function calculateCartCount(payload: any): number {
  const items = Array.isArray(payload) ? payload : normalizeCartItems(payload);
  if (!items.length) return 0;

  return items.reduce((sum, item) => {
    const rawQty =
      item?.quantity ?? item?.qty ?? item?.count ?? item?.amount ?? 1;
    const qty = Number(rawQty);
    const safeQty = Number.isFinite(qty) ? Math.max(0, Math.floor(qty)) : 1;
    return sum + safeQty;
  }, 0);
}
@State<CartStateModel>({
  name: 'cart',
  defaults: {
    count: readStoredCartCount(),
    items: [],
    isLoading: false,
  },
})
@Injectable()
export class CartState {
  @Selector()
  static getCount(state: CartStateModel): number {
    return state.count;
  }

  @Selector()
  static getItems(state: CartStateModel): any[] {
    return state.items;
  }

  @Selector()
  static isLoading(state: CartStateModel): boolean {
    return state.isLoading;
  }

  @Action(SetCartCount)
  setCount(ctx: StateContext<CartStateModel>, action: SetCartCount) {
    const safe =
      Number.isFinite(action.payload) && action.payload >= 0
        ? Math.floor(action.payload)
        : 0;
    persistCartCount(safe);
    ctx.patchState({ count: safe });
  }

  @Action(IncrementCartCount)
  incrementCount(
    ctx: StateContext<CartStateModel>,
    action: IncrementCartCount
  ) {
    const current = ctx.getState().count;
    const delta = Number.isFinite(action.payload) ? action.payload : 1;
    const next = Math.max(0, current + delta);
    persistCartCount(next);
    ctx.patchState({ count: next });
  }

  @Action(SyncCartFromPayload)
  syncFromPayload(
    ctx: StateContext<CartStateModel>,
    action: SyncCartFromPayload
  ) {
    const total = calculateCartCount(action.payload);
    const items = normalizeCartItems(action.payload);
    persistCartCount(total);
    ctx.patchState({
      count: total,
      items: items,
    });
  }

  @Action(SetCartItems)
  setCartItems(ctx: StateContext<CartStateModel>, action: SetCartItems) {
    const count = calculateCartCount(action.payload);
    persistCartCount(count);
    ctx.patchState({
      items: action.payload,
      count: count,
    });
  }

  @Action(AddToCart)
  addToCart(ctx: StateContext<CartStateModel>, action: AddToCart) {
    const state = ctx.getState();
    const existingItem = state.items.find(
      (item) =>
        item.id === action.payload.productId ||
        item._id === action.payload.productId
    );

    let newItems: any[];
    if (existingItem) {
      newItems = state.items.map((item) =>
        item.id === action.payload.productId ||
        item._id === action.payload.productId
          ? {
              ...item,
              quantity: (item.quantity || 1) + action.payload.quantity,
            }
          : item
      );
    } else {
      newItems = [
        ...state.items,
        {
          id: action.payload.productId,
          quantity: action.payload.quantity,
        },
      ];
    }

    const count = calculateCartCount(newItems);
    persistCartCount(count);
    ctx.patchState({
      items: newItems,
      count: count,
    });
  }

  @Action(RemoveFromCart)
  removeFromCart(ctx: StateContext<CartStateModel>, action: RemoveFromCart) {
    const state = ctx.getState();
    const newItems = state.items.filter(
      (item) => item.id !== action.payload && item._id !== action.payload
    );
    const count = calculateCartCount(newItems);
    persistCartCount(count);
    ctx.patchState({
      items: newItems,
      count: count,
    });
  }

  @Action(ClearCart)
  clearCart(ctx: StateContext<CartStateModel>) {
    persistCartCount(0);
    ctx.patchState({
      items: [],
      count: 0,
    });
  }
}
