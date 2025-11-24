import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  SegmentedButtons,
  HelperText,
} from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { AppStackParamList } from '../types';
import { useHabits } from '../hooks/useHabits';
import { trackEvent } from '../utils/analytics';
import { colors } from '../constants/colors';

type AddHabitNavigationProp = StackNavigationProp<
  AppStackParamList,
  'AddHabit'
>;

const AddHabit = () => {
  const navigation = useNavigation<AddHabitNavigationProp>();
  const { createHabit, loading, error } = useHabits();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [localError, setLocalError] = useState<string>('');

  const handleCreateHabit = async () => {
    // Clear previous errors
    setLocalError('');

    // Validate inputs
    if (!title.trim()) {
      setLocalError('Please give your habit a name');
      return;
    }

    if (title.trim().length < 3) {
      setLocalError('Habit name must be at least 3 characters long');
      return;
    }

    if (title.trim().length > 50) {
      setLocalError('Habit name must be less than 50 characters long');
      return;
    }

    try {
      // Create the habit
      await createHabit({
        title: title.trim(),
        description: description.trim() || undefined,
        frequency,
      });

      // Track analytics
      trackEvent('habit_created', { frequency });

      // Navigate back to home
      navigation.goBack();
    } catch (error) {
      console.error('Error creating habit:', error);
      // errors handled by the useHabits hook
    }
  };

  const displayError = localError || error;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text variant="headlineSmall" style={styles.title}>
            Create New Habit
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Start building a better routine today
          </Text>

          <TextInput
            label="Habit Title"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
            placeholder="e.g., Morning Exercise"
            maxLength={50}
            disabled={loading}
            error={!!displayError && !title.trim()}
          />

          <TextInput
            label="Description (Optional)"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
            placeholder="e.g., 30 minutes of cardio"
            disabled={loading}
          />

          <Text variant="labelLarge" style={styles.label}>
            Frequency
          </Text>
          <SegmentedButtons
            value={frequency}
            onValueChange={(value) => setFrequency(value as 'daily' | 'weekly')}
            buttons={[
              {
                value: 'daily',
                label: 'Daily',
                icon: 'calendar-today',
                disabled: loading,
              },
              {
                value: 'weekly',
                label: 'Weekly',
                icon: 'calendar-week',
                disabled: loading,
              },
            ]}
            style={styles.segmented}
          />

          {displayError ? (
            <HelperText type="error" visible={true} style={styles.errorText}>
              {displayError}
            </HelperText>
          ) : null}

          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.button}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleCreateHabit}
              style={styles.button}
              loading={loading}
              disabled={loading || !title.trim()}
            >
              Create Habit
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddHabit;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 32,
    opacity: 0.7,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
  },
  segmented: {
    marginBottom: 16,
  },
  errorText: {
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
});
