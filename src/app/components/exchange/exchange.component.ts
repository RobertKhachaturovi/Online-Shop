import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-exchange',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './exchange.component.html',
  styleUrls: ['./exchange.component.scss'],
})
export class CurrencyExchangeComponent implements OnInit {
  amount: number | null = null;
  fromCurrency: string = 'GEL';
  toCurrency: string = 'USD';
  convertedAmount: number | null = null;

  inputCleared: boolean = false;

  exchangeRates: { [key: string]: number } = {
    GEL: 1,
    USD: 0.37,
    EUR: 0.34,
  };

  currencies: string[] = ['GEL', 'USD', 'EUR'];

  ngOnInit(): void {
    this.convertCurrency();
  }
  onInputFocus() {
    if (!this.inputCleared) {
      this.amount = null;
      this.inputCleared = true;
    }
  }
  convertCurrency(): void {
    if (!this.amount || this.amount <= 0) {
      this.convertedAmount = null;
      return;
    }

    const amountInGEL = this.amount / this.exchangeRates[this.fromCurrency];
    this.convertedAmount = +(
      amountInGEL * this.exchangeRates[this.toCurrency]
    ).toFixed(2);
  }
}
