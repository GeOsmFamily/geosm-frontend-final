import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MetaDataInterface } from 'src/app/interfaces/metaDataInterface';

@Component({
  selector: 'app-metadata-modal',
  templateUrl: './metadata-modal.component.html',
  styleUrls: ['./metadata-modal.component.scss'],
})
export class MetadataModalComponent implements OnInit {
  url_prefix: string | undefined;
  data_metadata;

  constructor(
    public dialogRef: MatDialogRef<MetadataModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MetaDataInterface,
    private builder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.url_prefix = this.data['url_prefix'];

    if (this.data['exist']) {
      var partenaire = Array();
      if (
        this.data['metadata'].partenaire &&
        this.data['metadata'].partenaire.length > 0
      ) {
        for (
          var index = 0;
          index < this.data['metadata'].partenaire.length;
          index++
        ) {
          partenaire.push(this.data['metadata'].partenaire[index].id_user);
        }
      }
    }

    this.data_metadata = this.data;
    console.log(this.data_metadata);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
