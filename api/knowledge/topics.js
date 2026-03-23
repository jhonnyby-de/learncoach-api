// ============================================
// KNOWLEDGE & TOPICS API
// GET /api/knowledge/topics - Get topics by filter
// GET /api/knowledge/topic/:id - Get specific topic
// GET /api/knowledge/subjects - Get all subjects
// POST /api/knowledge/analyze - Analyze knowledge gaps
// ============================================

import knowledgeDB from '../../data/knowledge-database.js';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  switch (action) {
    case 'subjects':
      return getSubjects(req, res);
    case 'topic':
      return getTopic(req, res);
    case 'analyze':
      return analyzeKnowledge(req, res);
    default:
      return getTopics(req, res);
  }
}

function getSubjects(req, res) {
  const subjects = knowledgeDB.getAllSubjects();
  
  return res.status(200).json({
    success: true,
    count: subjects.length,
    subjects: subjects.map(subject => ({
      name: subject,
      topicCount: knowledgeDB.getTopicsForSubject(subject).length,
      grades: [...new Set(knowledgeDB.getTopicsForSubject(subject).map(t => t.grade))].sort()
    }))
  });
}

function getTopics(req, res) {
  const { grade, subject, complexityMin, complexityMax, category, limit = 50 } = req.query;

  let topics = Array.from(knowledgeDB.topics.values());

  // Apply filters
  if (grade) {
    topics = topics.filter(t => t.grade === parseInt(grade));
  }

  if (subject) {
    topics = topics.filter(t => t.subject.toLowerCase() === subject.toLowerCase());
  }

  if (complexityMin !== undefined) {
    topics = topics.filter(t => t.complexity >= parseInt(complexityMin));
  }

  if (complexityMax !== undefined) {
    topics = topics.filter(t => t.complexity <= parseInt(complexityMax));
  }

  if (category) {
    topics = topics.filter(t => t.category === category);
  }

  // Sort by grade and complexity
  topics = topics.sort((a, b) => {
    if (a.grade !== b.grade) return a.grade - b.grade;
    return a.complexity - b.complexity;
  });

  const totalCount = topics.length;
  const limitedTopics = topics.slice(0, parseInt(limit));

  return res.status(200).json({
    success: true,
    total: totalCount,
    returned: limitedTopics.length,
    filters: { grade, subject, complexityMin, complexityMax, category },
    topics: limitedTopics.map(t => ({
      id: t.id,
      name: t.name,
      subject: t.subject,
      grade: t.grade,
      category: t.category,
      complexity: t.complexity,
      estimatedHours: t.estimatedHours,
      examRelevance: t.examRelevance,
      description: t.description
    }))
  });
}

function getTopic(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Topic ID required' });
  }

  const topic = knowledgeDB.getTopicById(id);

  if (!topic) {
    return res.status(404).json({ error: 'Topic not found' });
  }

  // Get related topics
  const sameSubject = knowledgeDB.getTopicsForSubject(topic.subject)
    .filter(t => t.id !== id && t.grade === topic.grade)
    .slice(0, 5);

  const prerequisiteDetails = topic.prerequisites
    .map(pid => knowledgeDB.getTopicById(pid))
    .filter(Boolean);

  return res.status(200).json({
    success: true,
    topic: {
      id: topic.id,
      name: topic.name,
      subject: topic.subject,
      grade: topic.grade,
      category: topic.category,
      complexity: topic.complexity,
      estimatedHours: topic.estimatedHours,
      description: topic.description,
      examRelevance: topic.examRelevance,
      repetitionInterval: topic.repetitionInterval,
      learningObjectives: topic.learningObjectives,
      prerequisites: prerequisiteDetails.map(p => ({
        id: p.id,
        name: p.name,
        grade: p.grade,
        complexity: p.complexity
      })),
      relatedTopics: sameSubject.map(t => ({
        id: t.id,
        name: t.name,
        complexity: t.complexity
      }))
    }
  });
}

function analyzeKnowledge(req, res) {
  const { currentLevels, targetGrade, targetNote, subjects } = req.body;

  if (!currentLevels || !targetGrade || !targetNote) {
    return res.status(400).json({
      error: 'Missing required fields: currentLevels, targetGrade, targetNote'
    });
  }

  const analysis = {
    overall: {
      currentAverage: 0,
      targetNote: parseFloat(targetNote),
      gap: 0,
      topicsAnalyzed: Object.keys(currentLevels).length
    },
    bySubject: {},
    criticalTopics: [],
    recommendedFocus: []
  };

  let totalLevel = 0;
  let count = 0;

  // Analyze by subject
  for (const [topicId, level] of Object.entries(currentLevels)) {
    const topic = knowledgeDB.getTopicById(topicId);
    if (!topic) continue;

    if (!analysis.bySubject[topic.subject]) {
      analysis.bySubject[topic.subject] = {
        topics: [],
        average: 0,
        total: 0,
        count: 0
      };
    }

    const gap = Math.abs(level - targetNote);
    const entry = {
      topicId,
      name: topic.name,
      grade: topic.grade,
      currentLevel: level,
      targetLevel: targetNote,
      gap,
      complexity: topic.complexity,
      priority: calculatePriority(gap, topic.complexity, topic.examRelevance)
    };

    analysis.bySubject[topic.subject].topics.push(entry);
    analysis.bySubject[topic.subject].total += level;
    analysis.bySubject[topic.subject].count++;

    totalLevel += level;
    count++;

    if (gap > 1.5 && topic.examRelevance === 'Hoch') {
      analysis.criticalTopics.push(entry);
    }
  }

  // Calculate averages
  analysis.overall.currentAverage = count > 0 ? Math.round((totalLevel / count) * 10) / 10 : 0;
  analysis.overall.gap = Math.round((analysis.overall.currentAverage - targetNote) * 10) / 10;

  for (const subject of Object.keys(analysis.bySubject)) {
    const s = analysis.bySubject[subject];
    s.average = Math.round((s.total / s.count) * 10) / 10;
    s.topics.sort((a, b) => b.priority - a.priority);
    
    // Add top 3 from each subject to recommendations
    analysis.recommendedFocus.push(...s.topics.slice(0, 3).map(t => ({
      ...t,
      subject
    })));
  }

  // Sort recommendations by priority
  analysis.recommendedFocus.sort((a, b) => b.priority - a.priority);
  analysis.criticalTopics.sort((a, b) => b.priority - a.priority);

  return res.status(200).json({
    success: true,
    analysis
  });
}

function calculatePriority(gap, complexity, examRelevance) {
  const examWeight = examRelevance === 'Hoch' ? 3 : examRelevance === 'Mittel' ? 2 : 1;
  return (gap * 2 + complexity * 0.5) * examWeight;
}
