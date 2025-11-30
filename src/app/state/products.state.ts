import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';

export class SetProducts {
  static readonly type = '[Products] Set Products';
  constructor(public payload: any) {}
}

export class SetFilters {
  static readonly type = '[Products] Set Filters';
  constructor(public payload: ProductFilters) {}
}

export class SetPagination {
  static readonly type = '[Products] Set Pagination';
  constructor(
    public payload: { currentPage: number; itemsPerPage: number | 'ALL' }
  ) {}
}

export class SetSearchQuery {
  static readonly type = '[Products] Set Search Query';
  constructor(public payload: string) {}
}

export class SetSelectedCategory {
  static readonly type = '[Products] Set Selected Category';
  constructor(public payload: number | null) {}
}

export class SetSelectedBrand {
  static readonly type = '[Products] Set Selected Brand';
  constructor(public payload: string | null) {}
}

export class SetLoading {
  static readonly type = '[Products] Set Loading';
  constructor(public payload: boolean) {}
}

export class ResetFilters {
  static readonly type = '[Products] Reset Filters';
}
export interface ProductFilters {
  searchString: string;
  selectedCategoryId: number | null;
  selectedBrand: string | null;
  onlyDiscounted: boolean;
  onlyInStock: boolean;
  minRating: number;
  minPrice: number | null;
  maxPrice: number | null;
  priceSortDirection: 'asc' | 'desc' | null;
  showBest: boolean;
}

export interface ProductsStateModel {
  products: any[];
  allProducts: any[];
  filters: ProductFilters;
  pagination: {
    currentPage: number;
    itemsPerPage: number | 'ALL';
  };
  isLoading: boolean;
  total: number;
}
@State<ProductsStateModel>({
  name: 'products',
  defaults: {
    products: [],
    allProducts: [],
    filters: {
      searchString: '',
      selectedCategoryId: null,
      selectedBrand: null,
      onlyDiscounted: false,
      onlyInStock: false,
      minRating: 0,
      minPrice: null,
      maxPrice: null,
      priceSortDirection: null,
      showBest: false,
    },
    pagination: {
      currentPage: 1,
      itemsPerPage: 9,
    },
    isLoading: false,
    total: 0,
  },
})
@Injectable()
export class ProductsState {
  @Selector()
  static getProducts(state: ProductsStateModel): any[] {
    return state.products;
  }

  @Selector()
  static getAllProducts(state: ProductsStateModel): any[] {
    return state.allProducts;
  }

  @Selector()
  static getFilters(state: ProductsStateModel): ProductFilters {
    return state.filters;
  }

  @Selector()
  static getPagination(state: ProductsStateModel) {
    return state.pagination;
  }

  @Selector()
  static isLoading(state: ProductsStateModel): boolean {
    return state.isLoading;
  }

  @Selector()
  static getTotal(state: ProductsStateModel): number {
    return state.total;
  }

  @Action(SetProducts)
  setProducts(ctx: StateContext<ProductsStateModel>, action: SetProducts) {
    const products = action.payload?.products || action.payload || [];
    const total = action.payload?.total || products.length;
    ctx.patchState({
      products: products,
      total: total,
    });
  }

  @Action(SetFilters)
  setFilters(ctx: StateContext<ProductsStateModel>, action: SetFilters) {
    ctx.patchState({
      filters: { ...ctx.getState().filters, ...action.payload },
    });
  }

  @Action(SetPagination)
  setPagination(ctx: StateContext<ProductsStateModel>, action: SetPagination) {
    ctx.patchState({
      pagination: action.payload,
    });
  }

  @Action(SetSearchQuery)
  setSearchQuery(
    ctx: StateContext<ProductsStateModel>,
    action: SetSearchQuery
  ) {
    const filters = ctx.getState().filters;
    ctx.patchState({
      filters: { ...filters, searchString: action.payload },
    });
  }

  @Action(SetSelectedCategory)
  setSelectedCategory(
    ctx: StateContext<ProductsStateModel>,
    action: SetSelectedCategory
  ) {
    const filters = ctx.getState().filters;
    ctx.patchState({
      filters: { ...filters, selectedCategoryId: action.payload },
    });
  }

  @Action(SetSelectedBrand)
  setSelectedBrand(
    ctx: StateContext<ProductsStateModel>,
    action: SetSelectedBrand
  ) {
    const filters = ctx.getState().filters;
    ctx.patchState({
      filters: { ...filters, selectedBrand: action.payload },
    });
  }

  @Action(SetLoading)
  setLoading(ctx: StateContext<ProductsStateModel>, action: SetLoading) {
    ctx.patchState({
      isLoading: action.payload,
    });
  }

  @Action(ResetFilters)
  resetFilters(ctx: StateContext<ProductsStateModel>) {
    ctx.patchState({
      filters: {
        searchString: '',
        selectedCategoryId: null,
        selectedBrand: null,
        onlyDiscounted: false,
        onlyInStock: false,
        minRating: 0,
        minPrice: null,
        maxPrice: null,
        priceSortDirection: null,
        showBest: false,
      },
      pagination: {
        currentPage: 1,
        itemsPerPage: 9,
      },
    });
  }
}
