import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { BoardMember, Sponsor, Team, StaticPage } from '../models';

@Injectable({ providedIn: 'root' })
export class SanityService {
  private http = inject(HttpClient);

  private query(groq: string): Observable<any> {
    const { sanityProjectId, sanityDataset, sanityApiVersion } = environment;
    if (!sanityProjectId) {
      console.warn('SanityService: sanityProjectId ist noch nicht konfiguriert.');
      return of({ result: [] });
    }
    const url = `https://${sanityProjectId}.api.sanity.io/v${sanityApiVersion}/data/query/${sanityDataset}?query=${encodeURIComponent(groq)}`;
    return this.http.get<{ result: any }>(url).pipe(
      map(res => res.result),
      catchError(err => { console.error('Sanity query failed', err); return of([]); })
    );
  }

  // Fügt _id-basierte CDN-Image-URLs hinzu
  private imageUrl(ref: string): string {
    const { sanityProjectId, sanityDataset } = environment;
    if (!ref || !sanityProjectId) return '';
    const cleaned = ref.replace('image-', '').replace(/-([a-z]+)$/, '.$1').replace(/-/g, '/');
    return `https://cdn.sanity.io/images/${sanityProjectId}/${sanityDataset}/${cleaned}`;
  }

  getBoardMembers(): Observable<BoardMember[]> {
    return this.query(`*[_type == "boardMember"] | order(order asc) {_id, name, role, order, email, photo{asset->{_ref, url}}}`).pipe(
      map((items: any[]) => items.map(m => ({
        ...m,
        photo: m.photo ? { ...m.photo, url: m.photo.asset?.url ?? this.imageUrl(m.photo.asset?._ref) } : undefined,
      })))
    );
  }

  getSponsors(): Observable<Sponsor[]> {
    return this.query(`*[_type == "sponsor" && active == true] | order(order asc) {_id, name, url, order, active, logo{asset->{_ref, url}}}`).pipe(
      map((items: any[]) => items.map(s => ({
        ...s,
        logo: s.logo ? { ...s.logo, url: s.logo.asset?.url ?? this.imageUrl(s.logo.asset?._ref) } : undefined,
      })))
    );
  }

  getTeam(slug: string): Observable<Team | null> {
    return this.query(`*[_type == "team" && slug == "${slug}"][0] {_id, name, slug, description, gender, level, photo{asset->{_ref, url}}}`).pipe(
      map((item: any) => item ? {
        ...item,
        photo: item.photo ? { ...item.photo, url: item.photo.asset?.url ?? this.imageUrl(item.photo.asset?._ref) } : undefined,
      } : null)
    );
  }

  getPage(slug: string): Observable<StaticPage | null> {
    return this.query(`*[_type == "page" && slug == "${slug}"][0] {_id, title, slug, body, documents[]{_key, title, file{asset->{url}}}}`);
  }
}
