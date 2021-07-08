import { ComponentHelper } from './../../../../../helpers/componentHelper';
import { ApiServiceService } from './../../../../../services/api/api-service.service';
import { TranslateService } from '@ngx-translate/core';
import { DataHelper } from './../../../../../helpers/dataHelper';
import {
  DrawToolInterace,
  ModelOfDrawDataInDBInterface,
  ModifyToolInterface,
  ModifyToolTypeInterface,
  PropertiesFeatureInterface,
} from './../../../../../interfaces/drawInterface';
import { Component, Input, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NotifierService } from 'angular-notifier';
import OverlayPositioning from 'ol/OverlayPositioning';
import {
  VectorSource,
  VectorLayer,
  Style,
  Fill,
  Stroke,
  CircleStyle,
  Draw,
  Modify,
  Select,
  Overlay,
  Map,
  Text,
  unByKey,
  Feature,
  GeoJSON,
} from 'src/app/modules/ol';
import { environment } from 'src/environments/environment';
import { MapHelper } from 'src/app/helpers/mapHelper';
import * as $ from 'jquery';

@Component({
  selector: 'app-draw',
  templateUrl: './draw.component.html',
  styleUrls: ['./draw.component.scss'],
})
export class DrawComponent implements OnInit {
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
          offsetY: 15,
          fill: new Fill({
            color: color,
          }),
          text: feature.get('comment'),
          stroke: new Stroke({ color: '#fff', width: 2 }),
        }),
      });
    },
    //@ts-ignore
    type_layer: 'draw',
    nom: 'draw',
  });

  draw: Draw | undefined;

  modify: Modify = new Modify({
    source: this.source,
    style: new Style({
      fill: new Fill({
        color: [255, 0, 255, 0.7],
      }),
      stroke: new Stroke({
        color: [255, 0, 255, 1],
        width: 2,
      }),
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({
          color: [255, 0, 255, 0.7],
        }),
        stroke: new Stroke({
          color: [255, 0, 255, 1],
          width: 2,
        }),
      }),
    }),
  });

  select: Select = new Select({
    layers: [this.vector],
    style: new Style({
      fill: new Fill({
        color: [255, 255, 0, 0.7],
      }),
      stroke: new Stroke({
        color: '#ffff00',
        width: 2,
      }),
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({
          color: [255, 255, 0, 0.7],
        }),
        stroke: new Stroke({
          color: '#ffff00',
          width: 2,
        }),
      }),
    }),
  });

  overlayColor: Overlay = new Overlay({
    position: undefined,
    positioning: OverlayPositioning.TOP_LEFT,
    element: document.getElementById('overlay-draw-color')!,
    stopEvent: true,
  });

  overlay: Overlay = new Overlay({
    position: undefined,
    positioning: OverlayPositioning.TOP_LEFT,
    element: document.getElementById('overlay-draw-text')!,
    stopEvent: true,
  });

  formulaireText: FormGroup | undefined;

  /**
   * Differents type of draw
   */
  drawTools: {
    Point: DrawToolInterace;
    LineString: DrawToolInterace;
    Polygon: DrawToolInterace;
    Text: DrawToolInterace;
    key: Array<any>;
  } = {
    Point: {} as DrawToolInterace,
    LineString: {} as DrawToolInterace,
    Polygon: {} as DrawToolInterace,
    Text: {} as DrawToolInterace,
    key: [],
  };

  modifyTool: ModifyToolInterface = {
    active: false,
    geometry: { active: false },
    comment: { active: false },
    color: { active: false },
    delete: { active: false },
    interactions: [],
    key: [],
  };

  private readonly notifier: NotifierService;
  constructor(
    public notifierService: NotifierService,
    public _ngZone: NgZone,
    public fb: FormBuilder,
    public translate: TranslateService,
    public apiService: ApiServiceService,
    public componentHelper: ComponentHelper
  ) {
    this.notifier = notifierService;
  }

  ngOnInit() {
    this.map?.addOverlay(this.overlay);
    this.map?.addOverlay(this.overlayColor);
    var mapHelper = new MapHelper(this.map);
    this.vector.set(
      'iconImagette',
      environment.url_frontend + '/assets/icones/draw.svg'
    );
    this.vector.set('inToc', false);

    mapHelper.addLayerToMap(this.vector);
  }

  toogleAddDraw(type: 'Point' | 'LineString' | 'Polygon') {
    this.desactivateAllModificationTool();
    if (this.drawTools[type].active) {
      this.desactivateAllAddTool();
      this.drawTools[type].active = false;
    } else {
      if (this.draw) {
        this.desactivateAllAddTool();
      }
      this.addInteractions(type);
      this.drawTools[type].active = true;
    }
  }

  desactivateAllModificationTool() {
    this.modifyTool.geometry.active = false;
    this.modifyTool.comment.active = false;
    this.modifyTool.color.active = false;
    this.modifyTool.delete.active = false;
    $('#overlay-draw-color').hide();
    this.removeAllModifiactionInteraction();
  }

  removeAllModifiactionInteraction() {
    for (let index = 0; index < this.modifyTool.interactions.length; index++) {
      this.map?.removeInteraction(this.modifyTool.interactions[index]);
    }

    for (let index = 0; index < this.modifyTool.key.length; index++) {
      unByKey(this.modifyTool.key[index]);
    }

    this.modifyTool.interactions = [];
    this.modifyTool.key = [];
  }

  desactivateAllAddTool() {
    for (const key in this.drawTools) {
      if (this.drawTools.hasOwnProperty(key) && key != 'key') {
        const element = this.drawTools[key];
        element.active = false;
      }
    }
    this.removeAddInteraction();
  }

  removeAddInteraction() {
    this.map?.removeInteraction(this.draw!);
    for (let index = 0; index < this.drawTools.key.length; index++) {
      const element = this.drawTools.key[index];
      unByKey(element);
    }
    this.draw = undefined;
  }

  addInteractions(type: 'Point' | 'LineString' | 'Polygon') {
    this.draw = new Draw({
      source: this.source,
      //@ts-ignore
      type: type,
    });
    this.map?.addInteraction(this.draw);

    var keyEventStart = this.draw.on('drawstart', (DrawEvent: any) => {
      this._ngZone.run(() => {
        this.hideOverlay();
        this.vector.setZIndex(1000);
      });
    });

    var keyEventEnd = this.draw.on('drawend', (DrawEvent: any) => {
      this._ngZone.run(() => {
        var drawFeature: Feature = DrawEvent.feature;
        drawFeature.set('type', type);
        let featureId = DataHelper.makeid();
        let allFeatureIds = MapHelper.listIdFromSource(this.source);

        while (allFeatureIds.indexOf(featureId) != -1) {
          featureId = DataHelper.makeid();
        }

        drawFeature.setId(featureId);
        //@ts-ignore
        let positionOfOverlay = drawFeature
          .getGeometry()
          //@ts-ignore
          ?.getLastCoordinate();

        this.constructFormText({
          comment: '',
          color: this.primaryColor,
          featureId: featureId,
        });

        this.showOverlay(positionOfOverlay);
      });
    });

    this.drawTools.key.push(keyEventStart);
    this.drawTools.key.push(keyEventEnd);
  }

  hideOverlay() {
    $('#overlay-draw-text').hide();
  }

  showOverlay(coordinates: Array<number>) {
    if (!this.overlay.getElement()) {
      this.overlay.setElement(document.getElementById('overlay-draw-text')!);
    }
    this.overlay.setPosition(coordinates);
    $('#overlay-draw-text').show();
  }

  constructFormText(properties: PropertiesFeatureInterface) {
    if (!this.formulaireText) {
      this.formulaireText = this.fb.group({});
    }

    for (const key in properties) {
      if (properties.hasOwnProperty(key)) {
        const element = properties[key];
        if (this.formulaireText.controls[key]) {
          this.formulaireText.controls[key].setValue(element);
        } else {
          this.formulaireText.addControl(key, new FormControl(element));
        }
      }
    }
  }

  getDrawTool(type: 'Point' | 'LineString' | 'Polygon'): DrawToolInterace {
    return this.drawTools[type];
  }

  modifyDraw(type: 'geometry' | 'comment' | 'color' | 'delete') {
    if (type == 'comment') {
      this.toogleModifyDrawComment();
    } else if (type == 'geometry') {
      this.toogleModifyDrawGeometry();
    } else if (type == 'delete') {
      this.toogleModifyDeleteFeature();
    } else if (type == 'color') {
      this.toogleModifyDrawColor();
    }
  }

  toogleModifyDrawComment() {
    if (this.modifyTool.comment.active) {
      this.desactivateAllModificationTool();
    } else {
      this.desactivateAllModificationTool();

      this.modifyTool.comment.active = true;

      this.map?.addInteraction(this.select);

      var keyEventSelect = this.select.on('select', (SelectEvent: any) => {
        let selectFeatures: Array<Feature> = SelectEvent.selected;

        if (selectFeatures.length > 0) {
          var feature = selectFeatures[0];

          //@ts-ignore
          let positionOfOverlay = feature.getGeometry()?.getLastCoordinate();

          this.constructFormText({
            comment: feature.get('comment') ? feature.get('comment') : '',
            color: feature.get('color') ? feature.get('color') : undefined,
            featureId: feature.getId()?.toString()!,
          });

          this.showOverlay(positionOfOverlay);
        }

        var features = this.select.getFeatures();
        features.clear();
      });

      this.modifyTool.interactions.push(this.select);
      this.modifyTool.key.push(keyEventSelect);
    }
  }

  toogleModifyDrawGeometry() {
    if (this.modifyTool.geometry.active) {
      this.desactivateAllModificationTool();
    } else {
      this.desactivateAllModificationTool();

      this.modifyTool.geometry.active = true;

      this.map?.addInteraction(this.modify);
      this.modifyTool.interactions.push(this.modify);
    }
  }

  toogleModifyDeleteFeature() {
    if (this.modifyTool.delete.active) {
      this.desactivateAllModificationTool();
    } else {
      this.desactivateAllModificationTool();

      this.modifyTool.delete.active = true;

      this.map?.addInteraction(this.select);

      var keyEventSelect = this.select.on('select', (SelectEvent: any) => {
        let selectFeatures: Array<Feature> = SelectEvent.selected;
        if (selectFeatures.length > 0) {
          var feature = selectFeatures[0];
          this.source.removeFeature(feature);
        }
      });

      this.modifyTool.interactions.push(this.select);
      this.modifyTool.key.push(keyEventSelect);
    }
  }

  toogleModifyDrawColor() {
    if (this.modifyTool.color.active) {
      this.desactivateAllModificationTool();
    } else {
      this.desactivateAllModificationTool();

      this.modifyTool.color.active = true;

      this.map?.addInteraction(this.select);

      var keyEventSelect = this.select.on('select', (SelectEvent: any) => {
        let selectFeatures: Array<Feature> = SelectEvent.selected;
        if (selectFeatures.length > 0) {
          var feature = selectFeatures[0];
          //@ts-ignore
          let positionOfOverlay = feature.getGeometry()?.getLastCoordinate();
          if (!this.overlayColor.getElement()) {
            this.overlayColor.setElement(
              document.getElementById('overlay-draw-color')!
            );
          }

          this.constructFormText({
            comment: feature.get('comment') ? feature.get('comment') : '',
            color: feature.get('color') ? feature.get('color') : undefined,
            featureId: feature.getId()?.toString()!,
          });

          this.overlayColor.setPosition(positionOfOverlay);
          $('#overlay-draw-color').show();

          var features = this.select.getFeatures();
          features.clear();
        }
      });

      this.modifyTool.interactions.push(this.select);
      this.modifyTool.key.push(keyEventSelect);
    }
  }

  getModifyTool(
    type: 'geometry' | 'comment' | 'color' | 'delete'
  ): ModifyToolTypeInterface {
    return this.modifyTool[type];
  }

  toogleModifyDraw() {
    if (this.source.getFeatures().length > 0) {
      if (this.modifyTool.active) {
        this.modifyTool.active = false;
        this.desactivateAllModificationTool();
      } else {
        this.desactivateAllAddTool();
        this.modifyTool.active = true;
      }
    } else {
      this.modifyTool.active = false;
      this.desactivateAllModificationTool();

      this.translate
        .get('draw_in_map', { value: 'caracteristique' })
        .subscribe((res: any) => {
          this.notifier.notify('default', 'Aucun dessin actif');
        });
    }
  }

  shareAllDraw() {
    if (this.source.getFeatures().length > 0) {
      let dataToSendInDB: Array<ModelOfDrawDataInDBInterface> = [];

      for (let index = 0; index < this.source.getFeatures().length; index++) {
        const feature = this.source.getFeatures()[index];
        dataToSendInDB.push({
          type: feature.get('type'),
          comment: feature.get('comment') ? feature.get('comment') : '',
          hexa_code: feature.get('color')
            ? feature.get('color')
            : this.primaryColor,
          geom: new GeoJSON().writeGeometryObject(feature.getGeometry()!),
          //@ts-ignore
          geometry: feature.getGeometry()?.getCoordinates(),
        });
      }
      $('.accordion-draw-loading').show();
      this.apiService
        .post_requete('geoportail/saveDraw/', {
          donnes: dataToSendInDB,
        })
        .then(
          (response) => {
            $('.accordion-draw-loading').hide();
            if (response['status'] == 'ok') {
              var url_share =
                environment.url_frontend +
                '?share=draw&id=' +
                response['code_dessin'];
              this.componentHelper.openSocialShare(url_share, 7);
            } else {
              this.translate.get('backend_error').subscribe((res: any) => {
                this.notifier.notify('error', res);
              });
            }
          },
          (error) => {
            $('.accordion-draw-loading').hide();
            this.translate.get('backend_error').subscribe((res: any) => {
              this.notifier.notify('error', res);
            });
          }
        );
    } else {
      this.translate.get('draw_in_map').subscribe((res: any) => {
        this.notifier.notify('default', 'Aucun dessin actif');
      });
    }
  }

  deleteleAllDraw() {
    this.source.clear();
  }

  saveFormToFeaturePte() {
    if (this.formulaireText?.controls['featureId']) {
      console.log(this.formulaireText?.getRawValue());
      var feature = this.source.getFeatureById(
        this.formulaireText.controls['featureId'].value
      );
      for (const key in this.formulaireText.getRawValue()) {
        if (this.formulaireText.getRawValue().hasOwnProperty(key)) {
          const element = this.formulaireText.getRawValue()[key];
          feature.set(key, element);
        }
      }
    }
    this.hideOverlay();
    this.hideOverlayColor();
  }

  hideOverlayColor() {
    $('#overlay-draw-color').hide();
  }

  colorChanged(new_color: string) {
    this.formulaireText?.controls['color'].setValue(new_color);
  }
}
