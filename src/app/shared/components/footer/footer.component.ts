import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="site-footer">
      <div class="footer-brand-col">
        <div class="footer-brand">
          <span class="footer-brand-mark" aria-hidden="true">
            <svg viewBox="0 0 48 48" width="32" height="32">
              <defs>
                <radialGradient id="fbmark" cx="30%" cy="30%">
                  <stop offset="0%" stop-color="#fff" stop-opacity="0.9"/>
                  <stop offset="100%" stop-color="oklch(0.78 0.16 28)" stop-opacity="0.8"/>
                </radialGradient>
              </defs>
              <circle cx="24" cy="24" r="20" fill="url(#fbmark)"/>
              <path d="M24 4 C 14 14, 14 34, 24 44" stroke="rgba(0,0,0,0.35)" fill="none" stroke-width="1.2"/>
              <path d="M24 4 C 34 14, 34 34, 24 44" stroke="rgba(0,0,0,0.35)" fill="none" stroke-width="1.2"/>
              <path d="M4 24 C 14 14, 34 14, 44 24" stroke="rgba(0,0,0,0.35)" fill="none" stroke-width="1.2"/>
              <path d="M4 24 C 14 34, 34 34, 44 24" stroke="rgba(0,0,0,0.35)" fill="none" stroke-width="1.2"/>
            </svg>
          </span>
          VBC Ebikon
        </div>
        <div class="footer-motto">Seit 1974 am Netz. Willkommen in der Familie.</div>
      </div>

      <div class="footer-col">
        <h4>Verein</h4>
        <a routerLink="/ueber-uns/vorstand">Vorstand</a>
        <a routerLink="/ueber-uns/jahresprogramm">Jahresprogramm</a>
        <a routerLink="/ueber-uns/dokumente">Dokumente</a>
        <a routerLink="/sponsoren">Sponsoren</a>
      </div>

      <div class="footer-col">
        <h4>Sport</h4>
        <a routerLink="/teams/herren-1">Herren 1</a>
        <a routerLink="/teams/damen-1">Damen 1</a>
        <a routerLink="/ueber-uns/hallen">Hallen</a>
        <a routerLink="/volleyballlager">Volleyballlager</a>
      </div>

      <div class="footer-col">
        <h4>Kontakt</h4>
        <a href="mailto:info@vbc-ebikon.ch">info&#64;vbc-ebikon.ch</a>
        <a href="https://www.instagram.com/vbc_ebikon/" target="_blank" rel="noopener">Instagram</a>
        <a routerLink="/kontakt">Kontaktformular</a>
        <a routerLink="/impressum">Impressum</a>
      </div>

      <div class="footer-legal">
        <span>© {{ currentYear }} Volleyballclub Ebikon</span>
        <span>Swiss Volley · Region Innerschweiz</span>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
