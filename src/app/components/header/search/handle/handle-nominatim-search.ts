import { AppInjector } from 'src/app/helpers/injectorHelper';
import { ConfigProjetInterface } from 'src/app/interfaces/configProjetInterface';
import { FilterOptionInterface } from 'src/app/interfaces/filterOptionInterface';
import { StorageServiceService } from 'src/app/services/storage/storage-service.service';
import { Feature, GeoJSON } from 'src/app/modules/ol';
import { MapHelper } from 'src/app/helpers/mapHelper';

export class HandleNominatimSearch {
  storageService: StorageServiceService = AppInjector.get(
    StorageServiceService
  );
  configProject: ConfigProjetInterface = this.storageService.getConfigProjet();

  constructor() {
    this.configProject = this.storageService.getConfigProjet();
  }

  formatDataForTheList(responseDB: any): Array<FilterOptionInterface> {
    var response: Array<FilterOptionInterface> = [];
    for (let index = 0; index < responseDB.features.length; index++) {
      const element = responseDB.features[index];
      var features = new GeoJSON().readFeatures(element, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      });

      if (features.length > 0) {
        var details = Array();
        if (this._formatType(element)) {
          details.push(this._formatType(element));
        }

        if (
          element.properties.address.city &&
          element.properties.address.city !== element.properties.display_name
        ) {
          details.push(element.properties.address.city);
        }

        if (element.properties.address.country) {
          // details.push(element.properties.country)
        }

        response.push({
          name: this._formatAdresse(element)
            ? this._formatAdresse(element)
            : features[0].get('display_name'),
          id: features[0].get('osm_id'),
          geometry: features[0].getGeometry(),
          typeOsm: this._formatType(element),
          details: details.join(', '),
          typeOption: 'nominatim',
          ...features[0].getProperties(),
        });
      }
    }

    return response;
  }

  displayWith(data: FilterOptionInterface): string {
    if (data) {
      return data.name + ' (' + data.details + ')';
    } else {
      return '';
    }
  }

  _formatAdresse(option) {
    var adresse;
    if (option.properties.road) {
      adresse = option.properties.road;
      if (option.properties.city) {
        adresse += option.properties.city;
      }
    }
    return adresse;
  }

  _formatType(option) {
    return option.properties.type;
  }

  optionSelected(emprise: FilterOptionInterface) {
    if (!emprise.geometry) {
    } else {
      this._addGeometryAndZoomTO(emprise);
    }
  }

  _addGeometryAndZoomTO(emprise: FilterOptionInterface) {
    if (emprise.geometry) {
      var mapHelper = new MapHelper();
      if (mapHelper.getLayerByName('searchResultLayer').length > 0) {
        var searchResultLayer =
          mapHelper.getLayerByName('searchResultLayer')[0];

        var feature = new Feature();
        var textLabel = emprise.name;

        feature.set('textLabel', textLabel);
        feature.setGeometry(emprise.geometry);
        feature.setGeometry(emprise.geometry);

        searchResultLayer.getSource().clear();

        searchResultLayer.getSource().addFeature(feature);

        var extent = emprise.geometry.getExtent();

        mapHelper.fit_view(extent, 16);
      }
    }
  }
}
