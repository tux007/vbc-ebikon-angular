import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GameResult, UpcomingGame, RankingEntry, TeamConfig } from '../models';

const TEAMS: TeamConfig[] = [
  { teamId: 1730,  gender: 'f', name: 'DJ1',     groupId: '27272', slug: 'dj1' },
  { teamId: 1731,  gender: 'f', name: 'DJ2',     groupId: '27275', slug: 'dj2' },
  { teamId: 12773, gender: 'f', name: 'DJ3',     groupId: '27276', slug: 'dj3' },
  { teamId: 4985,  gender: 'f', name: 'Damen 1', groupId: '27263', slug: 'damen-1' },
  { teamId: 2797,  gender: 'm', name: 'Herren 1',groupId: '27278', slug: 'herren-1' },
  { teamId: 128,   gender: 'f', name: 'Damen 2', groupId: '27266',      slug: 'damen-2' },
  { teamId: 1728,  gender: 'm', name: 'Herren 2',groupId: '27302', slug: 'herren-2' },
];

@Injectable({ providedIn: 'root' })
export class VolleyballApiService {
  private http = inject(HttpClient);
  private headers = new HttpHeaders({ Authorization: environment.volleyballAuthToken });
  private base = environment.volleyballApiBase;
  private clubId = environment.volleyballClubId;

  getTeams(): TeamConfig[] { return TEAMS; }

  getTeamBySlug(slug: string): TeamConfig | undefined {
    return TEAMS.find(t => t.slug === slug);
  }

  getAllRecentResults(): Observable<GameResult[]> {
    return forkJoin(TEAMS.map(team =>
      this.http.get<any[]>(
        `${this.base}/recentResults?region=SVRI&gender=${team.gender}&clubId=${this.clubId}&teamId=${team.teamId}`,
        { headers: this.headers }
      ).pipe(
        map(games => this.extractLatestResult(games, team.name)),
        catchError(() => of(null))
      )
    )).pipe(map(results => results.filter((r): r is GameResult => r !== null)));
  }

  getAllUpcomingGames(): Observable<UpcomingGame[]> {
    return forkJoin(TEAMS.map(team =>
      this.http.get<any[]>(
        `${this.base}/upcomingGames?region=SVRI&gender=${team.gender}&clubId=${this.clubId}&teamId=${team.teamId}`,
        { headers: this.headers }
      ).pipe(
        map(games => this.extractNextGame(games, team.name)),
        catchError(() => of(null))
      )
    )).pipe(
      map(results => results.filter((r): r is UpcomingGame => r !== null)),
      map(games => games.sort((a, b) => a.playDate.getTime() - b.playDate.getTime()))
    );
  }

  getRanking(groupId: string): Observable<RankingEntry[]> {
    return this.http.get<any[]>(`${this.base}/ranking/${groupId}`, { headers: this.headers }).pipe(
      map(data => data.map(row => ({
        rank: row.rank,
        teamCaption: row.teamCaption,
        games: row.games,
        wins: row.wins,
        defeats: row.defeats,
        points: row.points,
      }))),
      catchError(() => of([]))
    );
  }

  private extractLatestResult(games: any[], teamName: string): GameResult | null {
    if (!Array.isArray(games) || games.length === 0) return null;
    games.sort((a, b) => new Date(b.playDate).getTime() - new Date(a.playDate).getTime());
    const g = games[0];
    const raw: Record<string, { home: number; away: number }> = g.setResults ?? {};
    const setResults = Object.keys(raw).sort((a, b) => +a - +b).map(k => ({ home: raw[k].home, away: raw[k].away }));
    return {
      teamName,
      playDateTime: this.fmtLong(g.playDate),
      homeTeam: g.teams.home.caption,
      awayTeam: g.teams.away.caption,
      homeLogo: g.teams.home.logo,
      awayLogo: g.teams.away.logo,
      league: g.league.caption,
      city: g.hall.city,
      setResults,
      wonSetsHome: g.resultSummary.wonSetsHomeTeam,
      wonSetsAway: g.resultSummary.wonSetsAwayTeam,
    };
  }

  private extractNextGame(games: any[], teamName: string): UpcomingGame | null {
    if (!Array.isArray(games) || games.length === 0) return null;
    games.sort((a, b) => new Date(a.playDate).getTime() - new Date(b.playDate).getTime());
    const g = games[0];
    return {
      teamName,
      playDateTime: this.fmtShort(g.playDate),
      playDate: new Date(g.playDate),
      homeTeam: g.teams.home.caption,
      awayTeam: g.teams.away.caption,
      league: g.league.caption,
      city: g.hall.city,
      hall: g.hall.caption,
    };
  }

  private fmtLong(s: string): string {
    const d = new Date(s.replace(' ', 'T'));
    return d.toLocaleDateString('de-CH', { day: '2-digit', month: 'long', year: 'numeric' })
      + ', ' + d.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
  }

  private fmtShort(s: string): string {
    const d = new Date(s.replace(' ', 'T'));
    return d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })
      + ', ' + d.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
  }
}
