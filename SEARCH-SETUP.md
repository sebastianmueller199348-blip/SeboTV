# SeboTV – YouTube-Suche einrichten

Die Suche läuft jetzt über deinen eigenen Server (Supabase), nicht mehr direkt
über den Browser. Damit funktioniert sie auch dort, wo youtube.com blockiert
wird – und dein API-Key bleibt verborgen.

## 1. Key als Secret ablegen

Im Supabase-Dashboard: **Project Settings → Edge Functions → Secrets** →
neuen Eintrag anlegen:

| Name | Wert |
|---|---|
| `YT_API_KEY` | dein neuer Google-API-Key (`AIza…`) |

Alternativ per CLI:

```
supabase secrets set YT_API_KEY=<dein Key>
```

Den Key **niemals** in `sebotv.html` eintragen – die Datei kann jeder lesen.

## 2. Funktion deployen

**Weg A – über das Dashboard (ohne CLI):**

1. Supabase → **Edge Functions** → **Deploy a new function** → **Via Editor**
2. Name: `youtube-search`
3. Inhalt der Datei `youtube-search-function.ts` komplett hineinkopieren
4. **Deploy** klicken

**Weg B – mit der Supabase-CLI:**

```
supabase functions deploy youtube-search --no-verify-jwt
```

## 3. Prüfen

Ruf diese Adresse im Browser auf (Projekt-Adresse davor):

```
https://yjtnwsrrurlozithjnsm.supabase.co/functions/v1/youtube-search?q=sido
```

- Kommt `{"tracks":[…]}` → alles läuft. Du siehst Titel, Kanal, Laufzeit und
  ob das Video einbettbar ist.
- Kommt `{"error":"YT_API_KEY ist in Supabase nicht gesetzt"}` → Schritt 1 fehlt.
- Kommt `{"error":"API key not valid"}` → der Key ist falsch oder noch nicht
  aktiviert (YouTube Data API v3 im Projekt einschalten).
- Kommt `{"error":"…quotaExceeded…"}` → Tageskontingent verbraucht (100 Suchen
  pro Tag im kostenlosen Rahmen).

## 4. In SeboTV

Nichts weiter zu tun – die Suchleiste oben nimmt automatisch diesen Weg.
SeboTV neu laden (Strg + Shift + R) und nach einem Video suchen.

## Kosten und Grenzen

- Kostenlos: 10.000 Einheiten pro Tag. Eine Suche kostet 100 Einheiten,
  das Nachladen der Details 1 → **rund 100 Suchen pro Tag**.
- Reicht das nicht, kannst du im Google-Konto ein höheres Kontingent beantragen.
- Der Key ist auf „nur YouTube Data API v3" eingeschränkt – ein Leck kann damit
  nichts anderes anrichten.
