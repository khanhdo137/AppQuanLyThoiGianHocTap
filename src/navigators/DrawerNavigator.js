import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { Alert } from 'react-native';
import { auth } from '../services/firebase';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        Alert.alert('Đăng xuất', 'Bạn đã đăng xuất thành công.');
        props.navigation.replace('Login');
      })
      .catch(error => {
        Alert.alert('Lỗi', error.message);
      });
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItem label="Home" onPress={() => props.navigation.navigate('Home')} />
      <DrawerItem label="Profile" onPress={() => props.navigation.navigate('Profile')} />
      <DrawerItem label="Settings" onPress={() => props.navigation.navigate('Settings')} />
      <DrawerItem label="Đăng Xuất" onPress={handleLogout} />
    </DrawerContentScrollView>
  );
};

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
