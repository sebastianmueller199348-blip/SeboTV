# SeboTV – wie die Synchronisation jetzt arbeitet

## Das Prinzip in einem Satz
Nicht die Uhrzeiten werden abgeglichen, sondern **die Uhren selbst** – danach folgt
jeder Rechner derselben gemeinsamen Zeitrechnung. Das nennt man NTP-Prinzip.

## Warum das der Unterschied ist
Vorher hat jeder Empfänger die Ankunftszeit der Nachricht genommen und grob
mitgerechnet, wie lange sie unterwegs war. Das ist immer ungenau: eine Nachricht
kann 30 ms oder 400 ms brauchen. Jetzt wird der Versatz **gemessen**, und zwar mit
vier Zeitstempeln.

## Der Uhren-Abgleich (läuft dauerhaft im Hintergrund)

```
Anfragender            Host
     |                  |
     |--- clk (t0) ---->|   t1 = Ankunftszeit beim Host
     |                  |
     |<- clkr (t0,t1,t2)|   t2 = Absendezeit der Antwort
     |                  |
   t3 = Ankunftszeit

Versatz   = ((t1 − t0) + (t2 − t3)) / 2
Umlauf    = (t3 − t0) − (t2 − t1)
```

Der Versatz ist **unabhängig von der Leitungsgeschwindigkeit** – das ist der Trick.
Gemessen wird alle 5 Sekunden, direkt nach dem Beitritt dreimal schnell hintereinander.
Aus den letzten 12 Messungen wird ein Mittel gebildet, wobei schnelle Messungen
stärker zählen (sie sind am wenigsten verfälscht).

Im Setup-Tab steht unter **Uhren-Abgleich**: die gemessene Umlaufzeit und der
Versatz zur Host-Uhr (z. B. `+0.021 s`). Im Durchspielen lag der Messfehler
über fünf Netzlagen hinweg unter 3 Millisekunden – bei symmetrischen Leitungen
sogar bei 0. Bei stark asymmetrischen Leitungen (unterschiedlich schnelle Wege hin
und zurück) bleibt ein Rest von etwa 20–40 ms; das ist physikalisch nicht auflösbar,
entspricht aber weniger als zwei Videobildern.

## Übertragung: der Host schickt seine Uhrzeit mit
Jede Statusmeldung enthält `atHostMs` – die Host-Uhrzeit beim Absenden. Der Empfänger
rechnet sie mit dem gemessenen Versatz in seine eigene Zeit um. Damit stimmt die
Laufzeit auch dann, wenn die Beteiligten völlig unterschiedlich schnelle Leitungen
haben (Handy im Mobilfunknetz gegen Rechner am Kabel).

## Nachziehen in zwei Stufen – springen nur im Notfall

| Abweichung | Was passiert | Sichtbar? |
|---|---|---|
| unter 0,30 s | nichts (plus Rate zurück auf normal) | nein |
| 0,30 – 1,20 s | Abspielgeschwindigkeit um höchstens 4 % anpassen | **nein** – ein Sprung wäre sichtbar und hörbar, eine Rate nicht |
| über 1,20 s | ein Sprung an die richtige Stelle | ja, aber nur einmal |

Bei 0,30 s Abweichung sind das rund 7 Sekunden Ausgleich – **ohne dass jemand
etwas merkt**. Vorher wurde bei 0,6 s hart gesprungen; genau das hat geruckelt.

Die Prüfung läuft **fünfmal pro Sekunde** statt einmal. Dadurch wird nachgezogen,
bevor überhaupt eine große Abweichung entsteht.

## Start und Stop sauber

- **Play/Pause** werden als Ereignis sofort von jedem übernommen – nicht mehr
  über den Host bestätigt. Eine Zwischenstation weniger heißt: weniger Verzögerung.
- Nach einer **eigenen** Aktion greift 2–3 Sekunden keine Automatik. Sonst
  überschreibt die Korrektur den eigenen Klick.
- Der Host sendet seinen Zustand alle **2 Sekunden** statt alle 4.

## Browser-übergreifend

- **Kein `origin`-Zwang**: Die Herkunftsangabe wird nur mitgeschickt, wenn die Seite
  über `http(s)://` läuft. Bei `file://` bleibt sie weg – sonst käme Fehler 153.
- **Kein `youtube-nocookie.com`** im Player: Diese Kombination bricht die
  Schnittstelle (schwarzes Bild). Nur der Ersatz-Rahmen probiert sie als zweiten Weg.
- **Kein `sandbox`-Attribut**: Es würde Skripte und gleiche Herkunft blockieren.
- Alles läuft über die Standard-Schnittstellen des Browsers (`postMessage`),
  die Safari, Firefox und Edge gleichermaßen unterstützen.
- **Safari-Sonderfall**: Safari verlangt einen echten Klick, bevor Ton startet.
  Ist beim Start noch kein Klick erfolgt, zeigt SeboTV den Hinweis über der
  Abspielfläche, statt stumm zu bleiben.

## Was die Werte im Setup-Tab bedeuten

| Zeile | Bedeutung |
|---|---|
| Uhren-Abgleich | Umlaufzeit + Versatz zur Host-Uhr. Unter ~50 ms ist gut. |
| Wiedergabe-Abweichung | Wie weit die eigene Position gerade wegliegt. Unter 0,30 s = grün. |
| Ping (Rundruf) | Nur die einfache Verbindungsmessung. |

## Wenn es trotzdem hakt
1. Test auf **gleicher WLAN-Verbindung** (zwei Fenster auf einem Rechner) – dort
   müssen die Uhren auf 0 ms stehen. Ist das nicht so, liegt es am Messweg.
2. Bei einem Gerät im Mobilfunknetz: Der Uhren-Abgleich braucht 2–3 Messungen,
   also etwa 10 Sekunden nach dem Beitritt, bis er voll genau ist.
3. Bei Werbung im Video: Der Player puffert, und in dieser Zeit wird nicht
   eingegriffen. Nach dem Werbeblock zieht SeboTV automatisch nach (über die Rate).
