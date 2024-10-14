import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Platform } from 'react-native';
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

  const handleSave = async () => {
    if (title === '') {
      Alert.alert('Error', 'Please enter title');
      return;
    }

    const planData = {
      title,
      description,
      startTime: firebase.firestore.Timestamp.fromDate(startTime),
      endTime: firebase.firestore.Timestamp.fromDate(endTime),
      status: isEdit ? plan.status : 'pending',
      createdAt: isEdit ? plan.createdAt : firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    try {
      const userPlansRef = firestore.collection('users').doc(auth.currentUser.uid).collection('plans');

      if (isEdit) {
        await userPlansRef.doc(plan.id).update(planData);
        Alert.alert('Success', 'Plan updated successfully');
      } else {
        await userPlansRef.add(planData);
        Alert.alert('Success', 'Plan added successfully');
      }

      // Schedule notification
      scheduleNotification(title, startTime);

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const scheduleNotification = async (title, date) => {
    if (date <= new Date()) {
      Alert.alert('Error', 'Please select a future time for the notification.');
      return;
    }

    const trigger = date;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Nhắc nhở học tập",
        body: `Đến giờ thực hiện kế hoạch: ${title}`,
      },
      trigger,
    });
  };

  const handleConfirmStart = (selectedDate) => {
    setStartTime(selectedDate);
    setStartPickerVisibility(false);
  };

  const handleConfirmEnd = (selectedDate) => {
    setEndTime(selectedDate);
    setEndPickerVisibility(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tiêu đề:</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập tiêu đề kế hoạch"
        value={title}
        onChangeText={setTitle}
      />
      <Text style={styles.label}>Mô tả:</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập mô tả kế hoạch"
        value={description}
        onChangeText={setDescription}
      />
      <Text style={styles.label}>Giờ bắt đầu:</Text>
      <Button title={startTime.toLocaleString()} onPress={() => setStartPickerVisibility(true)} />
      <DateTimePickerModal
        isVisible={isStartPickerVisible}
        mode="datetime"
        onConfirm={handleConfirmStart}
        onCancel={() => setStartPickerVisibility(false)}
      />
      <Text style={styles.label}>Giờ kết thúc:</Text>
      <Button title={endTime.toLocaleString()} onPress={() => setEndPickerVisibility(true)} />
      <DateTimePickerModal
        isVisible={isEndPickerVisible}
        mode="datetime"
        onConfirm={handleConfirmEnd}
        onCancel={() => setEndPickerVisibility(false)}
      />
      <Button title={isEdit ? "Cập Nhật" : "Thêm"} onPress={handleSave} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontSize: 16, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginTop: 5 },
});

export default AddPlanScreen;
