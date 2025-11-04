import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, List, Divider } from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';

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

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Profile</Text>
          
          <View style={styles.profileInfo}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{appUser?.full_name || 'User'}</Text>
          </View>

          {appUser?.email && (
            <View style={styles.profileInfo}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{appUser.email}</Text>
            </View>
          )}

          {appUser?.phone && (
            <View style={styles.profileInfo}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{appUser.phone}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Preferences</Text>
          
          <List.Item
            title="Currency"
            description={appUser?.settings?.currency || 'USD'}
            left={(props) => <List.Icon {...props} icon="currency-usd" />}
          />
          
          <Divider />
          
          <List.Item
            title="Date Format"
            description={appUser?.settings?.date_format || 'MM/DD/YYYY'}
            left={(props) => <List.Icon {...props} icon="calendar" />}
          />
          
          <Divider />
          
          <List.Item
            title="Notifications"
            description={appUser?.settings?.notifications_enabled ? 'Enabled' : 'Disabled'}
            left={(props) => <List.Icon {...props} icon="bell" />}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Data</Text>
          
          <Button
            mode="outlined"
            onPress={() => Alert.alert('Export Data', 'Export functionality coming soon')}
            style={styles.button}
            icon="download"
          >
            Export All Data
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => Alert.alert('Backup', 'Data is automatically backed up to the cloud')}
            style={styles.button}
            icon="cloud-upload"
          >
            Backup Status
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Account</Text>
          
          <Button
            mode="contained"
            onPress={handleSignOut}
            style={styles.button}
            buttonColor="#f44336"
            icon="logout"
          >
            Sign Out
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => Alert.alert('Delete Account', 'This feature is coming soon')}
            style={styles.button}
            textColor="#f44336"
            icon="delete"
          >
            Delete Account
          </Button>
        </Card.Content>
      </Card>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Loan App v1.0.0</Text>
        <Text style={styles.footerText}>© 2025 All rights reserved</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  profileInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    marginBottom: 12,
  },
  footer: {
    padding: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
});

