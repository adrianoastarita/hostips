import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import Header from './header';

const { width, height } = Dimensions.get('window');

const ApartmentScreen = ({ navigation }) => {

    useEffect(() => {
        navigation.setOptions({
            header: () => <Header headerData={['Apartment','ciao']} />,
        });
    }, [navigation]);

    return (
        <View style={styles.container}>
            <View style={styles.body}>
                <Text style={styles.text}>Apartment screen</Text> 
            </View>
        </View>
    );

};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 36, 
    color: 'grey',
  },
});

export default ApartmentScreen;
