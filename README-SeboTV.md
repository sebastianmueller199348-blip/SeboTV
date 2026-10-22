# SeboTV in 2 Minuten starten

## 1. Datei ablegen
`sebotv.html` auf einen Webspace legen, den du teilen kannst — Netlify Drop, Vercel,
GitHub Pages oder ein beliebiger Ordner auf deinem Server.
Doppelklick auf die Datei funktioniert auch, dann ist die Adresse aber `file:///…`
und andere können sie nicht öffnen.

## 2. Supabase-Tabellen anlegen (einmalig, ~1 Minute)
1. Supabase-Projekt öffnen → **SQL Editor** → **New query**
2. Inhalt von `sebotv-supabase.sql` einfügen → **Run**

## 3. anon-Key eintragen (einmalig, ~30 Sekunden)
1. Supabase → **Project Settings → API** → **anon public** / **publishable** Key kopieren
2. In SeboTV: **Setup**-Tab → *Eigener Supabase-Zugang* → URL + Key einfügen → **Speichern & neu verbinden**
3. Der Key wird nur lokal in deinem Browser gespeichert (`localStorage`).

> Der Key kann auch direkt im Quelltext bei `SUPABASE_KEY_DEFAULT` hinterlegt werden,
> dann ist Schritt 3 für deine Freunde nicht nötig.

## 4. Schauen
Raum erstellen → **Link**-Button → Link an Freunde schicken → jeder klickt ihn,
gibt seinen Namen ein und landet im selben Raum.

---

## Was synchron läuft
| Aktion | Wirkung bei allen |
|---|---|
| Play / Pause | sofort, mit Positionsübergabe |
| Spulen (Position) | sofort, mit Ankunftsverzögerungs-Ausgleich |
| Video wechseln / Playlist-Klick | Video + Startposition |
| Geschwindigkeit | gemeinsames Tempo |
| Nächstes / Vorheriges | bei allen |
| Chat | sofort + in der Datenbank |
| Playlist hinzufügen | im Raum sichtbar |

Drift-Korrektur: weicht ein Gerät mehr als 0,6 s ab, zieht es automatisch nach;
über 2 s wird hart gesprungen.

## Besonderheiten
- **Host**: wer zuerst da war, steuert. Unter *Setup → Wiedergabe-Steuerung* kann
  „Alle dürfen steuern" aktiviert werden — dann sendet jeder Intent, die Sync bleibt gleich.
- **Ohne Datenbank**: Fehlt das SQL-Schema, läuft die Live-Synchronisation trotzdem
  über den Realtime-Kanal. Nur Verlauf und späte Beitritte verlieren den Zwischenstand.
- **YouTube-Einbettung**: Videos mit deaktivierter Einbettung (Musikvideos, Filme)
  lassen sich nicht abspielen — YouTube meldet das und SeboTV zeigt den Grund an.
  Vollbild läuft über den Vollbild-Button des Browsers (F11) — YouTube-Steuerelemente
  sind ausgeblendet, damit alle dieselbe Zeitleiste sehen.
- **Tastatur**: Leertaste = Play/Pause · Shift + ← / → = 10 s spulen.
