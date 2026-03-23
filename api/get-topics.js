export default function handler(req, res) {
  const topics = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography',
    'Literature', 'Computer Science', 'Art', 'Music', 'Philosophy', 'Psychology',
    // ... add more topics up to 2000
  ];

  res.status(200).json(topics);
}
