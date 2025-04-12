import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';  // Importiamo AsyncStorage
import jwtDecode from 'jwt-decode';
import { getApartmentData } from '../services/api_functions';
import { getZoneData } from '../services/api_functions';
import { getPartnerZoneData } from '../services/api_functions';
import Header from './header';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';  // Per la lingua italiana

const { width, height } = Dimensions.get('window'); // Otteniamo le dimensioni dello schermo

const HomeScreen = ({ navigation }) => {
  const [tokenData, setTokenData] = useState(null);
  const [apartmentData, setApartmentData] = useState(null);  // Stato per i dati dell'appartamento
  const [zoneData, setZoneData] = useState(null);  // Stato per i dati della zona
  const [partnerData, setPartnerData] = useState(null);  // Stato per i dati dei partner della zona
  const [loading, setLoading] = useState(true); // Stato di caricamento

  // Recuperiamo il token da AsyncStorage
  useEffect(() => {
    const getToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');  // ✅ Recuperiamo il token da AsyncStorage
        console.log('Token recuperato');

        if (token) {
          // ✅ Verifica se il token è del formato corretto (JWT)
          if (token.split('.').length === 3) {
            try {
              // ✅ Decodifica del token
              const decoded = jwtDecode(token);
              console.log('Token decodificato'); // Log dei dati decodificati
              setTokenData(decoded);  // Salva i dati decodificati nello stato

              // Otteniamo i dati dell'appartamento
              const apartmentDataResponse = await getApartmentData(decoded.aptID);
              setApartmentData(apartmentDataResponse.data);

              // Otteniamo i dati della zona 
              // (usa direttamente l'output della prima API per non dover aspettare setApartmentData)
              const zoneDataResponse = await getZoneData(apartmentDataResponse.data.zonaID);
              setZoneData(zoneDataResponse.data);

              // Otteniamo i partner della zona 
              // (usa direttamente l'output della prima API per non dover aspettare setApartmentData)
              const partnerDataResponse = await getPartnerZoneData(apartmentDataResponse.data.zonaID);
              setPartnerData(partnerDataResponse.data);

            } catch (decodeError) {
              console.error('Errore nella decodifica del token:', decodeError);
            }
          } else {
            console.error('Token non è nel formato JWT valido');
          }
        } else {
          console.log('Token non trovato');
        }
      } catch (error) {
        console.error('Errore nel recupero del token:', error);
      } finally {
        setLoading(false); // ✅ Impostiamo il caricamento a false
      }
    };

    getToken(); // Chiamiamo la funzione per ottenere il token
  }, []);

  // Una volta che i dati sono stati recuperati, aggiorniamo le opzioni dell'header
  useEffect(() => {
    if (apartmentData && tokenData) {
      // Cambiamo l'header dinamicamente solo quando i dati sono pronti

      console.log('apt data ---> :', apartmentData);

      const checkin = new Date(tokenData.checkin);
      const checkout = new Date(tokenData.checkout);
      const cin = format(checkin, "EEE dd/MM", { locale: it });
      const cout = format(checkout, "EEE dd/MM", { locale: it });
      const periodo = cin + " - " + cout;

      navigation.setOptions({
        header: () => <Header headerData={[apartmentData.nome, periodo]} />,
      });
    }
  }, [apartmentData, tokenData, navigation]);

  // DEBUG
  useEffect(() => {
    if (zoneData) {
      console.log('zone data ---> :', zoneData);
    }
  }, [zoneData, navigation]);

  // DEBUG
  useEffect(() => {
    if (partnerData) {
      console.log('partner data ---> :', partnerData);
    }
  }, [partnerData, navigation]);
    

  // Funzione chiamata al click della categoria
  const goToCategory = (zonaID,catID,cat) => {
    console.log('ID Zona:', zonaID);
    console.log('ID Cat:', catID);
    console.log('AD:', apartmentData);
    console.log('TD:', tokenData);
    navigation.navigate('List',{tokenData,apartmentData,zonaID,catID,cat});
  };

  return (
    <View style={styles.container}>
      <View style={styles.body}>
        {partnerData && Object.keys(partnerData).length > 0 ? (
          Object.keys(partnerData).map((key) => (
            <TouchableOpacity
              key={key} // Usa la chiave come identificativo
              style={styles.categoryContainer}
              onPress={() => goToCategory(zoneData._id, key,partnerData[key])} // Passa la chiave al posto di index
            >
              <Text style={styles.text}>{partnerData[key]}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={[styles.text, { fontSize: 14 }]}>Caricamento dati...</Text>
        )}

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
    fontSize: 24, 
    color: 'grey',
  },
  categoryContainer: {
    padding: 20,
    width: '80%', // Larghezza fissa per uniformità
    alignItems: 'center', // Centra il testo orizzontalmente
    backgroundColor: 'transparent',
  },
});

export default HomeScreen;
