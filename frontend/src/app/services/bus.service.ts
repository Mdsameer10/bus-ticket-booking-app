import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BusService {
  constructor(private http: HttpClient) {}

  searchBuses(from: string, to: string, date: string): Observable<any> {
    const params = new HttpParams().set('from', from).set('to', to).set('date', date);
    return this.http.get(`${environment.apiBaseUrl}/buses/search`, { params });
  }

  getOperators(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/operators`);
  }

  getBusById(tripId: string): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/buses/${tripId}`);
  }
}
