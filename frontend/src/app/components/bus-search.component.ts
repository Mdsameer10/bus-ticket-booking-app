import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-bus-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page-shell">
      <div class="hero-card">
        <div class="hero-copy">
          <p class="eyebrow">Sample travel booking experience</p>
          <h1>Find your next intercity bus</h1>
          <p>
            Search between Cochin and Calicut for available trips from sample operators.
          </p>
        </div>

        <form [formGroup]="searchForm" (ngSubmit)="onSubmit()" class="bus-search-form" novalidate>
          <div class="field-wrapper">
            <label for="from">From City</label>
            <select id="from" formControlName="from">
              <option value="">Select city</option>
              <option value="Cochin">Cochin</option>
              <option value="Calicut">Calicut</option>
            </select>
            <small class="error" *ngIf="searchForm.get('from')?.touched && searchForm.get('from')?.hasError('required')">
              Please select a departure city.
            </small>
          </div>

          <div class="field-wrapper">
            <label for="to">To City</label>
            <select id="to" formControlName="to">
              <option value="">Select city</option>
              <option value="Cochin">Cochin</option>
              <option value="Calicut">Calicut</option>
            </select>
            <small class="error" *ngIf="searchForm.get('to')?.touched && searchForm.get('to')?.hasError('required')">
              Please select a destination city.
            </small>
          </div>

          <div class="field-wrapper">
            <label for="journeyDate">Journey Date</label>
            <input id="journeyDate" type="date" formControlName="journeyDate" />
            <small class="error" *ngIf="searchForm.get('journeyDate')?.touched && searchForm.get('journeyDate')?.hasError('required')">
              Journey date is required.
            </small>
          </div>

          <div class="field-alert" *ngIf="searchForm.errors?.['sameCity'] && searchForm.touched">
            Departure and destination cities cannot be the same.
          </div>

          <button type="submit" [disabled]="searchForm.invalid || isLoading">
            {{ isLoading ? 'Searching...' : 'Search Buses' }}
          </button>
        </form>
      </div>

      <div class="quick-links">
        <a class="secondary-link" routerLink="/lookup">Retrieve booking by reference</a>
      </div>
    </section>
  `,
  styles: [
    `
      .page-shell {
        max-width: 1100px;
        margin: 0 auto;
        padding: 48px 20px 80px;
      }

      .hero-card {
        display: grid;
        grid-template-columns: 1.15fr 1fr;
        gap: 28px;
        background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
        border-radius: 20px;
        color: #fff;
        padding: 32px;
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.18);
      }

      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-size: 12px;
        opacity: 0.8;
      }

      .hero-copy h1 {
        font-size: clamp(2rem, 4vw, 3rem);
        margin: 10px 0 16px;
      }

      .hero-copy p {
        color: rgba(255, 255, 255, 0.84);
        line-height: 1.6;
      }

      .bus-search-form {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 16px;
        padding: 20px;
        display: grid;
        gap: 16px;
      }

      .field-wrapper {
        display: grid;
        gap: 8px;
      }

      label {
        font-size: 0.92rem;
        font-weight: 600;
      }

      select, input {
        border: 1px solid rgba(148, 163, 184, 0.7);
        border-radius: 10px;
        padding: 12px 14px;
        font-size: 1rem;
      }

      button {
        background: #f59e0b;
        border: none;
        border-radius: 10px;
        color: #0f172a;
        font-weight: 700;
        padding: 12px 18px;
        cursor: pointer;
      }

      button:disabled {
        cursor: not-allowed;
        opacity: 0.7;
      }

      .error, .field-alert {
        color: #fecaca;
        font-size: 0.8rem;
      }

      .quick-links {
        margin-top: 20px;
        text-align: center;
      }

      .secondary-link {
        color: #1e3a8a;
        font-weight: 700;
        text-decoration: none;
      }

      @media (max-width: 760px) {
        .hero-card {
          grid-template-columns: 1fr;
          padding: 20px;
        }
      }
    `,
  ],
})
export class BusSearchComponent {
  isLoading = false;

  searchForm!: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.searchForm = this.fb.group(
      {
        from: ['', Validators.required],
        to: ['', Validators.required],
        journeyDate: [this.getDefaultDate(), Validators.required],
      },
      {
        validators: this.validateCities,
      }
    );
  }

  private validateCities(group: FormGroup) {
    const from = group.get('from')?.value;
    const to = group.get('to')?.value;

    if (!from || !to || from === to) {
      return { sameCity: true };
    }

    return null;
  }

  private getDefaultDate(): string {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 10);
  }

  onSubmit(): void {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    const { from, to, journeyDate } = this.searchForm.value;
    this.isLoading = true;

    this.router.navigate(['/results'], {
      queryParams: {
        from,
        to,
        date: journeyDate,
      },
    });
  }
}
