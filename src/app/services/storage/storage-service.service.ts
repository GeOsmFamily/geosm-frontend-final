import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, from } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { GroupCarteInterface } from 'src/app/interfaces/carteInterface';
import { ConfigProjetInterface } from 'src/app/interfaces/configProjetInterface';
import { GroupThematiqueInterface } from 'src/app/interfaces/groupeInterface';
import { ResponseOfSerachLimitInterface } from 'src/app/interfaces/responseSearchLimitInterface';
import { ApiServiceService } from '../api/api-service.service';
import { GeoJSON } from 'src/app/modules/ol';

@Injectable({
  providedIn: 'root',
})
export class StorageServiceService {
  constructor(public apiApiService: ApiServiceService) {}

  adminstrativeLimitLoad: BehaviorSubject<ResponseOfSerachLimitInterface> =
    new BehaviorSubject<ResponseOfSerachLimitInterface>(undefined!);

  states: BehaviorSubject<{ loadProjectData: boolean }> = new BehaviorSubject<{
    loadProjectData: boolean;
  }>({ loadProjectData: false });

  public groupThematiques: BehaviorSubject<Array<GroupThematiqueInterface>> =
    new BehaviorSubject(Array<GroupThematiqueInterface>());

  public groupCartes: BehaviorSubject<Array<GroupCarteInterface>> =
    new BehaviorSubject(Array<GroupCarteInterface>());

  public configProject: BehaviorSubject<ConfigProjetInterface> =
    new BehaviorSubject<ConfigProjetInterface>({} as ConfigProjetInterface);

  loadProjectData(): Promise<{ error: boolean; msg?: string }> {
    return new Promise((resolve, reject) => {
      forkJoin(
        from(this.apiApiService.getRequest('/geoportail/getCatalogue')),
        from(
          this.apiApiService.getRequest('/api/v1/RestFull/catalogAdminCartes')
        ),
        from(this.apiApiService.getRequest('/getZoneInteret')),
        from(this.apiApiService.getRequest('/geoportail/getAllExtents')),
        from(this.apiApiService.getRequest('/config_bd_projet'))
      )
        .pipe(
          catchError((err) => {
            reject({
              error: true,
              msg: err,
            });
            return '';
          })
        )
        .subscribe((results) => {
          this.groupThematiques.next(results[0]);
          this.groupCartes.next(results[1]);
          this.configProject.next({
            bbox: results[4]['bbox'],
            limites: results[4]['limites'],
            geosignetsProject: results[3],
            roiGeojson: JSON.parse(results[2]['data']['geometry']),
          });

          this.states.getValue().loadProjectData = true;
          this.states.next(this.states.getValue());
          resolve({
            msg: 'Success',
            error: false,
          });
        });
    });
  }

  getExtentOfProject(projection = false): [number, number, number, number] {
    var feature;

    let paramsFeature = {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    };
    if (!projection) {
      paramsFeature = {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:4326',
      };
    }

    if (this.configProject.value.geosignetsProject.length > 0) {
      for (
        let index = 0;
        index < this.configProject.value.geosignetsProject.length;
        index++
      ) {
        const geoSignet = this.configProject.value.geosignetsProject[index];
        if (geoSignet.active) {
          var features = new GeoJSON().readFeatures(
            JSON.parse(geoSignet.geometry),
            paramsFeature
          );
          if (features.length > 0) {
            feature = features[0];
          }
        }
      }
    }

    if (!feature) {
      var features = new GeoJSON().readFeatures(
        this.configProject.value.roiGeojson,
        paramsFeature
      );
      if (features.length > 0) {
        feature = features[0];
      }
    }

    if (feature) {
      return feature.getGeometry().getExtent();
    } else {
      return null!;
    }
  }

  getConfigProjet(): ConfigProjetInterface {
    return this.configProject.getValue();
  }
}