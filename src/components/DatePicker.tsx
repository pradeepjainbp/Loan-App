import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import { colors, typography, spacing, borderRadius } from '../theme';

interface DatePickerProps {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  error?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
}

export default function DatePicker({
  label,
  value,
  onChange,
  error,
  minDate,
  maxDate,
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const onDismiss = () => {
    setOpen(false);
  };

  const onConfirm = ({ date }: { date: Date | undefined }) => {
    setOpen(false);
    if (date) {
      onChange(date);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => !disabled && setOpen(true)} disabled={disabled}>
        <TextInput
          label={label}
          value={formatDate(value)}
          editable={false}
          right={<TextInput.Icon icon="calendar" />}
          error={!!error}
          mode="outlined"
          style={styles.input}
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
          disabled={disabled}
          pointerEvents="none"
        />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      <DatePickerModal
        locale="en"
        mode="single"
        visible={open}
        onDismiss={onDismiss}
        date={value || undefined}
        onConfirm={onConfirm}
        validRange={
          minDate || maxDate
            ? {
                startDate: minDate,
                endDate: maxDate,
              }
            : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.md,
  },
});

