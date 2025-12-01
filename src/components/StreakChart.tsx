import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { BarChart } from 'react-native-gifted-charts';
import { getDateDaysAgo } from '../utils/dateHelpers';
import { CHART_CONFIG, SPACING } from '../constants/theme';

interface StreakChartProps {
  completedDates: string[];
  frequency: 'daily' | 'weekly';
}

const StreakChart = ({ completedDates }: StreakChartProps) => {
  const [hasError, setHasError] = React.useState(false);

  const chartData = React.useMemo(() => {
    try {
      const data = [];

      // Generate data for the last N days
      for (
        let daysAgo = CHART_CONFIG.DAYS_TO_SHOW - 1;
        daysAgo >= 0;
        daysAgo--
      ) {
        const date = getDateDaysAgo(daysAgo);
        const isCompleted = completedDates.includes(date);
        const dateObj = new Date(date);
        const dayLabel = dateObj.toLocaleDateString('en-US', {
          weekday: 'narrow',
        });

        data.push({
          value: isCompleted ? 1 : 0,
          label: dayLabel,
          frontColor: isCompleted
            ? CHART_CONFIG.COMPLETED_COLOR
            : CHART_CONFIG.INCOMPLETE_COLOR,
          spacing: SPACING.xs,
        });
      }

      return data;
    } catch (error) {
      console.error('Error generating chart data:', error);
      setHasError(true);
      return [];
    }
  }, [completedDates]);

  if (hasError || chartData.length === 0) {
    return (
      <View style={styles.container}>
        <Text variant="labelMedium" style={styles.title}>
          Last {CHART_CONFIG.DAYS_TO_SHOW} Days
        </Text>
        <Text variant="bodySmall" style={styles.errorText}>
          Unable to load chart
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="labelMedium" style={styles.title}>
        Last {CHART_CONFIG.DAYS_TO_SHOW} Days
      </Text>
      <View style={styles.chartContainer}>
        <BarChart
          data={chartData}
          barWidth={CHART_CONFIG.BAR_WIDTH}
          height={CHART_CONFIG.CHART_HEIGHT}
          noOfSections={1}
          maxValue={1}
          hideYAxisText
          hideRules
          xAxisThickness={0}
          yAxisThickness={0}
          showGradient={false}
          barBorderRadius={CHART_CONFIG.BAR_BORDER_RADIUS}
          spacing={CHART_CONFIG.BAR_SPACING}
        />
      </View>
    </View>
  );
};

export default StreakChart;

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  title: {
    marginBottom: SPACING.sm,
    opacity: 0.7,
  },
  chartContainer: {
    paddingHorizontal: SPACING.sm,
  },
  errorText: {
    opacity: 0.6,
    fontStyle: 'italic',
  },
});
