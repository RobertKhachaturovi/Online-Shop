import {
  Component,
  inject,
  Optional,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ToolsService } from '../../tools.service';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Store, Select } from '@ngxs/store';
import { LanguageState } from '../../state/language.state';
import { Observable, Subscription } from 'rxjs';
import { LanguageRoutingService } from '../../language-routing.service';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, TranslateModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent implements OnInit, OnDestroy {
  private languageRouter = inject(LanguageRoutingService);

  @Select(LanguageState.getCurrentLanguage)
  currentLanguage$!: Observable<string>;
  private languageSubscription?: Subscription;

  constructor(
    public service: ToolsService,
    @Optional() public dialogRef: MatDialogRef<any>,
    private translate: TranslateService,
    private store: Store,
    private cdr: ChangeDetectorRef
  ) {}

  public formInfo: FormGroup = new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    age: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl(''),
    confirmPassword: new FormControl(''),
    phone: new FormControl(''),
    address: new FormControl(''),
    zipcode: new FormControl(''),
    avatar: new FormControl(''),
    gender: new FormControl(''),
  });

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

  register() {
    const formData = this.formInfo.value;

    const requiredFields = [
      'firstName',
      'lastName',
      'age',
      'email',
      'password',
      'confirmPassword',
      'phone',
      'address',
      'zipcode',
      'gender',
    ];
    for (const field of requiredFields) {
      if (
        !formData[field] ||
        (typeof formData[field] === 'string' && !formData[field].trim())
      ) {
        this.translate
          .get('SIGNUP_FILL_ALL_FIELDS')
          .subscribe((text: string) => {
            alert(text);
          });
        return;
      }
    }

    const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailPattern.test(formData.email)) {
      this.translate.get('SIGNUP_EMAIL_INVALID').subscribe((text: string) => {
        alert(text);
      });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      this.translate
        .get('SIGNUP_PASSWORDS_DONT_MATCH')
        .subscribe((text: string) => {
          alert(text);
        });
      return;
    }

    if (isNaN(Number(formData.age)) || Number(formData.age) < 1) {
      this.translate.get('SIGNUP_AGE_INVALID').subscribe((text: string) => {
        alert(text);
      });
      return;
    }

    if (this.formInfo.valid) {
      const { confirmPassword, ...signupData } = formData;
      this.service.signup(signupData).subscribe({
        next: (data: any) => {
          if (data && data.access_token) {
            sessionStorage.setItem('user', data.access_token);

            this.service.getUser().subscribe((user: any) => {
              if (user && user.email) {
                sessionStorage.setItem('userEmail', user.email);
              }
              this.service.setAuthState(true);
              if (this.dialogRef) {
                this.dialogRef.close(true);
              } else {
                this.languageRouter.navigate(['profile']);
              }
            });
          } else {
            this.translate
              .get('SIGNUP_SUCCESS_NO_TOKEN')
              .subscribe((text: string) => {
                alert(text);
              });
          }
        },
        error: (err) => {
          let msgKey = 'SIGNUP_FAILED';
          if (err.error && err.error.message) {
            msgKey = 'SIGNUP_FAILED';
          } else if (err.status === 0) {
            msgKey = 'SIGNUP_NETWORK_ERROR';
          } else if (err.status === 400) {
            msgKey = 'SIGNUP_BAD_REQUEST';
          } else if (err.status === 409) {
            msgKey = 'SIGNUP_USER_EXISTS';
          }
          this.translate.get(msgKey).subscribe((text: string) => {
            if (err.error && err.error.message) {
              alert(err.error.message);
            } else {
              alert(text);
            }
          });
        },
      });
    } else {
      this.translate
        .get('SIGNUP_FILL_FIELDS_CORRECTLY')
        .subscribe((text: string) => {
          alert(text);
        });
    }
  }

  goToSignIn(event: Event) {
    event.preventDefault();
    if (this.dialogRef) {
      this.dialogRef.close('signin');
    } else {
      this.languageRouter.navigate(['auth']);
    }
  }

  closeModal() {
    if (this.dialogRef) {
      this.dialogRef.close();
    } else {
      this.languageRouter.navigate(['home']);
    }
  }
}
