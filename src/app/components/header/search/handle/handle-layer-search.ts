import { GeosmLayersService } from './../../../../services/geosm/geosm-layers.service';
import { ComponentHelper } from 'src/app/helpers/componentHelper';
import * as $ from 'jquery';
import { AppInjector } from 'src/app/helpers/injectorHelper';
import { StorageServiceService } from 'src/app/services/storage/storage-service.service';
import { ConfigProjetInterface } from 'src/app/interfaces/configProjetInterface';
import { FilterOptionInterface } from 'src/app/interfaces/filterOptionInterface';
import { environment } from 'src/environments/environment';

export class HandleLayerSearch {
  storageService: StorageServiceService = AppInjector.get(
    StorageServiceService
  );
  componentHelper: ComponentHelper = AppInjector.get(ComponentHelper);
  geosmLayer: GeosmLayersService = AppInjector.get(GeosmLayersService);
  configProject: ConfigProjetInterface = this.storageService.getConfigProjet();

  constructor() {
    this.configProject = this.storageService.getConfigProjet();
  }

  formatDataForTheList(responseDB: any): Array<FilterOptionInterface> {
    var response: Array<FilterOptionInterface> = [];

    for (let index = 0; index < responseDB.couches.length; index++) {
      const element = responseDB.couches[index];
      var couche = this.storageService.getCoucheFromKeyCouche(element.id);
      var group = this.storageService.getGroupThematiqueFromIdCouche(
        element.id
      );
      if (couche && group) {
        response.push({
          name: couche.nom,
          nameGroup: group.nom,
          number: couche.number,
          id: couche.key_couche,
          image_src: environment.url_prefix + couche.img,
          logo_src: environment.url_prefix + couche.logo_src,
          type: 'couche',
          typeOption: 'layer',
        });
      }
    }

    for (let index = 0; index < responseDB.cartes.length; index++) {
      const element = responseDB.cartes[index];
      var carte = this.storageService.getCarteFromIdCarte(element.id);
      var groupCarte = this.storageService.getGroupCarteFromIdCarte(element.id);

      if (carte && groupCarte) {
        response.push({
          name: carte.nom,
          nameGroup: groupCarte.nom,
          id: carte.key_couche,
          image_src: environment.url_prefix + carte.image_src,
          type: 'carte',
          typeOption: 'layer',
        });
      }
    }

    return response;
  }

  displayWith(data: FilterOptionInterface): string {
    return '';
  }

  optionSelected(data: FilterOptionInterface) {
    if (data.type == 'couche') {
      var couche = this.storageService.getCoucheFromKeyCouche(data.id);
      let groupThem = this.storageService.getGroupThematiqueFromIdCouche(
        data.id
      );
      if (groupThem) {
        this.componentHelper.openGroupThematiqueSlide(groupThem);
      }
      if (couche) {
        this.geosmLayer.addLayerCouche(couche);
        setTimeout(() => {
          try {
            $('#couche_' + couche.key_couche)[0].scrollIntoView(false);
          } catch (error) {}
        }, 1000);
      }
    } else if (data.type == 'carte') {
      var carte = this.storageService.getCarteFromIdCarte(data.id);
      let groupCarte = this.storageService.getGroupCarteFromIdCarte(data.id);
      if (groupCarte) {
        this.componentHelper.openGroupCarteSlide(groupCarte);
      }
      if (carte) {
        this.geosmLayer.addLayerCarte(carte);
      }
    }
  }
}
