import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Switch, ImageBackground, TouchableOpacity } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import * as Notifications from 'expo-notifications';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { firestore, auth } from '../services/firebase';

const AddPlanScreen = ({ route, navigation }) => {
  const plan = route.params?.plan;
  const isEdit = !!plan;

  const [title, setTitle] = useState(plan ? plan.title : '');
  const [description, setDescription] = useState(plan ? plan.description : '');
  const [startTime, setStartTime] = useState(plan ? plan.startTime.toDate() : new Date());
  const [endTime, setEndTime] = useState(plan ? plan.endTime.toDate() : new Date());
  const [isStartPickerVisible, setStartPickerVisibility] = useState(false);
  const [isEndPickerVisible, setEndPickerVisibility] = useState(false);
  const [isCompleted, setIsCompleted] = useState(plan ? plan.status === 'completed' : false);
  const [notificationId, setNotificationId] = useState(plan ? plan.notificationId : null);

  const handleSave = async () => {
    if (title.trim() === '') {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề kế hoạch.');
      return;
    }

    if (endTime <= startTime) {
      Alert.alert('Lỗi', 'Giờ kết thúc phải sau giờ bắt đầu.');
      return;
    }

    const notificationTime = new Date(startTime.getTime() - 60 * 60 * 1000); // 1 tiếng trước startTime

    const planData = {
      title,
      description,
      startTime: firebase.firestore.Timestamp.fromDate(startTime),
      endTime: firebase.firestore.Timestamp.fromDate(endTime),
      status: isCompleted ? 'completed' : 'pending',
      createdAt: isEdit ? plan.createdAt : firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      notificationId: null, // Sẽ được cập nhật sau
    };

    try {
      const userPlansRef = firestore
        .collection('users')
        .doc(auth.currentUser.uid)
        .collection('plans');

      if (isEdit) {
        // Nếu có thông báo cũ, hủy nó
        if (plan.notificationId) {
          await Notifications.cancelScheduledNotificationAsync(plan.notificationId);
        }

        // Lên lịch thông báo mới
        const newNotificationId = await scheduleNotification(plan.id, title, notificationTime);
        planData.notificationId = newNotificationId;

        await userPlansRef.doc(plan.id).update(planData);
        Alert.alert('Thành công', 'Kế hoạch đã được cập nhật thành công.');
      } else {
        // Thêm kế hoạch vào Firestore để lấy planId
        const docRef = await userPlansRef.add(planData);
        const planId = docRef.id;

        // Lên lịch thông báo mới
        const newNotificationId = await scheduleNotification(planId, title, notificationTime);

        // Cập nhật kế hoạch với notificationId
        await docRef.update({ notificationId: newNotificationId });
        Alert.alert('Thành công', 'Kế hoạch đã được thêm thành công.');
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert('Lỗi', error.message);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa kế hoạch này?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          onPress: async () => {
            try {
              await firestore
                .collection('users')
                .doc(auth.currentUser.uid)
                .collection('plans')
                .doc(plan.id)
                .delete();
              Alert.alert('Thành công', 'Kế hoạch đã được xóa.');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Lỗi', error.message);
            }
          },
        },
      ]
    );
  };

  const scheduleNotification = async (planId, title, date) => {
    if (date > new Date()) {
      try {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: `Kế hoạch: ${title}`,
            body: 'Đã đến giờ thực hiện kế hoạch của bạn!',
          },
          trigger: date,
        });
        return id;
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể lên lịch thông báo: ' + error.message);
      }
    }
    return null;
  };

  return (
    <ImageBackground source={require('../assets/background.png')} style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Tiêu đề kế hoạch"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Mô tả"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TouchableOpacity onPress={() => setStartPickerVisibility(true)}>
        <Text style={styles.dateText}>Thời gian bắt đầu: {startTime.toLocaleString()}</Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isStartPickerVisible}
        mode="datetime"
        date={startTime}
        onConfirm={(date) => { setStartTime(date); setStartPickerVisibility(false); }}
        onCancel={() => setStartPickerVisibility(false)}
      />
      <TouchableOpacity onPress={() => setEndPickerVisibility(true)}>
        <Text style={styles.dateText}>Thời gian kết thúc: {endTime.toLocaleString()}</Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isEndPickerVisible}
        mode="datetime"
        date={endTime}
        onConfirm={(date) => { setEndTime(date); setEndPickerVisibility(false); }}
        onCancel={() => setEndPickerVisibility(false)}
      />
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Hoàn thành:</Text>
        <Switch value={isCompleted} onValueChange={setIsCompleted} />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>{isEdit ? 'Cập nhật kế hoạch' : 'Thêm kế hoạch'}</Text>
      </TouchableOpacity>
      {isEdit && (
        <TouchableOpacity style={styles.buttonDelete} onPress={handleDelete}>
          <Text style={styles.buttonDeleteText}>Xóa kế hoạch</Text>
        </TouchableOpacity>
      )}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 20, borderRadius: 5 },
  dateText: { fontSize: 18, marginBottom: 10 },
  switchContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  switchLabel: { fontSize: 18, marginRight: 10 },
  button: { backgroundColor: '#007BFF', padding: 15, alignItems: 'center', borderRadius: 5 },
  buttonText: { color: '#fff', fontSize: 18 },
  buttonDelete: { backgroundColor: 'red', padding: 15, alignItems: 'center', borderRadius: 5, marginTop: 10 },
  buttonDeleteText: { color: '#fff', fontSize: 18 },
});

export default AddPlanScreen;
