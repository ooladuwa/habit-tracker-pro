import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/hooks/useAuth';
import { RootNavigator } from './src/navigation/RootNavigator';
import { HabitsProvider } from './src/hooks/useHabits';

export default function App() {
  return (
    <PaperProvider>
      <AuthProvider>
        <HabitsProvider>
          <RootNavigator />
          <StatusBar style="auto" />
        </HabitsProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
