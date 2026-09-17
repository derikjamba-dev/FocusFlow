import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryProvider } from './src/providers/query-provider';
import { COLORS } from './src/theme';
import DashboardScreen from './src/screens/DashboardScreen';
import TasksScreen from './src/screens/TasksScreen';
import SessionsScreen from './src/screens/SessionsScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import TimerScreen from './src/screens/TimerScreen';
import BlocklistScreen from './src/screens/BlocklistScreen';
import NewTaskScreen from './src/screens/NewTaskScreen';
import Ionicons from '@expo/vector-icons/Ionicons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TITLE_COLORS: Record<string, string> = {
  Dashboard: COLORS.accent,
  Tasks: COLORS.blue,
  Focus: COLORS.purple,
  Sessions: COLORS.accent,
  Analytics: COLORS.amber,
};

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({
  focused,
  active,
  inactive,
  size,
  color,
}: {
  focused: boolean;
  active: IoniconName;
  inactive: IoniconName;
  size: number;
  color: string;
}) {
  return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
}

function tabIcon(active: IoniconName, inactive: IoniconName) {
  return ({ focused, size, color }: { focused: boolean; size: number; color: string }) => (
    <TabIcon focused={focused} active={active} inactive={inactive} size={size} color={color} />
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: COLORS.bg },
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontWeight: '700' },
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: TITLE_COLORS[route.name] ?? COLORS.accent,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarIcon: tabIcon('grid', 'grid-outline') }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{ tabBarIcon: tabIcon('checkbox', 'checkbox-outline') }}
      />
      <Tab.Screen
        name="Focus"
        component={TimerScreen}
        options={{
          headerShown: false,
          tabBarIcon: tabIcon('timer', 'timer-outline'),
        }}
      />
      <Tab.Screen
        name="Sessions"
        component={SessionsScreen}
        options={{ tabBarIcon: tabIcon('hourglass', 'hourglass-outline') }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{ tabBarIcon: tabIcon('bar-chart', 'bar-chart-outline') }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <QueryProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: COLORS.card },
              headerTintColor: COLORS.text,
              contentStyle: { backgroundColor: COLORS.bg },
            }}
          >
            <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen
              name="Blocklist"
              component={BlocklistScreen}
              options={{ title: 'Apps bloqueadas', presentation: 'modal' }}
            />
            <Stack.Screen
              name="NewTask"
              component={NewTaskScreen}
              options={{ title: 'New Task', presentation: 'modal' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </QueryProvider>
  );
}