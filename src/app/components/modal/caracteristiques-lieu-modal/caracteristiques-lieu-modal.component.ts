import { ComponentHelper } from 'src/app/helpers/componentHelper';
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { CaracteristicSheet } from 'src/app/interfaces/caracteristicSheetInterface';
import { ShareServiceService } from 'src/app/services/share/share-service.service';
import { environment } from 'src/environments/environment';
import { MapHelper } from 'src/app/helpers/mapHelper';
import { Point } from 'src/app/modules/ol';

@Component({
  selector: 'app-caracteristiques-lieu-modal',
  templateUrl: './caracteristiques-lieu-modal.component.html',
  styleUrls: ['./caracteristiques-lieu-modal.component.scss'],
})
export class CaracteristiquesLieuModalComponent {
  environment: any;
  constructor(
    public dialogRef: MatDialogRef<CaracteristiquesLieuModalComponent>,
    @Inject(MAT_DIALOG_DATA) public caracteristiquesModel: CaracteristicSheet,
    public translate: TranslateService,
    public shareService: ShareServiceService,
    public componentHelper: ComponentHelper
  ) {
    translate.addLangs(['fr']);
    translate.setDefaultLang('fr');
    this.environment = environment;
  }

  setSescriptiveModel(data: CaracteristicSheet) {
    this.caracteristiquesModel = data;
  }

  zoomToPoint() {
    if (this.caracteristiquesModel.geometry) {
      var mapHelper = new MapHelper();
      mapHelper.fit_view(new Point(this.caracteristiquesModel.geometry), 16);
    }
  }
  close_caracteristique() {
    this.dialogRef.close();
  }

  shareLocation() {
    var coord = this.caracteristiquesModel.geometry;
    var path =
      coord[0].toFixed(4) +
      ',' +
      coord[1].toFixed(4) +
      ',' +
      this.caracteristiquesModel.map.getView().getZoom();
    var url_share =
      this.environment.url_frontend + '?share=location&path=' + path;

    this.componentHelper.openSocialShare(url_share, 5);
  }
}
