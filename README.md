# Entwicklungsbüro JPS Embedded · Projektplan Mikrocontrollertechnik

Schülerseite für das Fach Mikrocontrollertechnik (Fachschule Elektrotechnik, 2. Schuljahr) an der Jakob-Preh-Schule Bad Neustadt ([bsnes.de](https://www.bsnes.de)). Die Klasse arbeitet als Entwicklungsbüro und führt das Schuljahr wie ein echtes Projekt: mit Teilprojekten, Arbeitspaketen, Meilensteinen und einer Projektampel.

**Live:** <https://flowthetensor.github.io/Projektplan-MCT/> · verlinkt im [Dashboard Lernsituationen](https://nerdifant.de/Dashboard-Lernsituationen/)

- **Teilprojekt 1 – Probeauftrag Stadtwerke:** Ampel für den Verkehrsübungsplatz der (ausgedachten) Stadtwerke Musterstadt in drei Lieferungen, Abnahme, Schulaufgabe 1
- **Teilprojekt 2 – Interne Schulungen:** Peripherie-Lernstationen, Sicherheit & Energie, Doku-Workshop
- **Teilprojekt 3 – Eigenes Projekt:** Angebot, Lastenheft und Projektplan, Prototyp, Design-Review (mündliche Note), Entwicklung, Tests, Dokumentation, Übergabe (Schulaufgabe 2), Werbemittel, Messestand

## Ansichten

| Bereich | Inhalt |
|---|---|
| Gantt-Diagramm | Arbeitspakete als Balken über Kalenderwochen, Fortschritt als Füllung, Meilensteine als Rauten, Abhängigkeiten als Pfeile, Ferien grau, Linie „heute“ |
| Projektstrukturplan | dieselben Pakete als Baum: Gesamtprojekt → Teilprojekte → Arbeitspakete und Meilensteine |
| Detail | Auftrag der Stadtwerke, Abgabe, Material, Aufgaben zum Abhaken, Praxisbezug, Abnahme- bzw. Bewertungskriterien, Vorgänger und Nachfolger |
| Büroausweis | Name und Stufe im Büro (Praktikum bis Messeaussteller) |
| Projektampel | vergleicht Fortschritt und Plan: grün im Plan, gelb verzögert (mehr als 25 % hinter dem Soll), rot überfällig |
| Mein Projektplan | eigene Arbeitspakete mit Start, Ende und Fortschritt; erscheinen gestrichelt unter Teilprojekt 3 |

## Dateien

| Datei | Inhalt |
|---|---|
| `plan.js` | **alle Inhalte und Termine** (Schuljahr, Ferien, Pakete, Meilensteine, Stufen) – für ein neues Schuljahr nur hier die Daten anpassen |
| `buero.js` | Darstellung und Logik |
| `style.css` | Corporate Design der Schule, helles und dunkles Design |
| `assets/messestand.svg` | Bild zum Meilenstein Messestand |
| `assets/logo-jps.png` | Schullogo |

Die Seite braucht keinen Server und keine Installation. Lokal startet man sie zum Beispiel mit Live Server in VS Code.

## Speicher

Unter „Mein Projektplan“ speichern die Schüler Name, eigene Arbeitspakete und abgehakte Aufgaben als CSV-Datei (Semikolon, UTF-8, Spalten `Typ;Nr;Name;Start;Ende;Fortschritt_Prozent;Paket;Aufgabe`) und lesen sie bei Bedarf wieder ein. Der Import ersetzt den Stand im Browser nach Rückfrage; Datumsangaben dürfen auch als TT.MM.JJJJ vorliegen, falls Excel die Datei umgespeichert hat.

Haken, eigene Arbeitspakete und Name liegen im `localStorage` dieses Browsers (`buero-mct-haken`, `buero-mct-eigene`, `buero-mct-name`). Es wird nichts verschickt. Die Haken sind eine Übersicht für die Schüler, kein Nachweis. Hell/Dunkel wird unter `jps-theme` gespeichert, ohne Wahl gilt die Systemeinstellung.

## Lizenz

[![CC BY 4.0](https://img.shields.io/badge/Lizenz-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/deed.de)

**Entwicklungsbüro JPS Embedded · Projektplan Mikrocontrollertechnik** von **Christoph Rothaug, Jakob-Preh-Schule Bad Neustadt**, steht unter der Lizenz [Creative Commons Namensnennung 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/deed.de). Der vollständige Lizenztext steht in der Datei [`LICENSE`](LICENSE).

Du darfst das Material (Quellcode, Texte und Grafiken) kopieren, weitergeben und verändern, auch kommerziell. Dafür musst du

- den Urheber nennen: *Christoph Rothaug, Jakob-Preh-Schule Bad Neustadt*,
- auf die Lizenz verlinken: <https://creativecommons.org/licenses/by/4.0/deed.de>,
- angeben, ob du etwas verändert hast.

Vorschlag für die Namensnennung: *„Entwicklungsbüro JPS Embedded“ von Christoph Rothaug, Jakob-Preh-Schule Bad Neustadt, CC BY 4.0, https://github.com/FlowTheTensor/Projektplan-MCT*

**Ausgenommen** von dieser Lizenz sind:

| Bestandteil | Rechte |
|---|---|
| `assets/logo-jps.png` | Logo der Jakob-Preh-Schule – alle Rechte bei der Schule |
| Schriften Quicksand, Inter, JetBrains Mono | über Google Fonts eingebunden, SIL Open Font License 1.1 |
