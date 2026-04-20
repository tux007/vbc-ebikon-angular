import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SanityService } from '../../core/services/sanity.service';
import { StaticPage } from '../../core/models';

@Component({
  selector: 'app-static-page',
  standalone: true,
  template: `
    <main class="static-page-main">
      @if (loading) {
        <div class="banner-loading">
          <img src="/assets/img/volleyball-loader.png" alt="Laden…" class="banner-volleyball-spinner" />
        </div>
      } @else if (page) {
        <h1 class="static-page-title">{{ page.title }}</h1>

        @for (block of page.body ?? []; track $index) {
          @if (block._type === 'block') {
            <p class="static-page-text">{{ block.children?.[0]?.text }}</p>
          }
        }

        @if (page.documents?.length) {
          <h2 class="static-page-subtitle">Dokumente</h2>
          <ul class="static-page-doc-list">
            @for (doc of page.documents; track doc._key) {
              <li class="static-page-doc-item">
                <a [href]="doc.file.asset.url" target="_blank" rel="noopener"
                   class="static-page-doc-link">
                  {{ doc.title }}
                </a>
              </li>
            }
          </ul>
        }
      } @else {
        <h1 class="static-page-title">{{ title }}</h1>
        <p class="static-page-empty">Diese Seite wird noch aufgebaut. Bitte schau bald wieder vorbei!</p>
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
