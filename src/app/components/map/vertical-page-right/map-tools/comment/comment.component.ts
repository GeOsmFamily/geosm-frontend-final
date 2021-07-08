import {
  Feature,
  GeoJSON,
  Icon,
  Map,
  Overlay,
  Point,
  Style,
  VectorLayer,
  VectorSource,
} from 'src/app/modules/ol';
import { Component, Input, NgZone } from '@angular/core';
import { MapHelper } from 'src/app/helpers/mapHelper';
import { environment } from 'src/environments/environment';
import * as $ from 'jquery';
import { transform } from 'ol/proj';
import { MapBrowserEvent } from 'ol';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
})
export class CommentComponent {
  @Input() map: Map | undefined;

  @Input() modeComment;

  newMarker;

  responseComment;

  checked = false;

  vectorLayer;
  constructor(public zone: NgZone) {}

  displayComments() {
    var mapHelper = new MapHelper();
    if (!this.checked) {
      var url_comments = environment.url_prefix + 'getEntite';
      $.get(url_comments, (data) => {
        var layer_comments;
        var layer_commentsPoint;

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

        this.vectorLayer = new VectorLayer({
          source: vectorSource,
          style: new Style({
            image: new Icon({
              crossOrigin: 'anonymous',
              src: 'assets/icones/comment.png',
              scale: 0.1,
            }),
          }),
        });

        if (layer_commentsPoint) {
          layer_commentsPoint.getSource().clear();
          layer_commentsPoint.setSource(vectorSource);
        }

        this.vectorLayer.set('name', 'comments');
        this.vectorLayer.set('nom', 'comments');
        this.vectorLayer.set('type', 'comments');
        this.vectorLayer.set('type_layer', 'comments');
        this.vectorLayer.setZIndex(mapHelper.getMaxZindexInMap() + 1);

        mapHelper.addLayerToMap(this.vectorLayer);

        //  this.map?.addLayer(vectorLayer);

        this.zone?.run(() => {
          this.responseComment = data;
        });
      });

      this.map?.on('singleclick', (e) => {
        this.map?.forEachLayerAtPixel(e.pixel, (layer) => {
          if (this.checked && layer.get('type') == 'comments') {
            this.displayPopupComment(e, true);
          }
        });
      });
    } else {
      mapHelper.removeLayerToMap(this.vectorLayer);
    }
  }
  displayPopupComment(e: MapBrowserEvent<UIEvent>, arg1: boolean) {
    var feature = this.map?.forEachFeatureAtPixel(e.pixel, (feature, layer) => {
      return feature;
    });
    var container = document.getElementById('popup');
    var content = document.getElementById('popup-content');
    var closer = document.getElementById('popup-closer');
    container!.style.display = 'inline';
    var overlay = new Overlay({
      element: container!,
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      },
    });

    closer!.onclick = function () {
      overlay.setPosition(undefined);
      closer?.blur();
      return false;
    };
    this.map?.addOverlay(overlay);

    var coordinate = e.coordinate;

    content!.innerHTML =
      '<p><b>Auteur : </b>' +
      feature?.getProperties().nom +
      '</p>' +
      '<p><b>Email : </b>' +
      feature?.getProperties().email +
      '</p>' +
      '<p><b>Commentaire : </b>' +
      feature?.getProperties().description;
    overlay.setPosition(coordinate);
  }
}
