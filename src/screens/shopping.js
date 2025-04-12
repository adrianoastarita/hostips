import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, Modal } from 'react-native';
import PartnerHeader from './header_partner';
import Constants from 'expo-constants';
import io from 'socket.io-client';  // Importa socket.io-client
import { getPromotion } from '../services/api_functions'; // Import della funzione
import { createCoupon } from '../services/api_functions'; // Import della funzione
import { getCoupon } from '../services/api_functions'; // Import della funzione
import Booking from './booking';


const { width, height } = Dimensions.get('window');

const RentalScreen = ({ navigation, route }) => {
  const { partner, apartmentData, tokenData } = route.params;
  const [productsData, setProductsData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [promotion, setPromotion] = useState(null); // Stato per la promozione
  const [modalVisible, setModalVisible] = useState(false); // Stato per il modal
  const [modalMessage, setModalMessage] = useState('Confermi di voler generare il coupon?');
  const [buttonMessage, setButtonMessage] = useState('CONFERMA');
  const [isCouponExists, setIsCouponExists] = useState(false); // Stato per verificare se il coupon esiste già
  const [onModalButtonPress, setOnModalButtonPress] = useState(() => () => {});
  const [couponCode, setCouponCode] = useState(null); // Stato per la promozione

  useEffect(() => {
    navigation.setOptions({
      header: () => <PartnerHeader headerData={[partner.catID, partner._id]} />,
    });
      
    const fetchPromotionData = async () => {
      try {
        const promotionData = await getPromotion(partner._id); // Recupero dati promozione
        setPromotion(promotionData.promozione);
      } catch (error) {
        console.error('Errore nel recupero della promozione:', error);
      }
    };

    const fetchProductsData = async () => {
      try {
        const baseUrl = Constants.expoConfig.extra.BACKEND_URL;
        const url = `${baseUrl}/public/${partner.catID}/${partner._id}/products/products.json`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Errore HTTP: ${response.status}`);
        }

        const data = await response.json();
        setProductsData(data);
      } catch (error) {
        console.error('Errore nel recupero dei dati:', error);
      }
    };

    // Assicurati che apartmentData.codice sia disponibile prima di eseguire la logica
    if (apartmentData && apartmentData.codice) {
      const generateCodeAndSetCoupon = async () => {
        try {
          const code = await generateUniqueCode();  // Ottieni un codice unico
          setCouponCode(`${apartmentData.codice}-${code}`);  // Imposta il coupon
        } catch (error) {
          console.error('Errore durante la generazione del codice:', error);
        }
      };

      // Esegui la logica solo se apartmentData.codice è disponibile
      generateCodeAndSetCoupon();
    }
      
    fetchPromotionData(); // Chiamata alla funzione per ottenere la promozione
    fetchProductsData();  // Chiamata alla funzione per ottenere i prodotti
  }, [navigation, partner, apartmentData]);


  useEffect(() => {
    // Assicurati che apartmentData.codice sia disponibile prima di eseguire la logica
    if (apartmentData && apartmentData.codice) {
      const generateCodeAndSetCoupon = async () => {
        try {
          const code = await generateUniqueCode();  // Ottieni un codice unico
          setCouponCode(`${apartmentData.codice}-${code}`);  // Imposta il coupon
        } catch (error) {
          console.error('Errore durante la generazione del codice:', error);
        }
      };

      // Esegui la logica solo se apartmentData.codice è disponibile
      generateCodeAndSetCoupon();
    }
  }, [apartmentData]); // La dipendenza su apartmentData assicura che venga eseguito ogni volta che cambia

    
  const handleNext = () => {
    if (productsData.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % productsData.length);
    }
  };

  const handlePrev = () => {
    if (productsData.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + productsData.length) % productsData.length);
    }
  };

  const generateUniqueCode = async () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    // Funzione per generare un codice alfanumerico
    const generateCode = () => {
      let code = '';
      for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters[randomIndex];
      }
      return code;
    };
    // Verifica che il codice generato non esista già
    let isUnique = false;
    let newCode = '';
    let attemptCount = 0;  // Contatore per il numero di tentativi
    while (!isUnique) {
      newCode = generateCode(); // genera un nuovo codice
      // Verifica se il codice esiste già nella collection
      const couponResponse = await getCoupon(); // Ottieni tutti i coupon
      const coupon = couponResponse.data;
      console.log('couponResponse: ',couponResponse);
      const exists = coupon.some(item => {
        const couponPart = item.codice.split('-')[1]; // Ottieni la parte dopo il trattino
        return couponPart === newCode; // Confronta solo la parte dopo il trattino
      });
      if (!exists) {
        isUnique = true; // Se il codice non esiste, è unico
      }
      attemptCount++;  // Incrementa il contatore dei tentativi
      // Se raggiungiamo la centesima iterazione, interrompiamo il ciclo per evitare infinite iterazioni
      if (attemptCount >= 100) {
        throw new Error('Impossibile generare un codice unico dopo 100 tentativi.');
      }
    }
    return newCode;
  };
    
  const openModal = async () => {
    try {
      const coupon = await getCoupon(tokenData.bookingID,partner._id);
      console.log('coupon: ',coupon);
      if (coupon.data && coupon.data.length > 0) {
        setIsCouponExists(true);
        setModalMessage("Coupon già generato!");
        setButtonMessage("Vai alle mie Prenotazioni 🍸");
        setOnModalButtonPress(() => () => {
          closeModal();
          navigation.navigate('Booking');
        });
      } else {
        setIsCouponExists(false);
        setModalMessage("Confermi di voler generare il coupon?");
        setButtonMessage("CONFERMA");

        setOnModalButtonPress(() => () => {
          // Logica per generare il coupon
          handleConfirm();
        });
      }
      setModalVisible(true);
    } catch (error) {
      console.error('Errore nella verifica del coupon:', error);
    }
  };

  const closeModal = () => {
    setModalVisible(false); // Chiude il modal
  };
    
  const handleConfirm = async () => {
    try {
        
      // Chiamata alla funzione per creare il coupon nel backend
      const createdCoupon = await createCoupon(tokenData.bookingID, partner._id, couponCode);
      // Mostra un messaggio di successo (o fai qualcosa con il coupon creato)
      setModalMessage(`${createdCoupon.codice}`);  // Puoi anche mostrarlo nel modal
      setButtonMessage(`Vai alle mie Prenotazioni 🍸`);  // Puoi anche mostrarlo nel modal
      setOnModalButtonPress(() => () => {
        closeModal();
        navigation.navigate('Booking');
      });
      setIsCouponExists(true);
    } catch (error) {
      console.error("Errore nella creazione del coupon:", error);
      setModalMessage("Si è verificato un errore nella creazione del coupon.");
    }
  };


  if (productsData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Caricamento prodotti...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Parte superiore */}
      <View style={styles.topContainer}>
        <Text style={styles.text1}>{partner.nome}</Text>
        <Text style={styles.text2}>{partner.indirizzo}</Text>
      </View>

      {/* Parte centrale */}
      <View style={styles.centralContainer}>
        <View style={styles.buttonContainer}>
          <Text style={styles.activeText}>ARTICOLI</Text>
        </View>

        {/* Contenitore per le frecce e il prodotto */}
        <View style={styles.dataContainer}>
          {/* Freccia sinistra */}
          <TouchableOpacity onPress={handlePrev} style={styles.arrowContainer}>
            <Image
              source={require('../icons/icon_back.png')}
              style={styles.arrowImage}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Prodotto */}
          <View style={styles.productContainer}>
            <Image
              source={{
                uri: (() => {
                  const imageUrl = `${Constants.expoConfig.extra.BACKEND_URL}/public/${partner.catID}/${partner._id}/products/${productsData[currentIndex].id}/product_${partner._id}_${productsData[currentIndex].id}.png`;
                  return imageUrl;
                })()
              }}
              style={styles.productImage}
              resizeMode="contain"
            />
            <Text style={styles.productName}>{productsData[currentIndex].nome}</Text>
            <Text style={styles.productPrice}>{productsData[currentIndex].prezzo}</Text>
          </View>

          {/* Freccia destra */}
          <TouchableOpacity onPress={handleNext} style={styles.arrowContainer}>
            <Image
              source={require('../icons/icon_forth.png')}
              style={styles.arrowImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Parte inferiore */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity onPress={openModal}>
          <Text style={styles.text3}>Ottieni coupon {promotion ? `-${promotion}%` : ''}</Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          
          <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
            <Image
              source={require('../icons/icon_ics.png')}
              style={styles.closeIcon}
            />
          </TouchableOpacity>
          
          <View style={styles.contentView}>
            <View style={styles.topSection}>
              <Text style={[styles.modalText, { fontSize: isCouponExists ? 24 : 16 }]}>{modalMessage}</Text>
            </View>
            <View style={styles.bottomSection}>
              <TouchableOpacity onPress={onModalButtonPress}>
                <Text style={styles.buttonText}>{buttonMessage}</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </Modal>
    </View>
  );
};

// ✅ Stili
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  topContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 10,
    width: '100%',
    height: '15%',
    backgroundColor: 'white',
  },
  centralContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    width: '100%',
    height: '70%',
    backgroundColor: 'white',
  },
  bottomContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
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
  activeText: {
    fontSize: 18,
    color: 'grey',
    textAlign: 'center',
  },
  dataContainer: {
    width: '95%',
    height: '82%',
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  productContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '70%',
  },
  productImage: {
    width: 150,
    height: 150,
    marginBottom: 10,
  },
  productName: {
    fontSize: 18,
    color: 'grey',
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 16,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  arrowContainer: {
    width: '15%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowImage: {
    width: 30,
    height: 30,
    tintColor: 'grey',
  },
  loadingText: {
    fontSize: 18,
    color: 'grey',
    textAlign: 'center',
    marginTop: 20,
  },
  text1: {
    fontSize: 24,
    color: 'grey',
    textAlign: 'center',
  },
  text2: {
    fontSize: 14,
    color: 'lightgrey',
    textAlign: 'center',
  },
  text3: {
    fontSize: 24,
    color: 'grey',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Sfumatura di sfondo
  },
  contentView: {
    flexDirection: 'column',
    width: '85%',
    height: '20%',
    backgroundColor: 'white',
    borderRadius: 20,
  },
  topSection: {
    flex: 0.6,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    borderRadius: 20,
  },
  bottomSection: {
    flex: 0.4,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  modalText: {
    color: 'black',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  buttonText: {
    color: 'grey',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  buttonText: {
    color: 'grey',
    fontSize: 16,
    textAlign: 'left',
    fontWeight: 'normal',
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
});

export default RentalScreen;


