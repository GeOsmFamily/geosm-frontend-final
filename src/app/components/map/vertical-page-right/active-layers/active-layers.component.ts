import { ComponentHelper } from 'src/app/helpers/componentHelper';
import { ShareServiceService } from './../../../../services/share/share-service.service';
import { MatDialog } from '@angular/material/dialog';
import { StorageServiceService } from './../../../../services/storage/storage-service.service';
import { Component, Input, OnInit } from '@angular/core';
import { fromEvent, Observable, merge as observerMerge } from 'rxjs';
import { MapHelper } from 'src/app/helpers/mapHelper';
import { LayersInMap } from 'src/app/interfaces/layersInMapInterface';
import { Map } from 'src/app/modules/ol';
import { debounceTime, map } from 'rxjs/operators';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MetadataModalComponent } from 'src/app/components/modal/metadata-modal/metadata-modal.component';
import { environment } from 'src/environments/environment';
import { CarteInterface } from 'src/app/interfaces/carteInterface';
import { CoucheInterface } from 'src/app/interfaces/coucheInterface';
import { MatSliderChange } from '@angular/material/slider';
import { MatCheckboxChange } from '@angular/material/checkbox';
@Component({
  selector: 'app-active-layers',
  templateUrl: './active-layers.component.html',
  styleUrls: ['./active-layers.component.scss'],
})
export class ActiveLayersComponent implements OnInit {
  @Input() map: Map | undefined;

  @Input() modeMapillary;

  layersInToc: Array<LayersInMap> = [];
  layerChange: Observable<any> = new Observable();

  constructor(
    public storageService: StorageServiceService,
    public dialog: MatDialog,
    public shareService: ShareServiceService,
    public componentHelper: ComponentHelper
  ) {}

  ngOnInit(): void {
    this.map?.getLayers().on('propertychange', (ObjectEvent) => {
      this.getAllLayersForTOC();
    });
  }

  getAllLayersForTOC() {
    let mapHelper = new MapHelper();

    let reponseLayers: Array<LayersInMap> = mapHelper.getAllLayersInToc();
    let allObservableOFLayers: Array<Observable<any>> = [];
    for (let index = 0; index < reponseLayers.length; index++) {
      const layerProp = reponseLayers[index];
      if (layerProp['type_layer'] == 'geosmCatalogue') {
        if (layerProp['properties']!['type'] == 'couche') {
          if (
            this.storageService.getGroupThematiqueById(
              layerProp['properties']!['group_id']
            )
          ) {
            layerProp.badge = {
              text: this.storageService.getGroupThematiqueById(
                layerProp['properties']!['group_id']
              ).nom,
              bgColor: this.storageService.getGroupThematiqueById(
                layerProp['properties']!['group_id']
              ).color!,
            };
          }
          layerProp['data'] = this.storageService.getCouche(
            layerProp['properties']!['group_id'],
            layerProp['properties']!['couche_id']
          );
        } else if (layerProp['properties']!['type'] == 'carte') {
          if (
            this.storageService.getGroupcarteById(
              layerProp['properties']!['group_id']
            )
          ) {
            layerProp.badge = {
              text: this.storageService.getGroupcarteById(
                layerProp['properties']!['group_id']
              ).nom,
              bgColor: this.storageService.getGroupcarteById(
                layerProp['properties']!['group_id']
              ).color!,
            };
          }
          layerProp['data'] = this.storageService.getCarte(
            layerProp['properties']!['group_id'],
            layerProp['properties']!['couche_id']
          );
        }
      }
      allObservableOFLayers.push(
        fromEvent(layerProp.layer, 'change:visible').pipe(map((value) => value))
      );
      allObservableOFLayers.push(
        fromEvent(layerProp.layer, 'change:zIndex').pipe(map((value) => value))
      );
      allObservableOFLayers.push(
        fromEvent(layerProp.layer, 'change:opacity').pipe(map((value) => value))
      );
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
    this.layersInToc = reponseLayers;
    if (allObservableOFLayers.length > 0) {
      this.layerChange = undefined!;
      this.layerChange = observerMerge(...allObservableOFLayers);
      this.layerChange.pipe(debounceTime(1000)).subscribe((response) => {
        this.layersInToc.sort(compare);
      });
    }
    this.layersInToc.sort(compare);
  }

  drop(event: CdkDragDrop<string[]>) {
    let mapHelper = new MapHelper();
    var layer = this.layersInToc[event.previousIndex];
    mapHelper.editZindexOfLayer(
      layer.layer,
      this.layersInToc[event.currentIndex].zIndex
    );

    moveItemInArray(this.layersInToc, event.previousIndex, event.currentIndex);

    this.getAllLayersForTOC();
    console.log(this.layersInToc);
  }

  openMetadata(layer: LayersInMap) {
    var metadata;
    var wms_type;
    if (layer['properties']!['type'] == 'carte') {
      var carte = this.storageService.getCarte(
        layer.properties!['group_id'],
        layer.properties!['couche_id']
      );
      metadata = carte.metadata;
    } else if (layer['properties']!['type'] == 'couche') {
      var couche = this.storageService.getCouche(
        layer.properties!['group_id'],
        layer.properties!['couche_id']
      );
      metadata = couche.metadata;
      wms_type = couche.wms_type;
    }

    if (this.displayMetadataLink(metadata) || wms_type == 'osm') {
      const MetaData = this.dialog.open(MetadataModalComponent, {
        minWidth: '350px',
        data: {
          exist: true,
          metadata: metadata,
          nom: carte! ? carte.nom : couche!.nom,
          url_prefix: environment.url_prefix,
          data: carte! ? carte : couche!,
        },
      });

      MetaData.afterClosed().subscribe((result) => {});
    } else {
      const MetaData = this.dialog.open(MetadataModalComponent, {
        minWidth: '350px',
        data: {
          exist: false,
          metadata: metadata,
          nom: carte! ? carte.nom : couche!.nom,
          url_prefix: environment.url_prefix,
          data: carte! ? carte : couche!,
        },
      });
    }
  }

  displayMetadataLink(metadata) {
    if (Array.isArray(metadata)) {
      return false;
    } else {
      return true;
    }
  }

  shareLayer(layer: LayersInMap) {
    var params = this.shareService.shareLayer(
      layer.properties!['type'],
      layer.properties!['couche_id'],
      layer.properties!['group_id']
    );
    var url_share = environment.url_frontend + '?' + params;
    this.componentHelper.openSocialShare(url_share, 7);
  }

  removeLayer(layer: LayersInMap) {
    if (layer.type_layer == 'geosmCatalogue') {
      this.removeLayerCatalogue(layer);
    } else {
      let mapHelper = new MapHelper();
      mapHelper.removeLayerToMap(layer.layer);
    }
  }

  removeLayerCatalogue(layer: LayersInMap) {
    var mapHelper = new MapHelper();
    if (layer['properties']!['type'] == 'carte') {
      var carte: CarteInterface = this.storageService.getCarte(
        layer.properties!['group_id'],
        layer.properties!['couche_id']
      );
      if (carte) {
        carte.check = false;
      }
    } else if (layer['properties']!['type'] == 'couche') {
      var couche: CoucheInterface = this.storageService.getCouche(
        layer.properties!['group_id'],
        layer.properties!['couche_id']
      );
      if (couche) {
        couche.check = false;
      }
    }

    mapHelper.removeLayerToMap(layer.layer);
  }

  setOpactiyOfLayer(event: MatSliderChange, layer: LayersInMap) {
    layer.layer.setOpacity(event.value! / 100);
  }

  setVisibleOfLayer(event: MatCheckboxChange, layer: LayersInMap) {
    layer.layer.setVisible(event.checked);
  }

  shareAllLayersInToc() {
    var pteToGetParams = Array();
    for (let index = 0; index < this.layersInToc.length; index++) {
      const layer = this.layersInToc[index];
      if (layer.activeLayers.share) {
        pteToGetParams.push({
          typeLayer: layer.properties!['type'],
          id_layer: layer.properties!['couche_id'],
          group_id: layer.properties!['group_id'],
        });
      }
    }
    var params = this.shareService.shareLayers(pteToGetParams);
    var url_share = environment.url_frontend + '?' + params;
    this.componentHelper.openSocialShare(url_share, 7);
  }

  clearMap() {
    let mapHelper = new MapHelper();

    let reponseLayers: Array<LayersInMap> = mapHelper.getAllLayersInToc();
    for (let index = 0; index < reponseLayers.length; index++) {
      const layer = reponseLayers[index];
      if (layer['properties']!['type'] == 'carte') {
        var carte = this.storageService.getCarte(
          layer['properties']!['group_id'],
          layer['properties']!['couche_id']
        );
        if (!carte.principal) {
          this.removeLayer(layer);
        }
      } else if (layer.nom == 'Mapillary') {
        console.log('t');
        this.modeMapillary = !this.modeMapillary;
        this.removeLayer(layer);
      } else {
        this.removeLayer(layer);
      }
    }
  }
}
