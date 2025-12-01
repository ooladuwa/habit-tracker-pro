import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, IconButton, Badge } from 'react-native-paper';
import { Habit } from '../types';
import { calculateStreak } from '../utils/streakCalculator';
import { getTodayString } from '../utils/dateHelpers';
import { colors, SPACING, SIZES } from '../constants/theme';

interface HabitCardProps {
  habit: Habit;
  onToggle: () => void;
  showCheckbox?: boolean;
}

const HabitCard = ({
  habit,
  onToggle,
  showCheckbox = true,
}: HabitCardProps) => {
  const today = getTodayString();
  const isCompletedToday = habit.completedDates.includes(today);
  const streak = calculateStreak(habit.completedDates, habit.frequency);

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <View style={styles.habitHeader}>
          <View style={styles.habitInfo}>
            <View style={styles.titleRow}>
              <Text variant="titleMedium">{habit.title}</Text>
              {streak > 0 && (
                <Badge style={styles.badge} size={SIZES.badge}>
                  {`🔥 ${streak}`}
                </Badge>
              )}
            </View>
            {habit.description ? (
              <Text variant="bodySmall" style={styles.description}>
                {habit.description}
              </Text>
            ) : null}
            <View style={styles.metaRow}>
              <Text variant="bodySmall" style={styles.frequency}>
                {habit.frequency === 'daily' ? '📅 Daily' : '📅 Weekly'}
              </Text>
              {streak > 0 && (
                <Text variant="bodySmall" style={styles.streakText}>
                  Streak: {streak}{' '}
                  {habit.frequency === 'daily' ? 'days' : 'weeks'}
                </Text>
              )}
            </View>
          </View>
          {showCheckbox && (
            <IconButton
              icon={isCompletedToday ? 'check-circle' : 'circle-outline'}
              size={SIZES.icon.large}
              iconColor={
                isCompletedToday ? colors.completed : colors.incomplete
              }
              onPress={onToggle}
            />
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

export default HabitCard;

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.xs + 2,
    backgroundColor: colors.white,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  habitInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  badge: {
    backgroundColor: colors.badge,
  },
  description: {
    opacity: 0.7,
    marginBottom: SPACING.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  frequency: {
    opacity: 0.6,
  },
  streakText: {
    color: colors.orange,
    fontWeight: '600',
  },
});
