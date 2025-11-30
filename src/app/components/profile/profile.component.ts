import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ToolsService } from '../../tools.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ProfileSettingsModalComponent } from './profile-settings-modal.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Store, Select } from '@ngxs/store';
import { LanguageState } from '../../state/language.state';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit, OnDestroy {
  loading: boolean = true;

  public userInfo: any = {};
  updateData: any = {};
  updateSuccess: string = '';
  updateError: string = '';
  oldPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  passwordSuccess: string = '';
  passwordError: string = '';
  recoveryEmail: string = '';
  recoverySuccess: string = '';
  recoveryError: string = '';
  verifyEmailSuccess: string = '';
  verifyEmailError: string = '';
  deleteSuccess: string = '';
  deleteError: string = '';
  showUpdateForm = false;
  showChangePassword = false;
  showRecovery = false;
  showVerifyEmail = false;
  showDelete = false;
  

  @Select(LanguageState.getCurrentLanguage)
  currentLanguage$!: Observable<string>;
  private languageSubscription?: Subscription;

  constructor(
    public service: ToolsService,
    private dialog: MatDialog,
    private translate: TranslateService,
    private store: Store,
    private cdr: ChangeDetectorRef
  ) {}

  private closeAllSections() {
    this.showUpdateForm = false;
    this.showChangePassword = false;
    this.showRecovery = false;
    this.showVerifyEmail = false;
    this.showDelete = false;
  }

  toggleSection(
    section: 'update' | 'password' | 'recovery' | 'verify' | 'delete'
  ) {
    if (
      (section === 'update' && this.showUpdateForm) ||
      (section === 'password' && this.showChangePassword) ||
      (section === 'recovery' && this.showRecovery) ||
      (section === 'verify' && this.showVerifyEmail) ||
      (section === 'delete' && this.showDelete)
    ) {
      this.closeAllSections();
      return;
    }

    this.closeAllSections();
    switch (section) {
      case 'update':
        this.showUpdateForm = true;
        break;
      case 'password':
        this.showChangePassword = true;
        break;
      case 'recovery':
        this.showRecovery = true;
        break;
      case 'verify':
        this.showVerifyEmail = true;
        break;
      case 'delete':
        this.showDelete = true;
        break;
    }
  }

  ngOnInit(): void {
    this.loading = true;

    this.service.getUser().subscribe({
      next: (data: any) => {
        this.userInfo = data;
        this.updateData = { ...data };
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  openSettingsModal() {
    this.dialog.open(ProfileSettingsModalComponent, {
      width: '440px',
      data: { user: this.userInfo },
    });
  }

  updateProfile() {
    this.updateSuccess = '';
    this.updateError = '';

    this.service.updateProfile(this.updateData).subscribe({
      next: () => {
        this.translate
          .get('PROFILE_UPDATE_SUCCESS')
          .subscribe((text: string) => {
            this.updateSuccess = text;
          });
        this.userInfo = { ...this.updateData };
      },
      error: (err) => {
        this.translate.get('PROFILE_UPDATE_ERROR').subscribe((text: string) => {
          this.updateError = text + ' ' + (err.error?.message || '');
        });
      },
    });
  }

  changePassword() {
    this.passwordSuccess = '';
    this.passwordError = '';

    if (this.newPassword !== this.confirmPassword) {
      this.translate
        .get('PROFILE_PASSWORDS_DONT_MATCH')
        .subscribe((t) => (this.passwordError = t));
      return;
    }

    this.service
      .changePassword({
        oldPassword: this.oldPassword,
        newPassword: this.newPassword,
      })
      .subscribe({
        next: () => {
          this.translate
            .get('PROFILE_PASSWORD_CHANGED_SUCCESS')
            .subscribe((t) => (this.passwordSuccess = t));
          this.oldPassword = this.newPassword = this.confirmPassword = '';
        },
        error: (err) => {
          this.translate.get('PROFILE_PASSWORD_ERROR').subscribe((t) => {
            this.passwordError = t + ' ' + (err.error?.message || '');
          });
        },
      });
  }

  recoverPassword() {
    this.recoverySuccess = '';
    this.recoveryError = '';

    this.service.recoverPassword({ email: this.recoveryEmail }).subscribe({
      next: () => {
        this.translate
          .get('PROFILE_RECOVERY_LINK_SENT')
          .subscribe((t) => (this.recoverySuccess = t));
      },
      error: (err) => {
        this.translate.get('PROFILE_RECOVERY_ERROR').subscribe((t) => {
          this.recoveryError = t + ' ' + (err.error?.message || '');
        });
      },
    });
  }

  verifyEmail() {
    this.verifyEmailSuccess = '';
    this.verifyEmailError = '';

    if (!this.userInfo.email) {
      this.translate
        .get('PROFILE_EMAIL_NOT_SPECIFIED')
        .subscribe((t) => (this.verifyEmailError = t));
      return;
    }

    this.service.verifyEmail({ email: this.userInfo.email }).subscribe({
      next: () => {
        this.translate
          .get('PROFILE_VERIFICATION_LINK_SENT')
          .subscribe((t) => (this.verifyEmailSuccess = t));
      },
      error: (err) => {
        if (err.error?.errorKeys?.includes('errors.email_already_verified')) {
          this.translate
            .get('PROFILE_EMAIL_ALREADY_VERIFIED')
            .subscribe((t) => (this.verifyEmailError = t));
        } else {
          this.translate
            .get('PROFILE_VERIFICATION_ERROR')
            .subscribe((t) => (this.verifyEmailError = t));
        }
      },
    });
  }

  deleteAccount() {
    this.deleteSuccess = '';
    this.deleteError = '';

    this.translate.get('PROFILE_DELETE_CONFIRM').subscribe((text: string) => {
      if (!confirm(text)) return;

      this.service.deleteAccount().subscribe({
        next: () => {
          this.translate
            .get('PROFILE_ACCOUNT_DELETED')
            .subscribe((s) => (this.deleteSuccess = s));
        },
        error: (err) => {
          this.translate.get('PROFILE_DELETE_ERROR').subscribe((e) => {
            this.deleteError = e + ' ' + (err.error?.message || '');
          });
        },
      });
    });
  }
}
