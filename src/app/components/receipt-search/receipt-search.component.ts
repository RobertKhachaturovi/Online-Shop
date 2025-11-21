import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-receipt-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
  ],
  template: `
    <div class="receipt-search-modal">
      <h2>ქვითრის გადამოწმება</h2>

      <div class="search-section">
        <mat-form-field appearance="outline" class="search-input">
          <mat-label>ქვითრის ნომერი</mat-label>
          <input
            matInput
            [(ngModel)]="searchNumber"
            placeholder="მაგ: INV-1751826113094"
            (keyup.enter)="searchReceipt()"
          />
          <mat-icon matSuffix>receipt</mat-icon>
        </mat-form-field>

        <button
          mat-raised-button
          color="primary"
          (click)="searchReceipt()"
          [disabled]="!searchNumber.trim()"
        >
          <mat-icon>search</mat-icon>
          ძიება
        </button>
      </div>

      <div class="debug-section">
        <button
          mat-stroked-button
          color="accent"
          (click)="showAllReceipts()"
          style="margin-bottom: 16px;"
        >
          <mat-icon>list</mat-icon>
          ყველა (Debug)
        </button>
        <button
          mat-stroked-button
          color="warn"
          (click)="deleteAllReceipts()"
          style="margin-left: 12px; margin-bottom: 16px;"
          matTooltip="ყველა ქვითრის წაშლა"
        >
          <mat-icon>delete</mat-icon>
          ყველა ქვითრის წაშლა
        </button>
      </div>

      <div *ngIf="showAllReceiptsList" class="all-receipts-section">
        <h3>ყველა დამახსოვრებული ქვითარი</h3>

        <div *ngIf="allReceipts.length === 0" class="no-receipts">
          <mat-icon>receipt_long</mat-icon>
          <p>ქვითრები არ არის!</p>
        </div>

        <div *ngIf="allReceipts.length > 0" class="receipts-list">
          <div *ngFor="let receipt of allReceipts" class="receipt-summary">
            <div class="receipt-header">
              <div class="receipt-number">
                <mat-icon>receipt</mat-icon>
                {{ receipt.receiptNumber }}
                <button
                  mat-icon-button
                  (click)="copyReceiptNumber(receipt.receiptNumber)"
                  class="copy-btn"
                  matTooltip="ქვითრის ნომრის კოპირება"
                >
                  <mat-icon>content_copy</mat-icon>
                </button>
              </div>
              <div class="receipt-date">{{ receipt.date }}</div>
            </div>
            <div class="receipt-details">
              <div class="items-count">
                პროდუქტები: {{ receipt.items.length }}
              </div>
              <div class="total-amount">
                ჯამი: {{ receipt.total.toFixed(2) }} ₾
              </div>
            </div>
            <button
              mat-button
              color="primary"
              (click)="selectReceipt(receipt)"
              class="view-receipt-btn"
            >
              <mat-icon>visibility</mat-icon>
              ნახვა
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div *ngIf="foundReceipt" class="receipt-result">
        <h3>ქვითარი #{{ foundReceipt.receiptNumber }}</h3>
        <div class="receipt-date">თარიღი: {{ foundReceipt.date }}</div>

        <div class="receipt-items">
          <div *ngFor="let item of foundReceipt.items" class="receipt-item">
            <div class="item-image">
              <img
                [src]="
                  item.image ||
                  'https://via.placeholder.com/60x60?text=No+Image'
                "
                [alt]="item.title"
              />
            </div>
            <div class="item-details">
              <div class="item-title">{{ item.title }}</div>
              <div class="item-info">
                რაოდენობა: {{ item.quantity }} | ფასი: {{ item.price }} ₾ |
                მარაგი: {{ item.stock || 'N/A' }}
              </div>
            </div>
            <div class="item-total">
              {{ (item.quantity * item.price).toFixed(2) }} ₾
            </div>
          </div>
        </div>

        <div class="receipt-total">
          <strong
            >სრული ჯამური ფასი: {{ foundReceipt.total.toFixed(2) }} ₾</strong
          >
        </div>
      </div>

      <div class="modal-actions">
        <button mat-button (click)="close()">დახურვა</button>
      </div>
    </div>
  `,
  styles: [
    `
      .receipt-search-modal {
        padding: 24px;
        max-width: 600px;
        background: white;
        border-radius: 12px;
      }

      h2 {
        text-align: center;
        color: #007bff;
        margin-bottom: 24px;
      }

      .search-section {
        display: flex;
        gap: 16px;
        align-items: flex-end;
        margin-bottom: 24px;
      }

      .search-input {
        flex: 1;
      }

      .error-message {
        background: #ffebee;
        color: #c62828;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 16px;
        text-align: center;
      }

      .receipt-result {
        border: 2px solid #e3f2fd;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
      }

      .receipt-result h3 {
        color: #007bff;
        margin: 0 0 8px 0;
        text-align: center;
      }

      .receipt-date {
        text-align: center;
        color: #666;
        margin-bottom: 16px;
        font-size: 14px;
      }

      .receipt-items {
        margin-bottom: 16px;
      }

      .receipt-item {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #eee;
      }

      .receipt-item:last-child {
        border-bottom: none;
      }

      .item-image img {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 8px;
        margin-right: 12px;
        border: 1px solid #e0e0e0;
      }

      .item-details {
        flex: 1;
      }

      .item-title {
        font-weight: bold;
        margin-bottom: 4px;
      }

      .item-info {
        font-size: 12px;
        color: #666;
      }

      .item-total {
        font-weight: bold;
        color: #007bff;
        font-size: 16px;
      }

      .receipt-total {
        text-align: right;
        padding-top: 16px;
        border-top: 2px solid #007bff;
        font-size: 18px;
        color: #007bff;
      }

      .modal-actions {
        text-align: center;
        margin-top: 20px;
      }

      .all-receipts-section {
        margin-top: 24px;
        border-top: 2px solid #e0e0e0;
        padding-top: 20px;
      }

      .all-receipts-section h3 {
        color: #007bff;
        text-align: center;
        margin-bottom: 16px;
      }

      .no-receipts {
        text-align: center;
        color: #666;
        padding: 20px;
      }

      .no-receipts mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #ccc;
        margin-bottom: 8px;
      }

      .receipts-list {
        max-height: 400px;
        overflow-y: auto;
      }

      .receipt-summary {
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
        background: #fafafa;
        transition: all 0.3s ease;
      }

      .receipt-summary:hover {
        background: #f0f0f0;
        border-color: #007bff;
      }

      .receipt-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .receipt-number {
        font-weight: bold;
        color: #007bff;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .copy-btn {
        width: 24px;
        height: 24px;
        line-height: 24px;
        margin-left: 8px;
      }

      .copy-btn mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        line-height: 16px;
      }

      .receipt-date {
        color: #666;
        font-size: 14px;
      }

      .receipt-details {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }

      .items-count {
        color: #666;
        font-size: 14px;
      }

      .total-amount {
        font-weight: bold;
        color: #007bff;
      }

      .view-receipt-btn {
        width: 100%;
        justify-content: center;
      }

      @media (max-width: 600px) {
        .search-section {
          flex-direction: column;
          align-items: stretch;
        }

        .receipt-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }

        .item-total {
          align-self: flex-end;
        }

        .receipt-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
        }

        .receipt-details {
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
        }
      }
    `,
  ],
})
export class ReceiptSearchComponent {
  searchNumber: string = '';
  foundReceipt: any = null;
  errorMessage: string = '';
  allReceipts: any[] = [];
  showAllReceiptsList: boolean = false;

  constructor(public dialogRef: MatDialogRef<ReceiptSearchComponent>) {}

  searchReceipt() {
    if (!this.searchNumber.trim()) {
      this.errorMessage = 'გთხოვთ შეიყვანოთ ქვითრის ნომერი';
      return;
    }

    console.log('🔍 ძიება ქვითრის ნომრით:', this.searchNumber.trim());

    const receiptHistory = JSON.parse(
      localStorage.getItem('receiptHistory') || '[]'
    );
    console.log('📋 ყველა ქვითარი localStorage-ში:', receiptHistory);

    const found = receiptHistory.find((receipt: any) => {
      const match =
        receipt.receiptNumber.toLowerCase() ===
        this.searchNumber.trim().toLowerCase();
      console.log(
        `🔍 შედარება: "${
          receipt.receiptNumber
        }" === "${this.searchNumber.trim()}" = ${match}`
      );
      return match;
    });

    if (found) {
      console.log('✅ ქვითარი ნაპოვნია:', found);
      this.foundReceipt = found;
      this.errorMessage = '';
    } else {
      console.log('❌ ქვითარი არ მოიძებნა');
      this.foundReceipt = null;
      this.errorMessage = 'ქვითარი არ მოიძებნა. გთხოვთ შეამოწმოთ ნომერი.';
    }
  }

  close() {
    this.dialogRef.close();
  }

  showAllReceipts() {
    const receiptHistory = JSON.parse(
      localStorage.getItem('receiptHistory') || '[]'
    );
    console.log('⚙️ loaded receiptHistory =', receiptHistory);
    this.allReceipts = receiptHistory;
    this.showAllReceiptsList = !this.showAllReceiptsList;

    if (receiptHistory.length === 0) {
      console.log('❌ქვითრები არ არის!');
    } else {
      console.log(`✅ ${receiptHistory.length} ქვითარია`);
    }
  }

  selectReceipt(receipt: any) {
    console.log('👁️ არჩეული ქვითარი:', receipt);
    this.foundReceipt = receipt;
    this.searchNumber = receipt.receiptNumber;
    this.errorMessage = '';
    this.showAllReceiptsList = false;
  }

  copyReceiptNumber(receiptNumber: string) {
    const cleanNumber = receiptNumber.startsWith('#')
      ? receiptNumber.substring(1)
      : receiptNumber;

    navigator.clipboard
      .writeText(cleanNumber)
      .then(() => {
        console.log('📋 ქვითრის ნომერი კოპირებულია:', cleanNumber);
      })
      .catch((err) => {
        console.error('❌ კოპირების შეცდომა:', err);
      });
  }

  deleteAllReceipts() {
    localStorage.removeItem('receiptHistory');
    this.allReceipts = [];
    this.foundReceipt = null;
    this.errorMessage = '';
    this.showAllReceiptsList = false;
  }
}
