import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SanityService } from '../../../core/services/sanity.service';
import { Team } from '../../../core/models';

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
            @for (team of teams; track team._id) {
              <a [routerLink]="'/teams/' + team.slug">{{ team.name }}</a>
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

  teams: Pick<Team, '_id' | 'name' | 'slug'>[] = [
    { _id: 'fallback-damen-1', name: 'Damen 1', slug: 'damen-1' },
    { _id: 'fallback-damen-2', name: 'Damen 2', slug: 'damen-2' },
    { _id: 'fallback-dj1', name: 'Juniorinnen 1', slug: 'dj1' },
    { _id: 'fallback-dj2', name: 'Juniorinnen 2', slug: 'dj2' },
    { _id: 'fallback-dj3', name: 'Juniorinnen 3', slug: 'dj3' },
    { _id: 'fallback-herren-1', name: 'Herren 1', slug: 'herren-1' },
    { _id: 'fallback-herren-2', name: 'Herren 2', slug: 'herren-2' },
  ];

  ngOnInit(): void {
    this.sanity.getTeams().subscribe(teams => {
      if (teams.length > 0) {
        this.teams = teams;
      }
    });
  }
}
