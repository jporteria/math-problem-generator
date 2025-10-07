# Math Problem Generator

## ✅ **COMPLETED PROJECT**

A fully functional AI-powered math problem generator application that creates word problems suitable for Primary 5 students, saves problems and user submissions to a database, and provides personalized feedback using Google's Gemini AI.

## 🚀 **Live Demo**

🌐 **[Click here to view live demo](https://math-problem-generator-beta.vercel.app/)** 

## Tech Stack

- **Frontend**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **AI Integration**: Google Generative AI (Gemini 2.5 Flash)
- **Deployment**: Vercel

## Requirements Checklist

- [x] AI generates appropriate Primary 5 level math problems
- [x] Problems and answers are saved to Supabase
- [x] User submissions are saved with feedback
- [x] AI generates helpful, personalized feedback
- [x] UI is clean and mobile-responsive
- [x] Error handling for API failures
- [x] Loading states during API calls

## Supabase Credentials
   ```
   SUPABASE_URL: https://aomfokcumnzpdqlcbrfr.supabase.co
   SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvbWZva2N1bW56cGRxbGNicmZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MTIwNDEsImV4cCI6MjA3NTM4ODA0MX0.4PMJMxnTaRVoAsgzolXUWB_ZuCAU2vwcFKEYMUWvsBc
   ```

## Implementation Notes

Throughout this project, I encountered several technical challenges that provided valuable learning experiences. The most significant hurdle was with AI integration, where I discovered that my Google API key configuration only accepted the gemini-2.5-flash model specifically, which took considerable debugging time to identify since the error messages weren't immediately clear about the model compatibility requirements. Additionally, I faced Tailwind CSS configuration issues where the application's styling wasn't rendering properly due to conflicting custom CSS in the globals.css file that was overriding Tailwind utilities. Resolving this required removing the custom body styles and converting the PostCSS configuration from ES modules to CommonJS format to ensure proper processing.

### My Implementation:

- **Frontend Logic**: Fully implemented with proper state management, loading states for both problem generation and answer submission, comprehensive error handling, and clean UI with Tailwind CSS
- **AI Integration**: Integrated Google Gemini 2.5 Flash API for both problem generation and personalized feedback generation, with fallback mechanisms when AI is unavailable
- **Database Operations**: Complete Supabase integration with proper table structure, saving both problem sessions and user submissions with feedback
- **API Routes**:
  - `POST /api/math-problem` - Generates new problems using AI and saves to database
  - `POST /api/math-problem/submit` - Evaluates answers and generates personalized feedback
- **Code Quality**: Added comprehensive comments, proper TypeScript interfaces, separated loading states, and clean code organization
- **UI/UX**: Responsive design with loading spinners, visual feedback for correct/incorrect answers, proper form validation, smooth transitions, and real-time score tracking
- **Problem Types**: Implemented dynamic problem type selection (Addition, Subtraction, Multiplication, Division, Mixed) with AI prompt customization for each type, allowing users to focus on specific math operations or practice all types randomly

## Additional Features

- [ ] Difficulty levels (Easy/Medium/Hard)
- [ ] Problem history view
- [x] Score tracking
- [x] Different problem types (addition, subtraction, multiplication, division)
- [ ] Hints system
- [ ] Step-by-step solution explanations

```
