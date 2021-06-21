import { GeosmLayersService } from './../../../../../../../services/geosm/geosm-layers.service';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CoucheInterface } from 'src/app/interfaces/coucheInterface';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-couche-thematique',
  templateUrl: './couche-thematique.component.html',
  styleUrls: ['./couche-thematique.component.scss'],
})
export class CoucheThematiqueComponent {
  @Input() couche: CoucheInterface | undefined;

  @Output() toogle_couche = new EventEmitter();

  url_prefix = environment.url_prefix;

  constructor(public geosmLayerService: GeosmLayersService) {}

  disabled_couche(couche: CoucheInterface): boolean {
    if (
      couche['wms_type'] == 'osm' &&
      (couche['number'] == 0 || couche['number'] == null)
    ) {
      return true;
    } else {
      return false;
    }
  }

  toogleLayer(couche: CoucheInterface) {
    console.log(couche, 2);
    if (couche.check) {
      this.geosmLayerService.addLayerCouche(couche);
    } else {
      this.geosmLayerService.removeLayerCouche(couche);
    }
  }
}
