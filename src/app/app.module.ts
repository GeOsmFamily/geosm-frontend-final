import { ApiServiceService } from './services/api/api-service.service';
import { StorageServiceService } from './services/storage/storage-service.service';
import { Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

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
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
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
  providers: [StorageServiceService, ApiServiceService],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(injector: Injector) {
    setAppInjector(injector);
  }
}
