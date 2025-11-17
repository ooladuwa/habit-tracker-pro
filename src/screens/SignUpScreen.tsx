import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';
import { trackEvent } from '../utils/analytics';
import { FIREBASE_API_KEY } from '@env';

const SignUpScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureConfirmEntry, setSecureConfirmEntry] = useState(true);
  const [localError, setLocalError] = useState('');

  const { signUp, loading, error } = useAuth();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSignUp = async () => {
    // Clear any previous errors
    setLocalError('');

    // Validate inputs
    if (!email.trim() || !validateEmail(email)) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    if (!password.trim()) {
      setLocalError('Please enter a password.');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setLocalError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    try {
      await signUp(email.trim().toLowerCase(), password);
      trackEvent('user_signup', { method: 'email' });
    } catch (err) {
      // Error is handled by the useAuth hook
      console.error('Signup error:', err);
    }
  };

  const displayError = localError || error;

  const testFirebase = async () => {
    try {
      console.log('🧪 Testing Firebase Auth endpoint...');
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@test.com',
            password: 'password',
            returnSecureToken: true,
          }),
        }
      );
      console.log('✅ Firebase API reachable! Status:', response.status);
      const data = await response.json();
      console.log('Response:', data);
    } catch (error) {
      console.log('❌ Cannot reach Firebase:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text variant="headlineMedium" style={styles.title}>
            Create Account
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Start building better habits today
          </Text>

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            mode="outlined"
            style={styles.input}
            disabled={loading}
            error={!!displayError}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secureTextEntry}
            autoCapitalize="none"
            autoComplete="password-new"
            mode="outlined"
            style={styles.input}
            disabled={loading}
            error={!!displayError}
            right={
              <TextInput.Icon
                icon={secureTextEntry ? 'eye' : 'eye-off'}
                onPress={() => setSecureTextEntry(!secureTextEntry)}
              />
            }
          />

          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={secureConfirmEntry}
            autoCapitalize="none"
            autoComplete="password-new"
            mode="outlined"
            style={styles.input}
            disabled={loading}
            error={!!displayError}
            right={
              <TextInput.Icon
                icon={secureConfirmEntry ? 'eye' : 'eye-off'}
                onPress={() => setSecureConfirmEntry(!secureConfirmEntry)}
              />
            }
          />

          <HelperText type="info" visible={true} style={styles.helperText}>
            Password must be at least 8 characters with uppercase, lowercase,
            and a number
          </HelperText>

          {displayError ? (
            <HelperText type="error" visible={true} style={styles.errorText}>
              {displayError}
            </HelperText>
          ) : null}

          <Button
            mode="contained"
            onPress={handleSignUp}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Create Account
          </Button>
          <Button onPress={testFirebase} mode="outlined">
            Test Firebase API
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 32,
    textAlign: 'center',
    opacity: 0.7,
  },
  input: {
    marginBottom: 16,
  },
  helperText: {
    marginBottom: 8,
  },
  errorText: {
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
  },
});
