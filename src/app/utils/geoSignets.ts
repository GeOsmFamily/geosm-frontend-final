import { MapHelper } from '../helpers/mapHelper';
import { GeosignetInterface } from '../interfaces/geosignetsInterfaces';
import { Point } from '../modules/ol';

export class Geosignets {
  getAllGeosignets(): Array<GeosignetInterface> {
    var allGeoSignets: Array<GeosignetInterface> = [];
    if (localStorage.getItem('signets')) {
      for (
        let index = 0;
        index < localStorage.getItem('signets')!.split(';')?.length;
        index++
      ) {
        const element = localStorage.getItem('signets')?.split(';')[index];
        allGeoSignets.push(JSON.parse(element!));
      }
    }

    return allGeoSignets;
  }

  //@ts-ignore
  getGeoSignet(id: number): GeosignetInterface {
    for (let index = 0; index < this.getAllGeosignets().length; index++) {
      const element = this.getAllGeosignets()[index];
      if (element.id == id) {
        return element;
      }
    }
  }

  addGeoSignet(geosignet: GeosignetInterface) {
    var allGeoSignets = this.getAllGeosignets();
    if (!geosignet.id) {
      geosignet.id = allGeoSignets.length;
    }

    var signets_text = [JSON.stringify(geosignet)];
    for (let index = 0; index < allGeoSignets.length; index++) {
      const element = allGeoSignets[index];
      signets_text.push(JSON.stringify(element));
    }

    localStorage.setItem('signets', signets_text.join(';'));
  }

  goToAGeosignet(id: number) {
    var geosignet = this.getGeoSignet(id);
    if (geosignet) {
      new MapHelper().fit_view(new Point(geosignet.coord), geosignet.zoom);
    }
  }
}
