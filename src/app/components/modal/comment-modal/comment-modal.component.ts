import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { TranslateService } from '@ngx-translate/core';
import { DialogData } from 'src/app/interfaces/dialogDataInterface';

@Component({
  selector: 'app-comment-modal',
  templateUrl: './comment-modal.component.html',
  styleUrls: ['./comment-modal.component.scss'],
})
export class CommentModalComponent {
  public Editor = ClassicEditor;
  constructor(
    public dialogRef: MatDialogRef<CommentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private builder: FormBuilder,
    public translate: TranslateService
  ) {}

  public searchGpsForm = this.builder.group({
    nom: ['', Validators.required],
    email: ['', Validators.required],
    description: ['', Validators.required],
  });

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
