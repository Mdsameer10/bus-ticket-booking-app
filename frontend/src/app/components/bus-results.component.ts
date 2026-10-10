import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BusService } from '../services/bus.service';
import { BusCardComponent } from './bus-card.component';

@Component({
  selector: 'app-bus-results',
  standalone: true,
  imports: [CommonModule, RouterLink, BusCardComponent],
  template: `
    <section class="results-shell">
      <div class="top-bar">
        <div>
          <p class="eyebrow">Available journeys</p>
          <h2>{{ from }} → {{ to }} · {{ date }}</h2>
        </div>
        <button type="button" class="secondary-btn" (click)="goHome()">Modify search</button>
      </div>

      <div class="status-box warning" *ngIf="errorMessage">
        {{ errorMessage }}
      </div>

      <div class="loading" *ngIf="isLoading">Loading available buses…</div>

      <div class="empty-state" *ngIf="!isLoading && !errorMessage && trips.length === 0">
        No buses are available for the selected route and date. Please modify the search or choose another date.
        <button type="button" class="secondary-btn" (click)="goHome()">Try another date</button>
      </div>

      <div class="results-grid" *ngIf="!isLoading && trips.length > 0">
        <app-bus-card *ngFor="let trip of trips" [trip]="trip" (book)="goToBooking($event)"></app-bus-card>
      </div>
    </section>
  `,
  styles: [
    `
      .results-shell {
        max-width: 1100px;
        margin: 0 auto;
        padding: 32px 20px 72px;
      }

      .top-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .eyebrow {
        margin: 0 0 6px;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 0.76rem;
      }

      h2 {
        margin: 0;
      }

      .results-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 18px;
      }

      .loading, .empty-state, .status-box {
        background: #fff;
        border-radius: 14px;
        border: 1px solid #e2e8f0;
        padding: 18px;
        margin-bottom: 18px;
      }

      .warning {
        border-color: #fbbf24;
        background: #fffbeb;
      }

      .secondary-btn {
        border: none;
        background: #e2e8f0;
        color: #0f172a;
        border-radius: 10px;
        padding: 10px 14px;
        font-weight: 700;
        cursor: pointer;
      }

      @media (max-width: 640px) {
        .top-bar {
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }
      }
    `,
  ],
})
export class BusResultsComponent implements OnInit {
  trips: any[] = [];
  from = '';
  to = '';
  date = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private busService: BusService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.from = params.get('from') || '';
      this.to = params.get('to') || '';
      this.date = params.get('date') || '';

      if (this.from && this.to && this.date) {
        this.fetchResults();
      }
    });
  }

  fetchResults(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.busService.searchBuses(this.from, this.to, this.date).subscribe({
      next: (response) => {
        this.trips = response?.data || [];
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load buses right now. Please try another search.';
        this.trips = [];
        this.isLoading = false;
      },
    });
  }

  goHome(): void {
    this.router.navigate(['/'], {
      queryParams: {
        from: this.from,
        to: this.to,
        date: this.date,
      },
    });
  }

  goToBooking(tripId: string): void {
    this.router.navigate(['/booking'], {
      queryParams: {
        tripId,
      },
    });
  }
}
