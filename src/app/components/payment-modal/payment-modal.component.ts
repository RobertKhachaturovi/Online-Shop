import {
  Component,
  Input,
  Optional,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogRef,
  MatDialogModule,
  MatDialog,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GiftDialogComponent } from '../gift-dialog/gift-dialog.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Store, Select } from '@ngxs/store';
import { LanguageState } from '../../state/language.state';
import { Observable, Subscription } from 'rxjs';

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
    TranslateModule,
  ],
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss'],
})
export class PaymentModalComponent implements OnInit, OnDestroy {
  @Input() totalAmount: number = 0;
  @Input() cartItems: any[] = [];
  paymentForm: FormGroup;

  @Select(LanguageState.getCurrentLanguage)
  currentLanguage$!: Observable<string>;
  private languageSubscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private translate: TranslateService,
    private store: Store,
    private cdr: ChangeDetectorRef,
    @Optional() private dialogRef?: MatDialogRef<PaymentModalComponent>
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

  ngOnInit(): void {
    const savedLang = localStorage.getItem('language') || 'ka';
    if (savedLang !== this.translate.currentLang) {
      this.translate.use(savedLang).subscribe(() => {
        this.cdr.detectChanges();
      });
    }
    this.translate.onLangChange.subscribe((event) => {
      this.cdr.detectChanges();
    });
    this.languageSubscription = this.currentLanguage$.subscribe(
      (lang: string) => {
        if (lang) {
          if (lang !== this.translate.currentLang) {
            this.translate.use(lang).subscribe(() => {
              this.cdr.detectChanges();
            });
          } else {
            this.cdr.detectChanges();
          }
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  onCancel() {
    if (this.dialogRef) {
      this.dialogRef.close(null);
    }
  }

  openGiftDialog(): void {
    if (this.paymentForm.invalid) return;
    if (this.dialogRef) {
      this.dialogRef.close({
        paid: true,
        paymentDetails: this.paymentForm.value,
      });
    }
  }
}
