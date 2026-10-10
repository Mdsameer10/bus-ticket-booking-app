import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingService } from '../services/booking.service';

@Component({
  selector: 'app-booking-lookup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-shell">
      <div class="card lookup-card">
        <h2>Look up an existing booking</h2>

        <form [formGroup]="lookupForm" (ngSubmit)="onSubmit()" class="lookup-form" novalidate>
          <label for="reference">Booking reference</label>
          <input id="reference" formControlName="reference" type="text" placeholder="BTR-..." />
          <small class="error" *ngIf="lookupForm.get('reference')?.touched && lookupForm.get('reference')?.hasError('required')">
            Enter a booking reference.
          </small>
          <button type="submit" [disabled]="lookupForm.invalid || isLoading">{{ isLoading ? 'Searching...' : 'Find booking' }}</button>
        </form>
      </div>

      <div class="card result-card" *ngIf="booking">
        <p class="label">Passenger</p>
        <h3>{{ booking.passengerName }}</h3>
        <p><strong>Reference:</strong> {{ booking.bookingReference }}</p>
        <p><strong>Route:</strong> {{ booking.trip.from }} → {{ booking.trip.to }}</p>
        <p><strong>Date:</strong> {{ booking.journeyDate }}</p>
        <p><strong>Total:</strong> {{ booking.totalPrice | currency:'INR':'symbol':'1.0-0' }}</p>
      </div>

      <div class="card error-box" *ngIf="errorMessage">{{ errorMessage }}</div>
    </section>
  `,
  styles: [
    `
      .page-shell {
        max-width: 760px;
        margin: 0 auto;
        padding: 32px 20px 72px;
      }

      .card {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 18px;
      }

      .lookup-form {
        display: grid;
        gap: 12px;
      }

      input {
        border: 1px solid #cbd5e1;
        border-radius: 10px;
        padding: 12px 14px;
        font-size: 1rem;
      }

      button {
        background: #1d4ed8;
        color: #fff;
        border: none;
        border-radius: 10px;
        padding: 12px 16px;
        font-weight: 700;
        cursor: pointer;
      }

      .error {
        color: #b91c1c;
      }

      .error-box {
        color: #991b1b;
        background: #fef2f2;
        border-color: #fecaca;
      }

      .label {
        color: #64748b;
        margin-bottom: 4px;
      }
    `,
  ],
})
export class BookingLookupComponent {
  booking: any = null;
  isLoading = false;
  errorMessage = '';

  lookupForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService
  ) {
    this.lookupForm = this.fb.group({
      reference: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.lookupForm.invalid) {
      this.lookupForm.markAllAsTouched();
      return;
    }

    const reference = this.lookupForm.value.reference.trim();
    this.isLoading = true;
    this.errorMessage = '';

    this.bookingService.getBooking(reference).subscribe({
      next: (response) => {
        this.booking = response?.data || null;
        this.isLoading = false;
      },
      error: (err) => {
        this.booking = null;
        this.errorMessage = err?.error?.message || 'Booking not found.';
        this.isLoading = false;
      },
    });
  }
}
