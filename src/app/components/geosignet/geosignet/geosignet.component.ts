import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-geosignet',
  templateUrl: './geosignet.component.html',
  styleUrls: ['./geosignet.component.scss'],
})
export class GeosignetComponent {
  constructor(
    public dialogRef: MatDialogRef<GeosignetComponent>,
    private builder: FormBuilder
  ) {}

  public signet = this.builder.group({
    nom: ['', Validators.required],
  });

  valider() {
    if (this.signet.valid) {
      this.dialogRef.close(this.signet.controls['nom'].value);
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
