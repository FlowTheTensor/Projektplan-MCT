/* =====================================================================
   Entwicklungsbüro JPS Embedded – Projektplan Mikrocontrollertechnik
   Fachschule Elektrotechnik · 2. Schuljahr · Schuljahr 2026/27
   ---------------------------------------------------------------------
   Alle Inhalte und Termine dieser Seite. Für ein neues Schuljahr nur
   Termine (start, ende, frei, Daten der Pakete und Meilensteine) anpassen.
   Datumsangaben im Format "JJJJ-MM-TT". Die Termine sind Planwerte.
   ===================================================================== */

// Aufgaben eines Arbeitspakets aus kurzen Texten bauen
function aufgaben(...namen) {
  return namen.map((n, i) => (typeof n === "string" ? { id: "a" + (i + 1), name: n } : { id: "a" + (i + 1), ...n }));
}

const PROJEKT = {
  fach: "mct",
  titel: "Entwicklungsbüro JPS Embedded",
  untertitel: "Mikrocontrollertechnik · Fachschule Elektrotechnik · 2. Schuljahr · Projektplan 2026/27",
  einleitung:
    "Ihr arbeitet dieses Jahr als Entwicklungsbüro. Wie in jedem echten Projekt gibt es einen Projektplan: " +
    "Teilprojekte, Arbeitspakete mit Terminen und Meilensteine, an denen der Kunde abnimmt. " +
    "Zuerst erledigt ihr gemeinsam den Probeauftrag der Stadtwerke Musterstadt, danach plant und leitest du dein eigenes Projekt. " +
    "Hak erledigte Aufgaben ab: Die Balken füllen sich, und die Projektampel zeigt, ob du im Plan liegst.",

  start: "2026-09-14",
  ende: "2027-05-09",
  pruefung: { datum: "2027-05-10", name: "Prüfungszeitraum" },

  // schulfreie Zeiten (grau im Gantt-Diagramm)
  frei: [
    { von: "2026-11-02", bis: "2026-11-06", name: "Herbstferien" },
    { von: "2026-11-18", bis: "2026-11-18", name: "Buß- und Bettag" },
    { von: "2026-12-24", bis: "2027-01-08", name: "Weihnachtsferien" },
    { von: "2027-02-08", bis: "2027-02-12", name: "Frühjahrsferien" },
    { von: "2027-03-22", bis: "2027-04-02", name: "Osterferien" },
    { von: "2027-05-06", bis: "2027-05-06", name: "Christi Himmelfahrt" }
  ],

  teilprojekte: [
    { id: "tp1", nr: "1", name: "Probeauftrag Stadtwerke", info: "Ampel für den Verkehrsübungsplatz · gemeinsam", farbe: "#c81e3a" },
    { id: "tp2", nr: "2", name: "Interne Schulungen (optional)", info: "freiwilliges Angebot · Peripherie, Sicherheit, Dokumentation", farbe: "#2c5c96", optional: true },
    { id: "tp3", nr: "3", name: "Eigenes Projekt", info: "Dein Kundenauftrag · einzeln", farbe: "#348054" }
  ],

  // ------------------------------------------------------------------
  // Arbeitspakete
  // ------------------------------------------------------------------
  pakete: [
    {
      id: "ap11", tp: "tp1", nr: "1.1", name: "Auftrag & Werkbank", kurz: "Hardware und Entwicklungsumgebung",
      start: "2026-09-15", ende: "2026-10-02",
      text: "Die Stadtwerke schicken euch einen Probeauftrag. Bevor ihr loslegt, richtet ihr eure Werkbank ein: Arduino UNO, Breadboard, LEDs und die Arduino IDE. Ihr klärt, welcher Controller für den Auftrag passt.",
      auftrag: { text: "Auf unserem Verkehrsübungsplatz üben Grundschulklassen das Radfahren und das sichere Überqueren der Straße. Dafür brauchen wir eine Fußgängerampel mit Anforderungstaster, die sich wie eine echte Ampel verhält. Bitte entwickeln Sie die Steuerung mit einem Arduino UNO und liefern Sie sie in drei Stufen." },
      material: "AB 01 Hardware-Einführung, AB 02 Programmierumgebung, Datenblatt ATmega328P",
      aufgaben: aufgaben(
        "Auftragsschreiben der Stadtwerke gelesen",
        { name: "AB 01: Mikrocontroller, Mikroprozessor und Raspberry Pi verglichen", hinweis: "Wofür eignet sich welcher?" },
        "AB 01: Pinout des Arduino UNO beschriftet",
        "AB 02: Blink-Sketch läuft (setup, loop, pinMode, digitalWrite)",
        "Vorwiderstand für eine LED berechnet"
      ),
      praxis: { text: "Für Ampeln im öffentlichen Straßenverkehr setzen die Stadtwerke zertifizierte Steuergeräte ein. Für einen Übungsplatz reicht ein günstiger Mikrocontroller, wenn er zuverlässig läuft und gut dokumentiert ist.", frage: "Warum hat ein Arduino keinen Lüfter und kein Betriebssystem, ein PC aber schon?" }
    },
    {
      id: "ap12", tp: "tp1", nr: "1.2", name: "Lieferung 1: Grundzyklus", kurz: "Zustandsdiagramm und Wiring",
      start: "2026-10-05", ende: "2026-10-16", nach: ["ap11"],
      text: "Die Ampel fährt ihren Zyklus für Autos und Fußgänger. Plane den Ablauf zuerst als Zustandsdiagramm, dann programmierst du ihn in Wiring.",
      auftrag: { punkte: [
        "Fahrzeugampel mit Rot, Gelb und Grün, Fußgängerampel mit Rot und Grün, zusammen 5 LEDs",
        "Phasenfolge der Fahrzeugampel wie im Straßenverkehr: Grün, Gelb, Rot, Rot-Gelb, Grün",
        "Grünphase für Fußgänger 5 Sekunden; Fahrzeuge und Fußgänger haben nie gleichzeitig Grün",
        "Unterlagen: Zustandsdiagramm des Ablaufs und Schaltplan (Fritzing)"
      ] },
      abgabe: "Vorführung an deinem Platz, Zustandsdiagramm und Fritzing-Plan",
      material: "AB 03 Aufgabe 1",
      aufgaben: aufgaben(
        "Ablauf als Zustandsdiagramm gezeichnet",
        "Schaltung mit 5 LEDs in Fritzing gezeichnet",
        "Phasenfolge Grün – Gelb – Rot – Rot-Gelb – Grün läuft",
        "Fußgänger-Grün 5 s, nie gleichzeitig Grün für Autos und Fußgänger",
        "Lieferung 1 vorgeführt und abgenommen"
      )
    },
    {
      id: "ap13", tp: "tp1", nr: "1.3", name: "Lieferung 2: Anforderungstaster", kurz: "Polling, Interrupt, Zustandsautomat",
      start: "2026-10-19", ende: "2026-11-20", nach: ["m1"],
      text: "Fußgänger fordern Grün per Taster an. Die Schwierigkeit sind die Sonderfälle: Was passiert, wenn jemand während Grün drückt oder fünfmal hintereinander?",
      auftrag: { punkte: [
        "Fußgänger fordern Grün per Taster an; ohne Anforderung bleibt die Fahrzeugampel auf Grün",
        "Mehrfaches Drücken oder Drücken während der Fußgänger-Grünphase darf den Ablauf nicht stören",
        "Ein Tastendruck geht nie verloren, auch nicht während eines laufenden Zyklus",
        "Unterlagen: erweitertes Zustandsdiagramm, Begründung, ob Sie den Taster per Polling oder Interrupt einlesen"
      ] },
      abgabe: "Vorführung mit allen Sonderfällen, erweitertes Zustandsdiagramm",
      material: "AB 03 Aufgabe 2, Arbeitsblatt Interrupt",
      aufgaben: aufgaben(
        "Taster mit INPUT_PULLUP eingelesen und entprellt",
        "Ohne Anforderung bleibt die Autoampel auf Grün",
        { name: "Ein Tastendruck geht nie verloren", hinweis: "Zustandsautomat mit millis() statt delay()" },
        "Mehrfaches Drücken und Drücken während Grün stören nicht",
        "Taster per Interrupt (INT0) eingelesen und mit Polling verglichen",
        "Lieferung 2 vorgeführt und abgenommen"
      ),
      praxis: { text: "Auch echte Anforderungstaster melden einen Wunsch nur an. Das Steuergerät merkt ihn sich und schaltet Grün erst, wenn es in den Ablauf passt.", frage: "Was passiert mit einem kurzen Tastendruck, während dein Programm gerade in delay() wartet?" }
    },
    {
      id: "ap14", tp: "tp1", nr: "1.4", name: "Lieferung 3: Sicheres Umschalten", kurz: "Register, Assembler, Logikanalysator",
      start: "2026-11-23", ende: "2026-12-11", nach: ["m2"],
      text: "Jetzt geht es unter die Haube: Register, Bitmasken und Assembler. Mit dem Logikanalysator siehst du, was beim Umschalten in Mikrosekunden passiert.",
      auftrag: {
        text: "Echte Steuergeräte überwachen ständig, ob unzulässige Signalkombinationen auftreten, und schalten dann ab. Unser Prüfer will deshalb wissen, ob Ihre Steuerung beim Phasenwechsel kurzzeitig falsche Zustände zeigt, etwa Gelb und Grün gleichzeitig oder alle Lampen aus.",
        punkte: [
          "Schließen Sie alle fünf Signale an denselben Port an, damit sie in einem Takt gemeinsam umschalten können",
          "Messen Sie mit dem Logikanalysator einen Phasenwechsel in drei Varianten: mit digitalWrite(), mit direktem Registerzugriff in C und mit Assembler",
          "Sagen Sie für die Assembler-Variante aus den Befehlen und dem Takt voraus, wie lange der Wechsel dauert, und vergleichen Sie das mit der Messung",
          "Zeigen Sie außerdem, wie der Taster prellt",
          "Unterlagen: Messprotokoll mit Screenshots und Empfehlung, welche Variante wir einsetzen sollen"
        ]
      },
      abgabe: "Messprotokoll mit Screenshots, Quellcode der drei Varianten",
      material: "AB 02 S. 3–4, AB 03 Aufgabe 3, Datenblatt (Register, Instruction Set), Logikanalysator",
      aufgaben: aufgaben(
        { name: "Alle 5 LEDs an PORTD angeschlossen", hinweis: "Pins 2 bis 6 = PD2 bis PD6; Pins 0 und 1 bleiben für die serielle Schnittstelle" },
        "Phasenwechsel mit Registerzugriff und Bitmaske in C",
        "Phasenwechsel in Inline-Assembler (ldi, out, sbi, cbi)",
        "Zwischenzustände bei digitalWrite() am Logikanalysator gezeigt",
        "Dauer in Assembler aus Befehlen und Takt vorhergesagt und gemessen",
        "Prellen des Tasters am Logikanalysator gezeigt",
        "Messprotokoll mit Screenshots und Empfehlung abgegeben"
      ),
      praxis: { text: "Fast alles in der Industrie wird in C programmiert. Assembler braucht man für kleine Stücke, bei denen jeder Takt zählt, zum Beispiel für LED-Streifen mit WS2812, und um zu verstehen, was der Compiler aus deinem Code macht.", frage: "Ein Takt dauert bei 16 MHz 62,5 ns. Wie lange braucht ein Befehl, der zwei Takte dauert?" }
    },

    {
      id: "ap21", tp: "tp2", nr: "2.1", name: "Peripherie-Lernstationen", kurz: "ADC, PWM, Timer, UART, I²C oder SPI",
      start: "2027-02-15", ende: "2027-03-05",
      text: "Optionale Schulung des Büros: An fünf Stationen bringst du die wichtigsten Peripheriebausteine zum Laufen und schreibst zu jedem ein kurzes Testprogramm. Den Bus (I²C oder SPI) wählst du passend zu deinem Projekt.",
      abgabe: "Testprogramme und Kurzprotokolle",
      material: "Stationskarten, Logikanalysator",
      aufgaben: aufgaben(
        { name: "ADC: Spannungsteiler oder Poti mit analogRead() gemessen", hinweis: "Wert in Volt umrechnen" },
        "PWM: LED mit analogWrite() gedimmt",
        "PWM: Frequenz und Tastgrad am Logikanalysator gemessen",
        "Timer: Register nach Datenblatt eingestellt",
        "Timer: LED blinkt per Timer-Interrupt ohne delay()",
        "UART: Daten über den Serial Monitor gesendet und empfangen",
        "UART: ein Byte am Logikanalysator dekodiert (Startbit, Datenbits, Stoppbit)",
        "I²C oder SPI: Sensor mit Bibliothek ausgelesen",
        "I²C oder SPI: Telegramm am Logikanalysator angesehen"
      )
    },
    {
      id: "ap22", tp: "tp2", nr: "2.2", name: "Sicherheit & Energie", kurz: "Watchdog und Sleep",
      start: "2027-03-08", ende: "2027-03-12",
      text: "Was passiert, wenn dein Programm hängt oder die Spannung einbricht? Und wie hält ein Gerät mit Batterie ein Jahr durch? Du probierst es an der Ampel aus und überträgst es auf dein Projekt.",
      aufgaben: aufgaben(
        "Watchdog eingesetzt: Steuerung startet nach einem Hänger neu",
        "Sicherer Zustand: Ampel blinkt bei Fehler gelb",
        "Sleep-Modus mit Aufwecken per Interrupt",
        "Stromaufnahme mit und ohne Sleep gemessen",
        "Ideen für den Abschnitt „Sicherheit und Energie“ in der eigenen Doku notiert"
      ),
      praxis: { text: "Geräte mit Batterie schlafen fast die ganze Zeit und wachen nur kurz auf, um zu messen oder zu senden. Ein Watchdog sorgt dafür, dass ein Gerät nach einem Fehler von selbst neu startet.", frage: "Wie lange hält eine Batterie mit 2000 mAh bei 20 mA und wie lange bei 0,02 mA?" }
    },
    {
      id: "ap23", tp: "tp2", nr: "2.3", name: "Doku-Workshop", kurz: "Vorlage und Testplan",
      start: "2027-03-15", ende: "2027-03-19",
      text: "Wie sieht eine gute Projektdokumentation aus? Ihr seht euch ein Beispiel an, lernt die Bewertung kennen und legt die Gliederung und den Testplan für euer Projekt an. Die Gliederung ist vorgegeben: Einführung, Hardware, Software, Testprotokoll und Fazit, Ausblick, Quellen, Anhang Quellcode.",
      aufgaben: aufgaben("Gliederung der eigenen Dokumentation nach Vorlage angelegt", "Testplan mit Soll-Werten angelegt")
    },

    {
      id: "ap31", tp: "tp3", nr: "3.1", name: "Akquise & Angebot", kurz: "Projektsteckbrief",
      start: "2026-10-12", ende: "2026-11-06",
      text: "Such dir einen eigenen Kunden und einen Auftrag, der einen Mikrocontroller braucht. In der Regel arbeitest du allein, nur in Ausnahmefällen zu zweit. Dein Angebot ist der Projektsteckbrief. Die Arbeit läuft nebenher als Hausaufgabe.",
      abgabe: "Projektsteckbrief",
      aufgaben: aufgaben(
        { name: "Kunden gefunden", hinweis: "Ausbildungsbetrieb, Schule, Modellanlage der Datenkrake oder du selbst" },
        "Projektsteckbrief: Idee, Sensoren und Aktoren, Mikrocontroller",
        "Machbarkeit und grobe Kosten geprüft",
        "Angebot (Steckbrief) abgegeben"
      ),
      praxis: { text: "Bevor ein Entwicklungsbüro einen Auftrag annimmt, prüft es, ob er machbar ist und was er kostet. Ein zu großes Versprechen ist der häufigste Grund, warum Projekte scheitern.", frage: "Was davon kannst du bis Ende April sicher schaffen, was nur vielleicht?" }
    },
    {
      id: "ap32", tp: "tp3", nr: "3.2", name: "Lastenheft & Projektplan", kurz: "Auftragsklärung mit dem Kunden",
      start: "2026-11-09", ende: "2026-12-18", nach: ["m31"],
      text: "Mit dem Kunden legst du fest, was dein Produkt können muss, soll und kann. Das Lastenheft ist euer Vertrag. Dazu planst du deine eigenen Arbeitspakete: Trag sie rechts unter „Mein Projektplan“ ein, dann erscheinen sie im Gantt-Diagramm. Die Bauteile bestellst du selbst und auf eigene Kosten, am besten vor Weihnachten.",
      abgabe: "Lastenheft mit Muss / Soll / Kann, Bauteilliste und Projektplan",
      aufgaben: aufgaben(
        "Anforderungen als Muss / Soll / Kann formuliert, messbar",
        "Bauteilliste mit Preisen erstellt",
        "Eigene Arbeitspakete bis Ende April geplant (Mein Projektplan)",
        "Lastenheft vom Kunden (Lehrkraft) freigegeben",
        "Bauteile bestellt (eigene Kosten)"
      )
    },
    {
      id: "ap33", tp: "tp3", nr: "3.3", name: "Prototyp", kurz: "Projektstart im Unterricht",
      start: "2027-01-11", ende: "2027-02-05", nach: ["m32"],
      text: "Ab Januar arbeitest du im Unterricht an deinem Projekt. Zuerst bringst du jedes Bauteil einzeln zum Laufen, dann baust du den ersten Prototyp auf dem Breadboard.",
      aufgaben: aufgaben("Projekttagebuch angelegt", "Datenblätter und Bibliotheken der Bauteile gefunden", "Erster Prototyp läuft auf dem Breadboard")
    },
    {
      id: "ap34", tp: "tp3", nr: "3.4", name: "Entwicklung", kurz: "Muss vor Soll vor Kann",
      start: "2027-02-15", ende: "2027-04-16", nach: ["ap33"],
      text: "Du setzt dein Lastenheft um. Alle zwei Wochen gibt es eine kurze Projektbesprechung am Platz. Wer hängt, kürzt rechtzeitig auf das Muss, damit Ende April ein lauffähiger Stand steht.",
      aufgaben: aufgaben(
        "Alle Muss-Anforderungen laufen",
        { name: "Mindestumfang erfüllt", hinweis: "Eingang und Ausgang, Interrupt oder Timer, eine Peripherie (ADC, PWM, UART, I²C oder SPI)" },
        "Soll-Anforderungen umgesetzt, soweit es die Zeit erlaubt",
        "Projektbesprechungen mit der Lehrkraft geführt"
      )
    },
    {
      id: "ap35", tp: "tp3", nr: "3.5", name: "Tests", kurz: "Soll gegen Ist",
      start: "2027-04-12", ende: "2027-04-23", nach: ["ap34"],
      text: "Du prüfst dein Produkt nach deinem Testplan: Was soll passieren, was passiert wirklich? Fotos und Videos sind der Nachweis für die Dokumentation.",
      aufgaben: aufgaben("Hardware-Tests mit Soll / Ist durchgeführt", "Software-Tests mit Soll / Ist durchgeführt", "Fotos oder Video als Funktionsnachweis aufgenommen")
    },
    {
      id: "ap36", tp: "tp3", nr: "3.6", name: "Dokumentation", kurz: "Übergabe vorbereiten",
      start: "2027-03-15", ende: "2027-04-30",
      text: "Die Dokumentation schreibst du für deine Kollegen im Büro: Mit ihr sollen andere Mitarbeiter dein Produkt nachbauen, verstehen, reparieren und erweitern können, auch wenn du nicht da bist. Schreib sie laufend mit, nicht erst in der letzten Woche. Die Gliederung ist vorgegeben, die Aufgaben unten folgen ihr Kapitel für Kapitel.",
      aufgaben: aufgaben(
        { name: "1 Einführung: Zielsetzung und Motivation", hinweis: "mit den Anforderungen aus dem Lastenheft (Muss / Soll / Kann)" },
        { name: "2 Hardware / Aufbau", hinweis: "Schaltplan, Bauteilliste, Fotos, begründete Wahl von Controller und Bauteilen" },
        { name: "3 Software / Programm", hinweis: "Zustandsdiagramm, PAP oder Struktogramm; Register, Polling oder Interrupt, Peripherie erklärt" },
        { name: "Sicherheit und Energie", hinweis: "als Abschnitt in Kapitel 2 oder 3" },
        { name: "4 Testprotokoll und Fazit", hinweis: "Tests mit Soll / Ist, Fazit als Soll-Ist-Vergleich zum Lastenheft" },
        "5 Ausblick für Erweiterungen",
        { name: "6 Quellen", hinweis: "auch Datenblätter und Bibliotheken" },
        { name: "Anhang: Quellcode", hinweis: "strukturiert, kommentiert, eigene Funktionen" }
      )
    },
    {
      id: "ap37", tp: "tp3", nr: "3.7", name: "Werbemittel", kurz: "Plakat, Datenblatt, Video",
      start: "2027-04-19", ende: "2027-05-04",
      text: "Für den Messestand machst du Werbung für dein Produkt: ein Plakat oder Flyer, ein Produktdatenblatt und ein kurzes Video oder einen Bildbeitrag für Social Media. Veröffentlicht wird nur über die Kanäle der Schule.",
      aufgaben: aufgaben(
        "Plakat A3 oder Flyer gestaltet",
        "Produktdatenblatt auf einer Seite: Funktion, Controller, technische Daten",
        { name: "Kurzvideo (30 bis 60 s) oder Bildbeitrag mit Text", hinweis: "Personen nur mit Einwilligung, Musik nur lizenzfrei" },
        "Beitrag von der Lehrkraft freigegeben"
      )
    }
  ],

  // ------------------------------------------------------------------
  // Meilensteine (erreicht, wenn alle Pakete unter "braucht" erledigt sind)
  // ------------------------------------------------------------------
  meilensteine: [
    { id: "m1", tp: "tp1", name: "Lieferung 1 abgenommen", datum: "2026-10-16", braucht: ["ap12"], nach: ["ap12"],
      text: "Die Stadtwerke nehmen den Grundzyklus ab.",
      kriterien: ["Phasenfolge der Fahrzeugampel korrekt", "Fußgänger-Grün 5 s, nie gleichzeitig Grün", "Zustandsdiagramm passt zum Programm", "Schaltplan vollständig, Vorwiderstände berechnet"] },
    { id: "m2", tp: "tp1", name: "Lieferung 2 abgenommen", datum: "2026-11-20", braucht: ["ap13"], nach: ["ap13"],
      text: "Die Stadtwerke nehmen den Anforderungstaster mit allen Sonderfällen ab.",
      kriterien: ["Ohne Anforderung bleibt die Fahrzeugampel auf Grün", "Tastendruck während eines Zyklus wird gespeichert und ausgeführt", "Mehrfaches Drücken und Drücken während Fußgänger-Grün stören nicht", "Polling oder Interrupt begründet"] },
    { id: "m3", tp: "tp1", name: "Probeauftrag abgenommen", datum: "2026-12-11", braucht: ["ap11", "ap12", "ap13", "ap14"], nach: ["ap14"],
      text: "Mit der dritten Lieferung ist der Probeauftrag abgeschlossen. Ab jetzt seid ihr ein festes Partnerbüro der Stadtwerke.",
      kriterien: ["Alle Signale an einem Port, Phasenwechsel in Assembler (DDRx, PORTx)", "Zwischenzustände bei digitalWrite() gemessen, bei Registerzugriff keine", "Dauer des Wechsels in Assembler vorausgesagt und gemessen", "Prellen des Tasters gezeigt, Empfehlung begründet"] },
    { id: "msa1", tp: "tp1", name: "Schulaufgabe 1", datum: "2026-12-18", termin: "Dezember", art: "nachweis", nach: ["m3"],
      text: "In der ersten Schulaufgabe zeigst du, dass du das Wissen hinter der Ampel beherrschst: Aufbau des Controllers, Wiring, Taster mit Polling und Interrupt, Register und Assembler. Die Schulaufgabe ist im Dezember, den genauen Termin sagt dir deine Lehrkraft. Im Diagramm steht sie deshalb nur grob vor den Weihnachtsferien." },
    { id: "m31", tp: "tp3", name: "Angebot abgegeben", datum: "2026-11-06", braucht: ["ap31"], nach: ["ap31"],
      text: "Dein Projektsteckbrief liegt beim Kunden. Er entscheidet, ob er den Auftrag freigibt." },
    { id: "m32", tp: "tp3", name: "Lastenheft freigegeben", datum: "2026-12-18", braucht: ["ap32"], nach: ["ap32"],
      text: "Der Kunde hat dein Lastenheft und deinen Projektplan freigegeben. Die Bauteile sind bestellt." },
    { id: "m33", tp: "tp3", name: "Design-Review", datum: "2027-02-26", art: "nachweis", braucht: ["ap33"], nach: ["ap33"],
      text: "Du stellst deinem Kunden den Zwischenstand vor: etwa 10 Minuten mit Live-Demo, danach 5 Minuten Fachgespräch. Bewertet wird der ehrlich dargestellte Stand. Die Reviews laufen von Ende Februar bis Anfang März, deinen Termin bekommst du von deiner Lehrkraft. Das Review ist die mündliche Note.",
      kriterienTitel: "So wird bewertet (je 0 bis 3 Punkte)",
      kriterien: ["Projektziel und Anforderungen (Muss / Soll / Kann) klar dargestellt", "Stand gegenüber dem Projektplan nachvollziehbar und ehrlich", "Live-Demo eines lauffähigen Teilstands", "Schaltung und Programmablauf fachlich korrekt erklärt", "Probleme benannt, nächste Schritte begründet", "Fachgespräch: Fragen zu Controller, Peripherie und Code sicher beantwortet"] },
    { id: "mexk", tp: "tp3", name: "Messe-Exkursion (optional)", datum: "2027-03-17", art: "optional",
      text: "Wenn es klappt, besucht ihr die embedded world in Nürnberg (16. bis 18. März 2027), die große Fachmesse für Embedded-Systeme. Dort seht ihr, wie Firmen ihre Produkte am Stand präsentieren." },
    { id: "m34", tp: "tp3", name: "Übergabe der Dokumentation", datum: "2027-04-30", art: "nachweis", braucht: ["ap34", "ap35", "ap36"], nach: ["ap35", "ap36"],
      text: "Ende April übergibst du die Projektdokumentation ans Büro, dein Projekt ist so weit fertig, wie es geht. Mit der Dokumentation sollen Kollegen dein Produkt nachbauen, verstehen, reparieren und erweitern können. Die Dokumentation wird als Schulaufgabe 2 bewertet.",
      kriterienTitel: "So wird bewertet (40 Punkte)",
      kriterien: ["Form: Gliederung wie vorgegeben, Seitenzahlen, Abbildungen beschriftet, Sprache (3)", "1 Einführung: Zielsetzung, Motivation, Anforderungen Muss / Soll / Kann (4)", "2 Hardware / Aufbau: Schaltplan, Bauteilliste, Fotos, begründete Bauteilwahl (6)", "3 Software: Programmentwurf passend zum Code (6)", "3 Software: Controller-Funktion erklärt – Register, Polling oder Interrupt, Peripherie (6)", "Sicherheit und Energie, in Kapitel 2 oder 3 (4)", "4 Testprotokoll und Fazit: Soll / Ist, Funktionsnachweis, Soll-Ist-Vergleich (5)", "5 Ausblick für Erweiterungen (2)", "6 Quellen, mit Datenblättern und Bibliotheken (1)", "Anhang: Quellcode strukturiert, kommentiert, eigene Funktionen (3)"] },
    { id: "m35", tp: "tp3", name: "Messestand JPS Embedded", datum: "2027-05-05", braucht: ["ap37"], nach: ["ap37", "m34"], bild: "assets/messestand.svg",
      text: "Zum Abschluss präsentiert das Büro seine Produkte an einer kleinen Messe. Jeder hat einen eigenen Stand mit seinem Projekt, Plakat oder Flyer und Datenblatt, das Video läuft daneben. Besucher sind zum Beispiel die Klassen des 1. Schuljahres. Der Messestand wird nicht benotet." }
  ],

  // Reihenfolge der Zeilen im Gantt-Diagramm und im Projektstrukturplan
  zeilen: {
    tp1: ["ap11", "ap12", "m1", "ap13", "m2", "ap14", "m3", "msa1"],
    tp2: ["ap21", "ap22", "ap23"],
    tp3: ["ap31", "m31", "ap32", "m32", "ap33", "m33", "mexk", "ap34", "ap35", "ap36", "m34", "ap37", "m35"]
  },

  // Stufen im Büro (Büroausweis)
  stufen: [
    { id: "s1", rang: "Praktikum beendet", pakete: ["ap11"] },
    { id: "s2", rang: "Junior-Entwicklung", pakete: ["ap12"] },
    { id: "s3", rang: "Entwicklung", pakete: ["ap13"] },
    { id: "s4", rang: "Senior-Entwicklung", pakete: ["ap14"] },
    { id: "s5", rang: "Projektleitung", pakete: ["ap31", "ap32", "ap33"] },
    { id: "s6", rang: "Produktentwicklung", pakete: ["ap34", "ap35", "ap36"] },
    { id: "s7", rang: "Messeaussteller", pakete: ["ap37"] }
  ]
};

if (typeof module !== "undefined") module.exports = { PROJEKT };
