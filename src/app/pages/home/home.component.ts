import { AfterViewInit, Component, ElementRef, OnInit, ViewChildren, QueryList, inject } from '@angular/core';
import { Router } from '@angular/router';
import { VolleyballApiService } from '../../core/services/volleyball-api.service';
import { SanityService } from '../../core/services/sanity.service';
import { GameResult, UpcomingGame, Sponsor } from '../../core/models';
import { LgRevealDirective } from '../../shared/directives/lg-reveal.directive';
import { LgHoverGlowDirective } from '../../shared/directives/lg-hover-glow.directive';

interface DisplayTeam {
  tag: string;
  name: string;
  nameItalic: string;
  league: string;
  slug: string;
  desc?: string;
  featured?: boolean;
  gridSpan: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [LgRevealDirective, LgHoverGlowDirective],
  template: `
    <main>

      <!-- === HERO === -->
      <section id="home" class="hero">
        <div class="hero-tag glass">
          <span class="dot"></span>
          <span>Saison 25 / 26 · Live</span>
        </div>

        <h1 class="hero-title">
          <span class="line"><span class="word" style="animation-delay:0.1s">Volleyballclub</span></span>
          <span class="line"><span class="word italic" style="animation-delay:0.25s">Ebikon.</span></span>
        </h1>

        <div class="hero-sub">
          <p class="hero-lead">
            Hallo zusammen und herzlich willkommen beim VBC Ebikon.
            Sieben Teams, vom Junioren-Nachwuchs bis zur 1. Liga — und ein Vereinsleben,
            das vom Matchtag bis zum Plauschabend reicht.
          </p>
          <div class="hero-cta-row">
            <button class="btn btn-primary" (click)="scrollTo('schedule')">
              Nächste Spiele
              <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M7 17L17 7M17 7H8M17 7V16" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <a href="https://www.instagram.com/vbc_ebikon/" target="_blank" rel="noopener" class="btn btn-ghost">
              Auf Instagram folgen
            </a>
          </div>
        </div>

        <!-- Floating score card -->
        @if (lastResult) {
          <div class="hero-card glass glass-strong">
            <div class="lbl">Letztes Spiel · {{ lastResult.teamName }}</div>
            <div class="score">
              <span class="hl">{{ lastResult.wonSetsHome }}</span>
              <span class="sep">:</span>
              <span>{{ lastResult.wonSetsAway }}</span>
            </div>
            <div class="teams-names">
              <span>{{ lastResult.homeTeam }}</span>
              <span>{{ lastResult.awayTeam }}</span>
            </div>
          </div>
        }

        <div class="hero-ball" aria-hidden="true"></div>

        <div class="hero-stats">
          <div class="cell">
            <div class="num">7<span class="u">teams</span></div>
            <div class="lbl">Aktive Mannschaften</div>
          </div>
          <div class="cell">
            <div class="num">245</div>
            <div class="lbl">Aktiv-Mitglieder</div>
          </div>
          <div class="cell">
            <div class="num">1974</div>
            <div class="lbl">Gegründet</div>
          </div>
          <div class="cell">
            <div class="num">1-2×<span class="u">/Woche</span></div>
            <div class="lbl">Trainings pro Team</div>
          </div>
        </div>
      </section>

      <!-- === TEAMS === -->
      <section id="teams" class="section">
        <div class="section-head" lgReveal>
          <div>
            <div class="eyebrow">01 — Unsere Teams</div>
            <h2 class="h2">Sieben Teams, <em>ein Club.</em></h2>
          </div>
          <p class="lead">Von den U-Mannschaften bis zur 1. Liga — beim VBC Ebikon findet jede:r den passenden Platz auf dem Feld.</p>
        </div>
        <div class="teams-grid">
          @for (team of displayTeams; track team.slug; let i = $index) {
            <div
              lgReveal
              [style.grid-column]="'span ' + team.gridSpan"
              [style.transition-delay]="(i * 60) + 'ms'"
            >
              <div
                class="team-card glass"
                [class.featured]="team.featured"
                lgHoverGlow
                (click)="navigateToTeam(team.slug)"
                (mousemove)="onCardMove($event)"
                (mouseleave)="onCardLeave($event)"
              >
                <div class="shine"></div>
                <div style="position:relative; z-index:2">
                  <div class="tag">{{ team.tag }}</div>
                  <div class="name">{{ team.name }} <em>{{ team.nameItalic }}</em></div>
                  @if (team.desc) { <p class="desc">{{ team.desc }}</p> }
                </div>
                <div class="meta">
                  <span style="opacity:0.5; font-size:12px; font-family:var(--font-mono)">/{{ team.slug }}</span>
                  <span class="league-badge">{{ team.league }}</span>
                </div>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- === SCHEDULE === -->
      <section id="schedule" class="section">
        <div class="section-head" lgReveal>
          <div>
            <div class="eyebrow">02 — Spielplan & Resultate · live</div>
            <h2 class="h2">Direkt aus <em>volleyball.ch</em></h2>
          </div>
          <div class="tab-group glass">
            <button class="tab-btn" [class.active]="scheduleTab === 'upcoming'" (click)="scheduleTab = 'upcoming'">Nächste Spiele</button>
            <button class="tab-btn" [class.active]="scheduleTab === 'recent'" (click)="scheduleTab = 'recent'">Letzte Ergebnisse</button>
          </div>
        </div>

        @if (loadingSchedule) {
          <div class="schedule-loading glass">
            <div class="spinner"></div>
            <span>Spiele werden geladen …</span>
          </div>
        } @else if (scheduleError) {
          <div class="schedule-error glass">
            <strong>Hinweis</strong>
            <p>{{ scheduleError }}</p>
          </div>
        } @else {
          @for (m of scheduleList; track m.teamName + m.time + m.setString; let i = $index) {
            <div class="match-card glass reveal" [style.transition-delay]="(i * 50) + 'ms'">
              <div class="match-date">
                <div class="day">{{ m.day }}</div>
                <div class="mon">{{ m.mon }}</div>
              </div>
              <div class="teams-block">
                <div class="team-line home-team" [class.winner]="scheduleTab === 'recent' && isWinHome(m)">
                  <div class="team-logo"></div>
                  <span>{{ m.homeTeam }}</span>
                  <span class="set-score">{{ scheduleTab === 'upcoming' ? '—' : m.setsHome }}</span>
                </div>
                <div class="team-line" [class.winner]="scheduleTab === 'recent' && isWinAway(m)">
                  <div class="team-logo"></div>
                  <span>{{ m.awayTeam }}</span>
                  <span class="set-score">{{ scheduleTab === 'upcoming' ? '—' : m.setsAway }}</span>
                </div>
              </div>
              <div class="match-info">
                <span class="badge">{{ m.teamName }}</span>
                <span class="match-time">{{ scheduleTab === 'upcoming' ? m.time : m.setString }}</span>
                <span>{{ m.location }}</span>
              </div>
            </div>
          }
        }
      </section>

      <!-- === NEWS (Placeholder) === -->
      <section id="news" class="section">
        <div class="section-head" lgReveal>
          <div>
            <div class="eyebrow">03 — Aus dem Club</div>
            <h2 class="h2">Was <em>bewegt</em> uns gerade.</h2>
          </div>
        </div>
        <div class="news-grid">
          @for (n of newsItems; track n.title; let i = $index) {
            <div lgReveal [style.transition-delay]="(i * 80) + 'ms'">
              <article class="news-card glass">
                <div class="thumb">{{ n.thumb }}</div>
                <div class="body">
                  <span class="cat">{{ n.cat }}</span>
                  <h3 class="title">{{ n.title }}</h3>
                  <span class="date">{{ n.date }}</span>
                </div>
              </article>
            </div>
          }
        </div>
      </section>

      <!-- === TRAINING === -->
      <section id="training" class="section">
        <div class="section-head" lgReveal>
          <div>
            <div class="eyebrow">04 — Training</div>
            <h2 class="h2">Wann wir <em>schwitzen.</em></h2>
          </div>
          <p class="lead">Probetrainings auf Anfrage.</p>
        </div>
        <div class="training-layout">
          <div class="training-schedule glass" lgReveal>
            @if (!trainingDays.length) {
              <div class="training-loading">Trainingszeiten werden geladen …</div>
            }
            @for (day of trainingDays; track day.label) {
              <div class="training-day-header">{{ day.label }}</div>
              @for (r of day.rows; track r.team + r.time) {
                <div class="training-row">
                  <div class="team">{{ r.team }}</div>
                  <div class="location">{{ r.location }}</div>
                  <div class="time">{{ r.time }}</div>
                </div>
              }
            }
          </div>
          <div class="training-halls">
            <div lgReveal>
              <div class="side-card glass" lgHoverGlow
                   (mousemove)="onCardMove($event)" (mouseleave)="onCardLeave($event)">
                <div class="shine"></div>
                <div style="position:relative; z-index:2">
                  <div class="eyebrow">Halle 1</div>
                  <h3>MZH Wydenhof</h3>
                  <p>Unsere Hauptspielstätte. Drei Felder, Tribüne für 200 Zuschauer:innen, Bistro am Spieltag.</p>
                  <div class="addr">
                    <span>Schulhausstrasse 22</span>
                    <span>6030 Ebikon</span>
                  </div>
                </div>
              </div>
            </div>
            <div lgReveal style="transition-delay:80ms">
              <div class="side-card glass" lgHoverGlow
                   (mousemove)="onCardMove($event)" (mouseleave)="onCardLeave($event)">
                <div class="shine"></div>
                <div style="position:relative; z-index:2">
                  <div class="eyebrow">Halle 2</div>
                  <h3>Feldmatt</h3>
                  <p>Unsere teilweise im Boden versenkte Halle — super Spielbelag.</p>
                  <div class="addr">
                    <span>Rankstrasse 2</span>
                    <span>6030 Ebikon</span>
                  </div>
                </div>
              </div>
            </div>
            <div lgReveal style="transition-delay:160ms">
              <div class="side-card glass" lgHoverGlow
                   (mousemove)="onCardMove($event)" (mouseleave)="onCardLeave($event)">
                <div class="shine"></div>
                <div style="position:relative; z-index:2">
                  <div class="eyebrow">Halle 3</div>
                  <h3>Schulhaus Zentral</h3>
                  <p>Klein aber fein — ideal für unsere Juniorinnen und Junioren.</p>
                  <div class="addr">
                    <span>Schulhausstrasse 2</span>
                    <span>6030 Ebikon</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- === SPONSORS === -->
      <section id="sponsors" class="section">
        <div class="section-head" lgReveal>
          <div>
            <div class="eyebrow">05 — Sponsoren & Partner</div>
            <h2 class="h2">Wer uns <em>den Rücken stärkt.</em></h2>
          </div>
          <p class="lead">Herzlichen Dank an unsere Sponsoren, die den VBC Ebikon tatkräftig unterstützen!</p>
        </div>

        <div class="sponsor-hero glass glass-strong" lgReveal>
          <div class="sponsor-hero-meta">
            <span class="badge">Hauptsponsor</span>
            <h3 class="sponsor-hero-name">Dein Logo <em>hier.</em></h3>
            <p>Logos werden im Live-Betrieb über das Sanity CMS gepflegt. Werde Hauptsponsor und erscheine hier.</p>
            <button class="btn btn-primary" (click)="scrollTo('contact')">
              Sponsor werden
              <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M7 17L17 7M17 7H8M17 7V16" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div class="sponsor-hero-logo">
            @if (mainSponsor?.logo?.url) {
              <div class="sponsor-logo-placeholder big"
                   [class.clickable]="mainSponsor?.url" (click)="openSponsorUrl(mainSponsor)">
                <img [src]="mainSponsor!.logo!.url" [alt]="mainSponsor!.name" />
              </div>
            } @else {
              <div class="sponsor-logo-placeholder big">HAUPTSPONSOR</div>
            }
          </div>
        </div>

        <div class="sponsor-grid">
          @for (s of otherSponsors; track s._id; let i = $index) {
            <div class="sponsor-card glass" lgReveal [style.transition-delay]="(i * 50) + 'ms'"
                 [class.clickable]="s.url" (click)="openSponsorUrl(s)">
              <div class="sponsor-card-tier">Sponsor</div>
              <div class="sponsor-logo-placeholder">
                @if (s.logo?.url) {
                  <img [src]="s.logo!.url" [alt]="s.name" />
                } @else {
                  {{ s.name }}
                }
              </div>
              <div class="sponsor-card-kind">Partner</div>
            </div>
          }
        </div>

        <div class="sponsor-cta" lgReveal>
          <div>
            <h3 class="sponsor-cta-title">Selbst Teil des Clubs werden?</h3>
            <p>Vom Trikot-Sponsoring bis zum Matchball — wir haben für jedes Budget ein Package.</p>
          </div>
          <button class="btn btn-primary" (click)="scrollTo('contact')">
            Sponsoring anfragen
            <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M7 17L17 7M17 7H8M17 7V16" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </section>

      <!-- === CONTACT / JOIN === -->
      <section id="contact" class="join-section">
        <div class="join-card glass glass-strong" lgReveal>
          <div class="accent-orb"></div>
          <div style="position:relative; z-index:2">
            <div class="eyebrow">06 — Mitmachen</div>
            <h2 class="h2" style="margin-top:12px">Lust auf <em>ein Probetraining?</em></h2>
            <p class="lead" style="margin-top:20px">
              Du musst keine:r Profi sein — und auch nicht aus Ebikon. Wer Lust hat zu spielen,
              ist willkommen. Melde dich, wir finden den passenden Slot.
            </p>
          </div>
          <form class="join-form" (submit)="onJoinSubmit($event)">
            <div class="field"><input type="text" placeholder="Vorname &amp; Name" required /></div>
            <div class="field"><input type="email" placeholder="E-Mail" required /></div>
            <div class="field">
              <select>
                <option value="" disabled selected>Welche Kategorie?</option>
                <option>Damen</option>
                <option>Herren</option>
                <option>Juniorinnen (U15–U19)</option>
                <option>Plausch mixed</option>
              </select>
            </div>
            <div class="field"><input type="text" placeholder="Erfahrung (optional)" /></div>
            <button type="submit" class="btn btn-primary">
              Probetraining anfragen
              <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M7 17L17 7M17 7H8M17 7V16" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </form>
        </div>
      </section>

    </main>
  `,
})
export class HomeComponent implements OnInit, AfterViewInit {
  private volleyballApi = inject(VolleyballApiService);
  private sanity = inject(SanityService);
  private router = inject(Router);

  results: GameResult[] = [];
  upcomingGames: UpcomingGame[] = [];
  sponsors: Sponsor[] = [];
  loadingSchedule = true;
  scheduleError: string | null = null;
  scheduleTab: 'upcoming' | 'recent' = 'upcoming';

  get lastResult(): GameResult | null { return this.results[0] ?? null; }
  get mainSponsor(): Sponsor | null { return this.sponsors[0] ?? null; }
  get otherSponsors(): Sponsor[] { return this.sponsors.slice(1, 9); }

  get scheduleList() {
    if (this.scheduleTab === 'upcoming') {
      return this.upcomingGames.slice(0, 6).map(g => this.mapUpcoming(g));
    }
    return this.results.slice(0, 6).map(g => this.mapResult(g));
  }

  readonly displayTeams: DisplayTeam[] = [
    { tag: 'Herren · 1. Liga', name: 'Herren', nameItalic: '1', league: '1. Liga', slug: 'herren-1', featured: true, gridSpan: 6,
      desc: 'Das Aushängeschild des VBC Ebikon. Regionalgruppe Innerschweiz, Heimspiele in der MZH Wydenhof — Spielplan und Tabelle live aus der volleyball.ch API.' },
    { tag: 'Damen · 2. Liga', name: 'Damen', nameItalic: '1', league: '2. Liga', slug: 'damen-1', gridSpan: 3 },
    { tag: 'Damen · 3. Liga', name: 'Damen', nameItalic: '2', league: '3. Liga', slug: 'damen-2', gridSpan: 3 },
    { tag: 'Herren · 3. Liga', name: 'Herren', nameItalic: '2', league: '3. Liga', slug: 'herren-2', gridSpan: 3 },
    { tag: 'Juniorinnen', name: 'DJ', nameItalic: '1', league: 'U23', slug: 'dj1', gridSpan: 3 },
    { tag: 'Juniorinnen', name: 'DJ', nameItalic: '2', league: 'U19', slug: 'dj2', gridSpan: 3 },
    { tag: 'Juniorinnen', name: 'DJ', nameItalic: '3', league: 'U17', slug: 'dj3', gridSpan: 3 },
  ];

  private readonly dayOrder = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
  trainingDays: { label: string; rows: { team: string; time: string; location: string }[] }[] = [];

  readonly newsItems = [
    { cat: 'Matchbericht', title: 'H1 dreht das Spiel gegen Luzern im fünften Satz', date: '20. April 2026', thumb: 'ACTION SHOT · HALLE' },
    { cat: 'Verein', title: 'Neuer Vorstand für die Saison 26/27 gewählt', date: '14. April 2026', thumb: 'GRUPPENFOTO' },
    { cat: 'Junior:innen', title: 'U17 qualifiziert sich für das Schweizer Finale', date: '02. April 2026', thumb: 'SIEGESJUBEL' },
  ];

  ngOnInit(): void {
    this.volleyballApi.getAllRecentResults().subscribe({
      next: r => { this.results = r; this.checkScheduleLoaded(); },
      error: () => { this.scheduleError = 'Daten konnten nicht geladen werden.'; this.loadingSchedule = false; },
    });
    this.volleyballApi.getAllUpcomingGames().subscribe({
      next: g => { this.upcomingGames = g; this.checkScheduleLoaded(); },
      error: () => { this.scheduleError = 'Daten konnten nicht geladen werden.'; this.loadingSchedule = false; },
    });
    this.sanity.getSponsors().subscribe(s => { this.sponsors = s; });
    this.sanity.getTeamsWithTraining().subscribe(teams => {
      const map = new Map<string, { team: string; time: string; location: string }[]>();
      for (const team of teams) {
        for (const t of team.trainingTimes ?? []) {
          if (!t.day || !t.time) continue;
          if (!map.has(t.day)) map.set(t.day, []);
          map.get(t.day)!.push({ team: team.name, time: t.time, location: t.location ?? '' });
        }
      }
      this.trainingDays = this.dayOrder
        .filter(d => map.has(d))
        .map(d => ({
          label: d,
          rows: map.get(d)!.sort((a, b) => a.time.localeCompare(b.time)),
        }));
    });
  }

  ngAfterViewInit(): void {
    this.initScrollReveal();
  }

  private _resultsLoaded = false;
  private _upcomingLoaded = false;
  private checkScheduleLoaded(): void {
    if (this.results.length > 0 || this._resultsLoaded) this._resultsLoaded = true;
    if (this.upcomingGames.length > 0 || this._upcomingLoaded) this._upcomingLoaded = true;
    if (this._resultsLoaded && this._upcomingLoaded) this.loadingSchedule = false;
    if (!this.loadingSchedule && this.results.length === 0 && this.upcomingGames.length === 0) {
      this.loadingSchedule = false;
    }
    setTimeout(() => { this.loadingSchedule = false; }, 8000);
  }

  private initScrollReveal(): void {
    if (typeof IntersectionObserver === 'undefined') {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  }

  onCardMove(e: MouseEvent): void {
    const card = (e.currentTarget as HTMLElement);
    const rect = card.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const rx = ((my / rect.height) - 0.5) * -8;
    const ry = ((mx / rect.width) - 0.5) * 10;
    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    card.style.setProperty('--mx', `${mx}px`);
    card.style.setProperty('--my', `${my}px`);
  }

  onCardLeave(e: MouseEvent): void {
    (e.currentTarget as HTMLElement).style.transform = '';
  }

  openSponsorUrl(sponsor: Sponsor | null): void {
    if (sponsor?.url) window.open(sponsor.url, '_blank', 'noopener,noreferrer');
  }

  navigateToTeam(slug: string): void {
    this.router.navigate(['/teams', slug]);
  }

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  isWinHome(m: any): boolean { return m.setsHome > m.setsAway; }
  isWinAway(m: any): boolean { return m.setsAway > m.setsHome; }

  onJoinSubmit(e: Event): void {
    e.preventDefault();
    window.location.href = 'mailto:info@vbc-ebikon.ch?subject=Probetraining anfragen';
  }

  private mapUpcoming(g: UpcomingGame) {
    const d = g.playDate;
    return {
      day: d.getDate().toString(),
      mon: d.toLocaleDateString('de-CH', { month: 'short' }),
      homeTeam: g.homeTeam,
      awayTeam: g.awayTeam,
      teamName: g.teamName,
      time: g.playDateTime,
      setsHome: 0, setsAway: 0, setString: '',
      location: g.city + (g.hall ? ` · ${g.hall}` : ''),
    };
  }

  private mapResult(g: GameResult) {
    const parts = g.playDateTime.split(',');
    const dateStr = parts[0]?.trim() ?? g.playDateTime;
    const dateParts = dateStr.split('.');
    return {
      day: dateParts[0] ?? '',
      mon: dateParts[1] ? this.monthName(parseInt(dateParts[1])) : '',
      homeTeam: g.homeTeam,
      awayTeam: g.awayTeam,
      teamName: g.teamName,
      time: '',
      setsHome: g.wonSetsHome,
      setsAway: g.wonSetsAway,
      setString: g.setResults.map(s => `${s.home}:${s.away}`).join(' · '),
      location: g.city,
    };
  }

  private monthName(m: number): string {
    const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
    return months[m - 1] ?? '';
  }
}
