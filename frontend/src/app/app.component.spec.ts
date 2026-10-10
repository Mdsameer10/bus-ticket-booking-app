import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('creates the application shell', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the booking brand and navigation without Angular starter content', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.brand-copy strong')?.textContent).toContain('Intercity');
    expect(compiled.querySelector('.site-nav')?.textContent).toContain('Search trips');
    expect(compiled.querySelector('.site-nav')?.textContent).toContain('Manage booking');
    expect(compiled.textContent).not.toContain('Hello,');
    expect(compiled.textContent).not.toContain('Explore docs');
    expect(compiled.textContent).not.toContain('Angular DevTools');
  });
});
