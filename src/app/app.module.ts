import { GeosmLayersService } from './services/geosm/geosm-layers.service';
import { ApiServiceService } from './services/api/api-service.service';
import { StorageServiceService } from './services/storage/storage-service.service';
import { Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgpSortModule } from 'ngp-sort-pipe';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderComponent } from './components/header/header.component';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { MaterialModule } from './modules/material';
import { MapComponent } from './components/map/map.component';
import { VerticalPagePrincipalComponent } from './components/map/vertical-page-left/vertical-page-principal/vertical-page-principal.component';
import { VerticalPageSecondaireComponent } from './components/map/vertical-page-left/vertical-page-secondaire/vertical-page-secondaire.component';
import { VerticalToolbarComponent } from './components/map/vertical-toolbar/vertical-toolbar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ActiveLayersComponent } from './components/map/vertical-page-right/active-layers/active-layers.component';
import { MapToolsComponent } from './components/map/vertical-page-right/map-tools/map-tools.component';
import { LegendsComponent } from './components/map/vertical-page-right/legends/legends.component';
import { RoutingComponent } from './components/map/vertical-page-right/routing/routing.component';
import { DownloadComponent } from './components/map/vertical-page-right/download/download.component';
import { setAppInjector } from './helpers/injectorHelper';
import { NotifierModule } from 'angular-notifier';
import { InfoModalComponent } from './components/modal/info-modal/info-modal.component';
import { ZoomModalComponent } from './components/modal/zoom-modal/zoom-modal.component';
import { ButtonSheetComponent } from './components/button-sheet/button-sheet/button-sheet.component';
import { GroupeCarteComponent } from './components/map/vertical-page-left/vertical-page-secondaire/groupe-carte/groupe-carte.component';
import { CarteThematiqueComponent } from './components/map/vertical-page-left/vertical-page-secondaire/groupe-carte/carte-thematique/carte-thematique.component';
import { BibliothequeCarteComponent } from './components/map/vertical-page-left/vertical-page-principal/bibliotheque-carte/bibliotheque-carte.component';
import { GroupeThematiqueComponent } from './components/map/vertical-page-left/vertical-page-principal/groupe-thematique/groupe-thematique.component';
import { ListeThematiqueComponent } from './components/map/vertical-page-left/vertical-page-secondaire/liste-thematique/liste-thematique/liste-thematique.component';
import { CoucheThematiqueComponent } from './components/map/vertical-page-left/vertical-page-secondaire/liste-thematique/liste-thematique/couche-thematique/couche-thematique.component';

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new MultiTranslateHttpLoader(httpClient, [
    { prefix: './assets/i18n/', suffix: '.json' },
  ]);
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    MapComponent,
    VerticalPagePrincipalComponent,
    VerticalPageSecondaireComponent,
    VerticalToolbarComponent,
    ActiveLayersComponent,
    MapToolsComponent,
    LegendsComponent,
    RoutingComponent,
    DownloadComponent,
    ZoomModalComponent,
    ButtonSheetComponent,
    InfoModalComponent,
    GroupeCarteComponent,
    CarteThematiqueComponent,
    BibliothequeCarteComponent,
    GroupeThematiqueComponent,
    ListeThematiqueComponent,
    CoucheThematiqueComponent,
  ],
  imports: [
    NgpSortModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    NotifierModule.withConfig({
      position: {
        horizontal: {
          position: 'right',
          distance: 12,
        },

        vertical: {
          position: 'top',
          distance: 12,
          gap: 10,
        },
      },
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    FontAwesomeModule,
  ],
  providers: [StorageServiceService, ApiServiceService, GeosmLayersService],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(injector: Injector) {
    setAppInjector(injector);
  }
}
