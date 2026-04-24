import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VolleyballApiService } from '../../../core/services/volleyball-api.service';
import { SanityService } from '../../../core/services/sanity.service';
import { RankingEntry, Team } from '../../../core/models';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  template: `
    <main class="team-main">
      <h1 class="team-title">{{ team?.name || teamName }}</h1>
      @if (team?.level) { <h2>{{ team?.level }}</h2> }

      @if (team?.photo?.url) {
        <div class="team-photo-section">
          <img [src]="team!.photo!.url" [alt]="'Teamfoto ' + team!.name" class="team-photo" />
        </div>
      } @else if (localPhoto) {
        <div class="team-photo-section">
          <img [src]="localPhoto" [alt]="'Teamfoto ' + teamName" class="team-photo" />
        </div>
      }

      <div class="team-info-blocks">
        @if (team?.description) {
          <section class="team-info-section lg-glass" style="margin-bottom:2rem;">
            <p>{{ team!.description }}</p>
          </section>
        }


        @if (team?.coaches?.length) {
          <section class="team-info-section lg-glass" style="margin-bottom:2rem;">
            <h2>TrainerInnen</h2>
            <ul>
              @for (coach of team!.coaches!; track coach) {
                <li>{{ coach }}</li>
              }
            </ul>
          </section>
        }

        @if (team?.players?.length) {
          <section class="team-info-section lg-glass" style="margin-bottom:2rem;">
            <h2>SpielerInnen</h2>
            <ul>
              @for (player of team!.players!; track player) {
                <li>{{ player }}</li>
              }
            </ul>
          </section>
        }

        <!-- Rangliste (API-Tabelle und/oder Direktlink) -->
        @if (groupId || rankingLink) {
          <section class="team-ranking-section lg-glass" style="margin-bottom:2rem;">
            <button class="team-toggle-btn" type="button" (click)="toggleSection('ranking')">
              <span>{{ sectionOpen['ranking'] ? '−' : '+' }}</span> Rangliste
            </button>
            @if (sectionOpen['ranking']) {
              <div class="team-collapsible">
                @if (groupId && loadingRanking) {
                  <div class="banner-loading">
                    <img src="/assets/img/volleyball-loader.png" alt="Laden…" class="banner-volleyball-spinner" />
                  </div>
                } @else if (groupId && ranking.length) {
                  <div class="banner" style="margin-bottom:1.5rem; text-align:left; min-width:0; max-width:100%;">
                    <table style="width:100%; border-collapse:collapse; table-layout:fixed;">
                      <thead>
                        <tr style="background:#f6f7fa; border-bottom:0.5px solid #e0e3e8;">
                          <th style="text-align:left; padding:0.2rem 0.7rem; width:7%;  font-size:0.95em;">Rang</th>
                          <th style="text-align:left; padding:0.2rem 0.7rem; width:38%; font-size:0.95em;">Team</th>
                          <th style="text-align:left; padding:0.2rem 0.7rem; width:11%; font-size:0.95em;">Spiele</th>
                          <th style="text-align:left; padding:0.2rem 0.7rem; width:11%; font-size:0.95em;">Siege</th>
                          <th style="text-align:left; padding:0.2rem 0.7rem; width:11%; font-size:0.95em;">Niederlagen</th>
                          <th style="text-align:left; padding:0.2rem 0.7rem; width:11%; font-size:0.95em;">Punkte</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (row of ranking; track row.rank; let last = $last) {
                          <tr [style]="!last ? 'border-bottom:0.5px solid #e0e3e8;' : ''">
                            <td style="padding:0.2rem 0.7rem; font-size:0.92em;">{{ row.rank }}</td>
                            <td style="padding:0.2rem 0.7rem; font-size:0.92em; font-weight:bold;">{{ row.teamCaption }}</td>
                            <td style="padding:0.2rem 0.7rem; font-size:0.92em;">{{ row.games }}</td>
                            <td style="padding:0.2rem 0.7rem; font-size:0.92em;">{{ row.wins }}</td>
                            <td style="padding:0.2rem 0.7rem; font-size:0.92em;">{{ row.defeats }}</td>
                            <td style="padding:0.2rem 0.7rem; font-size:0.92em;">{{ row.points }}</td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                } @else if (groupId) {
                  <p>Keine Ranglistendaten gefunden.</p>
                }

                @if (rankingLink) {
                  <p style="margin-top:0.75rem; text-align:right;">
                    <a [href]="rankingLink" target="_blank" rel="noopener">Direktlink zur offiziellen Rangliste</a>
                  </p>
                }
              </div>
            }
          </section>
        }
      </div>
    </main>
  `,
})
export class TeamDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private volleyballApi = inject(VolleyballApiService);
  private sanity = inject(SanityService);

  team: Team | null = null;
  teamName = '';
  groupId = '';
  rankingLink = '';
  localPhoto = '';
  ranking: RankingEntry[] = [];
  loadingRanking = false;
  private lastLoadedGroupId = '';
  sectionOpen: Record<string, boolean> = { ranking: false };

  // Fallback-Photos für bestehende Teams
  private readonly localPhotos: Record<string, string> = {
    'damen-1':  '/assets/img/Teamfotos/damen1.jpg',
    'herren-1': '/assets/img/Teamfotos/herren1.jpg',
  };

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug') ?? '';
      const config = this.volleyballApi.getTeamBySlug(slug);
      this.teamName = config?.name ?? slug;
      this.groupId  = config?.groupId ?? '';
      this.rankingLink = '';
      this.localPhoto = this.localPhotos[slug] ?? '';
      this.loadRanking();

      this.sanity.getTeam(slug).subscribe(t => {
        this.team = t;
        if (t?.name) this.teamName = t.name;
        this.groupId = t?.groupId || config?.groupId || '';
        this.rankingLink = t?.rankingLink || '';
        this.loadRanking();
      });
    });
  }

  private loadRanking(): void {
    if (!this.groupId) {
      this.ranking = [];
      this.loadingRanking = false;
      this.lastLoadedGroupId = '';
      return;
    }

    if (this.groupId === this.lastLoadedGroupId && this.ranking.length > 0) {
      return;
    }

    this.lastLoadedGroupId = this.groupId;
    this.loadingRanking = true;
    this.ranking = [];
    this.volleyballApi.getRanking(this.groupId).subscribe(r => {
      this.ranking = r;
      this.loadingRanking = false;
    });
  }

  toggleSection(key: string): void {
    this.sectionOpen[key] = !this.sectionOpen[key];
  }
}
