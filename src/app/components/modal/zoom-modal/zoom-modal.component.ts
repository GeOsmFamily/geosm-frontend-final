import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from 'src/app/interfaces/dialogDataInterface';

@Component({
  selector: 'app-zoom-modal',
  templateUrl: './zoom-modal.component.html',
  styleUrls: ['./zoom-modal.component.scss'],
})
export class ZoomModalComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ZoomModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private builder: FormBuilder
  ) {}

  public searchGpsForm = this.builder.group({
    projection: ['WGS84', Validators.required],
    longitude: ['', Validators.required],
    latitude: ['', Validators.required],
  });

  ngOnInit(): void {
    console.log(this.data['type']);
  }

  valider() {
    console.log(this.searchGpsForm.valid, this.searchGpsForm);
    if (this.searchGpsForm.valid) {
      this.dialogRef.close({
        statut: true,
        data: this.searchGpsForm.value,
      });
    }
  }

  onNoClick(): void {
    this.dialogRef.close({
      statut: false,
    });
  }
}
