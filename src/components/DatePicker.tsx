import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Text, TextInput, Modal, Portal, Button } from 'react-native-paper';
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
  const [selectedDate, setSelectedDate] = useState<Date>(value || new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(value || new Date());

  const isWeb = Platform.OS === 'web';

  const onDismiss = () => {
    setOpen(false);
  };

  const onConfirm = ({ date }: { date: Date | undefined }) => {
    setOpen(false);
    if (date) {
      onChange(date);
    }
  };

  const handleWebDateChange = (date: Date) => {
    setSelectedDate(date);
    onChange(date);
    setOpen(false);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Set reasonable year range (last 100 years to next 50 years)
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 100;
  const endYear = currentYear + 50;

  // For web, use native HTML date input
  if (isWeb) {
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

        <Portal>
          <Modal visible={open} onDismiss={onDismiss} contentContainerStyle={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity onPress={onDismiss}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dateInputContainer}>
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  setSelectedDate(newDate);
                }}
                min={minDate?.toISOString().split('T')[0]}
                max={maxDate?.toISOString().split('T')[0]}
                style={styles.nativeDateInput}
              />
            </View>

            <View style={styles.modalButtons}>
              <Button mode="outlined" onPress={onDismiss}>
                Cancel
              </Button>
              <Button mode="contained" onPress={() => handleWebDateChange(selectedDate)}>
                Confirm
              </Button>
            </View>
          </Modal>
        </Portal>
      </View>
    );
  }

  // For mobile, use DatePickerModal
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
        date={value || new Date()}
        onConfirm={onConfirm}
        startYear={startYear}
        endYear={endYear}
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
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    margin: spacing.lg,
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.heading.h4,
    color: colors.text.primary,
  },
  closeButton: {
    fontSize: 24,
    color: colors.text.secondary,
    padding: spacing.sm,
  },
  dateInputContainer: {
    marginBottom: spacing.lg,
  },
  nativeDateInput: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.ui.border,
    borderRadius: borderRadius.md,
    fontSize: 16,
    fontFamily: 'System',
    width: '100%',
    boxSizing: 'border-box',
  } as any,
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'flex-end',
  },
});

