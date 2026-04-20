import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SanityService } from '../../../core/services/sanity.service';
import { Team } from '../../../core/models';

type TeamMenuItem = Pick<Team, '_id' | 'name' | 'slug'> & { gender?: Team['gender'] | 'other' };

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header>
      <a routerLink="/">
        <img src="/assets/img/LogoVBC.png" alt="VBC Ebikon Logo" class="header-logo" />
      </a>
      <nav class="header-nav">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
        <div class="dropdown">
          <a href="#">Teams</a>
          <div class="dropdown-content">
            @if (femaleTeams.length) {
              <div class="dropdown-group-label">Damen / Juniorinnen</div>
              @for (team of femaleTeams; track team._id) {
                <a [routerLink]="'/teams/' + team.slug">{{ team.name }}</a>
              }
            }
            @if (maleTeams.length) {
              <div class="dropdown-group-label">Herren</div>
              @for (team of maleTeams; track team._id) {
                <a [routerLink]="'/teams/' + team.slug">{{ team.name }}</a>
              }
            }
            @if (otherTeams.length) {
              <div class="dropdown-group-label">Weitere</div>
              @for (team of otherTeams; track team._id) {
                <a [routerLink]="'/teams/' + team.slug">{{ team.name }}</a>
              }
            }
          </div>
        </div>
        <a routerLink="/sponsoren" routerLinkActive="active">Sponsoren</a>
        <div class="dropdown">
          <a href="#">Über uns</a>
          <div class="dropdown-content">
            <a routerLink="/ueber-uns/jahresprogramm">Jahresprogramm</a>
            <a routerLink="/ueber-uns/vorstand">Vorstand</a>
            <a routerLink="/ueber-uns/beach">Beachfeld</a>
            <a routerLink="/ueber-uns/hallen">Hallen</a>
            <a routerLink="/ueber-uns/dokumente">Dokumente</a>
          </div>
        </div>
        <a routerLink="/volleyballlager" routerLinkActive="active">Volleyballlager</a>
        <a routerLink="/kontakt" routerLinkActive="active">Kontakt</a>
      </nav>
    </header>
  `,
})
export class HeaderComponent implements OnInit {
  private sanity = inject(SanityService);

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
