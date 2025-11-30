import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { SigninComponent } from '../signin/signin.component';
import { SignupComponent } from '../signup/signup.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-auth-modal',
  imports: [
    MatDialogModule,
    MatTabsModule,
    SigninComponent,
    SignupComponent,
    TranslateModule,
  ],
  templateUrl: './auth-modal.component.html',
  styleUrl: './auth-modal.component.scss',
  standalone: true,
})
export class AuthModalComponent {
  constructor(private dialogRef: MatDialogRef<AuthModalComponent>) {}
  onAuthSuccess() {
    this.dialogRef.close(true);
  }
  onClose() {
    this.dialogRef.close(false);
  }
}
