import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatgptService {
  currentApiUrl: string = `${environment.apiBaseURL}/${environment.endPoint}`;

  constructor(private http: HttpClient) {}

  get_ng_status(): Observable<any> {
    return this.http.get(`/configuration/status.json`);
  }

  get(api_suffix: string): Observable<any> {
    return this.http.get(`${this.currentApiUrl}/${api_suffix}`);
  }

  post(
    api_suffix: string,
    data: any,
    useJsonHeader?: boolean
  ): Observable<any> {
    const headers = useJsonHeader
      ? new HttpHeaders({ 'Content-Type': 'application/json' })
      : undefined;
    return this.http.post(
      `${environment.apiBaseURL}/${environment.endPoint}/${api_suffix}`,
      useJsonHeader ? data : { data },
      headers ? { headers } : undefined
    );
  }

  async steam(api_suffix: string, header: any, data: any): Promise<Response> {
    return await fetch(
      `${environment.apiBaseURL}/${environment.endPoint}/${api_suffix}`,
      {
        method: 'POST',
        headers: header,
        body: JSON.stringify({ ...data }),
      }
    );
  }
}
