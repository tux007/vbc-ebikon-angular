import {
  AfterViewInit, Component, ElementRef, HostListener,
  NgZone, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren, inject, signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { SanityService } from '../../../core/services/sanity.service';
import { Team } from '../../../core/models';

type TeamMenuItem = Pick<Team, '_id' | 'name' | 'slug'> & { gender?: Team['gender'] | 'other' };

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="nav glass" role="navigation" aria-label="Hauptnavigation">
      <!-- Brand -->
      <a class="brand" routerLink="/" (click)="closeMobileMenu()">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 48 48" width="32" height="32">
            <defs>
              <radialGradient id="bmark" cx="30%" cy="30%">
                <stop offset="0%" stop-color="#fff" stop-opacity="0.9"/>
                <stop offset="100%" stop-color="oklch(0.78 0.16 28)" stop-opacity="0.8"/>
              </radialGradient>
            </defs>
            <circle cx="24" cy="24" r="20" fill="url(#bmark)"/>
            <path d="M24 4 C 14 14, 14 34, 24 44" stroke="rgba(0,0,0,0.35)" fill="none" stroke-width="1.2"/>
            <path d="M24 4 C 34 14, 34 34, 24 44" stroke="rgba(0,0,0,0.35)" fill="none" stroke-width="1.2"/>
            <path d="M4 24 C 14 14, 34 14, 44 24" stroke="rgba(0,0,0,0.35)" fill="none" stroke-width="1.2"/>
            <path d="M4 24 C 14 34, 34 34, 44 24" stroke="rgba(0,0,0,0.35)" fill="none" stroke-width="1.2"/>
          </svg>
        </span>
        VBC Ebikon
      </a>

      <!-- Desktop nav links -->
      <div
        class="nav-links-desktop"
        #navLinksContainer
        (mouseleave)="updateIndicator(activeSection())"
      >
        @for (link of navLinks; track link.id) {
          @if (link.id === 'teams') {
            <div class="nav-dropdown">
              <button
                class="nav-link"
                [class.active]="activeSection() === 'teams'"
                [attr.data-link]="link.id"
                #navLinkEl
                (mouseenter)="updateIndicator(link.id)"
                (click)="scrollToSection(link.id)"
              >{{ link.label }}</button>
              <div class="nav-dropdown-content glass">
                @if (femaleTeams.length) {
                  <div class="nav-dropdown-group-label">Damen / Juniorinnen</div>
                  @for (team of femaleTeams; track team._id) {
                    <a [routerLink]="'/teams/' + team.slug">{{ team.name }}</a>
                  }
                }
                @if (maleTeams.length) {
                  <div class="nav-dropdown-group-label">Herren</div>
                  @for (team of maleTeams; track team._id) {
                    <a [routerLink]="'/teams/' + team.slug">{{ team.name }}</a>
                  }
                }
              </div>
            </div>
          } @else {
            <button
              class="nav-link"
              [class.active]="activeSection() === link.id"
              [attr.data-link]="link.id"
              #navLinkEl
              (mouseenter)="updateIndicator(link.id)"
              (click)="scrollToSection(link.id)"
            >{{ link.label }}</button>
          }
        }
        <span
          class="nav-indicator"
          [style.left.px]="indicator().left"
          [style.width.px]="indicator().width"
          [style.opacity]="indicator().opacity"
        ></span>
      </div>

      <button class="nav-cta desktop-only" (click)="scrollToSection('contact')">Mitglied werden</button>

      <!-- Hamburger -->
      <button
        class="nav-burger"
        [class.open]="mobileOpen()"
        aria-label="Menü öffnen"
        (click)="toggleMobileMenu()"
      >
        <span></span><span></span><span></span>
      </button>
    </nav>

    <!-- Mobile fullscreen menu -->
    <div class="mobile-menu" [class.open]="mobileOpen()" (click)="closeMobileMenu()">
      <div class="mobile-menu-inner" (click)="$event.stopPropagation()">
        @for (link of navLinks; track link.id) {
          <button
            class="mobile-link"
            [class.active]="activeSection() === link.id"
            (click)="mobileLinkClick(link.id)"
          >
            <span class="mobile-link-num">{{ ('0' + ($index + 1)).slice(-2) }}</span>
            <span class="mobile-link-label">{{ link.label }}</span>
          </button>
        }

        @if (femaleTeams.length || maleTeams.length) {
          <div class="mobile-teams-group" [class.open]="mobileTeamsOpen()">
            @if (femaleTeams.length) {
              <div class="mobile-group-label">Damen / Juniorinnen</div>
              @for (team of femaleTeams; track team._id) {
                <a [routerLink]="'/teams/' + team.slug" (click)="closeMobileMenu()">{{ team.name }}</a>
              }
            }
            @if (maleTeams.length) {
              <div class="mobile-group-label">Herren</div>
              @for (team of maleTeams; track team._id) {
                <a [routerLink]="'/teams/' + team.slug" (click)="closeMobileMenu()">{{ team.name }}</a>
              }
            }
          </div>
        }

        <button class="btn btn-primary" style="margin-top:24px; align-self:flex-start" (click)="mobileLinkClick('contact')">
          Mitglied werden
        </button>
      </div>
    </div>
  `,
})
export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy {
  private sanity = inject(SanityService);
  private zone = inject(NgZone);

  @ViewChild('navLinksContainer') navLinksContainer!: ElementRef<HTMLDivElement>;
  @ViewChildren('navLinkEl') navLinkEls!: QueryList<ElementRef<HTMLButtonElement>>;

  activeSection = signal('home');
  mobileOpen = signal(false);
  mobileTeamsOpen = signal(false);
  indicator = signal({ left: 0, width: 0, opacity: 0 });

  readonly navLinks = [
    { id: 'home', label: 'Start' },
    { id: 'teams', label: 'Teams' },
    { id: 'schedule', label: 'Spielplan' },
    { id: 'news', label: 'News' },
    { id: 'training', label: 'Training' },
    { id: 'sponsors', label: 'Sponsoren' },
    { id: 'contact', label: 'Kontakt' },
  ];

  private readonly fallbackTeams: TeamMenuItem[] = [
    { _id: 'f-damen-1', name: 'Damen 1', slug: 'damen-1', gender: 'f' },
    { _id: 'f-damen-2', name: 'Damen 2', slug: 'damen-2', gender: 'f' },
    { _id: 'f-dj1', name: 'Juniorinnen 1', slug: 'dj1', gender: 'f' },
    { _id: 'f-dj2', name: 'Juniorinnen 2', slug: 'dj2', gender: 'f' },
    { _id: 'f-dj3', name: 'Juniorinnen 3', slug: 'dj3', gender: 'f' },
    { _id: 'f-herren-1', name: 'Herren 1', slug: 'herren-1', gender: 'm' },
    { _id: 'f-herren-2', name: 'Herren 2', slug: 'herren-2', gender: 'm' },
  ];

  teams: TeamMenuItem[] = [...this.fallbackTeams];
  get femaleTeams() { return this.teams.filter(t => t.gender === 'f'); }
  get maleTeams() { return this.teams.filter(t => t.gender === 'm'); }

  private sectionObserver?: IntersectionObserver;
  private resizeHandler = () => this.updateIndicator(this.activeSection());

  ngOnInit(): void {
    this.sanity.getTeams().subscribe(sanityTeams => {
      const bySlug = new Map<string, TeamMenuItem>();
      for (const t of this.fallbackTeams) bySlug.set(t.slug, t);
      for (const t of sanityTeams) bySlug.set(t.slug, t as TeamMenuItem);
      this.teams = Array.from(bySlug.values()).sort((a, b) => {
        const rank = (t: TeamMenuItem) => t.gender === 'f' ? 0 : t.gender === 'm' ? 1 : 2;
        return rank(a) - rank(b) || a.name.localeCompare(b.name, 'de-CH');
      });
    });

    if (typeof IntersectionObserver !== 'undefined') {
      this.sectionObserver = new IntersectionObserver(
        entries => {
          for (const e of entries) {
            if (e.isIntersecting) this.zone.run(() => {
              this.activeSection.set(e.target.id);
              this.updateIndicator(e.target.id);
            });
          }
        },
        { threshold: 0.3 }
      );
      const ids = ['home', 'teams', 'schedule', 'news', 'training', 'sponsors', 'contact'];
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) this.sectionObserver!.observe(el);
      });
    }

    window.addEventListener('resize', this.resizeHandler);
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.updateIndicator(this.activeSection()), 100);
  }

  ngOnDestroy(): void {
    this.sectionObserver?.disconnect();
    window.removeEventListener('resize', this.resizeHandler);
  }

  updateIndicator(id: string): void {
    if (!this.navLinksContainer?.nativeElement) return;
    const container = this.navLinksContainer.nativeElement;
    const el = container.querySelector<HTMLElement>(`[data-link="${id}"]`);
    if (!el) return;
    const parentRect = container.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    this.indicator.set({ left: rect.left - parentRect.left, width: rect.width, opacity: 1 });
  }

  scrollToSection(id: string): void {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    this.activeSection.set(id);
    this.updateIndicator(id);
  }

  toggleMobileMenu(): void { this.mobileOpen.update(v => !v); }
  closeMobileMenu(): void { this.mobileOpen.set(false); this.mobileTeamsOpen.set(false); }

  mobileLinkClick(id: string): void {
    if (id === 'teams') { this.mobileTeamsOpen.update(v => !v); return; }
    this.closeMobileMenu();
    setTimeout(() => this.scrollToSection(id), 260);
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 780) this.closeMobileMenu();
  }
}
