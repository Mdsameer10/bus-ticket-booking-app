import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-bus-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page-shell">
      <div class="hero-intro">
        <p class="eyebrow"><span class="eyebrow-dot"></span> COCHIN ↔ CALICUT</p>
        <h1>Make the journey<br /><span>part of the plan.</span></h1>
        <p class="intro-copy">
          Compare schedules, choose your seat count and book your next trip in a few simple steps.
        </p>
      </div>

      <form [formGroup]="searchForm" (ngSubmit)="onSubmit()" class="bus-search-form" novalidate>
        <div class="form-heading">
          <div>
            <p class="form-kicker">Plan your trip</p>
            <h2>Where would you like to go?</h2>
          </div>
          <span class="sample-label">Sample schedules</span>
        </div>

        <div class="form-fields">
          <div class="field-wrapper">
            <label for="from">From</label>
            <select id="from" formControlName="from" autocomplete="off">
              <option value="">Choose departure city</option>
              <option value="Cochin">Cochin</option>
              <option value="Calicut">Calicut</option>
            </select>
            <small class="error" *ngIf="searchForm.get('from')?.touched && searchForm.get('from')?.hasError('required')">
              Choose a departure city.
            </small>
          </div>

          <div class="field-wrapper">
            <label for="to">To</label>
            <select id="to" formControlName="to" autocomplete="off">
              <option value="">Choose destination city</option>
              <option value="Cochin">Cochin</option>
              <option value="Calicut">Calicut</option>
            </select>
            <small class="error" *ngIf="searchForm.get('to')?.touched && searchForm.get('to')?.hasError('required')">
              Choose a destination city.
            </small>
          </div>

          <div class="field-wrapper date-field">
            <label for="journeyDate">Journey date</label>
            <input id="journeyDate" type="date" [min]="today" formControlName="journeyDate" />
            <small class="error" *ngIf="searchForm.get('journeyDate')?.touched && searchForm.get('journeyDate')?.hasError('required')">
              Choose a journey date.
            </small>
            <small class="error" *ngIf="searchForm.get('journeyDate')?.touched && searchForm.get('journeyDate')?.hasError('pastDate')">
              Journey date cannot be in the past.
            </small>
          </div>
        </div>

        <div class="field-alert" *ngIf="searchForm.errors?.['sameCity']">
          Departure and destination cities must be different.
        </div>

        <div class="form-footer">
          <p>Secure your seats in just a few steps.</p>
          <button type="submit" [disabled]="searchForm.invalid || isLoading">
            {{ isLoading ? 'Searching…' : 'Search buses' }}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </form>

      <div class="home-bottom">
        <div class="benefit">
          <span class="benefit-mark" aria-hidden="true">01</span>
          <div><strong>Compare your options</strong><span>Browse schedules and fares in one place.</span></div>
        </div>
        <div class="benefit">
          <span class="benefit-mark" aria-hidden="true">02</span>
          <div><strong>Book with confidence</strong><span>Seat availability is confirmed when you book.</span></div>
        </div>
        <a class="lookup-link" routerLink="/lookup">Already booked? <strong>Find your booking →</strong></a>
      </div>
    </section>
  `,
  styles: [
    `
      .page-shell {
        max-width: 1080px;
        margin: 0 auto;
        padding: 72px 24px 68px;
      }

      .hero-intro {
        max-width: 650px;
        margin: 0 auto 34px;
        text-align: center;
      }

      .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 9px;
        margin: 0 0 18px;
        color: #23756c;
        font-size: 0.74rem;
        font-weight: 750;
        letter-spacing: 0.14em;
      }

      .eyebrow-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #e4a94f;
      }

      h1 {
        margin: 0;
        color: #172b4d;
        font-size: clamp(2.5rem, 5vw, 4.15rem);
        font-weight: 750;
        letter-spacing: -0.055em;
        line-height: 1.06;
      }

      h1 span {
        color: #24776d;
      }

      .intro-copy {
        max-width: 500px;
        margin: 18px auto 0;
        color: #69788e;
        font-size: 1.05rem;
        line-height: 1.65;
      }

      .bus-search-form {
        padding: 28px;
        border: 1px solid #e8edf2;
        border-radius: 18px;
        background: #fff;
        box-shadow: 0 18px 48px rgba(25, 48, 76, 0.08);
      }

      .form-heading,
      .form-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }

      .form-kicker {
        margin: 0 0 5px;
        color: #24776d;
        font-size: 0.75rem;
        font-weight: 750;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }

      h2 {
        margin: 0;
        color: #172b4d;
        font-size: 1.25rem;
        letter-spacing: -0.02em;
      }

      .sample-label {
        padding: 7px 10px;
        border-radius: 999px;
        background: #eff7f5;
        color: #24776d;
        font-size: 0.74rem;
        font-weight: 700;
        white-space: nowrap;
      }

      .form-fields {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 16px;
        margin-top: 24px;
      }

      .field-wrapper {
        display: grid;
        gap: 8px;
      }

      label {
        color: #36465d;
        font-size: 0.83rem;
        font-weight: 700;
      }

      select, input {
        width: 100%;
        min-height: 49px;
        border: 1px solid #dbe3ea;
        border-radius: 10px;
        outline: none;
        background: #fff;
        color: #26374d;
        padding: 0 13px;
        font-size: 0.91rem;
        transition: border-color 160ms ease, box-shadow 160ms ease;
      }

      select:focus, input:focus {
        border-color: #38877f;
        box-shadow: 0 0 0 3px rgba(56, 135, 127, 0.13);
      }

      .form-footer {
        margin-top: 22px;
        padding-top: 20px;
        border-top: 1px solid #edf0f3;
      }

      .form-footer p {
        margin: 0;
        color: #7a8798;
        font-size: 0.82rem;
      }

      button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 18px;
        min-height: 48px;
        border: 0;
        border-radius: 10px;
        background: #1f746b;
        color: #fff;
        font-weight: 700;
        padding: 0 19px;
        cursor: pointer;
        transition: background 160ms ease, transform 160ms ease;
      }

      button:hover:not(:disabled) {
        background: #195f58;
        transform: translateY(-1px);
      }

      button:disabled {
        cursor: not-allowed;
        opacity: 0.55;
      }

      .error {
        color: #b42318;
        font-size: 0.78rem;
      }

      .field-alert {
        margin-top: 12px;
        color: #b42318;
        font-size: 0.84rem;
      }

      .home-bottom {
        display: flex;
        align-items: center;
        gap: 28px;
        margin-top: 30px;
      }

      .benefit {
        display: flex;
        align-items: center;
        gap: 11px;
      }

      .benefit-mark {
        display: grid;
        width: 34px;
        height: 34px;
        flex: 0 0 auto;
        place-items: center;
        border: 1px solid #d7e8e4;
        border-radius: 50%;
        color: #24776d;
        font-size: 0.66rem;
        font-weight: 800;
      }

      .benefit strong,
      .benefit span:last-child {
        display: block;
      }

      .benefit strong {
        color: #30415a;
        font-size: 0.8rem;
      }

      .benefit div span {
        margin-top: 3px;
        color: #7a8798;
        font-size: 0.72rem;
      }

      .lookup-link {
        margin-left: auto;
        color: #6d7c90;
        font-size: 0.8rem;
      }

      .lookup-link strong {
        color: #24776d;
      }

      @media (max-width: 760px) {
        .page-shell {
          padding: 48px 18px;
        }

        .form-fields {
          grid-template-columns: 1fr;
          gap: 13px;
          margin-top: 20px;
        }

        .bus-search-form {
          padding: 22px;
        }

        .home-bottom {
          align-items: flex-start;
          flex-direction: column;
          gap: 18px;
        }

        .lookup-link {
          margin-left: 0;
        }
      }

      @media (max-width: 480px) {
        .page-shell {
          padding-top: 38px;
        }

        .form-heading {
          align-items: flex-start;
          flex-direction: column;
        }

        .form-footer {
          align-items: stretch;
          flex-direction: column;
        }

        .form-footer button {
          width: 100%;
        }
      }
    `,
  ],
})
export class BusSearchComponent implements OnInit {
  isLoading = false;
  today = this.getDefaultDate();

  searchForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.searchForm = this.fb.group(
      {
        from: ['', Validators.required],
        to: ['', Validators.required],
        journeyDate: [this.today, [Validators.required, this.validateJourneyDate]],
      },
      {
        validators: this.validateCities,
      }
    );
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const from = params.get('from');
      const to = params.get('to');
      const date = params.get('date');

      this.searchForm.patchValue({
        from: from === 'Cochin' || from === 'Calicut' ? from : '',
        to: to === 'Cochin' || to === 'Calicut' ? to : '',
        journeyDate: date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : this.today,
      });
    });
  }

  private validateCities(group: FormGroup) {
    const from = group.get('from')?.value;
    const to = group.get('to')?.value;

    if (from && to && from === to) {
      return { sameCity: true };
    }

    return null;
  }

  private validateJourneyDate = (control: AbstractControl) => {
    if (!control.value) {
      return null;
    }

    return control.value < this.today ? { pastDate: true } : null;
  };

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
