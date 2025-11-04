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
import CreateRepaymentScreen from '../screens/repayments/CreateRepaymentScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  LoanDetail: { loanId: string };
  CreateLoan: undefined;
  CreateRepayment: { loanId: string };
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
          tabBarIcon: ({ color }) => <></>, // We'll add icons later
        }}
      />
      <Tab.Screen 
        name="Loans" 
        component={LoansListScreen}
        options={{
          tabBarLabel: 'Loans',
          tabBarIcon: ({ color }) => <></>,
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => <></>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, initialized } = useAuthStore();

  if (!initialized) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen 
              name="LoanDetail" 
              component={LoanDetailScreen}
              options={{ headerShown: true, title: 'Loan Details' }}
            />
            <Stack.Screen 
              name="CreateLoan" 
              component={CreateLoanScreen}
              options={{ headerShown: true, title: 'Create Loan' }}
            />
            <Stack.Screen 
              name="CreateRepayment" 
              component={CreateRepaymentScreen}
              options={{ headerShown: true, title: 'Record Repayment' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

