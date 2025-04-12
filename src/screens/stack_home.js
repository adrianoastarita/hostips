import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import Home from './home';
import List from './list';
import Restaurant from './restaurant';
import Shopping from './shopping';
import Rental from './rental';

const Stack = createStackNavigator();

const HomeStack = () => {
    return (
      <Stack.Navigator>

        {/* Home */}
        <Stack.Screen name="Home" component={Home} />
  
        {/* List */}
        <Stack.Screen name="List" component={List} />

        {/* Restaurant */}
        <Stack.Screen name="Restaurant" component={Restaurant} />

        {/* Shopping */}
        <Stack.Screen name="Shopping" component={Shopping} />

        {/* Rental */}
        <Stack.Screen name="Rental" component={Rental} />

      </Stack.Navigator>


    );
  };

export default HomeStack;
