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
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Store, Select } from '@ngxs/store';
import { LanguageState } from '../../state/language.state';
import { Observable, Subscription } from 'rxjs';
import { LanguageRoutingService } from '../../language-routing.service';

@Component({
  selector: 'app-signin',
  imports: [ReactiveFormsModule, CommonModule, TranslateModule],
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
})
export class SigninComponent implements OnInit, OnDestroy {
  private languageRouter = inject(LanguageRoutingService);

  feedbackMessage: string = '';
  feedbackType: 'success' | 'error' = 'success';

  @Select(LanguageState.getCurrentLanguage)
  currentLanguage$!: Observable<string>;
  private languageSubscription?: Subscription;

  constructor(
    public service: ToolsService,
    @Optional() private dialogRef: MatDialogRef<any>,
    private translate: TranslateService,
    private store: Store,
    private cdr: ChangeDetectorRef
  ) {}

  public formInfo: FormGroup = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
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

  login() {
    if (this.formInfo.valid) {
      this.service.signin(this.formInfo.value).subscribe({
        next: (data: any) => {
          sessionStorage.setItem('user', data.access_token);
          this.service.getUser().subscribe((user: any) => {
            if (user?.email) {
              sessionStorage.setItem('userEmail', user.email);
            }
            this.service.setAuthState(true);
            this.feedbackType = 'success';
            this.translate.get('SIGNIN_SUCCESS').subscribe((text: string) => {
              this.feedbackMessage = text;
            });
            setTimeout(() => {
              this.feedbackMessage = '';
              if (this.dialogRef) {
                this.dialogRef.close(true);
              } else {
                this.languageRouter.navigate(['home']);
              }
            }, 1500);
          });
        },
        error: (err) => {
          this.feedbackType = 'error';
          this.translate.get('SIGNIN_FAILED').subscribe((text: string) => {
            this.feedbackMessage = text;
          });
        },
      });
    }
  }

  goToSignUp(event: Event) {
    event.preventDefault();
    if (this.dialogRef) this.dialogRef.close('signup');
    else this.languageRouter.navigate(['auth']);
  }
}
