import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, ImageBackground } from 'react-native';
import { auth } from '../services/firebase';
import { sendEmailVerification } from 'firebase/auth';

const VerifyEmailScreen = ({ navigation }) => {
  useEffect(() => {
    const checkEmailVerification = setInterval(async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await currentUser.reload();
        if (currentUser.emailVerified) {
          clearInterval(checkEmailVerification);
          navigation.replace('Home');
        }
      }
    }, 3000); // Kiểm tra mỗi 3 giây

    return () => clearInterval(checkEmailVerification);
  }, []);

  const resendVerificationEmail = async () => {
    try {
      const user = auth.currentUser;
      await sendEmailVerification(user);
      Alert.alert('Success', 'Verification email has been resent.');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleLogout = () => {
    auth.signOut()
      .then(() => navigation.replace('Login'))
      .catch(error => Alert.alert('Error', error.message));
  };

  return (
    <ImageBackground source={require('../assets/background.png')} style={styles.container}>
      <Text style={styles.text}>Vui lòng kiểm tra email của bạn để xác thực tài khoản.</Text>
      <Button title="Gửi lại email xác thực" onPress={resendVerificationEmail} />
      <Button title="Đăng Nhập" onPress={handleLogout} color="red" />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  text: { fontSize: 18, marginBottom: 20, textAlign: 'center' },
});

export default VerifyEmailScreen;
