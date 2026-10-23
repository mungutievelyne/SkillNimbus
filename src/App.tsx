import { useEffect, useState } from 'react'
import './App.css'

type Theme = 'dark' | 'light'

type QuizQuestion = {
  topic: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

type TopicResult = {
  correct: number
  total: number
}

type StudyGuide = {
  explanation: string
  example: string
  takeaway: string
}

const quizQuestions: QuizQuestion[] = [
  {
    topic: 'Cloud Concepts',
    question: 'What is cloud computing?',
    options: [
      'Storing all files on a personal USB drive',
      'Delivering computing services over the internet',
      'Using a computer without an operating system',
      'Connecting computers only through Bluetooth',
    ],
    correctAnswer: 1,
    explanation:
      'Cloud computing delivers services such as servers, storage, databases, networking, and software over the internet.',
  },
  {
    topic: 'Azure Architecture',
    question: 'What is an Azure Region?',
    options: [
      'A type of Azure user account',
      'A billing document for cloud services',
      'A geographical area containing one or more datacenters',
      'A tool used only to write code',
    ],
    correctAnswer: 2,
    explanation:
      'An Azure Region is a geographical area containing one or more datacenters connected through a dedicated, low-latency network.',
  },
  {
    topic: 'Cloud Services',
    question:
      'Which cloud model provides virtual machines while you manage the operating system?',
    options: [
      'Infrastructure as a Service (IaaS)',
      'Software as a Service (SaaS)',
      'Platform as a Service (PaaS)',
      'Internet as a Service (InternetaaS)',
    ],
    correctAnswer: 0,
    explanation:
      'IaaS provides infrastructure such as virtual machines. You manage the operating system and applications, while the cloud provider manages the underlying physical infrastructure.',
  },
  {
    topic: 'Security',
    question: 'What is the main purpose of Microsoft Entra ID?',
    options: [
      'To physically repair Azure servers',
      'To increase internet connection speed',
      'To create website graphics',
      'To manage identities and control access to resources',
    ],
    correctAnswer: 3,
    explanation:
      'Microsoft Entra ID is a cloud-based identity and access management service that helps users sign in and access resources securely.',
  },
  {
    topic: 'Cost Management',
    question:
      'Which Azure tool helps estimate the cost of Azure services before deployment?',
    options: [
      'Azure Service Health',
      'Azure Pricing Calculator',
      'Microsoft Entra ID',
      'Azure Resource Manager templates',
    ],
    correctAnswer: 1,
    explanation:
      'The Azure Pricing Calculator helps you estimate the cost of Azure products and services before you deploy them.',
  },
]

const allTopics = [...new Set(quizQuestions.map((question) => question.topic))]

const studyGuides: Record<string, StudyGuide> = {
  'Cloud Concepts': {
    explanation:
      'Cloud computing means using computing services over the internet instead of relying only on your own computer or local servers.',
    example:
      'When you store photos online and access them from different devices, you are using a cloud service. Businesses can also use cloud servers, databases, and networking.',
    takeaway:
      'Remember: cloud computing delivers computing services over the internet, often on demand.',
  },
  'Azure Architecture': {
    explanation:
      'Azure is Microsoft’s cloud platform. Its architecture includes regions, availability zones, resources, and resource groups.',
    example:
      'A region is a geographical area where Microsoft operates datacenters. Availability zones are separate physical locations within supported regions that help improve resilience.',
    takeaway:
      'Remember: regions describe geographical locations, while availability zones help protect workloads from certain datacenter failures.',
  },
  'Cloud Services': {
    explanation:
      'IaaS, PaaS, and SaaS are three cloud service models. IaaS provides infrastructure, PaaS provides a platform for building and deploying applications, and SaaS provides ready-to-use software.',
    example:
      'IaaS is like renting a kitchen and managing your own cooking equipment. PaaS is like using a prepared kitchen so you can focus on cooking. SaaS is like ordering a ready-made meal.',
    takeaway:
      'Remember: IaaS = infrastructure, PaaS = platform, SaaS = software.',
  },
  Security: {
    explanation:
      'Cloud security includes protecting identities, controlling access, and safeguarding information. Microsoft Entra ID helps manage identities and access to resources.',
    example:
      'A school ID identifies a student. Access rules determine which rooms that student can enter. Similarly, identity systems help verify users and control what they can access.',
    takeaway:
      'Remember: authentication checks who you are; authorization determines what you are allowed to access.',
  },
  'Cost Management': {
    explanation:
      'Azure Cost Management helps you analyse and monitor cloud spending. The Azure Pricing Calculator estimates costs before you deploy services.',
    example:
      'Before renting cloud resources, you can use the pricing calculator to estimate the expected bill, just as you would prepare a budget before making a purchase.',
    takeaway:
      'Remember: estimate costs before deployment and monitor actual cloud spending afterward.',
  },
}

function readSavedTopicResults(): Record<string, TopicResult> {
  try {
    const saved = localStorage.getItem('skillnimbus-topic-results')
    return saved ? (JSON.parse(saved) as Record<string, TopicResult>) : {}
  } catch {
    return {}
  }
}

function App() {
  const [activePage, setActivePage] = useState('Dashboard')
  const [studyTopic, setStudyTopic] = useState('Cloud Concepts')

  const [theme, setTheme] = useState<Theme>(() =>
    localStorage.getItem('skillnimbus-theme') === 'light' ? 'light' : 'dark',
  )

  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [quizFinished, setQuizFinished] = useState(false)

  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('skillnimbus-best-score')
    return saved ? Number(saved) : 0
  })

  const [completedQuizzes, setCompletedQuizzes] = useState(() => {
    const saved = localStorage.getItem('skillnimbus-quizzes-completed')
    return saved ? Number(saved) : 0
  })

  const [topicResults, setTopicResults] =
    useState<Record<string, TopicResult>>(readSavedTopicResults)

  useEffect(() => {
    localStorage.setItem('skillnimbus-theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem(
      'skillnimbus-topic-results',
      JSON.stringify(topicResults),
    )
  }, [topicResults])

  const navigation = [
    { name: 'Dashboard', icon: '⌂' },
    { name: 'Smart Quiz', icon: '✎' },
    { name: 'AI Study Buddy', icon: '✧' },
    { name: 'Readiness Tracker', icon: '◷' },
  ]

  const currentQuestion = quizQuestions[questionIndex]
  const quizProgress = ((questionIndex + 1) / quizQuestions.length) * 100

  const topicsWithResults = allTopics
    .filter((topic) => (topicResults[topic]?.total ?? 0) > 0)
    .map((topic) => {
      const result = topicResults[topic]
      return {
        topic,
        correct: result.correct,
        total: result.total,
        percentage: Math.round((result.correct / result.total) * 100),
      }
    })

  const weakestTopic = [...topicsWithResults].sort(
    (a, b) => a.percentage - b.percentage,
  )[0]

  function toggleTheme() {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }

  function startQuiz() {
    setQuestionIndex(0)
    setSelectedAnswer(null)
    setScore(0)
    setQuizFinished(false)
    setActivePage('Smart Quiz')
  }

  function chooseAnswer(optionIndex: number) {
    if (selectedAnswer !== null) return

    setSelectedAnswer(optionIndex)

    const isCorrect = optionIndex === currentQuestion.correctAnswer
    const topic = currentQuestion.topic

    if (isCorrect) {
      setScore((current) => current + 1)
    }

    setTopicResults((previousResults) => {
      const previousTopic = previousResults[topic] ?? {
        correct: 0,
        total: 0,
      }

      return {
        ...previousResults,
        [topic]: {
          correct: previousTopic.correct + (isCorrect ? 1 : 0),
          total: previousTopic.total + 1,
        },
      }
    })
  }

  function nextQuestion() {
    if (selectedAnswer === null) return

    if (questionIndex < quizQuestions.length - 1) {
      setQuestionIndex((current) => current + 1)
      setSelectedAnswer(null)
      return
    }

    const finalScore =
      score + (selectedAnswer === currentQuestion.correctAnswer ? 0 : 0)
    const newBest = Math.max(bestScore, finalScore)
    const newCount = completedQuizzes + 1

    setBestScore(newBest)
    setCompletedQuizzes(newCount)
    setQuizFinished(true)

    localStorage.setItem('skillnimbus-best-score', String(newBest))
    localStorage.setItem('skillnimbus-quizzes-completed', String(newCount))
  }

  function renderDashboard() {
    return (
      <>
        <section className="welcome-banner">
          <div className="welcome-text">
            <span className="eyebrow">YOUR LEARNING JOURNEY</span>
            <h1>Welcome to your cloud journey.</h1>
            <p>
              Build your Azure knowledge, practise with confidence and get
              ready for your AZ-900 certification.
            </p>
            <button className="primary-button" onClick={startQuiz}>
              Start practising 
            </button>
          </div>

          <div className="cloud-art" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="cloud">☁</div>
            <div className="floating-badge badge-one">✦ Learn</div>
            <div className="floating-badge badge-two">✓ Grow</div>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div>
              <h2>Your progress</h2>
              <p>A snapshot of your certification preparation.</p>
            </div>
            <span className="live-label">
              <span className="status-dot" /> YOUR OVERVIEW
            </span>
          </div>

          <div className="stats-grid">
            <article className="stat-card">
              <div className="stat-top">
                <span className="stat-icon cyan">✎</span>
                <span className="stat-caption">PRACTICE</span>
              </div>
              <h3>{completedQuizzes}</h3>
              <p>Quizzes completed</p>
              <div className="stat-foot">Keep building your knowledge</div>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span className="stat-icon purple">◎</span>
                <span className="stat-caption">BEST SCORE</span>
              </div>
              <h3>
                {completedQuizzes === 0
                  ? '—'
                  : Math.round((bestScore / quizQuestions.length) * 100)}
                <small>{completedQuizzes === 0 ? '' : '%'}</small>
              </h3>
              <p>Best quiz result</p>
              <div className="stat-foot">Your highest practice score</div>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span className="stat-icon green">✧</span>
                <span className="stat-caption">READINESS</span>
              </div>
              <h3>
                {completedQuizzes === 0
                  ? 'Getting started'
                  : Math.round((bestScore / quizQuestions.length) * 100) >= 80
                    ? 'Looking strong'
                    : 'Keep practising'}
              </h3>
              <p>Practice indicator</p>
              <div className="stat-foot">Based on your best quiz score</div>
            </article>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div>
              <h2>Your learning toolkit</h2>
              <p>Choose how you want to learn today.</p>
            </div>
          </div>

          <div className="features-grid">
            <article className="feature-card">
              <div className="feature-icon cyan">✎</div>
              <span className="feature-tag">TEST YOUR KNOWLEDGE</span>
              <h3>Smart Quiz</h3>
              <p>
                Practise AZ-900 questions, get instant feedback and understand
                why each answer is correct.
              </p>
              <button className="text-button" onClick={startQuiz}>
                Explore quizzes 
              </button>
            </article>

            <article className="feature-card">
              <div className="feature-icon purple">✧</div>
              <span className="feature-tag">LEARN YOUR WAY</span>
              <h3>AI Study Buddy</h3>
              <p>
                Explore cloud concepts with simple explanations and examples
                that make sense.
              </p>
              <button
                className="text-button"
                onClick={() => setActivePage('AI Study Buddy')}
              >
                Meet your study buddy 
              </button>
            </article>

            <article className="feature-card">
              <div className="feature-icon green">◷</div>
              <span className="feature-tag">TRACK YOUR GROWTH</span>
              <h3>Readiness Tracker</h3>
              <p>
                Monitor your practice results, identify weaker topics, and
                decide what to revise next.
              </p>
              <button
                className="text-button"
                onClick={() => setActivePage('Readiness Tracker')}
              >
                View your readiness 
              </button>
            </article>
          </div>
        </section>

        <footer className="footer">
          <span>SkillNimbus © 2026</span>
          <span>Learn smarter. Rise higher. ☁</span>
        </footer>
      </>
    )
  }

  function renderQuiz() {
    return (
      <section className="quiz-page">
        {!quizFinished ? (
          <>
            <div className="quiz-heading">
              <span className="eyebrow">AZ-900 PRACTICE</span>
              <h1>Test your cloud knowledge.</h1>
              <p>
                Choose the best answer. You will see feedback and an explanation
                after each question.
              </p>
            </div>

            <div className="quiz-meta">
              <span className="quiz-topic">{currentQuestion.topic}</span>
              <span>
                Question {questionIndex + 1} of {quizQuestions.length}
              </span>
            </div>

            <div
              className="quiz-progress-track"
              role="progressbar"
              aria-label="Quiz progress"
              aria-valuemin={0}
              aria-valuemax={quizQuestions.length}
              aria-valuenow={questionIndex + 1}
            >
              <div
                className="quiz-progress-fill"
                style={{ width: `${quizProgress}%` }}
              />
            </div>

            <article className="quiz-card">
              <h2>{currentQuestion.question}</h2>

              <div className="answer-list">
                {currentQuestion.options.map((option, index) => {
                  const isCorrect = index === currentQuestion.correctAnswer
                  const isSelected = index === selectedAnswer

                  let answerClass = 'answer-option'

                  if (selectedAnswer !== null && isCorrect) {
                    answerClass += ' answer-correct'
                  } else if (isSelected && !isCorrect) {
                    answerClass += ' answer-incorrect'
                  }

                  return (
                    <button
                      key={option}
                      className={answerClass}
                      onClick={() => chooseAnswer(index)}
                      disabled={selectedAnswer !== null}
                    >
                      <span className="answer-letter">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>{option}</span>
                      {selectedAnswer !== null && isCorrect && (
                        <span className="answer-mark">✓</span>
                      )}
                      {isSelected && !isCorrect && (
                        <span className="answer-mark">✕</span>
                      )}
                    </button>
                  )
                })}
              </div>

              {selectedAnswer !== null && (
                <div
                  className={`answer-feedback ${
                    selectedAnswer === currentQuestion.correctAnswer
                      ? 'feedback-correct'
                      : 'feedback-incorrect'
                  }`}
                  role="status"
                >
                  <h3>
                    {selectedAnswer === currentQuestion.correctAnswer
                      ? 'Correct answer!'
                      : 'Not quite — keep learning!'}
                  </h3>
                  <p>{currentQuestion.explanation}</p>
                </div>
              )}

              <div className="quiz-footer">
                <span>
                  Score: {score} /{' '}
                  {questionIndex + (selectedAnswer !== null ? 1 : 0)}
                </span>
                <button
                  className="primary-button"
                  onClick={nextQuestion}
                  disabled={selectedAnswer === null}
                >
                  {questionIndex === quizQuestions.length - 1
                    ? 'See results'
                    : 'Next question'}
                  <span>→</span>
                </button>
              </div>
            </article>
          </>
        ) : (
          <div className="quiz-results">
            <div className="result-icon">
              {score / quizQuestions.length >= 0.8 ? '🏆' : '☁'}
            </div>
            <span className="eyebrow">QUIZ COMPLETED</span>
            <h1>
              {score / quizQuestions.length >= 0.8
                ? 'Excellent work!'
                : 'Every question is progress.'}
            </h1>
            <p className="result-description">
              {score / quizQuestions.length >= 0.8
                ? 'You have a strong result on this practice set. Keep going!'
                : 'Review the explanations, revisit the topics, and try again to improve your score.'}
            </p>

            <div className="result-score">
              <strong>
                {Math.round((score / quizQuestions.length) * 100)}%
              </strong>
              <span>
                {score} correct out of {quizQuestions.length} questions
              </span>
            </div>

            <div className="result-actions">
              <button className="primary-button" onClick={startQuiz}>
                Try again <span>↻</span>
              </button>
              <button
                className="secondary-button"
                onClick={() => setActivePage('Readiness Tracker')}
              >
                View readiness
              </button>
              <button
                className="secondary-button"
                onClick={() => setActivePage('Dashboard')}
              >
                Back to dashboard
              </button>
            </div>
          </div>
        )}
      </section>
    )
  }

  function renderReadinessTracker() {
    return (
      <section className="section readiness-page">
        <div className="section-heading">
          <div>
            <h2>Your AZ-900 readiness</h2>
            <p>
              See your results by topic and decide what to practise next.
            </p>
          </div>
        </div>

        <div className="stats-grid">
          {allTopics.map((topic) => {
            const result = topicResults[topic]
            const total = result?.total ?? 0
            const correct = result?.correct ?? 0
            const percentage =
              total > 0 ? Math.round((correct / total) * 100) : 0

            return (
              <article className="stat-card" key={topic}>
                <div className="stat-top">
                  <span className="stat-icon cyan">◷</span>
                  <span className="stat-caption">TOPIC READINESS</span>
                </div>

                <h3>{topic}</h3>

                <div
                  className="quiz-progress-track"
                  role="progressbar"
                  aria-label={`${topic} readiness`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={percentage}
                >
                  <div
                    className="quiz-progress-fill"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <p>
                  {total > 0 ? `${percentage}% readiness` : 'Not attempted yet'}
                </p>

                <div className="stat-foot">
                  {correct} correct out of {total} answered
                </div>

                <p>
                  {total === 0
                    ? 'Answer a quiz question to begin tracking this topic.'
                    : percentage >= 80
                      ? 'Looking strong — keep practising!'
                      : 'Needs more practice — revisit this topic.'}
                </p>
              </article>
            )
          })}
        </div>

        <article className="feature-card">
          <div className="feature-icon purple">✧</div>
          <h3>Recommended next step</h3>
          {weakestTopic ? (
            <p>
              Focus on <strong>{weakestTopic.topic}</strong>, currently your
              lowest-scoring attempted topic at {weakestTopic.percentage}%.
              Practise more questions to improve your result.
            </p>
          ) : (
            <p>
              You haven’t answered any questions yet. Start the Smart Quiz and
              your topic results will appear here automatically.
            </p>
          )}
          <button className="primary-button" onClick={startQuiz}>
            {weakestTopic ? 'Practise again' : 'Start Smart Quiz'} →
          </button>
        </article>
      </section>
    )
  }

  function renderStudyBuddy() {
    const guide = studyGuides[studyTopic]

    return (
      <section className="quiz-page study-buddy-page">
        <div className="quiz-heading">
          <span className="eyebrow">YOUR AZ-900 LEARNING COMPANION</span>
          <h1>Let’s make cloud concepts simple.</h1>
          <p>
            Choose a topic to explore a beginner-friendly explanation, a
            real-world example and an exam tip.
          </p>
        </div>

        <article className="quiz-card">
          <h2>What would you like to learn?</h2>

          <div className="answer-list">
            {Object.keys(studyGuides).map((topic) => (
              <button
                key={topic}
                className={`answer-option ${
                  studyTopic === topic ? 'answer-correct' : ''
                }`}
                onClick={() => setStudyTopic(topic)}
                aria-pressed={studyTopic === topic}
              >
                <span className="answer-letter">
                  {studyTopic === topic ? '✓' : '→'}
                </span>
                <span>{topic}</span>
              </button>
            ))}
          </div>
        </article>

        <article className="quiz-card">
          <span className="eyebrow">STUDY NOTES</span>
          <h2>{studyTopic}</h2>

          <h3>In simple terms</h3>
          <p>{guide.explanation}</p>

          <h3>Real-world example</h3>
          <p>{guide.example}</p>

          <div className="answer-feedback feedback-correct">
            <h3>Remember this for AZ-900</h3>
            <p>{guide.takeaway}</p>
          </div>

          <div className="result-actions">
            <button
              className="secondary-button"
              onClick={() => setActivePage('Readiness Tracker')}
            >
              View readiness
            </button>
            <button className="primary-button" onClick={startQuiz}>
              Practise with a quiz
            </button>
          </div>
        </article>
      </section>
    )
  }

  return (
    <div className="app" data-theme={theme}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">S</div>
          <div>
            <h2>SkillNimbus</h2>
            <p>Learn smarter. Rise higher.</p>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>

        <nav className="navigation">
          {navigation.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${
                activePage === item.name ? 'active' : ''
              }`}
              onClick={() => setActivePage(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-icon">?</div>
          <div>
            <strong>Keep growing!</strong>
            <p>Every practice session counts.</p>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="breadcrumb">Workspace / {activePage}</p>
            <h2>{activePage}</h2>
          </div>

          <div className="topbar-actions">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title="Change appearance"
            >
              <span>{theme === 'dark' ? '☀' : '☾'}</span>
              <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
            </button>

            <div className="profile">
              <div className="avatar">S</div>
              <div>
                <strong>Azure Learner</strong>
                <p>AZ-900 Candidate</p>
              </div>
            </div>
          </div>
        </header>

        {activePage === 'Dashboard' && renderDashboard()}
        {activePage === 'Smart Quiz' && renderQuiz()}
        {activePage === 'Readiness Tracker' && renderReadinessTracker()}
        {activePage === 'AI Study Buddy' && renderStudyBuddy()}
      </main>
    </div>
  )
}

export default App
