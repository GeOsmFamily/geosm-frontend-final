import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InfoModalComponent } from '../components/modal/info-modal/info-modal.component';

@Injectable({
  providedIn: 'root',
})
export class ComponentHelper {
  constructor(public dialog: MatDialog) {}

  openModalInfo(size: Array<string> | []) {
    var proprietes = {
      disableClose: false,
      minWidth: 400,
    };

    if (size.length > 0) {
      proprietes['width'] = size[0];
      proprietes['height'] = size[1];
    }
    this.dialog.open(InfoModalComponent, proprietes);
  }
}
