import { Component, OnInit, inject } from '@angular/core';
import { SanityService } from '../../core/services/sanity.service';
import { BoardMember } from '../../core/models';

@Component({
  selector: 'app-vorstand',
  standalone: true,
  template: `
    <main>
      <h1 style="text-align:center; margin:2rem 0; margin-top:80px; font-size:48px;">Unser Vorstand</h1>

      @if (loading) {
        <div class="banner-loading">
          <img src="/assets/img/volleyball-loader.png" alt="Laden…" class="banner-volleyball-spinner" />
        </div>
      }

      <div class="gallery">
        <div class="horizontal">
          @for (m of members; track m._id) {
            <div class="vorstand-img-block"
                 (mouseenter)="hovered = m"
                 (mouseleave)="hovered = null">
              <img
                [src]="m.photo?.url || '/assets/img/Vorstand/praesi.jpg'"
                [alt]="m.name"
              />
            </div>
          }
          @if (!loading && !members.length) {
            <!-- Fallback: lokale Bilder -->
            <div class="vorstand-img-block"><img src="/assets/img/Vorstand/praesi.jpg" alt="Präsident" /></div>
            <div class="vorstand-img-block"><img src="/assets/img/Vorstand/vize.jpg" alt="Vizepräsidentin" /></div>
            <div class="vorstand-img-block"><img src="/assets/img/Vorstand/hallen.jpg" alt="Hallenwart" /></div>
            <div class="vorstand-img-block"><img src="/assets/img/Vorstand/meist.jpg" alt="Meisterschaftsleiter" /></div>
            <div class="vorstand-img-block"><img src="/assets/img/Vorstand/beach.jpg" alt="Beachvolleyball" /></div>
            <div class="vorstand-img-block"><img src="/assets/img/Vorstand/press.jpg" alt="Presse" /></div>
            <div class="vorstand-img-block"><img src="/assets/img/Vorstand/fin.jpg" alt="Finanzen" /></div>
            <div class="vorstand-img-block"><img src="/assets/img/Vorstand/admin.jpg" alt="Administration" /></div>
          }
        </div>
      </div>

      @if (hovered) {
        <div class="vorstand-hover-info-text" style="display:block;">
          <strong>{{ hovered.name }}</strong>
          {{ hovered.role }}
        </div>
      }
    </main>
  `,
})
export class VorstandComponent implements OnInit {
  private sanity = inject(SanityService);
  members: BoardMember[] = [];
  hovered: BoardMember | null = null;
  loading = true;

  ngOnInit(): void {
    this.sanity.getBoardMembers().subscribe(m => {
      this.members = m;
      this.loading = false;
    });
  }
}
