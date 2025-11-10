import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, Card, Button, Divider, Modal, Portal, RadioButton } from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';
import { useLoanStore } from '../../store/loanStore';
import { colors, typography, spacing, borderRadius, elevation } from '../../theme';
import { Currency, DateFormat } from '../../types';
import { exportToCSV, exportToJSON, getBackupStatus } from '../../utils/exportData';

export default function SettingsScreen() {
  const { appUser, signOut, updateUserSettings } = useAuthStore();
  const { loans, repayments } = useLoanStore();
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [dateFormatModalVisible, setDateFormatModalVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(appUser?.settings?.notifications_enabled ?? true);

  const handleCurrencyChange = async (currency: Currency) => {
    try {
      await updateUserSettings({ currency });
      setCurrencyModalVisible(false);
      Alert.alert('Success', 'Currency updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update currency');
    }
  };

  const handleDateFormatChange = async (dateFormat: DateFormat) => {
    try {
      await updateUserSettings({ date_format: dateFormat });
      setDateFormatModalVisible(false);
      Alert.alert('Success', 'Date format updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update date format');
    }
  };

  const handleNotificationsToggle = async (enabled: boolean) => {
    try {
      setNotificationsEnabled(enabled);
      await updateUserSettings({ notifications_enabled: enabled });
    } catch (error: any) {
      setNotificationsEnabled(!enabled);
      Alert.alert('Error', error.message || 'Failed to update notifications');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', onPress: () => signOut(), style: 'destructive' },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Choose export format:',
      [
        {
          text: 'CSV',
          onPress: () => {
            try {
              const allRepayments = Object.values(repayments).flat();
              exportToCSV(loans, allRepayments);
              Alert.alert('Success', 'Data exported as CSV file');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to export data');
            }
          },
        },
        {
          text: 'JSON',
          onPress: () => {
            try {
              const allRepayments = Object.values(repayments).flat();
              exportToJSON(loans, allRepayments);
              Alert.alert('Success', 'Data exported as JSON file');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to export data');
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleBackupStatus = () => {
    const backup = getBackupStatus();
    Alert.alert(
      'Backup Status',
      `Status: ${backup.status}\n\nLast Backup: ${backup.lastBackup}\n\nNext Backup: ${backup.nextBackup}\n\n${backup.message}`
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => Alert.alert('Coming Soon', 'Account deletion feature will be available soon.')
        },
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    value, 
    onPress 
  }: { 
    icon: string; 
    title: string; 
    value: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity 
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Text style={styles.settingIconText}>{icon}</Text>
        </View>
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      <Text style={styles.settingValue}>{value}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {appUser?.full_name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{appUser?.full_name || 'User'}</Text>
                {appUser?.email && (
                  <Text style={styles.profileEmail}>{appUser.email}</Text>
                )}
                {appUser?.phone && (
                  <Text style={styles.profilePhone}>{appUser.phone}</Text>
                )}
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <SettingItem
                icon="💵"
                title="Currency"
                value={appUser?.settings?.currency || 'USD'}
                onPress={() => setCurrencyModalVisible(true)}
              />
              <Divider style={styles.divider} />
              <SettingItem
                icon="📅"
                title="Date Format"
                value={appUser?.settings?.date_format || 'MM/DD/YYYY'}
                onPress={() => setDateFormatModalVisible(true)}
              />
              <Divider style={styles.divider} />
              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => handleNotificationsToggle(!notificationsEnabled)}
                activeOpacity={0.7}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.settingIcon}>
                    <Text style={styles.settingIconText}>🔔</Text>
                  </View>
                  <Text style={styles.settingTitle}>Notifications</Text>
                </View>
                <Text style={styles.settingValue}>{notificationsEnabled ? 'Enabled' : 'Disabled'}</Text>
              </TouchableOpacity>
            </Card.Content>
          </Card>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Button
                mode="outlined"
                onPress={handleExportData}
                style={styles.actionButton}
                labelStyle={styles.actionButtonLabel}
                textColor={colors.text.primary}
                icon="download"
              >
                Export All Data
              </Button>
              
              <Button
                mode="outlined"
                onPress={handleBackupStatus}
                style={styles.actionButton}
                labelStyle={styles.actionButtonLabel}
                textColor={colors.text.primary}
                icon="cloud-check"
              >
                Backup Status
              </Button>
            </Card.Content>
          </Card>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Button
                mode="contained"
                onPress={handleSignOut}
                style={styles.signOutButton}
                labelStyle={styles.signOutButtonLabel}
                buttonColor={colors.primary}
                icon="logout"
              >
                Sign Out
              </Button>
              
              <Button
                mode="outlined"
                onPress={handleDeleteAccount}
                style={styles.deleteButton}
                labelStyle={styles.deleteButtonLabel}
                textColor={colors.semantic.error.main}
                icon="delete-forever"
              >
                Delete Account
              </Button>
            </Card.Content>
          </Card>
        </View>

        {/* About Section */}
        <Card style={styles.aboutCard}>
          <Card.Content style={styles.aboutContent}>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutIcon}>📱</Text>
              <View style={styles.aboutInfo}>
                <Text style={styles.aboutTitle}>LoanTracker</Text>
                <Text style={styles.aboutVersion}>Version 1.0.0</Text>
                <Text style={styles.aboutDescription}>
                  Track loans between friends and family with ease
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 LoanTracker</Text>
          <Text style={styles.footerText}>Made with ❤️</Text>
        </View>
        </View>
      </ScrollView>

      {/* Currency Modal */}
      <Portal>
        <Modal visible={currencyModalVisible} onDismiss={() => setCurrencyModalVisible(false)} contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Currency</Text>
          {(['USD', 'EUR', 'INR', 'GBP', 'JPY', 'AUD', 'CAD'] as Currency[]).map((currency) => (
            <TouchableOpacity
              key={currency}
              style={styles.modalOption}
              onPress={() => handleCurrencyChange(currency)}
            >
              <RadioButton
                value={currency}
                status={appUser?.settings?.currency === currency ? 'checked' : 'unchecked'}
                onPress={() => handleCurrencyChange(currency)}
              />
              <Text style={styles.modalOptionText}>{currency}</Text>
            </TouchableOpacity>
          ))}
        </Modal>
      </Portal>

      {/* Date Format Modal */}
      <Portal>
        <Modal visible={dateFormatModalVisible} onDismiss={() => setDateFormatModalVisible(false)} contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Date Format</Text>
          {(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MMM-YYYY'] as DateFormat[]).map((format) => (
            <TouchableOpacity
              key={format}
              style={styles.modalOption}
              onPress={() => handleDateFormatChange(format)}
            >
              <RadioButton
                value={format}
                status={appUser?.settings?.date_format === format ? 'checked' : 'unchecked'}
                onPress={() => handleDateFormatChange(format)}
              />
              <Text style={styles.modalOptionText}>{format}</Text>
            </TouchableOpacity>
          ))}
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  
  // Profile Card
  profileCard: {
    marginBottom: spacing.xl,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    ...elevation.md,
  },
  profileContent: {
    padding: spacing.xl,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  avatarText: {
    ...typography.heading.h1,
    color: colors.text.inverse,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.heading.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  profileEmail: {
    ...typography.body.medium,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  profilePhone: {
    ...typography.body.small,
    color: colors.text.tertiary,
  },
  
  // Sections
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.heading.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  
  // Cards
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    ...elevation.sm,
  },
  cardContent: {
    padding: spacing.lg,
  },
  
  // Setting Items
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingIconText: {
    fontSize: 20,
  },
  settingTitle: {
    ...typography.body.medium,
    color: colors.text.primary,
    flex: 1,
  },
  settingValue: {
    ...typography.body.medium,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  divider: {
    backgroundColor: colors.ui.divider,
  },
  
  // Action Buttons
  actionButton: {
    borderRadius: borderRadius.md,
    borderColor: colors.ui.border,
    marginBottom: spacing.md,
  },
  actionButtonLabel: {
    ...typography.button.medium,
  },
  
  // Account Buttons
  signOutButton: {
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    ...elevation.sm,
  },
  signOutButtonLabel: {
    ...typography.button.medium,
    paddingVertical: spacing.xs,
  },
  deleteButton: {
    borderRadius: borderRadius.md,
    borderColor: colors.semantic.error.border,
  },
  deleteButtonLabel: {
    ...typography.button.medium,
  },
  
  // About Card
  aboutCard: {
    marginTop: spacing.xl,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
  },
  aboutContent: {
    padding: spacing.lg,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aboutIcon: {
    fontSize: 48,
    marginRight: spacing.md,
  },
  aboutInfo: {
    flex: 1,
  },
  aboutTitle: {
    ...typography.heading.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  aboutVersion: {
    ...typography.body.small,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  aboutDescription: {
    ...typography.body.small,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  
  // Footer
  footer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  footerText: {
    ...typography.caption.regular,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },

  // Modal
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
  },
  modalTitle: {
    ...typography.heading.h4,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  modalOptionText: {
    ...typography.body.medium,
    color: colors.text.primary,
    marginLeft: spacing.md,
  },
});