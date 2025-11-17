'use client';
import { useRouter } from 'next/router';
import { useUser } from '@/shared/hooks/useUser';
import { AdBanner } from '@/shared/components/ads/AdBanner';
import { Flame, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const LESSONS_LIBRARY = [
  {
    id: 1,
    title: 'JavaScript Basics',
    language: 'JavaScript',
    duration: 12,
    difficulty: 'Beginner',
    description: 'Master variables, functions, and control flow',
    videoUrl: '#',
    topics: ['Variables', 'Functions', 'Loops', 'Conditionals'],
    snippets: [
      { code: 'const greeting = "Hello, Founder!";\\nconsole.log(greeting);', desc: 'Basic variable and output' },
      { code: 'function addNumbers(a, b) {\\n  return a + b;\\n}\\naddNumbers(5, 3);', desc: 'Function definition and call' }
    ],
    quiz: [
      { q: 'What declares a variable in JS?', a: 'const, let, var', correct: 0 },
      { q: 'How do you create a function?', a: 'Using function keyword, Arrow function, Function expression', correct: 0 }
    ]
  },
  {
    id: 2,
    title: 'React Components 101',
    language: 'React',
    duration: 15,
    difficulty: 'Intermediate',
    description: 'Build reusable components and understand state management',
    videoUrl: '#',
    topics: ['Components', 'Props', 'State', 'Hooks'],
    snippets: [
      { code: 'function Counter() {\\n  const [count, setCount] = useState(0);\\n  return <button onClick={() => setCount(count+1)}>{count}</button>\\n}', desc: 'Functional component with state' },
      { code: '<Component prop="value" />\\nfunction Component({prop}) { return <h1>{prop}</h1> }', desc: 'Props passing and usage' }
    ],
    quiz: [
      { q: 'What is JSX?', a: 'JavaScript XML syntax', correct: 0 }
    ]
  },
  {
    id: 3,
    title: 'API Integration',
    language: 'JavaScript',
    duration: 10,
    difficulty: 'Intermediate',
    description: 'Connect your app to external APIs with fetch',
    videoUrl: '#',
    topics: ['Fetch API', 'Async/Await', 'Error Handling'],
    snippets: [
      { code: 'async function getUser() {\\n  const res = await fetch("/api/user");\\n  const data = await res.json();\\n  return data;\\n}', desc: 'Fetching data with async/await' },
      { code: 'fetch("/api/data")\\n  .then(res => res.json())\\n  .then(data => console.log(data))\\n  .catch(err => console.error(err))', desc: 'Promise-based fetch' }
    ],
    quiz: []
  },
  {
    id: 4,
    title: 'Database Basics',
    language: 'SQL',
    duration: 8,
    difficulty: 'Beginner',
    description: 'CRUD operations and database design fundamentals',
    videoUrl: '#',
    topics: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
    snippets: [
      { code: 'SELECT * FROM users WHERE id = 1;', desc: 'Basic SELECT query' },
      { code: 'INSERT INTO users (name, email) VALUES ("John", "john@example.com");', desc: 'INSERT data' }
    ],
    quiz: []
  },
  {
    id: 5,
    title: 'CSS Grid Layout',
    language: 'CSS',
    duration: 11,
    difficulty: 'Beginner',
    description: 'Create responsive layouts with CSS Grid',
    videoUrl: '#',
    topics: ['Grid Container', 'Grid Items', 'Responsive Design'],
    snippets: [
      { code: '.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }', desc: 'Create 3-column responsive grid' },
      { code: '.item { grid-column: span 2; grid-row: span 1; }', desc: 'Span items across grid' }
    ],
    quiz: []
  }
];

const CODE_SNIPPETS = [
  {
    title: 'User Authentication',
    language: 'JavaScript',
    code: `async function login(email, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({email, password})
  });
  return res.json();
}`,
    category: 'Backend'
  },
  {
    title: 'Form Validation',
    language: 'JavaScript',
    code: `function validateEmail(email) {
  const re = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return re.test(email);
}`,
    category: 'Frontend'
  },
  {
    title: 'Array Operations',
    language: 'JavaScript',
    code: `const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const evens = numbers.filter(n => n % 2 === 0);
const sum = numbers.reduce((a, b) => a + b, 0);`,
    category: 'Utility'
  }
];

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useUser();
  const [activeTab, setActiveTab] = useState('lessons'); // lessons, snippets, progress
  const [completedLessons, setCompletedLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});

  const handleCompleteLesson = (id) => {
    if (!completedLessons.includes(id)) {
      setCompletedLessons([...completedLessons, id]);
    }
  };

  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleQuizAnswer = (lessonId, questionIdx, answerIdx) => {
    const key = `${lessonId}-${questionIdx}`;
    setQuizAnswers({...quizAnswers, [key]: answerIdx});
  };

  const getLanguageColor = (lang) => {
    const colors = {
      'JavaScript': 'bg-yellow-100 text-yellow-800',
      'React': 'bg-blue-100 text-blue-800',
      'SQL': 'bg-green-100 text-green-800',
      'CSS': 'bg-purple-100 text-purple-800'
    };
    return colors[lang] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (!isAuthenticated) { router.push('/login'); return null; }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {!user?.isPremium && <AdBanner placement="top" appId="coding-for-founders" />}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-4 py-6">
        <h1 className="text-3xl font-bold">Learn to Code in 15 Minutes</h1>
        <div className="flex gap-2 text-2xl font-bold mt-4"><Flame className="w-6 h-6" />{user?.gamification?.streak || 0} Day Streak</div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-400">
            <p className="text-sm text-gray-600">Lessons Completed</p>
            <h3 className="text-3xl font-bold text-blue-600">{completedLessons.length}</h3>
            <p className="text-xs text-gray-500 mt-1">of {LESSONS_LIBRARY.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-400">
            <p className="text-sm text-gray-600">Code Samples</p>
            <h3 className="text-3xl font-bold text-green-600">{CODE_SNIPPETS.length + completedLessons.length * 2}</h3>
            <p className="text-xs text-gray-500 mt-1">Collected</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-400">
            <p className="text-sm text-gray-600">Completion</p>
            <h3 className="text-3xl font-bold text-purple-600">{Math.round((completedLessons.length / LESSONS_LIBRARY.length) * 100)}%</h3>
            <p className="text-xs text-gray-500 mt-1">Course progress</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
            <p className="text-sm text-gray-600">Badges Earned</p>
            <h3 className="text-3xl font-bold text-yellow-600">{user?.gamification?.badges?.length || 0}</h3>
            <p className="text-xs text-gray-500 mt-1">Achievements</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('lessons')}
            className={`px-6 py-3 font-bold ${activeTab === 'lessons' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            Video Lessons
          </button>
          <button
            onClick={() => setActiveTab('snippets')}
            className={`px-6 py-3 font-bold ${activeTab === 'snippets' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            Code Library
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`px-6 py-3 font-bold ${activeTab === 'progress' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            My Progress
          </button>
        </div>

        {/* Lessons Tab */}
        {activeTab === 'lessons' && (
          <div className="space-y-4">
            {!selectedLesson ? (
              <div className="space-y-4">
                <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-400 mb-6">
                  <h3 className="font-bold mb-2">📚 Learn Coding Fast</h3>
                  <p className="text-sm text-gray-700">Each lesson takes 8-15 minutes. Master web development essentials for startup building.</p>
                </div>

                {LESSONS_LIBRARY.map((lesson) => (
                  <div key={lesson.id} className={`p-6 rounded-lg border-2 cursor-pointer transition hover:shadow-lg ${completedLessons.includes(lesson.id) ? 'bg-green-50 border-green-400' : 'bg-white border-gray-200'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-lg">{lesson.title}</h3>
                          <span className={`px-3 py-1 rounded text-xs font-bold ${getLanguageColor(lesson.language)}`}>
                            {lesson.language}
                          </span>
                          <span className={`px-3 py-1 rounded text-xs font-bold ${lesson.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {lesson.difficulty}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-2">{lesson.description}</p>
                        <div className="flex gap-6 mt-3 text-sm">
                          <span>⏱️ {lesson.duration} minutes</span>
                          <span>📚 {lesson.topics.length} topics</span>
                          {completedLessons.includes(lesson.id) && <span>✅ Completed</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedLesson(lesson)}
                        className="ml-4 px-6 py-3 bg-blue-600 text-white rounded font-bold whitespace-nowrap hover:bg-blue-700"
                      >
                        View Lesson
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <button
                  onClick={() => setSelectedLesson(null)}
                  className="text-blue-600 font-bold hover:underline"
                >
                  ← Back to Lessons
                </button>

                <div className="bg-white rounded-lg shadow p-8">
                  <h2 className="text-3xl font-bold mb-2">{selectedLesson.title}</h2>
                  <div className="flex gap-3 mb-6">
                    <span className={`px-3 py-1 rounded text-sm font-bold ${getLanguageColor(selectedLesson.language)}`}>
                      {selectedLesson.language}
                    </span>
                    <span className="px-3 py-1 rounded text-sm font-bold bg-gray-100">⏱️ {selectedLesson.duration}min</span>
                  </div>

                  {/* Video Placeholder */}
                  <div className="bg-gray-900 rounded-lg h-64 flex items-center justify-center mb-8">
                    <div className="text-white text-center">
                      <div className="text-6xl mb-4">▶️</div>
                      <p className="text-gray-300">{selectedLesson.title} Video Lesson</p>
                    </div>
                  </div>

                  {/* Topics */}
                  <div className="mb-8">
                    <h3 className="font-bold text-lg mb-3">Topics Covered:</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedLesson.topics.map((topic, idx) => (
                        <div key={idx} className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                          <p className="font-bold text-sm">{topic}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Code Snippets */}
                  <div className="mb-8">
                    <h3 className="font-bold text-lg mb-3">Code Examples:</h3>
                    <div className="space-y-3">
                      {selectedLesson.snippets.map((snippet, idx) => (
                        <div key={idx} className="bg-gray-900 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-gray-300 text-sm">{snippet.desc}</p>
                            <button
                              onClick={() => handleCopyCode(snippet.code, `${selectedLesson.id}-${idx}`)}
                              className="text-gray-400 hover:text-white"
                            >
                              {copiedCode === `${selectedLesson.id}-${idx}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                          <pre className="text-green-400 text-xs overflow-x-auto">{snippet.code}</pre>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quiz */}
                  {selectedLesson.quiz.length > 0 && (
                    <div className="mb-8">
                      <h3 className="font-bold text-lg mb-3">Quick Quiz:</h3>
                      <div className="space-y-4">
                        {selectedLesson.quiz.map((question, idx) => (
                          <div key={idx} className="p-4 border-2 border-gray-200 rounded">
                            <p className="font-bold mb-3">{question.q}</p>
                            <div className="space-y-2">
                              {question.a.split(',').map((answer, ansIdx) => (
                                <label key={ansIdx} className="flex items-center gap-3 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`q${idx}`}
                                    checked={quizAnswers[`${selectedLesson.id}-${idx}`] === ansIdx}
                                    onChange={() => handleQuizAnswer(selectedLesson.id, idx, ansIdx)}
                                  />
                                  <span className="text-sm">{answer.trim()}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      handleCompleteLesson(selectedLesson.id);
                      setSelectedLesson(null);
                    }}
                    className="w-full bg-green-600 text-white px-6 py-3 rounded font-bold text-lg hover:bg-green-700"
                  >
                    {completedLessons.includes(selectedLesson.id) ? '✅ Already Completed' : 'Mark as Completed'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Code Library Tab */}
        {activeTab === 'snippets' && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-400 mb-6">
              <h3 className="font-bold mb-2">💾 Ready-to-Use Code Snippets</h3>
              <p className="text-sm text-gray-700">Copy and paste these code examples into your projects. Click to copy.</p>
            </div>

            <div className="space-y-4">
              {CODE_SNIPPETS.map((snippet, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow p-6 border-2 border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{snippet.title}</h3>
                      <div className="flex gap-3 mt-2">
                        <span className={`px-3 py-1 rounded text-xs font-bold ${getLanguageColor(snippet.language)}`}>
                          {snippet.language}
                        </span>
                        <span className="px-3 py-1 rounded text-xs font-bold bg-gray-100">{snippet.category}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopyCode(snippet.code, `snippet-${idx}`)}
                      className="px-4 py-2 bg-blue-600 text-white rounded font-bold flex items-center gap-2"
                    >
                      {copiedCode === `snippet-${idx}` ? (
                        <>
                          <Check className="w-4 h-4" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-green-400 text-sm">{snippet.code}</pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold mb-6">Your Learning Progress</h2>

            <div className="space-y-6">
              <div className="p-6 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <p className="text-gray-600 mb-2">Overall Course Progress</p>
                <div className="w-full bg-gray-300 rounded-full h-4 mb-2">
                  <div
                    className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                    style={{width: `${(completedLessons.length / LESSONS_LIBRARY.length) * 100}%`}}
                  />
                </div>
                <p className="font-bold">{completedLessons.length} of {LESSONS_LIBRARY.length} lessons completed</p>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-lg">Lesson Status:</h3>
                {LESSONS_LIBRARY.map((lesson) => (
                  <div key={lesson.id} className="flex items-center justify-between p-3 border-2 border-gray-200 rounded">
                    <div>
                      <p className="font-bold">{lesson.title}</p>
                      <p className="text-sm text-gray-600">{lesson.language} • {lesson.difficulty}</p>
                    </div>
                    <span className={`font-bold ${completedLessons.includes(lesson.id) ? 'text-green-600' : 'text-gray-400'}`}>
                      {completedLessons.includes(lesson.id) ? '✅ Completed' : '⏳ Not Started'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <h4 className="font-bold mb-2">🏆 Achievement Stats</h4>
                <ul className="text-sm space-y-1">
                  <li>📊 Lessons Completed: {completedLessons.length}</li>
                  <li>💾 Code Snippets Saved: {CODE_SNIPPETS.length}</li>
                  <li>🔥 Current Streak: {user?.gamification?.streak || 0} days</li>
                  <li>⭐ Total Points: {completedLessons.length * 100}</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
