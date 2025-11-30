import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, forkJoin } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ToolsService {
  private API = 'https://api.everrest.educata.dev';

  constructor(private http: HttpClient) {}

  private getToken(): string {
    return sessionStorage.getItem('user') || '';
  }

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
      'Content-Type': 'application/json',
    });
  }
  private authStateSubject = new BehaviorSubject<boolean>(!!this.getToken());
  authState$ = this.authStateSubject.asObservable();

  setAuthState(isLoggedIn: boolean) {
    this.authStateSubject.next(isLoggedIn);
  }
  signup(info: any) {
    return this.http.post(`${this.API}/auth/sign_up`, info);
  }

  signin(info: any) {
    return this.http.post(`${this.API}/auth/sign_in`, info);
  }

  getUser() {
    return this.http.get(`${this.API}/auth`, {
      headers: this.getAuthHeaders(),
    });
  }
  getUserById(id: string) {
    return this.http.get(`${this.API}/auth/id/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }
  getAllUsers() {
    return this.http.get(`${this.API}/auth/all`, {
      headers: this.getAuthHeaders(),
    });
  }
  productsAll(page: number = 1, pageSize: number = 9): Observable<any> {
    return this.http.get(
      `${this.API}/shop/products/all?page_index=${page}&page_size=${pageSize}`
    );
  }

  getProductsByCategory(
    categoryId: number,
    page: number,
    pageSize: number = 9
  ): Observable<any> {
    return this.http.get(
      `${this.API}/shop/products/category/${categoryId}?page_index=${page}&page_size=${pageSize}`
    );
  }

  getProductsByBrand(
    brand: string,
    page: number,
    pageSize: number = 9
  ): Observable<any> {
    return this.http.get(
      `${this.API}/shop/products/brand/${brand}?page_index=${page}&page_size=${pageSize}`
    );
  }

  getProductById(id: string): Observable<any> {
    return this.http.get(`${this.API}/shop/products/id/${id}`);
  }
  rateProduct(
    productId: string,
    rating: number,
    reviewerName: string,
    reviewerLastName: string,
    comment?: string
  ): Observable<any> {
    const body: any = {
      id: productId,
      rating: rating,
      reviewerName: reviewerName,
      reviewerLastName: reviewerLastName,
    };
    if (comment) {
      body.comment = comment;
    }
    return this.http.post(`${this.API}/shop/products/rate`, body, {
      headers: this.getAuthHeaders(),
    });
  }

  getProductPriceById(id: number): Observable<number> {
    return this.http.get<any>(`${this.API}/shop/products/id/${id}`).pipe(
      map((product) => {
        if (typeof product.price === 'object') {
          return product.price.value ?? product.price.amount;
        }
        return product.price;
      })
    );
  }

  getAllProductPrices(
    page: number = 1,
    pageSize: number = 6
  ): Observable<number[]> {
    return this.http
      .get<any>(
        `${this.API}/shop/products/all?page_index=${page}&page_size=${pageSize}`
      )
      .pipe(
        map((data) =>
          data.products.map((p: any) => {
            if (typeof p.price === 'object') {
              return p.price.value ?? p.price.amount;
            }
            return p.price;
          })
        )
      );
  }

  searchProductsByPrice(min: number, max: number): Observable<any> {
    return this.http.get(
      `${this.API}/shop/products/search?price_min=${min}&price_max=${max}`
    );
  }
  searchProductsByRating(minRating: number): Observable<any> {
    return this.http.get(
      `${this.API}/shop/products/all?page_index=1&page_size=1000`
    );
  }
  searchProductsByStock(onlyInStock: boolean): Observable<any> {
    return this.http.get(
      `${this.API}/shop/products/all?page_index=1&page_size=1000`
    );
  }
  searchProductsByDiscount(onlyDiscounted: boolean): Observable<any> {
    return this.http.get(
      `${this.API}/shop/products/all?page_index=1&page_size=1000`
    );
  }
  searchProducts(filters: {
    keywords?: string;
    onlyDiscounted?: boolean;
    minRating?: number;
    onlyInStock?: boolean;
    page?: number;
    pageSize?: number;
    categoryId?: string;
    brand?: string;
    priceMin?: number;
    priceMax?: number;
    sortBy?: string;
    sortDirection?: string;
  }): Observable<any> {
    let url = `${this.API}/shop/products/search?page_index=${
      filters.page || 1
    }&page_size=${filters.pageSize || 100}`;

    if (filters.keywords) {
      url += `&keywords=${encodeURIComponent(filters.keywords)}`;
    }

    if (filters.categoryId) {
      url += `&category_id=${filters.categoryId}`;
    }

    if (filters.brand) {
      url += `&brand=${encodeURIComponent(filters.brand)}`;
    }

    if (filters.minRating) {
      url += `&rating=${filters.minRating}`;
    }

    if (filters.priceMin) {
      url += `&price_min=${filters.priceMin}`;
    }
    if (filters.priceMax) {
      url += `&price_max=${filters.priceMax}`;
    }

    if (filters.sortBy) {
      if (filters.sortBy === 'price') {
        url += `&sort_by=price.current`;
      } else {
        url += `&sort_by=${filters.sortBy}`;
      }
    }
    if (filters.sortDirection) {
      url += `&sort_direction=${filters.sortDirection}`;
    }

    console.log('Search API URL:', url);
    return this.http.get(url);
  }

  getAllProductsForFiltering(): Observable<any> {
    return this.http.get(
      `${this.API}/shop/products/all?page_index=1&page_size=10000`
    );
  }
  getAllProducts(): Observable<any> {
    return this.http
      .get(`${this.API}/shop/products/all?page_index=1&page_size=100`)
      .pipe(
        switchMap((firstPage: any) => {
          const totalPages = Math.ceil(firstPage.total / firstPage.limit);
          const allProducts = [...firstPage.products];

          if (totalPages <= 1) {
            return of({ products: allProducts, total: firstPage.total });
          }
          const remainingPages = [];
          for (let page = 2; page <= totalPages; page++) {
            remainingPages.push(
              this.http.get(
                `${this.API}/shop/products/all?page_index=${page}&page_size=100`
              )
            );
          }

          return forkJoin(remainingPages).pipe(
            map((pages: any[]) => {
              pages.forEach((page: any) => {
                allProducts.push(...page.products);
              });
              return { products: allProducts, total: firstPage.total };
            })
          );
        })
      );
  }

  testSearchAPI(): Observable<any> {
    const testUrl = `${this.API}/shop/products/search?page_index=1&page_size=5&keywords=laptop&category_id=1&brand=asus&rating=3&price_min=100&price_max=400&sort_by=price.current&sort_direction=asc`;
    console.log('Testing API with URL:', testUrl);
    return this.http.get(testUrl);
  }

  getBrands(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API}/shop/products/brands`);
  }

  addToCart(productId: string, quantity: number = 1): Observable<any> {
    return this.http
      .post(
        `${this.API}/shop/cart/product`,
        { id: productId, quantity },
        { headers: this.getAuthHeaders() } // <- აქ იგზავნება ტოკენი
      )
      .pipe(
        catchError((err) => {
          if (err?.error?.errorKeys?.includes('errors.user_already_has_cart')) {
            return this.http.patch(
              `${this.API}/shop/cart/product`,
              { id: productId, quantity },
              { headers: this.getAuthHeaders() }
            );
          }
          throw err;
        })
      );
  }

  getCart(): Observable<any> {
    return this.http.get(`${this.API}/shop/cart`, {
      headers: this.getAuthHeaders(),
    });
  }

  removeFromCart(productId: string): Observable<any> {
    return this.http.request('delete', `${this.API}/shop/cart/product`, {
      headers: this.getAuthHeaders(),
      body: { id: productId },
    });
  }

  resetCart(): Observable<any> {
    return this.http.delete(`${this.API}/shop/cart`, {
      headers: this.getAuthHeaders(),
    });
  }

  checkoutCart(): Observable<any> {
    return this.http.post(
      `${this.API}/shop/cart/checkout`,
      {},
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  changePassword(data: { oldPassword: string; newPassword: string }) {
    return this.http.patch(`${this.API}/auth/change_password`, data, {
      headers: this.getAuthHeaders(),
    });
  }
  verifyEmail(data: { email: string }) {
    return this.http.post(`${this.API}/auth/verify_email`, data, {
      headers: this.getAuthHeaders(),
    });
  }
  recoverPassword(data: { email: string }) {
    return this.http.post(`${this.API}/auth/recovery`, data);
  }

  updateProfile(data: any) {
    return this.http.patch(`${this.API}/auth/update`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteAccount() {
    return this.http.delete(`${this.API}/auth/delete`, {
      headers: this.getAuthHeaders(),
    });
  }
  signOut() {
    return this.http.post(
      `${this.API}/auth/sign_out`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }
  refreshToken() {
    return this.http.post(
      `${this.API}/auth/refresh`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }
  logProductApiUrl(id: number): string {
    const url = `${this.API}/shop/products/id/${id}`;
    console.log('Calling API with productId:', id);
    console.log('API URL:', url);
    return url;
  }

  getQRCodes() {
    return this.http.get('/qrcode');
  }
  generateQRCode(data: any) {
    return this.http.post(`${this.API}/qrcode/generate`, data, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    });
  }
  generateQRCodeWithImage(data: any) {
    return this.http.post('/qrcode/generate_with_image', data);
  }

  getQuotes() {
    return this.http.get('/quote');
  }
  addQuote(quote: any) {
    return this.http.post('/quote', quote);
  }
  getRandomQuote() {
    return this.http.get('/quote/random');
  }
  getQuoteTypes() {
    return this.http.get('/quote/types');
  }
  updateQuote(id: string, data: any) {
    return this.http.patch(`/quote/id/${id}`, data);
  }
  deleteQuote(id: string) {
    return this.http.delete(`/quote/id/${id}`);
  }
  echoJson(data: any) {
    return this.http.post('/echo/json', data);
  }
  echoHtml(data: any) {
    return this.http.post('/echo/html', data, { responseType: 'text' });
  }
}
