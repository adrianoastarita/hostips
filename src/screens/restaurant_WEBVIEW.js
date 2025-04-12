import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Modal, Image } from 'react-native';
import PartnerHeader from './header_partner';
import Constants from 'expo-constants'; // Importa expo-constants per accedere a app.json
import { getPromotion } from '../services/api_functions'; // Import della funzione
import { WebView } from 'react-native-webview'; // Importa WebView

const { width, height } = Dimensions.get('window');

const RestaurantScreen = ({ navigation, route }) => {
  const { partner } = route.params;  // Recupera i parametri dalla route
  const [selectedTab, setSelectedTab] = useState('menu');  // Stato per il tasto selezionato ("menu" o "recensioni")
  const [menuData, setMenuData] = useState(null);
  const [promotion, setPromotion] = useState(null); // Stato per la promozione
  const [isWebViewVisible, setIsWebViewVisible] = useState(false); // Stato per WebView
  const [baseUrl, setBaseUrl] = useState('');  // Aggiungi uno stato per il baseUrl

  console.log('siamo su: ', partner.nome);

  useEffect(() => {
    navigation.setOptions({
        header: () => <PartnerHeader headerData={[partner.catID, partner._id]} />,
    });

    const fetchPromotionData = async () => {
        try {
          const promotionData = await getPromotion(partner._id); // Recupero dati promozione
          setPromotion(promotionData.promozione);
          console.log("Dati della promozione ricevuti:", JSON.stringify(promotionData, null, 2));
        } catch (error) {
          console.error('Errore nel recupero della promozione:', error);
        }
    };
      
    const fetchMenuData = async () => {
      try {
        const baseUrl = Constants.expoConfig.extra.BACKEND_URL;
        setBaseUrl(baseUrl);  // Imposta baseUrl nello stato
        const url = `${baseUrl}/public/${partner.catID}/${partner._id}/menu/menu_${partner._id}.json`;

        console.log(`Fetching menu from: ${url}`);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Errore HTTP: ${response.status}`);
        }

        const data = await response.json();
        setMenuData(data);
      } catch (error) {
        console.error('Errore nel recupero dei dati:', error);
      }
    };

    fetchPromotionData();
    fetchMenuData();

  }, [navigation, partner]);

  // Funzione per gestire il cambio di tab
  const handleTabChange = (tab) => {
    setSelectedTab(tab);  // Aggiorna lo stato con il tab selezionato
  };

  // Funzione per aprire la WebView
  const handleOpenWebView = () => {
    setIsWebViewVisible(true);
  };

  // Funzione per chiudere il Modal/WebView
  const handleCloseWebView = () => {
    setIsWebViewVisible(false);
  };

  return (
    <View style={styles.container}>
      
          
      <Modal
        visible={isWebViewVisible}
        animationType="slide" // Per animare l'apertura e la chiusura del Modal
        transparent={true} // Rendi il background del Modal trasparente
        onRequestClose={handleCloseWebView} // Chiusura quando l'utente tocca fuori dal Modal
      >
        <View style={styles.modalContainer}>
          <View style={styles.webviewContainer}>
          <WebView
            source={{ uri: `${baseUrl}/public/bookingWidgetTest/booking_widget_test.html` }} // Usa baseUrl dallo stato
            style={styles.webview} // Aggiungi uno stile esplicito
            onError={(e) => console.log('Errore WebView:', e.nativeEvent)} // Gestione degli errori della WebView
            onLoad={() => console.log('WebView Caricata con successo!')} // Log quando la WebView è stata caricata
          />
          </View>
          <TouchableOpacity onPress={handleCloseWebView} style={styles.closeButton}>
            <Image
              source={require('../icons/icon_ics.png')}  // Inserisci il percorso dell'immagine
              style={styles.closeIcon} // Aggiungi uno stile per l'immagine
            />
          </TouchableOpacity>
          </View>
      </Modal>

      {/* Contenuto principale */}
      {!isWebViewVisible && (
        <View style={styles.topContainer}>
          <Text style={styles.text1}>{partner.nome}</Text>
          <Text style={styles.text2}>{partner.indirizzo}</Text>
        </View>
      )}

      <View style={styles.centralContainer}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => handleTabChange('menu')}
          >
            <Text style={[selectedTab === 'menu' ? styles.activeText : styles.inactiveText]}>MENÙ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => handleTabChange('recensioni')}
          >
            <Text style={[selectedTab === 'recensioni' ? styles.activeText : styles.inactiveText]}>RECENSIONI</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dataContainer}>
          {selectedTab === 'menu' ? (
            menuData ? (
              <ScrollView style={{ margin: 20 }}>
                {menuData.menu.map((section, index) => (
                  <View key={index} style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>{section.category}</Text>
                    {section.dishes.map((dish, dishIndex) => (
                      <View key={dishIndex} style={styles.dishContainer}>
                        <Text style={styles.dishName}>{dish.name}</Text>
                        <Text style={styles.dishDescription}>{dish.description}</Text>
                        <Text style={styles.dishPrice}>€{dish.price.toFixed(2)}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text>Caricamento del menù...</Text>
            )
          ) : (
            <Text>Nessuna recensione disponibile.</Text>
          )}
        </View>
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity onPress={handleOpenWebView}>
          <Text style={styles.text3}>Prenota ora ({promotion ? `-${promotion}%` : ''})</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  topContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: '10',
    width: '100%',
    height: '15%',
    backgroundColor: 'white',
  },
  centralContainer: {
    flexDirection: 'column',
    justifyContent: 'center', // ✅ Centra verticalmente
    alignItems: 'center', // ✅ Centra orizzontalmente
    padding: 5,
    width: '100%',
    height: '70%',
    backgroundColor: 'white',
  },
  bottomContainer: {
    flexDirection: 'column',
    justifyContent: 'center', // ✅ Centra verticalmente
    alignItems: 'center', // ✅ Centra orizzontalmente
    width: '100%',
    height: '15%',
    backgroundColor: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '15%',
  },
  tabButton: {
    width: '50%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeText: {
    fontSize: 18,
    color: 'grey',
    textAlign: 'center', // ✅ Centra il testo nei bottoni
  },
  inactiveText: {
    fontSize: 18,
    color: 'lightgray',
    textAlign: 'center', // ✅ Centra il testo nei bottoni
  },
  dataContainer: {
    width: '95%',
    height: '82%',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionContainer: {
    marginBottom: 20,
    alignItems: 'center', // ✅ Centra le sezioni del menu
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'grey',
    marginBottom: 10,
    textAlign: 'center', // ✅ Centra il testo dei titoli
  },
  dishContainer: {
    marginBottom: 10,
    alignItems: 'center', // ✅ Centra le informazioni sui piatti
  },
  dishName: {
    fontSize: 18,
    color: 'black',
    textAlign: 'center', // ✅ Centra il testo del nome
  },
  dishDescription: {
    fontSize: 14,
    color: 'grey',
    textAlign: 'center', // ✅ Centra la descrizione
  },
  dishPrice: {
    fontSize: 16,
    color: 'green',
    fontWeight: 'bold',
    textAlign: 'center', // ✅ Centra il prezzo
  },
  text1: {
    fontSize: 24,
    color: 'grey',
    textAlign: 'center', // ✅ Centra il testo del nome del partner
  },
  text2: {
    fontSize: 14,
    color: 'lightgrey',
    textAlign: 'center', // ✅ Centra l'indirizzo
  },
  text3: {
    fontSize: 24,
    color: 'black',
    textAlign: 'center', // ✅ Centra il testo del bottone Prenota ora
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Sfondo scuro semi-trasparente
    justifyContent: 'center',
    alignItems: 'center',
  },
  webviewContainer: {
    width: width * 0.9,
    height: height * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
    borderRadius: 20,
  },
  closeIcon: {
    width: 30, // Imposta la dimensione dell'icona
    height: 30, // Imposta la dimensione dell'icona
    tintColor: 'white',
  },
  webview: {
    width: width * 0.8,
    height: height * 0.8,
    backgroundColor: 'white',
    borderRadius: 10,
  },
});

export default RestaurantScreen;

