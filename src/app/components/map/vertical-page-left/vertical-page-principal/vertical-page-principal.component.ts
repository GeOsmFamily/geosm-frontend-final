import { Map } from 'src/app/modules/ol';
import { StorageServiceService } from './../../../../services/storage/storage-service.service';
import { Component, Input, OnInit } from '@angular/core';
import {
  CarteInterface,
  GroupCarteInterface,
} from 'src/app/interfaces/carteInterface';
import { MapHelper } from 'src/app/helpers/mapHelper';
import { environment } from 'src/environments/environment';
import { GroupThematiqueInterface } from 'src/app/interfaces/groupeInterface';
import { ComponentHelper } from 'src/app/helpers/componentHelper';

@Component({
  selector: 'app-vertical-page-principal',
  templateUrl: './vertical-page-principal.component.html',
  styleUrls: ['./vertical-page-principal.component.scss'],
})
export class VerticalPagePrincipalComponent implements OnInit {
  donnePrincipalMap:
    | {
        groupCarte: GroupCarteInterface;
        carte: CarteInterface;
      }
    | null
    | undefined;

  environment;

  ghostMap;
  @Input() map: Map | undefined;

  constructor(
    public storageService: StorageServiceService,
    public componentHelper: ComponentHelper
  ) {}

  ngOnInit(): void {
    this.loadPrincipalMapLayer();
  }

  loadPrincipalMapLayer() {
    this.ghostMap = new Map({
      target: 'ghostMap',
      layers: [],
      view: this.map?.getView(),
    });

    this.storageService.states.subscribe((value) => {
      if (value.loadProjectData) {
        this.addLayerShadow();
        this.tooglePrincipalMapLayer();
      }
    });
  }

  //Ajouter le shadow background a la carte
  addLayerShadow() {
    var mapHelper = new MapHelper();
    var layer = mapHelper.constructShadowLayer(
      this.storageService.getConfigProjet().roiGeojson
    );
    layer.setZIndex(1000);
    this.map?.addLayer(layer);
  }

  openGroupCarteSlide(groupCarte: GroupCarteInterface) {
    this.componentHelper.openGroupCarteSlide(groupCarte);
  }

  tooglePrincipalMapLayer() {
    this.donnePrincipalMap = this.storageService.getPrincipalCarte();
    if (this.donnePrincipalMap) {
      if (this.donnePrincipalMap.carte.check) {
        this.removePrincipalMapLayer();
      } else {
        this.addPrincipalMapLayer();
      }
    }
  }

  addPrincipalMapLayer() {
    var mapHelper = new MapHelper();
    this.donnePrincipalMap = this.storageService.getPrincipalCarte();

    if (this.donnePrincipalMap) {
      let groupCarte = this.donnePrincipalMap.groupCarte;
      let carte = this.donnePrincipalMap.carte;
      this.donnePrincipalMap.carte.check = true;
      var type;
      if (carte.type == 'WMS') {
        type = 'wms';
      } else if (carte.type == 'xyz') {
        type = 'xyz';
      }
      var layer = mapHelper.constructLayer({
        nom: carte.nom,
        type: type,
        type_layer: 'geosmCatalogue',
        url: carte.url,
        visible: true,
        inToc: true,
        properties: {
          group_id: groupCarte.id_cartes,
          couche_id: carte.key_couche,
          type: 'carte',
        },
        activeLayers: {
          share: false,
          metadata: true,
          opacity: true,
        },
        iconImagette: environment.url_prefix + '/' + carte.image_src,
        descriptionSheetCapabilities: undefined!,
      });

      var layerGhost = new MapHelper(this.ghostMap).constructLayer({
        nom: carte.nom,
        type: type,
        type_layer: 'geosmCatalogue',
        url: carte.url,
        visible: true,
        inToc: true,
        properties: {
          group_id: groupCarte.id_cartes,
          couche_id: carte.key_couche,
          type: 'carte',
        },
        activeLayers: {
          share: false,
          metadata: true,
          opacity: true,
        },
        descriptionSheetCapabilities: undefined!,
      });

      this.ghostMap.addLayer(layerGhost);
      mapHelper.addLayerToMap(layer);
    } else {
      // Implement else
    }
  }

  removePrincipalMapLayer() {
    this.donnePrincipalMap = this.storageService.getPrincipalCarte();
    var mapHelper = new MapHelper(this.map);
    this.donnePrincipalMap!.carte.check = false;
    var layer = mapHelper.getLayerByPropertiesCatalogueGeosm({
      group_id: this.donnePrincipalMap!.groupCarte.id_cartes,
      couche_id: this.donnePrincipalMap!.carte.key_couche,
      type: 'carte',
    });
    for (let index = 0; index < layer.length; index++) {
      mapHelper.removeLayerToMap(layer[index]);
    }
  }

  displayLabelForBibliothequeArborescence() {
    if (this.storageService.getAllGroupCarte().length > 1) {
      return true;
    } else if (
      this.storageService.getAllGroupCarte().length == 1 &&
      this.storageService.getAllGroupCarte()[0].id_cartes !=
        this.donnePrincipalMap?.groupCarte.id_cartes
    ) {
      return true;
    } else {
      return false;
    }
  }

  openGroupThematiqueSlide(groupThematique: GroupThematiqueInterface) {
    this.componentHelper.openGroupThematiqueSlide(groupThematique);
  }
}
