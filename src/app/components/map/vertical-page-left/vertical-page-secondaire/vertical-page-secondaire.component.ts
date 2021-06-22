import { Component } from '@angular/core';
import { GroupCarteInterface } from 'src/app/interfaces/carteInterface';
import {
  GroupInterface,
  GroupThematiqueInterface,
} from 'src/app/interfaces/groupeInterface';
import { environment } from 'src/environments/environment';
import * as $ from 'jquery';

@Component({
  selector: 'app-vertical-page-secondaire',
  templateUrl: './vertical-page-secondaire.component.html',
  styleUrls: ['./vertical-page-secondaire.component.scss'],
})
export class VerticalPageSecondaireComponent {
  groupCarte: GroupCarteInterface | undefined;

  groupThematique: GroupThematiqueInterface | undefined;

  activeGroup: GroupInterface | undefined;

  constructor() {}

  setGroupCarte(groupCarte: GroupCarteInterface) {
    this.clearAllGroup();
    this.groupCarte = groupCarte;
    var img = this.groupCarte.img;
    if (groupCarte.principal) {
      img = '/assets/icones/fondsCarte.svg';
    } else {
      img = '/assets/icones/geobibliotheque.svg';
    }
    this.activeGroup = {
      nom: this.groupCarte.nom,
      img: img,
      color: environment.primaryColor,
    };
  }

  setGroupThematique(groupThematique: GroupThematiqueInterface) {
    this.clearAllGroup();
    this.groupThematique = groupThematique;
    this.activeGroup = {
      nom: this.groupThematique.nom,
      img: environment.url_prefix + this.groupThematique.img,
      color: this.groupThematique.color,
    };
  }

  clearAllGroup() {
    this.groupCarte = undefined;
    this.groupThematique = undefined;
    this.activeGroup = undefined;
  }

  //A revoir
  close() {
    this.clearAllGroup();
    $('app-vertical-page-secondaire').css('left', '-260px');
  }

  //A revoir
  open() {
    $('app-vertical-page-secondaire').css('left', '0px');
  }
}
