import { Component, Input } from '@angular/core';
import { GroupCarteInterface } from 'src/app/interfaces/carteInterface';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-bibliotheque-carte',
  templateUrl: './bibliotheque-carte.component.html',
  styleUrls: ['./bibliotheque-carte.component.scss'],
})
export class BibliothequeCarteComponent {
  @Input() groupeCarte: GroupCarteInterface | undefined;

  url_prefix: string = environment.url_prefix;

  constructor() {}
}
