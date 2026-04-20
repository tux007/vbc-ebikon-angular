import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="site-footer">
      <img src="/assets/img/LogoVBC.png" alt="VBC Ebikon Logo" class="footer-logo" />
      <div class="footer-links">
        <a routerLink="/impressum">Impressum</a>
        <a routerLink="/datenschutz">Datenschutz</a>
        <a href="#">Cookie Einstellungen</a>
      </div>
      <div class="footer-social">
        <a href="https://www.instagram.com/vbc_ebikon/" target="_blank" rel="noopener" aria-label="Instagram">
          <svg width="32" height="32" viewBox="0 0 448 512" fill="currentColor" aria-hidden="true">
            <path d="M224,202.66A53.34,53.34,0,1,0,277.34,256,53.38,53.38,0,0,0,224,202.66Zm124.71-41a54,54,0,0,0-30.35-30.35C293.19,120,224,120,224,120s-69.19,0-94.36,11.31a54,54,0,0,0-30.35,30.35C88,162.81,88,224,88,224s0,69.19,11.31,94.36a54,54,0,0,0,30.35,30.35C154.81,392,224,392,224,392s69.19,0,94.36-11.31a54,54,0,0,0,30.35-30.35C360,293.19,360,224,360,224S360,154.81,348.71,161.66ZM224,338a82,82,0,1,1,82-82A82,82,0,0,1,224,338Zm85.4-148.6a19.2,19.2,0,1,1-19.2-19.2A19.2,19.2,0,0,1,309.4,189.4Z"/>
          </svg>
        </a>
      </div>
    </footer>
  `,
})
export class FooterComponent {}
