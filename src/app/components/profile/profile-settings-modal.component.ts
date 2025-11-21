import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToolsService } from '../../tools.service';

@Component({
  selector: 'app-profile-settings-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-settings-modal.component.html',
  styleUrl: './profile-settings-modal.component.scss',
})
export class ProfileSettingsModalComponent {
  constructor(
    public dialogRef: MatDialogRef<ProfileSettingsModalComponent>,
    public service: ToolsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  close() {
    this.dialogRef.close();
  }
}
