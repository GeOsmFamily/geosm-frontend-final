import { DataHelper } from './../../../../helpers/dataHelper';
import { ShareServiceService } from './../../../../services/share/share-service.service';
import { ApiServiceService } from './../../../../services/api/api-service.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NotifierService } from 'angular-notifier';
import { AttributeInterface } from 'src/app/interfaces/attributesInterfaces';
import { DescriptiveSheet } from 'src/app/interfaces/DescriptiveSheet';
import { ImageWMS, TileWMS, GeoJSON } from 'src/app/modules/ol';
import { MapHelper } from 'src/app/helpers/mapHelper';
import { delayWhen, retryWhen, take, tap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { timer } from 'rxjs';
import { MeasureUtil } from 'src/app/utils/measureUtils';

@Component({
  selector: 'app-osm-sheet',
  templateUrl: './osm-sheet.component.html',
  styleUrls: ['./osm-sheet.component.scss'],
})
export class OsmSheetComponent implements OnInit {
  @Input() descriptiveModel: DescriptiveSheet | undefined;

  @Output()
  updatemMdelDescriptiveSheet: EventEmitter<DescriptiveSheet> = new EventEmitter();

  @Output() closeDescriptiveSheet: EventEmitter<any> = new EventEmitter();

  listAttributes: AttributeInterface[] = [];

  name: string | undefined;

  adresse: string | undefined;

  osmId: number | undefined;

  osmUrl: string | undefined;

  loading: {
    properties: boolean;
    osmUrl: boolean;
  } = {
    properties: false,
    osmUrl: false,
  };

  initialNumberOfAttributes: number = 5;

  private readonly notifier: NotifierService;

  configTagsOsm:
    | {
        [key: string]: {
          display: boolean;

          type: string;
          header: string;

          prefix?: string;

          surfix?: string;

          values?: { [key: string]: Object };
        };
      }
    | undefined;

  constructor(
    notifierService: NotifierService,
    public apiService: ApiServiceService
  ) {
    this.notifier = notifierService;
  }

  ngOnDestroy(): void {
    this.name = undefined;
    this.osmId = undefined;
    this.osmUrl = undefined;
    this.initialNumberOfAttributes = 5;
  }

  async ngOnInit() {
    await this.apiService
      .getRequestFromOtherHost('/assets/config/config_tags.json')
      .then((response) => {
        this.configTagsOsm = response;
      });

    if (this.descriptiveModel?.properties) {
      this.formatFeatureAttributes();
    } else {
      this.getPropertiesFromCartoServer();
    }

    this.descriptiveModel!.getShareUrl = function (
      environment,
      shareService: ShareServiceService
    ) {
      return (
        environment.url_frontend +
        '?' +
        shareService.shareFeature(
          this.layer.properties!['type'],
          this.layer.properties!['couche_id'],
          this.layer.properties!['group_id'],
          this.coordinates_3857,
          this.properties['osm_id']
        )
      );
    };

    this.updatemMdelDescriptiveSheet.emit(this.descriptiveModel);
  }

  formatFeatureAttributes() {
    this.listAttributes = [];

    if (this.descriptiveModel?.properties['name']) {
      this.name = this.descriptiveModel.properties['name'];
    }

    if (this.descriptiveModel?.properties['osm_id']) {
      this.osmId = this.descriptiveModel.properties['osm_id'];
      this.getOsmLink();
    }

    if (this.descriptiveModel?.properties['hstore_to_json']) {
      let values_hstore_to_json: AttributeInterface[] = [];
      if (
        typeof this.descriptiveModel.properties['hstore_to_json'] === 'object'
      ) {
        values_hstore_to_json = this._formatHtsore(
          this.descriptiveModel.properties['hstore_to_json']
        );
      } else if (
        typeof this.descriptiveModel.properties['hstore_to_json'] === 'string'
      ) {
        let stringToJson = function (myString) {
          let myObject = {};
          for (let index = 0; index < myString.split(',').length; index++) {
            const element = myString.split(',')[index];
            myObject[element.split(': ')[0].replace(/\s/, '')] =
              element.split(': ')[1];
          }
          return JSON.stringify(myObject);
        };

        try {
          let objetHstore = JSON.parse(
            stringToJson(this.descriptiveModel.properties['hstore_to_json'])
          );

          values_hstore_to_json = this._formatHtsore(objetHstore);
        } catch (error) {
          console.error(
            error,
            stringToJson(this.descriptiveModel.properties['hstore_to_json'])
          );
          values_hstore_to_json = [];
        }
      }
      for (let index = 0; index < values_hstore_to_json.length; index++) {
        const element = values_hstore_to_json[index];
        this.listAttributes.push({
          field: element.field,
          value: element.value,
          display: element.display,
        });
      }
    }

    for (const key in this.descriptiveModel?.properties) {
      if (
        this.descriptiveModel?.properties.hasOwnProperty(key) &&
        this.descriptiveModel.properties[key] &&
        ['number', 'string'].indexOf(
          typeof this.descriptiveModel.properties[key]
        ) != -1 &&
        ['fid', 'osm_id', 'name', 'gid', 'osm_uid', 'featureId'].indexOf(key) ==
          -1
      ) {
        const value = this.descriptiveModel.properties[key];

        var positionOfKeyInListAttribute =
          DataHelper.isAttributesInObjectOfAnArray(
            this.listAttributes,
            key,
            value
          );
        if (positionOfKeyInListAttribute) {
          this.listAttributes.splice(positionOfKeyInListAttribute, 1, {
            field: key,
            value: value,
            display: true,
          });
        } else {
          this.listAttributes.push({
            field: key,
            value: value,
            display: true,
          });
        }
      }
    }

    this.constructAdresse();
  }

  getPropertiesFromCartoServer() {
    if (
      this.descriptiveModel?.layer.layer.getSource() instanceof ImageWMS ||
      this.descriptiveModel?.layer.layer.getSource() instanceof TileWMS
    ) {
      this.loading.properties = true;
      var url =
        this.descriptiveModel.layer.layer
          .getSource()
          .getFeatureInfoUrl(
            this.descriptiveModel.coordinates_3857,
            new MapHelper().map?.getView().getResolution(),
            'EPSG:3857'
          ) +
        '&WITH_GEOMETRY=true&FI_POINT_TOLERANCE=30&FI_LINE_TOLERANCE=10&FI_POLYGON_TOLERANCE=10&INFO_FORMAT=application/json';

      this.apiService
        .getRequestFromOtherHostObserver(url)
        .pipe(
          retryWhen((errors) =>
            errors.pipe(
              tap((val: HttpErrorResponse) => {}),
              delayWhen((val: HttpErrorResponse) => timer(2000)),
              take(3)
            )
          )
        )
        .subscribe(
          (response: any) => {
            this.loading.properties = false;
            try {
              var features = new GeoJSON().readFeatures(response, {});

              if (features.length > 0) {
                var properties = features[0].getProperties();
                var geometry = features[0].getGeometry();
                this.descriptiveModel!.properties = properties;
                this.descriptiveModel!.geometry = geometry;
                this.updatemMdelDescriptiveSheet.emit(this.descriptiveModel);

                this.formatFeatureAttributes();
              } else {
                this.closeDescriptiveSheet.emit();
              }
            } catch (error) {
              this.notifier.notify(
                'error',
                'un problème est survenue lors du traitement des informations du serveur cartograohique'
              );
            }
          },
          (error) => {
            this.loading.properties = false;
            this.notifier.notify(
              'error',
              'Impossible de recuperer les informations du serveur cartograohique'
            );
          }
        );
    }
  }

  _formatHtsore(hstore_to_json: Object): AttributeInterface[] {
    let values: AttributeInterface[] = [];
    for (const key in hstore_to_json) {
      if (
        hstore_to_json.hasOwnProperty(key) &&
        [
          'osm_user',
          'osm_changeset',
          'osm_timestamp',
          'osm_version',
          'osm_uid',
          'featureId',
        ].indexOf(key) == -1
      ) {
        const value = hstore_to_json[key];

        values.push({
          field: key,
          value: value,
          display: true,
        });
      }
    }
    return values;
  }

  getOsmLink() {
    if (this.osmId) {
      this.loading.osmUrl = true;
      var url =
        'https://nominatim.openstreetmap.org/lookup?osm_ids=R' +
        Math.abs(this.osmId) +
        ',W' +
        Math.abs(this.osmId) +
        ',N' +
        Math.abs(this.osmId) +
        '&format=json';

      this.apiService.getRequestFromOtherHost(url).then(
        (response: any) => {
          this.loading.osmUrl = false;
          if (response.length > 0) {
            var osm_type = response[0].osm_type;
            var osm_id = response[0].osm_id;
            this.osmUrl =
              'https://www.openstreetmap.org/' + osm_type + '/' + osm_id;

            if (osm_type == 'relation') {
              var osm_type_small = 'R';
            } else if (osm_type == 'way') {
              var osm_type_small = 'W';
            } else if (osm_type == 'node') {
              var osm_type_small = 'N';
            }
          }
        },
        (error) => {
          this.loading.osmUrl = false;
        }
      );
    }
  }

  constructAdresse() {
    var count_adresse = 0;
    var adresse = {
      housenumber: '',
      street: '',
      city: '',
      postcode: '',
    };

    for (let index = 0; index < this.listAttributes.length; index++) {
      const element = this.listAttributes[index];
      if (element.field == 'addr:city') {
        count_adresse = count_adresse + 1;
        adresse.city = element.value;
      }
      if (element.field == 'addr:street') {
        count_adresse = count_adresse + 1;
        adresse.street = element.value;
      }
      if (element.field == 'addr:housenumber') {
        count_adresse = count_adresse + 1;
        adresse.housenumber = element.value;
      }
      if (element.field == 'addr:postcode') {
        count_adresse = count_adresse + 1;
        adresse.postcode = element.value;
      }
    }
    if (adresse.housenumber && adresse.street) {
      this.adresse =
        adresse.housenumber +
        ' ' +
        adresse.street +
        ' ' +
        adresse.city +
        ' ' +
        adresse.postcode;
    }
  }

  formatArea(area): string {
    var intArea = parseFloat(area);
    var unit: 'sqm' | 'hectar' | 'sqkm' | 'sqft' | 'sqmi' = 'sqm';
    var unitHuman = 'm²';
    if (area > 10000) {
      unit = 'hectar';
      unitHuman = 'hectare';
    }

    if (area > 100000000) {
      unit = 'sqkm';
      unitHuman = 'Km²';
    }

    return (
      Math.round(
        (new MeasureUtil().getFormattedArea(unit, intArea) + Number.EPSILON) *
          100
      ) /
        100 +
      ' ' +
      unitHuman
    );
  }

  openUrl(url) {
    window.open(url, '_blank');
  }

  alertValue(value: string) {
    alert(value);
  }
}
