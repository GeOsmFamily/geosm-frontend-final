import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/internal/operators/filter';
import { map } from 'rxjs/internal/operators/map';
import { startWith } from 'rxjs/internal/operators/startWith';
import { MapHelper } from 'src/app/helpers/mapHelper';
import { DownloadModelInterface } from 'src/app/interfaces/geometryDbInterface';
import { LayersInMap } from 'src/app/interfaces/layersInMapInterface';
import { SearchLayerToDownlodModelInterface } from 'src/app/interfaces/searchLayerToDownloadInterface';
import { StorageServiceService } from 'src/app/services/storage/storage-service.service';

export class SelectLayersForDownload {
  downloadModel: DownloadModelInterface = {
    layers: [],
    roiType: undefined!,
    roiGeometry: undefined,
    parametersGeometryDB: undefined,
  };

  formsLayers: FormGroup | undefined;
  formsLayersArray: FormArray | undefined;

  filteredLayersOptions: Array<
    Observable<SearchLayerToDownlodModelInterface[]>
  > = [];

  layersDownlodable: Array<SearchLayerToDownlodModelInterface> = [];

  constructor(
    public storageService: StorageServiceService,
    public fb: FormBuilder
  ) {}

  initialiseFormsLayers(loadTOCLayers: boolean = false) {
    this.formsLayers = this.fb.group({
      layers: this.fb.array([this.createInputFormsLayer()]),
    });
    new MapHelper().map?.getLayers().on('propertychange', (ObjectEvent) => {
      this.addAllLayersInTOC();
    });
  }

  removeInputInFormsLayer(i: number) {
    this.formsLayersArray = this.formsLayers?.get('layers') as FormArray;
    this.formsLayersArray.removeAt(i);
    this.filteredLayersOptions.splice(i, 1);
    this.loadAllLayersInModel();
  }

  addInputInFormsLayer() {
    this.formsLayersArray = this.formsLayers?.get('layers') as FormArray;
    this.formsLayersArray.push(this.createInputFormsLayer());
  }

  addAllLayersInTOC() {
    this.formsLayersArray = this.formsLayers?.get('layers') as FormArray;
    if (this.getAllLayersInTOC().length > 0) {
      while (this.formsLayersArray.length > 0) {
        this.removeInputInFormsLayer(0);
      }
    }

    for (let index = 0; index < this.getAllLayersInTOC().length; index++) {
      const element = this.getAllLayersInTOC()[index];
      var form = this.createInputFormsLayer();
      form.get('layer')!.setValue(element);
      this.formsLayersArray.push(form);
    }

    this.loadAllLayersInModel();
  }

  createInputFormsLayer(): FormGroup {
    var newForm = new FormControl('');
    this.filteredLayersOptions.push(
      newForm.valueChanges.pipe(
        filter((value) => typeof value == 'string'),
        startWith(''),
        map((value) => this._filter(value))
      )
    );
    return this.fb.group({
      layer: newForm,
    });
  }

  private _filter(value: string): SearchLayerToDownlodModelInterface[] {
    const filterValue = value.toLowerCase();
    return this.layersDownlodable.filter((option) =>
      option.name.toLowerCase().includes(filterValue)
    );
  }

  /**
   * Use to format text that will appear after an option is choose in the autocomplete use to select layers in the UI
   * @param layer searchLayerToDownlodModelInterface
   * @return string
   */
  displayAutocompleLayerstFn(
    layer: SearchLayerToDownlodModelInterface
  ): string {
    return layer ? layer.name : '';
  }

  layerSelected(option: MatAutocompleteSelectedEvent) {
    this.loadAllLayersInModel();
  }

  loadAllLayersInModel() {
    this.downloadModel.layers = [];
    this.formsLayersArray = this.formsLayers?.get('layers') as FormArray;
    for (
      let index = 0;
      index < this.formsLayersArray.controls.length;
      index++
    ) {
      const element = this.formsLayersArray.controls[index];
      var layersInForm: SearchLayerToDownlodModelInterface =
        element.get('layer')!.value;
      if (layersInForm.source == 'geosmCatalogue') {
        try {
          this.downloadModel.layers.push(
            this.storageService.getCouche(
              this.storageService.getGroupThematiqueFromIdCouche(
                layersInForm.id
              ).id_thematique,
              layersInForm.id
            )
          );
        } catch (error) {}
      }
    }
  }

  getAllControls(): Array<AbstractControl> {
    this.formsLayersArray = this.formsLayers?.get('layers') as FormArray;
    return this.formsLayersArray.controls;
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

  getAllLayersInTOC(): SearchLayerToDownlodModelInterface[] {
    let mapHelper = new MapHelper();
    var response: SearchLayerToDownlodModelInterface[] = [];

    let reponseLayers: Array<LayersInMap> = mapHelper.getAllLayersInToc();
    for (let index = 0; index < reponseLayers.length; index++) {
      const layerProp = reponseLayers[index];
      if (layerProp['type_layer'] == 'geosmCatalogue') {
        if (layerProp['properties']!['type'] == 'couche') {
          let groupThematique = this.storageService.getGroupThematiqueById(
            layerProp['properties']!['group_id']
          );
          layerProp['data'] = this.storageService.getCouche(
            layerProp['properties']!['group_id'],
            layerProp['properties']!['couche_id']
          );
          response.push({
            name: layerProp['data'].nom,
            description: groupThematique.nom,
            id: layerProp['data'].key_couche,
            source: 'geosmCatalogue',
          });
        }
      }
    }

    return response;
  }
}
