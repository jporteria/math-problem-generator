# Math Problem Generator

## ✅ **COMPLETED PROJECT**

## Enhanced Features & Capabilities

- [x] **Advanced Timer System**: Difficulty-based time limits with visual countdown, auto-submission, and encouraging time-up notifications
- [x] **Multi-Level Difficulty**: Four levels (Beginner/Intermediate/Advanced/Expert) with different time limits, score multipliers, and problem complexity
- [x] **Comprehensive Score Tracking**: Real-time progress display showing correct answers, total attempts, percentage accuracy, and weighted total scores
- [x] **Interactive Dashboard**: Modern landing page with time-based greetings, platform feature highlights, and live top 3 high scores leaderboard with medal rankings
- [x] **Flexible Problem Types**: Five categories (Addition, Subtraction, Multiplication, Division, Mixed) with AI-customized prompts for targeted practice
- [x] **Problem History**: Complete view of past attempts with results, difficulty levels, and timestamps for progress tracking
- [x] **Smart Hints System**: Pre-generated educational hints stored in database for instant access without API delays
- [x] **AI-Powered Solutions**: Detailed step-by-step explanations with educational reasoning (only accessible after attempting the problem to encourage independent thinking)
- [x] **Mobile-Optimized UI**: Fully responsive design with optimized spacing and navigation for all screen sizes
- [x] **Production-Ready Code**: Clean, optimized codebase with all unused functions removed, comprehensive error handling, and professional documentationnctional AI-powered math problem generator application that creates word problems suitable for Primary 5 students, saves problems and user submissions to a database, and provides personalized feedback using Google's Gemini AI.

## 🚀 **Live Demo**

🌐 **[Click here to view live demo](https://math-problem-generator-beta.vercel.app/)** 

## Tech Stack

- **Frontend**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **AI Integration**: Google Generative AI (Gemini 2.5 Flash)
- **Deployment**: Vercel

## Requirements Checklist

- [x] **AI Problem Generation**: Creates age-appropriate Primary 5 level math word problems using Google Gemini 2.5 Flash
- [x] **Database Integration**: Problems, answers, and hints automatically saved to Supabase with optimized schema
- [x] **Submission Tracking**: All user submissions saved with detailed feedback and performance metrics
- [x] **Personalized AI Feedback**: Contextual, encouraging feedback generated for each submission
- [x] **Mobile-Responsive UI**: Clean, professional interface optimized for all devices
- [x] **Robust Error Handling**: Comprehensive fallbacks for API failures and network issues
- [x] **Loading States**: Smooth user experience with loading indicators for all async operations
- [x] **Educational Value**: Hints and step-by-step solutions promote learning and understanding

## Supabase Credentials
   ```
   SUPABASE_URL: https://aomfokcumnzpdqlcbrfr.supabase.co
   SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvbWZva2N1bW56cGRxbGNicmZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MTIwNDEsImV4cCI6MjA3NTM4ODA0MX0.4PMJMxnTaRVoAsgzolXUWB_ZuCAU2vwcFKEYMUWvsBc
   ```

## Implementation Notes

Throughout this project, I encountered several technical challenges that provided valuable learning experiences. The most significant hurdle was with AI integration, where I discovered that my Google API key configuration only accepted the gemini-2.5-flash model specifically, which took considerable debugging time to identify since the error messages weren't immediately clear about the model compatibility requirements. Additionally, I faced Tailwind CSS configuration issues where the application's styling wasn't rendering properly due to conflicting custom CSS in the globals.css file that was overriding Tailwind utilities. Resolving this required removing the custom body styles and converting the PostCSS configuration from ES modules to CommonJS format to ensure proper processing.

Later in development, I encountered JSON parsing issues with Gemini's responses that were wrapped in markdown code blocks, requiring sophisticated parsing logic to extract the actual JSON data. The final optimization phase involved comprehensive code cleanup, removing unused functions, API routes, and debug statements to create a production-ready codebase.

### My Implementation:

- **Frontend Logic**: Fully implemented with proper state management, loading states for both problem generation and answer submission, comprehensive error handling, and clean UI with Tailwind CSS
- **AI Integration**: Integrated Google Gemini 2.5 Flash API for comprehensive math education features including problem generation with pre-generated hints, personalized feedback, and detailed step-by-step solution explanations, with robust fallback mechanisms when AI is unavailable
- **Database Operations**: Complete Supabase integration with optimized table structure, saving problem sessions with hints, user submissions with feedback, and score tracking for leaderboard functionality
- **API Routes**:
  - `POST /api/math-problem` - Generates new problems with hints using AI and saves to database
  - `POST /api/math-problem/submit` - Evaluates answers and generates personalized feedback
  - `GET /api/high-scores` - Retrieves top 3 scores for leaderboard display
  - `GET /api/problem-history` - Fetches user's recent problem attempts and results
  - `POST /api/solution` - Generates detailed step-by-step solution explanations (only after user attempts)
- **Code Quality**: Added comprehensive comments, proper TypeScript interfaces, separated loading states, clean code organization, and removed all unused functions and debug logs for production-ready code
- **UI/UX**: Fully responsive design with loading spinners, visual feedback for correct/incorrect answers, proper form validation, smooth transitions, and real-time score tracking. Features a modern dashboard with time-based greetings, platform features showcase, and top 3 high scores leaderboard with medal rankings
- **Problem Types**: Implemented dynamic problem type selection (Addition, Subtraction, Multiplication, Division, Mixed) with AI prompt customization for each type, allowing users to focus on specific math operations or practice all types randomly
- **Dashboard**: Created a comprehensive landing page featuring time-based greetings (Good Morning/Afternoon/Evening), platform features overview, top 3 high scores leaderboard with medal rankings, and smooth navigation to quiz functionality
- **Learning Support**: 
  - **Instant Hints**: Pre-generated hints stored in database for immediate access without AI delays
  - **Step-by-Step Solutions**: AI-powered detailed explanations that break down problems into clear, educational steps appropriate for Primary 5 students (only available after user attempts the problem)
  - **Smart Learning Flow**: Users must attempt problems before accessing solutions, encouraging independent thinking

## Additional Features

- [x] Timer system with difficulty-based time limits and auto-submission
- [x] Difficulty levels (Beginner/Intermediate/Advanced/Expert)
- [x] Score tracking with real-time progress display
- [x] Dashboard/Landing page with platform overview and high scores leaderboard
- [x] Different problem types (addition, subtraction, multiplication, division)
- [x] Problem history view
- [x] Hints system with pre-generated hints stored in database
- [x] Step-by-step solution/explanations (only available after user tried to answer the question)

