import { CommonModule } from '@angular/common';
import { Component, ViewChild, OnInit } from '@angular/core';
import { Router, RouterOutlet, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './components/home/home.component';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FooterComponent, HeaderComponent, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  @ViewChild(HomeComponent) homeComponent?: HomeComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService
  ) {}
  ngOnInit() {
    this.router.events.subscribe(() => {
      const child = this.route.firstChild;
      if (child) {
        const lang = child.snapshot.params['lang'] || 'ka';
        this.translate.use(lang);
      }
    });
  }
  onCategorySelected(categoryId: number | null) {
    if (!this.homeComponent) return;
    if (categoryId === null) {
      this.homeComponent.allProduct(1);
    } else {
      this.homeComponent.showCategory(categoryId);
    }
  }
  onSearch(value: string) {
    if (this.homeComponent) {
      this.homeComponent.onSearch(value);
    }
  }
  changeLanguage(lang: string) {
    const current = this.router.url.split('/').slice(2).join('/');
    this.router.navigate(['/' + lang + '/' + current]);
  }
}
