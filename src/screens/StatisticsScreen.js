import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Alert, ScrollView, ActivityIndicator, Button, ImageBackground } from 'react-native';
import { firestore, auth } from '../services/firebase';
import { BarChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import firebase from 'firebase/compat/app';
import moment from 'moment';
import { format, eachDayOfInterval } from 'date-fns';

const StatisticsScreen = () => {
  const [data, setData] = useState([]);
  const [taskStatusData, setTaskStatusData] = useState({});
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const fetchData = async () => {
    try {
      if (!auth.currentUser) {
        Alert.alert('Error', 'Bạn cần đăng nhập để xem thống kê.');
        return;
      }

      const snapshot = await firestore.collection('users').doc(auth.currentUser.uid)
        .collection('plans')
        .where('startTime', '>=', firebase.firestore.Timestamp.fromDate(startDate))
        .where('startTime', '<=', firebase.firestore.Timestamp.fromDate(endDate))
        .get();

      const plans = snapshot.docs.map(doc => doc.data());

      let completedPlans = 0;
      let pendingPlans = 0;

      plans.forEach(plan => {
        if (plan.status === 'completed') {
          completedPlans += 1;
        } else {
          pendingPlans += 1;
        }
      });

      setTaskStatusData({
        labels: ['Hoàn thành', 'Chưa hoàn thành'],
        datasets: [
          {
            data: [completedPlans, pendingPlans]
          }
        ]
      });

      const intervalDays = eachDayOfInterval({ start: startDate, end: endDate });
      const dayData = intervalDays.map(() => 0); 

      intervalDays.forEach((day, index) => {
        plans.forEach(plan => {
          if (plan.startTime && plan.endTime && plan.startTime.seconds && plan.endTime.seconds) {
            const start = new Date(plan.startTime.seconds * 1000);
            const end = new Date(plan.endTime.seconds * 1000);
            const duration = (end - start) / (1000 * 60); 
            if (start.toDateString() === day.toDateString()) {
              dayData[index] += duration; 
            }
          } else {
            console.warn('startTime hoặc endTime không hợp lệ:', plan.startTime, plan.endTime);
          }
        });
      });

      setData({
        labels: intervalDays.map(day => format(day, 'dd')), 
        datasets: [{ data: dayData }],
        title: `Từ ${format(startDate, 'dd/MM/yyyy')} đến ${format(endDate, 'dd/MM/yyyy')}`
      });
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      fetchData();
    }, [startDate, endDate])
  );

  const handleStartDateChange = (event, date) => {
    setShowStartDatePicker(false);
    if (date) {
      setStartDate(date);
    }
  };

  const handleEndDateChange = (event, date) => {
    setShowEndDatePicker(false);
    if (date) {
      setEndDate(date);
    }
  };

  const showStartPicker = () => {
    setShowStartDatePicker(true);
  };

  const showEndPicker = () => {
    setShowEndDatePicker(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <ImageBackground source={require('../assets/background.png')} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Thống Kê Thời Gian Học</Text>
        {data.datasets && data.datasets.length > 0 ? (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>{data.title}</Text>
            <BarChart
              data={data}
              width={Dimensions.get('window').width - 40}
              height={220}
              yAxisLabel="Phút"
              xLabelsOffset={10}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#007BFF'
                }
              }}
              style={{
                marginVertical: 8,
                borderRadius: 16
              }}
              fromZero={true} 
            />
          </View>
        ) : (
          <Text>Không có dữ liệu thống kê cho khoảng thời gian này.</Text>
        )}
        <Text style={styles.title}>Thống Kê Kế Hoạch</Text>
        {taskStatusData.datasets && taskStatusData.datasets.length > 0 ? (
          <View style={styles.chartContainer}>
            <BarChart
              data={taskStatusData}
              width={Dimensions.get('window').width - 40}
              height={220}
              yAxisLabel=""
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#007BFF'
                }
              }}
              style={{
                marginVertical: 8,
                borderRadius: 16
              }}
              fromZero={true}
            />
          </View>
        ) : (
          <Text>Không có dữ liệu thống kê cho khoảng thời gian này.</Text>
        )}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <Button title="Chọn Ngày Bắt Đầu" onPress={showStartPicker} color="#007BFF" />
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={handleStartDateChange}
          />
        )}
        <Button title="Chọn Ngày Kết Thúc" onPress={showEndPicker} color="#007BFF" />
        {showEndDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={handleEndDateChange}
          />
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContainer: { padding: 20 },
  title: { fontSize: 20, marginBottom: 20, textAlign: 'center' },
  chartContainer: { marginBottom: 20, alignItems: 'center' },
  chartTitle: { fontSize: 18, marginBottom: 10 },
  buttonContainer: {
    marginTop: 'auto',
    padding: 20,
    flexDirection: 'column',
    alignItems: 'center',
  },
});

export default StatisticsScreen;
