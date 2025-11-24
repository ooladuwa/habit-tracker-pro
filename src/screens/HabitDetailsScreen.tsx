import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  SegmentedButtons,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../types';
import { useHabits } from '../hooks/useHabits';
import {
  calculateStreak,
  getTotalCompletions,
  getCompletionRate,
  formatStreak,
} from '../utils/streakCalculator';
import { trackEvent } from '../utils/analytics';
import { colors } from '../constants/colors';

type HabitDetailRouteProp = RouteProp<AppStackParamList, 'HabitDetail'>;
type HabitDetailNavigationProp = StackNavigationProp<
  AppStackParamList,
  'HabitDetail'
>;

const HabitDetailsScreen = () => {
  const route = useRoute<HabitDetailRouteProp>();
  const navigation = useNavigation<HabitDetailNavigationProp>();
  const { habitId } = route.params;

  const { habits, loading, updateHabit, deleteHabit } = useHabits();
  const habit = habits.find((h) => h.id === habitId);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [error, setError] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  // Initialize the form with the habit data
  useEffect(() => {
    if (habit) {
      setTitle(habit.title);
      setDescription(habit.description || '');
      setFrequency(habit.frequency);
    }
  }, [habit]);

  const streak = habit
    ? calculateStreak(habit.completedDates, habit.frequency)
    : 0;
  const total = habit ? getTotalCompletions(habit.completedDates) : 0;
  const rate = habit
    ? getCompletionRate(habit.completedDates, habit.frequency)
    : 0;

  const handleSave = async () => {
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (title.trim().length < 3) {
      setError('Title must be at least 3 characters');
      return;
    }

    setUpdating(true);
    try {
      await updateHabit(habitId, {
        title: title.trim(),
        description: description.trim() || undefined,
        frequency,
      });

      trackEvent('habit_edited', { habitId, frequency });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating habit:', err);
      setError('Failed to update habit');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setUpdating(true);
            try {
              await deleteHabit(habitId);
              trackEvent('habit_deleted', { habitId });
              navigation.goBack();
            } catch (err) {
              console.error('Error deleting habit:', err);
              Alert.alert('Error', 'Failed to delete habit');
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError('');
    // Reset to original values
    if (habit) {
      setTitle(habit.title);
      setDescription(habit.description || '');
      setFrequency(habit.frequency);
    }
  };

  if (loading || !habit) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading habit...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Statistics Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            📊 Statistics
          </Text>

          <View style={styles.statRow}>
            <Text variant="bodyLarge">Current Streak</Text>
            <Text variant="headlineMedium" style={styles.statValue}>
              {formatStreak(streak, habit.frequency)}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.statRow}>
            <Text variant="bodyLarge">Total Completions</Text>
            <Text variant="headlineMedium" style={styles.statValue}>
              {total}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.statRow}>
            <Text variant="bodyLarge">30-Day Success Rate</Text>
            <Text variant="headlineMedium" style={styles.statValue}>
              {rate}%
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Edit Form Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            ✏️ Habit Details
          </Text>

          <TextInput
            label="Habit Title"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            disabled={!isEditing || updating}
            style={styles.input}
            maxLength={50}
            error={!!error && !title.trim()}
          />

          <TextInput
            label="Description (Optional)"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={3}
            disabled={!isEditing || updating}
            style={styles.input}
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
                disabled: !isEditing || updating,
              },
              {
                value: 'weekly',
                label: 'Weekly',
                icon: 'calendar-week',
                disabled: !isEditing || updating,
              },
            ]}
            style={styles.input}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {isEditing ? (
            <View style={styles.actions}>
              <Button
                mode="outlined"
                onPress={handleCancelEdit}
                style={styles.button}
                disabled={updating}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSave}
                style={styles.button}
                loading={updating}
                disabled={updating || !title.trim()}
              >
                Save Changes
              </Button>
            </View>
          ) : (
            <Button
              mode="contained"
              onPress={() => setIsEditing(true)}
              style={styles.input}
              icon="pencil"
            >
              Edit Habit
            </Button>
          )}
        </Card.Content>
      </Card>

      {/* Delete Button */}
      <Button
        mode="outlined"
        onPress={handleDelete}
        textColor={colors.delete}
        style={styles.deleteButton}
        icon="delete"
      >
        Delete Habit
      </Button>
    </ScrollView>
  );
};

export default HabitDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statValue: {
    color: colors.orange,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 8,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
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
  deleteButton: {
    marginTop: 16,
    marginBottom: 32,
    borderColor: colors.delete,
  },
});
