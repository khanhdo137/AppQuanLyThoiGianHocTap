import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import CalendarScreen from '../screens/CalendarScreen';
import { firestore, auth } from '../services/firebase';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const [notificationCount, setNotificationCount] = useState(0);

  const fetchNotificationCount = async () => {
    try {
      const userPlansRef = firestore
        .collection('users')
        .doc(auth.currentUser.uid)
        .collection('plans');
      const snapshot = await userPlansRef.where('startTime', '>', new Date()).get();
      const plans = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      }));
      const count = plans.filter(plan => {
        const startTime = plan.startTime.toDate();
        return startTime <= new Date(Date.now() + 60 * 60 * 1000); // Trong 1 giờ tới
      }).length;
      setNotificationCount(count);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  useEffect(() => {
    // Lấy số đếm thông báo khi component được mount
    fetchNotificationCount();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const iconName = getIconName(route.name);
          return (
            <View>
              <Ionicons name={iconName} size={size} color={color} />
              {route.name === 'Notifications' && notificationCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{notificationCount}</Text>
                </View>
              )}
            </View>
          );
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen
        name="Notifications"
        options={{ title: 'Thông báo' }}
        children={(props) => (
          <NotificationsScreen {...props} setNotificationCount={setNotificationCount} />
        )}
      />
      <Tab.Screen name="Statistics" component={StatisticsScreen} options={{ title: 'Quản lý' }} />
      <Tab.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Lịch' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Cài đặt' }} />
    </Tab.Navigator>
  );
};

// Hàm để lấy tên icon dựa trên tên route
const getIconName = (routeName) => {
  switch (routeName) {
    case 'Home':
      return 'home';
    case 'Notifications':
      return 'notifications';
    case 'Statistics':
      return 'bar-chart';
    case 'Calendar':
      return 'calendar';
    case 'Settings':
      return 'settings';
    default:
      return 'home';
  }
};

const styles = {
  badge: {
    position: 'absolute',
    right: 0,
    top: -4,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
  },
};

export default BottomTabNavigator;