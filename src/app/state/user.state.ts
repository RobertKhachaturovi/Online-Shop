import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';

export class SetUser {
  static readonly type = '[User] Set User';
  constructor(public payload: any) {}
}

export class UpdateUser {
  static readonly type = '[User] Update User';
  constructor(public payload: Partial<any>) {}
}

export class ClearUser {
  static readonly type = '[User] Clear User';
}

export interface UserStateModel {
  user: any | null;
  isLoading: boolean;
  error: string | null;
}
@State<UserStateModel>({
  name: 'user',
  defaults: {
    user: null,
    isLoading: false,
    error: null,
  },
})
@Injectable()
export class UserState {
  @Selector()
  static getUser(state: UserStateModel): any | null {
    return state.user;
  }

  @Selector()
  static isLoading(state: UserStateModel): boolean {
    return state.isLoading;
  }

  @Selector()
  static getError(state: UserStateModel): string | null {
    return state.error;
  }

  @Selector()
  static getUserName(state: UserStateModel): string {
    if (!state.user) return '';
    return state.user.firstName && state.user.lastName
      ? `${state.user.firstName} ${state.user.lastName}`
      : state.user.email || '';
  }

  @Action(SetUser)
  setUser(ctx: StateContext<UserStateModel>, action: SetUser) {
    ctx.patchState({
      user: action.payload,
      error: null,
    });
  }

  @Action(UpdateUser)
  updateUser(ctx: StateContext<UserStateModel>, action: UpdateUser) {
    const currentUser = ctx.getState().user;
    ctx.patchState({
      user: currentUser
        ? { ...currentUser, ...action.payload }
        : action.payload,
      error: null,
    });
  }

  @Action(ClearUser)
  clearUser(ctx: StateContext<UserStateModel>) {
    ctx.patchState({
      user: null,
      error: null,
    });
  }
}
