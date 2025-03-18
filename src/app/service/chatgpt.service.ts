import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatgptService {
  _currentApiUrl: string = `${environment.apiBaseURL}/${environment.endPoint}`;

  constructor(private http: HttpClient) {}

  getAuthentication(): Observable<any> {
    return this.http.get(
      `${environment.apiBaseURL}/${environment.endPoint}/authenticate`
    );
  }

  get_ng_config(): Observable<any> {
    return this.http.get(`/configuration/status.json`);
  }

  get_config(): Observable<any> {
    return this.http.get(`${this._currentApiUrl}/configuration`);
  }

  // ask(url: string, data: any): Observable<any> {
  //   return this.http.post(url, { data });
  // }

  // comment(url: string, data: any): Observable<any> {
  //   return this.http.post(url, data, {
  //     headers: new HttpHeaders({
  //       'Content-Type': 'application/json',
  //     }),
  //   });
  // }
}
