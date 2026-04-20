import { Directive, ElementRef, HostListener, inject } from '@angular/core';

@Directive({
  selector: '[lgHoverGlow]',
  standalone: true,
})
export class LgHoverGlowDirective {
  private el = inject(ElementRef<HTMLElement>);

  @HostListener('pointermove', ['$event'])
  onMove(e: PointerEvent): void {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    this.el.nativeElement.style.setProperty('--mx', `${x}%`);
    this.el.nativeElement.style.setProperty('--my', `${y}%`);
  }
}
