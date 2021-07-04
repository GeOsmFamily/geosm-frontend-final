import { VerticalPageSecondaireComponent } from './../components/map/vertical-page-left/vertical-page-secondaire/vertical-page-secondaire.component';
import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  EmbeddedViewRef,
  Injectable,
  Injector,
} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { InfoModalComponent } from '../components/modal/info-modal/info-modal.component';
import { GroupCarteInterface } from '../interfaces/carteInterface';
import { GroupThematiqueInterface } from '../interfaces/groupeInterface';
import { LayersInMap } from '../interfaces/layersInMapInterface';
import LayerGroup from 'ol/layer/Group';
import { MapHelper } from './mapHelper';
import { DescriptiveSheet } from '../interfaces/DescriptiveSheet';
import { DescriptiveSheetModalComponent } from '../components/modal/descriptive-sheet-modal/descriptive-sheet-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SocialShareComponent } from '../components/social-share/social-share.component';
import { DownloadDataModelInterface } from '../interfaces/downloadDataModelInterface';
import { ListDownloadLayersComponent } from '../components/map/vertical-page-right/download/ListDownloadLayers/ListDownloadLayers.component';
import { Coordinate } from 'ol/coordinate';
import { CaracteristicSheet } from '../interfaces/caracteristicSheetInterface';
import { CaracteristiquesLieuModalComponent } from '../components/modal/caracteristiques-lieu-modal/caracteristiques-lieu-modal.component';
import { GeosignetComponent } from '../components/geosignet/geosignet/geosignet.component';

@Injectable({
  providedIn: 'root',
})
export class ComponentHelper {
  verticalPageSecondaire: VerticalPageSecondaireComponent | undefined;
  constructor(
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    private appRef: ApplicationRef
  ) {}

  openModalInfo(size: Array<string> | []) {
    var proprietes = {
      disableClose: false,
      minWidth: 400,
    };

    if (size.length > 0) {
      proprietes['width'] = size[0];
      proprietes['height'] = size[1];
    }
    this.dialog.open(InfoModalComponent, proprietes);
  }

  openGroupCarteSlide(groupCarte: GroupCarteInterface) {
    this.verticalPageSecondaire?.setGroupCarte(groupCarte);
    this.verticalPageSecondaire?.open();
  }

  openGroupThematiqueSlide(groupThematique: GroupThematiqueInterface) {
    this.verticalPageSecondaire?.setGroupThematique(groupThematique);
    this.verticalPageSecondaire?.open();
  }

  setComponent(component: string, comp: any) {
    if (component == 'VerticalPageSecondaireComponent') {
      this.verticalPageSecondaire = comp;
    }
  }

  openDescriptiveSheet(
    type: string,
    layer: LayersInMap,
    coordinates_3857: [number, number],
    geometry?: any,
    properties?: any
  ) {
    if (type) {
      if (layer.layer instanceof LayerGroup) {
        layer.layer = new MapHelper().getLayerQuerryBleInLayerGroup(
          layer.layer
        );
      }
      this.openDescriptiveSheetModal(
        {
          type: type,
          layer: layer,
          properties: properties,
          geometry: geometry,
          coordinates_3857: coordinates_3857,
        },
        [],
        () => {}
      );
    }
  }

  openDescriptiveSheetModal(
    data: DescriptiveSheet,
    size: Array<string> | [],
    callBack: Function
  ) {
    var position = {
      top: '60px',
      left:
        window.innerWidth < 500
          ? '0px'
          : window.innerWidth / 2 - 400 / 2 + 'px',
    };
    for (let index = 0; index < this.dialog.openDialogs.length; index++) {
      const elementDialog = this.dialog.openDialogs[index];

      if (
        elementDialog.componentInstance instanceof
        DescriptiveSheetModalComponent
      ) {
        if (document.getElementById(elementDialog.id)) {
          if (document.getElementById(elementDialog.id)!.parentElement) {
            position.top =
              document
                .getElementById(elementDialog.id)!
                .parentElement!.getBoundingClientRect().top + 'px';
            position.left =
              document
                .getElementById(elementDialog.id)!
                .parentElement!.getBoundingClientRect().left + 'px';
          }
        }

        elementDialog.close();
      }
    }

    var proprietes: MatDialogConfig = {
      disableClose: false,
      minWidth: 550,
      maxHeight: 460,
      width: '550px',
      data: data,
      hasBackdrop: false,
      autoFocus: false,
      position: position,
    };

    if (size.length > 0) {
      // proprietes['width']=size[0]
      proprietes['height'] = size[1];
    }
    const modal = this.dialog.open(DescriptiveSheetModalComponent, proprietes);

    modal.afterClosed().subscribe(async (result: any) => {
      callBack(result);
    });
  }

  openSocialShare(url: string, durationInSeconds: number = 5) {
    this._snackBar.openFromComponent(SocialShareComponent, {
      duration: durationInSeconds * 1000,
      data: { url: url },
    });
  }

  openModalDownloadData(
    data: DownloadDataModelInterface[],
    size: Array<string> | [],
    callBack: Function
  ) {
    var proprietes = {
      disableClose: false,
      minWidth: 400,
      data: data,
    };

    if (size.length > 0) {
      proprietes['width'] = size[0];
      proprietes['height'] = size[1];
    }
    const modal = this.dialog.open(ListDownloadLayersComponent, proprietes);

    modal.afterClosed().subscribe(async (result: any) => {
      callBack(result);
    });
  }

  createComponent(component: any, componentProps?: object) {
    // 1. Create a component reference from the component
    const componentRef = this.componentFactoryResolver
      .resolveComponentFactory(component)
      .create(this.injector);

    if (componentProps && typeof componentRef.instance === 'object') {
      Object.assign(componentRef.instance as object, componentProps);
    }
    return componentRef;
  }

  appendComponent(componentRef: ComponentRef<unknown>, appendTo: Element) {
    this.appRef.attachView(componentRef.hostView);
    const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;
    appendTo.appendChild(domElem);

    return;
  }

  openCaracteristic(data: CaracteristicSheet) {
    var position = {
      top: '60px',
      left:
        window.innerWidth < 500
          ? '0px'
          : window.innerWidth / 2 - 400 / 2 + 'px',
    };
    for (let index = 0; index < this.dialog.openDialogs.length; index++) {
      const elementDialog = this.dialog.openDialogs[index];

      if (
        elementDialog.componentInstance instanceof
        DescriptiveSheetModalComponent
      ) {
        if (document.getElementById(elementDialog.id)) {
          if (document.getElementById(elementDialog.id)?.parentElement) {
            position.top =
              document
                .getElementById(elementDialog.id)
                ?.parentElement?.getBoundingClientRect().top + 'px';
            position.left =
              document
                .getElementById(elementDialog.id)
                ?.parentElement?.getBoundingClientRect().left + 'px';
          }
        }

        elementDialog.close();
      }
    }

    var proprietes: MatDialogConfig = {
      disableClose: false,
      minWidth: 450,
      maxHeight: 460,
      width: '400px',
      data: data,
      hasBackdrop: false,
      autoFocus: false,
      position: position,
    };

    const modal = this.dialog.open(
      CaracteristiquesLieuModalComponent,
      proprietes
    );
  }

  openModalAddGeosignet(size: Array<string> | [], callBack: Function) {
    var proprietes = {
      disableClose: false,
      minWidth: 400,
    };

    if (size.length > 0) {
      proprietes['width'] = size[0];
      proprietes['height'] = size[1];
    }
    const modal = this.dialog.open(GeosignetComponent, proprietes);

    modal.afterClosed().subscribe(async (result: string) => {
      callBack(result);
    });
  }
}
