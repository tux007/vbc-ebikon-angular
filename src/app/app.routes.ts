import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'sponsoren',
    loadComponent: () => import('./pages/sponsoren/sponsoren.component').then(m => m.SponsorenComponent),
  },
  {
    path: 'ueber-uns/vorstand',
    loadComponent: () => import('./pages/vorstand/vorstand.component').then(m => m.VorstandComponent),
  },
  {
    path: 'teams/:slug',
    loadComponent: () => import('./pages/teams/team-detail/team-detail.component').then(m => m.TeamDetailComponent),
  },
  {
    path: 'ueber-uns/hallen',
    loadComponent: () => import('./pages/ueber-uns/static-page.component').then(m => m.StaticPageComponent),
    data: { slug: 'hallen' },
  },
  {
    path: 'ueber-uns/beach',
    loadComponent: () => import('./pages/ueber-uns/static-page.component').then(m => m.StaticPageComponent),
    data: { slug: 'beach' },
  },
  {
    path: 'ueber-uns/jahresprogramm',
    loadComponent: () => import('./pages/ueber-uns/static-page.component').then(m => m.StaticPageComponent),
    data: { slug: 'jahresprogramm' },
  },
  {
    path: 'ueber-uns/dokumente',
    loadComponent: () => import('./pages/ueber-uns/static-page.component').then(m => m.StaticPageComponent),
    data: { slug: 'dokumente' },
  },
  {
    path: 'kontakt',
    loadComponent: () => import('./pages/ueber-uns/static-page.component').then(m => m.StaticPageComponent),
    data: { slug: 'kontakt' },
  },
  {
    path: 'volleyballlager',
    loadComponent: () => import('./pages/ueber-uns/static-page.component').then(m => m.StaticPageComponent),
    data: { slug: 'volleyballlager' },
  },
  {
    path: 'impressum',
    loadComponent: () => import('./pages/ueber-uns/static-page.component').then(m => m.StaticPageComponent),
    data: { slug: 'impressum' },
  },
  {
    path: 'datenschutz',
    loadComponent: () => import('./pages/ueber-uns/static-page.component').then(m => m.StaticPageComponent),
    data: { slug: 'datenschutz' },
  },
  { path: '**', redirectTo: '' },
];
