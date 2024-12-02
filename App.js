import 'react-native-gesture-handler';
import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { auth } from './src/services/firebase';
import { ActivityIndicator, View, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import BottomTabNavigator from './src/navigators/BottomTabNavigator'; // Sử dụng BottomTabNavigator
import VerifyEmailScreen from './src/screens/VerifyEmailScreen';
import AddPlanScreen from './src/screens/AddPlanScreen';
import PlanDetailScreen from './src/screens/PlanDetailScreen';
import DailyPlanScreen from './src/screens/DailyPlanScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createStackNavigator();

// Cấu hình deep linking
const prefix = Linking.createURL('/');

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigationRef = useRef();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
      setIsLoading(false);
    });

    const requestPermissions = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert('Cần Quyền Thông Báo', 'Bạn cần cấp quyền thông báo để sử dụng tính năng này.');
        }
      }
    };

    requestPermissions();

    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {});

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      const { planId } = response.notification.request.content.data;
      if (planId && navigationRef.current) {
        navigationRef.current.navigate('PlanDetail', { planId });
      }
    });

    return () => {
      unsubscribe();
      foregroundSubscription.remove();
      responseListener.remove();
    };
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={{
        prefixes: [prefix],
        config: {
          screens: {
            Main: {
              screens: {
                Home: 'home',
                Notifications: 'notifications',
                Statistics: 'statistics',
                Calendar: 'calendar',
                Settings: 'settings',
              },
            },
            AddPlan: 'add-plan',
            PlanDetail: 'plan/:planId',
            VerifyEmail: 'verify-email',
            Login: 'login',
            Register: 'register',
          },
        },
      }}
    >
      <Stack.Navigator>
        {user ? (
          user.emailVerified ? (
            <>
              <Stack.Screen
                name="Main"
                component={BottomTabNavigator} // Sử dụng BottomTabNavigator thay vì DrawerNavigator
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="AddPlan"
                component={AddPlanScreen} // Thêm màn hình Thêm kế hoạch
                options={{ title: 'Thêm Kế Hoạch' }}
              />
              <Stack.Screen
                name="DailyPlan"
                component={DailyPlanScreen}
                options={{ title: 'Lịch Theo Ngày' }}
              />
              <Stack.Screen
                name="PlanDetail"
                component={PlanDetailScreen} // Thêm màn hình Chi tiết kế hoạch
                options={{ title: 'Chi Tiết Kế Hoạch' }}
              />
              <Stack.Screen
                name="Profile"
                component={ProfileScreen} // Thêm màn hình Profile
                options={{ title: 'Thông tin người dùng' }}
              />
            </>
          ) : (
            <Stack.Screen
              name="VerifyEmail"
              component={VerifyEmailScreen}
              options={{ headerShown: false }}
            />
          )
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: 'Đăng Ký' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
