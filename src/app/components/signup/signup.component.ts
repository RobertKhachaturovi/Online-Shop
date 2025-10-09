import { Component, inject, Optional } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ToolsService } from '../../tools.service';
import { Router } from '@angular/router';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  router = inject(Router);

  constructor(
    public service: ToolsService,
    @Optional() public dialogRef: MatDialogRef<any>
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
        alert('გთხოვთ შეავსოთ ყველა ველი!');
        return;
      }
    }

    const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailPattern.test(formData.email)) {
      alert('ელ.ფოსტა არასწორი ფორმატითაა!');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert('პაროლები არ ემთხვევა!');
      return;
    }

    if (isNaN(Number(formData.age)) || Number(formData.age) < 1) {
      alert('ასაკი უნდა იყოს დადებითი რიცხვი!');
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
                this.router.navigate(['/profile']);
              }
            });
          } else {
            alert('Signup successful but no token received');
          }
        },
        error: (err) => {
          let msg = 'Signup failed.';
          if (err.error && err.error.message) {
            msg = err.error.message;
          } else if (err.error && typeof err.error === 'object') {
            msg = JSON.stringify(err.error);
          } else if (err.status === 0) {
            msg = 'Network error: Cannot connect to server';
          } else if (err.status === 400) {
            msg = 'Bad request: Please check your input data';
          } else if (err.status === 409) {
            msg = 'User already exists with this email';
          }
          alert(msg);
        },
      });
    } else {
      alert('გთხოვთ შეავსოთ ყველა ველი სწორად');
    }
  }

  goToSignIn(event: Event) {
    event.preventDefault();
    if (this.dialogRef) {
      this.dialogRef.close('signin');
    } else {
      this.router.navigate(['/auth']);
    }
  }

  closeModal() {
    if (this.dialogRef) {
      this.dialogRef.close();
    } else {
      this.router.navigate(['/']);
    }
  }
}
