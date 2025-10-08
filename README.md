# Math Problem Generator

## ✅ **COMPLETED PROJECT**

A fully functional AI-powered math problem generator application that creates word problems suitable for Primary 5 students, saves problems and user submissions to a database, and provides personalized feedback using Google's Gemini AI.

## Live Demo

🌐 **[Click here to view live demo](https://math-problem-generator-beta.vercel.app/)** 

## 🎬 **App Preview**

![Math Problem Generator Demo](MathProblemGenerator.gif)

*Complete user flow: Dashboard → Problem Generation → Timer Challenge → Hints → Solutions → Confetti Celebration* 

## Tech Stack

- **Frontend**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **AI Integration**: Google Generative AI (Gemini 2.5 Flash)
- **Deployment**: Vercel

## Architecture & Performance

- **Server-Side Rendering**: Optimized with Next.js App Router for fast initial page loads
- **Database Design**: Normalized schema with efficient indexing for scalable performance  
- **AI Optimization**: Pre-generated hints stored in database to eliminate API latency
- **Error Resilience**: Graceful fallbacks ensure application works even when AI services are unavailable
- **TypeScript**: Full type safety across frontend and API routes for robust development

## Supabase Credentials
   ```
   SUPABASE_URL: https://aomfokcumnzpdqlcbrfr.supabase.co
   SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvbWZva2N1bW56cGRxbGNicmZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MTIwNDEsImV4cCI6MjA3NTM4ODA0MX0.4PMJMxnTaRVoAsgzolXUWB_ZuCAU2vwcFKEYMUWvsBc
   ```

## Requirements Checklist

- [x] AI generates appropriate Primary 5 level math problems
- [x] Problems and answers are saved to Supabase
- [x] User submissions are saved with feedback
- [x] AI generates helpful, personalized feedback
- [x] UI is clean and mobile-responsive
- [x] Error handling for API failures
- [x] Loading states during API calls

## Additional Features

- [x] Difficulty levels (Beginner/Intermediate/Advanced/Expert)
- [x] Problem history view
- [x] Score tracking
- [x] Different problem types (addition, subtraction, multiplication, division)
- [x] Hints system
- [x] Step-by-step solution/explanations
- [x] Timer system with difficulty-based time limits
- [x] Dashboard/Landing page with platform overview
- [x] Confetti celebration effects when answering correctly to enhance user experience
- [x] High score leaderboard

## Implementation Notes

I'm particularly proud of the dashboard/landing page that was created, as it made the app look modern and user-friendly with its time-based greetings, feature highlights, and elegant top 3 leaderboard display with medal rankings. The main challenge was learning Supabase database schema updates and SQL migrations to add new features like scoring and hints, which provided valuable experience in database design patterns.

### My Implementation:

- **Frontend**: Next.js 14 with TypeScript, proper state management, loading states, error handling, and responsive Tailwind CSS design
- **AI Integration**: Google Gemini 2.5 Flash for problem generation, personalized feedback, step-by-step solutions, and pre-generated hints with fallback mechanisms
- **Database**: Supabase integration with optimized schema, problem sessions, user submissions, scoring system, and leaderboard tracking
- **API Routes**: 
  - `POST /api/math-problem` - Generate problems with hints
  - `POST /api/math-problem/submit` - Evaluate answers with AI feedback
  - `GET /api/high-scores` - Top 3 leaderboard data
  - `GET /api/problem-history` - User's attempt history
  - `POST /api/solution` - Step-by-step explanations (post-attempt only)
- **Dashboard**: Modern landing page with time-based greetings, feature highlights, and medal-ranked leaderboard
- **Learning Features**: Difficulty levels, timer system, problem type selection, instant hints, solutions with access control, and confetti celebrations
- **Mobile Optimization**: Fully responsive design with optimized navigation and UI components for all screen sizes

## Future Enhancements

- **User Authentication**: Individual user accounts with personalized progress tracking and learning analytics
- **Advanced AI Features**: Multi-step problem explanations with visual aids and adaptive difficulty adjustment
- **Gamification**: Achievement badges, streak counters, and competitive leaderboards with user profiles
- **Curriculum Integration**: Alignment with specific educational standards and detailed progress reports for educators
- **Accessibility**: Enhanced screen reader support and keyboard navigation for inclusive learning

