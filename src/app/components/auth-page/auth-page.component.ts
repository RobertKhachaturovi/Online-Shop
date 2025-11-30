import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SigninComponent } from '../signin/signin.component';
import { SignupComponent } from '../signup/signup.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, SigninComponent, SignupComponent, TranslateModule],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.scss',
})
export class AuthPageComponent {
  showSignIn = true;

  toggleForm() {
    this.showSignIn = !this.showSignIn;
  }
}
