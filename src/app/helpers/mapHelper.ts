import { ApiServiceService } from './../services/api/api-service.service';
import { Injectable } from '@angular/core';
import {
  ImageLayer,
  Map,
  GeoJSON,
  VectorSource,
  Style,
  Fill,
  RasterSource,
  boundingExtent,
  VectorLayer,
  ScaleLine,
  MousePosition,
  createStringXY,
} from '../modules/ol';
import { environment } from '../../environments/environment';
import { AppInjector } from './injectorHelper';
import { map as geoportailMap } from './../components/map/map.component';
import * as $ from 'jquery';

const typeLayer = [
  'geosmCatalogue',
  'draw',
  'mesure',
  'mappilary',
  'exportData',
  'other',
  'routing',
];

@Injectable()
export class MapHelper {
  map: Map | undefined;
  environment = environment;
  apiServiceService: ApiServiceService = AppInjector.get(ApiServiceService);

  constructor(map?: Map) {
    if (map) {
      this.map = map;
    } else {
      this.map = geoportailMap;
    }
  }

  static scaleControl(
    scaleType: 'scaleline' | 'scalebar',
    target: string
  ): ScaleLine {
    let scaleBarSteps = 4;
    let scaleBarText = true;
    let control;
    if (scaleType === 'scaleline') {
      control = new ScaleLine({
        units: 'metric', //'metric','nautical','us','degrees'
        target: target,
      });
    } else if (scaleType === 'scalebar') {
      control = new ScaleLine({
        units: 'metric',
        target: target,
        bar: true,
        steps: scaleBarSteps,
        text: scaleBarText,
        minWidth: 140,
      });
    }
    return control;
  }

  static mousePositionControl(target: string): MousePosition {
    let mousePositionControl = new MousePosition({
      coordinateFormat: createStringXY(4),
      projection: 'EPSG:4326',
      target: document.getElementById(target)!,
      undefinedHTML: 'WGS 84',
    });
    return mousePositionControl;
  }

  //Construire le fond de carte grisé à partir d'un geojson
  public static constructShadowLayer(geojsonLayer: Object): ImageLayer {
    var worldGeojson = {
      type: 'FeatureCollection',
      name: 'world_shadow',
      crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:EPSG::3857' } },
      features: [
        {
          type: 'Feature',
          properties: { id: 0 },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-19824886.222640071064234, 19848653.805728208273649],
                [19467681.065475385636091, 19467681.065475385636091],
                [19753445.191207133233547, -15987945.626927629113197],
                [-19824886.222640071064234, -15967070.525261469185352],
                [-19824886.222640071064234, 19848653.805728208273649],
              ],
            ],
          },
        },
      ],
    };

    var featureToShadow = new GeoJSON().readFeatures(geojsonLayer, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    });

    var featureWorld = new GeoJSON().readFeatures(worldGeojson);

    var rasterSource_world = new VectorLayer({
      source: new VectorSource(),
      style: new Style({
        fill: new Fill({
          color: [0, 0, 0, 0.6],
        }),
      }),
    });

    var rasterSource_cmr = new VectorLayer({
      source: new VectorSource(),
      style: new Style({
        fill: new Fill({
          color: [0, 0, 0, 0.1],
        }),
      }),
    });

    rasterSource_world.getSource().addFeatures(featureWorld);
    rasterSource_cmr.getSource().addFeatures(featureToShadow);

    var raster = new RasterSource({
      sources: [rasterSource_world, rasterSource_cmr],
      operation: function (pixels, data) {
        if (pixels[1][3] == 0) {
          return pixels[0];
        } else {
          return [0, 0, 0, 1];
        }
      },
    });

    var rasterLayer = new ImageLayer({
      source: raster,
      className: 'map-shadow',
    });

    return rasterLayer;
  }

  //lister les id contenus dans un VectorSource
  public static listIdFromSource(source: VectorSource): Array<string> {
    var response = Array();
    for (let index = 0; index < source.getFeatures().length; index++) {
      const feat = source.getFeatures()[index];
      response.push(feat.getId());
    }
    return response;
  }

  //recuperer la bbox actuelle de la carte sur l'ecran
  getCurrentMapExtent() {
    try {
      var coord_O_N = this.map?.getCoordinateFromPixel([
        $('.mat-sidenav .sidenav-left').width(),
        $(window).height(),
      ]);
      var coord_E_S = this.map?.getCoordinateFromPixel([$(window).width(), 0]);
      var extent_view = boundingExtent([coord_O_N!, coord_E_S!]);
      return extent_view;
    } catch (error) {
      var extent_view_error = this.map?.getView().calculateExtent();
      return extent_view_error;
    }
  }

  fit_view(geom, zoom, padding?) {
    this.map!.getView().fit(geom, {
      maxZoom: zoom,
      size: this.map!.getSize(),
      padding: [0, 0, 0, 0],
      duration: 1000,
    });
  }
}
