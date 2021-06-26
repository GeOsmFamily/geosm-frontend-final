import { ComponentHelper } from './../../../../helpers/componentHelper';
import { SelectLayersForDownload } from './download-select-layers';
import { StorageServiceService } from './../../../../services/storage/storage-service.service';
import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import * as moment from 'moment';
import { ConfigProjetInterface } from 'src/app/interfaces/configProjetInterface';
import { ResponseOfSerachLimitInterface } from 'src/app/interfaces/responseSearchLimitInterface';
import { SearchLayerToDownlodModelInterface } from 'src/app/interfaces/searchLayerToDownloadInterface';
import { debounceTime, filter, map, startWith, tap } from 'rxjs/operators';
import { ApiServiceService } from 'src/app/services/api/api-service.service';
import { from, Observable } from 'rxjs';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import {
  Feature,
  Fill,
  GeoJSON,
  getCenter,
  Overlay,
  Stroke,
  Style,
  VectorLayer,
  VectorSource,
} from 'src/app/modules/ol';
import { MapHelper } from 'src/app/helpers/mapHelper';
import { DownloadDataModelInterface } from 'src/app/interfaces/downloadDataModelInterface';
import { ParametersGeometryDB } from 'src/app/interfaces/geometryDbInterface';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { environment } from 'src/environments/environment';
import * as $ from 'jquery';
import { DataHelper } from 'src/app/helpers/dataHelper';
import OverlayPositioning from 'ol/OverlayPositioning';
import { ChartOverlayComponent } from './chartOverlay/chartOverlay.component';

@Component({
  selector: 'app-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss'],
})
export class DownloadComponent
  extends SelectLayersForDownload
  implements OnInit
{
  @ViewChild('downlod_list_overlays') downlodListOverlays:
    | ElementRef
    | undefined;
  lastSaturday = moment().subtract(1, 'weeks').isoWeekday(6).locale('fr');

  userClosedOverlay: EventEmitter<any> = new EventEmitter<any>();

  userListFilesToDownload: EventEmitter<any> = new EventEmitter<any>();

  configProject: ConfigProjetInterface | undefined;

  listOfChartsInMap: {
    [key: string]: {
      index: number;
      nom: string;
      nom_file: string;
      number: number;
      id: number;
    }[];
  } = {};

  formsEmprise: FormGroup | undefined;
  filterEmpriseOptions: ResponseOfSerachLimitInterface[] = [];

  constructor(
    public storageService: StorageServiceService,
    public fb: FormBuilder,
    public apiService: ApiServiceService,
    public componentHelper: ComponentHelper
  ) {
    super(storageService, fb);
  }

  ngOnInit(): void {
    this.storageService.states.subscribe((value) => {
      if (value.loadProjectData) {
        this.configProject = this.storageService.getConfigProjet();
        this.layersDownlodable = this.getAllLayersDownlodable();
        this.initialiseFormsLayers();

        if (this.configProject.limites.length > 0) {
          this.downloadModel.roiType = 'emprise';
          this.initialiseFormsEmprise();
        } else {
          this.setRoiTypeToAll();
        }

        this.userClosedOverlay.subscribe((idOverlay) => {
          this.closeChart(idOverlay);
        });

        this.userListFilesToDownload.subscribe((idOverlay) => {
          this.openModalListDonwnloadLayers(idOverlay);
        });

        if (this.formsEmprise != undefined) {
          if (this.formsEmprise.get('emprise')) {
            this.storageService.adminstrativeLimitLoad
              .pipe()
              .subscribe((limit: ResponseOfSerachLimitInterface) => {
                if (limit) {
                  this.formsEmprise?.get('emprise')!.setValue(limit);
                  this.setParametersGeometryBd({
                    table: limit.table,
                    id: limit.id,
                    name: limit.name,
                  });
                  if (limit.geometry) {
                    this.downloadModel.roiGeometry = limit.geometry;
                  } else {
                    this.getGeometryOfEmprise({
                      table: limit.table,
                      id: limit.id,
                    });
                  }
                }
              });
          }
        }
      }
    });
  }

  getAllLayersDownlodable(): Array<SearchLayerToDownlodModelInterface> {
    var response: SearchLayerToDownlodModelInterface[] = [];

    for (
      let iThematique = 0;
      iThematique < this.storageService.getAllGroupThematiques().length;
      iThematique++
    ) {
      const groupThematique =
        this.storageService.getAllGroupThematiques()[iThematique];

      if (groupThematique.sous_thematiques) {
        for (
          let index = 0;
          index < groupThematique.sous_thematiques.length;
          index++
        ) {
          const sous_thematique = groupThematique.sous_thematiques[index];
          for (let jndex = 0; jndex < sous_thematique.couches.length; jndex++) {
            const couche = sous_thematique.couches[jndex];
            if (true) {
              response.push({
                name: couche.nom,
                description: groupThematique.nom + ' / ' + sous_thematique.nom,
                id: couche.key_couche,
                source: 'geosmCatalogue',
              });
            }
          }
        }
      } else {
        for (let jndex = 0; jndex < groupThematique?.couches!.length; jndex++) {
          const couche = groupThematique?.couches![jndex];
          if (true) {
            response.push({
              name: couche.nom,
              description: groupThematique.nom,
              id: couche.key_couche,
              source: 'geosmCatalogue',
            });
          }
        }
      }
    }

    return response;
  }

  initialiseFormsEmprise() {
    var empriseControl = new FormControl('', [Validators.minLength(2)]);

    empriseControl.valueChanges
      .pipe(
        debounceTime(300),
        filter((value) => typeof value == 'string' && value.length > 1),
        startWith(''),
        tap(() => {
          console.log('loading');
        }),
        map((value) => {
          return from(
            this.apiService.post_requete('/searchLimite', {
              word: value.toString(),
            })
          );
        })
      )
      .subscribe((value: Observable<any>) => {
        value.subscribe((data) => {
          var response: Array<ResponseOfSerachLimitInterface> = [];
          for (const key in data) {
            if (data.hasOwnProperty(key) && key != 'status') {
              const element = data[key];
              for (let index = 0; index < element.length; index++) {
                const responseI = element[index];
                if (this.getLimitName(key)) {
                  response.push({
                    ref: responseI['ref'],
                    name: responseI['name'],
                    id: responseI['id'],
                    table: key,
                    limitName: this.getLimitName(key),
                  });
                }
              }
            }
          }

          this.filterEmpriseOptions = response;
        });
      });

    this.formsEmprise = this.fb.group({
      emprise: empriseControl,
    });
  }

  getLimitName(tableName: string): string {
    var response;
    for (let index = 0; index < this.configProject?.limites!.length!; index++) {
      const element = this.configProject?.limites[index];
      if (element!.nom_table == tableName) {
        response = element!.nom;
      }
    }
    return response;
  }

  toogleRoiType(value: MatSlideToggleChange) {
    if (value.checked) {
      this.setRoiTypeToAll();
    } else {
      this.downloadModel.roiType = 'emprise';
      this.downloadModel.roiGeometry = undefined;
    }
  }

  setRoiTypeToAll() {
    this.downloadModel.roiType = 'all';
    var feature = new GeoJSON().readFeature(this.configProject?.roiGeojson, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    });
    this.downloadModel.roiGeometry = feature.getGeometry();
    this.downloadModel.parametersGeometryDB = undefined;
    if (this.formsEmprise) {
      this.formsEmprise.reset('');
    }
  }

  closeChart(idOverlay: string) {
    var mapHelper = new MapHelper();

    this.removeLayerExportData();

    var overlay = mapHelper.map?.getOverlayById(idOverlay);
    mapHelper.map?.removeOverlay(overlay!);
  }

  removeLayerExportData() {
    var mapHelper = new MapHelper();
    var layer = mapHelper.getLayerByName('exportData');
    for (let index = 0; index < layer.length; index++) {
      const element = layer[index];
      mapHelper.map?.removeLayer(element);
    }
  }

  openModalListDonwnloadLayers(idOverlay: string) {
    var modelDownload: DownloadDataModelInterface[] = [];
    for (
      let index = 0;
      index < this.listOfChartsInMap[idOverlay].length;
      index++
    ) {
      const element = this.listOfChartsInMap[idOverlay][index];
      modelDownload.push({
        layer: undefined!,
        groupThematique: undefined!,
        empriseName: this.downloadModel.parametersGeometryDB
          ? this.downloadModel.parametersGeometryDB.name
          : 'Export total',
        nom: element.nom,
        number: element.number,
        index: element.index,
        id: element.id,
        url: element.nom_file,
      });
    }

    this.componentHelper.openModalDownloadData(modelDownload, [], () => {});
  }

  setParametersGeometryBd(parameters: ParametersGeometryDB) {
    this.downloadModel.parametersGeometryDB = {
      table: parameters.table,
      id: parameters.id,
      name: parameters.name,
    };
  }

  getGeometryOfEmprise(params: { table: string; id: number }) {
    this.apiService.post_requete('/getLimitById', params).then(
      (response) => {
        var geojson = JSON.parse(response['geometry']);
        var feature = new GeoJSON().readFeature(geojson, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857',
        });
        this.downloadModel.roiGeometry = feature.getGeometry();
      },
      (err) => {}
    );
  }

  displayAutocompleEmpriseFn(emprise: ResponseOfSerachLimitInterface): string {
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

  empriseSelected(option: MatAutocompleteSelectedEvent) {
    var empriseInForm: ResponseOfSerachLimitInterface = option.option.value;
    if (empriseInForm.table && empriseInForm.id) {
      this.setParametersGeometryBd({
        table: empriseInForm.table,
        id: empriseInForm.id,
        name: empriseInForm.name,
      });
      this.getGeometryOfEmprise({
        table: empriseInForm.table,
        id: empriseInForm.id,
      });
    }
  }

  generateExport() {
    if (this.downloadModel.roiType == 'emprise') {
      this.calculateExportInDB();
    } else {
      var layers: Array<{
        index: number;
        nom: string;
        nom_file: string;
        number: number;
        id: number;
      }> = [];

      for (let index = 0; index < this.downloadModel.layers.length; index++) {
        const layer = this.downloadModel.layers[index];
        var nom_shp =
          environment.url_service +
          '/' +
          environment.path_qgis +
          '/' +
          environment.projet_nodejs +
          '/gpkg/' +
          layer.params_files.nom_cat.replace(/[^a-zA-Z0-9]/g, '_') +
          '_' +
          layer.params_files.sous_thematiques +
          '_' +
          layer.params_files.key_couche +
          '_' +
          layer.params_files.id_cat +
          '.gpkg';
        layers.push({
          index: index,
          nom: layer.nom,
          number: layer.number,
          nom_file: nom_shp,
          id: layer.key_couche,
        });
      }

      this.displayResultExport(
        layers,
        this.downloadModel.roiGeometry,
        'Export total'
      );
    }
  }

  calculateExportInDB() {
    var listLayer = Array();
    for (let index = 0; index < this.downloadModel.layers.length; index++) {
      const layer = this.downloadModel.layers[index];
      listLayer.push({
        url: layer.url,
        methode: 'qgis',
        index: index,
        nom: layer.nom,
        id_cat: layer.params_files.id_cat,
        type: layer.type_couche,
        identifiant: layer.identifiant,
        id_them: this.storageService.getGroupThematiqueFromIdCouche(
          layer.key_couche
        ).id_thematique,
        key_couche: layer.key_couche,
      });
    }
    var parameters = {
      querry: listLayer,
      lim_adm: this.downloadModel.parametersGeometryDB?.table,
      id_lim: this.downloadModel.parametersGeometryDB?.id,
    };
    $('.export-data-loading').show();
    this.apiService.post_requete('/thematique/donwload', parameters).then(
      (
        response: Array<{
          index: number;
          nom: string;
          nom_file: string;
          number: number;
          id: number;
        }>
      ) => {
        $('.export-data-loading').hide();
        for (let i = 0; i < response.length; i++) {
          response[i].id = listLayer[response[i].index].key_couche;
          response[i].nom_file = environment.url_prefix + response[i].nom_file;
        }

        this.displayResultExport(
          response,
          this.downloadModel.roiGeometry,
          this.downloadModel.parametersGeometryDB?.name!
        );
      },
      (error) => {
        $('.export-data-loading').hide();
      }
    );
  }

  displayResultExport(
    listData: Array<{
      index: number;
      id: number;
      nom: string;
      nom_file: string;
      number: number;
    }>,
    geometry: any,
    title: string
  ) {
    this.closeAllChartsInMap();

    var idOverlay = DataHelper.makeid();

    var layerExport = this.constructLayerToDisplayResult();
    layerExport.set('properties', { idOverlay: idOverlay });
    var featureRoi = new Feature();
    featureRoi.setGeometry(geometry);
    layerExport.getSource().addFeature(featureRoi);

    var mapHelper = new MapHelper();
    mapHelper.addLayerToMap(layerExport);

    mapHelper.map?.getView().fit(layerExport.getSource().getExtent(), {
      size: mapHelper.map.getSize(),
      duration: 1000,
    });

    var centerOfRoi = getCenter(layerExport.getSource().getExtent());

    var numbers = Array();
    var labels = Array();
    for (var index = 0; index < listData.length; index++) {
      numbers.push(listData[index]['number']);
      labels.push(
        listData[index]['nom'] + ' (' + listData[index]['number'] + ') '
      );
    }
    var dynamicColors = function () {
      var r = Math.floor(Math.random() * 255);
      var g = Math.floor(Math.random() * 255);
      var b = Math.floor(Math.random() * 255);
      return 'rgb(' + r + ',' + g + ',' + b + ')';
    };
    var coloR = Array();
    for (var i in numbers) {
      coloR.push(dynamicColors());
    }

    let chartConfig = {
      type: 'pie',
      scaleFontColor: 'red',
      data: {
        labels: labels,
        datasets: [
          {
            data: numbers,
            backgroundColor: coloR,
            borderColor: 'rgba(200, 200, 200, 0.75)',
            hoverBorderColor: 'rgba(200, 200, 200, 1)',
          },
        ],
      },
      options: {
        title: {
          display: true,
          text: title,
          fontColor: '#fff',
          fontSize: 16,
          position: 'top',
        },
        legend: {
          display: true,
          labels: {
            fontColor: '#fff',
            fontSize: 14,
          },
        },
        scales: {
          y: {
            display: false,
          },
          x: {
            display: false,
          },
        },

        onClick: (event) => {
          console.log(event);
          var name_analyse = event.target.id;
        },
      },
    };

    var elementChart = this.componentHelper.createComponent(
      ChartOverlayComponent,
      {
        chartConnfiguration: chartConfig,
        idChart: idOverlay,
        close: this.userClosedOverlay,
        listFiles: this.userListFilesToDownload,
      }
    );

    this.componentHelper.appendComponent(
      elementChart,
      this.downlodListOverlays?.nativeElement
    );

    var overlayExport = new Overlay({
      position: centerOfRoi,
      positioning: OverlayPositioning.CENTER_CENTER,
      element: elementChart.location.nativeElement,
      id: idOverlay,
    });

    mapHelper.map?.addOverlay(overlayExport);

    this.listOfChartsInMap[idOverlay] = listData;
  }

  closeAllChartsInMap() {
    for (const key in this.listOfChartsInMap) {
      if (this.listOfChartsInMap.hasOwnProperty(key)) {
        this.closeChart(key);
      }
    }
  }

  constructLayerToDisplayResult() {
    this.removeLayerExportData();

    var layerExport = new VectorLayer({
      source: new VectorSource(),
      style: new Style({
        stroke: new Stroke({
          color: '#000',
          width: 2,
        }),
        fill: new Fill({
          color: environment.primaryColor,
        }),
      }),
      updateWhileAnimating: true,
      //@ts-ignore
      activeLayers: {
        opacity: false,
        metadata: false,
        share: false,
      },
      type_layer: 'exportData',
      nom: 'exportData',
    });

    layerExport.set(
      'iconImagette',
      environment.url_frontend + '/assets/icones/draw.svg'
    );
    layerExport.set('inToc', false);
    layerExport.setZIndex(1000);

    return layerExport;
  }

  enableDownloadBtn(): boolean {
    if (
      this.downloadModel.layers.length > 0 &&
      this.downloadModel.roiGeometry
    ) {
      return true;
    } else {
      return false;
    }
  }
}
