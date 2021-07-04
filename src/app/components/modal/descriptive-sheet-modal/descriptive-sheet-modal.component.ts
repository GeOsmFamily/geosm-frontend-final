import { ComponentHelper } from 'src/app/helpers/componentHelper';
import { ShareServiceService } from './../../../services/share/share-service.service';
import { StorageServiceService } from 'src/app/services/storage/storage-service.service';
import { DataHelper } from './../../../helpers/dataHelper';
import {
  Component,
  Inject,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  CircleStyle,
  Feature,
  Fill,
  Stroke,
  Style,
  VectorLayer,
  VectorSource,
} from 'src/app/modules/ol';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DescriptiveSheet } from 'src/app/interfaces/DescriptiveSheet';
import { MapHelper } from 'src/app/helpers/mapHelper';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-descriptive-sheet-modal',
  templateUrl: './descriptive-sheet-modal.component.html',
  styleUrls: ['./descriptive-sheet-modal.component.scss'],
})
export class DescriptiveSheetModalComponent implements OnInit, OnChanges {
  imgSrc: string | undefined;

  highlightLayer: VectorLayer = new VectorLayer({
    source: new VectorSource(),
    style: (feature) => {
      var color = '#f44336';
      return new Style({
        fill: new Fill({
          color: [
            DataHelper.hexToRgb(color)!.r,
            DataHelper.hexToRgb(color)!.g,
            DataHelper.hexToRgb(color)!.b,
            0.5,
          ],
        }),
        stroke: new Stroke({
          color: color,
          width: 6,
        }),
        image: new CircleStyle({
          radius: 11,
          stroke: new Stroke({
            color: color,
            width: 4,
          }),
          fill: new Fill({
            color: [
              DataHelper.hexToRgb(color)!.r,
              DataHelper.hexToRgb(color)!.g,
              DataHelper.hexToRgb(color)!.b,
              0.5,
            ],
          }),
        }),
      });
    },
    //@ts-ignore
    type_layer: 'highlightFeature',
    nom: 'highlightFeature',
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (this.descriptiveModel.geometry) {
      this.loadGeometryInHightLightLayer();
    }
  }

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public descriptiveModel: DescriptiveSheet,
    public storageService: StorageServiceService,
    public dialogRef: MatDialogRef<DescriptiveSheetModalComponent>,
    public shareService: ShareServiceService,
    public componentHelper: ComponentHelper
  ) {}

  ngOnInit(): void {
    this.initialiseHightLightMap();

    if (this.descriptiveModel?.layer?.properties!['type'] == 'couche') {
      this.imgSrc =
        environment.url_prefix +
        this.storageService.getCouche(
          this.descriptiveModel.layer.properties['group_id'],
          this.descriptiveModel.layer.properties['couche_id']
        ).img;
    } else if (this.descriptiveModel?.layer?.properties!['type'] == 'carte') {
      this.imgSrc =
        environment.url_prefix +
        this.storageService.getCarte(
          this.descriptiveModel.layer.properties['group_id'],
          this.descriptiveModel.layer.properties['couche_id']
        ).image_src;
    }

    if (this.descriptiveModel.geometry) {
      this.loadGeometryInHightLightLayer();
    }
  }

  loadGeometryInHightLightLayer() {
    if (this.descriptiveModel.geometry) {
      var feature = new Feature();
      feature.setGeometry(this.descriptiveModel.geometry);

      this.highlightLayer.getSource().addFeature(feature);
    }
  }

  initialiseHightLightMap() {
    var mapHelper = new MapHelper();
    if (mapHelper.getLayerByName('highlightFeature').length > 0) {
      this.highlightLayer = mapHelper.getLayerByName('highlightFeature')[0];
      this.highlightLayer.setZIndex(1000);
    } else {
      this.highlightLayer.setZIndex(1000);
      mapHelper.map?.addLayer(this.highlightLayer);
    }

    if (mapHelper.getLayerByName('highlightFeature').length > 0) {
      mapHelper.getLayerByName('highlightFeature')[0].getSource().clear();
    }
  }

  closeModal(): void {
    var mapHelper = new MapHelper();

    if (mapHelper.getLayerByName('highlightFeature').length > 0) {
      mapHelper.getLayerByName('highlightFeature')[0].getSource().clear();
    }

    this.dialogRef.close();
  }

  shareFeature() {
    var url = this.descriptiveModel.getShareUrl!(
      environment,
      this.shareService
    )!;
    this.componentHelper.openSocialShare(url);
  }

  zoomOnFeatureExtent() {
    if (this.descriptiveModel.geometry) {
      var extent = this.descriptiveModel.geometry.getExtent();
      var mapHelper = new MapHelper();
      mapHelper.fit_view(extent, 16);
    }
  }

  setSescriptiveModel(data: DescriptiveSheet) {
    this.descriptiveModel = data;
    if (this.descriptiveModel.geometry) {
      this.loadGeometryInHightLightLayer();
    }
  }
}
