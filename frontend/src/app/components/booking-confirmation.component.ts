import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BookingService } from '../services/booking.service';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-shell">
      <div class="confirmation-card" *ngIf="booking; else loadingState">
        <div class="badge">Confirmed</div>
        <h2>Booking confirmed</h2>
        <p class="reference">Reference: <strong>{{ booking.bookingReference }}</strong></p>

        <div class="two-column">
          <div>
            <p class="label">Passenger</p>
            <strong>{{ booking.passengerName }}</strong>
          </div>
          <div>
            <p class="label">Contact</p>
            <strong>{{ booking.contactNumber }}</strong>
          </div>
          <div>
            <p class="label">Route</p>
            <strong>{{ booking.trip.from }} → {{ booking.trip.to }}</strong>
          </div>
          <div>
            <p class="label">Journey date</p>
            <strong>{{ booking.journeyDate }}</strong>
          </div>
          <div>
            <p class="label">Operator</p>
            <strong>{{ booking.trip.bus.operator.name }}</strong>
          </div>
          <div>
            <p class="label">Bus</p>
            <strong>{{ booking.trip.bus.name }}</strong>
          </div>
          <div>
            <p class="label">Passengers</p>
            <strong>{{ booking.passengerCount }}</strong>
          </div>
          <div>
            <p class="label">Status</p>
            <strong>{{ booking.status }}</strong>
          </div>
        </div>

        <div class="pricing-box">
          <div><span>Price per passenger</span><strong>{{ booking.pricePerPassenger | currency:'INR':'symbol':'1.0-0' }}</strong></div>
          <div><span>Total price</span><strong>{{ booking.totalPrice | currency:'INR':'symbol':'1.0-0' }}</strong></div>
        </div>
      </div>

      <ng-template #loadingState>
        <div class="confirmation-card loading-box">
          Looking up booking confirmation...
        </div>
      </ng-template>
    </section>
  `,
  styles: [
    `
      .page-shell {
        max-width: 900px;
        margin: 0 auto;
        padding: 32px 20px 72px;
      }

      .confirmation-card {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 18px;
        padding: 24px;
      }

      .badge {
        display: inline-block;
        background: #dcfce7;
        color: #166534;
        border-radius: 999px;
        padding: 8px 12px;
        font-weight: 700;
      }

      h2 {
        margin: 16px 0 8px;
      }

      .reference {
        margin-top: 0;
      }

      .two-column {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px;
        margin-top: 20px;
      }

      .label {
        display: block;
        color: #64748b;
        margin-bottom: 6px;
        font-size: 0.8rem;
      }

      .pricing-box {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px;
        margin-top: 18px;
        padding-top: 18px;
        border-top: 1px solid #e2e8f0;
      }

      .loading-box {
        text-align: center;
      }

      @media (max-width: 640px) {
        .two-column, .pricing-box {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class BookingConfirmationComponent implements OnInit {
  booking: any = null;

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const reference = params.get('reference') || '';
      if (reference) {
        this.bookingService.getBooking(reference).subscribe({
          next: (response) => {
            this.booking = response?.data || null;
          },
          error: () => {
            this.booking = null;
          },
        });
      }
    });
  }
}
