import { Component, inject, Optional } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToolsService } from '../../tools.service';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-signin',
  imports: [ReactiveFormsModule],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.scss',
})
export class SigninComponent {
  router = inject(Router);
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
      this.service.signin(this.formInfo.value).subscribe((data: any) => {
        sessionStorage.setItem('user', data.access_token);
        this.service.getUser().subscribe((user: any) => {
          if (user && user.email) {
            sessionStorage.setItem('userEmail', user.email);
          }
          this.service.setAuthState(true);
          alert('success');
          if (this.dialogRef) {
            this.dialogRef.close(true);
          } else {
            this.router.navigate(['/']);
          }
        });
      });
    }
  }

  goToSignUp(event: Event) {
    event.preventDefault();
    if (this.dialogRef) {
      this.dialogRef.close('signup');
    } else {
      this.router.navigate(['/auth']);
    }
  }
}
