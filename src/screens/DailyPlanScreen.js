import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ImageBackground } from 'react-native';
import { firestore, auth } from '../services/firebase';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';

const DailyPlanScreen = ({ route }) => {
  const { selectedDate } = route.params; // Get the selected date from route params
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const navigation = useNavigation(); // Initialize navigation

  useEffect(() => {
    const fetchPlans = async () => {
      if (!auth.currentUser) {
        return;
      }
      setLoadingPlans(true);
      try {
        const userPlansRef = firestore.collection('users').doc(auth.currentUser.uid).collection('plans');
        const snapshot = await userPlansRef.where('startTime', '>=', moment(selectedDate).startOf('day').toDate())
          .where('startTime', '<=', moment(selectedDate).endOf('day').toDate())
          .get();
        const fetchedPlans = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPlans(fetchedPlans);
      } catch (error) {
        Alert.alert('Lỗi', error.message);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, [selectedDate]);

  if (loadingPlans) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ImageBackground 
      source={require('../assets/background.png')} // Thay đổi đường dẫn này bằng đường dẫn đến hình ảnh của bạn
      style={styles.container}
    >
      <Text style={styles.title}>Kế Hoạch Ngày {moment(selectedDate).format('DD/MM/YYYY')}</Text>
      <FlatList
        data={plans}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.planItem}
            onPress={() => navigation.navigate('PlanDetail', { planId: item.id })} // Navigate to PlanDetailScreen
          >
            <Text style={[styles.planTitle, { color: item.status === 'completed' ? 'green' : 'red' }]}>
              {item.title}
            </Text>
            <Text style={styles.planTime}>
              Bắt đầu: {moment(item.startTime.toDate()).format('HH:mm')}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>Không có kế hoạch nào cho ngày này.</Text>}
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: 'white' },
  planItem: {
    padding: 15,
    marginVertical: 5,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
  },
  planTitle: { fontSize: 16 },
  planTime: { fontSize: 14, color: 'gray' },
});

export default DailyPlanScreen;
