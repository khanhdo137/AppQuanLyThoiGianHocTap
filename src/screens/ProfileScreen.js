import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import { firestore, auth } from '../services/firebase';

const ProfileScreen = () => {
  const user = auth.currentUser;
  const [birthDate, setBirthDate] = useState('');
  const [age, setAge] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const doc = await firestore.collection('users').doc(user.uid).get();
        if (doc.exists) {
          const data = doc.data();
          setBirthDate(data.birthDate || '');
          setAge(data.age || '');
          setPhoneNumber(data.phoneNumber || '');
        }
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể tải thông tin người dùng: ' + error.message);
      }
    };

    fetchUserData();
  }, [user.uid]);

  const handleSave = async () => {
    try {
      await firestore.collection('users').doc(user.uid).set({
        birthDate,
        age,
        phoneNumber,
      }, { merge: true });
      Alert.alert('Thông báo', 'Thông tin đã được lưu!');
      setIsEditing(false); // Đóng form chỉnh sửa sau khi lưu
    } catch (error) {
      Alert.alert('Lỗi', 'Lỗi lưu thông tin: ' + error.message);
    }
  };

  return (
    <ImageBackground 
      source={require('../assets/background.png')} // Đường dẫn đến hình ảnh background
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.title}>Thông Tin Người Dùng</Text>
        <Text>Email: {user.email}</Text>
        <Text>Ngày Đăng Ký: {new Date(user.metadata.creationTime).toLocaleDateString()}</Text>
        
        {isEditing ? (
          <>
            <TextInput
              placeholder="Ngày Sinh (dd/mm/yyyy)"
              value={birthDate}
              onChangeText={setBirthDate}
              style={styles.input}
            />
            <TextInput
              placeholder="Tuổi"
              value={age}
              onChangeText={setAge}
              style={styles.input}
              keyboardType="numeric"
            />
            <TextInput
              placeholder="Số Điện Thoại"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              style={styles.input}
              keyboardType="phone-pad"
            />
            <TouchableOpacity style={styles.button} onPress={handleSave}>
              <Text style={styles.buttonText}>Lưu Thông Tin</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text>Ngày Sinh: {birthDate || 'Chưa có'}</Text>
            <Text>Tuổi: {age || 'Chưa có'}</Text>
            <Text>Số Điện Thoại: {phoneNumber || 'Chưa có'}</Text>
            <TouchableOpacity style={styles.button} onPress={() => setIsEditing(true)}>
              <Text style={styles.buttonText}>Chỉnh Sửa Thông Tin</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
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
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
