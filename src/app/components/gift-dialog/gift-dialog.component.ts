import { Component } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-gift-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, TranslateModule],
  templateUrl: './gift-dialog.component.html',
  styleUrls: ['./gift-dialog.component.scss'],
})
export class GiftDialogComponent {
  constructor(private dialogRef: MatDialogRef<GiftDialogComponent>) {}

  close(answer: 'yes' | 'no') {
    this.dialogRef.close(answer);
  }
}
