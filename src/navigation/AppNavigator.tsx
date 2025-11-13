import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/authStore';

// Import screens (we'll create these next)
import LoginScreen from '../screens/auth/LoginScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import LoansListScreen from '../screens/loans/LoansListScreen';
import LoanDetailScreen from '../screens/loans/LoanDetailScreen';
import CreateLoanScreen from '../screens/loans/CreateLoanScreen';
import EditLoanScreen from '../screens/loans/EditLoanScreen';
import CreateRepaymentScreen from '../screens/repayments/CreateRepaymentScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import TransactionHistoryScreen from '../screens/loans/TransactionHistoryScreen';
import AddTransactionScreen from '../screens/loans/AddTransactionScreen';

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  LoanDetail: { loanId: string };
  CreateLoan: undefined;
  EditLoan: { loanId: string };
  CreateRepayment: { loanId: string };
  EditRepayment: { loanId: string; repaymentId: string };
  TransactionHistory: { loanId: string };
  AddTransaction: { loanId: string };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Loans: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: () => <></>, // We'll add icons later
        }}
      />
      <Tab.Screen
        name="Loans"
        component={LoansListScreen}
        options={{
          tabBarLabel: 'Loans',
          tabBarIcon: () => <></>,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: () => <></>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, initialized } = useAuthStore();

  // Add debug logging
  console.log('AppNavigator - user:', user);
  console.log('AppNavigator - initialized:', initialized);

  if (!initialized) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: true }}>
        {!user ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CreateLoan"
              component={CreateLoanScreen}
              options={{ title: 'Create Loan' }}
            />
            <Stack.Screen
              name="EditLoan"
              component={EditLoanScreen}
              options={{ title: 'Edit Loan' }}
            />
            <Stack.Screen
              name="LoanDetail"
              component={LoanDetailScreen}
              options={{ title: 'Loan Details' }}
            />
            <Stack.Screen
              name="CreateRepayment"
              component={CreateRepaymentScreen}
              options={{ title: 'Record Repayment' }}
            />
            <Stack.Screen
              name="EditRepayment"
              component={CreateRepaymentScreen}
              options={{ title: 'Edit Repayment' }}
            />
            <Stack.Screen
              name="TransactionHistory"
              component={TransactionHistoryScreen}
              options={{ title: 'Transaction History' }}
            />
            <Stack.Screen
              name="AddTransaction"
              component={AddTransactionScreen}
              options={{ title: 'Add Transaction' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

