import React, { useState, useRef } from 'react';
import { View, TextInput, StyleSheet, Dimensions, TouchableWithoutFeedback, Keyboard, Text, TouchableOpacity, Alert } from 'react-native';
import { Stack } from "expo-router"; // Mantieni questa linea per Expo Router
import { useNavigation } from '@react-navigation/native'; // Mantieni questa per la navigazione
import { handleAccessButtonPress } from '../services/api_functions'; // Importa la funzione per la verifica della password
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height } = Dimensions.get('window');
const r_circle = 10;
const otp_len = 6;

const AppScreen = () => {
  const [inputValue, setInputValue] = useState('');
  const [editable, setEditable] = useState(false);
  const inputRef = useRef(null);
  const navigation = useNavigation(); // Hook per la navigazione

  const handleInputChange = (text) => {
    if (text.length <= otp_len) {
      setInputValue(text);
    }
    if (text.length === otp_len) {
      Keyboard.dismiss();
    }
  };

  const handleRedViewPress = () => {
    setEditable(true);
    setInputValue('');
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const handleOutsidePress = () => {
    setEditable(false);
    setInputValue('');
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleAccessButtonPressWrapper = async () => {
    const result = await handleAccessButtonPress(inputValue); // Verifica la password
    if (result.success) {
      console.log('Token ricevuto');
  
      // SALVIAMO IL TOKEN IN ASYNC STORAGE
      await AsyncStorage.setItem('token', result.token);
  
      // ✅ Naviga alla pagina home dopo il login
      navigation.replace('AppTabs');
    } else {
      Alert.alert('Errore', result.message);
      handleOutsidePress();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <View style={styles.container}>

        <TouchableWithoutFeedback onPress={handleRedViewPress}>
          <View style={visibleTextView}>
            <View style={styles.circlesContainer}>
              {[...Array(otp_len)].map((_, index) => (
                <View key={index} style={styles.circleContainer}>
                  <View 
                    style={[
                      styles.circle, 
                      { 
                        opacity: inputValue[index] ? 0 : 1,
                        backgroundColor: index === inputValue.length && editable ? 'goldenrod' : 'lightgray',
                      } 
                    ]}
                  />
                  {inputValue[index] && (
                    <Text style={styles.circleText}>{inputValue[index]}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>

        <View style={buttonView}>
          <TouchableOpacity
            style={styles.accessButton}
            onPress={handleAccessButtonPressWrapper}
            disabled={inputValue.length !== otp_len}
          >
            <Text 
              style={[
                styles.accessButtonText,
                { color: inputValue.length === otp_len ? 'grey' : 'lightgrey' }
              ]}
            >
              ACCEDI
            </Text>
          </TouchableOpacity>
        </View>

        <View style={hiddentextView}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={inputValue}
            onChangeText={handleInputChange}
            maxLength={otp_len}
            keyboardType="number-pad"
            placeholder="Inserisci 6 numeri"
            textAlign="center"
            editable={editable}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

// Stili
const visibleTextView = { position: 'absolute', top: height * 0.35, height: 100, width: '100%', justifyContent: 'center', alignItems: 'center' };
const hiddentextView = { position: 'absolute', top: height * 0.6, height: 100, width: '100%', justifyContent: 'center', alignItems: 'center' };
const buttonView = { position: 'absolute', top: height * 0.5, height: 100, width: '100%' };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  input: { width: '80%', height: 40, borderColor: 'gray', borderWidth: 1, paddingHorizontal: 10, fontSize: 18, color: 'black', opacity: 0 },
  circlesContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%' },
  circleContainer: { justifyContent: 'center', alignItems: 'center', marginHorizontal: 5 },
  circle: {
    width: 2 * r_circle,               // Larghezza del cerchio
    height: 2 * r_circle,              // Altezza del cerchio
    borderRadius: r_circle,            // Arrotonda gli angoli per fare il cerchio
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'blue',           // Colore di sfondo del cerchio (modificabile)
    // Ombra per iOS
    shadowColor: '#000',               // Colore dell'ombra
    shadowOffset: { width: 0, height: 2 }, // Posizione dell'ombra
    shadowOpacity: 0.15,               // Opacità dell'ombra
    shadowRadius: 3.5,                 // Raggio di sfocatura dell'ombra
    // Ombra per Android
    elevation: 5,                      // Elevazione dell'ombra (solo su Android)
  },
  circleText: { fontSize: 32, fontWeight: 'bold', color: 'darkgrey', textAlign: 'center', position: 'absolute' },
  accessButton: { paddingVertical: 12, paddingHorizontal: 30, borderRadius: 5, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
  accessButtonText: { fontSize: 18, fontWeight: 'bold' },
});

export default AppScreen;
