import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const CART_COUNT_STORAGE_KEY = 'cartCountSnapshot';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && !!window.localStorage;
}

function readStoredCartCount(): number {
  if (!isBrowser()) return 0;
  try {
    const raw = window.localStorage.getItem(CART_COUNT_STORAGE_KEY);
    const parsed = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

function persistCartCount(value: number) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(CART_COUNT_STORAGE_KEY, String(value));
  } catch {}
}

export function normalizeCartItems(payload: any): any[] {
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

export function calculateCartCount(payload: any): number {
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

@Injectable({ providedIn: 'root' })
export class CartStateService {
  private readonly countSubject = new BehaviorSubject<number>(
    readStoredCartCount()
  );
  public readonly count$ = this.countSubject.asObservable();

  setCount(count: number) {
    const safe = Number.isFinite(count) && count >= 0 ? Math.floor(count) : 0;
    this.updateCount(safe);
  }

  increment(by: number = 1) {
    const current = this.countSubject.getValue();
    const delta = Number.isFinite(by) ? by : 1;
    const next = Math.max(0, current + delta);
    this.updateCount(next);
  }

  syncFromPayload(payload: any) {
    const total = calculateCartCount(payload);
    this.setCount(total);
  }

  private updateCount(value: number) {
    this.countSubject.next(value);
    persistCartCount(value);
  }
}
