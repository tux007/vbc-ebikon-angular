import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="site-footer">
      <div class="footer-main">
        <div class="footer-links">
          <h3>Rechtliches</h3>
          <a routerLink="/impressum">Impressum</a>
          <a routerLink="/datenschutz">Datenschutz</a>
          <a href="#">Cookie Einstellungen</a>
        </div>

        <div class="footer-social">
          <h3>Folge uns</h3>
          <a href="https://www.instagram.com/vbc_ebikon/" target="_blank" rel="noopener" aria-label="Instagram">
            <svg width="28" height="28" viewBox="0 0 448 512" fill="currentColor" aria-hidden="true">
              <path d="M224,202.66A53.34,53.34,0,1,0,277.34,256,53.38,53.38,0,0,0,224,202.66Zm124.71-41a54,54,0,0,0-30.35-30.35C293.19,120,224,120,224,120s-69.19,0-94.36,11.31a54,54,0,0,0-30.35,30.35C88,162.81,88,224,88,224s0,69.19,11.31,94.36a54,54,0,0,0,30.35,30.35C154.81,392,224,392,224,392s69.19,0,94.36-11.31a54,54,0,0,0,30.35-30.35C360,293.19,360,224,360,224S360,154.81,348.71,161.66ZM224,338a82,82,0,1,1,82-82A82,82,0,0,1,224,338Zm85.4-148.6a19.2,19.2,0,1,1-19.2-19.2A19.2,19.2,0,0,1,309.4,189.4Z"/>
            </svg>
            Instagram
          </a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© {{ currentYear }} VBC Ebikon</span>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
