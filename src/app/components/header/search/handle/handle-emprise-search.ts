import { ApiServiceService } from './../../../../services/api/api-service.service';
import { AppInjector } from 'src/app/helpers/injectorHelper';
import { StorageServiceService } from 'src/app/services/storage/storage-service.service';
import { ConfigProjetInterface } from 'src/app/interfaces/configProjetInterface';
import { FilterOptionInterface } from 'src/app/interfaces/filterOptionInterface';
import { MapHelper } from 'src/app/helpers/mapHelper';
import { Feature, GeoJSON, getArea } from 'src/app/modules/ol';

export class HandleEmpriseSearch {
  storageService: StorageServiceService = AppInjector.get(
    StorageServiceService
  );
  apiService: ApiServiceService = AppInjector.get(ApiServiceService);
  configProject: ConfigProjetInterface = this.storageService.getConfigProjet();

  constructor() {
    this.configProject = this.storageService.getConfigProjet();
  }

  formatDataForTheList(responseDB: any): Array<FilterOptionInterface> {
    if (responseDB.error) {
      return [];
    }
    var response: Array<FilterOptionInterface> = [];
    for (const key in responseDB) {
      if (responseDB.hasOwnProperty(key) && key != 'status') {
        const element = responseDB[key];
        for (let index = 0; index < element.length; index++) {
          const responseI = element[index];
          if (this._getLimitName(key)) {
            response.push({
              ref: responseI['ref'],
              name: responseI['name'],
              id: responseI['id'],
              table: key,
              limitName: this._getLimitName(key),
              typeOption: 'limites',
            });
          }
        }
      }
    }
    return response;
  }

  _getLimitName(tableName: string): string {
    var response;
    for (let index = 0; index < this.configProject.limites.length; index++) {
      const element = this.configProject.limites[index];
      if (element.nom_table == tableName) {
        response = element.nom;
      }
    }
    return response;
  }

  displayWith(emprise: FilterOptionInterface): string {
    if (emprise) {
      if (emprise.ref) {
        return emprise.name + '(' + emprise.ref + ')';
      } else {
        return emprise.name;
      }
    } else {
      return '';
    }
  }

  optionSelected(emprise: FilterOptionInterface) {
    if (!emprise.geometry) {
      var mapHelper = new MapHelper();
      this._getGeometryOfEmprise({
        table: emprise.table,
        id: emprise.id,
      }).then((geometry) => {
        if (geometry) {
          emprise.geometry = geometry;
          this._addGeometryAndZoomTO(emprise);
          this.storageService.adminstrativeLimitLoad.next({
            table: emprise.table,
            id: emprise.id,
            ref: emprise.ref,
            limitName: emprise.limitName,
            name: emprise.name,
            geometry: geometry,
          });
        }
      });
    } else {
      this._addGeometryAndZoomTO(emprise);
    }
  }

  _getGeometryOfEmprise(params: { table: string; id: number }): Promise<any> {
    return this.apiService.post_requete('/getLimitById', params).then(
      (response) => {
        var geojson = JSON.parse(response['geometry']);
        var feature = new GeoJSON().readFeature(geojson, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857',
        });
        return feature.getGeometry();
      },
      (err) => {
        return;
      }
    );
  }

  _addGeometryAndZoomTO(emprise: FilterOptionInterface) {
    var formatArea = function (polygon) {
      var area = getArea(polygon);
      var output;
      if (area > 10000) {
        output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km²';
      } else {
        output = Math.round(area * 100) / 100 + ' ' + 'm²';
      }
      return output;
    };

    if (emprise.geometry) {
      var mapHelper = new MapHelper();
      if (mapHelper.getLayerByName('searchResultLayer').length > 0) {
        var searchResultLayer =
          mapHelper.getLayerByName('searchResultLayer')[0];

        var feature = new Feature();
        var textLabel =
          emprise.name +
          '(' +
          emprise.ref +
          ') \n' +
          formatArea(emprise.geometry);

        feature.set('textLabel', textLabel);
        feature.setGeometry(emprise.geometry);

        searchResultLayer.getSource().clear();

        searchResultLayer.getSource().addFeature(feature);

        var extent = emprise.geometry.getExtent();

        mapHelper.fit_view(extent, 16);
      }
    }
  }
}
