# Liquid Glass — Fix-Prompts & Nice-to-haves

Nach dem Durchlauf der ersten zehn Prompts habe ich das Repo erneut angeschaut. Kurze Diagnose, dann präzise Fix-Prompts und abschließend die Nice-to-haves.

---

## Diagnose

### 🐛 Bug 1 — Dropdowns sind unsichtbar

**Ursache:** In `src/styles/_glass.css` haben alle `.lg-glass*`-Varianten **`overflow: hidden`** als Teil der Basis-Regel (Zeile 23). Im Template hat das `<header class="site-header lg-glass-overlay">` diese Klasse bekommen. Das Header-Element clippt dadurch alle absolut positionierten Kinder — insbesondere die `.dropdown-content`, die unter den Header hängen sollte. Das Menü ist nicht weg, es wird nur abgeschnitten.

Das ist kein Designfehler der Utility — für Cards ist `overflow: hidden` richtig, weil der Specular-Highlight nicht über die Kante laufen soll. Aber für Navigationen mit Dropdowns brauchen wir einen Opt-out.

### 🐛 Bug 2 — Hero-Animation (Letter-by-Letter) fehlt

**Ursache:** Prompt 5 hat die ikonische `.animate.one`-Buchstaben-Animation (mit `revolveScale`) bewusst durch einen einfachen Fade-up ersetzt. Das war meine Empfehlung — rückblickend war das zu rigoros. Diese Animation ist eine **Markensignatur** des Vereins. Wir bringen sie zurück, aber in einer Glass-kompatiblen Ausführung.

### 🧹 Hygiene — Doppelte Regeln in `_base.css` und `_hero.css`

Die Migration aus Prompt 1 hat ein paar Selektoren dupliziert: in `_base.css` stehen **zwei** `body`-Regeln, **zwei** `.site-header`-Regeln und eine alte `.hero-bg`-Regel, die mit der neuen in `_hero.css` kollidiert. Das funktioniert zufällig, weil die spätere Regel gewinnt — aber es macht das CSS unlesbar und fehleranfällig.

### ⚠️ Globaler Reduced-Motion-Block ist zu aggressiv

In `_base.css` setzt der Reduced-Motion-Block **`transition-duration: 0.01ms !important`** auf **alle** Elemente inklusive `::before` und `::after`. Das bricht den Hover-Glow (`.lg-interactive::after`), Dropdown-Transitions und Button-Feedback selbst für User, die Motion eigentlich mögen — weil manche Browser/OS-Kombinationen `prefers-reduced-motion: reduce` fälschlich melden. Wir behalten `animation-duration` kurz, aber lassen kurze Transitions (<= 320ms) durchlaufen.

### 💡 Kleinigkeit — CTA-Button im Hero auskommentiert

In `home.component.ts` ist der `<a routerLink="/teams/damen-1" class="lg-btn lg-btn--primary">`-Block auskommentiert. War Absicht? Falls ja, lassen. Falls versehentlich: Prompt 5 aktiviert ihn.

---

## Fix-Prompt 1 — Dropdowns reparieren

```
Bug: Die Dropdown-Menüs im Header (Teams, Über uns) sind nicht mehr sichtbar.
Ursache: In src/styles/_glass.css haben alle .lg-glass*-Varianten
`overflow: hidden`. Das Template hat <header class="site-header lg-glass-overlay">
— das Header-Element clippt dadurch seine absolut positionierten Dropdown-Kinder.

Führe folgende Fixes aus:

1. In src/styles/_header.css: Ganz oben (nach dem Kommentar) einen Override-Block
   einfügen, damit der Header NICHT clippt:

   .site-header.lg-glass-overlay {
     overflow: visible;
   }

   Die Specificity (0,2,0) schlägt die Utility-Regel (0,1,0) und gewinnt
   unabhängig von der Import-Reihenfolge.

2. Zusätzlich sicherstellen, dass .dropdown-content selbst NICHT geclippt wird.
   Sie hat aktuell `class="dropdown-content lg-glass-overlay"` im Template.
   Das ist ok, weil die Kinder (Links) innerhalb des eigenen Radius liegen.
   Aber zum Safety-Net: in _header.css ergänzen:

   .site-header .dropdown-content.lg-glass-overlay {
     overflow: visible;
   }

   Warum? Die Specular-Highlight-::before-Pseudo-Element geht davon aus, dass
   der Container clippt. Wir kompensieren über border-radius + clip-path falls
   die Kante unsauber wird:

   .site-header .dropdown-content.lg-glass-overlay::before {
     clip-path: inset(0 round var(--lg-radius-lg));
   }

3. Die leeren @media- und leeren Regel-Blöcke am Ende von _header.css aufräumen:

   .site-header .dropdown-content { }   ← diese leere Regel löschen
   @media (max-width: 1023px) {
     .header-nav { }                    ← leeren Block ebenfalls löschen
   }

4. Test-Pass: ng serve. Hover über "Teams" und "Über uns" — beide Dropdowns
   müssen mit sanftem Fade (dank der bestehenden opacity/transform-Transition)
   erscheinen. Klick auf einen Link muss navigieren.

5. Auch mobile Prüfen: Mobile-Menü (Hamburger) öffnet. Die Accordion-Einträge
   "Teams" und "Über uns" müssen aufklappbar sein.

Commit: "fix(header): restore dropdown visibility clipped by glass utility"
```

---

## Fix-Prompt 2 — Hero-Letter-Animation zurückbringen

```
Regression: Die ikonische Letter-by-Letter Hero-Animation (.animate.one mit
revolveScale Keyframes) war eine Markensignatur des Vereins und wurde in
Prompt 5 zu aggressiv wegoptimiert. Wir bringen sie zurück, aber in einer
Liquid-Glass-kompatiblen Form, die zusätzlich zu einer optional dezenteren
Sub-Animation passt.

1. In src/app/pages/home/home.component.ts:
   Ersetze <h1 class="hero-title">Volleyballclub Ebikon</h1> wieder durch die
   span-per-letter-Variante:

   <h1 class="hero-title animate-letters">
     <span>V</span><span>o</span><span>l</span><span>l</span><span>e</span><span>y</span><span>b</span><span>a</span><span>l</span><span>l</span><span>c</span><span>l</span><span>u</span><span>b</span>
     <span class="hero-title-space">&nbsp;</span>
     <span>E</span><span>b</span><span>i</span><span>k</span><span>o</span><span>n</span>
   </h1>

   (Klasse `animate-letters` neu. Alte Klasse `one` brauchen wir nicht mehr.)

2. In src/styles/_hero.css die bestehende .hero-title-Regel komplett ersetzen:

   .hero-title {
     font-size: clamp(2.4rem, 6vw, 4.6rem);
     font-weight: 700;
     letter-spacing: -0.015em;
     line-height: 1.05;
     margin: 0 0 1rem;
     background: linear-gradient(135deg, var(--lg-ink), var(--lg-brand-1) 55%, var(--lg-brand-2));
     -webkit-background-clip: text;
     background-clip: text;
     color: transparent;
   }

   /* Letter-by-letter reveal, Liquid-Glass-kompatibel */
   .hero-title.animate-letters span {
     display: inline-block;
     opacity: 0;
     transform: translateY(-40px) rotate(-12deg) scale(1.4);
     animation: heroLetterReveal 700ms var(--lg-ease-spring) both;
     will-change: transform, opacity;
   }

   .hero-title.animate-letters span.hero-title-space {
     width: 0.35em;
     animation: none;
     opacity: 1;
     transform: none;
   }

   /* Staggered delays: 35ms pro Buchstabe */
   .hero-title.animate-letters span:nth-child(1)  { animation-delay: 0ms; }
   .hero-title.animate-letters span:nth-child(2)  { animation-delay: 35ms; }
   .hero-title.animate-letters span:nth-child(3)  { animation-delay: 70ms; }
   .hero-title.animate-letters span:nth-child(4)  { animation-delay: 105ms; }
   .hero-title.animate-letters span:nth-child(5)  { animation-delay: 140ms; }
   .hero-title.animate-letters span:nth-child(6)  { animation-delay: 175ms; }
   .hero-title.animate-letters span:nth-child(7)  { animation-delay: 210ms; }
   .hero-title.animate-letters span:nth-child(8)  { animation-delay: 245ms; }
   .hero-title.animate-letters span:nth-child(9)  { animation-delay: 280ms; }
   .hero-title.animate-letters span:nth-child(10) { animation-delay: 315ms; }
   .hero-title.animate-letters span:nth-child(11) { animation-delay: 350ms; }
   .hero-title.animate-letters span:nth-child(12) { animation-delay: 385ms; }
   .hero-title.animate-letters span:nth-child(13) { animation-delay: 420ms; }
   .hero-title.animate-letters span:nth-child(14) { animation-delay: 455ms; }
   /* space bei :nth-child(15) ausgelassen */
   .hero-title.animate-letters span:nth-child(16) { animation-delay: 540ms; }
   .hero-title.animate-letters span:nth-child(17) { animation-delay: 575ms; }
   .hero-title.animate-letters span:nth-child(18) { animation-delay: 610ms; }
   .hero-title.animate-letters span:nth-child(19) { animation-delay: 645ms; }
   .hero-title.animate-letters span:nth-child(20) { animation-delay: 680ms; }
   .hero-title.animate-letters span:nth-child(21) { animation-delay: 715ms; }

   @keyframes heroLetterReveal {
     50% {
       opacity: 0.7;
       transform: translateY(8px) rotate(4deg) scale(0.85);
     }
     100% {
       opacity: 1;
       transform: translateY(0) rotate(0) scale(1);
     }
   }

   @media (prefers-reduced-motion: reduce) {
     .hero-title.animate-letters span {
       animation: none;
       opacity: 1;
       transform: none;
     }
   }

3. Die alte `animation: heroReveal ...` Regel und das `@keyframes heroReveal`
   aus _hero.css löschen — nicht mehr gebraucht.

4. Aus _utilities.css die alten `.animate`-Regeln (falls sie aus dem alten
   styles.css übernommen wurden) entfernen — sie werden nicht mehr verwendet.

5. Test: Reload der Homepage. Die Buchstaben müssen einzeln von oben rotierend
   einfliegen, aber in den Brand-Farben (Gradient von lg-ink nach brand-1/
   brand-2), nicht schwarz. Gesamtdauer ca. 1.4 Sekunden.

Commit: "fix(hero): restore signature letter-by-letter animation with glass palette"
```

---

## Fix-Prompt 3 — Reduced-Motion-Block entschärfen & CSS-Duplikate bereinigen

```
Bug: Der globale Reduced-Motion-Block in _base.css setzt
  transition-duration: 0.01ms !important
auf alles inklusive ::before und ::after. Das bricht den Hover-Glow auf
.lg-interactive Cards und die Dropdown-Fade-Transition, weil manche Browser
(v.a. Chrome auf bestimmten OS) `prefers-reduced-motion: reduce` fälschlich
melden oder weil der Hover-Glow seine Opacity-Transition braucht.

Zusätzlich hygiene-bedingt gibt es in _base.css doppelte Regeln.

1. In src/styles/_base.css die obere Body-Regel (Zeile 1-12) ENTFERNEN —
   die untere Body-Regel (Zeile 169-179) ist die korrekte, aktuelle Variante.

2. Die obere .site-header-Regel (Zeile 14-23) und alle weiteren Header-
   bezogenen Selektoren in _base.css (.site-header-inner, .header-brand,
   .header-logo, .header-brand-text, .header-nav, .header-nav a,
   .header-nav a:focus, .header-nav a.active, .header-menu-toggle,
   .header-menu-toggle span, .desktop-only, .mobile-only) nach
   src/styles/_header.css verschieben. Existierende Regeln dort aktualisieren,
   nicht doppeln. _base.css soll nur noch Body, Typografie, Scrollbar,
   Selection, Focus-Ring und Mesh-Background enthalten.

3. Die obere .hero-bg, .hero-bg::after, .hero-center-content, .hero-center-content h1,
   .hero-center-content p, .hero-center-content .hero-sub Regeln (Zeile 112-163)
   nach src/styles/_hero.css verschieben und mit den bestehenden Regeln dort
   mergen. Wichtig: in der gemergten .hero-bg-Regel muss position: relative
   erhalten bleiben, und width: 100vw ENTFERNEN (das verursacht horizontalen
   Scroll bei border-radius).

4. Den globalen Reduced-Motion-Block in _base.css ENTSCHÄRFEN. Ersetze:

   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
       scroll-behavior: auto !important;
     }
   }

   durch:

   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       animation-delay: 0ms !important;
     }
     html {
       scroll-behavior: auto;
     }
   }

   Begründung: Animations (dekorative Loops, Parallax, Mesh-Drift) werden
   abgeschaltet. Kurze funktionale Transitions (Hover, Focus, Dropdown-Fade,
   Button-Press) laufen weiter — das sind UI-Feedback-Signale, keine
   Motion-Dekoration. Die WCAG erlaubt diese Unterscheidung explizit.

   Seitendate: Einzelne Komponenten, die speziell reduced-motion-aware sein
   müssen (Mesh-Drift, Hero-Letter-Animation), haben dafür eigene Overrides.

5. Teste: ng serve. Mit und ohne `prefers-reduced-motion: reduce` (in DevTools
   → Rendering → Emulate CSS media feature). In beiden Modi müssen:
   - Dropdown-Fade sichtbar sein (auch bei reduced motion)
   - Hover-Glow auf Cards sichtbar sein (auch bei reduced motion)
   - Hero-Letter-Animation nur OHNE reduced motion laufen

Commit: "refactor(styles): dedupe base/header/hero rules and refine reduced-motion policy"
```

---

## Fix-Prompt 4 — CTA-Button entscheiden & Hero-Layout-Rechnung checken

```
Minor: In pages/home/home.component.ts ist der CTA-Button im Hero-Glass-Panel
auskommentiert. Entscheide aktiv: Behalten oder entfernen.

Falls BEHALTEN (empfohlen, gibt dem Hero Handlungsanweisung):

1. Die Kommentare um den <a>-Block entfernen.

2. In home.component.ts Import ergänzen:
   import { RouterLink } from '@angular/router';
   und zum imports-Array hinzufügen: imports: [RouterLink, ...]

3. Den Link-Target anpassen falls damen-1 nicht der richtige Target ist —
   vielleicht besser /ueber-uns/jahresprogramm oder eine Team-Übersicht.
   Falls keine geeignete Seite: ein einfaches "#naechste-spiele"-Anchor-Link
   mit scroll-behavior: smooth.

4. Einen style-Attribut statt Inline-Style nicht nutzen — sauber als
   CSS-Regel in _hero.css:

   .hero-cta {
     margin-top: 1.5rem;
   }

   und im Template: <a class="lg-btn lg-btn--primary hero-cta" ...>

Falls ENTFERNEN:

1. Den auskommentierten Block komplett löschen.
2. Damit ist der Fix für diese Stelle erledigt.

Zusätzlich für das Hero:

5. Das .hero-bg hat aktuell min-height: 800px. Auf Mobile ist das zu hoch.
   In _hero.css ergänzen:

   @media (max-width: 768px) {
     .hero-bg { min-height: 560px; border-radius: var(--lg-radius-lg); }
     .hero-glass-panel { padding: 1.8rem 1.2rem; }
   }

Commit: "feat(home): finalize hero CTA and mobile sizing"
```

---

## Nice-to-haves (die du dem Agenten mitgeben kannst)

Von meiner ursprünglichen Liste — jetzt als konkrete Prompts.

### NTH-1 — Inter-Font sauber einbinden

```
Aktuell nutzt die Seite 'Segoe UI' als erste Font-Family. Das wirkt auf
macOS/Linux/Android inkonsistent. Wir binden Inter via @fontsource ein.

1. npm install @fontsource/inter

2. In src/main.ts ganz oben hinzufügen:
   import '@fontsource/inter/400.css';
   import '@fontsource/inter/500.css';
   import '@fontsource/inter/600.css';
   import '@fontsource/inter/700.css';

3. In _base.css die body font-family ändern:
   body {
     font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
     -webkit-font-smoothing: antialiased;
     -moz-osx-font-smoothing: grayscale;
   }

4. Headings: Inter mit engerer letter-spacing wirkt moderner.
   Ergänze in _base.css:
   h1, h2, h3 {
     font-family: 'Inter', system-ui, sans-serif;
     letter-spacing: -0.02em;
     line-height: 1.15;
   }

Commit: "feat(typography): adopt Inter as primary typeface"
```

### NTH-2 — Glass-Loading-Skeleton statt Volleyball-Spinner

```
Aktuell zeigt die Home beim Laden der Volleyball-API einen rotierenden
Volleyball (volleyball-loader.png). Charmant, aber nicht konsistent mit
Liquid Glass. Wir ergänzen einen Glass-Shimmer-Skeleton — der Volleyball
bleibt auf Wunsch als Fallback.

1. Erstelle src/styles/_skeleton.css:

   .lg-skeleton {
     position: relative;
     overflow: hidden;
     border-radius: var(--lg-radius-md);
     background: var(--lg-surface-1);
     border: 1px solid var(--lg-border);
   }
   .lg-skeleton::after {
     content: "";
     position: absolute;
     inset: 0;
     background: linear-gradient(
       110deg,
       transparent 20%,
       rgba(255, 255, 255, 0.45) 50%,
       transparent 80%
     );
     transform: translateX(-100%);
     animation: lg-shimmer 1.6s infinite;
   }
   @keyframes lg-shimmer {
     to { transform: translateX(100%); }
   }

2. In styles.css den @import './styles/_skeleton.css'; vor _utilities.css
   hinzufügen.

3. Erstelle src/app/shared/components/glass-skeleton/glass-skeleton.component.ts:

   import { Component, Input } from '@angular/core';
   @Component({
     selector: 'app-glass-skeleton',
     standalone: true,
     template: `
       <div class="lg-skeleton" [style.height]="height" [style.width]="width"></div>
     `,
   })
   export class GlassSkeletonComponent {
     @Input() height = '120px';
     @Input() width = '100%';
   }

4. In home.component.ts zwei Skelette rendern statt dem Volleyball-Spinner
   beim loadingUpcoming und loadingResults:

   @if (loadingUpcoming) {
     <div class="upcoming-list">
       <app-glass-skeleton height="130px" />
       <app-glass-skeleton height="130px" />
       <app-glass-skeleton height="130px" />
     </div>
   } @else if (...) { ... }

   Import hinzufügen: GlassSkeletonComponent.

Commit: "feat(loading): liquid glass shimmer skeletons"
```

### NTH-3 — CSS View Transitions für Route-Wechsel

```
Angular 19 unterstützt Route-View-Transitions über die neue CSS View
Transitions API. Das gibt weiche Überblendungen zwischen Seiten.

1. In src/app/app.config.ts (oder dem main providers-Block):

   import { provideRouter, withViewTransitions } from '@angular/router';
   // ...
   providers: [
     provideRouter(routes, withViewTransitions()),
     // ... bestehende Provider
   ]

2. In src/styles/_base.css ergänzen:

   @view-transition {
     navigation: auto;
   }
   ::view-transition-old(root),
   ::view-transition-new(root) {
     animation-duration: 320ms;
     animation-timing-function: var(--lg-ease-smooth);
   }
   ::view-transition-old(root) {
     animation-name: lg-fade-out;
   }
   ::view-transition-new(root) {
     animation-name: lg-fade-in;
   }
   @keyframes lg-fade-out {
     to { opacity: 0; transform: translateY(-8px); }
   }
   @keyframes lg-fade-in {
     from { opacity: 0; transform: translateY(8px); }
   }
   @media (prefers-reduced-motion: reduce) {
     ::view-transition-old(root),
     ::view-transition-new(root) {
       animation: none;
     }
   }

3. Teste: Navigation zwischen Home und z.B. Sponsoren soll einen sanften
   Fade geben. Safari/Firefox fallen auf keine Transition zurück — das ist ok.

Commit: "feat(motion): route view transitions"
```

### NTH-4 — Scroll-driven Hero-Parallax

```
Neue CSS `animation-timeline: scroll()` erlaubt Scroll-getriebene Effekte
ohne JavaScript.

1. In _hero.css ergänzen (innerhalb der bestehenden .hero-bg-Regel oder
   als separate Regel):

   @supports (animation-timeline: scroll()) {
     .hero-bg {
       animation: lg-hero-parallax linear;
       animation-timeline: scroll();
       animation-range: 0 400px;
     }
     @keyframes lg-hero-parallax {
       to {
         background-position-y: 40%;
         filter: saturate(1.08) blur(2px);
       }
     }
   }

   Optional für das Glass-Panel:

   @supports (animation-timeline: scroll()) {
     .hero-glass-panel {
       animation: lg-panel-fade linear;
       animation-timeline: scroll();
       animation-range: 0 300px;
     }
     @keyframes lg-panel-fade {
       to {
         opacity: 0.3;
         transform: translateY(-20px) scale(0.98);
       }
     }
   }

2. Browser-Support Stand 2026: Chrome 115+, Edge 115+. Safari/Firefox
   fallen stumm zurück — @supports kümmert sich darum.

Commit: "feat(motion): scroll-driven hero parallax"
```

### NTH-5 — Dev-Route /styleguide zum Demoen der Glass-Utilities

```
Eine einfache interne Route, die alle lg-* Komponenten und Utility-Varianten
zeigt. Kein Storybook-Setup — einfach eine Angular-Route.

1. Erstelle src/app/pages/styleguide/styleguide.component.ts als
   standalone Component. Inhalt: Demo-Grid mit allen vier Glass-Surfaces
   (lg-glass, lg-glass-strong, lg-glass-subtle, lg-glass-overlay),
   allen Button-Varianten (lg-btn, lg-btn--primary, lg-btn--ghost),
   einer .lg-interactive Card zum Hover-testen, einer .lg-reveal-Section,
   Farb-Swatches der --lg-brand-* Tokens.

2. In src/app/app.routes.ts eine Route hinzufügen, die nur in development
   aktiv ist:

   import { environment } from '../environments/environment';
   // ...
   ...(environment.production ? [] : [{
     path: 'styleguide',
     loadComponent: () => import('./pages/styleguide/styleguide.component').then(m => m.StyleguideComponent),
   }]),

3. Unter /styleguide sichtbar nur in dev, in prod 404 → wird zu `''`
   umgeleitet durch den bestehenden wildcard.

Commit: "feat(dev): styleguide route for glass utilities"
```

---

## Reihenfolge für den Agenten

Empfehlung — **genau so** an den Agenten geben:

```
1. Fix-Prompt 1: Dropdowns reparieren  (CRITICAL — visueller Bug)
2. Fix-Prompt 2: Hero-Letter-Animation zurück  (Marken-Identität)
3. Fix-Prompt 3: Reduced-Motion + Duplikate  (Code-Qualität + stille Bugs)
4. Fix-Prompt 4: CTA + Mobile-Hero  (Rundung)
5. NTH-1: Inter-Font  (sofort spürbar)
6. NTH-2: Glass-Skeleton  (löst das Volleyball-PNG ab)
7. NTH-3: View Transitions  (Premium-Feeling)
8. NTH-4: Scroll-Parallax  (wow-Effekt)
9. NTH-5: Styleguide-Route  (für dich als Entwickler)
```

Nach Fix 1–4 ist die Seite wieder auf dem Stand, den wir ursprünglich anvisiert hatten. NTH-1 bis NTH-5 sind dann Extra-Meilen. Am wichtigsten ist Fix-Prompt 1 — der User (du) sollte die Dropdowns sofort wieder sehen nach dem Commit.

Viel Erfolg bei Runde zwei.
