import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { auth } from './src/services/firebase';
import { ActivityIndicator, View } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import BottomTabNavigator from './src/navigators/BottomTabNavigator';
import VerifyEmailScreen from './src/screens/VerifyEmailScreen';
import AddPlanScreen from './src/screens/AddPlanScreen'; // Import màn hình Thêm kế hoạch

const Stack = createStackNavigator();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          user.emailVerified ? (
            <Stack.Screen
              name="Main"
              component={BottomTabNavigator} // Sử dụng BottomTabNavigator
              options={{ headerShown: false }}
            />
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
        <Stack.Screen
          name="AddPlan"
          component={AddPlanScreen} // Thêm màn hình Thêm kế hoạch
          options={{ title: 'Thêm Kế Hoạch' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
