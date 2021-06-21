import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-info-modal',
  templateUrl: './info-modal.component.html',
  styleUrls: ['./info-modal.component.scss'],
})
export class InfoModalComponent {
  lastSaturday = moment().subtract(1, 'weeks').isoWeekday(6).locale('fr');
  environment = environment;
  constructor(public dialogRef: MatDialogRef<InfoModalComponent>) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  openUrl(url) {
    window.open(url, '_blank');
  }
}
