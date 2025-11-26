# Habit Tracker Pro

A production-ready habit tracking mobile app built with React Native and Firebase.

## 🚀 Features

- **Authentication**: Email/password authentication with Firebase Auth
- **Real-time Sync**: Real-time habit tracking with Firestore
- **Streak Tracking**: Automatic streak calculation and progress tracking
- **Analytics**: Firebase Analytics instrumentation for user engagement
- **Offline Support**: Firestore offline persistence enabled
- **Comprehensive Testing**: Unit tests with Jest and React Testing Library
- **Type Safety**: Full TypeScript coverage throughout the codebase

## 🛠 Tech Stack

- **Framework**: React Native (Expo SDK 54)
- **Language**: TypeScript
- **Backend**: Firebase (Auth, Firestore, Analytics)
- **Navigation**: React Navigation (Stack Navigator)
- **UI Library**: React Native Paper
- **Testing**: Jest + React Testing Library
- **Code Quality**: ESLint, Prettier, TypeScript

## 📋 Prerequisites

- Node.js 22+ (CI uses 22, but 16+ should work)
- Yarn package manager
- Expo CLI (installed globally or via npx)
- iOS Simulator (Mac) or Android Emulator

## 🔧 Setup

1. Clone the repository:

```bash
git clone https://github.com/ooladuwa/habit-tracker-pro.git
cd habit-tracker-pro
```

2. Install dependencies:

```bash
yarn install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

4. Add your Firebase configuration to `.env` (get values from [Firebase Console](https://console.firebase.google.com/)):
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`
   - `FIREBASE_MEASUREMENT_ID` (optional, for Analytics)

5. Start the development server:

```bash
yarn start
```

## 🧪 Testing

```bash
# Run unit tests in watch mode
yarn test

# Run tests with coverage report
yarn test:coverage

# Run tests in CI mode (no watch, with coverage)
yarn test:ci

# Update test snapshots
yarn test:update-snapshots
```

**Test Coverage**: The project maintains 50%+ coverage threshold for statements, functions, and lines, with 40%+ for branches.

## 📱 Running the App

```bash
# iOS Simulator (Mac only)
yarn ios

# Android Emulator
yarn android

```

## 🏗 Project Structure

```
src/
├── components/         # Reusable UI components
├── config/             # Firebase configuration
├── constants/          # App constants (colors, etc.)
├── hooks/              # Custom React hooks (useAuth, useHabits)
├── navigation/         # Navigation configuration
├── screens/            # Screen components
│   ├── WelcomeScreen.tsx
│   ├── LoginScreen.tsx
│   ├── SignUpScreen.tsx
│   ├── HomeScreen.tsx
│   ├── AddHabitScreen.tsx
│   └── HabitDetailsScreen.tsx
├── services/           # Service layer (Firebase abstractions)
│   ├── authService.ts
│   └── habitService.ts
├── types/              # TypeScript type definitions
└── utils/              # Utility functions and tests
    ├── __tests__/      # Test files
    ├── analytics.ts
    ├── dateHelpers.ts
    └── streakCalculator.ts
```

## 🏗 Architecture

- **Service Layer**: Abstraction layer for Firebase operations (auth, habits)
- **Custom Hooks**: React hooks for state management (useAuth, useHabits)
- **Type Safety**: Full TypeScript coverage with strict type checking
- **Security**: Firestore security rules implemented (user data isolation)
- **Analytics**: Firebase Analytics tracking for user engagement metrics
- **Error Handling**: Comprehensive error handling with user-friendly messages

## 📝 Code Quality

```bash
# Lint code
yarn lint

# Fix linting issues automatically
yarn lint:fix

# Format code with Prettier
yarn format

# Check code formatting
yarn format:check

# Type check with TypeScript
yarn type-check
```

## 🔄 CI/CD

The project includes a GitHub Actions CI pipeline that runs on every push and pull request:

- Linting checks
- TypeScript type checking
- Code formatting validation
- Unit tests with coverage
- Coverage reporting to Codecov

See `.github/workflows/ci.yml` for details.

## 🚀 Deployment

Coming soon - App Store and Google Play Store links

## 📊 Test Coverage

The project includes comprehensive unit tests for:

- Authentication service (`authService.test.ts`)
- Habit service (`habitService.test.ts`)
- Custom hooks (`useAuth.test.tsx`, `useHabits.test.tsx`)
- Utility functions (`dateHelpers.test.ts`, `streakCalculator.test.ts`)

## 👨‍💻 Author

**Onaje Oladuwa**

- Portfolio: [Coming Soon!]
- GitHub: [@ooladuwa](https://github.com/ooladuwa)
- LinkedIn: [ooladuwa](https://linkedin.com/in/ooladuwa)
- Email: onaje.oladuwa@gmail.com

## 📄 License

MIT License - feel free to use this project for learning purposes.

## 🙏 Acknowledgments

Built as a portfolio project demonstrating production-grade mobile development practices including:

- Clean architecture and separation of concerns
- Comprehensive testing strategies
- Type safety with TypeScript
- CI/CD pipeline implementation
- Production-ready error handling

---

⭐️ If you found this project helpful, please give it a star!
