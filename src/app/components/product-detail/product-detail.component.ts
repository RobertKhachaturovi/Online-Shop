import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { ToolsService } from '../../tools.service';
import { AuthModalComponent } from '../auth-modal/auth-modal.component';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    RouterModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent implements OnInit {
  product: any = null;
  loading = true;
  error = false;
  selectedImageIndex = 0;
  showCartAnimation = false;
  showRatingModal = false;
  Math = Math;

  selectedTabIndex = 0;

  rating = 0;
  reviewerName = '';
  reviewerLastName = '';
  reviewComment = '';

  reviews: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tools: ToolsService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      console.log('ProductDetailComponent initialized with ID:', id);
      if (id) {
        this.loadProduct(id);
      } else {
        console.error('No product ID found in route');
        this.error = true;
        this.loading = false;
        return;
      }
    });
  }

  loadProduct(id: string) {
    console.log('Loading product with ID:', id);
    this.loading = true;
    this.error = false;

    this.tools.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.loading = false;
        console.log('პროდუქტი ჩაიტვირთა:', product);

        const localReviews = this.getLocalReviews();
        let apiReviews: any[] = [];

        if (
          product.reviews &&
          Array.isArray(product.reviews) &&
          product.reviews.length > 0
        ) {
          apiReviews = product.reviews
            .map((apiReview: any) => {
              const local = localReviews.find(
                (r: any) =>
                  r.reviewerName === apiReview.reviewerName &&
                  r.reviewerLastName === apiReview.reviewerLastName &&
                  r.rating === apiReview.rating
              );
              return {
                ...apiReview,
                comment: apiReview.comment || (local ? local.comment : ''),
              };
            })
            .filter((review: any) => this.isValidReview(review));
        } else if (
          product.ratings &&
          Array.isArray(product.ratings) &&
          product.ratings.length > 0
        ) {
          apiReviews = product.ratings
            .map((apiReview: any) => {
              const local = localReviews.find(
                (r: any) =>
                  r.reviewerName === apiReview.reviewerName &&
                  r.reviewerLastName === apiReview.reviewerLastName &&
                  r.rating === apiReview.rating
              );
              return {
                ...apiReview,
                comment: apiReview.comment || (local ? local.comment : ''),
              };
            })
            .filter((review: any) => this.isValidReview(review));
        }

        const onlyLocal = localReviews
          .filter((local: any) => {
            return !apiReviews.some(
              (api: any) =>
                api.reviewerName === local.reviewerName &&
                api.reviewerLastName === local.reviewerLastName &&
                api.rating === local.rating &&
                api.comment === local.comment
            );
          })
          .filter((review: any) => this.isValidReview(review));

        this.reviews = [...apiReviews, ...onlyLocal];

        if (this.reviews.length === 0) {
          this.loadRatingsFromLocalStorage();
        }
      },
      error: (error: any) => {
        console.error('პროდუქტის ჩატვირთვის შეცდომა:', error);
        this.error = true;
        this.loading = false;
      },
    });
  }

  selectImage(index: number) {
    this.selectedImageIndex = index;
  }
  addToCart(productId: string) {
    console.log(' დამატება კალათაში, ID:', productId);

    const user = sessionStorage.getItem('user');
    if (!user) {
      console.log('მომხმარებელი არაა ავტორიზებული.');
      const dialogRef = this.dialog.open(AuthModalComponent, {
        width: '400px',
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((result) => {
        console.log('🔚 მოდალის შედეგი:', result);
        if (result) {
          this.addToCart(productId);
        }
      });
      return;
    }

    this.showCartAnimation = true;

    this.tools.getCart().subscribe({
      next: (data: any) => {
        const items = data?.products || data?.cart || [];
        const existing = items.find(
          (i: any) =>
            i?.productId === productId ||
            i?.id === productId ||
            (i?.product &&
              (i.product._id === productId || i.product.id === productId))
        );
        const newQty = (existing?.quantity || 0) + 1;

        this.tools.addToCart(productId, newQty).subscribe({
          next: (res) => {
            console.log('✅ წარმატებით დაემატა კალათაში:', res);
            setTimeout(() => {
              this.showCartAnimation = false;
              this.router.navigate(['/cart']);
            }, 3000);
          },
          error: (err) => {
            console.error(' შეცდომა კალათაში დამატებისას:', err);
            this.showCartAnimation = false;
            alert('დაფიქსირდა შეცდომა კალათაში დამატებისას!');
          },
        });
      },
      error: () => {
        this.tools.addToCart(productId, 1).subscribe({
          next: (res) => {
            console.log('✅ წარმატებით დაემატა კალათაში (fallback):', res);
            setTimeout(() => {
              this.showCartAnimation = false;
              this.router.navigate(['/cart']);
            }, 3000);
          },
          error: (err) => {
            console.error(' შეცდომა კალათაში დამატებისას (fallback):', err);
            this.showCartAnimation = false;
            alert('დაფიქსირდა შეცდომა კალათაში დამატებისას!');
          },
        });
      },
    });
  }

  closeCartAnimation() {
    this.showCartAnimation = false;
  }

  goBack() {
    this.router.navigate(['/']);
  }

  getDiscountPercentage() {
    if (this.product?.price?.beforeDiscount && this.product?.price?.current) {
      const discount =
        this.product.price.beforeDiscount - this.product.price.current;
      return Math.round((discount / this.product.price.beforeDiscount) * 100);
    }
    return 0;
  }

  isInStock() {
    return this.product?.stock > 0;
  }

  prevImage(event?: Event) {
    if (event) event.stopPropagation();
    if (!this.product?.images?.length) return;
    this.selectedImageIndex =
      (this.selectedImageIndex - 1 + this.product.images.length) %
      this.product.images.length;
  }

  nextImage(event?: Event) {
    if (event) event.stopPropagation();
    if (!this.product?.images?.length) return;
    this.selectedImageIndex =
      (this.selectedImageIndex + 1) % this.product.images.length;
  }

  openRatingModal() {
    const user = sessionStorage.getItem('user');
    if (!user) {
      console.log(
        '🔒 მომხმარებელი არაა ავტორიზებული. იხსნება ავტორიზაციის მოდალი...'
      );
      const dialogRef = this.dialog.open(AuthModalComponent, {
        width: '400px',
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((result) => {
        console.log('🔚 მოდალის შედეგი:', result);
        if (result) {
          this.showRatingModal = true;
        }
      });
      return;
    }

    this.showRatingModal = true;
  }

  closeRatingModal() {
    this.showRatingModal = false;
    this.rating = 0;
    this.reviewerName = '';
    this.reviewerLastName = '';
    this.reviewComment = '';
  }

  setRating(stars: number) {
    this.rating = stars;
  }

  submitRating() {
    if (this.rating === 0) {
      alert('გთხოვთ აირჩიოთ რეიტინგი');
      return;
    }
    if (!this.reviewerName.trim() || !this.reviewerLastName.trim()) {
      alert('გთხოვთ შეიყვანოთ სახელი და გვარი');
      return;
    }
    if (!this.reviewComment.trim()) {
      alert('გთხოვთ შეიყვანოთ კომენტარი');
      return;
    }
    console.log('შეფასების გაგზავნა:', {
      id: this.product._id,
      rating: this.rating,
      reviewerName: this.reviewerName,
      reviewerLastName: this.reviewerLastName,
      comment: this.reviewComment,
    });
    const newReview = {
      id: Date.now(),
      reviewerName: this.reviewerName,
      reviewerLastName: this.reviewerLastName,
      rating: this.rating,
      comment: this.reviewComment,
      date: new Date().toISOString().split('T')[0],
    };
    this.reviews.unshift(newReview);
    this.saveRatingsToLocalStorage();
    this.tools
      .rateProduct(
        this.product._id,
        this.rating,
        this.reviewerName,
        this.reviewerLastName,
        this.reviewComment
      )
      .subscribe({
        next: (response: any) => {
          console.log(' შეფასება წარმატებით გაიგზავნა API-ზე:', response);
          this.loadProduct(this.product._id);
        },
        error: (error: any) => {
          console.error('API-ზე გაგზავნის შეცდომა:', error);
        },
      });
    this.closeRatingModal();
    this.selectedTabIndex = 0;
    alert('შეფასება წარმატებით დაემატა!');
  }

  saveRatingsToLocalStorage() {
    const ratingsKey = `product_ratings_${this.product._id}`;
    localStorage.setItem(ratingsKey, JSON.stringify(this.reviews));
    console.log(' შეფასებები შენახული localStorage-ში:', ratingsKey);
  }

  loadRatingsFromLocalStorage() {
    const ratingsKey = `product_ratings_${this.product._id}`;
    const savedRatings = localStorage.getItem(ratingsKey);

    if (savedRatings) {
      this.reviews = JSON.parse(savedRatings).filter((review: any) =>
        this.isValidReview(review)
      );
    } else {
      this.reviews = [];
      console.log(' გამოყენებულია ნაგულისხმევი შეფასებები');
    }
  }

  deleteReview(reviewId: number) {
    if (confirm('ნამდვილად გსურთ ამ შეფასების წაშლა?')) {
      this.reviews = this.reviews.filter((review) => review.id !== reviewId);

      this.saveRatingsToLocalStorage();

      console.log(' შეფასება წაიშალა:', reviewId);
    }
  }
  onTabChange(event: any) {
    this.selectedTabIndex = event.index;
  }

  getLocalReviews() {
    const ratingsKey = `product_ratings_${this.product._id}`;
    const savedRatings = localStorage.getItem(ratingsKey);
    if (savedRatings) {
      return JSON.parse(savedRatings);
    }
    return [];
  }

  isValidReview(review: any): boolean {
    return !!(
      review &&
      review.reviewerName &&
      review.reviewerName.trim() !== '' &&
      review.reviewerLastName &&
      review.reviewerLastName.trim() !== '' &&
      review.rating &&
      Number(review.rating) > 0 &&
      review.comment &&
      review.comment.trim() !== ''
    );
  }
}
