# Ihr Bistro – Tischreservierung (Demo)

Klickbare Web-App-Demo für die Platzreservierung in einem Bistro. Gäste sehen den Grundriss mit Innenbereich und Terrasse, wählen Datum, Personenzahl und Uhrzeit, tippen auf einen freien Tisch und reservieren in zwei Schritten.

Reines HTML, CSS und JavaScript, ohne Build-Schritt und ohne Abhängigkeiten.

## Starten

`index.html` direkt im Browser öffnen, oder einen kleinen lokalen Server starten:

```bash
python3 -m http.server 8000
# dann http://localhost:8000 öffnen
```

Auf dem Smartphone läuft die App randlos. Ab Tablet-Breite erscheint sie in einem iPhone-Rahmen, auf breiten Bildschirmen mit kurzer Beschreibung daneben.

## Funktionen

- **Grundriss als SVG**: 11 Tische innen (mit Bar, Weinregal, WC, Empfang), 4 auf der Terrasse (Sonnenschirme, Kräuterbeet).
- **Status je Tisch**: verfügbar (hellgrün), belegt (grau), ausgewählt (dunkelgrün mit Haken). Tische, die nicht zur Personenzahl passen, werden ausgeblendet dargestellt.
- **Filter**: Datum (Kalender, Montag Ruhetag, 90 Tage im Voraus), Gäste (1–8), Uhrzeit (17:00–22:00 im 30-Minuten-Takt, mit Anzahl freier Tische).
- **Auswahl-Karte**: Detailansicht des Tisches, Personenzahl, Bereich und Besonderheit (z. B. „Beliebter Tisch“, „Fensterplatz“).
- **Reservierung**: Formular mit Prüfung (Name, Telefon, optional E-Mail, Anlass, Wünsche), danach Bestätigung mit Reservierungsnummer.
- **Meine Reservierungen**: Übersicht im Menü (⋯), Stornieren mit Rückfrage.
- **Favorit** (Herz) und **Demo zurücksetzen**.

Die Belegung ist erfunden, aber stabil: Derselbe Tag ergibt immer dieselben belegten Tische. Freitags und samstags ist mehr los. Eigene Reservierungen werden im `localStorage` des Browsers gespeichert und blockieren den Tisch für zwei Stunden.

## Dateien

| Datei        | Inhalt                                                        |
| ------------ | ------------------------------------------------------------- |
| `index.html` | Grundgerüst der App und des Geräterahmens                     |
| `styles.css` | Gestaltung (Farben und Schriften als CSS-Variablen in `:root`) |
| `app.js`     | Tischdaten, Grundriss, Belegung, Ablauf der Reservierung       |

## Anpassen

- **Tische**: Liste `TABLES` in `app.js`. Position (`x`, `y`), Form (`rect` mit `w`/`h` und `chairs`, oder `round` mit `r`/`seats`), Mindestpersonen (`min`) und Besonderheit (`feature`). Die Höchstzahl ergibt sich aus den Stühlen.
- **Zeiten und Regeln**: Konstanten am Anfang von `app.js` (`SLOTS`, `STAY`, `BOOK_AHEAD`, `CLOSED_DAY`, `MAX_GUESTS`).
- **Farben und Schriften**: Variablen in `:root` in `styles.css`.

Für einen echten Betrieb fehlen ein Backend für Verfügbarkeit und Buchungen sowie Bestätigungen per E-Mail oder SMS.
