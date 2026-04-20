import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <app-header />
    <router-outlet />
    <app-footer />
    @if (easterEggOpen) {
      <iframe
        src="/easter/flower-blossom.html"
        style="position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:9999; border:none; pointer-events:none;"
      ></iframe>
    }
  `,
})
export class AppComponent {
  easterEggOpen = false;
  private openSeq = '';
  private closeSeq = '';

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    const key = e.key.toLowerCase();

    this.openSeq = (this.openSeq + key).slice(-4);
    if (this.openSeq === 'asdf') {
      this.easterEggOpen = true;
      this.openSeq = '';
    }

    this.closeSeq = (this.closeSeq + key).slice(-3);
    if (this.closeSeq === 'end') {
      this.easterEggOpen = false;
      this.closeSeq = '';
    }
  }
}
