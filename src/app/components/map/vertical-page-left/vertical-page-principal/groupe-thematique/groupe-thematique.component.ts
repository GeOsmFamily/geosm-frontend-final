import { Component, Input, OnInit } from '@angular/core';
import { GroupThematiqueInterface } from 'src/app/interfaces/groupeInterface';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-groupe-thematique',
  templateUrl: './groupe-thematique.component.html',
  styleUrls: ['./groupe-thematique.component.scss'],
})
export class GroupeThematiqueComponent implements OnInit {
  @Input() groupThematique: GroupThematiqueInterface | undefined;

  url_prefix: string = environment.url_prefix;

  length;

  ngOnInit(): void {
    //@ts-ignore
    this.length = this.groupThematique?.sous_thematiques.length;
  }

  constructor() {}
}
