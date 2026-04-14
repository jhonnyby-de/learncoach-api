# LearnCoach - Smart Learning Platform

Eine vollständige, authentifizierungsfreie Lernplattform mit Quiz-System, intelligenten Lernplänen und Dashboard.

## Features

### 🎮 Quiz-System
- **Interaktive Fragen**: Multiple-Choice mit Sofort-Feedback
- **Mehrere Fächer**: Mathematik, Deutsch, Englisch, Physik, Chemie, Biologie
- **Schwierigkeitsgrade**: Leicht, Mittel, Schwer, Gemischt
- **Konfigurierbar**: 3-20 Fragen pro Quiz
- **XP-Belohnung**: Punkte für richtige Antworten
- **Deutsche Noten**: Automatische Umrechnung in Schulnoten (1-6)

### 📚 Intelligente Lernpläne
- **KI-Empfehlungen**: Personalisierte Lernstrategien
- **Fächer-Auswahl**: Mehrere Fächer kombinierbar
- **Ziel-Noten**: Individuelle Zielsetzung (1,0-4,0)
- **Erfolgschance**: Prognose basierend auf Eingaben
- **Tagesplanung**: Strukturierte Stundenplanung

### 📊 Dashboard
- **Statistiken**: Level, XP, Streak, Lernzeit
- **Aktivitäts-Chart**: 7-Tage Übersicht
- **Letzte Sessions**: Schneller Zugriff auf Verlauf

### 🧠 Wissensdatenbank
- **Themen-Suche**: Filter nach Fach und Komplexität
- **24+ Themen**: Umfassende Abdeckung
- **Direkt-Quiz**: Themen direkt als Quiz starten

## Nutzung

### App starten
```bash
npm start
```

Dann öffnen: http://localhost:3000/app

### API Endpoints (ohne Authentifizierung)

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `/api/planner/generate` | POST | Lernplan erstellen |
| `/api/quiz/generate` | POST | Quiz generieren |
| `/api/quiz/submit` | POST | Quiz auswerten |
| `/api/progress/dashboard` | GET | Dashboard-Daten |
| `/api/knowledge/topics` | GET | Themen abrufen |

### Beispiel: Quiz erstellen
```javascript
const response = await fetch('/api/quiz/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topicIds: ['math_001'],
    difficulty: 'medium',
    questionCount: 5
  })
});
const data = await response.json();
```

### Beispiel: Lernplan erstellen
```javascript
const response = await fetch('/api/planner/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grade: 9,
    subjects: ['Mathematik', 'Deutsch'],
    targetNote: 2.0,
    days: 30,
    hoursPerDay: 2
  })
});
const data = await response.json();
```

## Architektur

- **Frontend**: Single-Page Application (Vanilla JS + CSS)
- **Backend**: Node.js + Express
- **Datenbank**: MongoDB (optional, funktioniert auch mit Mock-Daten)
- **Keine Authentifizierung**: Demo-User wird automatisch erstellt

## Dateien

- `public/app.html` - Hauptanwendung
- `server.js` - Server mit API-Routen
- `routes/*.js` - API-Endpunkte (auth-frei)

## Lizenz

MIT
