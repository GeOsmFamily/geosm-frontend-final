import { IpServiceService } from './../../../../../../services/ip-service/ip-service.service';
import { GeosmLayersService } from './../../../../../../services/geosm/geosm-layers.service';
import { StorageServiceService } from './../../../../../../services/storage/storage-service.service';
import { ApiServiceService } from './../../../../../../services/api/api-service.service';
import { Component, Input, OnInit } from '@angular/core';
import { MatSelectionListChange } from '@angular/material/list';
import { CoucheInterface } from 'src/app/interfaces/coucheInterface';
import { GroupThematiqueInterface } from 'src/app/interfaces/groupeInterface';
import * as $ from 'jquery';
import { environment } from 'src/environments/environment';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';

@Component({
  selector: 'app-liste-thematique',
  templateUrl: './liste-thematique.component.html',
  styleUrls: ['./liste-thematique.component.scss'],
})
export class ListeThematiqueComponent implements OnInit {
  @Input() groupThematique: GroupThematiqueInterface | undefined;

  constructor(
    public apiService: ApiServiceService,
    public storageService: StorageServiceService,
    public geosmLayerService: GeosmLayersService,
    public ipService: IpServiceService,
    public analyticService: AnalyticsService
  ) {}

  ngOnInit(): void {
    this.ipService.getIP();
  }

  coucheSelected(event: MatSelectionListChange) {
    let couche: CoucheInterface = event.option.value;
    couche.check = event.option.selected;
    this.toogleLayer(couche);
    $.post(
      environment.url_prefix + 'analytics',
      {
        type: 'sous_thematique',
        nom_sous_thematique: couche.nom,
        ip: this.ipService.getIP(),
      },
      (data) => {
        // data
      }
    );
    this.analyticService.addAnalytics({
      type: 'couche',
      name: couche.nom,
      ip: this.ipService.getIP(),
    });
  }

  toogleLayer(couche: CoucheInterface) {
    if (couche.check) {
      this.geosmLayerService.addLayerCouche(couche);
    } else {
      this.geosmLayerService.removeLayerCouche(couche);
    }
  }
}
