import { Component, OnInit } from '@angular/core';
import { ToolsService } from '../../tools.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ProfileSettingsModalComponent } from './profile-settings-modal.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
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

  constructor(public service: ToolsService, private dialog: MatDialog) {}

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
    this.service.getUser().subscribe((data: any) => {
      this.userInfo = data;
      this.updateData = { ...data };
    });
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
      next: (res) => {
        this.updateSuccess = 'პროფილი განახლდა!';
        this.userInfo = { ...this.updateData };
      },
      error: (err) => {
        this.updateError = 'შეცდომა: ' + (err.error?.message || '');
      },
    });
  }
  changePassword() {
    this.passwordSuccess = '';
    this.passwordError = '';
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'პაროლები არ ემთხვევა!';
      return;
    }
    this.service
      .changePassword({
        oldPassword: this.oldPassword,
        newPassword: this.newPassword,
      })
      .subscribe({
        next: () => {
          this.passwordSuccess = 'პაროლი წარმატებით შეიცვალა!';
          this.oldPassword = this.newPassword = this.confirmPassword = '';
        },
        error: (err) => {
          this.passwordError = 'შეცდომა: ' + (err.error?.message || '');
        },
      });
  }
  recoverPassword() {
    this.recoverySuccess = '';
    this.recoveryError = '';
    this.service.recoverPassword({ email: this.recoveryEmail }).subscribe({
      next: () => {
        this.recoverySuccess = 'პაროლის აღდგენის ბმული გაიგზავნა ელ.ფოსტაზე!';
      },
      error: (err) => {
        this.recoveryError = 'შეცდომა: ' + (err.error?.message || '');
      },
    });
  }
  verifyEmail() {
    this.verifyEmailSuccess = '';
    this.verifyEmailError = '';

    if (!this.userInfo.email) {
      this.verifyEmailError = 'ელ.ფოსტა არ არის მითითებული!';
      return;
    }

    this.service.verifyEmail({ email: this.userInfo.email }).subscribe({
      next: (response: any) => {
        this.verifyEmailSuccess =
          'ვერიფიკაციის ბმული გაიგზავნა თქვენს ელ.ფოსტაზე!';
        console.log('Verification email sent successfully', response);
      },
      error: (err) => {
        console.error('Email verification error:', err);
        if (err.error?.message) {
          this.verifyEmailError = err.error.message;
        } else if (
          err.error?.errorKeys?.includes('errors.email_already_verified')
        ) {
          this.verifyEmailError = 'ეს ელ.ფოსტა უკვე ვერიფიცირებულია!';
        } else {
          this.verifyEmailError =
            'დაფიქსირდა შეცდომა ვერიფიკაციის ბმულის გაგზავნისას. გთხოვთ სცადოთ მოგვიანებით.';
        }
      },
    });
  }

  deleteAccount() {
    this.deleteSuccess = '';
    this.deleteError = '';
    if (!confirm('ნამდვილად გსურთ ანგარიშის წაშლა?')) return;
    this.service.deleteAccount().subscribe({
      next: () => {
        this.deleteSuccess = 'ანგარიში წაიშალა!';
      },
      error: (err) => {
        this.deleteError = 'შეცდომა: ' + (err.error?.message || '');
      },
    });
  }
}
