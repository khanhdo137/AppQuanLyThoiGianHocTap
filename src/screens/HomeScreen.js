import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { firestore, auth } from '../services/firebase';
import { useIsFocused } from '@react-navigation/native';

const HomeScreen = ({ navigation }) => {
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!auth.currentUser) {
      return;
    }

    setLoadingPlans(true); // Đặt trạng thái tải về true mỗi khi bắt đầu tải
    const unsubscribe = firestore.collection('users').doc(auth.currentUser.uid)
      .collection('plans')
      .orderBy('startTime', 'asc')
      .onSnapshot(snapshot => {
        const newPlans = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPlans(newPlans);
        setLoadingPlans(false); // Đặt trạng thái tải về false khi kế hoạch đã được lấy
      }, error => {
        Alert.alert('Lỗi', error.message);
        setLoadingPlans(false); // Đảm bảo trạng thái tải là false trong trường hợp có lỗi
      });

    return () => unsubscribe();
  }, [isFocused]);

  const handleLogout = useCallback(() => {
    auth.signOut()
      .catch(error => Alert.alert('Lỗi', error.message));
  }, []);

  const renderItem = useCallback(({ item }) => (
    <View style={styles.planItem}>
      <Text style={styles.planTitle}>{item.title}</Text>
      <Text>{item.description}</Text>
      <Text>Giờ bắt đầu: {item.startTime.toDate().toLocaleString()}</Text>
      <Text>Giờ kết thúc: {item.endTime.toDate().toLocaleString()}</Text>
      <Button title="Sửa" onPress={() => navigation.navigate('AddPlan', { plan: item })} />
    </View>
  ), [navigation]);

  if (loadingPlans) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {auth.currentUser && (
        <Text style={styles.welcome}>Chào {auth.currentUser.email}</Text>
      )}

      <FlatList
        data={plans}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text>Không có kế hoạch học tập nào.</Text>}
        contentContainerStyle={styles.flatListContent}
      />

      {/* Nút "Thêm Kế Hoạch" cố định */}
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddPlan')}>
        <Text style={styles.addButtonText}>+ Thêm Kế Hoạch</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  welcome: { fontSize: 18, marginBottom: 10 },
  planItem: { padding: 15, borderBottomWidth: 1, borderColor: '#ccc' },
  planTitle: { fontSize: 16, fontWeight: 'bold' },
  addButton: {
    position: 'absolute', // Đặt vị trí của nút
    bottom: 30, // Khoảng cách từ đáy
    left: '50%', // Đưa vào giữa
    transform: [{ translateX: -50 }], // Giữa theo chiều ngang
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 30, // Hình dạng uốn
    alignItems: 'center',
    elevation: 5, // Đổ bóng cho nút
  },
  addButtonText: { color: '#fff', fontSize: 16 },
});

export default HomeScreen;
