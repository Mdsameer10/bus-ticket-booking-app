import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../services/booking.service';
import { BusService } from '../services/bus.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-shell">
      <div class="booking-layout" *ngIf="trip; else loadingState">
        <div class="trip-summary card">
          <p class="eyebrow">Selected trip</p>
          <h2>{{ trip.bus.operator.name }}</h2>
          <p>{{ trip.bus.name }} · {{ trip.bus.busNumber }}</p>
          <div class="summary-grid">
            <div><span class="label">Route</span><strong>{{ trip.from }} → {{ trip.to }}</strong></div>
            <div><span class="label">Date</span><strong>{{ trip.journeyDate }}</strong></div>
            <div><span class="label">Departure</span><strong>{{ trip.departureTime }}</strong></div>
            <div><span class="label">Arrival</span><strong>{{ trip.arrivalTime }}</strong></div>
            <div><span class="label">Price</span><strong>{{ trip.ticketPrice | currency:'INR':'symbol':'1.0-0' }}</strong></div>
            <div><span class="label">Available</span><strong>{{ trip.availableSeats }}</strong></div>
          </div>
        </div>

        <form [formGroup]="bookingForm" (ngSubmit)="onSubmit()" class="card booking-form" novalidate>
          <h3>Passenger details</h3>

          <div class="field-wrapper">
            <label for="passengerName">Passenger name</label>
            <input id="passengerName" formControlName="passengerName" type="text" />
            <small class="error" *ngIf="bookingForm.get('passengerName')?.touched && bookingForm.get('passengerName')?.hasError('required')">
              Passenger name is required.
            </small>
          </div>

          <div class="field-wrapper">
            <label for="contactNumber">Contact number</label>
            <input id="contactNumber" formControlName="contactNumber" type="tel" />
            <small class="error" *ngIf="bookingForm.get('contactNumber')?.touched && bookingForm.get('contactNumber')?.hasError('required')">
              Contact number is required.
            </small>
            <small class="error" *ngIf="bookingForm.get('contactNumber')?.touched && bookingForm.get('contactNumber')?.hasError('pattern')">
              Enter a valid phone number.
            </small>
          </div>

          <div class="field-wrapper">
            <label for="passengerCount">Number of passengers</label>
            <input id="passengerCount" formControlName="passengerCount" type="number" min="1" />
            <small class="error" *ngIf="bookingForm.get('passengerCount')?.touched && bookingForm.get('passengerCount')?.hasError('required')">
              Number of passengers is required.
            </small>
            <small class="error" *ngIf="bookingForm.get('passengerCount')?.touched && bookingForm.get('passengerCount')?.hasError('min')">
              At least one passenger is required.
            </small>
          </div>

          <div class="error-box" *ngIf="errorMessage">{{ errorMessage }}</div>

          <button type="submit" [disabled]="bookingForm.invalid || isSubmitting">
            {{ isSubmitting ? 'Booking...' : 'Confirm booking' }}
          </button>
        </form>
      </div>

      <ng-template #loadingState>
        <div class="card loading-box">Loading trip details...</div>
      </ng-template>
    </section>
  `,
  styles: [
    `
      .page-shell {
        max-width: 1100px;
        margin: 0 auto;
        padding: 32px 20px 72px;
      }

      .booking-layout {
        display: grid;
        grid-template-columns: 1fr 1.2fr;
        gap: 24px;
      }

      .card {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 18px;
        padding: 22px;
      }

      .eyebrow {
        margin: 0 0 6px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #64748b;
        font-size: 0.72rem;
      }

      h2, h3 {
        margin-top: 0;
      }

      .summary-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
        margin-top: 22px;
      }

      .label {
        display: block;
        color: #64748b;
        font-size: 0.8rem;
        margin-bottom: 6px;
      }

      .booking-form {
        display: grid;
        gap: 16px;
      }

      .field-wrapper {
        display: grid;
        gap: 8px;
      }

      input {
        border: 1px solid #cbd5e1;
        border-radius: 10px;
        padding: 12px 14px;
        font-size: 1rem;
      }

      button {
        border: none;
        border-radius: 10px;
        background: #0f172a;
        color: #fff;
        padding: 12px 16px;
        font-weight: 700;
        cursor: pointer;
      }

      button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      .error {
        color: #b91c1c;
      }

      .error-box {
        background: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: 10px;
        color: #991b1b;
        padding: 12px;
      }

      .loading-box {
        text-align: center;
        margin-top: 50px;
      }

      @media (max-width: 760px) {
        .booking-layout {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class BookingComponent implements OnInit {
  trip: any = null;
  tripId = '';
  isSubmitting = false;
  errorMessage = '';

  bookingForm!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private busService: BusService,
    private bookingService: BookingService
  ) {
    this.bookingForm = this.fb.group({
      passengerName: ['', Validators.required],
      contactNumber: ['', [Validators.required, Validators.pattern(/^(?:\+?\d[\d\s()-]{6,18})$/)]],
      passengerCount: [1, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.tripId = params.get('tripId') || '';
      if (this.tripId) {
        this.fetchTrip();
      }
    });
  }

  fetchTrip(): void {
    this.busService.getBusById(this.tripId).subscribe({
      next: (response) => {
        this.trip = response?.data || null;
      },
      error: () => {
        this.errorMessage = 'The selected trip could not be loaded. Please return to the search page.';
      },
    });
  }

  onSubmit(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    if (!this.trip) {
      this.errorMessage = 'Please select a valid trip before booking.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const payload = {
      tripId: this.trip.id || this.trip._id,
      passengerName: this.bookingForm.value.passengerName,
      contactNumber: this.bookingForm.value.contactNumber,
      passengerCount: Number(this.bookingForm.value.passengerCount),
    };

    this.bookingService.createBooking(payload).subscribe({
      next: (response) => {
        const reference = response?.data?.bookingReference;
        this.router.navigate(['/confirmation'], {
          queryParams: { reference },
        });
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Booking failed. Please check the availability and try again.';
        this.isSubmitting = false;
      },
    });
  }
}
