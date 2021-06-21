import { GeosmLayersService } from './../../../../../../services/geosm/geosm-layers.service';
import { StorageServiceService } from './../../../../../../services/storage/storage-service.service';
import { ApiServiceService } from './../../../../../../services/api/api-service.service';
import { Component, Input } from '@angular/core';
import { MatSelectionListChange } from '@angular/material/list';
import { CoucheInterface } from 'src/app/interfaces/coucheInterface';
import { GroupThematiqueInterface } from 'src/app/interfaces/groupeInterface';

@Component({
  selector: 'app-liste-thematique',
  templateUrl: './liste-thematique.component.html',
  styleUrls: ['./liste-thematique.component.scss'],
})
export class ListeThematiqueComponent {
  @Input() groupThematique: GroupThematiqueInterface | undefined;

  constructor(
    public apiService: ApiServiceService,
    public storageService: StorageServiceService,
    public geosmLayerService: GeosmLayersService
  ) {}

  coucheSelected(event: MatSelectionListChange) {
    let couche: CoucheInterface = event.option.value;
    couche.check = event.option.selected;
    this.toogleLayer(couche);
  }

  toogleLayer(couche: CoucheInterface) {
    if (couche.check) {
      this.geosmLayerService.addLayerCouche(couche);
    } else {
      this.geosmLayerService.removeLayerCouche(couche);
    }
  }
}
