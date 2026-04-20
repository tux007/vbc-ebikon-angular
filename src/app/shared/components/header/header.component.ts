import { Component, HostListener, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SanityService } from '../../../core/services/sanity.service';
import { Team } from '../../../core/models';

type TeamMenuItem = Pick<Team, '_id' | 'name' | 'slug'> & { gender?: Team['gender'] | 'other' };

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="site-header">
      <div class="site-header-inner">
        <a class="header-brand" routerLink="/" (click)="closeMobileMenu()">
          <img src="/assets/img/LogoVBC.png" alt="VBC Ebikon Logo" class="header-logo" />
        </a>

        <button
          type="button"
          class="header-menu-toggle"
          (click)="toggleMobileMenu()"
          [attr.aria-expanded]="isMenuOpen"
          aria-label="Menü öffnen"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav class="header-nav" [class.is-open]="isMenuOpen" aria-label="Hauptnavigation">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="closeMobileMenu()">Home</a>

          <div class="dropdown desktop-only">
            <button type="button" class="dropdown-trigger">Teams</button>
            <div class="dropdown-content">
              @if (femaleTeams.length) {
                <div class="dropdown-group-label">Damen / Juniorinnen</div>
                @for (team of femaleTeams; track team._id) {
                  <a [routerLink]="'/teams/' + team.slug" (click)="blurActiveElement()">{{ team.name }}</a>
                }
              }
              @if (maleTeams.length) {
                <div class="dropdown-group-label">Herren</div>
                @for (team of maleTeams; track team._id) {
                  <a [routerLink]="'/teams/' + team.slug" (click)="blurActiveElement()">{{ team.name }}</a>
                }
              }
              @if (otherTeams.length) {
                <div class="dropdown-group-label">Weitere</div>
                @for (team of otherTeams; track team._id) {
                  <a [routerLink]="'/teams/' + team.slug" (click)="blurActiveElement()">{{ team.name }}</a>
                }
              }
            </div>
          </div>

          <div class="mobile-only nav-accordion">
            <button type="button" class="accordion-trigger" [class.is-open]="isTeamsOpen" (click)="toggleTeamsMenu()">
              Teams
            </button>
            <div class="accordion-panel" [class.is-open]="isTeamsOpen">
              @if (femaleTeams.length) {
                <div class="dropdown-group-label">Damen / Juniorinnen</div>
                @for (team of femaleTeams; track team._id) {
                  <a [routerLink]="'/teams/' + team.slug" (click)="closeMobileMenu()">{{ team.name }}</a>
                }
              }
              @if (maleTeams.length) {
                <div class="dropdown-group-label">Herren</div>
                @for (team of maleTeams; track team._id) {
                  <a [routerLink]="'/teams/' + team.slug" (click)="closeMobileMenu()">{{ team.name }}</a>
                }
              }
              @if (otherTeams.length) {
                <div class="dropdown-group-label">Weitere</div>
                @for (team of otherTeams; track team._id) {
                  <a [routerLink]="'/teams/' + team.slug" (click)="closeMobileMenu()">{{ team.name }}</a>
                }
              }
            </div>
          </div>

          <a routerLink="/sponsoren" routerLinkActive="active" (click)="closeMobileMenu()">Sponsoren</a>

          <div class="dropdown desktop-only">
            <button type="button" class="dropdown-trigger">Über uns</button>
            <div class="dropdown-content">
              <a routerLink="/ueber-uns/jahresprogramm" (click)="blurActiveElement()">Jahresprogramm</a>
              <a routerLink="/ueber-uns/vorstand" (click)="blurActiveElement()">Vorstand</a>
              <a routerLink="/ueber-uns/beach" (click)="blurActiveElement()">Beachfeld</a>
              <a routerLink="/ueber-uns/hallen" (click)="blurActiveElement()">Hallen</a>
              <a routerLink="/ueber-uns/dokumente" (click)="blurActiveElement()">Dokumente</a>
            </div>
          </div>

          <div class="mobile-only nav-accordion">
            <button type="button" class="accordion-trigger" [class.is-open]="isAboutOpen" (click)="toggleAboutMenu()">
              Über uns
            </button>
            <div class="accordion-panel" [class.is-open]="isAboutOpen">
              <a routerLink="/ueber-uns/jahresprogramm" (click)="closeMobileMenu()">Jahresprogramm</a>
              <a routerLink="/ueber-uns/vorstand" (click)="closeMobileMenu()">Vorstand</a>
              <a routerLink="/ueber-uns/beach" (click)="closeMobileMenu()">Beachfeld</a>
              <a routerLink="/ueber-uns/hallen" (click)="closeMobileMenu()">Hallen</a>
              <a routerLink="/ueber-uns/dokumente" (click)="closeMobileMenu()">Dokumente</a>
            </div>
          </div>

          <a routerLink="/volleyballlager" routerLinkActive="active" (click)="closeMobileMenu()">Volleyballlager</a>
          <a routerLink="/kontakt" routerLinkActive="active" (click)="closeMobileMenu()">Kontakt</a>
        </nav>
      </div>
    </header>
  `,
})
export class HeaderComponent implements OnInit {
  private sanity = inject(SanityService);
  isMenuOpen = false;
  isTeamsOpen = false;
  isAboutOpen = false;

  private readonly fallbackTeams: TeamMenuItem[] = [
    { _id: 'fallback-damen-1', name: 'Damen 1', slug: 'damen-1', gender: 'f' },
    { _id: 'fallback-damen-2', name: 'Damen 2', slug: 'damen-2', gender: 'f' },
    { _id: 'fallback-dj1', name: 'Juniorinnen 1', slug: 'dj1', gender: 'f' },
    { _id: 'fallback-dj2', name: 'Juniorinnen 2', slug: 'dj2', gender: 'f' },
    { _id: 'fallback-dj3', name: 'Juniorinnen 3', slug: 'dj3', gender: 'f' },
    { _id: 'fallback-herren-1', name: 'Herren 1', slug: 'herren-1', gender: 'm' },
    { _id: 'fallback-herren-2', name: 'Herren 2', slug: 'herren-2', gender: 'm' },
  ];

  teams: TeamMenuItem[] = this.sortTeams([...this.fallbackTeams]);

  get femaleTeams(): TeamMenuItem[] {
    return this.teams.filter(t => t.gender === 'f');
  }

  get maleTeams(): TeamMenuItem[] {
    return this.teams.filter(t => t.gender === 'm');
  }

  get otherTeams(): TeamMenuItem[] {
    return this.teams.filter(t => t.gender !== 'f' && t.gender !== 'm');
  }

  ngOnInit(): void {
    this.sanity.getTeams().subscribe(sanityTeams => {
      const bySlug = new Map<string, TeamMenuItem>();

      for (const team of this.fallbackTeams) {
        bySlug.set(team.slug, team);
      }
      for (const team of sanityTeams) {
        bySlug.set(team.slug, team as TeamMenuItem);
      }

      this.teams = this.sortTeams(Array.from(bySlug.values()));
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 1023) {
      this.closeMobileMenu();
    }
  }

  toggleMobileMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleTeamsMenu(): void {
    this.isTeamsOpen = !this.isTeamsOpen;
  }

  toggleAboutMenu(): void {
    this.isAboutOpen = !this.isAboutOpen;
  }

  closeMobileMenu(): void {
    this.isMenuOpen = false;
    this.isTeamsOpen = false;
    this.isAboutOpen = false;
  }

  blurActiveElement(): void {
    const active = document.activeElement;
    if (active instanceof HTMLElement) {
      active.blur();
    }
  }

  private sortTeams(items: TeamMenuItem[]): TeamMenuItem[] {
    const groupRank = (team: TeamMenuItem): number => {
      if (team.gender === 'f') return 0;
      if (team.gender === 'm') return 1;
      return 2;
    };

    return [...items].sort((a, b) => {
      const groupDiff = groupRank(a) - groupRank(b);
      if (groupDiff !== 0) return groupDiff;
      return a.name.localeCompare(b.name, 'de-CH');
    });
  }
}
