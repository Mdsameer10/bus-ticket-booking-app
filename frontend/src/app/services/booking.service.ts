import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  constructor(private http: HttpClient) {}

  createBooking(payload: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/bookings`, payload);
  }

  getBooking(reference: string): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/bookings/${reference}`);
  }
}
