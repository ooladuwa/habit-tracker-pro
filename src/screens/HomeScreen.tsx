import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';

export default function HomeScreen() {
  const { user, signOut, loading } = useAuth();

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Welcome!
      </Text>
      <Text variant="bodyLarge" style={styles.email}>
        {user?.email}
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        You successfully logged in
      </Text>
      <Button
        mode="contained"
        onPress={signOut}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Sign Out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 8,
  },
  email: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    marginBottom: 32,
    opacity: 0.7,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 24,
  },
});
