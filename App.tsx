import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/hooks/useAuth';
import { RootNavigator } from './src/navigation/RootNavigator';
import { HabitsProvider } from './src/hooks/useHabits';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    // eslint-disable-next-line react-native/no-inline-styles
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <AuthProvider>
          <HabitsProvider>
            <RootNavigator />
            <StatusBar style="auto" />
          </HabitsProvider>
        </AuthProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
