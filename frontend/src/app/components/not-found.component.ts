import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  template: `
    <section class="page-shell">
      <div class="card">
        <h2>Page not found</h2>
        <p>The page you requested cannot be found.</p>
        <a routerLink="/">Return home</a>
      </div>
    </section>
  `,
  styles: [
    `
      .page-shell {
        max-width: 600px;
        margin: 0 auto;
        padding: 64px 20px;
      }

      .card {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 18px;
        padding: 28px;
        text-align: center;
      }

      a {
        color: #1d4ed8;
        font-weight: 700;
      }
    `,
  ],
  imports: [RouterLink],
})
export class NotFoundComponent {}
