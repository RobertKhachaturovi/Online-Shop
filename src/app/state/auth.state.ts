import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
export class SetAuthState {
  static readonly type = '[Auth] Set Auth State';
  constructor(public payload: boolean) {}
}

export class SetToken {
  static readonly type = '[Auth] Set Token';
  constructor(public payload: string) {}
}

export class SetUserEmail {
  static readonly type = '[Auth] Set User Email';
  constructor(public payload: string) {}
}

export class Logout {
  static readonly type = '[Auth] Logout';
}
export interface AuthStateModel {
  isAuthenticated: boolean;
  token: string | null;
  userEmail: string | null;
}
function isBrowser(): boolean {
  return typeof window !== 'undefined' && !!window.sessionStorage;
}

function readStoredToken(): string | null {
  if (!isBrowser()) return null;
  try {
    return sessionStorage.getItem('user') || null;
  } catch {
    return null;
  }
}

function readStoredEmail(): string | null {
  if (!isBrowser()) return null;
  try {
    return sessionStorage.getItem('userEmail') || null;
  } catch {
    return null;
  }
}

function persistToken(token: string | null) {
  if (!isBrowser()) return;
  try {
    if (token) {
      sessionStorage.setItem('user', token);
    } else {
      sessionStorage.removeItem('user');
    }
  } catch {}
}

function persistEmail(email: string | null) {
  if (!isBrowser()) return;
  try {
    if (email) {
      sessionStorage.setItem('userEmail', email);
    } else {
      sessionStorage.removeItem('userEmail');
    }
  } catch {}
}
@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    isAuthenticated: !!readStoredToken(),
    token: readStoredToken(),
    userEmail: readStoredEmail(),
  },
})
@Injectable()
export class AuthState {
  @Selector()
  static isAuthenticated(state: AuthStateModel): boolean {
    return state.isAuthenticated;
  }

  @Selector()
  static getToken(state: AuthStateModel): string | null {
    return state.token;
  }

  @Selector()
  static getUserEmail(state: AuthStateModel): string | null {
    return state.userEmail;
  }

  @Action(SetAuthState)
  setAuthState(ctx: StateContext<AuthStateModel>, action: SetAuthState) {
    ctx.patchState({
      isAuthenticated: action.payload,
    });
  }

  @Action(SetToken)
  setToken(ctx: StateContext<AuthStateModel>, action: SetToken) {
    persistToken(action.payload);
    ctx.patchState({
      token: action.payload,
      isAuthenticated: !!action.payload,
    });
  }

  @Action(SetUserEmail)
  setUserEmail(ctx: StateContext<AuthStateModel>, action: SetUserEmail) {
    persistEmail(action.payload);
    ctx.patchState({
      userEmail: action.payload,
    });
  }

  @Action(Logout)
  logout(ctx: StateContext<AuthStateModel>) {
    persistToken(null);
    persistEmail(null);
    ctx.patchState({
      isAuthenticated: false,
      token: null,
      userEmail: null,
    });
  }
}
