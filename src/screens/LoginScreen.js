import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { StackActions } from '@react-navigation/native';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (email === '' || password === '') {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (userCredential.user.emailVerified) {
        // Điều hướng đến Drawer Navigator
        navigation.replace('Drawer');
        // Hoặc sử dụng StackActions nếu cần:
        // navigation.dispatch(StackActions.replace('Drawer'));
      } else {
        Alert.alert(
          'Email chưa được xác thực',
          'Vui lòng kiểm tra email của bạn để xác thực tài khoản.',
          [
            { text: 'OK', onPress: () => auth.signOut() }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng Nhập</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Đăng Nhập" onPress={handleLogin} />
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Chưa có tài khoản? Đăng ký</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 12, paddingHorizontal: 10 },
  link: { color: 'blue', marginTop: 15, textAlign: 'center' },
});

export default LoginScreen;
