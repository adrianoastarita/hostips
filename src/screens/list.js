import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { getPartnerList } from '../services/api_functions';
import Header from './header';
import MapView, { Marker } from 'react-native-maps'; // Importa Marker da react-native-maps


const List = ({ navigation, route }) => {
  const { tokenData, apartmentData, zonaID, catID, cat } = route.params;  // Recupera i parametri dalla route
  const [partnerList, setPartnerList] = useState(null);  // Stato per i dati dei partner
  const [loading, setLoading] = useState(true);  // Stato di caricamento
  const [error, setError] = useState(null);  // Stato per gestire gli errori

  useEffect(() => {
    navigation.setOptions({
        header: () => <Header headerData={[cat, '']} />,
    });
}, [navigation]);

  useEffect(() => {
    const fetchPartnerList = async () => {
      try {
        const result = await getPartnerList(zonaID, catID);  // Chiamata alla funzione getPartnerList
        if (result.success) {
          setPartnerList(result.data);  // Imposta i dati ricevuti
        } else {
          setError(result.message);  // Gestisce il caso di errore
        }
      } catch (error) {
        setError('Errore di rete');  // Gestisce gli errori generali
      } finally {
        setLoading(false);  // Imposta il caricamento come finito
      }
    };

    fetchPartnerList();  // Chiamata della funzione per ottenere i dati

  }, [zonaID, catID]);  // Ricorri quando i parametri cambiano

  const mapRef = useRef(null);
  // Zoom sulla mappa per tutti i marker (partner + apartmentData)
  useEffect(() => {
    if (partnerList && apartmentData && mapRef.current) {
      // Raccogli tutte le coordinate
      const coordinates = [
        {
          latitude: apartmentData.coord[0], 
          longitude: apartmentData.coord[1],
        },
        ...partnerList.map(partner => ({
          latitude: partner.coord[0],
          longitude: partner.coord[1],
        })),
      ];

      // Fai zoom sulla mappa per adattarla alle coordinate
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [partnerList]);


  // DEBUG
  useEffect(() => {
    if (partnerList) {
      console.log('partner list ---> :', partnerList);
    }
  }, [partnerList, navigation]);

  const handlePress = (partner) => {
    console.log(`Hai premuto su: ${partner.nome}`);
    
    switch (partner.catID) {
      case '67cf2eba4745ff5d51260826':
        navigation.navigate('Restaurant', { partner, apartmentData, tokenData });
        break;
      case '67cf2eca4745ff5d51260827':
        navigation.navigate('Shopping', { partner, apartmentData, tokenData });
        break;
        case '67cf2ee64745ff5d51260829':
          navigation.navigate('Rental', { partner, apartmentData, tokenData });
          break;
      default:
        navigation.navigate('Restaurant', { partner, apartmentData, tokenData }); // Navigazione di default
        break;
    }
  };
  
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={[styles.text, { fontSize: 14 }]}>Caricamento dati...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* View superiore (50%) */}
      <View style={styles.topSection}>
        <View style={styles.mapContainer}>
        <MapView style={styles.map} ref={mapRef}>
          {/* Aggiungi Marker per ogni partner */}
          {partnerList.map((partner, index) => {
            // Verifica che il campo "coord" sia presente e contenga due numeri
            if (partner.coord && partner.coord.length === 2) {
              return (
                <Marker
                  key={index}
                  coordinate={{
                    latitude: partner.coord[0],  // Latitudine dal campo coord
                    longitude: partner.coord[1], // Longitudine dal campo coord
                  }}
                  title={partner.nome}  // Mostra il nome come titolo
                  description={partner.indirizzo}  // Mostra l'indirizzo come descrizione
                >
                  <Image
                    source={require('../icons/icon_marker.png')}
                    style={{
                      width: 30,
                      height: 30,
                      resizeMode: 'contain', // Per mantenere le proporzioni
                    }}
                  />
                </Marker>
                      
              );
            }
            return null; // Se "coord" non è presente o non valido, non aggiungere il marker
          })}
          <Marker
            coordinate={{
              latitude: apartmentData.coord[0],
              longitude: apartmentData.coord[1],
            }}
            title={apartmentData.nome}
            description={apartmentData.indirizzo}
            anchor={{ x: 0.5, y: 0.5 }} // Centra l'icona sul punto
          >
            <Image
              source={require('../icons/map_home.png')}
              style={{
                width: 20,
                height: 20,
                resizeMode: 'contain', // Per mantenere le proporzioni
              }}
            />
          </Marker>
        </MapView>

        </View>
      </View>
  
      {/* View inferiore (50%) */}
      <View style={styles.bottomSection}>
        {partnerList ? (
          partnerList.map((partner, index) => (
            <View key={index} style={styles.partnerWrapper}>
              <TouchableOpacity
                onPress={() => handlePress(partner)}
                activeOpacity={0.7}
                style={styles.partnerContainer}
              >
                <Text style={styles.text}>{partner.nome}</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={[styles.text, { fontSize: 14 }]}>
            Nessun partner trovato
          </Text>
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
  topSection: {
    flex: 0.5, // Occupa il 50% della schermata
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', // Colore di sfondo per distinguere
  },

  mapContainer: {
    width: '95%', // Larghezza 95% della sezione topSection
    height: '95%', // Altezza 95% della sezione topSection
    backgroundColor: 'white', // Colore per visualizzare meglio la sezione interna
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'black', // Ombra leggera per staccarla visivamente
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Ombra su Android
  },

  map: {
    width: '100%',
    height: '100%',
  },

  bottomSection: {
    flex: 0.5, // Occupa il 50% della schermata
    padding: 20,
    justifyContent: 'top',
    alignItems: 'center',
    backgroundColor: 'transparent', // Colore di sfondo per distinguere
  },
  text: {
    fontSize: 24, 
    color: 'grey',
  },
  partnerContainer: {
    padding: 15,
    width: '90%', // Larghezza fissa per uniformità
    alignItems: 'center', // Centra il testo orizzontalmente
    backgroundColor: 'transparent',
  },
  partnerWrapper: {
    width: '90%', // Larghezza uniforme per ogni partner
    alignItems: 'center', // Centra ogni partner orizzontalmente
  },
});

export default List;
