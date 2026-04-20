import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header>
      <a routerLink="/">
        <img src="/assets/img/LogoVBC.png" alt="VBC Ebikon Logo" class="header-logo" />
      </a>
      <nav class="header-nav">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
        <div class="dropdown">
          <a href="#">Teams</a>
          <div class="dropdown-content">
            <a routerLink="/teams/damen-1">Damen 1</a>
            <a routerLink="/teams/damen-2">Damen 2</a>
            <a routerLink="/teams/dj1">Juniorinnen 1</a>
            <a routerLink="/teams/dj2">Juniorinnen 2</a>
            <a routerLink="/teams/dj3">Juniorinnen 3</a>
            <a routerLink="/teams/herren-1">Herren 1</a>
            <a routerLink="/teams/herren-2">Herren 2</a>
          </div>
        </div>
        <a routerLink="/sponsoren" routerLinkActive="active">Sponsoren</a>
        <div class="dropdown">
          <a href="#">Über uns</a>
          <div class="dropdown-content">
            <a routerLink="/ueber-uns/jahresprogramm">Jahresprogramm</a>
            <a routerLink="/ueber-uns/vorstand">Vorstand</a>
            <a routerLink="/ueber-uns/beach">Beachfeld</a>
            <a routerLink="/ueber-uns/hallen">Hallen</a>
            <a routerLink="/ueber-uns/dokumente">Dokumente</a>
          </div>
        </div>
        <a routerLink="/volleyballlager" routerLinkActive="active">Volleyballlager</a>
        <a routerLink="/kontakt" routerLinkActive="active">Kontakt</a>
      </nav>
    </header>
  `,
})
export class HeaderComponent {}
