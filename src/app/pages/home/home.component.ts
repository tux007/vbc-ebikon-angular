import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { VolleyballApiService } from '../../core/services/volleyball-api.service';
import { SanityService } from '../../core/services/sanity.service';
import { GameResult, UpcomingGame, Sponsor } from '../../core/models';
import { SponsorCarouselComponent } from '../../shared/components/sponsor-carousel/sponsor-carousel.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SponsorCarouselComponent, RouterLink],
  template: `
    <!-- Hero -->
    <div class="hero-bg">
      <div class="hero-center-content">
        <div class="hero-glass-panel lg-glass">
          <h1 class="hero-title">Volleyballclub Ebikon</h1>
          <p>
            Hallo zusammen und herzlich willkommen auf dem Internetauftritt des VBC Ebikon.<br />
            Falls du gerne mit News, Matchberichten und Bildern versorgt wirst,
            kannst du uns auch gerne auf
            <a href="https://www.instagram.com/vbc_ebikon/" target="_blank" rel="noopener" class="hover-underline">Instagram</a>
            folgen.
          </p>
          <a routerLink="/teams/damen-1" class="lg-btn lg-btn--primary" style="margin-top: 1.2rem">
            Unsere Teams entdecken
          </a>
        </div>
        <!-- <div class="hero-sub">Die aktuellen Spielergebnisse und den Spielplan findest du hier.</div> -->
      </div>
    </div>

    <!-- Nächste Spiele -->
    <h2 class="letzte-ergebnisse-title">Nächste Spiele</h2>
    <div class="banner-slider-container" style="justify-content: center">
      @if (loadingUpcoming) {
        <div class="banner-loading">
          <img src="/assets/img/volleyball-loader.png" alt="Laden…" class="banner-volleyball-spinner" />
        </div>
      } @else if (upcomingGames.length === 0) {
        <div class="banner lg-glass" style="margin-bottom:1.5rem;">
          <p style="text-align:center">Keine anstehenden Spiele gefunden.</p>
        </div>
      } @else {
        <div class="banner lg-glass" style="margin-bottom:1.5rem; min-width:min(900px,96vw); max-width:1000px; flex:none;">
          <div class="banner-score-sets" style="margin-bottom:1rem;">
            <table style="width:100%; border-collapse:collapse; table-layout:fixed;">
              <thead>
                <tr>
                  <th style="text-align:left; padding:0.2rem 0.3rem; width:18%; font-size:0.9em;">Datum/Zeit</th>
                  <th style="text-align:left; padding:0.2rem 0.3rem; width:8%;  font-size:0.9em;">Team</th>
                  <th style="text-align:left; padding:0.2rem 0.3rem; width:18%; font-size:0.9em;">Heim</th>
                  <th style="text-align:left; padding:0.2rem 0.3rem; width:18%; font-size:0.9em;">Gast</th>
                  <th style="text-align:left; padding:0.2rem 0.3rem; width:10%; font-size:0.9em;">Liga</th>
                  <th style="text-align:left; padding:0.2rem 0.3rem; width:10%; font-size:0.9em;">Ort</th>
                  <th style="text-align:left; padding:0.2rem 0.3rem; width:18%; font-size:0.9em;">Halle</th>
                </tr>
              </thead>
              <tbody>
                @for (g of upcomingGames; track g.teamName) {
                  <tr>
                    <td style="padding:0.2rem 0.3rem; font-size:0.85em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{ g.playDateTime }}</td>
                    <td style="padding:0.2rem 0.3rem; font-size:0.85em; font-weight:bold; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{ g.teamName }}</td>
                    <td style="padding:0.2rem 0.3rem; font-size:0.85em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{ g.homeTeam }}</td>
                    <td style="padding:0.2rem 0.3rem; font-size:0.85em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{ g.awayTeam }}</td>
                    <td style="padding:0.2rem 0.3rem; font-size:0.85em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{ g.league }}</td>
                    <td style="padding:0.2rem 0.3rem; font-size:0.85em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{ g.city }}</td>
                    <td style="padding:0.2rem 0.3rem; font-size:0.85em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{ g.hall }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>

    <!-- Letzte Ergebnisse -->
    <h2 class="letzte-ergebnisse-title">Letzte Ergebnisse</h2>
    <div class="banner-slider-container">
      <button class="banner-arrow" (click)="prevBanner()" [disabled]="loadingResults">&lt;</button>
      <div class="banner-slider">
        @if (loadingResults) {
          <div class="banner-loading">
            <img src="/assets/img/volleyball-loader.png" alt="Laden…" class="banner-volleyball-spinner" />
          </div>
        }
        @for (b of visibleBanners; track b.teamName) {
          <div class="banner lg-glass lg-interactive">
            <div class="banner-header">
              <div class="banner-date">{{ b.playDateTime }}</div>
              <div class="banner-location">{{ b.city }}</div>
            </div>
            <div class="banner-score-row">
              <div class="banner-score-main">
                <span [class.bold]="b.wonSetsHome > b.wonSetsAway">{{ b.wonSetsHome }}</span>
                <span>:</span>
                <span [class.bold]="b.wonSetsAway > b.wonSetsHome">{{ b.wonSetsAway }}</span>
              </div>
              <div class="banner-score-sets">
                @for (s of b.setResults; track $index) {
                  <div>{{ s.home }}:{{ s.away }}</div>
                }
              </div>
            </div>
            <div class="banner-teams-row">
              <div class="banner-team home">
                @if (b.homeLogo) { <img class="banner-team-logo" [src]="b.homeLogo" alt="" /> }
                {{ b.homeTeam }}
              </div>
              <div class="banner-team away">
                @if (b.awayLogo) { <img class="banner-team-logo" [src]="b.awayLogo" alt="" /> }
                {{ b.awayTeam }}
              </div>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <div class="banner-league">{{ b.league }}</div>
              <div class="banner-teamname">{{ b.teamName }}</div>
            </div>
          </div>
        }
      </div>
      <button class="banner-arrow" (click)="nextBanner()" [disabled]="loadingResults">&gt;</button>
    </div>

    <!-- Sponsoren Carousel -->
    <app-sponsor-carousel [sponsors]="sponsors" />
  `,
})
export class HomeComponent implements OnInit {
  private volleyballApi = inject(VolleyballApiService);
  private sanity = inject(SanityService);

  results: GameResult[] = [];
  upcomingGames: UpcomingGame[] = [];
  sponsors: Sponsor[] = [];
  loadingResults = true;
  loadingUpcoming = true;
  bannerStart = 0;
  readonly bannersToShow = 3;

  get visibleBanners(): GameResult[] {
    if (!this.results.length) return [];
    const len = this.results.length;
    return Array.from({ length: this.bannersToShow }, (_, i) =>
      this.results[((this.bannerStart + i) % len + len) % len]
    );
  }

  ngOnInit(): void {
    this.volleyballApi.getAllRecentResults().subscribe(r => {
      this.results = r;
      this.loadingResults = false;
    });
    this.volleyballApi.getAllUpcomingGames().subscribe(g => {
      this.upcomingGames = g;
      this.loadingUpcoming = false;
    });
    this.sanity.getSponsors().subscribe(s => (this.sponsors = s));
  }

  prevBanner(): void {
    const len = this.results.length;
    this.bannerStart = ((this.bannerStart - 1) % len + len) % len;
  }

  nextBanner(): void {
    this.bannerStart = (this.bannerStart + 1) % this.results.length;
  }
}
