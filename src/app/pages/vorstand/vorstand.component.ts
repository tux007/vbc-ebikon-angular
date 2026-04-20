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
          <button class="vorstand-nav-btn" type="button" aria-label="Vorheriges Vorstandsmitglied" [disabled]="!canPrev" (click)="prev()">‹</button>

          <div class="vorstand-viewport lg-glass-strong">
            <div
              class="vorstand-track"
              [style.transform]="trackTransform"
            >
              @for (m of carouselMembers; track m._id + '-' + $index) {
                <article class="vorstand-card lg-glass-subtle lg-interactive" [style.flex]="cardFlexBasis">
                  <img
                    class="vorstand-card-photo"
                    [src]="m.photo?.url || '/assets/img/Vorstand/praesi.jpg'"
                    [alt]="m.name"
                  />
                  <div class="vorstand-card-info">
                    <h2>{{ m.name }}</h2>
                    <p>{{ m.role }}</p>
                    @if (m.email) {
                      <span class="vorstand-email">{{ obfuscateEmail(m.email) }}</span>
                    }
                  </div>
                </article>
              }
            </div>
          </div>

          <button class="vorstand-nav-btn" type="button" aria-label="Nächstes Vorstandsmitglied" [disabled]="!canNext" (click)="next()">›</button>
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
    { _id: 'fallback-1', name: 'Präsidium', role: 'Präsident', order: 1, photo: { asset: { _ref: '' }, url: '/assets/img/Vorstand/praesi.jpg' } },
    { _id: 'fallback-2', name: 'Vizepräsidium', role: 'Vizepräsidentin', order: 2, photo: { asset: { _ref: '' }, url: '/assets/img/Vorstand/vize.jpg' } },
    { _id: 'fallback-3', name: 'Hallenwart', role: 'Infrastruktur', order: 3, photo: { asset: { _ref: '' }, url: '/assets/img/Vorstand/hallen.jpg' } },
  ];

  members: BoardMember[] = [];
  carouselMembers: BoardMember[] = [];
  loading = true;

  visibleCount = 3;
  currentIndex = 0;

  get canPrev(): boolean {
    return this.currentIndex > 0;
  }

  get canNext(): boolean {
    return this.currentIndex < this.maxStartIndex;
  }

  private get maxStartIndex(): number {
    return Math.max(0, this.carouselMembers.length - this.visibleCount);
  }

  get cardFlexBasis(): string {
    return `0 0 ${100 / this.visibleCount}%`;
  }

  get trackTransform(): string {
    return `translateX(-${this.currentIndex * (100 / this.visibleCount)}%)`;
  }

  ngOnInit(): void {
    this.updateVisibleCount();
    this.sanity.getBoardMembers().subscribe(m => {
      const source = m.length ? m : this.fallbackMembers;
      this.members = this.sortMembers(source);
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
    if (!this.canNext) return;
    this.currentIndex = Math.min(this.currentIndex + 1, this.maxStartIndex);
  }

  prev(): void {
    if (!this.canPrev) return;
    this.currentIndex = Math.max(this.currentIndex - 1, 0);
  }

  onWheel(event: WheelEvent): void {
    if (event.deltaY > 0 || event.deltaX > 0) {
      if (!this.canNext) return;
      event.preventDefault();
      this.next();
    } else {
      if (!this.canPrev) return;
      event.preventDefault();
      this.prev();
    }
  }

  private rebuildCarousel(): void {
    if (!this.members.length) {
      this.carouselMembers = [];
      this.currentIndex = 0;
      return;
    }

    this.carouselMembers = [...this.members];
    this.currentIndex = Math.min(this.currentIndex, this.maxStartIndex);
  }

  private sortMembers(items: BoardMember[]): BoardMember[] {
    const orderRank = (member: BoardMember): number => {
      return Number.isFinite(member.order) ? Number(member.order) : Number.MAX_SAFE_INTEGER;
    };

    const rank = (member: BoardMember): number => {
      const role = (member.role ?? '').toLocaleLowerCase('de-CH');
      if (role.includes('präsident')) return 0;
      if (role.includes('vize')) return 1;
      return 2;
    };

    return [...items].sort((a, b) => {
      const orderDiff = orderRank(a) - orderRank(b);
      if (orderDiff !== 0) return orderDiff;

      const diff = rank(a) - rank(b);
      if (diff !== 0) return diff;
      return a.name.localeCompare(b.name, 'de-CH');
    });
  }

  obfuscateEmail(email: string): string {
    return email
      .replace('@', ' [at] ')
      .replace(/\./g, ' [dot] ');
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
