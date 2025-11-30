import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';

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
    TranslateModule,
  ],
  template: `
    <div class="receipt-search-modal">
      <h2>{{ 'RECEIPT_TITLE' | translate }}</h2>

      <div class="search-section">
        <mat-form-field appearance="outline" class="search-input">
          <mat-label>{{ 'RECEIPT_NUMBER_LABEL' | translate }}</mat-label>
          <input
            matInput
            [(ngModel)]="searchNumber"
            [placeholder]="'RECEIPT_NUMBER_PLACEHOLDER' | translate"
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
          {{ 'SEARCH_BUTTON' | translate }}
        </button>
      </div>

      <div class="debug-section">
        <button mat-stroked-button color="accent" (click)="showAllReceipts()">
          <mat-icon>list</mat-icon>
          {{ 'SHOW_ALL_DEBUG' | translate }}
        </button>
        <button
          mat-stroked-button
          color="warn"
          (click)="deleteAllReceipts()"
          [matTooltip]="'DELETE_ALL_TOOLTIP' | translate"
        >
          <mat-icon>delete</mat-icon>
          {{ 'DELETE_ALL_BUTTON' | translate }}
        </button>
      </div>

      <div *ngIf="showAllReceiptsList" class="all-receipts-section">
        <h3>{{ 'ALL_RECEIPTS_TITLE' | translate }}</h3>

        <div *ngIf="allReceipts.length === 0" class="no-receipts">
          <mat-icon>receipt_long</mat-icon>
          <p>{{ 'NO_RECEIPTS' | translate }}</p>
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
                  [matTooltip]="'COPY_RECEIPT_TOOLTIP' | translate"
                >
                  <mat-icon>content_copy</mat-icon>
                </button>
              </div>
              <div class="receipt-date">{{ receipt.date }}</div>
            </div>
            <div class="receipt-details">
              <div class="items-count">
                {{ 'ITEMS_COUNT' | translate }}: {{ receipt.items.length }}
              </div>
              <div class="total-amount">
                {{ 'TOTAL_AMOUNT' | translate }}:
                {{ receipt.total.toFixed(2) }} ₾
              </div>
            </div>
            <button
              mat-button
              color="primary"
              (click)="selectReceipt(receipt)"
              class="view-receipt-btn"
            >
              <mat-icon>visibility</mat-icon>
              {{ 'VIEW_RECEIPT' | translate }}
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="errorMessage" class="error-message">
        {{ errorMessage | translate }}
      </div>

      <div *ngIf="foundReceipt" class="receipt-result">
        <h3>
          {{ 'RECEIPT_NUMBER_TITLE' | translate }} #{{
            foundReceipt.receiptNumber
          }}
        </h3>
        <div class="receipt-date">
          {{ 'DATE_LABEL' | translate }}: {{ foundReceipt.date }}
        </div>

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
                {{ 'QUANTITY_LABEL' | translate }}: {{ item.quantity }} |
                {{ 'PRICE_LABEL' | translate }}: {{ item.price }} ₾ |
                {{ 'STOCK_LABEL' | translate }}: {{ item.stock || 'N/A' }}
              </div>
            </div>
            <div class="item-total">
              {{ (item.quantity * item.price).toFixed(2) }} ₾
            </div>
          </div>
        </div>

        <div class="receipt-total">
          <strong>
            {{ 'TOTAL_PRICE_LABEL' | translate }}:
            {{ foundReceipt.total.toFixed(2) }} ₾
          </strong>
        </div>
      </div>

      <div class="modal-actions">
        <button mat-button (click)="close()">
          {{ 'CLOSE_BUTTON' | translate }}
        </button>
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
      this.errorMessage = 'ERROR_ENTER_RECEIPT' as any;
      return;
    }

    const receiptHistory = JSON.parse(
      localStorage.getItem('receiptHistory') || '[]'
    );
    const found = receiptHistory.find(
      (receipt: any) =>
        receipt.receiptNumber.toLowerCase() ===
        this.searchNumber.trim().toLowerCase()
    );

    if (found) {
      this.foundReceipt = found;
      this.errorMessage = '';
    } else {
      this.foundReceipt = null;
      this.errorMessage = 'ERROR_RECEIPT_NOT_FOUND' as any;
    }
  }

  close() {
    this.dialogRef.close();
  }

  showAllReceipts() {
    const receiptHistory = JSON.parse(
      localStorage.getItem('receiptHistory') || '[]'
    );
    this.allReceipts = receiptHistory;
    this.showAllReceiptsList = !this.showAllReceiptsList;
  }

  selectReceipt(receipt: any) {
    this.foundReceipt = receipt;
    this.searchNumber = receipt.receiptNumber;
    this.errorMessage = '';
    this.showAllReceiptsList = false;
  }

  copyReceiptNumber(receiptNumber: string) {
    navigator.clipboard.writeText(receiptNumber).then(() => {});
  }

  deleteAllReceipts() {
    localStorage.removeItem('receiptHistory');
    this.allReceipts = [];
    this.foundReceipt = null;
    this.errorMessage = '';
    this.showAllReceiptsList = false;
  }
}
