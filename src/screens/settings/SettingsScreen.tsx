import React from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, Card, Button, Divider } from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';
import { colors, typography, spacing, borderRadius, elevation } from '../../theme';

export default function SettingsScreen() {
  const { appUser, signOut } = useAuthStore();

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
    Alert.alert('Export Data', 'Export functionality coming soon');
  };

  const handleBackupStatus = () => {
    Alert.alert('Backup Status', 'Your data is automatically backed up to the cloud and synced across all your devices.');
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
              />
              <Divider style={styles.divider} />
              <SettingItem
                icon="📅"
                title="Date Format"
                value={appUser?.settings?.date_format || 'MM/DD/YYYY'}
              />
              <Divider style={styles.divider} />
              <SettingItem
                icon="🔔"
                title="Notifications"
                value={appUser?.settings?.notifications_enabled ? 'Enabled' : 'Disabled'}
              />
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
});