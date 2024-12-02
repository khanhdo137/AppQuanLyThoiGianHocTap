import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert, Image, ImageBackground, Modal } from 'react-native';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { StackActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // Thư viện icon

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // Trạng thái hiện/ẩn mật khẩu
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false); // Trạng thái modal quên mật khẩu
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState(''); // Email cho chức năng quên mật khẩu

  const handleLogin = async () => {
    if (email === '' || password === '') {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (userCredential.user.emailVerified) {
        navigation.replace('Main');
      } else {
        Alert.alert(
          'Email chưa được xác thực',
          'Vui lòng kiểm tra email của bạn để xác thực tài khoản.',
          [{ text: 'OK', onPress: () => auth.signOut() }]
        );
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleForgotPassword = () => {
    auth.sendPasswordResetEmail(forgotPasswordEmail)
      .then(() => {
        Alert.alert('Thành công', 'Email đặt lại mật khẩu đã được gửi!');
        setForgotPasswordEmail('');
        setShowForgotPasswordModal(false);
      })
      .catch((error) => {
        Alert.alert('Lỗi', error.message);
      });
  };

  return (
    <ImageBackground 
      source={require('../assets/background.png')} // Đường dẫn đến hình ảnh background
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Logo */}
        <Image source={require('../assets/logo.png')} style={styles.logo} />

        <Text style={styles.title}>Đăng Nhập</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#aaa" // Thay đổi màu placeholder
        />
        
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible} // Thay đổi trạng thái hiển thị mật khẩu
            placeholderTextColor="#aaa" // Thay đổi màu placeholder
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Ionicons name={isPasswordVisible ? 'eye-off' : 'eye'} size={24} color="gray" />
          </TouchableOpacity>
        </View>

        <Button title="Đăng Nhập" onPress={handleLogin} />
        
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Chưa có tài khoản? Đăng ký</Text>
        </TouchableOpacity>

        {/* Nút Quên Mật Khẩu */}
        <TouchableOpacity onPress={() => setShowForgotPasswordModal(true)}>
          <Text style={styles.link}>Quên mật khẩu?</Text>
        </TouchableOpacity>
      </View>

      {/* Modal cho chức năng quên mật khẩu */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showForgotPasswordModal}
        onRequestClose={() => setShowForgotPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TextInput
              placeholder="Nhập email để đặt lại mật khẩu"
              value={forgotPasswordEmail}
              onChangeText={setForgotPasswordEmail}
              style={styles.input}
            />
            <Button title="Gửi email đặt lại mật khẩu" onPress={handleForgotPassword} />
            <Button title="Đóng" onPress={() => setShowForgotPasswordModal(false)} color="#FF0000" />
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Nền trắng với độ trong suốt
    borderRadius: 10,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  passwordContainer: {
    position: 'relative', // Để icon có thể đặt bên trong ô nhập
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: 7, // Căn giữa icon
  },
  link: {
    color: 'blue',
    marginTop: 15,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
});

export default LoginScreen;
