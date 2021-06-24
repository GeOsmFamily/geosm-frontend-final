import { StorageServiceService } from './../../../../services/storage/storage-service.service';
import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { LayersInMap } from 'src/app/interfaces/layersInMapInterface';
import { Map } from 'src/app/modules/ol';
import { MapHelper } from 'src/app/helpers/mapHelper';
import * as $ from 'jquery';

@Component({
  selector: 'app-legends',
  templateUrl: './legends.component.html',
  styleUrls: ['./legends.component.scss'],
})
export class LegendsComponent implements OnInit {
  @Input() map: Map | undefined;

  layersInTocWithLegend: Array<LayersInMap> = [];

  constructor(
    public domSanitizer: DomSanitizer,
    public storageService: StorageServiceService
  ) {}

  ngOnInit(): void {
    this.map?.getLayers().on('propertychange', (ObjectEvent) => {
      this.getAllLayersForTOC();
    });
  }

  getAllLayersForTOC() {
    let mapHelper = new MapHelper();

    let reponseLayers: Array<LayersInMap> = [];
    for (let index = 0; index < mapHelper.getAllLayersInToc().length; index++) {
      const layerProp = mapHelper.getAllLayersInToc()[index];
      if (
        layerProp.legendCapabilities &&
        layerProp['type_layer'] == 'geosmCatalogue'
      ) {
        if (layerProp.legendCapabilities.useCartoServer) {
          var url;
          var identifiant;
          if (layerProp['properties']!['type'] == 'couche') {
            var couche = this.storageService.getCouche(
              layerProp['properties']!['group_id'],
              layerProp['properties']!['couche_id']
            );
            url = couche ? couche.url : undefined;
            identifiant = couche ? couche.identifiant : undefined;
          } else if (layerProp['properties']!['type'] == 'carte') {
            var carte = this.storageService.getCarte(
              layerProp['properties']!['group_id'],
              layerProp['properties']!['couche_id']
            );
            url = carte ? carte.url : undefined;
            identifiant = couche! ? couche.identifiant : undefined;
          }
          if (url && identifiant) {
            layerProp.legendCapabilities.urlImg = $.trim(
              url +
                '&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&FORMAT=image%2Fpng&TRANSPARENT=true&LAYERS=' +
                identifiant +
                '&STYLE=default&SLD_VERSION=1.1.0&LAYERTITLE=false&RULELABEL=true'
            );
            console.log(layerProp.legendCapabilities.urlImg);
          }
        }

        if (layerProp.legendCapabilities.urlImg) {
          reponseLayers.push(layerProp);
        }
      }
    }

    function compare(a, b) {
      if (a.zIndex < b.zIndex) {
        return 1;
      }
      if (a.zIndex > b.zIndex) {
        return -1;
      }
      return 0;
    }
    this.layersInTocWithLegend = reponseLayers;

    this.layersInTocWithLegend.sort(compare);
  }
}
