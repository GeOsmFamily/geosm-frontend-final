import { ApiServiceService } from './../../../../services/api/api-service.service';
import { TranslateService } from '@ngx-translate/core';
import { Component, Input, NgZone, OnInit } from '@angular/core';
import { NotifierService } from 'angular-notifier';
import GeometryType from 'ol/geom/GeometryType';
import {
  VectorLayer,
  Map,
  VectorSource,
  Draw,
  CircleStyle,
  Fill,
  Style,
  Transform,
  Polyline,
  Feature,
  Icon,
  Stroke,
} from 'src/app/modules/ol';
import * as $ from 'jquery';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-routing',
  templateUrl: './routing.component.html',
  styleUrls: ['./routing.component.scss'],
})
export class RoutingComponent implements OnInit {
  @Input() map: Map | undefined;

  layerRouting: VectorLayer | undefined;

  sourceRouting: VectorSource | undefined;

  drawRouting: Draw | undefined;

  private readonly notifier: NotifierService;

  data_itineraire = {
    depart: {
      nom: '',
      coord: [],
      set: false,
    },
    destination: {
      nom: '',
      coord: [],
      set: false,
    },
    passage: {
      nom: '',
      coord: [],
      set: false,
    },
    route: {
      loading: false,
      set: false,
      data: undefined,
    },
  };

  constructor(
    notifierService: NotifierService,
    public translate: TranslateService,
    public _ngZone: NgZone
  ) {
    this.notifier = notifierService;
  }

  ngOnInit(): void {
    this.inittialiseRouting();
  }

  inittialiseRouting() {
    this.sourceRouting = new VectorSource({ wrapX: false });
    this.layerRouting = new VectorLayer({
      source: this.sourceRouting,
      //@ts-ignore
      style: (feature: Feature) => {
        if (feature.getGeometry()!.getType() == 'Point') {
          if (feature.get('data') == 'depart') {
            return new Style({
              image: new Icon({
                src: 'assets/icones/routing/depart.svg',
                scale: 2,
              }),
            });
          } else if (feature.get('data') == 'passage') {
            return new Style({
              image: new Icon({
                src: 'assets/icones/routing/passage.svg',
                scale: 2,
              }),
            });
          } else {
            return new Style({
              image: new Icon({
                src: 'assets/icones/routing/itineraire-arrivee_icone.svg',
                scale: 1,
              }),
            });
          }
        } else {
          return new Style({
            stroke: new Stroke({
              width: 6,
              color: environment.primaryColor,
            }),
          });
        }
      },
      type_layer: 'routing',
      nom: 'routing',
    });

    this.layerRouting.set('inToc', false);
    this.layerRouting.setZIndex(1000);
    this.map?.addLayer(this.layerRouting);
  }

  setPositionOfMarker(type) {
    if (type == 'depart' || type == 'passage') {
      var color = 'rgb(0, 158, 255)';
    } else {
      var color = 'rgb(255, 107, 0)';
    }
    if (this.drawRouting) {
      this.map?.removeInteraction(this.drawRouting);
    }

    this.drawRouting = new Draw({
      source: this.sourceRouting,
      type: GeometryType.POINT,
      style: new Style({
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({
            color: color,
          }),
        }),
      }),
    });

    this.map?.addInteraction(this.drawRouting);

    this.translate
      .get('notifications', { value: 'partager' })
      .subscribe((res: any) => {
        this.notifier.notify('warning', res.click_on_map_itineraire);

        this.drawRouting!.on('drawend', (e) => {
          this._ngZone.run(() => {
            //@ts-ignore
            var coord = e.feature.getGeometry()?.getCoordinates();
            var coord_4326 = Transform(coord, 'EPSG:3857', 'EPSG:4326');

            var feat_to_remove;

            for (
              let index = 0;
              index < this.layerRouting!.getSource().getFeatures().length;
              index++
            ) {
              const my_feat =
                this.layerRouting!.getSource().getFeatures()[index];
              if (my_feat.get('data') == type) {
                feat_to_remove = my_feat;
              }
            }

            if (feat_to_remove) {
              this.layerRouting!.getSource().removeFeature(feat_to_remove);
            }
            e.feature.set('data', type);
            this.data_itineraire[type]['coord'] = coord_4326;
            this.data_itineraire[type]['set'] = true;

            var geocodeOsm =
              'https://nominatim.openstreetmap.org/reverse?format=json&lat=' +
              coord_4326[1] +
              '&lon=' +
              coord_4326[0] +
              '&zoom=18&addressdetails=1';

            $.get(geocodeOsm, (data) => {
              var name = data.display_name.split(',')[0];
              this.data_itineraire[type]['nom'] = name;
            });

            this.calculate_itineraire();
            this.map?.removeInteraction(this.drawRouting!);
          });
        });
      });
  }

  calculate_itineraire() {
    if (
      this.data_itineraire.depart.coord.length == 2 &&
      this.data_itineraire.destination.coord.length == 2 &&
      this.data_itineraire.passage.coord.length == 2
    ) {
      var a = this.data_itineraire.depart.coord;
      var b = this.data_itineraire.destination.coord;
      var c = this.data_itineraire.passage.coord;
      this.data_itineraire.route.loading = true;
      this.data_itineraire.route.set = false;
      var url =
        'https://router.project-osrm.org/route/v1/driving/' +
        a[0] +
        ',' +
        a[1] +
        ';' +
        c[0] +
        ',' +
        c[1] +
        ';' +
        b[0] +
        ',' +
        b[1] +
        '?overview=full';
      $.get(url, (data) => {
        this.data_itineraire.route.loading = false;

        if (data['routes'] && data['routes'].length > 0) {
          this.data_itineraire.route.data = data;
          this.display_itineraire(data);
        }
      });
    } else if (
      this.data_itineraire.depart.coord.length == 2 &&
      this.data_itineraire.destination.coord.length == 2
    ) {
      var a = this.data_itineraire.depart.coord;
      var b = this.data_itineraire.destination.coord;
      this.data_itineraire.route.loading = true;
      this.data_itineraire.route.set = false;
      var url =
        'https://router.project-osrm.org/route/v1/driving/' +
        a[0] +
        ',' +
        a[1] +
        ';' +
        b[0] +
        ',' +
        b[1] +
        '?overview=full';
      $.get(url, (data) => {
        this.data_itineraire.route.loading = false;

        if (data['routes'] && data['routes'].length > 0) {
          this.data_itineraire.route.data = data;
          this.display_itineraire(data);
        }
      });
    }
  }

  display_itineraire(data) {
    var route = new Polyline({
      factor: 1e5,
    }).readGeometry(data.routes[0].geometry, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    });

    var newMarker = new Feature({
      data: 'route',
      geometry: route,
    });

    var feat_to_remove;
    for (
      let index = 0;
      index < this.layerRouting!.getSource().getFeatures().length;
      index++
    ) {
      const my_feat = this.layerRouting!.getSource().getFeatures()[index];
      if (my_feat.get('data') == 'route') {
        feat_to_remove = my_feat;
      }
    }

    if (feat_to_remove) {
      this.layerRouting!.getSource().removeFeature(feat_to_remove);
    }
    this.data_itineraire.route.set = true;
    this.layerRouting!.getSource().addFeature(newMarker);
  }

  formatTimeInineraire(timesSecondes: number): string {
    var duration = moment.duration(timesSecondes, 'seconds');
    var hours = '0' + duration.hours();
    var minutes = '0' + duration.minutes();
    return hours.slice(-2) + 'h' + minutes.slice(-2);
  }

  formatDistance(distanceMeters: number): string {
    var distanceKm = distanceMeters / 1000;
    return distanceKm.toFixed(2);
  }

  clear_itineraire() {
    this.layerRouting!.getSource().clear();
    this.data_itineraire.route.set = false;
    this.data_itineraire.depart.coord = [];
    this.data_itineraire.depart.nom = '';
    this.data_itineraire.destination.coord = [];
    this.data_itineraire.destination.nom = '';
    this.data_itineraire.passage.coord = [];
    this.data_itineraire.passage.nom = '';
  }
}
