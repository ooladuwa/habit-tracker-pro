import React from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import {
  Text,
  Button,
  Card,
  IconButton,
  FAB,
  ActivityIndicator,
} from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';
import { useHabits } from '../hooks/useHabits';
import { Habit } from '../types';
import { colors } from '../constants/colors';

export default function HomeScreen() {
  const { user, signOut, loading: authLoading } = useAuth();
  const {
    habits,
    loading,
    error,
    refreshHabits,
    deleteHabit,
    toggleCompletion,
  } = useHabits();

  // get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

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
    const isCompletedToday = item.completedDates.includes(today);

    return (
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <View style={styles.habitHeader}>
            <View style={styles.habitInfo}>
              <Text variant="titleMedium">{item.title}</Text>
              {item.description ? (
                <Text variant="bodySmall" style={styles.description}>
                  {item.description}
                </Text>
              ) : null}
              <Text variant="bodySmall" style={styles.frequency}>
                {item.frequency === 'daily' ? '📅 Daily' : '📆 Weekly'}
              </Text>
            </View>

            <View style={styles.actions}>
              <IconButton
                icon={isCompletedToday ? 'check-circle' : 'circle-outline'}
                size={32}
                iconColor={
                  isCompletedToday ? colors.completed : colors.incomplete
                }
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
          // TODO: Navigate to AddHabit screen (Day 4)
          console.log('Navigate to Add Habit screen');
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
  description: {
    marginTop: 4,
    opacity: 0.7,
  },
  frequency: {
    marginTop: 8,
    opacity: 0.6,
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
