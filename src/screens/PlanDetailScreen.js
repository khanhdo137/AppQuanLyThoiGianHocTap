import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Button, ImageBackground } from 'react-native';
import { firestore, auth } from '../services/firebase';
import firebase from 'firebase/compat/app';

const PlanDetailScreen = ({ route, navigation }) => {
  const { planId } = route.params;
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const planDoc = await firestore
          .collection('users')
          .doc(auth.currentUser.uid)
          .collection('plans')
          .doc(planId)
          .get();

        if (planDoc.exists) {
          setPlan({ id: planDoc.id, ...planDoc.data() });
        } else {
          Alert.alert('Lỗi', 'Không tìm thấy kế hoạch.');
          navigation.goBack();
        }
      } catch (error) {
        Alert.alert('Lỗi', error.message);
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    if (planId) {
      fetchPlan();
    } else {
      Alert.alert('Lỗi', 'Không có kế hoạch được truyền vào.');
      navigation.goBack();
    }
  }, [planId]);

  const toggleCompletion = async () => {
    if (!plan) return;
    const updatedStatus = plan.status === 'completed' ? 'pending' : 'completed';
    try {
      await firestore
        .collection('users')
        .doc(auth.currentUser.uid)
        .collection('plans')
        .doc(plan.id)
        .update({
          status: updatedStatus,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      setPlan({ ...plan, status: updatedStatus });
      Alert.alert('Thành công', 'Trạng thái kế hoạch đã được cập nhật.');
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Không có kế hoạch nào để hiển thị.</Text>
      </View>
    );
  }

  return (
    <ImageBackground source={require('../assets/background.png')} style={styles.container}>
      <Text style={styles.title}>{plan.title}</Text>
      <Text style={styles.details}>Thời gian bắt đầu: {plan.startTime.toDate().toLocaleString()}</Text>
      <Text style={styles.details}>Trạng thái: {plan.status}</Text>

      <Button title={plan.status === 'completed' ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu đã hoàn thành'} onPress={toggleCompletion} />
      <Button title="Xóa kế hoạch" color="red" onPress={handleDelete} />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  details: { fontSize: 18, marginBottom: 5 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, textAlign: 'center' },
});

export default PlanDetailScreen;
