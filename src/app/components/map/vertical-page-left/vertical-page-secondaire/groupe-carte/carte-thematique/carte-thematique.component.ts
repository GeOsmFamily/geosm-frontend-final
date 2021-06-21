import { GeosmLayersService } from './../../../../../../services/geosm/geosm-layers.service';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CarteInterface } from 'src/app/interfaces/carteInterface';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-carte-thematique',
  templateUrl: './carte-thematique.component.html',
  styleUrls: ['./carte-thematique.component.scss'],
})
export class CarteThematiqueComponent {
  @Input() carte: CarteInterface | undefined;

  /**
   * Activat/desactivate carte
   */
  @Output() toogle_carte = new EventEmitter();

  url_prefix = environment.url_prefix;

  constructor(public geosmLayersService: GeosmLayersService) {}

  toogleLayer(couche: CarteInterface) {
    if (couche.check) {
      this.geosmLayersService.addLayerCarte(couche);
    } else {
      this.geosmLayersService.removeLayerCarte(couche);
    }
  }
}
