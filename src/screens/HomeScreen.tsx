import React from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import {
  Text,
  Button,
  Card,
  IconButton,
  FAB,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';
import { useHabits } from '../hooks/useHabits';
import { Habit } from '../types';
import { colors } from '../constants/colors';
import { AppStackParamList } from '../types';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import {
  calculateStreak,
  isCompletedToday,
  formatStreak,
} from '../utils/streakCalculator';
import { getTodayString } from '../utils/dateHelpers';

type HomeScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user, signOut, loading: authLoading } = useAuth();
  const {
    habits,
    loading,
    error,
    refreshHabits,
    deleteHabit,
    toggleCompletion,
  } = useHabits();

  // get today's date
  const today = getTodayString();

  const handleToggleCompletion = async (habitId: string) => {
    try {
      await toggleCompletion(habitId, today);
    } catch (error) {
      console.error('Error toggling completion:', error);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      await deleteHabit(habitId);
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  const renderHabitItem = ({ item }: { item: Habit }) => {
    const isCompleted = isCompletedToday(item.completedDates);
    const streak = calculateStreak(item.completedDates, item.frequency);

    return (
      <Card
        style={styles.card}
        mode="elevated"
        onPress={() => navigation.navigate('HabitDetail', { habitId: item.id })}
      >
        <Card.Content>
          <View style={styles.habitHeader}>
            <View style={styles.habitInfo}>
              <View style={styles.titleRow}>
                <Text variant="titleMedium">{item.title}</Text>
                {streak > 0 && (
                  <Chip
                    mode="flat"
                    style={styles.badge}
                    textStyle={styles.badgeText}
                  >
                    🔥 {streak}
                  </Chip>
                )}
              </View>
              {item.description ? (
                <Text variant="bodySmall" style={styles.description}>
                  {item.description}
                </Text>
              ) : null}
              <View style={styles.metaRow}>
                <Text variant="bodySmall" style={styles.frequency}>
                  {item.frequency === 'daily' ? '📅 Daily' : '📆 Weekly'}
                </Text>
                {streak > 0 && (
                  <Text variant="bodySmall" style={styles.streakText}>
                    Streak: {formatStreak(streak, item.frequency)}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.actions}>
              <IconButton
                icon={isCompleted ? 'check-circle' : 'circle-outline'}
                size={32}
                iconColor={isCompleted ? colors.completed : colors.incomplete}
                onPress={() => handleToggleCompletion(item.id)}
              />
              <IconButton
                icon="delete"
                size={20}
                iconColor={colors.delete}
                onPress={() => handleDeleteHabit(item.id)}
              />
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No habits yet
      </Text>
      <Text variant="bodyMedium" style={styles.emptyText}>
        Tap the + button to create your first habit
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading habits...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text variant="titleMedium">Welcome back!</Text>
          <Text variant="bodySmall" style={styles.email}>
            {user?.email}
          </Text>
        </View>
        <Button
          mode="outlined"
          onPress={signOut}
          loading={authLoading}
          disabled={authLoading}
          compact
        >
          Sign Out
        </Button>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={habits}
        renderItem={renderHabitItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshHabits} />
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          navigation.navigate('AddHabit');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
  },
  email: {
    marginTop: 4,
    opacity: 0.7,
  },
  errorBanner: {
    backgroundColor: colors.mediumGray,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.mediumRed,
  },
  errorText: {
    color: colors.error,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    marginBottom: 12,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  habitInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: colors.orange,
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
  },
  description: {
    marginTop: 4,
    opacity: 0.7,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 16,
  },
  frequency: {
    marginTop: 8,
    opacity: 0.6,
  },
  streakText: {
    color: colors.orange,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    marginBottom: 8,
  },
  emptyText: {
    opacity: 0.7,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
