// src/screens/RegisterScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { auth, firestore } from '../services/firebase';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if(email === '' || password === '') {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    try {
      // Tạo người dùng mới
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = userCredential.user;

      // Tạo document người dùng trong Firestore với ID là uid
      await setDoc(doc(firestore, 'users', uid), {
        email: email,
        displayName: '', // Bạn có thể thêm trường này sau khi người dùng cập nhật
        createdAt: serverTimestamp(),
      });

      // Gửi email xác thực
      await sendEmailVerification(userCredential.user);

      Alert.alert(
        'Success',
        'Account created successfully! Please check your email to verify your account.',
        [
          { text: 'OK' }
        ]
      );

      // Không cần chuyển hướng đến 'Login' vì người dùng vẫn đang đăng nhập
      // Hãy để App.js xử lý việc chuyển hướng đến 'VerifyEmail' nếu email chưa được xác thực
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng Ký</Text>
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
      <Button title="Đăng Ký" onPress={handleRegister} />
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Đã có tài khoản? Đăng nhập</Text>
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

export default RegisterScreen;
