import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { firestore, auth } from '../services/firebase';
import { BarChart } from 'react-native-chart-kit';
import firebase from 'firebase/compat/app'; // Thêm dòng này nếu chưa có

const StatisticsScreen = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!auth.currentUser) {
          Alert.alert('Error', 'Bạn cần đăng nhập để xem thống kê.');
          return;
        }

        const snapshot = await firestore.collection('users').doc(auth.currentUser.uid)
          .collection('plans')
          .get();

        const plans = snapshot.docs.map(doc => doc.data());
        const weeksData = Array(4).fill(null).map(() => Array(7).fill(0)); // Mảng lưu thời gian học cho 4 tuần, mỗi tuần có 7 ngày
        const weekRanges = []; // Mảng lưu khoảng thời gian của mỗi tuần

        plans.forEach(plan => {
          if (plan.startTime && plan.endTime && 
              plan.startTime instanceof firebase.firestore.Timestamp && 
              plan.endTime instanceof firebase.firestore.Timestamp) {
            const start = plan.startTime.toDate();
            const end = plan.endTime.toDate();
            const duration = (end - start) / (1000 * 60); // Chuyển đổi sang phút

            const currentDate = new Date();
            const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
            const weekIndex = Math.floor((startOfWeek - start) / (1000 * 60 * 60 * 24 * 7)); // Tính tuần

            // Đảm bảo rằng chỉ số tuần không vượt quá phạm vi
            if (weekIndex >= 0 && weekIndex < 4) {
              const dayOfWeek = start.getDay(); // Lấy ngày trong tuần (0: Chủ Nhật, 1: Thứ Hai, ..., 6: Thứ Bảy)
              weeksData[weekIndex][dayOfWeek] += duration; // Tăng thời gian học tại ngày tương ứng

              // Tính khoảng thời gian của tuần
              const weekStart = new Date(startOfWeek);
              weekStart.setDate(weekStart.getDate() - weekIndex * 7);
              const weekEnd = new Date(weekStart);
              weekEnd.setDate(weekEnd.getDate() + 6);
              
              // Định dạng ngày tháng
              const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
              weekRanges[weekIndex] = `${weekStart.toLocaleDateString('vi-VN', options)} - ${weekEnd.toLocaleDateString('vi-VN', options)}`;
            }
          } else {
            console.warn('startTime hoặc endTime không hợp lệ:', plan.startTime, plan.endTime);
          }
        });

        // Cập nhật dữ liệu cho tất cả các tuần và đảo ngược thứ tự
        setData(weeksData.map((weekData, index) => ({
          labels: ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'],
          datasets: [{ data: weekData }],
          title: weekRanges[index] || `Khoảng thời gian ${index + 1}` // Đổi tên tiêu đề
        })).reverse()); // Đảo ngược thứ tự ở đây
      } catch (error) {
        Alert.alert('Error', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Thống Kê Thời Gian Học</Text>
      {data.length > 0 ? (
        data.map((weekData, index) => (
          <View key={index} style={styles.chartContainer}>
            <Text style={styles.chartTitle}>{weekData.title}</Text>
            <BarChart
              data={weekData}
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
                style: { borderRadius: 16 },
                propsForDots: { r: '6', strokeWidth: '2', stroke: '#007BFF' },
              }}
              style={{ marginVertical: 8, borderRadius: 16 }}
            />
          </View>
        ))
      ) : (
        <Text>Không có dữ liệu thống kê.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, marginBottom: 20, textAlign: 'center' },
  chartContainer: { marginBottom: 20, alignItems: 'center' },
  chartTitle: { fontSize: 18, marginBottom: 10 },
});

export default StatisticsScreen;
