import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-receipt-modal',
  template: `
    <div class="receipt-modal">
      <h2>ქვითარი</h2>
      <div class="receipt-content" [innerHTML]="data.receiptHtml"></div>
      <button
        mat-raised-button
        color="primary"
        class="receipt-close-btn"
        (click)="close()"
      >
        დახურვა
      </button>
    </div>
  `,
  styles: [
    `
      .receipt-modal {
        max-width: 700px;
        padding: 32px 24px 24px 24px;
        background: #fff;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
        text-align: center;
      }
      .receipt-content {
        margin: 24px 0;
        text-align: left;
        max-height: 60vh;
        overflow-y: auto;
      }
      .receipt-content img {
        width: 80px !important;
        height: 80px !important;
        object-fit: cover !important;
        border-radius: 8px !important;
        margin-right: 15px !important;
        border: 2px solid #e0e0e0 !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
      }
      .receipt-content h1 {
        font-size: 24px !important;
        color: #007bff !important;
        margin: 0 0 10px 0 !important;
      }
      .receipt-content div[style*='text-align:center'] {
        text-align: center !important;
        border-bottom: 2px solid #007bff !important;
        padding-bottom: 16px !important;
        margin-bottom: 20px !important;
      }
      .receipt-content div[style*='font-size:13px'] {
        font-size: 14px !important;
        color: #666 !important;
        margin: 5px 0 !important;
      }
      .receipt-content div[style*='display:flex'] {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        border-bottom: 1px solid #eee !important;
        padding: 15px 0 !important;
        margin: 10px 0 !important;
      }
      .receipt-content div[style*='font-weight:bold'] {
        font-weight: bold !important;
        margin-bottom: 5px !important;
        font-size: 16px !important;
      }
      .receipt-content div[style*='font-size:12px'] {
        font-size: 13px !important;
        color: #666 !important;
        line-height: 1.4 !important;
      }
      .receipt-content div[style*='font-weight:bold; color:#007bff'] {
        font-weight: bold !important;
        color: #007bff !important;
        font-size: 16px !important;
      }
      .receipt-content div[style*='border-top:2px solid #007bff'] {
        border-top: 2px solid #007bff !important;
        padding-top: 20px !important;
        margin-top: 20px !important;
        text-align: right !important;
        font-size: 18px !important;
        font-weight: bold !important;
      }
      .receipt-content div[style*='text-align:center; margin-top:24px'] {
        text-align: center !important;
        margin-top: 30px !important;
        color: #666 !important;
        font-size: 14px !important;
        padding-top: 20px !important;
        border-top: 1px solid #eee !important;
      }
      .receipt-content p {
        margin: 8px 0 !important;
      }

      button {
        margin-top: 16px;
        padding: 12px 32px;
        font-size: 18px;
        font-weight: 700;
        border-radius: 8px;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        color: #fff;
        box-shadow: 0 4px 16px rgba(102, 126, 234, 0.18);
        border: none;
        transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
        letter-spacing: 1px;
      }
      .receipt-close-btn:hover {
        background: linear-gradient(90deg, #764ba2 0%, #667eea 100%);
        box-shadow: 0 8px 32px rgba(102, 126, 234, 0.22);
        transform: translateY(-2px) scale(1.04);
      }
    `,
  ],
})
export class ReceiptModalComponent {
  constructor(
    public dialogRef: MatDialogRef<ReceiptModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { receiptHtml: string },
    private router: Router
  ) {}

  close() {
    this.dialogRef.close();
    this.router.navigate(['/']);
  }
}
