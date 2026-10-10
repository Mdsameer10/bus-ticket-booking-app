import { Routes } from '@angular/router';
import { BookingComponent } from './components/booking.component';
import { BookingConfirmationComponent } from './components/booking-confirmation.component';
import { BookingLookupComponent } from './components/booking-lookup.component';
import { BusResultsComponent } from './components/bus-results.component';
import { BusSearchComponent } from './components/bus-search.component';
import { NotFoundComponent } from './components/not-found.component';

export const routes: Routes = [
  { path: '', component: BusSearchComponent },
  { path: 'results', component: BusResultsComponent },
  { path: 'booking', component: BookingComponent },
  { path: 'confirmation', component: BookingConfirmationComponent },
  { path: 'lookup', component: BookingLookupComponent },
  { path: '**', component: NotFoundComponent },
];
