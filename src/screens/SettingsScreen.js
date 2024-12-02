import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Switch, Alert, ImageBackground, TextInput, Button, Modal, PermissionsAndroid } from 'react-native';
import { auth } from '../services/firebase';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const SettingsScreen = ({ navigation }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const user = auth.currentUser;
  const [avatarUri, setAvatarUri] = useState(user.photoURL || null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const storage = getStorage();

  const requestStoragePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Cấp quyền truy cập bộ nhớ',
          message: 'Ứng dụng cần quyền truy cập bộ nhớ để chọn ảnh.',
          buttonNeutral: 'Hủy',
          buttonNegative: 'Không',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const handleChooseAvatar = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert('Không có quyền truy cập bộ nhớ');
      return;
    }

    launchImageLibrary({ mediaType: 'photo', quality: 1 }, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const source = response.assets[0].uri; // Lấy URI của ảnh
        setAvatarUri(source);

        // Tải ảnh lên Firebase Storage
        const blob = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = () => {
            resolve(xhr.response);
          };
          xhr.onerror = () => {
            reject(new TypeError('Failed to convert image to blob.'));
          };
          xhr.responseType = 'blob';
          xhr.open('GET', source, true);
          xhr.send();
        });

        const storageRef = ref(storage, `avatars/${user.uid}`);
        uploadBytes(storageRef, blob).then(() => {
          console.log('Uploaded a blob or file!');
          getDownloadURL(storageRef).then((downloadURL) => {
            // Cập nhật photoURL cho người dùng
            user.updateProfile({ photoURL: downloadURL })
              .then(() => {
                Alert.alert('Thành công', 'Avatar đã được cập nhật.');
              })
              .catch((error) => {
                Alert.alert('Lỗi', error.message);
              });
          });
        });
      }
    });
  };

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        Alert.alert('Đăng xuất', 'Bạn đã đăng xuất thành công.');
      })
      .catch((error) => {
        Alert.alert('Lỗi', error.message);
      });
  };

  return (
    <ImageBackground 
      source={require('../assets/background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <View style={styles.avatarContainer}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <TouchableOpacity style={styles.addAvatarButton} onPress={handleChooseAvatar}>
              <Text style={styles.addAvatarText}>+</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.settingsContainer}>
          <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.settingText}>Xem thông tin người dùng</Text>
          </TouchableOpacity>
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Chuyển chế độ sáng/tối</Text>
            <Switch
              value={isDarkMode}
              onValueChange={(value) => {
                setIsDarkMode(value);
                Alert.alert('Thông báo', value ? 'Chế độ tối đã được bật' : 'Chế độ sáng đã được bật');
              }}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Bật/Tắt thông báo</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />
          </View>
          <TouchableOpacity style={styles.changePasswordButton} onPress={() => setShowPasswordChange(true)}>
            <Text style={styles.settingText}>Đổi mật khẩu</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
            <Text style={styles.settingText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>

        {/* Modal cho form đổi mật khẩu */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showPasswordChange}
          onRequestClose={() => setShowPasswordChange(false)} 
        >
          <View style={styles.modalOverlay}>
            <View style={styles.passwordChangeContainer}>
              {/* Các trường nhập liệu đổi mật khẩu */}
              <Button title="Đóng" onPress={() => setShowPasswordChange(false)} color="#FF0000" />
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  addAvatarButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addAvatarText: {
    color: '#fff',
    fontSize: 24,
  },
  settingsContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    width: '100%', 
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingText: {
    fontSize: 16,
  },
  changePasswordButton: {
    marginTop: 10,
    paddingVertical: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  passwordChangeContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
});

export default SettingsScreen;
