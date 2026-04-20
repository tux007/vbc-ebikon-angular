import { Component, Input } from '@angular/core';
import { Sponsor } from '../../../core/models';

@Component({
  selector: 'app-sponsor-carousel',
  standalone: true,
  template: `
    <div class="sponsoren-banner-container">
      <div class="sponsoren-banner-track">
        <div class="sponsoren-banner-inner" aria-hidden="true">
          @for (s of sponsors; track s._id) {
            <img
              [src]="s.logo?.url || '/assets/img/Sponsoren/sponsor1.jpg'"
              [alt]="s.name"
              class="sponsoren-logo"
            />
          }
          @if (!sponsors.length) {
            <img src="/assets/img/Sponsoren/sponsor1.jpg" alt="Sponsor 1" class="sponsoren-logo" />
            <img src="/assets/img/Sponsoren/sponsor3.png" alt="Sponsor 3" class="sponsoren-logo" />
            <img src="/assets/img/Sponsoren/sponsor4.jpg" alt="Sponsor 4" class="sponsoren-logo" />
            <img src="/assets/img/Sponsoren/sponsor5.png" alt="Sponsor 5" class="sponsoren-logo" />
            <img src="/assets/img/Sponsoren/sponsor6.png" alt="Sponsor 6" class="sponsoren-logo" />
          }
        </div>
        <!-- Doubled for infinite scroll -->
        <div class="sponsoren-banner-inner">
          @for (s of sponsors; track s._id) {
            <img
              [src]="s.logo?.url || '/assets/img/Sponsoren/sponsor1.jpg'"
              [alt]="s.name"
              class="sponsoren-logo"
            />
          }
          @if (!sponsors.length) {
            <img src="/assets/img/Sponsoren/sponsor1.jpg" alt="Sponsor 1" class="sponsoren-logo" />
            <img src="/assets/img/Sponsoren/sponsor3.png" alt="Sponsor 3" class="sponsoren-logo" />
            <img src="/assets/img/Sponsoren/sponsor4.jpg" alt="Sponsor 4" class="sponsoren-logo" />
            <img src="/assets/img/Sponsoren/sponsor5.png" alt="Sponsor 5" class="sponsoren-logo" />
            <img src="/assets/img/Sponsoren/sponsor6.png" alt="Sponsor 6" class="sponsoren-logo" />
          }
        </div>
      </div>
    </div>
  `,
})
export class SponsorCarouselComponent {
  @Input() sponsors: Sponsor[] = [];
}
