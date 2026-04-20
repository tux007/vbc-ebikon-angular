import { Component, HostListener, OnInit, inject } from '@angular/core';
import { SanityService } from '../../core/services/sanity.service';
import { BoardMember } from '../../core/models';

@Component({
  selector: 'app-vorstand',
  standalone: true,
  template: `
    <main class="vorstand-main">
      <h1 class="vorstand-title">Unser Vorstand</h1>

      @if (loading) {
        <div class="banner-loading">
          <img src="/assets/img/volleyball-loader.png" alt="Laden…" class="banner-volleyball-spinner" />
        </div>
      }

      @if (!loading && carouselMembers.length) {
        <section class="vorstand-carousel" aria-label="Vorstandsmitglieder" (wheel)="onWheel($event)">
          <button class="vorstand-nav-btn" type="button" aria-label="Vorheriges Vorstandsmitglied" (click)="prev()">‹</button>

          <div class="vorstand-viewport">
            <div
              class="vorstand-track"
              [class.without-transition]="withoutTransition"
              [style.transform]="trackTransform"
              (transitionend)="onTrackTransitionEnd()"
            >
              @for (m of carouselMembers; track m._id + '-' + $index) {
                <article class="vorstand-card" [style.flex]="cardFlexBasis">
                  <img
                    class="vorstand-card-photo"
                    [src]="m.photo?.url || '/assets/img/Vorstand/praesi.jpg'"
                    [alt]="m.name"
                  />
                  <div class="vorstand-card-info">
                    <h2>{{ m.name }}</h2>
                    <p>{{ m.role }}</p>
                  </div>
                </article>
              }
            </div>
          </div>

          <button class="vorstand-nav-btn" type="button" aria-label="Nächstes Vorstandsmitglied" (click)="next()">›</button>
        </section>
      }

      @if (!loading && !members.length) {
        <p class="vorstand-empty">Noch keine Vorstandsmitglieder vorhanden. Bitte in Sanity erfassen.</p>
      }
    </main>
  `,
})
export class VorstandComponent implements OnInit {
  private sanity = inject(SanityService);

  private readonly fallbackMembers: BoardMember[] = [
    { _id: 'fallback-1', name: 'Präsidium', role: 'Präsident', photo: { asset: { _ref: '' }, url: '/assets/img/Vorstand/praesi.jpg' } },
    { _id: 'fallback-2', name: 'Vizepräsidium', role: 'Vizepräsidentin', photo: { asset: { _ref: '' }, url: '/assets/img/Vorstand/vize.jpg' } },
    { _id: 'fallback-3', name: 'Hallenwart', role: 'Infrastruktur', photo: { asset: { _ref: '' }, url: '/assets/img/Vorstand/hallen.jpg' } },
  ];

  members: BoardMember[] = [];
  carouselMembers: BoardMember[] = [];
  loading = true;

  visibleCount = 3;
  currentIndex = 0;
  withoutTransition = false;

  get cardFlexBasis(): string {
    return `0 0 ${100 / this.visibleCount}%`;
  }

  get trackTransform(): string {
    return `translateX(-${this.currentIndex * (100 / this.visibleCount)}%)`;
  }

  ngOnInit(): void {
    this.updateVisibleCount();
    this.sanity.getBoardMembers().subscribe(m => {
      this.members = m.length ? m : this.fallbackMembers;
      this.rebuildCarousel();
      this.loading = false;
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    const before = this.visibleCount;
    this.updateVisibleCount();
    if (before !== this.visibleCount) {
      this.rebuildCarousel();
    }
  }

  next(): void {
    if (this.members.length < this.visibleCount) return;
    this.withoutTransition = false;
    this.currentIndex += 1;
  }

  prev(): void {
    if (this.members.length < this.visibleCount) return;
    this.withoutTransition = false;
    this.currentIndex -= 1;
  }

  onWheel(event: WheelEvent): void {
    if (this.members.length < this.visibleCount) return;
    event.preventDefault();
    if (event.deltaY > 0 || event.deltaX > 0) {
      this.next();
    } else {
      this.prev();
    }
  }

  onTrackTransitionEnd(): void {
    if (this.members.length < this.visibleCount) return;

    const size = this.members.length;
    if (this.currentIndex >= size * 2) {
      this.withoutTransition = true;
      this.currentIndex -= size;
      return;
    }

    if (this.currentIndex < size) {
      this.withoutTransition = true;
      this.currentIndex += size;
    }
  }

  private rebuildCarousel(): void {
    if (!this.members.length) {
      this.carouselMembers = [];
      this.currentIndex = 0;
      return;
    }

    this.carouselMembers = [...this.members, ...this.members, ...this.members];
    this.withoutTransition = true;
    this.currentIndex = this.members.length;
  }

  private updateVisibleCount(): void {
    const width = window.innerWidth;
    if (width < 700) {
      this.visibleCount = 1;
      return;
    }
    if (width < 1100) {
      this.visibleCount = 2;
      return;
    }
    this.visibleCount = 3;
  }
}
