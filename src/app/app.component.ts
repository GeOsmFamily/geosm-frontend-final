import { environment } from './../environments/environment';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'geosm-frontend';
  environment;

  public constructor(private titleService: Title) {
    this.environment = environment;
  }
  ngOnInit(): void {
    this.setTitle();
  }

  public setTitle() {
    this.titleService.setTitle('GeOsm ' + environment.nom.toLowerCase());
  }
}
