import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LanguageRoutingService } from '../../language-routing.service';

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
        max-width: 640px;
        padding: 28px 20px 20px 20px;
        background: #ffffff;
        border-radius: 18px;
        box-shadow: 0 12px 36px rgba(0, 0, 0, 0.12);
        text-align: center;
        font-family: 'Segoe UI', sans-serif;

        h2 {
          font-size: 24px;
          color: #333;
          margin-bottom: 16px;
          font-weight: 600;
        }
      }

      .receipt-content {
        margin: 24px 0;
        text-align: left;
        max-height: 60vh;
        overflow-y: auto;
        padding: 0 4px;
        font-size: 14px;
        color: #444;

        img {
          width: 56px !important;
          height: 56px !important;
          object-fit: cover !important;
          border-radius: 6px !important;
          margin-right: 12px !important;
          border: 1.5px solid #d0e2ff !important;
          box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08) !important;
        }

        h1 {
          font-size: 22px !important;
          color: #007bff !important;
          margin: 0 0 10px 0 !important;
        }

        div[style*='text-align:center'] {
          text-align: center !important;
          border-bottom: 2px solid #007bff !important;
          padding-bottom: 16px !important;
          margin-bottom: 20px !important;
        }

        div[style*='font-size:13px'] {
          font-size: 14px !important;
          color: #666 !important;
          margin: 5px 0 !important;
        }

        div[style*='display:flex'] {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          border-bottom: 1px solid #eee !important;
          padding: 15px 0 !important;
          margin: 10px 0 !important;
        }

        div[style*='font-weight:bold'] {
          font-weight: bold !important;
          margin-bottom: 5px !important;
          font-size: 16px !important;
        }

        div[style*='font-size:12px'] {
          font-size: 13px !important;
          color: #666 !important;
          line-height: 1.4 !important;
        }

        div[style*='font-weight:bold; color:#007bff'] {
          font-weight: bold !important;
          color: #007bff !important;
          font-size: 16px !important;
        }

        div[style*='border-top:2px solid #007bff'] {
          border-top: 2px solid #007bff !important;
          padding-top: 20px !important;
          margin-top: 20px !important;
          text-align: right !important;
          font-size: 18px !important;
          font-weight: bold !important;
        }

        div[style*='text-align:center; margin-top:24px'] {
          text-align: center !important;
          margin-top: 30px !important;
          color: #666 !important;
          font-size: 14px !important;
          padding-top: 20px !important;
          border-top: 1px solid #eee !important;
        }

        p {
          margin: 8px 0 !important;
        }
      }

      button {
        margin-top: 24px;
        padding: 10px 28px;
        font-size: 16px;
        font-weight: 600;
        border-radius: 10px;
        background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
        color: #fff;
        box-shadow: 0 4px 18px rgba(0, 242, 254, 0.2);
        border: none;
        transition: all 0.2s ease;
        letter-spacing: 0.8px;
        cursor: pointer;

        &:hover {
          background: linear-gradient(90deg, #00f2fe 0%, #4facfe 100%);
          box-shadow: 0 6px 28px rgba(0, 242, 254, 0.25);
          transform: translateY(-1px) scale(1.03);
        }

        &:active {
          transform: scale(0.98);
          box-shadow: 0 2px 12px rgba(0, 242, 254, 0.15);
        }
      }
    `,
  ],
})
export class ReceiptModalComponent {
  constructor(
    public dialogRef: MatDialogRef<ReceiptModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { receiptHtml: string },
    private languageRouter: LanguageRoutingService
  ) {}

  close() {
    this.dialogRef.close();
    this.languageRouter.navigate(['home']);
  }
}
