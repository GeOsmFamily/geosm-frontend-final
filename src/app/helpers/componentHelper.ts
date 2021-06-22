import { VerticalPageSecondaireComponent } from './../components/map/vertical-page-left/vertical-page-secondaire/vertical-page-secondaire.component';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InfoModalComponent } from '../components/modal/info-modal/info-modal.component';
import { GroupCarteInterface } from '../interfaces/carteInterface';
import { GroupThematiqueInterface } from '../interfaces/groupeInterface';

@Injectable({
  providedIn: 'root',
})
export class ComponentHelper {
  verticalPageSecondaire: VerticalPageSecondaireComponent | undefined;
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

  openGroupCarteSlide(groupCarte: GroupCarteInterface) {
    this.verticalPageSecondaire?.setGroupCarte(groupCarte);
    this.verticalPageSecondaire?.open();
  }

  openGroupThematiqueSlide(groupThematique: GroupThematiqueInterface) {
    this.verticalPageSecondaire?.setGroupThematique(groupThematique);
    this.verticalPageSecondaire?.open();
  }

  setComponent(component: string, comp: any) {
    if (component == 'VerticalPageSecondaireComponent') {
      this.verticalPageSecondaire = comp;
    }
  }
}
