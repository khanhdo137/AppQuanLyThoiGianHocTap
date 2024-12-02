import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Dimensions, ImageBackground, TextInput } from 'react-native';
import { firestore, auth } from '../services/firebase';
import { useIsFocused } from '@react-navigation/native';
import moment from 'moment';

const HomeScreen = ({ navigation, route }) => {
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); // State cho từ khóa tìm kiếm
  const isFocused = useIsFocused();

  const numColumns = 2; // Xác định số cột là 2 (hiển thị 8 ô)
  
  // State để theo dõi ngày đã chọn
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (!auth.currentUser) {
      return;
    }

    setLoadingPlans(true);
    const unsubscribe = firestore.collection('users').doc(auth.currentUser.uid)
      .collection('plans')
      .orderBy('startTime', 'asc')
      .onSnapshot(snapshot => {
        const newPlans = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Lọc kế hoạch dựa trên ngày đã chọn
        const filteredPlans = selectedDate
          ? newPlans.filter(plan => moment(plan.startTime.toDate()).format('YYYY-MM-DD') === selectedDate)
          : newPlans;

        // Lọc kế hoạch dựa trên từ khóa tìm kiếm
        const searchFilteredPlans = filteredPlans.filter(plan =>
          plan.title.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setPlans(searchFilteredPlans);
        setLoadingPlans(false);
      }, error => {
        Alert.alert('Lỗi', error.message);
        setLoadingPlans(false);
      });

    return () => unsubscribe();
  }, [isFocused, selectedDate, searchQuery]); // Thêm searchQuery vào dependency

  // Reset selectedDate khi trở lại màn hình Home
  useEffect(() => {
    if (isFocused) {
      setSelectedDate(null); // Reset lại selectedDate
      setSearchQuery(''); // Reset lại từ khóa tìm kiếm
    }
  }, [isFocused]);

  const handleLogout = useCallback(() => {
    auth.signOut()
      .catch(error => Alert.alert('Lỗi', error.message));
  }, []);

  const renderItem = useCallback(({ item }) => {
    const backgroundColor = item.status === 'completed' ? '#00FF00' : '#FFFF00';

    return (
      <TouchableOpacity
        style={[styles.planItem, { backgroundColor }]}
        onPress={() => navigation.navigate('AddPlan', { plan: item })}
      >
        <Text style={styles.planTitle}>{item.title}</Text>
      </TouchableOpacity>
    );
  }, [navigation]);

  if (loadingPlans) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ImageBackground source={require('../assets/background.png')} style={styles.background}>
      <View style={styles.container}>
        {auth.currentUser && (
          <Text style={styles.welcome}>Chào {auth.currentUser.email}</Text>
        )}

        {/* Thanh tìm kiếm */}
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm theo tiêu đề"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <FlatList
          key={numColumns}
          data={plans}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          numColumns={numColumns}
          columnWrapperStyle={styles.row}
          ListEmptyComponent={<Text>Không có kế hoạch học tập nào.</Text>}
          contentContainerStyle={styles.flatListContent}
        />

        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddPlan')}>
          <Text style={styles.addButtonText}>+ Thêm Kế Hoạch</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: { flex: 1, padding: 20, backgroundColor: 'rgba(255, 255, 255, 0.8)' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  welcome: { fontSize: 18, marginBottom: 10 },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  row: { justifyContent: 'space-between' },
  planItem: {
    padding: 20,
    marginVertical: 10,
    width: (Dimensions.get('window').width / 2) - 30,
    height: 150,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  planTitle: { fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  addButton: {
    position: 'absolute',
    bottom: 30,
    left: '50%',
    transform: [{ translateX: -50 }],
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 5,
  },
  addButtonText: { color: '#fff', fontSize: 16 },
});

export default HomeScreen;
