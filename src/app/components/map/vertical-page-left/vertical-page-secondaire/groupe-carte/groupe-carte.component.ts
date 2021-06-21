import { Component, Input } from '@angular/core';
import { GroupCarteInterface } from 'src/app/interfaces/carteInterface';

@Component({
  selector: 'app-groupe-carte',
  templateUrl: './groupe-carte.component.html',
  styleUrls: ['./groupe-carte.component.scss'],
})
export class GroupeCarteComponent {
  @Input() groupCarte: GroupCarteInterface | undefined;

  constructor() {}
}
