import { Injectable } from '@angular/core';
import { NotifierService } from 'angular-notifier';
import { MapHelper } from 'src/app/helpers/mapHelper';
import { CarteInterface } from 'src/app/interfaces/carteInterface';
import { CoucheInterface } from 'src/app/interfaces/coucheInterface';
import { environment } from 'src/environments/environment';
import { StorageServiceService } from '../storage/storage-service.service';

@Injectable({
  providedIn: 'root',
})
export class GeosmLayersService {
  private readonly notifier: NotifierService;

  constructor(
    public storageService: StorageServiceService,
    notifierService: NotifierService
  ) {
    this.notifier = notifierService;
  }

  addLayerCarte(carte: CarteInterface) {
    var groupCarte = this.storageService.getGroupCarteFromIdCarte(
      carte.key_couche
    );

    let mapHelper = new MapHelper();
    var type;
    if (carte.type == 'WMS') {
      type = 'wms';
    } else if (carte.type == 'xyz') {
      type = 'xyz';
    }
    if (mapHelper.getLayerByName(carte.nom).length > 0) {
      this.notifier.notify('error', 'Cette carte est déja ajoutée à la carte');
    } else {
      var layer = mapHelper.constructLayer({
        nom: carte.nom,
        type: type,
        type_layer: 'geosmCatalogue',
        url: carte.url,
        visible: true,
        inToc: true,
        properties: {
          group_id: groupCarte?.id_cartes,
          couche_id: carte.key_couche,
          type: 'carte',
        },
        iconImagette: environment.url_prefix + carte.image_src,
        descriptionSheetCapabilities: undefined!,
      });

      mapHelper.addLayerToMap(layer);
      carte.check = true;
    }
  }

  removeLayerCarte(carte: CarteInterface) {
    var groupCarte = this.storageService.getGroupCarteFromIdCarte(
      carte.key_couche
    );

    let mapHelper = new MapHelper();

    var layer = mapHelper.getLayerByPropertiesCatalogueGeosm({
      group_id: groupCarte?.id_cartes!,
      couche_id: carte.key_couche,
      type: 'carte',
    });

    for (let index = 0; index < layer.length; index++) {
      mapHelper.removeLayerToMap(layer[index]);
      carte.check = false;
    }
  }

  addLayerCouche(couche: CoucheInterface) {
    let mapHelper = new MapHelper();
    var groupThematique = this.storageService.getGroupThematiqueFromIdCouche(
      couche.key_couche
    );
    if (mapHelper.getLayerByName(couche.nom).length > 0) {
      this.notifier.notify('error', 'Cette couche est déja ajoutée à la carte');
    } else {
      this.geDimensionsOfImage(
        environment.url_prefix + couche.img,
        (dimension: { width: number; height: number }) => {
          let size = 0.4;

          if (dimension) {
            size = 40 / dimension.width;
          }

          var pathImg = couche.logo_src ? couche.logo_src : couche.img;
          var layer = mapHelper.constructLayer({
            nom: couche.nom,
            type: couche.service_wms == false ? 'wfs' : couche.type_couche,
            identifiant: couche.identifiant,
            type_layer: 'geosmCatalogue',
            url: couche.url,
            visible: true,
            inToc: true,
            properties: {
              group_id: groupThematique.id_thematique,
              couche_id: couche.key_couche,
              type: 'couche',
            },
            iconImagette: environment.url_prefix + pathImg,
            icon: environment.url_prefix + couche.img,
            cluster: true,
            size: size,
            legendCapabilities: {
              useCartoServer: true,
            },
            descriptionSheetCapabilities: couche.wms_type ? 'osm' : undefined!,
          });
          mapHelper.addLayerToMap(layer);
          couche.check = true;
        }
      );
    }
  }

  geDimensionsOfImage(
    urlImage: string,
    callBack: (dimenions: { width: number; height: number }) => void
  ) {
    try {
      var img = new Image();
      img.onload = function () {
        callBack({ width: img.width, height: img.height });
      };
      img.src = urlImage;
    } catch (error) {
      callBack(null!);
    }
  }

  removeLayerCouche(couche: CoucheInterface) {
    var groupThematique = this.storageService.getGroupThematiqueFromIdCouche(
      couche.key_couche
    );

    let mapHelper = new MapHelper();

    var layer = mapHelper.getLayerByPropertiesCatalogueGeosm({
      group_id: groupThematique.id_thematique,
      couche_id: couche.key_couche,
      type: 'couche',
    });
    for (let index = 0; index < layer.length; index++) {
      mapHelper.removeLayerToMap(layer[index]);
      couche.check = false;
    }
  }
}
