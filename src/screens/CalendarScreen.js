import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { firestore, auth } from '../services/firebase';
import { format, getDaysInMonth } from 'date-fns';
import { useNavigation } from '@react-navigation/native';

const CalendarScreen = () => {
  const navigation = useNavigation();
  const [markedDates, setMarkedDates] = useState({});

  const getMonthDays = (year, month) => {
    const daysInMonth = getDaysInMonth(new Date(year, month - 1));
    const dates = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = format(new Date(year, month - 1, day), 'yyyy-MM-dd');
      dates.push(date);
    }
    return dates;
  };

  const fetchPlans = async (year, month) => {
    const userPlansRef = firestore.collection('users').doc(auth.currentUser.uid).collection('plans');
    const snapshot = await userPlansRef.get();
    const plans = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    }));

    const dates = {};
    const allDays = getMonthDays(year, month);

    plans.forEach(plan => {
      const planDate = format(plan.startTime.toDate(), 'yyyy-MM-dd');
      if (!dates[planDate]) {
        dates[planDate] = { completed: 0, total: 0 };
      }
      dates[planDate].total += 1;
      if (plan.status === 'completed') {
        dates[planDate].completed += 1;
      }
    });

    const marked = {};

    allDays.forEach(date => {
      if (dates[date]) {
        if (dates[date].total === 0) {
          marked[date] = {
            customStyles: {
              container: { backgroundColor: 'blue' },
              text: { color: 'white' },
            },
          };
        } else if (dates[date].completed === dates[date].total) {
          marked[date] = {
            customStyles: {
              container: { backgroundColor: 'green' },
              text: { color: 'white' },
            },
          };
        } else if (dates[date].completed >= 1) {
          marked[date] = {
            customStyles: {
              container: { backgroundColor: 'yellow' },
              text: { color: 'black' },
            },
          };
        } else {
          marked[date] = {
            customStyles: {
              container: { backgroundColor: 'red' },
              text: { color: 'white' },
            },
          };
        }
      } else {
        marked[date] = {
          customStyles: {
            container: { backgroundColor: 'blue' },
            text: { color: 'white' },
          },
        };
      }
    });

    setMarkedDates(marked);
  };

  useEffect(() => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    fetchPlans(currentYear, currentMonth);
    
    const unsubscribe = firestore.collection('users').doc(auth.currentUser.uid).collection('plans')
      .onSnapshot(() => {
        // Gọi lại fetchPlans khi có sự thay đổi trong collection plans
        fetchPlans(currentYear, currentMonth);
      });

    return () => unsubscribe(); // Hủy đăng ký khi component bị gỡ bỏ
  }, []);

  return (
    <ImageBackground source={require('../assets/background.png')} style={styles.container}>
      <Calendar
        markingType={'custom'}
        markedDates={markedDates}
        onDayPress={(day) => {
          navigation.navigate('DailyPlan', { selectedDate: day.dateString });
        }}
        onMonthChange={(month) => {
          setMarkedDates({});
          fetchPlans(month.year, month.month);
        }}
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 }, // Duy trì kiểu dáng gốc
});

export default CalendarScreen;
