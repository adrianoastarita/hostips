import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Modal, Image, FlatList, Button } from 'react-native';
import PartnerHeader from './header_partner';
import Constants from 'expo-constants'; // Importa expo-constants per accedere a app.json
import { getPromotion } from '../services/api_functions'; // Import della funzione
import { WebView } from 'react-native-webview'; // Importa WebView

import { format, startOfMonth, endOfMonth, addMonths, subMonths, eachDayOfInterval, startOfWeek, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import Calendar from './calendar.js';

const { width, height } = Dimensions.get('window');

const RestaurantScreen = ({ navigation, route }) => {
  const { partner, apartmentData, tokenData } = route.params;
  const [selectedTab, setSelectedTab] = useState('menu');  // Stato per il tasto selezionato ("menu" o "recensioni")
  const [menuData, setMenuData] = useState(null);
  const [promotion, setPromotion] = useState(null); // Stato per la promozione
  const [isWebViewVisible, setIsWebViewVisible] = useState(false); // Stato per WebView
  const [baseUrl, setBaseUrl] = useState('');  // Aggiungi uno stato per il baseUrl

  const availableDates = eachDayOfInterval({
    start: parseISO(tokenData.checkin),
    end: parseISO(tokenData.checkout),
  });

  const guestOption = Array.from({ length: 10 }, (_, i) => i + 1);
  const timeOption = ["12:00", "12:30", "13:00", "13:30", "14:00","19:30","20:00","20:30","21:00","21:30","22:00"];

  const [guestNumber, setGuestNumber] = useState("2");
  const [reservationTime, setReservationTime] = useState("20:30");
  const [isGuestDropdownOpen, setIsGuestDropdownOpen] = useState(false);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);

  const toggleGuestDropdown = () => setIsGuestDropdownOpen(!isGuestDropdownOpen);
  const toggleTimeDropdown = () => setIsTimeDropdownOpen(!isTimeDropdownOpen);

  const handleGuestSelect = (value) => {
    setGuestNumber(value);
    setIsGuestDropdownOpen(false);
  };

  const handleTimeSelect = (value) => {
    setReservationTime(value);
    setIsTimeDropdownOpen(false);
  };

  const [selectedDate, setSelectedDate] = useState(null); // Stato per la data selezionata
  
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
    setSelectedDate(null);
  };

  // Funzione per aprire il popoup di conferma
  const handleOpenPopup = () => {
    setPopupVisible(true);
  };

  // Funzione per chiudere il popup di conferma
  const handleClosePopup = () => {
    setPopupVisible(false);
  };

  useEffect(() => {
    if (!popupVisible) {
      handleCloseWebView();
    }
  }, [popupVisible]);

  return (
    <View style={styles.container}>
  
      <Modal visible={isWebViewVisible} animationType="slide" transparent={true} onRequestClose={handleCloseWebView} >
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={handleCloseWebView} style={styles.closeButton}>
            <Image
              source={require('../icons/icon_ics.png')}
              style={styles.closeIcon}
            />
          </TouchableOpacity>

          {/* Contenitore con topView e bottomView */}
          <View style={styles.modalContentContainer}>
            <View style={styles.modalTopView}>
              <View style={styles.modalTopLeftView}>
                <Image source={require('../icons/icon_guests.png')} style={styles.optionIcon} />
                  {/* Dropdown per il numero di ospiti */}
                  <TouchableOpacity onPress={toggleGuestDropdown}>
                    <Text style={styles.guestText}>{guestNumber}</Text>
                  </TouchableOpacity>
                  {/* Dropdown per la selezione del numero di ospiti */}
                  {isGuestDropdownOpen && (
                    <View style={styles.guestDropdown}>
                      <FlatList
                        data={guestOption}
                        keyExtractor={(item) => item.toString()}
                        renderItem={({ item }) => (
                          <TouchableOpacity onPress={() => handleGuestSelect(item)}>
                            <Text style={styles.itemText}>{item}</Text>
                          </TouchableOpacity>
                        )}
                        showsVerticalScrollIndicator={false}
                      />
                    </View>
                  )}
              </View>

              <View style={styles.modalTopRightView}>
                  {/* Dropdown per l'orario */}
                  <TouchableOpacity onPress={toggleTimeDropdown}>
                    <Text style={styles.timeText}>{reservationTime}</Text>
                  </TouchableOpacity>
                  {/* Dropdown per la selezione dell'orario */}
                  {isTimeDropdownOpen && (
                    <View style={styles.timeDropdown}>
                      <FlatList
                        data={timeOption}
                        keyExtractor={(item) => item.toString()}
                        renderItem={({ item }) => (
                          <TouchableOpacity onPress={() => handleTimeSelect(item)}>
                            <Text style={styles.itemText}>{item}</Text>
                          </TouchableOpacity>
                        )}
                        showsVerticalScrollIndicator={false}
                      />
                    </View>
                  )}
                <Image source={require('../icons/icon_clock.png')} style={styles.optionIcon} />
              </View>
            </View>
      
            <View style={styles.modalMainView} >
              <Calendar onDateSelect={(date) => setSelectedDate(date)} availableDates={availableDates} initialDate={tokenData.checkin}/>
            </View>
      
            <View style={styles.modalBottomView}>
              <TouchableOpacity onPress={handleOpenPopup} disabled={!selectedDate}>
                <Text style={[styles.text3,{color: selectedDate ? 'grey' : 'lightgrey',},]}>PRENOTA</Text>
              </TouchableOpacity>
            </View>

            {/* Modal di conferma */}
            <Modal visible={popupVisible} transparent={true} onRequestClose={handleClosePopup}>
              <View style={styles.popupBackground}>
                <View style={styles.popupContent}>
                  <Text style={styles.popupTitleText}>La tua prenotazione</Text>
                  <Text style={styles.popupText}>{selectedDate ? selectedDate.toLocaleDateString() : ''}</Text>
                  <Text style={styles.popupText}>Ore {reservationTime}</Text>
                  <Text style={styles.popupText}>{guestNumber} Ospiti</Text>
                  <View style={styles.popupActions}>
                    <Button title="Annulla" onPress={handleClosePopup} />
                    <Button title="Conferma" onPress={() => {
                      // Aggiungi qui la logica per confermare la prenotazione
                      console.log('Prenotazione confermata');
                      handleClosePopup();
                    }} />
                  </View>
                </View>
              </View>
            </Modal>

          </View>
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
  modalContentContainer: {
    width: '90%',
    height: '55%',
    backgroundColor: 'transparent',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalTopView: {
    flex: 0.15,
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  modalTopLeftView: {
    flex: 0.5,
    flexDirection: 'row',
    backgroundColor: 'white',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingLeft: 5,
    position: 'relative',
  },
  modalTopRightView: {
    flex: 0.5,
    flexDirection: 'row',
    backgroundColor: 'white',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingRight: 5,
  },
  modalMainView: {
    flex: 0.7,
    backgroundColor: 'white',
  },
  modalBottomView: {
    flex: 0.15,
    backgroundColor: 'white',
    justifyContent: 'flex-start',
    paddingTop: 20,
    alignItems: 'center',
  },
  optionIcon: {
    width: '40%',
    height: '40%',
  resizeMode: 'contain',
  },
  guestText: {
    fontSize: 16,
    color: 'black',
    width: 50,
    textAlign: 'center',
    backgroundColor: 'white',
  },
  guestDropdown: {
   width: 50,
    position: 'absolute',
    top: 30, // distanza dall'alto dell'icona
    left: '50%', // distanza dall'icona
    transform: [{ translateX: -12.5 }], // larghezza della width x0.25...
    backgroundColor: 'white',
    zIndex: 1000,
    elevation: 6, // per Android shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderRadius: 4,
    paddingVertical: 4,
    maxHeight: height * 0.2,
  },
  timeText: {
    fontSize: 16,
    color: 'black',
    width: 100,
    textAlign: 'center',
    backgroundColor: 'white',
  },
  timeDropdown: {
    width: 100,
    position: 'absolute',
    top: 30, // distanza dall'alto dell'icona
    left: '50%', // distanza dall'icona
    transform: [{ translateX: -75 }], // larghezza della width x0.75...
    backgroundColor: 'white',
    zIndex: 1000,
    elevation: 6, // per Android shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderRadius: 4,
    paddingVertical: 4,
    maxHeight: height * 0.2,
  },
  itemText: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
  },

  popupBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Sfondo semitrasparente
  },
  popupContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  popupText: {
    fontSize: 18,
    marginBottom: 5,
    textAlign: 'center',
  },
  popupTitleText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  popupActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },

});

export default RestaurantScreen;

