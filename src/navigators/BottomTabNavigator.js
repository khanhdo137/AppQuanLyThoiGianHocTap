import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DrawerNavigator from './DrawerNavigator'; // Import DrawerNavigator
import AddPlanScreen from '../screens/AddPlanScreen';

const Tab = createBottomTabNavigator();

const NotificationsScreen = () => <DrawerNavigator />;
const CalendarScreen = () => <DrawerNavigator />;

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Notifications':
              iconName = 'notifications';
              break;
            case 'Statistics':
              iconName = 'bar-chart';
              break;
            case 'Calendar':
              iconName = 'calendar';
              break;
            case 'Settings':
              iconName = 'settings';
              break;
            default:
              iconName = 'home'; // Mặc định cho Home
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Thông báo' }} />
      <Tab.Screen name="Statistics" component={StatisticsScreen} options={{ title: 'Quản lý' }} />
      <Tab.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Lịch' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Cài đặt' }} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
