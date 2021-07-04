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
  Text,
  View,
  unByKey,
  LayerGroup,
} from 'src/app/modules/ol';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { ZoomModalComponent } from '../../modal/zoom-modal/zoom-modal.component';
import { fromLonLat, transform } from 'ol/proj';
import bboxPolygon from '@turf/bbox-polygon';
import booleanContains from '@turf/boolean-contains';
import { point } from '@turf/helpers';
import * as $ from 'jquery';
import { NotifierService } from 'angular-notifier';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT';
import { createXYZ } from 'ol/tilegrid';
import { Viewer } from 'mapillary-js';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ButtonSheetComponent } from '../../button-sheet/button-sheet/button-sheet.component';

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

  @Input() modeCompare;

  userMovedMap: boolean = false;

  historyMapPosition: Array<{
    coordinates: [number, number];
    zoom: number;
  }> = [];

  indexHstoryMapPosition = 0;

  responseMapillary;

  previewPointMapillary;

  mly;

  mlyc;

  point;

  newMarker;

  layerInCompare = Array();

  precompose;

  postcompose;

  swipeEvent;

  @Input() zone: NgZone | undefined;

  constructor(
    public storageService: StorageServiceService,
    notifierService: NotifierService,
    private bottomSheet: MatBottomSheet
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

    var popup_lot = new Overlay({
      element: document.getElementById('popup_lot')!,
      stopEvent: true,
    });
    this.map?.addOverlay(popup_lot);

    var popup_mapillary = new Overlay({
      element: document.getElementById('popup_mapillary')!,
      stopEvent: true,
    });
    this.map?.addOverlay(popup_mapillary);

    var target = this.map?.getTarget();
    var jTarget = typeof target === 'string' ? $('#' + target) : $(target);
    var cursor_on_popup = false;
    var popup_once_open = false;

    $(this.map?.getViewport()).on('mousemove', (evt) => {
      var pixel = this.map?.getEventPixel(evt.originalEvent);

      this.map?.forEachLayerAtPixel(pixel!, (layer) => {
        if (layer.get('type') != 'mapillary') {
          var hit = this.map?.forEachFeatureAtPixel(
            pixel!,
            function (feature, layer) {
              if (layer && layer.get('type') != 'mapillary') {
                return true;
              }
            }
          );

          if (hit) {
            jTarget.css('cursor', 'pointer');
          } else {
            jTarget.css('cursor', '');
          }
        }
      });

      var feature = this.map?.forEachFeatureAtPixel(
        pixel!,
        (feature, layer) => {
          return feature;
        }
      );

      var layer = this.map?.forEachFeatureAtPixel(pixel!, (feature, layer) => {
        return layer;
      });

      if (layer && feature && layer.get('type') == 'querry') {
        //
      } else if (
        layer &&
        feature &&
        layer.get('type') == 'mapillaryPoint' &&
        feature.getProperties()['data']
      ) {
        var pte = feature.getProperties()['data'];
        console.log(this.responseMapillary);
        this.point = {
          img: this.responseMapillary['features'][pte.i]['properties'][
            'coordinateProperties'
          ].image_keys[pte.j],
          cas: this.responseMapillary['features'][pte.i]['properties'][
            'coordinateProperties'
          ].cas[pte.j],
        };

        var stActive = new Style({
          image: new CircleStyle({
            radius: 9,
            fill: new Fill({
              color: 'rgba(53, 175, 109,0.7)',
            }),
          }),
        });

        var rotation = (Math.PI / 2 + Math.PI * this.point.cas) / -360;

        feature['setStyle'](stActive);

        this.map?.addOverlay(popup_mapillary);
        var coordinate = Object.create(feature.getGeometry()!).getCoordinates();
        popup_mapillary.setPosition(coordinate);

        $('#img_mappilary').attr(
          'src',
          'https://d1cuyjsrcm0gby.cloudfront.net/' +
            this.point.img +
            '/thumb-320.jpg'
        );

        this.zone?.run(() => {
          this.previewPointMapillary = feature;
        });
      } else {
        if (popup_once_open) {
          $('#popup_lot').on('mousemove', (evt) => {
            cursor_on_popup = true;
          });

          $('#popup_lot').on('mouseleave', (evt) => {
            cursor_on_popup = false;

            $('#popup_infos_contain').text('');
            this.map?.removeOverlay(popup_lot);
            popup_once_open = false;
          });
          setTimeout(() => {
            if (cursor_on_popup == false) {
              $('#popup_infos_contain').text('');
              this.map?.removeOverlay(popup_lot);
              popup_once_open = false;
            }
          }, 200);
        }

        if (this.previewPointMapillary) {
          this.notifier.notify(
            'success',
            'Cliquer sur un point pour lancer la navigation'
          );
          var st = new Style({
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
          });
          this.previewPointMapillary.setStyle(st);
          this.previewPointMapillary = undefined;
          this.map?.removeOverlay(popup_mapillary);
          $('#img_mappilary').attr('src', '');
        }
      }
    });
  }

  getBackgroundColorOfTheToogleSlidenav(): string {
    return '#fff';
  }

  globalView() {
    new MapHelper().fit_view(this.storageService.getExtentOfProject(true), 6);
  }

  getColorOfTheToogleSlidenav(): string {
    return environment.primaryColor;
  }

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

        this.sidenavContainer?.start?.open();
        document.getElementById('mly')!.style.display = 'none';
        this.map?.setTarget('map');
      }

      if (this.layerInCompare.length != 0) {
        for (var i = 0; i < this.layerInCompare.length; i++) {
          if (this.layerInCompare[i].nom == data.nom) {
            this.closeModeCompare();
          }
        }
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

            this.newMarker = new Feature({
              geometry: new Point(coord),
              data: { i: i, j: j, type: 'point' },
            });

            point.push(this.newMarker);
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

        this.zone?.run(() => {
          this.responseMapillary = data;
        });
      });

      this.map?.on('click', (e) => {
        if (this.modeMapillary) {
          this.displayViewMapillary(e.pixel, true);
        }
      });
    }
  }

  displayViewMapillary(pixel, isClick) {
    //  this.mlyc.style.display = 'none';
    var faCircleLineMarkerStyle = new Style({
      image: new CircleStyle({
        radius: 3,
        fill: new Fill({
          color: '#fff',
        }),
        stroke: new Stroke({
          color: 'rgba(53, 175, 109,0.7)',
          width: 2,
        }),
      }),
      stroke: new Stroke({
        color: 'rgba(53, 175, 109,0.7)',
        width: 3,
      }),
    });

    var faWifiStyle = new Style({
      text: new Text({
        text: '\uf1eb',
        scale: 1.2,
        font: 'normal 18px FontAwesome',
        offsetY: -10,
        rotation: 0,
        fill: new Fill({ color: 'green' }),
        stroke: new Stroke({ color: 'green', width: 3 }),
      }),
    });

    var updateBearingStyle = (bearing) => {
      var liveBearing = new Style({
        text: new Text({
          text: '\uf1eb',
          scale: 1.2,
          font: 'normal 18px FontAwesome',
          offsetY: -10,
          rotation: (bearing * Math.PI) / 180,
          fill: new Fill({ color: 'green' }),
          stroke: new Stroke({ color: 'green', width: 3 }),
        }),
      });

      return [liveBearing, faCircleLineMarkerStyle];
    };

    var featureOverlay = new VectorLayer({
      source: new VectorSource(),
      map: this.map,
      style: [faWifiStyle, faCircleLineMarkerStyle],
    });
    this.mlyc = document.getElementById('mly');
    var old_html = $('#mly').html();

    if (this.sidenavContainer?.start?.opened) {
      this.sidenavContainer.start.close();
    }

    var highlight;

    this.mlyc!.style.display = 'inline';
    var feature = this.map?.forEachFeatureAtPixel(
      pixel,
      (feature1, layer) => {
        return feature1;
      },
      {
        hitTolerance: 5,
      }
    );

    $('#mly').html(old_html);
    this.mly = new Viewer({
      apiClient: 'QnZyMGZ1VkU0OTFWNUJRb1d5bUhBTzo4MzQ1MzY3ODhlZjA1ZWFi',
      component: { cover: false },
      container: this.mlyc,
      imageKey: this.point.img,
    });

    if (feature) {
      if (isClick) {
        var bearing = feature.get('ca');
        this.mly.moveToKey(feature.get('key'));
        featureOverlay.setStyle(updateBearingStyle(bearing));
      }
    } else {
      return;
    }
    if (feature !== highlight) {
      if (highlight) {
        featureOverlay.getSource().removeFeature(highlight);
      }

      if (feature) {
        //@ts-ignore
        featureOverlay.getSource().addFeature(feature);
      }

      highlight = feature;
    }
    this.mly.on(Viewer.nodechanged, (node) => {
      if (featureOverlay.getVisible()) {
        featureOverlay.setVisible(false);
      }

      var lonLat = fromLonLat([
        node.originalLatLon.lon,
        node.originalLatLon.lat,
      ]);

      this.map?.getView().setCenter(lonLat);
      this.newMarker.getGeometry().setCoordinates(lonLat);
      this.newMarker.setStyle(updateBearingStyle(node.ca));
      this.map?.setView(new View({ center: lonLat, zoom: 18 }));
    });

    this.map?.setTarget('mapi');
    console.log(this.mly);

    window.addEventListener('resize', () => {
      this.mly.resize();
    });
  }

  toogleCompare() {
    var swipe = document.getElementById('swipe');
    var mapHelper = new MapHelper();
    var layerInMap = mapHelper.getAllLayersInToc();
    if (!this.modeCompare) {
      const buttonheet_compare = this.bottomSheet.open(ButtonSheetComponent, {
        data: { type: 'compare', data: layerInMap },
      });

      this.modeCompare = true;

      buttonheet_compare.afterDismissed().subscribe((result) => {
        if (!result) {
          this.modeCompare = false;
          $('#swipe').hide();
        } else {
          $('#swipe').show();

          var index1 = parseFloat(result['layer1']);
          var index2 = parseFloat(result['layer2']);

          var layer1;
          var layer2;

          this.map?.getLayers().forEach((layer) => {
            if (layer.get('nom') == layerInMap[index1]['nom']) {
              layer1 = layer;
              console.log(layer1);
              layer.setVisible(true);
            } else if (layer.get('nom') == layerInMap[index2]['nom']) {
              layer2 = layer;
              console.log(layer2);
              layer.setVisible(true);
            } else if (layer.get('properties')?.type == 'carte') {
              layer.setVisible(false);
            }
          });

          for (var i = 0; i < layerInMap.length; i++) {
            if (
              //@ts-ignore
              layerInMap[i]['properties']?.type == 'carte'
            ) {
              layerInMap[i]['visible'] = false;
            }
          }

          this.toogleVisibilityLayer(layerInMap[index1]);
          this.toogleVisibilityLayer(layerInMap[index2]);

          layerInMap[index1]['visible'] = true;
          layerInMap[index2]['visible'] = true;

          this.layerInCompare[0] = layerInMap[index1];
          this.layerInCompare[1] = layerInMap[index2];

          if (layer1.getZIndex() > layer2.getZIndex()) {
            var lay1 = layer1;
          } else {
            var lay1 = layer2;
          }

          this.precompose = lay1.on('prerender', function (event) {
            var ctx = event.context;
            var width = ctx.canvas.width * (swipe!['value'] / 100);

            ctx.save();
            ctx.beginPath();
            ctx.rect(width, 0, ctx.canvas.width - width, ctx.canvas.height);
            ctx.clip();
          });

          this.postcompose = lay1.on('postrender', function (event) {
            var ctx = event.context;
            ctx.restore();
          });

          this.swipeEvent = swipe?.addEventListener(
            'input',
            () => {
              this.map?.render();
            },
            false
          );
        }
      });
    } else {
      this.closeModeCompare();
    }
  }

  closeModeCompare() {
    this.layerInCompare = Array();

    unByKey(this.precompose);
    unByKey(this.postcompose);
    unByKey(this.swipeEvent);

    this.modeCompare = false;

    $('#swipe').hide();
  }

  toogleVisibilityLayer(data) {
    console.log(data);

    if (data.visible) {
      this.map?.getLayers().forEach((layer) => {
        if (layer.get('nom') == data.nom) {
          layer.setVisible(false);
        }

        if (layer.get('type') == 'mapillaryPoint' && data.nom == 'mapillary') {
          layer.setVisible(false);
        }
      });
    } else {
      this.map?.getLayers().forEach((layer) => {
        if (layer.get('nom') == data.nom) {
          layer.setVisible(true);
        }

        if (layer.get('type') == 'mapillaryPoint' && data.nom == 'mapillary') {
          layer.setVisible(true);
        }
      });
    }
  }
}
