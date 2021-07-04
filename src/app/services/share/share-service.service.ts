import { ComponentHelper } from 'src/app/helpers/componentHelper';
import { GeosmLayersService } from './../geosm/geosm-layers.service';
import { ApiServiceService } from './../api/api-service.service';
import { Injectable } from '@angular/core';
import { StorageServiceService } from '../storage/storage-service.service';
import { MapHelper } from 'src/app/helpers/mapHelper';
import { Feature, Point, GeoJSON, Overlay } from 'src/app/modules/ol';
import { CoucheInterface } from 'src/app/interfaces/coucheInterface';
import * as $ from 'jquery';
import { Coordinate } from 'ol/coordinate';
import { transform } from 'ol/proj';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ShareServiceService {
  constructor(
    public apiService: ApiServiceService,
    public geosmLayerService: GeosmLayersService,
    public storageService: StorageServiceService,
    public componentHelper: ComponentHelper
  ) {}

  shareFeature(
    typeLayer: 'carte' | 'couche',
    id_layer: number,
    group_id: number,
    coordinates: Coordinate,
    featureId: number
  ): string {
    return (
      'feature=' +
      typeLayer +
      ',' +
      id_layer +
      ',' +
      group_id +
      ',' +
      coordinates.join(',') +
      ',' +
      featureId
    );
  }

  displayFeatureShared(parametersShared: Array<any>) {
    for (let index = 0; index < parametersShared.length; index++) {
      const parameterOneFeature = parametersShared[index].split(',');
      if (parameterOneFeature.length == 6) {
        var group_id = parseInt(parameterOneFeature[2]),
          couche_id = parseInt(parameterOneFeature[1]),
          type = parameterOneFeature[0],
          id = parameterOneFeature[5];
        this.addLayersFromUrl([type + ',' + couche_id + ',' + group_id + ',']);

        var mapHelper = new MapHelper();

        setTimeout(() => {
          var layer = mapHelper.getLayerByPropertiesCatalogueGeosm({
            group_id: group_id,
            couche_id: couche_id,
            type: type,
          });
          var tries = 0;
          while (tries < 5 && layer.length == 0) {
            tries++;
            layer = mapHelper.getLayerByPropertiesCatalogueGeosm({
              group_id: group_id,
              couche_id: couche_id,
              type: type,
            });
          }

          var geom = new Point([
            parseFloat(parameterOneFeature[3]),
            parseFloat(parameterOneFeature[4]),
          ]);
          mapHelper.fit_view(geom, 12);

          if (layer.length > 0) {
            var couche: CoucheInterface = this.storageService.getCouche(
              group_id,
              couche_id
            );

            this.getFeatureOSMFromCartoServer(couche, id).then((feature) => {
              if (feature) {
                var propertie = feature.getProperties();
                var geometry = feature.getGeometry();
                this.componentHelper.openDescriptiveSheet(
                  layer[0].get('descriptionSheetCapabilities'),
                  mapHelper.constructAlyerInMap(layer[0]),
                  [
                    parseFloat(parameterOneFeature[3]),
                    parseFloat(parameterOneFeature[4]),
                  ],
                  geometry,
                  propertie
                );
              }
            });
          }
        }, 3000);
      }
    }
  }

  addLayersFromUrl(layers: Array<string>) {
    for (let index = 0; index < layers.length; index++) {
      const element = layers[index].split(',');
      try {
        var type = element[0];
        if (type == 'carte') {
          var carte = this.storageService.getCarte(
            parseInt(element[2]),
            parseInt(element[1])
          );
          if (carte) {
            this.geosmLayerService.addLayerCarte(carte);
            let groupCarte = this.storageService.getGroupCarteFromIdCarte(
              carte.key_couche
            );
            if (groupCarte) {
              this.componentHelper.openGroupCarteSlide(groupCarte);
            }
          }
        } else if (type == 'couche') {
          var couche = this.storageService.getCouche(
            parseInt(element[2]),
            parseInt(element[1])
          );
          if (couche) {
            this.geosmLayerService.addLayerCouche(couche);
            let groupThem = this.storageService.getGroupThematiqueFromIdCouche(
              couche.key_couche
            );
            if (groupThem) {
              this.componentHelper.openGroupThematiqueSlide(groupThem);
              setTimeout(() => {
                try {
                  $('#couche_' + couche.key_couche)[0].scrollIntoView(false);
                } catch (error) {}
              }, 1000);
            }
          }
        }
      } catch (error) {}
    }
  }

  getFeatureOSMFromCartoServer(
    couche: CoucheInterface,
    osmId: number
  ): Promise<Feature> {
    var url =
      couche.url +
      '&SERVICE=WFS&VERSION=1.1.0&REQUEST=GETFEATURE&outputFormat=GeoJSON&typeName=' +
      couche.identifiant +
      '&EXP_FILTER=osm_id=' +
      osmId;

    return this.apiService.getRequestFromOtherHost(url).then(
      (response) => {
        var features = new GeoJSON().readFeatures(response, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857',
        });
        if (features.length == 1) {
          return features[0];
        } else {
          return undefined!;
        }
      },
      (err) => {
        return undefined!;
      }
    );
  }

  shareLayer(
    typeLayer: 'carte' | 'couche',
    id_layer: number,
    group_id: number
  ): string {
    return 'layers=' + typeLayer + ',' + id_layer + ',' + group_id;
  }

  shareLayers(
    layers: Array<{
      typeLayer: 'carte' | 'couche';
      id_layer: number;
      group_id: number;
    }>
  ): string {
    var parameters = Array();
    for (let index = 0; index < layers.length; index++) {
      parameters.push(
        layers[index].typeLayer +
          ',' +
          layers[index].id_layer +
          ',' +
          layers[index].group_id
      );
    }
    return 'layers=' + parameters.join(';');
  }

  displayLocationShared(parametersShared: any, parametersPath: any) {
    for (let index = 0; index < parametersPath.length; index++) {
      const element = parametersPath[index].split(',');
      var lon = parseFloat(element[0]);
      var lat = parseFloat(element[1]);
      var zoom = parseFloat(element[3]);

      var coord = [lon, lat];

      var mapHelper = new MapHelper();

      var coord_caracteri = new Overlay({
        position: coord,
        element: document.getElementById('coord_caracteristics')!,
      });

      mapHelper.map?.addOverlay(coord_caracteri);

      $('#spinner_loading').show();

      $('#coord_caracteristics').show();

      $('#coord_caracteristics').on('mousemove', (evt) => {
        $('#coord_caracteristics .fa-times').show();

        $('#coord_caracteristics .fa-dot-circle').hide();
      });

      $('#coord_caracteristics').on('mouseout', (evt) => {
        $('#coord_caracteristics .fa-times').hide();

        $('#coord_caracteristics .fa-dot-circle').show();
      });

      var coord_4326 = transform(coord!, 'EPSG:3857', 'EPSG:4326');
      var caracteristicsPoint = { display: false };

      caracteristicsPoint['adresse'] = false;
      caracteristicsPoint['position'] = false;

      caracteristicsPoint['coord'] =
        coord_4326[0].toFixed(4) + ' , ' + coord_4326[1].toFixed(4);

      $.post(
        environment.url_prefix + 'getLimite',
        { coord: coord_4326 },
        (data) => {
          caracteristicsPoint['limites_adm'] = [];
          if (typeof data == 'object') {
            for (const key in data) {
              if (data.hasOwnProperty(key) && data[key]) {
                caracteristicsPoint['limites_adm'].push({
                  nom: key,
                  valeur: data[key],
                });
              }
            }
          }

          $('#spinner_loading').hide();

          caracteristicsPoint['display'] = true;
        }
      );

      var geocodeOsm =
        'https://nominatim.openstreetmap.org/reverse?format=json&lat=' +
        coord_4326[1] +
        '&lon=' +
        coord_4326[0] +
        '&zoom=18&addressdetails=1';
      caracteristicsPoint['lieu_dit'] = false;
      $.get(geocodeOsm, (data) => {
        console.log(data);
        var name = data.display_name.split(',')[0];
        var osm_url =
          'https://www.openstreetmap.org/' + data.osm_type + '/' + data.osm_id;
        caracteristicsPoint['lieu_dit'] = name;
        caracteristicsPoint['url_osm'] = osm_url;
      });

      var url_share;
      var notifier;

      this.componentHelper.openCaracteristic({
        properties: caracteristicsPoint,
        geometry: coord,
        map: mapHelper.map!,
        url_share: url_share,
        notif: notifier,
      });
    }
  }
}
