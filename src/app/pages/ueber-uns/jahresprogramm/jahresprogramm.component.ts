import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
  inject,
} from '@angular/core';
import {
  animate,
  query,
  stagger,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Subscription } from 'rxjs';
import {
  AnnualProgramCategory,
  AnnualProgramEvent,
  AnnualProgramPage,
} from '../../../core/models';
import { SanityService } from '../../../core/services/sanity.service';

type FilterValue = 'Alle' | AnnualProgramCategory;

type TimelineMonth = {
  key: string;
  label: string;
  isCurrent: boolean;
  events: TimelineEvent[];
};

type TimelineEvent = AnnualProgramEvent & {
  id: string;
  start: Date;
  end: Date;
  displayDate: string;
  isPast: boolean;
  isHighlight: boolean;
  countdownText?: string;
  side: 'left' | 'right';
  monthKey: string;
};

const CATEGORY_META: Record<AnnualProgramCategory, { color: string; icon: string }> = {
  Vereinsanlass: {
    color: 'var(--color-vereinsanlass)',
    icon: 'M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1.5A2.5 2.5 0 0 1 22 6.5v11A2.5 2.5 0 0 1 19.5 20h-15A2.5 2.5 0 0 1 2 17.5v-11A2.5 2.5 0 0 1 4.5 4H6V3a1 1 0 0 1 1-1Zm12.5 8h-15v7.5a.5.5 0 0 0 .5.5h14a.5.5 0 0 0 .5-.5V10Z',
  },
  Spezialtraining: {
    color: 'var(--color-spezialtraining)',
    icon: 'M15.59 5.41a2 2 0 1 1 2.82 2.82l-2.17 2.18 1.76 1.76a1 1 0 0 1 0 1.41l-4.24 4.25a1 1 0 0 1-1.42 0l-1.76-1.77-4.24 4.24a1 1 0 1 1-1.42-1.41l4.25-4.24-1.77-1.77a1 1 0 0 1 0-1.41l4.25-4.24a1 1 0 0 1 1.41 0l1.77 1.76 2.76-2.76Z',
  },
  Spieltag: {
    color: 'var(--color-spieltag)',
    icon: 'M12 2c2.2 0 4.23.79 5.81 2.11A9.97 9.97 0 0 1 22 12c0 2.3-.78 4.41-2.09 6.09A9.97 9.97 0 0 1 12 22a9.96 9.96 0 0 1-7.8-3.74A9.98 9.98 0 0 1 2 12c0-2.18.7-4.2 1.89-5.84A9.97 9.97 0 0 1 12 2Zm-4.62 3.7 2.15 2.15L6.7 10.68 4.8 8.78A7.95 7.95 0 0 0 4 12c0 .77.11 1.52.33 2.22l2.37-.78 2.82 2.82-.78 2.37A7.96 7.96 0 0 0 12 20c1.2 0 2.34-.26 3.37-.73l-.78-2.37 2.82-2.82 2.37.78c.15-.5.22-1.02.22-1.56 0-.6-.09-1.18-.24-1.73l-2.35.78-2.83-2.83.78-2.35A7.97 7.97 0 0 0 12 4c-1.7 0-3.28.54-4.62 1.46Z',
  },
  Trainingsweekend: {
    color: 'var(--color-trainingsweekend)',
    icon: 'M3 18.5 10.5 6a2.2 2.2 0 0 1 3.76 0L21 18.5a1 1 0 0 1-.88 1.5H3.88A1 1 0 0 1 3 18.5ZM12 9.2 7.38 18h9.2L12 9.2Z',
  },
  Volleyballlager: {
    color: 'var(--color-volleyballlager)',
    icon: 'M6 4h9.5l3 3V20a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm1 2v13h9.5V8H14a2 2 0 0 1-2-2V6H7Zm7 0v1h1.5L14 6Z',
  },
};

@Component({
  selector: 'app-jahresprogramm',
  standalone: true,
  templateUrl: './jahresprogramm.component.html',
  styleUrl: './jahresprogramm.component.css',
  animations: [
    trigger('cardReveal', [
      state('hidden', style({ opacity: 0, transform: 'translateY(22px) scale(0.985)' })),
      state('visible', style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
      transition('hidden => visible', animate('520ms cubic-bezier(0.22, 1, 0.36, 1)')),
    ]),
    trigger('timelineShuffle', [
      transition('* <=> *', [
        query(
          '.timeline-card',
          [
            style({ opacity: 0, transform: 'translateY(18px)' }),
            stagger(70, animate('420ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))),
          ],
          { optional: true },
        ),
      ]),
    ]),
  ],
})
export class JahresprogrammComponent implements OnInit, AfterViewInit, OnDestroy {
  private sanity = inject(SanityService);
  private zone = inject(NgZone);
  private subscriptions = new Subscription();
  private observer?: IntersectionObserver;
  private hasAutoScrolled = false;

  @ViewChildren('timelineCard') private timelineCards?: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('monthSection') private monthSections?: QueryList<ElementRef<HTMLElement>>;

  protected readonly categories = Object.keys(CATEGORY_META) as AnnualProgramCategory[];

  page: AnnualProgramPage | null = null;
  loading = true;
  activeFilter: FilterValue = 'Alle';
  showPastEvents = true;
  animationCycle = 0;
  monthGroups: TimelineMonth[] = [];

  private visibleIds = new Set<string>();

  ngOnInit(): void {
    this.sanity.getAnnualProgram().subscribe(page => {
      this.page = page;
      this.rebuildTimeline();
      this.loading = false;
      this.scheduleObserverRefresh();
      this.scheduleScrollToCurrentMonth();
    });
  }

  ngAfterViewInit(): void {
    this.subscriptions.add(this.timelineCards?.changes.subscribe(() => this.scheduleObserverRefresh()));
    this.subscriptions.add(this.monthSections?.changes.subscribe(() => this.scheduleScrollToCurrentMonth()));
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.subscriptions.unsubscribe();
  }

  get displayYear(): number {
    return this.page?.programYear
      ?? this.monthGroups[0]?.events[0]?.start.getFullYear()
      ?? new Date().getFullYear();
  }

  get introParagraphs(): string[] {
    return (this.page?.body ?? [])
      .filter(block => block._type === 'block')
      .map(block => (block.children ?? []).map(child => child.text).join('').trim())
      .filter(Boolean);
  }

  setFilter(filter: FilterValue): void {
    if (this.activeFilter === filter) return;
    this.activeFilter = filter;
    this.rebuildTimeline();
  }

  togglePastEvents(): void {
    this.showPastEvents = !this.showPastEvents;
    this.rebuildTimeline();
  }

  categoryMeta(category: AnnualProgramCategory): { color: string; icon: string } {
    return CATEGORY_META[category];
  }

  cardState(id: string): 'hidden' | 'visible' {
    return this.visibleIds.has(id) ? 'visible' : 'hidden';
  }

  trackMonth(_: number, month: TimelineMonth): string {
    return month.key;
  }

  private rebuildTimeline(): void {
    const prepared = (this.page?.annualProgramEvents ?? [])
      .map(event => this.toTimelineEvent(event))
      .filter((event): event is TimelineEvent => event !== null)
      .filter(event => this.activeFilter === 'Alle' || event.category === this.activeFilter)
      .filter(event => this.showPastEvents || !event.isPast)
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    let index = 0;
    const groups = new Map<string, TimelineMonth>();
    for (const event of prepared) {
      const group = groups.get(event.monthKey) ?? {
        key: event.monthKey,
        label: this.monthLabel(event.start),
        isCurrent: this.isCurrentMonth(event.start),
        events: [],
      };

      group.events.push({
        ...event,
        side: index % 2 === 0 ? 'left' : 'right',
      });
      groups.set(event.monthKey, group);
      index += 1;
    }

    this.monthGroups = Array.from(groups.values());
    this.animationCycle += 1;
    this.visibleIds.clear();
    this.scheduleObserverRefresh();
    this.scheduleScrollToCurrentMonth();
  }

  private toTimelineEvent(event: AnnualProgramEvent): TimelineEvent | null {
    if (!event.startDate || !event.description || !event.category) return null;

    const start = this.parseDate(event.startDate);
    const end = event.endDate ? this.parseDate(event.endDate) : start;
    const endOfDay = new Date(end);
    endOfDay.setHours(23, 59, 59, 999);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysUntilStart = Math.ceil((start.getTime() - today.getTime()) / 86400000);

    return {
      ...event,
      id: event._key || `${event.category}-${event.startDate}-${event.description}`,
      start,
      end,
      monthKey: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`,
      displayDate: this.formatDateRange(start, end),
      isPast: endOfDay.getTime() < today.getTime(),
      isHighlight: (daysUntilStart >= 0 && daysUntilStart <= 7) || event.category === 'Volleyballlager',
      countdownText: daysUntilStart >= 0 && daysUntilStart <= 7
        ? `Noch ${daysUntilStart} ${daysUntilStart === 1 ? 'Tag' : 'Tage'}`
        : undefined,
      side: 'left',
    };
  }

  private parseDate(input: string): Date {
    return new Date(`${input}T12:00:00`);
  }

  private formatDateRange(start: Date, end: Date): string {
    const sameDay = start.getTime() === end.getTime();
    if (sameDay) {
      return this.formatDate(start);
    }

    const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
    if (sameMonth) {
      return `${String(start.getDate()).padStart(2, '0')}.-${this.formatDate(end)}`;
    }

    return `${this.formatDate(start)}-${this.formatDate(end)}`;
  }

  private formatDate(date: Date): string {
    return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
  }

  private monthLabel(date: Date): string {
    const label = new Intl.DateTimeFormat('de-CH', { month: 'long' }).format(date);
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  private isCurrentMonth(date: Date): boolean {
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }

  private scheduleObserverRefresh(): void {
    queueMicrotask(() => this.bindObserver());
  }

  private bindObserver(): void {
    this.observer?.disconnect();
    this.observer = new IntersectionObserver(
      entries => {
        this.zone.run(() => {
          for (const entry of entries) {
            const id = entry.target.getAttribute('data-event-id');
            if (entry.isIntersecting && id) {
              this.visibleIds.add(id);
              this.observer?.unobserve(entry.target);
            }
          }
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
    );

    for (const card of this.timelineCards?.toArray() ?? []) {
      this.observer.observe(card.nativeElement);
    }
  }

  private scheduleScrollToCurrentMonth(): void {
    if (this.hasAutoScrolled) return;
    setTimeout(() => this.scrollToCurrentMonth(), 120);
  }

  private scrollToCurrentMonth(): void {
    if (this.hasAutoScrolled || !this.monthGroups.length || !this.monthSections?.length) return;

    const targetMonth = this.monthGroups.find(month => month.isCurrent)
      ?? this.monthGroups.find(month => month.events.some(event => !event.isPast))
      ?? this.monthGroups[0];

    const target = this.monthSections.find(ref => ref.nativeElement.dataset['monthKey'] === targetMonth.key);
    target?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.hasAutoScrolled = true;
  }
}