# Habit Tracker Pro

A production-ready habit tracking mobile app built with React Native and Firebase.

## 🚀 Features

- Email/password authentication
- Real-time habit tracking with Firestore
- Streak calculation and progress tracking
- Analytics instrumentation
- Offline support
- Comprehensive test coverage

## 🛠 Tech Stack

- React Native (Expo)
- TypeScript
- Firebase (Auth, Firestore, Analytics)
- React Navigation
- React Native Paper
- Jest + Detox

## 📋 Prerequisites

- Node.js 16+
- Yarn
- Expo CLI
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

4. Add your Firebase configuration to `.env` (get values from Firebase Console)

5. Start the development server:

```bash
   yarn start
```

## 🧪 Testing

```bash
# Run unit tests
yarn test

# Run tests with coverage
yarn test:coverage

# Run E2E tests
yarn test:e2e
```

## 📱 Running the App

```bash
# iOS
yarn ios

# Android
yarn android

# Web
yarn web
```

## 🏗 Architecture

- Service layer abstraction for Firebase operations
- Custom hooks for state management
- Type-safe throughout with TypeScript
- Security rules implemented in Firestore
- Analytics tracking for user engagement

## 📝 Code Quality

```bash
# Lint code
yarn lint

# Fix linting issues
yarn lint:fix

# Format code
yarn format

# Type check
yarn type-check
```

## 🚀 Deployment

Coming soon - App Store and Google Play Store links

## 👨‍💻 Author

**Onaje Oladuwa**

- Portfolio: [Your Portfolio](https://your-portfolio.com)
- GitHub: [@ooladuwa](https://github.com/ooladuwa)
- LinkedIn: [ooladuwa](https://linkedin.com/in/ooladuwa)
- Email: onaje.oladuwa@gmail.com

## 📄 License

MIT License - feel free to use this project for learning purposes.

## 🙏 Acknowledgments

Built as a portfolio project demonstrating production-grade mobile development practices.

---

⭐️ If you found this project helpful, please give it a star!
