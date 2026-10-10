import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-bus-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="bus-card" *ngIf="trip">
      <div class="travel-line">
        <div>
          <p class="label">Operator</p>
          <h3>{{ trip.bus.operator.name }}</h3>
        </div>
        <span class="badge">{{ trip.availableSeats }} seats left</span>
      </div>

      <div class="route-row">
        <div>
          <p class="label">From</p>
          <strong>{{ trip.from }}</strong>
        </div>
        <div class="route-arrow">→</div>
        <div>
          <p class="label">To</p>
          <strong>{{ trip.to }}</strong>
        </div>
      </div>

      <div class="details-grid">
        <div>
          <p class="label">Bus</p>
          <span>{{ trip.bus.name }}</span>
        </div>
        <div>
          <p class="label">Departure</p>
          <span>{{ trip.departureTime }}</span>
        </div>
        <div>
          <p class="label">Arrival</p>
          <span>{{ trip.arrivalTime }}</span>
        </div>
        <div>
          <p class="label">Duration</p>
          <span>{{ trip.duration }}</span>
        </div>
        <div>
          <p class="label">Price</p>
          <span>{{ trip.ticketPrice | currency:'INR':'symbol':'1.0-0' }}</span>
        </div>
      </div>

      <div class="card-footer">
        <button type="button" (click)="bookTrip()">Book Now</button>
      </div>
    </article>
  `,
  styles: [
    `
      .bus-card {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 18px;
        padding: 20px;
        box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
      }

      .travel-line {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid #e2e8f0;
      }

      .label {
        margin: 0 0 4px;
        color: #64748b;
        font-size: 0.76rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }

      h3 {
        margin: 0;
        font-size: 1.3rem;
      }

      .badge {
        background: #dbeafe;
        color: #1d4ed8;
        font-weight: 700;
        border-radius: 999px;
        padding: 8px 12px;
      }

      .route-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 18px;
      }

      .route-arrow {
        font-size: 1.5rem;
        color: #64748b;
      }

      .details-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
        margin-top: 18px;
      }

      .details-grid span {
        color: #0f172a;
        font-weight: 600;
      }

      .card-footer {
        margin-top: 18px;
        display: flex;
        justify-content: flex-end;
      }

      button {
        border: none;
        background: #2563eb;
        color: #fff;
        border-radius: 10px;
        padding: 12px 18px;
        font-weight: 700;
        cursor: pointer;
      }
    `,
  ],
})
export class BusCardComponent {
  @Input() trip: any;
  @Output() book = new EventEmitter<string>();

  bookTrip(): void {
    this.book.emit(this.trip?.id || this.trip?._id);
  }
}
