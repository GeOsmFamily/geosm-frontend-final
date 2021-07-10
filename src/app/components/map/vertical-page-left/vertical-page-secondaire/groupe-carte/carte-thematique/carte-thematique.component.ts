import { IpServiceService } from './../../../../../../services/ip-service/ip-service.service';
import { GeosmLayersService } from './../../../../../../services/geosm/geosm-layers.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CarteInterface } from 'src/app/interfaces/carteInterface';
import { environment } from 'src/environments/environment';
import * as $ from 'jquery';

@Component({
  selector: 'app-carte-thematique',
  templateUrl: './carte-thematique.component.html',
  styleUrls: ['./carte-thematique.component.scss'],
})
export class CarteThematiqueComponent implements OnInit {
  @Input() carte: CarteInterface | undefined;

  /**
   * Activat/desactivate carte
   */
  @Output() toogle_carte = new EventEmitter();

  url_prefix = environment.url_prefix;

  constructor(
    public geosmLayersService: GeosmLayersService,
    public ipService: IpServiceService
  ) {}

  ngOnInit(): void {
    this.ipService.getIP();
  }

  toogleLayer(couche: CarteInterface) {
    if (couche.check) {
      this.geosmLayersService.addLayerCarte(couche);
      $.post(
        environment.url_prefix + 'analytics',
        {
          type: 'fond_carte',
          nom_fond_carte: couche.nom,
          ip: this.ipService.getIP(),
        },
        (data) => {
          // data
        }
      );
    } else {
      this.geosmLayersService.removeLayerCarte(couche);
    }
  }
}
