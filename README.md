# GeOsm Frontend v1.2.2

<img src="geosm.png" alt="App Screen(light)"/>

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.0.5.

## Instalation

Run

```sh
$ git clone https://github.com/GeOsmFamily/geosm-frontend-final.git
$ npm install

```

- download the [country.geojson](https://service.geo.sm/var/www/country.geojson) file which contains the boundary of your country (by default it is Cameroon) and place it in /src/assets

- if you want to replace the boundaries of a country, make its geojson from its shapefile and replace its content in country.geojson

  - you can download the shapifiles at this address [Shapefiles](https://www.diva-gis.org/gdata)

  - to convert your shapfiles to geojson go here [Ogr2ogr online](https://ogre.adc4gis.com/)

create the enviroment.ts(/src/environments/environment.ts) file and add your configurations to it

```sh
export const environment = {
  production: false,
  global_logo: undefined,
  primaryColor: '#023f5f',
  url_prefix: 'url_backend/',
  url_frontend: 'urlFrontend/',
  url_service: 'https://service.geo.sm/',
  path_qgis: '/var/www/geosm/',
  projet_nodejs: 'pojet_nodejs_value',
  nom: 'nomInstance',
  countrycode: 'code_country',
  avaible_language: ['fr', 'en'],
  default_language: 'langue',
};

```

| variable         | expected value                                                |
| ---------------- | ------------------------------------------------------------- |
| primaryColor     | Main color of the geoportal                                   |
| url_prefix       | Url of your Laravel backend                                   |
| url_frontend     | url on which your application will be deployed                |
| url_service      | url on which your nodeJs server is deployed                   |
| path_qgis        | directory where your qgis projects are located on your server |
| nom              | name of your instance                                         |
| countrycode      | iso 2 code of the country you are deploying                   |
| avaible_language | code of available languages                                   |
| default_language | default label of your instance                                |

- the installation of the GeOsm client on your own server requires the installation and configuration of the Laravel backend (for the administration) and the Node_Js backend (for the cartographic part)

- Backend laravel repository : https://github.com/GeOsmFamily/geosm-backend.git

- NodeJs Backend repository : https://github.com/GeOsmFamily/geosm-backend-nodejs.git

- If you wish to use our backend already available and hosted on our servers, send us an email (infos@geo.sm) and we will assist you in your configuration

- You can submit a new language by creating a language file with the language code in: assets/i18n/{languagecode}.json

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

<a name="contribute"></a>

## Contribute

You can contribute us by filing issues, bugs and PRs.

### Contributing:

- Open issue regarding proposed change.
- Repo owner will contact you there.
- If your proposed change is approved, Fork this repo and do changes.
- Open PR against latest `dev` branch. Add nice description in PR.
- You're done!

## Join us

https://join.slack.com/t/geosm/shared_invite/zt-t58ecq0x-Z74zx4pT2ypCBYw7BItDfA
