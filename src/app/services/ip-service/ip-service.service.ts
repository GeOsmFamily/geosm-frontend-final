import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IpServiceService {
  ip = '';
  constructor(private http: HttpClient) {}
  public getIPAddress() {
    return this.http.get('https://api.ipify.org/?format=json');
  }

  getIP(): string {
    this.getIPAddress().subscribe((res: any) => {
      this.ip = res.ip;
    });
    return this.ip;
  }
}
