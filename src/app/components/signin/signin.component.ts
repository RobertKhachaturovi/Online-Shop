import { Component, inject, Optional } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToolsService } from '../../tools.service';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signin',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
})
export class SigninComponent {
  router = inject(Router);

  feedbackMessage: string = '';
  feedbackType: 'success' | 'error' = 'success';

  constructor(
    public service: ToolsService,
    @Optional() private dialogRef: MatDialogRef<any>
  ) {}

  public formInfo: FormGroup = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
  });

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
            this.feedbackMessage = 'Login successful! ✅';
            setTimeout(() => {
              this.feedbackMessage = '';
              if (this.dialogRef) {
                this.dialogRef.close(true);
              } else {
                this.router.navigate(['/']);
              }
            }, 1500);
          });
        },
        error: (err) => {
          this.feedbackType = 'error';
          this.feedbackMessage = 'Login failed! ❌ Check your credentials.';
        },
      });
    }
  }

  goToSignUp(event: Event) {
    event.preventDefault();
    if (this.dialogRef) this.dialogRef.close('signup');
    else this.router.navigate(['/auth']);
  }
}
