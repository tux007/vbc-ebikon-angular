import { Component, OnInit, inject } from '@angular/core';
import { SanityService } from '../../core/services/sanity.service';
import { Sponsor } from '../../core/models';
import { LgHoverGlowDirective } from '../../shared/directives/lg-hover-glow.directive';

@Component({
  selector: 'app-sponsoren',
  standalone: true,
  imports: [LgHoverGlowDirective],
  template: `
    <main>
      <div class="sponsoren-main-block">
        <div class="sponsoren-main-text lg-glass-subtle">
          <p>
            Herzlichen Dank an unsere Sponsoren, die den VBC Ebikon tatkräftig unterstützen!
            Ohne eure Hilfe wäre unser Vereinsleben nicht möglich.
          </p>
        </div>
        <div class="sponsoren-grid">
          @for (s of sponsors; track s._id) {
            @if (s.url) {
              <a
                [href]="s.url"
                target="_blank"
                rel="noopener noreferrer"
                class="sponsoren-kachel-link lg-glass lg-interactive"
                lgHoverGlow
              >
                <img
                  [src]="s.logo?.url"
                  [alt]="s.name"
                  class="sponsoren-kachel-logo"
                />
              </a>
            } @else {
              <div class="sponsoren-kachel-link lg-glass lg-interactive" lgHoverGlow aria-disabled="true">
                <img
                  [src]="s.logo?.url"
                  [alt]="s.name"
                  class="sponsoren-kachel-logo"
                />
              </div>
            }
          }
          @if (loading) {
            <div class="banner-loading" style="grid-column:span 2">
              <img src="/assets/img/volleyball-loader.png" alt="Laden…" class="banner-volleyball-spinner" />
            </div>
          }
          @if (!loading && !sponsors.length) {
            <!-- Fallback: lokale Bilder -->
            <a href="#" class="sponsoren-kachel-link lg-glass lg-interactive" lgHoverGlow>
              <img src="/assets/img/Sponsoren/sponsor1.jpg" alt="Sponsor 1" class="sponsoren-kachel-logo" />
            </a>
            <a href="#" class="sponsoren-kachel-link lg-glass lg-interactive" lgHoverGlow>
              <img src="/assets/img/Sponsoren/sponsor3.png" alt="Sponsor 3" class="sponsoren-kachel-logo" />
            </a>
            <a href="#" class="sponsoren-kachel-link lg-glass lg-interactive" lgHoverGlow>
              <img src="/assets/img/Sponsoren/sponsor4.jpg" alt="Sponsor 4" class="sponsoren-kachel-logo" />
            </a>
            <a href="#" class="sponsoren-kachel-link lg-glass lg-interactive" lgHoverGlow>
              <img src="/assets/img/Sponsoren/sponsor5.png" alt="Sponsor 5" class="sponsoren-kachel-logo" />
            </a>
            <a href="#" class="sponsoren-kachel-link lg-glass lg-interactive" lgHoverGlow>
              <img src="/assets/img/Sponsoren/sponsor6.png" alt="Sponsor 6" class="sponsoren-kachel-logo" />
            </a>
          }
        </div>
      </div>
    </main>
  `,
})
export class SponsorenComponent implements OnInit {
  private sanity = inject(SanityService);
  sponsors: Sponsor[] = [];
  loading = true;

  ngOnInit(): void {
    this.sanity.getSponsors().subscribe(s => {
      this.sponsors = s;
      this.loading = false;
    });
  }
}
