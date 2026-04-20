import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SanityService } from '../../core/services/sanity.service';
import { StaticPage } from '../../core/models';

@Component({
  selector: 'app-static-page',
  standalone: true,
  template: `
    <main style="max-width:900px; margin:0 auto; padding:2.5rem 1rem 3rem;">
      @if (loading) {
        <div class="banner-loading">
          <img src="/assets/img/volleyball-loader.png" alt="Laden…" class="banner-volleyball-spinner" />
        </div>
      } @else if (page) {
        <h1 style="font-size:2.3rem; font-weight:700; margin-bottom:2rem;">{{ page.title }}</h1>

        @for (block of page.body ?? []; track $index) {
          @if (block._type === 'block') {
            <p>{{ block.children?.[0]?.text }}</p>
          }
        }

        @if (page.documents?.length) {
          <h2 style="margin-top:2rem;">Dokumente</h2>
          <ul style="list-style:none; padding:0;">
            @for (doc of page.documents; track doc._key) {
              <li style="margin-bottom:0.7rem;">
                <a [href]="doc.file.asset.url" target="_blank" rel="noopener"
                   style="color:#4e54c8; text-decoration:underline;">
                  {{ doc.title }}
                </a>
              </li>
            }
          </ul>
        }
      } @else {
        <h1 style="font-size:2.3rem; margin-bottom:1rem;">{{ title }}</h1>
        <p style="color:#888;">Diese Seite wird noch aufgebaut. Bitte schau bald wieder vorbei!</p>
      }
    </main>
  `,
})
export class StaticPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private sanity = inject(SanityService);

  page: StaticPage | null = null;
  loading = true;
  title = '';

  private slugTitles: Record<string, string> = {
    hallen:        'Hallen',
    beach:         'Beachfeld',
    jahresprogramm:'Jahresprogramm',
    dokumente:     'Dokumente',
    kontakt:       'Kontakt',
    volleyballlager:'Volleyballlager',
    impressum:     'Impressum',
    datenschutz:   'Datenschutz',
  };

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      const slug = (data['slug'] as string) ?? this.route.snapshot.url.at(-1)?.path ?? '';
      this.title = this.slugTitles[slug] ?? slug;
      this.sanity.getPage(slug).subscribe(p => {
        this.page = p;
        this.loading = false;
      });
    });
  }
}
