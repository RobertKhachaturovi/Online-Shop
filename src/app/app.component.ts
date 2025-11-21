import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { SideDrawerComponent } from './components/side-drawer/side-drawer.component';
import { HomeComponent } from './components/home/home.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FooterComponent, HeaderComponent, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  @ViewChild(HomeComponent) homeComponent?: HomeComponent;

  onCategorySelected(categoryId: number | null) {
    if (!this.homeComponent) return;
    if (categoryId === null) {
      this.homeComponent.allProduct(1);
    } else {
      this.homeComponent.showCategory(categoryId);
    }
  }

  onSearch(value: string) {
    console.log(
      'App search:',
      value,
      'HomeComponent exists:',
      !!this.homeComponent
    );
    if (this.homeComponent) {
      this.homeComponent.onSearch(value);
    }
  }
}
