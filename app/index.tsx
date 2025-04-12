import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, StyleSheet } from 'react-native';

import Login from '../src/screens/login';
import HomeStack from '../src/screens/stack_home';
import Apartment from '../src/screens/apartment';
import Booking from '../src/screens/booking';
import Footer from '../src/screens/footer';
import Header from '../src/screens/header';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function AppTabs() {
  const headerData: string[] = [];  // Definisci dei dati da passare al Header

  return (
    <Tab.Navigator
      tabBar={(props) => <Footer {...props} />}
      screenOptions={{
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="HomeStack"
        component={HomeStack}
        options={{
          header: () => <Header headerData={headerData} />,  // Passa headerData
          tabBarIcon: (focused) => (
            <Image
              source={require('../src/icons/icon_categories.png')}
              style={[
                styles.icon,
                focused ? styles.activeIcon : styles.inactiveIcon,
              ]}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Apartment"
        component={Apartment}
        options={{
          header: () => <Header headerData={headerData} />,  // Passa headerData
          tabBarIcon: (focused) => (
            <Image
              source={require('../src/icons/icon_apartment.png')}
              style={[
                styles.icon,
                focused ? styles.activeIcon : styles.inactiveIcon,
              ]}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Booking"
        component={Booking}
        options={{
          header: () => <Header headerData={headerData} />,  // Passa headerData
          tabBarIcon: (focused) => (
            <Image
              source={require('../src/icons/icon_booking.png')}
              style={[
                styles.icon,
                focused ? styles.activeIcon : styles.inactiveIcon,
              ]}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function Index() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AppTabs"
        component={AppTabs}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 30,
    height: 30,
  },
  activeIcon: {
    tintColor: '#007AFF',
  },
  inactiveIcon: {
    tintColor: '#ccc',
  },
});

