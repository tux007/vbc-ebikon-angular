# VBC Ebikon Website

Website des VBC Ebikon mit Angular. Die Inhalte werden über Sanity Studio gepflegt.

## Voraussetzungen

- Node.js und npm
- Zugriff auf das GitHub-Repository
- Für Inhaltsänderungen: Zugriff auf das Sanity-Projekt

## Installation

Im Projektordner Abhängigkeiten für Angular installieren:

```bash
npm install
```

Für Sanity Studio separat installieren:

```bash
cd sanity-studio
npm install
cd ..
```

## Lokal starten

Beide Anwendungen laufen in eigenen Terminals.

**Terminal 1: Sanity Studio** (im Projektordner):

```bash
cd sanity-studio
npm run dev
```

Studio: http://localhost:3333

**Terminal 2: Angular Website** (im Projektordner):

```bash
npm start
```

Website: http://localhost:4200

Angular liest veröffentlichte Inhalte aus Sanity. Das Studio muss nicht laufen, damit die Website angezeigt wird. Für Inhaltsänderungen im Studio anmelden und Änderungen veröffentlichen, damit sie auf der Website erscheinen.

Server mit `Ctrl+C` im jeweiligen Terminal stoppen.

## Wichtige Befehle

```bash
npm test          # Angular-Tests
npm run build     # Angular-Produktionsbuild
```

## Mitarbeit

Änderungen möglichst auf einem eigenen Branch umsetzen und als Pull Request gegen `main` einreichen. Vor dem Merge Website und betroffene Inhalte prüfen. Keine Zugangsdaten, Tokens oder lokale Konfigurationsdateien mit Geheimnissen committen.
