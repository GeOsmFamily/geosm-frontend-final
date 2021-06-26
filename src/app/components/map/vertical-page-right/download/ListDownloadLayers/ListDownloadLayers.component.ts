import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DownloadDataModelInterface } from 'src/app/interfaces/downloadDataModelInterface';
import { StorageServiceService } from 'src/app/services/storage/storage-service.service';
import { environment } from 'src/environments/environment';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'app-ListDownloadLayers',
  templateUrl: './ListDownloadLayers.component.html',
  styleUrls: ['./ListDownloadLayers.component.scss'],
})
export class ListDownloadLayersComponent implements OnInit {
  environment = environment;
  constructor(
    @Inject(MAT_DIALOG_DATA) public listLayers: DownloadDataModelInterface[],
    public dialogRef: MatDialogRef<ListDownloadLayersComponent>,
    public storageService: StorageServiceService
  ) {}

  ngOnInit() {
    this.formatLayers();
  }

  closeModal(): void {
    this.dialogRef.close();
  }

  formatLayers() {
    for (let index = 0; index < this.listLayers.length; index++) {
      this.listLayers[index].layer = this.storageService.getCoucheFromKeyCouche(
        this.listLayers[index].id
      );
      this.listLayers[index].groupThematique =
        this.storageService.getGroupThematiqueFromIdCouche(
          this.listLayers[index].id
        );
    }
    console.log(this.listLayers);
  }
}
