import { AfterViewInit, Component, ElementRef, HostListener, NgZone, OnDestroy, ViewChild, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <div class="bg-canvas"></div>
    <div class="bg-blobs">
      <div class="blob b1"></div>
      <div class="blob b2"></div>
      <div class="blob b3"></div>
    </div>
    <div class="bg-noise"></div>
    <div #cursorGlow class="cursor-glow"></div>
    <div #cursorDot class="cursor-dot"></div>
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
export class AppComponent implements AfterViewInit, OnDestroy {
  @ViewChild('cursorGlow') cursorGlowRef!: ElementRef<HTMLDivElement>;
  @ViewChild('cursorDot') cursorDotRef!: ElementRef<HTMLDivElement>;

  private zone = inject(NgZone);
  private raf?: number;
  private mx = 0;
  private my = 0;
  private gx = 0;
  private gy = 0;

  easterEggOpen = false;
  private openSeq = '';
  private closeSeq = '';

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') return;
    this.gx = window.innerWidth / 2;
    this.gy = window.innerHeight / 2;
    this.mx = this.gx;
    this.my = this.gy;

    this.zone.runOutsideAngular(() => {
      const onMove = (e: MouseEvent) => {
        this.mx = e.clientX;
        this.my = e.clientY;
        const target = (e.target as HTMLElement).closest('a, button, .team-card, .match-card, .news-card');
        this.cursorGlowRef?.nativeElement.classList.toggle('is-hover', !!target);
        this.cursorDotRef?.nativeElement.style.setProperty('transform', `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`);
      };
      window.addEventListener('mousemove', onMove);

      const loop = () => {
        this.gx += (this.mx - this.gx) * 0.18;
        this.gy += (this.my - this.gy) * 0.18;
        const glow = this.cursorGlowRef?.nativeElement;
        if (glow) glow.style.transform = `translate(${this.gx}px, ${this.gy}px) translate(-50%,-50%)`;
        this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    });
  }

  ngOnDestroy(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    const key = e.key.toLowerCase();
    this.openSeq = (this.openSeq + key).slice(-4);
    if (this.openSeq === 'asdf') { this.easterEggOpen = true; this.openSeq = ''; }
    this.closeSeq = (this.closeSeq + key).slice(-3);
    if (this.closeSeq === 'end') { this.easterEggOpen = false; this.closeSeq = ''; }
  }
}
