import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, ImageBackground, TouchableOpacity } from 'react-native'; // Thêm TouchableOpacity vào đây
import { firestore, auth } from '../services/firebase';

const NotificationsScreen = ({ navigation, setNotificationCount }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const userPlansRef = firestore.collection('users').doc(auth.currentUser.uid).collection('plans');
      const snapshot = await userPlansRef.where('startTime', '>', new Date()).get();
      const plans = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      }));
      const upcomingNotifications = plans.filter(plan => {
        const startTime = plan.startTime.toDate();
        return startTime <= new Date(new Date().getTime() + 60 * 60 * 1000); // Trong 1 giờ tới
      });
      setNotifications(upcomingNotifications);
      // Cập nhật số đếm thông báo
      setNotificationCount(upcomingNotifications.length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Gọi fetchNotifications khi màn hình được focus
    const unsubscribe = navigation.addListener('focus', fetchNotifications);
    return unsubscribe; // Dọn dẹp lắng nghe khi component unmount
  }, [navigation]);

  const renderNotification = ({ item }) => {
    const startTime = item.startTime.toDate();
    return (
      <TouchableOpacity
        style={[styles.notificationContainer, startTime <= new Date(new Date().getTime() + 60 * 60 * 1000) && styles.upcomingNotification]}
        onPress={() => navigation.navigate('AddPlan', { plan: item })}
      >
        <Text style={styles.notificationText}>
          Bạn có kế hoạch học tập vào {startTime.toLocaleString()}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ImageBackground 
      source={require('../assets/background.png')} // Đường dẫn đến hình ảnh background
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {notifications.length === 0 ? (
          <Text style={styles.emptyText}>Không có thông báo nào.</Text>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={item => item.id}
          />
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1, padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notificationContainer: { padding: 15, borderRadius: 5, marginVertical: 5, borderColor: '#ccc', borderWidth: 1 },
  notificationText: { fontSize: 16 },
  upcomingNotification: { backgroundColor: 'yellow' },
  emptyText: { textAlign: 'center', fontSize: 18, color: 'gray' },
});

export default NotificationsScreen;
