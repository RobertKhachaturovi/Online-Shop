import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';

export class SetLanguage {
  static readonly type = '[Language] Set Language';
  constructor(public payload: string) {}
}

export interface LanguageStateModel {
  currentLanguage: string;
}

@State<LanguageStateModel>({
  name: 'language',
  defaults: {
    currentLanguage: 'ka',
  },
})
@Injectable()
export class LanguageState {
  @Selector()
  static getCurrentLanguage(state: LanguageStateModel): string {
    return state.currentLanguage;
  }

  @Action(SetLanguage)
  setLanguage(ctx: StateContext<LanguageStateModel>, action: SetLanguage) {
    ctx.patchState({
      currentLanguage: action.payload,
    });
  }
}
