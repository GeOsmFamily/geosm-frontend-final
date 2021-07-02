import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, from } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  CarteInterface,
  GroupCarteInterface,
} from 'src/app/interfaces/carteInterface';
import { ConfigProjetInterface } from 'src/app/interfaces/configProjetInterface';
import { GroupThematiqueInterface } from 'src/app/interfaces/groupeInterface';
import { ResponseOfSerachLimitInterface } from 'src/app/interfaces/responseSearchLimitInterface';
import { ApiServiceService } from '../api/api-service.service';
import { GeoJSON } from 'src/app/modules/ol';
import { CoucheInterface } from 'src/app/interfaces/coucheInterface';

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
      forkJoin([
        from(this.apiApiService.getRequest('/geoportail/getCatalogue')),
        from(
          this.apiApiService.getRequest('/api/v1/RestFull/catalogAdminCartes')
        ),
        from(this.apiApiService.getRequest('/getZoneInteret')),
        from(this.apiApiService.getRequest('/geoportail/getAllExtents')),
        from(this.apiApiService.getRequest('/config_bd_projet')),
      ])
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

  getPrincipalCarte(): {
    groupCarte: GroupCarteInterface;
    carte: CarteInterface;
  } | null {
    for (let index = 0; index < this.groupCartes.getValue().length; index++) {
      const group = this.groupCartes.getValue()[index];
      if (group.principal) {
        // groupCarte = group
        if (group.sous_cartes) {
          for (let sIndex = 0; sIndex < group.sous_cartes.length; sIndex++) {
            const sous_groupe = group.sous_cartes[sIndex];
            for (
              let cIndex = 0;
              cIndex < sous_groupe.couches.length;
              cIndex++
            ) {
              const carte = sous_groupe.couches[cIndex];
              if (carte.principal) {
                return {
                  groupCarte: group,
                  carte: carte,
                };
              }
            }
          }
        } else {
          for (let cIndex = 0; cIndex < group.couches!.length; cIndex++) {
            const carte = group.couches![cIndex];
            if (carte.principal) {
              return {
                groupCarte: group,
                carte: carte,
              };
            }
          }
        }
      }
    }

    return null;
  }

  //@ts-ignore
  getGroupCarteFromIdCarte(id_carte: number): GroupCarteInterface {
    for (let index = 0; index < this.groupCartes.getValue().length; index++) {
      const groupCarte = this.groupCartes.getValue()[index];
      if (groupCarte.sous_cartes) {
        for (let sIndex = 0; sIndex < groupCarte.sous_cartes.length; sIndex++) {
          const sous_groupe = groupCarte.sous_cartes[sIndex];
          for (let cIndex = 0; cIndex < sous_groupe.couches.length; cIndex++) {
            const carte = sous_groupe.couches[cIndex];
            if (carte.key_couche == id_carte) {
              return groupCarte;
            }
          }
        }
      } else {
        for (let cIndex = 0; cIndex < groupCarte?.couches!.length; cIndex++) {
          const carte = groupCarte?.couches![cIndex];
          if (carte.key_couche == id_carte) {
            return groupCarte;
          }
        }
      }
    }
  }

  getAllGroupCarte(): Array<GroupCarteInterface> {
    return this.groupCartes.getValue();
  }

  getAllGroupThematiques(): Array<GroupThematiqueInterface> {
    return this.groupThematiques.getValue();
  }

  getGroupThematiqueFromIdCouche(id_couche: number): GroupThematiqueInterface {
    var groupThematiqueResponse: GroupThematiqueInterface;
    for (
      let index = 0;
      index < this.groupThematiques.getValue().length;
      index++
    ) {
      const groupThematique = this.groupThematiques.getValue()[index];
      if (groupThematique.sous_thematiques) {
        for (
          let sindex = 0;
          sindex < groupThematique.sous_thematiques.length;
          sindex++
        ) {
          const sous_thematique = groupThematique.sous_thematiques[sindex];
          for (let jndex = 0; jndex < sous_thematique.couches.length; jndex++) {
            const couche = sous_thematique.couches[jndex];
            if (couche.key_couche == id_couche) {
              groupThematiqueResponse = groupThematique;
            }
          }
        }
      } else {
        for (let jndex = 0; jndex < groupThematique.couches!.length; jndex++) {
          const couche = groupThematique.couches![jndex];
          if (couche.key_couche == id_couche) {
            groupThematiqueResponse = groupThematique;
          }
        }
      }
    }
    return groupThematiqueResponse!;
  }

  //@ts-ignore
  getGroupThematiqueById(id_thematique: number): GroupThematiqueInterface {
    for (
      let index = 0;
      index < this.groupThematiques.getValue().length;
      index++
    ) {
      const thematique = this.groupThematiques.getValue()[index];
      if (thematique.id_thematique === id_thematique) {
        return thematique;
      }
    }
  }

  //@ts-ignore
  getCouche(id_Groupthematique: number, id_couche: number): CoucheInterface {
    var groupThematique = this.getGroupThematiqueById(id_Groupthematique);
    if (!groupThematique) {
      return undefined!;
    }

    if (groupThematique.sous_thematiques) {
      for (
        let index = 0;
        index < groupThematique.sous_thematiques.length;
        index++
      ) {
        const sous_thematique = groupThematique.sous_thematiques[index];
        for (let jndex = 0; jndex < sous_thematique.couches.length; jndex++) {
          const couche = sous_thematique.couches[jndex];
          if (couche.key_couche == id_couche) {
            return couche;
          }
        }
      }
    } else {
      for (let jndex = 0; jndex < groupThematique?.couches!.length; jndex++) {
        const couche = groupThematique?.couches![jndex];
        if (couche.key_couche == id_couche) {
          return couche;
        }
      }
    }
  }

  //@ts-ignore
  getGroupcarteById(id_carte: number): GroupCarteInterface {
    for (let index = 0; index < this.groupCartes.getValue().length; index++) {
      const carte = this.groupCartes.getValue()[index];
      if (carte.id_cartes == id_carte) {
        return carte;
      }
    }
  }

  //@ts-ignore
  getCarte(id_groupCarte: number, id_carte: number): CarteInterface {
    var groupCarte = this.getGroupcarteById(id_groupCarte);
    if (!groupCarte) {
      return undefined!;
    }

    if (groupCarte.sous_cartes) {
      for (let sIndex = 0; sIndex < groupCarte.sous_cartes.length; sIndex++) {
        const sous_groupe = groupCarte.sous_cartes[sIndex];
        for (let cIndex = 0; cIndex < sous_groupe.couches.length; cIndex++) {
          const carte = sous_groupe.couches[cIndex];
          if (carte.key_couche == id_carte) {
            return carte;
          }
        }
      }
    } else {
      for (let cIndex = 0; cIndex < groupCarte?.couches!.length; cIndex++) {
        const carte = groupCarte?.couches![cIndex];
        if (carte.key_couche == id_carte) {
          return carte;
        }
      }
    }
  }

  //@ts-ignore
  getCoucheFromKeyCouche(id_couche: number): CoucheInterface {
    var coucheResponnse: CoucheInterface;
    for (
      let index = 0;
      index < this.groupThematiques.getValue().length;
      index++
    ) {
      const groupThematique = this.groupThematiques.getValue()[index];
      if (groupThematique.sous_thematiques) {
        for (
          let sindex = 0;
          sindex < groupThematique.sous_thematiques.length;
          sindex++
        ) {
          const sous_thematique = groupThematique.sous_thematiques[sindex];
          for (let jndex = 0; jndex < sous_thematique.couches.length; jndex++) {
            const couche = sous_thematique.couches[jndex];
            if (couche.key_couche == id_couche) {
              coucheResponnse = couche;
            }
          }
        }
      } else {
        for (let jndex = 0; jndex < groupThematique.couches!.length; jndex++) {
          const couche = groupThematique.couches![jndex];
          if (couche.key_couche == id_couche) {
            coucheResponnse = couche;
          }
        }
      }
    }
    return coucheResponnse!;
  }

  //@ts-ignore
  getCarteFromIdCarte(id_carte: number): CarteInterface {
    for (let index = 0; index < this.groupCartes.getValue().length; index++) {
      const groupCarte = this.groupCartes.getValue()[index];
      if (groupCarte.sous_cartes) {
        for (let sIndex = 0; sIndex < groupCarte.sous_cartes.length; sIndex++) {
          const sous_groupe = groupCarte.sous_cartes[sIndex];
          for (let cIndex = 0; cIndex < sous_groupe.couches.length; cIndex++) {
            const carte = sous_groupe.couches[cIndex];
            if (carte.key_couche == id_carte) {
              return carte;
            }
          }
        }
      } else {
        for (let cIndex = 0; cIndex < groupCarte.couches!.length; cIndex++) {
          const carte = groupCarte.couches![cIndex];
          if (carte.key_couche == id_carte) {
            return carte;
          }
        }
      }
    }
  }
}
