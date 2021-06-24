import { TranslateService } from '@ngx-translate/core';
import { DataHelper } from './../../../../../helpers/dataHelper';
import { ApiServiceService } from './../../../../../services/api/api-service.service';
import { Component, Input, OnInit, NgZone } from '@angular/core';
import {
  CircleStyle,
  Fill,
  Map,
  Stroke,
  Style,
  VectorLayer,
  VectorSource,
  Text,
  Draw,
  Overlay,
  unByKey,
  Polygon,
  LineString,
  Circle,
  getLength,
  getArea,
} from 'src/app/modules/ol';
import { environment } from 'src/environments/environment';
import { MapHelper } from 'src/app/helpers/mapHelper';
import * as $ from 'jquery';
import OverlayPositioning from 'ol/OverlayPositioning';

@Component({
  selector: 'app-measure',
  templateUrl: './measure.component.html',
  styleUrls: ['./measure.component.scss'],
})
export class MeasureComponent implements OnInit {
  @Input() map: Map | undefined;

  environment;

  primaryColor: string = environment.primaryColor;

  source: VectorSource = new VectorSource();

  vector: VectorLayer = new VectorLayer({
    source: this.source,
    style: (feature) => {
      var color = this.primaryColor;
      if (feature.get('color')) {
        color = feature.get('color');
      }
      return new Style({
        fill: new Fill({
          color: [
            DataHelper.hexToRgb(color)!.r,
            DataHelper.hexToRgb(color)!.g,
            DataHelper.hexToRgb(color)!.b,
            0.7,
          ],
        }),
        stroke: new Stroke({
          color: color,
          width: 2,
        }),
        image: new CircleStyle({
          radius: 7,
          stroke: new Stroke({
            color: color,
            width: 2,
          }),
          fill: new Fill({
            color: [
              DataHelper.hexToRgb(color)!.r,
              DataHelper.hexToRgb(color)!.g,
              DataHelper.hexToRgb(color)!.b,
              0.7,
            ],
          }),
        }),
        text: new Text({
          font: 'bold 18px Calibri,sans-serif',
          fill: new Fill({
            color: color,
          }),
          text: feature.get('comment'),
          stroke: new Stroke({ color: '#fff', width: 2 }),
        }),
      });
    },
    //@ts-ignore
    type: 'measure',
    name: 'measure',
  });

  draw: Draw | undefined;

  sketch;

  helpTooltipElement: HTMLElement | undefined;

  helpTooltip: Overlay | undefined;

  measureTooltipElement: HTMLElement | undefined;

  measureTooltip: Overlay | undefined;

  continuePolygonMsg: string = 'Click to continue drawing the polygon';

  continueLineMsg: string = 'Click to continue drawing the line';

  event_measure;

  listener;

  constructor(
    public apiService: ApiServiceService,
    public translate: TranslateService,
    public _ngZone: NgZone
  ) {
    this.environment = environment;
  }

  public measureModel: {
    Polygon: { active: boolean };
    LineString: { active: boolean };
    Circle: { active: boolean };
  } = {
    Polygon: { active: false },
    LineString: { active: false },
    Circle: { active: false },
  };

  ngOnInit() {
    var mapHelper = new MapHelper(this.map);
    var groupLayerShadow = mapHelper.getLayerGroupByNom('group-layer-shadow');
    this.vector.setZIndex(1000);
    groupLayerShadow.getLayers().getArray().unshift(this.vector);

    this.translate.get('right_menu').subscribe((res: any) => {
      console.log(res);
      this.continuePolygonMsg = res.tools.mesure.continuePolygonMsg;
      this.continueLineMsg = res.tools.mesure.continueLineMsg;
    });
  }

  toogleMeasureInteraction(type: 'Polygon' | 'LineString' | 'Circle') {
    if (this.measureModel[type].active) {
      this.measureModel[type].active = false;
      this.clearDraw();
    } else {
      for (const key in this.measureModel) {
        if (this.measureModel.hasOwnProperty(key) && key != type) {
          const element = this.measureModel[key];
          element.active = false;
        }
      }
      this.measureModel[type].active = true;
      this.addInteraction(type);
    }
  }

  clearDraw() {
    this.removeMeasureToApps();
    if (document.querySelectorAll('.tooltip.tooltip-measure').length > 0) {
      $('.tooltip.tooltip-measure').hide();
    }
    this.source.clear();
  }

  removeMeasureToApps() {
    if (this.draw) {
      this.map?.removeInteraction(this.draw);
    }

    this.sketch = null;
    // unset tooltip so that a new one can be created
    this.helpTooltipElement = null!;
    this.measureTooltipElement = null!;
    unByKey(this.listener);
    unByKey(this.event_measure);

    if (this.measureTooltip) {
      this.map?.removeOverlay(this.measureTooltip);
    }

    if (this.helpTooltip) {
      this.map?.removeOverlay(this.helpTooltip);
    }

    for (const key in this.measureModel) {
      if (this.measureModel.hasOwnProperty(key)) {
        const element = this.measureModel[key];
        element.active = false;
      }
    }
  }

  addInteraction(type: 'Polygon' | 'LineString' | 'Circle') {
    this.removeMeasureToApps();
    this.measureModel[type].active = true;
    this.event_measure = this.map?.on('pointermove', (evt) => {
      this._ngZone.run(() => {
        this.pointerMoveHandler(evt);
      });
    });
    this.draw = new Draw({
      source: this.source,
      //@ts-ignore
      type: type,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)',
        }),
        stroke: new Stroke({
          color: 'rgba(0, 0, 0, 0.5)',
          lineDash: [10, 10],
          width: 2,
        }),
        image: new CircleStyle({
          radius: 5,
          stroke: new Stroke({
            color: 'rgba(0, 0, 0, 0.7)',
          }),
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)',
          }),
        }),
      }),
    });

    this.map?.addInteraction(this.draw);

    this.createMeasureTooltip();
    this.createHelpTooltip();

    this.draw.on('drawstart', (evt) => {
      this.sketch = evt.feature;

      //@ts-ignore
      var tooltipCoord = evt.coordinate;

      this.listener = this.sketch.getGeometry().on('change', (evt) => {
        var geom = evt.target;
        var output;
        if (geom instanceof Polygon) {
          output = this.formatArea(geom);
          tooltipCoord = geom.getInteriorPoint().getCoordinates();
        } else if (geom instanceof LineString || geom instanceof Circle) {
          output = this.formatLength(geom);
          tooltipCoord = geom.getLastCoordinate();
          if (geom instanceof Circle) {
            tooltipCoord = geom.getCenter();
          }
        }
        this.measureTooltipElement!.innerHTML = output;
        this.measureTooltip?.setPosition(tooltipCoord);
      });
    });

    this.draw.on('drawend', () => {
      this.measureTooltipElement!.className = 'tooltip tooltip-measure';
      this.measureTooltip?.setOffset([0, -7]);
      this.sketch = null;
      this.measureTooltipElement = null!;
      this.createMeasureTooltip();
      unByKey(this.listener);
    });
  }

  pointerMoveHandler(evt) {
    if (evt.dragging) {
      return;
    }
    var helpMsg = 'Click to start drawing';

    this.translate.get('right_menu').subscribe((res: any) => {
      helpMsg = res.tools.mesure.helpSrartMeasure;
    });

    if (this.sketch) {
      var geom = this.sketch.getGeometry();
      if (geom instanceof Polygon || geom instanceof Circle) {
        helpMsg = this.continuePolygonMsg;
      } else if (geom instanceof LineString) {
        helpMsg = this.continueLineMsg;
      }
    }

    this.helpTooltipElement!.innerHTML = helpMsg;
    this.helpTooltip?.setPosition(evt.coordinate);

    this.helpTooltipElement?.classList.remove('hidden');
  }

  createMeasureTooltip() {
    if (this.measureTooltipElement) {
      this.measureTooltipElement?.parentNode?.removeChild(
        this.measureTooltipElement
      );
    }
    this.measureTooltipElement = document.createElement('div');
    this.measureTooltipElement.className = 'tooltip tooltip-measure';
    this.measureTooltip = new Overlay({
      element: this.measureTooltipElement,
      offset: [0, -15],
      positioning: OverlayPositioning.BOTTOM_CENTER,
    });
    this.map?.addOverlay(this.measureTooltip);
  }

  createHelpTooltip() {
    if (this.helpTooltipElement) {
      this.helpTooltipElement?.parentNode?.removeChild(this.helpTooltipElement);
    }
    this.helpTooltipElement = document.createElement('div');
    this.helpTooltipElement.className = 'tooltip hidden';
    this.helpTooltip = new Overlay({
      element: this.helpTooltipElement,
      offset: [15, 0],
      positioning: OverlayPositioning.CENTER_LEFT,
    });
    this.map?.addOverlay(this.helpTooltip);
  }

  formatLength(line) {
    if (line.getType() == 'Circle') {
      var length: number = line.getRadius();
    } else {
      var length = getLength(line);
    }

    var output;
    if (length > 100) {
      output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
    } else {
      output = Math.round(length * 100) / 100 + ' ' + 'm';
    }
    return output;
  }

  formatArea(polygon) {
    var area = getArea(polygon);
    var output;
    if (area > 10000) {
      output =
        Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
    } else {
      output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
    }
    return output;
  }
}
