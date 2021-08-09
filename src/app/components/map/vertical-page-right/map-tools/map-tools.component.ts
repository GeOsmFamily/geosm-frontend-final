import { environment } from './../../../../../environments/environment';
import { ApiServiceService } from './../../../../services/api/api-service.service';
import { style } from '@angular/animations';
import { Component, Input, Output, ViewChild } from '@angular/core';
import { layer } from '@fortawesome/fontawesome-svg-core';
import { map } from 'rxjs/operators';
import { Chart } from 'src/app/modules/chart';
import {
  CircleStyle,
  Draw,
  Feature,
  Fill,
  Map,
  Point,
  Stroke,
  Style,
  VectorLayer,
  VectorSource,
} from 'src/app/modules/ol';
import { DrawComponent } from './draw/draw.component';
import { MeasureComponent } from './measure/measure.component';
import * as $ from 'jquery';
import { transform } from 'ol/proj';
import { DataHelper } from 'src/app/helpers/dataHelper';
import { MapHelper } from 'src/app/helpers/mapHelper';

@Component({
  selector: 'app-map-tools',
  templateUrl: './map-tools.component.html',
  styleUrls: ['./map-tools.component.scss'],
})
export class MapToolsComponent {
  @Input() map: Map | undefined;

  @Input() modeComment;

  @ViewChild(DrawComponent) drawComp: DrawComponent | undefined;

  @ViewChild(MeasureComponent) measureComp: MeasureComponent | undefined;

  altimetrie;
  draw;

  environment;

  @Output() profil_alti_active: Boolean = false;

  @Input() chart_drape;

  @Input() zone;

  source_draw = new VectorSource();

  vector_draw = new VectorLayer();

  primaryColor;

  constructor(public apiService: ApiServiceService) {
    this.altimetrie = {
      active: false,
    };
    this.vector_draw = new VectorLayer({
      source: this.source_draw,
    });
    this.primaryColor = environment.primaryColor;
    this.environment = environment;
  }

  expansionClose(type: string) {
    if (type == 'measure') {
      this.measureComp?.removeMeasureToApps();
    } else if (type == 'draw') {
      this.drawComp?.desactivateAllAddTool();
      this.drawComp?.desactivateAllModificationTool();
    }
  }

  removeProfilAlti() {
    this.altimetrie.active = false;
    this.map?.removeInteraction(this.draw);
    $('#profil_alti').hide();
  }

  toogleProfilAlti() {
    this.map?.removeInteraction(this.draw);

    if (this.altimetrie.active == false) {
      this.altimetrie.active = true;
      this.draw = new Draw({
        source: this.source_draw,
        //@ts-ignore
        type: 'LineString',
        style: new Style({
          stroke: new Stroke({
            color: this.primaryColor,
            width: 4,
          }),
          image: new CircleStyle({
            radius: 5,
            stroke: new Stroke({
              color: 'black',
            }),
            fill: new Fill({
              color: [0, 0, 0, 0.1],
            }),
          }),
        }),
      });

      this.map?.addInteraction(this.draw);

      this.draw.on('drawend', (e) => {
        var coord = e.feature.getGeometry().getCoordinates();

        //this.profil_alti_overlay.setPosition(coord);
        $('#profil_alti').show();
        ///$("#text-comment").val(null);*/

        var feature = e.feature;

        feature.set('type', 'srtm');

        feature.setStyle(
          new Style({
            stroke: new Stroke({
              color: this.primaryColor,
              width: 6,
            }),
          })
        );

        var geom_4326 = Array();

        for (var i = 0; i < coord.length; i++) {
          geom_4326.push(transform(coord[i], 'EPSG:3857', 'EPSG:4326'));
        }

        this.map?.removeInteraction(this.draw);
        this.profil_alti_active = false;

        console.log(geom_4326);

        this.apiService
          .post_requete('geoportail/drapeline', { donnes: geom_4326 })
          .then((data: any) => {
            this.zone.run(() => {
              this.profil_alti_active = true;
            });
            var drape = JSON.parse(data);

            var profil = drape['coordinates'];
            var x = Array();
            var y = Array();
            var xy = Array();
            for (var index = 0; index < profil.length; index++) {
              xy.push([profil[index][0], profil[index][1]]);
              x.push(index * 50);
              y.push(profil[index][2]);
            }

            if (this.chart_drape) {
              this.chart_drape.destroy();
            }

            var k = 0;
            var features = Array();

            for (var index = 0; index < xy.length; index++) {
              //var coord = proj.transform(xy[index], 'EPSG:32632', 'EPSG:3857')

              var newMarker = new Feature({
                geometry: new Point(xy[index]),
                index: index,
                style: new Style({
                  image: new CircleStyle({
                    radius: 0,
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
                    width: 0,
                  }),
                }),
              });

              features[k] = newMarker;
              k++;
            }

            var markerSource = new VectorSource({
              features: features,
            });

            var vectorLayer = new VectorLayer({
              source: markerSource,
              style: new Style({
                image: new CircleStyle({
                  radius: 0,
                  fill: new Fill({
                    color: '#fff',
                  }),
                  stroke: new Stroke({
                    color: 'rgba(53, 175, 109,0.7)',
                    width: 0,
                  }),
                }),
                stroke: new Stroke({
                  color: 'rgba(53, 175, 109,0.7)',
                  width: 0,
                }),
              }),
            });

            vectorLayer.setZIndex(this.vector_draw.getZIndex());

            vectorLayer.set('type', 'drape_points');
            vectorLayer.set('name', 'drape_points');

            this.map?.addLayer(vectorLayer);

            this.chart_drape = new Chart('canvas', {
              type: 'line',
              data: {
                labels: x,
                datasets: [
                  {
                    data: y,
                    borderColor: this.primaryColor,
                    fill: true,
                    pointRadius: 2,
                  },
                ],
              },
              options: {
                scales: {
                  x: {
                    display: true,
                    ticks: {
                      maxTicksLimit: 12,
                    },
                  },

                  y: {
                    display: true,
                  },
                },
              },
            });

            var style_inactive = new Style({
              image: new CircleStyle({
                radius: 0,
                fill: new Fill({
                  color: '#fff',
                }),
                stroke: new Stroke({
                  color: 'rgba(53, 175, 109,0.7)',
                  width: 0,
                }),
              }),
              stroke: new Stroke({
                color: 'rgba(53, 175, 109,0.7)',
                width: 0,
              }),
            });

            var style_active = new Style({
              image: new CircleStyle({
                radius: 6,
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
            //.addEventListener("mouseover")
            document
              .getElementById('canvas')!
              .addEventListener('mousemove', (evt) => {
                var firstPoint = this.chart_drape.getElementsAtEvent(evt)[0];

                if (firstPoint) {
                  var label = this.chart_drape.data.labels[firstPoint._index];
                  var value =
                    this.chart_drape.data.datasets[firstPoint._datasetIndex]
                      .data[firstPoint._index];
                  console.log(label, value);
                  this.map?.getLayers().forEach(function (leyer) {
                    if (leyer.get('name') == 'drape_points') {
                      for (
                        var i = 0;
                        i < leyer.get('source').getFeatures().length;
                        i++
                      ) {
                        if (
                          label / 50 ==
                          leyer.get('source').getFeatures()[i].get('index')
                        ) {
                          //console.log(leyer.get('source').getFeatures()[firstPoint._index])
                          leyer
                            .get('source')
                            .getFeatures()
                            [i].setStyle(style_active);
                        } else {
                          leyer
                            .get('source')
                            .getFeatures()
                            [i].setStyle(style_inactive);
                        }
                      }
                    }
                  });
                } else {
                  this.map?.getLayers().forEach(function (leyer) {
                    if (leyer.get('name') == 'drape_points') {
                      for (
                        var i = 0;
                        i < leyer.get('source').getFeatures().length;
                        i++
                      ) {
                        leyer
                          .get('source')
                          .getFeatures()
                          [i].setStyle(style_inactive);
                      }
                    }
                  });
                }
              });
          });
        //this.count_draw[type].push({ "id": id, "comment": null, "type": type, "geometry": geom, "hexa_code": this.primaryColor });
      });
    } else {
      this.source_draw.clear();
      this.altimetrie.active = false;
      $('#profil_alti').hide();

      var lay = Array();
      this.map?.getLayers().forEach((layer) => {
        if (layer.get('name') == 'drape_points') {
          lay.push(layer);
        }
      });

      for (var i = 0; i < lay.length; i++) {
        this.map?.removeLayer(lay[i]);
      }
    }
  }
}
