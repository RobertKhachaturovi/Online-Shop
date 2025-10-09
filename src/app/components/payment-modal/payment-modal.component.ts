import { Component, Inject, Input } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
  ],
  template: `
    <div class="payment-modal-container">
      <div class="summary-box">
        <h3>შეკვეთის მიმოხილვა</h3>
        <div class="summary-items" *ngIf="cartItems?.length">
          <div class="summary-item" *ngFor="let item of cartItems">
            <img
              [src]="item.product?.images?.[0] || 'https://via.placeholder.com/50'"
              [alt]="item.product?.title || 'პროდუქტის სურათი არ არის'"
              style="font-size: 10px;  "
            />
            <div class="info">
              <div class="title">{{ item.product?.title }}</div>
              <div class="details">
                რაოდენობა: {{ item.quantity }} | ერთეულის ფასი:
                {{ item.product?.price?.current || item.product?.price }} ₾
              </div>
            </div>
          </div>
        </div>
        <div class="total">
          <strong>სრული გადასახდელი თანხა:</strong>
          {{ totalAmount | number : '1.2-2' }} ₾
        </div>
      </div>

      <!-- 💳 Payment Form -->
      <form [formGroup]="paymentForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="fill">
          <mat-label>ბარათის ნომერი</mat-label>
          <input
            matInput
            formControlName="cardNumber"
            maxlength="16"
            required
          />
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>სრული სახელი</mat-label>
          <input matInput formControlName="cardHolder" required />
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="fill">
            <mat-label>ვადა (MM/YY)</mat-label>
            <input
              matInput
              formControlName="expiry"
              placeholder="MM/YY"
              required
            />
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>CVV</mat-label>
            <input
              matInput
              formControlName="cvv"
              maxlength="3"
              required
              type="password"
            />
          </mat-form-field>
        </div>
        <div class="three-boxes">
          <div class="box">
            <img
              src="https://madloba.info/media/images/logo_TBS.max-1920x1080.format-webp.mwtmk.webp"
              alt="ფოტო 1"
            />
          </div>
          <div class="box">
            <img
              src="https://gemug.ge/wp-content/uploads/2012/05/saqarthvelos-bankis-mobilbanki-aplikatsia.jpg"
              alt="ფოტო 2"
            />
          </div>
          <div class="box">
            <img src="https://libertybank.ge/m/i/logo-fb-en.png" alt="ფოტო 3" />
          </div>
        </div>

        <div class="actions">
          <button mat-button type="button" (click)="onCancel()">
            გაუქმება
          </button>
          <button
            mat-flat-button
            color="primary"
            type="submit"
            [disabled]="paymentForm.invalid"
          >
            გადახდა
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .three-boxes {
        display: flex;
        justify-content: center;
        gap: 24px;
        padding: 30px;
        flex-wrap: wrap;
      }
      .box {
        width: 120px;
        height: 70px;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease;
        background-color: #ffffff;
        border: solid 2.5px rgb(223, 226, 236);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .box:hover {
        transform: scale(1.08);
      }

      .box img {
        width: 60%;
        height: 60%;
        object-fit: cover;
        display: block;
        border-radius: 12px;
      }

      .payment-modal-container {
        max-width: 600px;
        padding: 24px;

        display: flex;
        flex-direction: column;
        gap: 16px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }

      .summary-box {
        background: #f4f6f9;
        padding: 16px;
        border-radius: 10px;
        border-left: 4px solid #1976d2;
      }

      .summary-box h3 {
        margin-top: 0;
        font-size: 18px;
        color: #1976d2;
      }

      .summary-items {
        max-height: 200px;
        overflow-y: auto;
        margin-top: 8px;
        margin-bottom: 12px;
      }

      .summary-item {
        display: flex;
        gap: 12px;
        align-items: center;
        padding: 6px 0;
        border-bottom: 1px dashed #ccc;
      }

      .summary-item img {
        width: 70px;
        height: 65px;
        object-fit: cover;
        border-radius: 6px;
      }

      .info {
        flex: 1;
      }

      .title {
        font-weight: 600;
        font-size: 14px;
      }

      .details {
        font-size: 12px;
        color: #666;
      }

      .total {
        text-align: right;
        font-size: 16px;
        margin-top: 8px;
      }

      mat-form-field {
        width: 100%;
        background: white;
      }

      .row {
        display: flex;
        gap: 16px;
      }

      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 16px;
      }
    `,
  ],
})
export class PaymentModalComponent {
  @Input() totalAmount: number = 0;
  @Input() cartItems: any[] = [];

  paymentForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PaymentModalComponent>
  ) {
    this.paymentForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      cardHolder: ['', Validators.required],
      expiry: [
        '',
        [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)],
      ],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
    });
  }

  onCancel() {
    this.dialogRef.close(null);
  }

  onSubmit() {
    if (this.paymentForm.valid) {
      this.dialogRef.close(this.paymentForm.value);
    }
  }
}
