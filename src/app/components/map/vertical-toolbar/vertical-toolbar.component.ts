import { StorageServiceService } from './../../../services/storage/storage-service.service';
import { Component, Input, OnInit, NgZone } from '@angular/core';
import { MatSidenavContainer } from '@angular/material/sidenav';
import { MapHelper } from 'src/app/helpers/mapHelper';
import {
  Feature,
  Map,
  Overlay,
  Point,
  Stroke,
  Style,
  GeoJSON,
  VectorLayer,
  CircleStyle,
  Fill,
  VectorSource,
} from 'src/app/modules/ol';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { ZoomModalComponent } from '../../modal/zoom-modal/zoom-modal.component';
import { transform } from 'ol/proj';
import bboxPolygon from '@turf/bbox-polygon';
import booleanContains from '@turf/boolean-contains';
import { point } from '@turf/helpers';
import * as $ from 'jquery';
import { NotifierService } from 'angular-notifier';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT';
import { createXYZ } from 'ol/tilegrid';

@Component({
  selector: 'app-vertical-toolbar',
  templateUrl: './vertical-toolbar.component.html',
  styleUrls: ['./vertical-toolbar.component.scss'],
})
export class VerticalToolbarComponent implements OnInit {
  environment;
  private readonly notifier: NotifierService;

  @Input() sidenavContainer: MatSidenavContainer | undefined;

  @Input() map: Map | undefined;

  @Input() dialog: MatDialog | undefined;

  @Input() modeMapillary;

  userMovedMap: boolean = false;

  historyMapPosition: Array<{
    coordinates: [number, number];
    zoom: number;
  }> = [];

  indexHstoryMapPosition = 0;

  responseMapillary;

  constructor(
    public storageService: StorageServiceService,
    notifierService: NotifierService,
    public zone: NgZone
  ) {
    this.environment = environment;
    this.notifier = notifierService;
  }

  ngOnInit(): void {
    this.storageService.states.subscribe((value) => {
      if (value.loadProjectData) {
        this.map?.on('movestart', () => {
          if (!this.userMovedMap) {
            this.historyMapPosition = [
              {
                coordinates: [
                  this.map?.getView().getCenter()![0]!,
                  this.map?.getView().getCenter()![1]!,
                ],
                zoom: this.map?.getView().getZoom()!,
              },
            ];
            this.indexHstoryMapPosition = 0;
          }
        });

        this.map?.on('moveend', () => {
          if (!this.userMovedMap) {
            this.historyMapPosition[1] = {
              coordinates: [
                this.map?.getView().getCenter()![0]!,
                this.map?.getView().getCenter()![1]!,
              ],
              zoom: this.map?.getView().getZoom()!,
            };
            this.indexHstoryMapPosition = 0;
          }
        });
      }
    });
  }

  getBackgroundColorOfTheToogleSlidenav(): string {
    return '#fff';
  }

  globalView() {
    new MapHelper().fit_view(this.storageService.getExtentOfProject(true), 6);
  }

  /**
   * Get the color of the icon in  the div toogle sidenav left
   */
  getColorOfTheToogleSlidenav(): string {
    return environment.primaryColor;
  }

  /**
   * Close/open left sidenav
   */
  toogleLeftSidenav() {
    if (this.sidenavContainer?.start?.opened) {
      this.sidenavContainer.start.close();
    } else {
      this.sidenavContainer?.start?.open();
    }
  }

  zoom(type: 'plus' | 'minus') {
    if (type == 'plus') {
      this.map?.getView().setZoom(this.map?.getView().getZoom()! + 1);
    } else {
      this.map?.getView().setZoom(this.map?.getView().getZoom()! - 1);
    }
  }

  rollBack() {
    if (
      this.historyMapPosition.length > 0 &&
      this.indexHstoryMapPosition == 0
    ) {
      this.userMovedMap = true;
      this.indexHstoryMapPosition = 1;
      new MapHelper().fit_view(
        new Point(this.historyMapPosition[0].coordinates),
        this.historyMapPosition[0].zoom
      );
      setTimeout(() => {
        this.userMovedMap = false;
      }, 2000);
    }
  }

  rollFront() {
    if (
      this.historyMapPosition.length > 0 &&
      this.indexHstoryMapPosition == 1
    ) {
      this.userMovedMap = true;
      this.indexHstoryMapPosition = 0;
      new MapHelper().fit_view(
        new Point(this.historyMapPosition[1].coordinates),
        this.historyMapPosition[1].zoom
      );
      setTimeout(() => {
        this.userMovedMap = false;
      }, 2000);
    }
  }

  zoomTo() {
    const dialogRef = this.dialog?.open(ZoomModalComponent, {
      width: '400px',
      data: { type: 'zoomto' },
    });

    dialogRef?.afterClosed().subscribe((modal_result) => {
      if (modal_result.statut) {
        var result = modal_result['data'];

        if (result.projection == 'WGS84') {
          var coord_wgs84 = Array();
          coord_wgs84[0] = parseFloat(result.longitude);
          coord_wgs84[1] = parseFloat(result.latitude);
          var coord = transform(
            [coord_wgs84[0], coord_wgs84[1]],
            'EPSG:4326',
            'EPSG:3857'
          );

          console.log(coord);

          var point_geojson = point(coord);
          var bbox_cam = bboxPolygon(
            this.storageService.getConfigProjet().bbox
          );

          var bool = booleanContains(bbox_cam, point_geojson);

          if (bool) {
            var mapHelper = new MapHelper();
            mapHelper.fit_view(new Point(coord), 17);

            $('#setCoordOverlay').show();
            var setCoordOverlay = new Overlay({
              position: coord,
              element: document.getElementById('setCoordOverlay')!,
            });

            this.map?.addOverlay(setCoordOverlay);

            $('#setCoordOverlay').on('mousemove', (evt) => {
              $('#setCoordOverlay em').show();
            });

            $('#setCoordOverlay').on('mouseout', (evt) => {
              $('#setCoordOverlay em').hide();
            });
          } else {
            this.notifier.notify(
              'warning',
              'Désolé mais vos coordonées sont hors du pays'
            );
          }
        }
      }
    });
  }

  toogleMapillary() {
    if (!this.modeMapillary) {
      var data = {
        type: 'mapillary',
        nom: 'mapillary',
        type_layer: 'mapillary',
        checked: true,
        img: 'assets/icones/mapillary-couche.png',
      };

      this.displayDataOnMap(data);

      this.modeMapillary = !this.modeMapillary;

      if (this.map?.getView()?.getZoom()! > 14) {
        this.displayMapillaryPoint();
      }

      this.map?.on('moveend', () => {
        this.displayMapillaryPoint();
      });
    } else {
      var data = {
        type: 'mapillary',
        nom: 'mapillary',
        type_layer: 'mapillary',
        checked: false,
        img: 'assets/icones/mapillary-couche.png',
      };

      this.displayDataOnMap(data);
    }
  }

  displayDataOnMap(data) {
    var mapHelper = new MapHelper();
    var LayTheCopy_vector: VectorTileLayer;
    if (data.checked) {
      var mapHelper = new MapHelper();
      var zMax = mapHelper.getMaxZindexInMap();
      var strokestyle = new Style({
        stroke: new Stroke({
          color: 'rgba(53, 175, 109,0.7)',
          width: 4,
        }),
      });

      LayTheCopy_vector = new VectorTileLayer({
        source: new VectorTileSource({
          format: new MVT(),
          tileGrid: createXYZ({ maxZoom: 22 }),
          projection: 'EPSG:3857',
          url: 'https://d25uarhxywzl1j.cloudfront.net/v0.1/{z}/{x}/{y}.mvt',
        }),
      });

      LayTheCopy_vector.setStyle(strokestyle);

      LayTheCopy_vector.set('name', this.space2underscore(data.nom));
      LayTheCopy_vector.set('nom', this.space2underscore('Mapillary'));
      LayTheCopy_vector.set('properties', { type: 'couche' });
      LayTheCopy_vector.set('type', data.type);
      LayTheCopy_vector.set('type_layer', data.type_layer);
      LayTheCopy_vector.set('inToc', true);
      LayTheCopy_vector.set('iconImagette', 'assets/icones/mappilary.png');
      LayTheCopy_vector.setZIndex(zMax + 1);
      this.map?.addLayer(LayTheCopy_vector);

      data.type_layer = 'mapillary';
      data.zIndex_inf = zMax;
    } else {
      if (
        this.modeMapillary &&
        this.space2underscore(data.nom) == 'mapillary'
      ) {
        this.modeMapillary = false;
      }

      var layerInMap = mapHelper.getAllLAyerInMap();

      for (var i = 0; i < layerInMap.length; i++) {
        if (layerInMap[i].values_.name == this.space2underscore(data.nom)) {
          var zindex = layerInMap[i].values_.zIndex;
          layerInMap.splice(i, 1);
        }
      }

      data.visible = false;

      var lay = Array();
      this.map?.getLayers().forEach((layer) => {
        if (layer.get('name') == this.space2underscore(data.nom)) {
          lay.push(layer);
        }

        if (
          layer.get('type') == 'mapillaryPoint' &&
          this.space2underscore(data.nom) == 'mapillary'
        ) {
          lay.push(layer);
        }
      });

      for (var i = 0; i < lay.length; i++) {
        this.map?.removeLayer(lay[i]);
      }

      this.map?.getLayers().forEach((layer) => {
        layer.setZIndex(layer.getZIndex() - 1);
      });
    }
  }

  space2underscore(donne): any {
    return donne.replace(/ /g, '_');
  }

  displayMapillaryPoint() {
    if (this.modeMapillary && this.map?.getView()?.getZoom()! > 14) {
      var bboxMap = this.map
        ?.getView()
        .calculateExtent(this.map.getSize())
        .toString()
        .split(',');

      var Amin = transform(
        [parseFloat(bboxMap![0]), parseFloat(bboxMap![1])],
        'EPSG:3857',
        'EPSG:4326'
      );
      var Amax = transform(
        [parseFloat(bboxMap![2]), parseFloat(bboxMap![3])],
        'EPSG:3857',
        'EPSG:4326'
      );

      var bboxUrl = Amin[0] + ',' + Amin[1] + ',' + Amax[0] + ',' + Amax[1];

      var url_sequence =
        'https://a.mapillary.com/v3/sequences?bbox=' +
        bboxUrl +
        '&client_id=QnZyMGZ1VkU0OTFWNUJRb1d5bUhBTzo4MzQ1MzY3ODhlZjA1ZWFi';
      $.get(url_sequence, (data) => {
        var layer_mappilary;
        var layer_mappilaryPoint;

        this.map?.getLayers().forEach((layer) => {
          if (layer.get('name') == 'mapillary') {
            layer_mappilary = layer;
          }

          if (layer.get('name') == 'mapillaryPoint') {
            layer_mappilaryPoint = layer;
          }
        });

        var point = Array();
        for (var i = 0; i < data.features.length; i++) {
          for (
            var j = 0;
            j < data.features[i].geometry.coordinates.length;
            j++
          ) {
            var coord = transform(
              data.features[i].geometry.coordinates[j],
              'EPSG:4326',
              'EPSG:3857'
            );

            var newMarker = new Feature({
              geometry: new Point(coord),
              data: { i: i, j: j, type: 'point' },
            });

            point.push(newMarker);
          }
        }

        var vectorFeature = new GeoJSON().readFeatures(data, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857',
        });

        var vectorSource = new VectorSource({
          features: point,
        });

        vectorSource.addFeatures(vectorFeature);

        var vectorLayer = new VectorLayer({
          source: vectorSource,
          style: new Style({
            image: new CircleStyle({
              radius: 4,
              fill: new Fill({
                color: '#fff',
              }),
              stroke: new Stroke({
                color: 'rgba(53, 175, 109,0.7)',
                width: 3,
              }),
            }),
            stroke: new Stroke({
              color: 'rgba(53, 175, 109,0.7)',
              width: 4,
            }),
          }),
        });

        if (layer_mappilaryPoint) {
          layer_mappilaryPoint.getSource().clear();
          layer_mappilaryPoint.setSource(vectorSource);
        }

        vectorLayer.set('name', 'mapillaryPoint');
        vectorLayer.set('type', 'mapillaryPoint');
        vectorLayer.setZIndex(layer_mappilary.getZIndex());

        this.map?.addLayer(vectorLayer);

        this.zone.run(() => {
          this.responseMapillary = data;
        });
      });
    }
  }
}
