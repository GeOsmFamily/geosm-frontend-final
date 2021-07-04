import { DataHelper } from './dataHelper';
import { ActiveLayersInterface } from './../interfaces/activeLayersInterface';
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
  TileLayer,
  XYZ,
  TileWMS,
  ImageWMS,
  LayerGroup,
  Cluster,
  CircleStyle,
  Stroke,
  Icon,
  transformExtent,
  Text,
  Point,
  Feature,
} from '../modules/ol';
import { environment } from '../../environments/environment';
import { AppInjector } from './injectorHelper';
import { map as geoportailMap } from './../components/map/map.component';
import * as $ from 'jquery';
import { GeosmLayer } from '../interfaces/geosmLayersInterface';
import { delayWhen, retryWhen, take, tap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { timer } from 'rxjs/internal/observable/timer';
import { LayersInMap } from '../interfaces/layersInMapInterface';
import { DataFromClickOnMapInterface } from '../interfaces/dataClickInterface';

const typeLayer = [
  'geosmCatalogue',
  'draw',
  'mesure',
  'mapillary',
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
  constructShadowLayer(geojsonLayer: Object): ImageLayer {
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
    this.map?.getView().fit(geom, {
      maxZoom: zoom,
      size: this.map!.getSize(),
      padding: [0, 0, 0, 0],
      duration: 1000,
    });
  }

  constructLayer(couche: GeosmLayer) {
    var layer;
    if (couche.type == 'xyz') {
      layer = new TileLayer({
        source: new XYZ({
          url: couche.url,
          crossOrigin: 'anonymous',
          attributionsCollapsible: false,
          attributions:
            ' © contributeurs <a target="_blank" href="https://www.openstreetmap.org/copyright"> OpenStreetMap </a> ',
        }),

        className: couche.nom + '___' + couche.type_layer,
      });
    } else if (couche.type == 'wms') {
      var wmsSourceTile = new TileWMS({
        url: couche.url,
        params: { LAYERS: couche.identifiant, TILED: true },
        serverType: 'qgis',
        crossOrigin: 'anonymous',
      });

      var layerTile = new TileLayer({
        source: wmsSourceTile,
        className: couche.nom + '___' + couche.type_layer,
        minResolution: this.map?.getView().getResolutionForZoom(9),
      });

      var wmsSourceImage = new ImageWMS({
        url: couche.url!,
        params: { LAYERS: couche.identifiant, TILED: true },
        serverType: 'qgis',
        crossOrigin: 'anonymous',
      });

      var layerImage = new ImageLayer({
        source: wmsSourceImage,

        className: couche.nom + '___' + couche.type_layer,
        maxResolution: this.map?.getView().getResolutionForZoom(9),
      });

      layer = new LayerGroup({
        layers: [layerTile, layerImage],
      });
    } else if (couche.type == 'geojson') {
      var vectorSource = new VectorSource({
        format: new GeoJSON(),
      });

      var layer = new layer({
        source: vectorSource,
        style: couche.style,
        className: couche.nom + '___' + couche.type_layer,
      });

      if (couche.cluster) {
        var clusterSource = new Cluster({
          distance: 80,
          source: vectorSource,
        });
        var styleCache = {};
        var styleCacheCopy = {};
        layer = new VectorLayer({
          source: clusterSource,
          // @ts-ignore
          style: (feature) => {
            var size = feature.get('features').length;

            if (size > 1) {
              var styleDefault = styleCache[size];
              if (!styleDefault) {
                var radius = 10;
                if (size > 99) {
                  (radius = 12), 5;
                }
                styleDefault = new Style({
                  text: new Text({
                    text: size.toString(),
                    fill: new Fill({
                      color: '#fff',
                    }),
                    font: '12px sans-serif',
                    offsetY: 1,
                    offsetX: -0.5,
                  }),
                  image: new CircleStyle({
                    radius: radius,

                    stroke: new Stroke({
                      color: '#fff',
                      width: 2,
                    }),
                    fill: new Fill({
                      color: environment.primaryColor,
                    }),
                  }),
                });
                styleCache[size] = styleDefault;
              }

              return [couche.style, styleDefault];
            } else if (size == 1) {
              return new Style({
                image: new Icon({
                  scale: couche.size,
                  src: couche.icon,
                }),
              });
            } else if (size == 0) {
              return undefined!;
            }
          },
          className: couche.nom + '___' + couche.type_layer,
        });
      }
    } else if (couche.type == 'wfs') {
      var source = new VectorSource({
        format: new GeoJSON({
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857',
        }),
        loader: (extent, resolution, projection) => {
          var extent_view = this.getCurrentMapExtent();
          var url =
            couche.url +
            '?bbox=' +
            transformExtent(extent_view!, 'EPSG:3857', 'EPSG:4326').join(',') +
            '&SERVICE=WFS&VERSION=1.1.0&REQUEST=GETFEATURE&outputFormat=GeoJSON&typeName=' +
            couche.identifiant;
          this.apiServiceService
            .getRequestFromOtherHostObserver(url)
            .pipe(
              /** retry 3 times after 2s if querry failed  */
              retryWhen((errors) =>
                errors.pipe(
                  tap((val: HttpErrorResponse) => {
                    // console.log(val)
                  }),
                  delayWhen((val: HttpErrorResponse) => timer(2000)),
                  // delay(2000),
                  take(3)
                )
              )
            )
            .subscribe(
              (data) => {
                // @ts-ignore
                source.addFeatures(source.getFormat()?.readFeatures(data)!);
                for (
                  let index = 0;
                  index < source.getFeatures().length;
                  index++
                ) {
                  const feature = source.getFeatures()[index];
                  feature.set('featureId', feature.getId());
                }
              },
              (err: HttpErrorResponse) => {
                source.removeLoadedExtent(extent_view!);
              }
            );
        },
      });

      layer = new VectorLayer({
        source: source,
        style: new Style({
          image: new Icon({
            scale: couche.size,
            src: couche.icon,
          }),
        }),

        className: couche.nom + '___' + couche.type_layer,
      });

      if (couche.cluster) {
        var clusterSource = new Cluster({
          distance: 80,
          source: source,
        });
        var styleCache = {};
        var styleCacheCopy = {};
        layer = new VectorLayer({
          source: clusterSource,
          // @ts-ignore
          style: (feature) => {
            var size = feature.get('features').length;

            if (size > 1) {
              var styleDefault = styleCache[size];
              if (!styleDefault) {
                var radius = 10;
                if (size > 99) {
                  (radius = 12), 5;
                }
                styleDefault = new Style({
                  text: new Text({
                    text: size.toString(),
                    fill: new Fill({
                      color: '#fff',
                    }),
                    font: '12px sans-serif',
                    offsetY: 1,
                    offsetX: -0.5,
                  }),
                  image: new CircleStyle({
                    radius: radius,

                    stroke: new Stroke({
                      color: '#fff',
                      width: 2,
                    }),
                    fill: new Fill({
                      color: environment.primaryColor,
                    }),
                  }),
                  /*  */
                });
                styleCache[size] = styleDefault;
              }

              return [
                new Style({
                  image: new Icon({
                    scale: couche.size,
                    src: couche.icon,
                  }),
                }),
                styleDefault,
              ];
            } else if (size == 1) {
              return new Style({
                image: new Icon({
                  scale: couche.size,
                  src: couche.icon,
                }),
              });
            } else if (size == 0) {
              return;
            }
          },

          className: couche.nom + '___' + couche.type_layer,
        });
      }
    }

    this.setPropertiesToLayer(layer, couche);

    if (couche.zindex) {
      this.setZindexToLayer(layer, couche.zindex);
    }

    if (couche.minzoom) {
      layer.setminResolution(
        this.map?.getView().getResolutionForZoom(couche.minzoom)
      );
    }

    if (couche.maxzoom) {
      layer.setmaxResolution(
        this.map?.getView().getResolutionForZoom(couche.maxzoom)
      );
    }

    layer.setVisible(couche.visible);

    return layer;
  }

  setPropertiesToLayer(layer: any, couche: GeosmLayer) {
    if (layer instanceof LayerGroup) {
      for (
        let index = 0;
        index < layer.getLayers().getArray().length;
        index++
      ) {
        const element = layer.getLayers().getArray()[index];
        element.set('properties', couche.properties);
        element.set('nom', couche.nom);
        element.set('type_layer', couche.type_layer);
        element.set('iconImagette', couche.iconImagette);
        element.set('identifiant', couche.identifiant);
        element.set('inToc', couche.inToc);
        element.set('activeLayers', couche.activeLayers);
        element.set('legendCapabilities', couche.legendCapabilities);
        element.set(
          'descriptionSheetCapabilities',
          couche.descriptionSheetCapabilities
        );
      }
    }

    layer.set('properties', couche.properties);
    layer.set('nom', couche.nom);
    layer.set('type_layer', couche.type_layer);
    layer.set('iconImagette', couche.iconImagette);
    layer.set('identifiant', couche.identifiant);
    layer.set('inToc', couche.inToc);
    layer.set('activeLayers', couche.activeLayers);
    layer.set('legendCapabilities', couche.legendCapabilities);
    layer.set(
      'descriptionSheetCapabilities',
      couche.descriptionSheetCapabilities
    );
  }

  setZindexToLayer(layer: any, zIndex: number) {
    layer.setZIndex(zIndex);
    if (layer instanceof LayerGroup) {
      for (
        let index = 0;
        index < layer.getLayers().getArray().length;
        index++
      ) {
        layer.getLayers().getArray()[index].setZIndex(zIndex);
      }
    }
  }

  addLayerToMap(layer: VectorLayer | ImageLayer, group: string = 'principal') {
    if (!layer.get('nom')) {
      throw new Error("Layer must have a 'nom' properties");
    }

    if (!layer.get('type_layer')) {
      throw new Error("Layer must have a 'type_layer' properties");
    }

    if (typeLayer.indexOf(layer.get('type_layer')) == -1) {
      throw new Error(
        "Layer must have a 'type_layer' properties among " + typeLayer.join(',')
      );
    }

    var zIndex = this.getMaxZindexInMap() + 1;

    if (layer.get('nom') && layer.get('type_layer')) {
      if (!layer.getZIndex()) {
        this.setZindexToLayer(layer, zIndex);
      }

      this.map?.addLayer(layer);
      this.map?.renderSync();
    }
  }

  removeLayerToMap(layer: VectorLayer | ImageLayer) {
    this.map?.removeLayer(layer);
  }

  getMaxZindexInMap(): number {
    var allLayers = this.map?.getLayers().getArray();

    var allZindex = [0];
    for (let index = 0; index < allLayers!.length; index++) {
      var layer = allLayers![index];

      try {
        if (layer.get('inToc')) {
          allZindex.push(layer.getZIndex());
        }
        // console.log(layer.get('nom'),layer.getZIndex())
      } catch (error) {
        console.error(error);
      }
    }
    return Math.max(...allZindex);
  }

  getLayerByPropertiesCatalogueGeosm(properties: {
    group_id: number;
    couche_id: number;
    type: 'couche' | 'carte';
  }): Array<any> {
    var layer_to_remove = Array();
    var all_layers = this.getAllLAyerInMap();
    for (let index = 0; index < all_layers.length; index++) {
      var layer = all_layers[index];
      if (layer.get('properties')) {
        if (
          layer.get('properties')['type'] == properties.type &&
          layer.get('properties')['group_id'] == properties.group_id &&
          layer.get('properties')['couche_id'] == properties.couche_id
        ) {
          layer_to_remove.push(layer);
        }
      }
    }

    return layer_to_remove;
  }

  getAllLAyerInMap(): Array<any> {
    var responseLayers = Array();
    this.map?.getLayers().forEach((group) => {
      responseLayers.push(group);
    });
    return responseLayers;
  }

  getLayerByName(name: string, isLayerGroup: boolean = false): Array<any> {
    var layer_to_remove = Array();

    if (isLayerGroup) {
      var all_layers = this.map?.getLayers().getArray();
    } else {
      var all_layers = this.map?.getLayerGroup().getLayers().getArray();
    }

    for (let index = 0; index < all_layers!.length; index++) {
      var layer = all_layers![index];
      if (layer.get('nom') == name) {
        layer_to_remove.push(layer);
      }
    }
    return layer_to_remove;
  }

  getAllLayersInToc(): Array<LayersInMap> {
    var reponseLayers: Array<LayersInMap> = [];
    var allLayers = this.map?.getLayers().getArray();

    for (let index = 0; index < allLayers!.length; index++) {
      const layer = allLayers![index];
      if (layer.get('inToc')) {
        reponseLayers.push(this.constructAlyerInMap(layer));
      }
    }

    return reponseLayers;
  }

  constructAlyerInMap(layer: any): LayersInMap {
    var data = null;
    var activeLayers: ActiveLayersInterface = {} as ActiveLayersInterface;
    if (layer.get('tocCapabilities')) {
      activeLayers.opacity =
        layer.get('tocCapabilities')['opacity'] != undefined
          ? layer.get('tocCapabilities')['opacity']
          : true;
      activeLayers.share =
        layer.get('tocCapabilities')['share'] != undefined
          ? layer.get('tocCapabilities')['share']
          : true;
      activeLayers.metadata =
        layer.get('tocCapabilities')['metadata'] != undefined
          ? layer.get('tocCapabilities')['metadata']
          : true;
    } else {
      activeLayers.opacity = true;
      activeLayers.share = true;
      activeLayers.metadata = true;
    }

    return {
      activeLayers: activeLayers,
      legendCapabilities: layer.get('legendCapabilities'),
      nom: layer.get('nom'),
      type_layer: layer.get('type_layer'),
      properties: layer.get('properties'),
      image: layer.get('iconImagette'),
      data: data,
      zIndex: layer.getZIndex(),
      visible: layer.getVisible(),
      layer: layer,
      descriptionSheetCapabilities: layer.get('descriptionSheetCapabilities'),
    };
  }

  editZindexOfLayer(layer: any, zIndex: number) {
    for (let index = 0; index < this.getAllLayersInToc().length; index++) {
      const layerInmap = this.getAllLayersInToc()[index].layer;

      console.log(layer.getZIndex(), zIndex);
      if (layer.getZIndex() < zIndex) {
        // if the layer is going up
        if (layerInmap.getZIndex() <= zIndex) {
          this.setZindexToLayer(layerInmap, layerInmap.getZIndex() - 1);
        } else if (layerInmap.getZIndex() > zIndex) {
          this.setZindexToLayer(layerInmap, layerInmap.getZIndex() + 1);
        }
      } else if (layer.getZIndex() > zIndex) {
        // if the layer is going down
        if (layerInmap.getZIndex() >= zIndex) {
          this.setZindexToLayer(layerInmap, layerInmap.getZIndex() + 1);
        } else if (layerInmap.getZIndex() < zIndex) {
          this.setZindexToLayer(layerInmap, layerInmap.getZIndex() - 1);
        }
      }
    }
    this.setZindexToLayer(layer, zIndex);
  }

  getLayerQuerryBleInLayerGroup(layer: LayerGroup): any {
    if (layer instanceof LayerGroup) {
      for (
        let index = 0;
        index < layer.getLayers().getArray().length;
        index++
      ) {
        const element = layer.getLayers().getArray()[index];
        if (element instanceof TileLayer) {
          return element;
        } else if (element instanceof VectorLayer) {
          return element;
        }
      }
    } else {
      return layer;
    }
  }

  getLayerGroupByNom(groupName: string): LayerGroup {
    var groupLayer;
    this.map?.getLayers().forEach((group) => {
      if (group instanceof LayerGroup) {
        if (group.get('nom') == groupName) {
          groupLayer = group;
        }
      }
    });
    return groupLayer;
  }

  mapHasCliked(evt, callback: (param: DataFromClickOnMapInterface) => void) {
    var pixel = this.map?.getEventPixel(evt.originalEvent);

    var feature = this.map?.forEachFeatureAtPixel(
      pixel!,
      function (feature, layer) {
        return feature;
      },
      {
        hitTolerance: 5,
      }
    );

    var layer = this.map?.forEachFeatureAtPixel(
      pixel!,
      function (feature, layer) {
        if (layer instanceof VectorLayer) {
          return layer;
        }
      },
      {
        hitTolerance: 5,
      }
    );

    var layers = Array();

    if (!feature) {
      var all_pixels = new DataHelper().calcHitMatrix(evt.pixel);
      for (let index = 0; index < all_pixels.length; index++) {
        var un_pixel = all_pixels[index];
        var nom_layers_load = Array();

        for (let i = 0; i < layers.length; i++) {
          nom_layers_load.push(layers[i].get('nom'));
        }

        var layers_in_pixels = this.displayFeatureInfo(
          un_pixel,
          'nom',
          nom_layers_load
        );

        for (let j = 0; j < layers_in_pixels.length; j++) {
          layers.push(layers_in_pixels[j]);
        }
      }
    }

    if (layer instanceof VectorLayer && feature) {
      if (layer.getSource() instanceof Cluster) {
        var numberOfFeatureInCluster = this.countFeaturesInCluster(
          feature.get('features')
        );
        if (numberOfFeatureInCluster > 1) {
          if (Object.create(feature.getGeometry()!).getType() == 'Point') {
            var coordinate = Object.create(
              feature.getGeometry()!
            ).getCoordinates();
            var geom = new Point(coordinate);
            this.fit_view(geom, this.map?.getView().getZoom()! + 2);
          }
        } else if (numberOfFeatureInCluster == 1) {
          var feat = this.getFeatureThatIsDisplayInCulster(
            feature.getProperties().features
          );
          var coord = this.map?.getCoordinateFromPixel(pixel!);
          var data_callback: DataFromClickOnMapInterface = {
            type: 'vector',
            data: {
              coord: coord!,
              layers: [layer],
              feature: feat,
              data: {},
            },
          };

          callback(data_callback);
        }
      }
    } else if (layers.length > 0) {
      var coord = this.map?.getCoordinateFromPixel(pixel!);
      var data_callback: DataFromClickOnMapInterface = {
        type: 'raster',
        data: {
          coord: coord!,
          layers: layers,
        },
      };
      callback(data_callback);
    } else {
      var coord = this.map?.getCoordinateFromPixel(pixel!);
      var data_callback: DataFromClickOnMapInterface = {
        type: 'clear',
        data: {
          coord: coord!,
          layers: layers,
        },
      };
      callback(data_callback);
    }
  }

  displayFeatureInfo(
    pixel: number[],
    oddLayersAttr: string,
    oddLayersValues: Array<string>
  ): Array<any> {
    var layers = Array();
    this.map?.forEachLayerAtPixel(pixel, (layer) => {
      if (layer) {
        if (
          (layer instanceof ImageLayer || layer instanceof TileLayer) &&
          layer.get('descriptionSheetCapabilities') &&
          oddLayersValues.indexOf(layer.get(oddLayersAttr)) == -1
        ) {
          layers.push(layer);
        }
      }
    });

    return layers;
  }

  countFeaturesInCluster(features): number {
    var size = 0;
    for (let index = 0; index < features.length; index++) {
      const feat = features[index];
      size = size + 1;
    }
    return size;
  }

  getFeatureThatIsDisplayInCulster(features: Array<Feature>): Feature {
    var feature;
    for (let index = 0; index < features.length; index++) {
      const feat = features[index];
      feature = feat;
    }
    return feature;
  }
}
