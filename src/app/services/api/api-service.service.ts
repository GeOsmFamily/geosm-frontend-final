import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiServiceService {
  headers: HttpHeaders = new HttpHeaders({});
  headers_nodejs: Headers = new Headers({});
  url_prefix = environment.url_prefix;

  headersPhoton = new HttpHeaders()
    .set('Access-Control-Allow-Origin', '*')
    .set('Accept-Language', 'fr');

  constructor(private http: HttpClient) {
    this.headers.append('Content-Type', 'application/x-www-form-urlencoded');
    this.headers.append('Content-Type', 'application/json');
    this.headers.append('Access-Control-Allow-Origin', '*');
    this.headers_nodejs.append('Content-Type', 'application/json');
  }

  get_header() {
    // this.headers.set('Authorization', 'Bearer  ' + localStorage.getItem('token'))
    return this.headers;
  }

  getRequestFromOtherHostObserver(path: string): Observable<any> {
    return this.http.get(path, { headers: this.headers });
  }

  getRequestFromOtherHost(path: string): Promise<any> {
    let promise = new Promise((resolve, reject) => {
      this.http
        .get(path, { headers: this.headersPhoton })
        .toPromise()
        .then(
          (res) => {
            resolve(res);
          },
          (msg) => {
            // Error
            reject(msg);
          }
        );
    });

    return promise;
  }

  getRequest(path: string): Promise<any> {
    let promise = new Promise((resolve, reject) => {
      this.http
        .get(this.url_prefix + path, { headers: this.headers })
        .toPromise()
        .then(
          (res) => {
            resolve(res);
          },
          (msg) => {
            // Error
            reject(msg);
          }
        );
    });

    return promise;
  }

  post_requete(url: string, data: Object): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http
        .post(this.url_prefix + url, data, { headers: this.get_header() })
        .toPromise()
        .then(
          (res) => {
            resolve(res);
          },
          (msg) => {
            // Error

            reject(msg.error);
          }
        );
    });
  }
}
