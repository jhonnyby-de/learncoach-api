// ============================================
// LEARNCOACH API - COMPLETE KNOWLEDGE DATABASE
// 2000+ Topics with Dependencies & Complexity
// ============================================

class KnowledgeDatabase {
  constructor() {
    this.topics = new Map();
    this.dependencies = new Map();
    this.learningPaths = new Map();
    this.initializeAllTopics();
  }

  // Generate unique topic ID
  static generateId(subject, grade, index) {
    return `${subject}_g${grade}_${String(index).padStart(3, '0')}`;
  }

  initializeAllTopics() {
    // Mathematics - 320 topics across grades 5-13
    this.generateMathTopics();
    // German - 280 topics
    this.generateGermanTopics();
    // English - 260 topics
    this.generateEnglishTopics();
    // Sciences - 400 topics (Physics, Chemistry, Biology)
    this.generateScienceTopics();
    // Humanities - 320 topics (History, Geography, Politics)
    this.generateHumanitiesTopics();
    // Languages - 200 topics (French, Latin, Spanish)
    this.generateLanguageTopics();
    // Arts & Others - 220 topics
    this.generateArtsTopics();
    
    this.calculateAllDependencies();
  }

  generateMathTopics() {
    const categories = {
      g5: ['Grundlagen', 'Brüche_Einführung', 'Geometrie_Grundlagen', 'Dezimalzahlen'],
      g6: ['Negative_Zahlen', 'Brüche_Vertiefung', 'Prozentrechnung', 'Geometrie_Flächen'],
      g7: ['Terme', 'Gleichungen', 'Proportionen', 'Pythagoras', 'Körper'],
      g8: ['Funktionen', 'Lineare_Gleichungssysteme', 'Trigonometrie', 'Wahrscheinlichkeit'],
      g9: ['Quadratische_Gleichungen', 'Quadratische_Funktionen', 'Potenzen_Wurzeln', 'Trigonometrie_Erweitert'],
      g10: ['Exponentialfunktionen', 'Logarithmen', 'Trigonometrische_Funktionen', 'Analysis_Einführung'],
      g11: ['Analysis_Ableitungen', 'Analysis_Kurvendiskussion', 'Ebene_Geometrie', 'Vektoren'],
      g12: ['Analysis_Integrale', 'Raumgeometrie', 'Wahrscheinlichkeit_Vertiefung', 'Matrizen'],
      g13: ['Analysis_Vertiefung', 'Differentialgleichungen', 'Komplexe_Zahlen', 'Stochastik_Abitur']
    };

    let topicIndex = 0;
    
    // Generate 40 topics per grade
    for (let grade = 5; grade <= 13; grade++) {
      const gradeKey = `g${grade}`;
      const gradeCats = categories[gradeKey] || ['Mathematik_Allgemein'];
      
      for (let i = 1; i <= 40; i++) {
        const category = gradeCats[Math.floor((i - 1) / (40 / gradeCats.length))] || gradeCats[0];
        const complexity = Math.min(10, Math.max(1, Math.floor((grade - 4) * 1.2) + Math.floor(Math.random() * 3)));
        const estimatedHours = Math.max(2, complexity * 0.8);
        
        const topic = {
          id: KnowledgeDatabase.generateId('math', grade, i),
          subject: 'Mathematik',
          grade: grade,
          name: this.generateMathTopicName(grade, i, category),
          category: category,
          complexity: complexity,
          estimatedHours: Math.round(estimatedHours * 10) / 10,
          description: this.generateMathDescription(grade, i, category),
          prerequisites: [],
          learningObjectives: this.generateLearningObjectives('math', grade, i),
          examRelevance: this.calculateExamRelevance(grade, complexity),
          repetitionInterval: this.calculateRepetitionInterval(complexity)
        };
        
        this.topics.set(topic.id, topic);
        topicIndex++;
      }
    }
  }

  generateMathTopicName(grade, index, category) {
    const prefixes = {
      'Grundlagen': ['Zahlen', 'Grundrechenarten', 'Schriftliches Rechnen', 'Zahlenstrahl'],
      'Brüche_Einführung': ['Brüche als Teile', 'Echte Brüche', 'Brüche am Kreis', 'Bruchteile'],
      'Brüche_Vertiefung': ['Erweitern und Kürzen', 'Gleiche Brüche', 'Ordnen', 'Addieren'],
      'Geometrie_Grundlagen': ['Punkte und Geraden', 'Dreiecke', 'Vierecke', 'Winkel'],
      'Terme': ['Variablen', 'Terme aufstellen', 'Terme vereinfachen', 'Klammern'],
      'Gleichungen': ['Einfache Gleichungen', 'Äquivalenzumformungen', 'Textgleichungen', 'Lösungsmenge'],
      'Funktionen': ['Zuordnungen', 'Proportionale Funktionen', 'Lineare Funktionen', 'Steigung'],
      'Quadratische_Gleichungen': ['Quadratische Gleichungen', 'pq-Formel', 'ABC-Formel', 'Vieta'],
      'Analysis_Ableitungen': ['Grenzwerte', 'Differenzenquotient', 'Ableitungsregeln', 'Kurvendiskussion'],
      'Analysis_Integrale': ['Stammfunktion', 'Integrationsregeln', 'Flächenberechnung', 'Volumen']
    };
    
    const baseNames = prefixes[category] || [`Mathe Thema ${index}`];
    return `${baseNames[(index - 1) % baseNames.length]} ${Math.ceil(index / baseNames.length)}`;
  }

  generateGermanTopics() {
    const categories = {
      g5: ['Lesen', 'Schreiben', 'Grammatik_Grundlagen', 'Rechtschreibung'],
      g6: ['Textverständnis', 'Erzählungen', 'Wortarten', 'Satzlehre'],
      g7: ['Gedichte', 'Epik', 'Satzglieder', 'Zeitformen'],
      g8: ['Drama', 'Lyrik', 'Nebensätze', 'Wortbildung'],
      g9: ['Romantik', 'Klassik', 'Aufsatz', 'Stilistik'],
      g10: ['Aufklärung', 'Expressionismus', 'Interpretation', 'Medien'],
      g11: ['Literaturgeschichte', 'Textanalyse', 'Rhetorik', 'Sprachwandel'],
      g12: ['Literaturtheorie', 'Vergleichende Analyse', 'Abiturvorbereitung', 'Kreatives Schreiben'],
      g13: ['Wissenschaftliches Arbeiten', 'Fachsprache', 'Kritik', 'Abiturtraining']
    };

    for (let grade = 5; grade <= 13; grade++) {
      const gradeCats = categories[`g${grade}`] || ['Deutsch_Allgemein'];
      
      for (let i = 1; i <= 35; i++) {
        const category = gradeCats[Math.floor((i - 1) / (35 / gradeCats.length))] || gradeCats[0];
        const complexity = Math.min(10, Math.max(1, Math.floor((grade - 4) * 1.1) + Math.floor(Math.random() * 3)));
        
        const topic = {
          id: KnowledgeDatabase.generateId('german', grade, i),
          subject: 'Deutsch',
          grade: grade,
          name: this.generateGermanTopicName(grade, i, category),
          category: category,
          complexity: complexity,
          estimatedHours: Math.round(complexity * 0.7 * 10) / 10,
          description: this.generateGermanDescription(grade, i, category),
          prerequisites: [],
          learningObjectives: this.generateLearningObjectives('german', grade, i),
          examRelevance: this.calculateExamRelevance(grade, complexity),
          repetitionInterval: this.calculateRepetitionInterval(complexity)
        };
        
        this.topics.set(topic.id, topic);
      }
    }
  }

  generateEnglishTopics() {
    const categories = {
      g5: ['Basics', 'Present_Tense', 'Vokabeln_Essen', 'Zahlen_Farben'],
      g6: ['Past_Tense', 'Future_Tense', 'Vokabeln_Schule', 'Begrüßungen'],
      g7: ['Perfect_Tenses', 'Adjectives_Adverbs', 'Vokabeln_Hobby', 'Texte schreiben'],
      g8: ['Conditionals', 'Passive_Voice', 'Vokabeln_Reisen', 'Briefe schreiben'],
      g9: ['Reported_Speech', 'Gerund_Infinitive', 'Vokabeln_Medien', 'Diskussionen'],
      g10: ['Advanced_Grammar', 'Academic_English', 'Vokabeln_Umwelt', 'Präsentationen'],
      g11: ['Literature', 'Shakespeare', 'Vokabeln_Politik', 'Analysen'],
      g12: ['Fachsprache', 'Cambridge_Prep', 'Vokabeln_Wissenschaft', 'C1_Niveau'],
      g13: ['Native_Level', 'C2_Prep', 'Akzentreduktion', 'Abitur']
    };

    for (let grade = 5; grade <= 13; grade++) {
      const gradeCats = categories[`g${grade}`] || ['English_General'];
      
      for (let i = 1; i <= 32; i++) {
        const category = gradeCats[Math.floor((i - 1) / (32 / gradeCats.length))] || gradeCats[0];
        const complexity = Math.min(10, Math.max(1, Math.floor((grade - 4) * 1.15) + Math.floor(Math.random() * 3)));
        
        const topic = {
          id: KnowledgeDatabase.generateId('english', grade, i),
          subject: 'Englisch',
          grade: grade,
          name: this.generateEnglishTopicName(grade, i, category),
          category: category,
          complexity: complexity,
          estimatedHours: Math.round(complexity * 0.75 * 10) / 10,
          description: this.generateEnglishDescription(grade, i, category),
          prerequisites: [],
          learningObjectives: this.generateLearningObjectives('english', grade, i),
          examRelevance: this.calculateExamRelevance(grade, complexity),
          repetitionInterval: this.calculateRepetitionInterval(complexity)
        };
        
        this.topics.set(topic.id, topic);
      }
    }
  }

  generateScienceTopics() {
    // Physics
    this.generateSubjectTopics('physics', 'Physik', 130);
    // Chemistry  
    this.generateSubjectTopics('chemistry', 'Chemie', 130);
    // Biology
    this.generateSubjectTopics('biology', 'Biologie', 140);
  }

  generateHumanitiesTopics() {
    // History
    this.generateSubjectTopics('history', 'Geschichte', 130);
    // Geography
    this.generateSubjectTopics('geography', 'Erdkunde', 120);
    // Politics
    this.generateSubjectTopics('politics', 'Politik', 70);
  }

  generateLanguageTopics() {
    // French
    this.generateSubjectTopics('french', 'Französisch', 80);
    // Latin
    this.generateSubjectTopics('latin', 'Latein', 70);
    // Spanish
    this.generateSubjectTopics('spanish', 'Spanisch', 50);
  }

  generateArtsTopics() {
    // Art
    this.generateSubjectTopics('art', 'Kunst', 50);
    // Music
    this.generateSubjectTopics('music', 'Musik', 60);
    // PE
    this.generateSubjectTopics('pe', 'Sport', 40);
    // CS
    this.generateSubjectTopics('cs', 'Informatik', 70);
  }

  generateSubjectTopics(subjectKey, subjectName, countPerGrade) {
    for (let grade = 5; grade <= 13; grade++) {
      const topicsForGrade = Math.floor(countPerGrade / 9);
      
      for (let i = 1; i <= topicsForGrade; i++) {
        const complexity = Math.min(10, Math.max(1, Math.floor((grade - 4) * 1.1) + Math.floor(Math.random() * 3)));
        
        const topic = {
          id: KnowledgeDatabase.generateId(subjectKey, grade, i),
          subject: subjectName,
          grade: grade,
          name: `${subjectName} - ${this.getSubjectCategory(subjectKey, grade)} ${i}`,
          category: this.getSubjectCategory(subjectKey, grade),
          complexity: complexity,
          estimatedHours: Math.round(complexity * 0.8 * 10) / 10,
          description: `${subjectName} Lerninhalt für Klasse ${grade}`,
          prerequisites: [],
          learningObjectives: [`${subjectName} Ziel ${i} verstehen`, `Anwendung üben`, `Prüfungsrelevanz: ${complexity > 7 ? 'Hoch' : 'Mittel'}`],
          examRelevance: this.calculateExamRelevance(grade, complexity),
          repetitionInterval: this.calculateRepetitionInterval(complexity)
        };
        
        this.topics.set(topic.id, topic);
      }
    }
  }

  getSubjectCategory(subject, grade) {
    const categories = {
      physics: { 5: 'Mechanik', 6: 'Wärme', 7: 'Elektrizität', 8: 'Optik', 9: 'Schall', 10: 'Atomphysik', 11: 'Quanten', 12: 'Relativität', 13: 'Abitur' },
      chemistry: { 5: 'Stoffe', 6: 'Reaktionen', 7: 'Säuren', 8: 'Metalle', 9: 'Organisch', 10: 'Polymere', 11: 'Biochemie', 12: 'PhysChem', 13: 'Abitur' },
      biology: { 5: 'Pflanzen', 6: 'Tiere', 7: 'Mensch', 8: 'Zellen', 9: 'Genetik', 10: 'Ökologie', 11: 'Evolution', 12: 'Neuro', 13: 'Biotech' },
      history: { 5: 'Urzeit', 6: 'Antike', 7: 'MA', 8: 'Neuzeit', 9: '19.Jh', 10: '20.Jh', 11: 'KalterKrieg', 12: 'Nach45', 13: 'Abitur' },
      geography: { 5: 'Europa', 6: 'Afrika', 7: 'Asien', 8: 'Amerika', 9: 'Klima', 10: 'Wirtschaft', 11: 'Urban', 12: 'Global', 13: 'Abitur' },
      politics: { 5: 'Demokratie', 6: 'Verfassung', 7: 'Parteien', 8: 'Wirtschaft', 9: 'EU', 10: 'International', 11: 'Medien', 12: 'Zukunft', 13: 'Abitur' }
    };
    
    return (categories[subject] && categories[subject][grade]) || 'Allgemein';
  }

  // Utility methods
  generateMathDescription(grade, index, category) {
    return `Mathematisches Thema für Klasse ${grade}: ${category} - Komplexitätsstufe ${Math.min(10, grade - 3)}`;
  }

  generateGermanDescription(grade, index, category) {
    return `Deutsch Lerninhalt für Klasse ${grade}: ${category} - Sprachkompetenz aufbauen`;
  }

  generateEnglishDescription(grade, index, category) {
    return `Englisch Lerninhalt für Klasse ${grade}: ${category} - CEFR Niveau ${Math.min(6, Math.floor(grade / 2) + 1)}`;
  }

  generateGermanTopicName(grade, index, category) {
    return `Deutsch ${grade}.${index}: ${category}`;
  }

  generateEnglishTopicName(grade, index, category) {
    return `English ${grade}.${index}: ${category.replace('_', ' ')}`;
  }

  generateLearningObjectives(subject, grade, index) {
    return [
      `Grundverständnis aufbauen`,
      `Anwendungsübungen lösen`,
      `Prüfungsreife erreichen`
    ];
  }

  calculateExamRelevance(grade, complexity) {
    if (grade >= 11) return complexity >= 6 ? 'Hoch' : 'Mittel';
    if (grade >= 9) return complexity >= 7 ? 'Hoch' : complexity >= 4 ? 'Mittel' : 'Niedrig';
    return complexity >= 8 ? 'Mittel' : 'Niedrig';
  }

  calculateRepetitionInterval(complexity) {
    // Spaced repetition: harder topics need more frequent review
    const intervals = { 1: 14, 2: 12, 3: 10, 4: 9, 5: 8, 6: 7, 7: 6, 8: 5, 9: 4, 10: 3 };
    return intervals[complexity] || 7;
  }

  calculateAllDependencies() {
    // Build prerequisite chains based on grade progression
    for (const [id, topic] of this.topics) {
      const prerequisites = this.findPrerequisites(topic);
      topic.prerequisites = prerequisites;
      this.dependencies.set(id, prerequisites);
    }
  }

  findPrerequisites(topic) {
    const prereqs = [];
    
    // Same subject, previous grade
    if (topic.grade > 5) {
      const prevGradeTopics = Array.from(this.topics.values())
        .filter(t => t.subject === topic.subject && t.grade === topic.grade - 1)
        .slice(0, 5);
      prereqs.push(...prevGradeTopics.map(t => t.id));
    }
    
    // Same grade, lower complexity
    const sameGradeEasier = Array.from(this.topics.values())
      .filter(t => t.subject === topic.subject && t.grade === topic.grade && t.complexity < topic.complexity)
      .slice(0, 3);
    prereqs.push(...sameGradeEasier.map(t => t.id));
    
    return prereqs.slice(0, 5); // Max 5 prerequisites
  }

  // API Methods
  getTopicsForGrade(grade) {
    return Array.from(this.topics.values()).filter(t => t.grade === grade);
  }

  getTopicsForSubject(subject) {
    return Array.from(this.topics.values()).filter(t => t.subject.toLowerCase() === subject.toLowerCase());
  }

  getTopicsByComplexity(min, max) {
    return Array.from(this.topics.values()).filter(t => t.complexity >= min && t.complexity <= max);
  }

  getTopicById(id) {
    return this.topics.get(id);
  }

  getAllSubjects() {
    return [...new Set(Array.from(this.topics.values()).map(t => t.subject))];
  }

  getTopicCount() {
    return this.topics.size;
  }

  getRecommendedTopics(currentLevels, targetGrade, targetNote) {
    // Smart recommendation algorithm
    const gap = this.calculateKnowledgeGap(currentLevels, targetNote);
    const availableTopics = Array.from(this.topics.values())
      .filter(t => t.grade <= targetGrade)
      .filter(t => !currentLevels[t.id] || currentLevels[t.id] < targetNote);
    
    // Sort by gap relevance and exam importance
    return availableTopics
      .map(t => ({
        ...t,
        priority: this.calculatePriority(t, gap, targetNote),
        suggestedHours: Math.ceil(t.estimatedHours * (1 + (targetNote - (currentLevels[t.id] || 1)) * 0.2))
      }))
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 50);
  }

  calculateKnowledgeGap(currentLevels, targetNote) {
    let totalGap = 0;
    let topicCount = 0;
    
    for (const [topicId, level] of Object.entries(currentLevels)) {
      const topic = this.topics.get(topicId);
      if (topic) {
        totalGap += Math.max(0, targetNote - level);
        topicCount++;
      }
    }
    
    return topicCount > 0 ? totalGap / topicCount : targetNote;
  }

  calculatePriority(topic, gap, targetNote) {
    const examWeight = topic.examRelevance === 'Hoch' ? 3 : topic.examRelevance === 'Mittel' ? 2 : 1;
    const complexityWeight = topic.complexity / 10;
    const gapFactor = gap / targetNote;
    
    return (examWeight * 0.4 + complexityWeight * 0.3 + gapFactor * 0.3) * 100;
  }

  generateSmartLearningPlan(profile, days, hoursPerDay) {
    const { grade, currentLevels, targetNote, subjects } = profile;
    const totalHours = days * hoursPerDay;
    
    // Get recommended topics
    const allRecommendations = subjects.flatMap(subject => {
      const subjectTopics = this.getTopicsForSubject(subject)
        .filter(t => t.grade <= grade)
        .filter(t => !currentLevels[t.id] || currentLevels[t.id] < targetNote);
      
      return subjectTopics.map(t => ({
        ...t,
        currentLevel: currentLevels[t.id] || 1,
        neededImprovement: targetNote - (currentLevels[t.id] || 1)
      }));
    });

    // Sort by needed improvement and exam relevance
    const sortedTopics = allRecommendations.sort((a, b) => {
      const scoreA = a.neededImprovement * (a.examRelevance === 'Hoch' ? 2 : 1);
      const scoreB = b.neededImprovement * (b.examRelevance === 'Hoch' ? 2 : 1);
      return scoreB - scoreA;
    });

    // Generate schedule with spaced repetition
    const schedule = [];
    let remainingHours = totalHours;
    const daySchedule = [];
    
    for (let day = 1; day <= days; day++) {
      const dayPlan = {
        day: day,
        date: new Date(Date.now() + (day - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        totalHours: hoursPerDay,
        sessions: [],
        topics: []
      };

      let dayHours = 0;
      
      // Add new topics
      while (dayHours < hoursPerDay && sortedTopics.length > 0) {
        const topic = sortedTopics[0];
        const hoursNeeded = Math.min(
          hoursPerDay - dayHours,
          Math.ceil(topic.estimatedHours * (1 + topic.neededImprovement * 0.1))
        );
        
        if (hoursNeeded >= 1) {
          dayPlan.sessions.push({
            topicId: topic.id,
            topicName: topic.name,
            subject: topic.subject,
            duration: hoursNeeded,
            type: 'new_learning',
            complexity: topic.complexity
          });
          
          dayHours += hoursNeeded;
          topic.estimatedHours -= hoursNeeded;
          
          if (topic.estimatedHours <= 0.5) {
            sortedTopics.shift();
          }
        } else {
          break;
        }
      }

      // Add review sessions (spaced repetition for previous days)
      if (day > 1) {
        const reviewTopics = this.getReviewTopics(schedule, day);
        for (const review of reviewTopics.slice(0, 2)) {
          if (dayHours + 0.5 <= hoursPerDay) {
            dayPlan.sessions.push({
              topicId: review.id,
              topicName: review.name,
              subject: review.subject,
              duration: 0.5,
              type: 'review',
              complexity: review.complexity
            });
            dayHours += 0.5;
          }
        }
      }

      schedule.push(dayPlan);
    }

    // Add final exam preparation days
    const examPrepDays = Math.max(3, Math.floor(days * 0.1));
    for (let i = 0; i < examPrepDays; i++) {
      const prepDay = {
        day: days + i + 1,
        date: new Date(Date.now() + (days + i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        totalHours: hoursPerDay,
        sessions: [],
        topics: [],
        type: 'exam_preparation'
      };

      // High exam relevance topics
      const criticalTopics = allRecommendations
        .filter(t => t.examRelevance === 'Hoch')
        .slice(0, 4);
      
      for (const topic of criticalTopics) {
        prepDay.sessions.push({
          topicId: topic.id,
          topicName: topic.name,
          subject: topic.subject,
          duration: hoursPerDay / 4,
          type: 'exam_review',
          complexity: topic.complexity
        });
      }
      
      schedule.push(prepDay);
    }

    return {
      totalTopics: allRecommendations.length,
      totalDays: days + examPrepDays,
      totalHours: totalHours + (examPrepDays * hoursPerDay),
      targetNote: targetNote,
      schedule: schedule,
      summary: this.generatePlanSummary(schedule, allRecommendations)
    };
  }

  getReviewTopics(previousSchedule, currentDay) {
    const reviewable = [];
    
    for (const day of previousSchedule) {
      const daysAgo = currentDay - day.day;
      for (const session of day.sessions) {
        const topic = this.topics.get(session.topicId);
        if (topic && daysAgo >= topic.repetitionInterval) {
          reviewable.push(topic);
        }
      }
    }
    
    return reviewable.sort((a, b) => b.complexity - a.complexity);
  }

  generatePlanSummary(schedule, allTopics) {
    const subjectDistribution = {};
    const typeDistribution = { new_learning: 0, review: 0, exam_review: 0 };
    
    for (const day of schedule) {
      for (const session of day.sessions) {
        subjectDistribution[session.subject] = (subjectDistribution[session.subject] || 0) + session.duration;
        typeDistribution[session.type] = (typeDistribution[session.type] || 0) + session.duration;
      }
    }

    return {
      topicsToCover: allTopics.length,
      subjectBreakdown: subjectDistribution,
      timeAllocation: typeDistribution,
      averageComplexity: allTopics.reduce((sum, t) => sum + t.complexity, 0) / allTopics.length,
      examCriticalTopics: allTopics.filter(t => t.examRelevance === 'Hoch').length
    };
  }
}

// Create and export singleton instance
const knowledgeDB = new KnowledgeDatabase();

export default knowledgeDB;
export { KnowledgeDatabase };
