import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image } from 'react-native';
import PartnerHeader from './header_partner';
import Constants from 'expo-constants';
import { getPromotion } from '../services/api_functions'; // Import della funzione

const { width, height } = Dimensions.get('window');

const RentalScreen = ({ navigation, route }) => {
  const { partner, apartmentData, tokenData } = route.params;
  const [productsData, setProductsData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [promotion, setPromotion] = useState(null); // Stato per la promozione

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

    const fetchProductsData = async () => {
      try {
        const baseUrl = Constants.expoConfig.extra.BACKEND_URL;
        const url = `${baseUrl}/public/${partner.catID}/${partner._id}/products/products.json`;

        console.log(`Fetching menu from: ${url}`);
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

    fetchPromotionData(); // Chiamata alla funzione per ottenere la promozione
    fetchProductsData();  // Chiamata alla funzione per ottenere i prodotti
  }, [navigation, partner]);

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
                      console.log('Image URL:', imageUrl);
                      return imageUrl;
                    })()
                  }}
                  style={styles.productImage}
                  resizeMode="contain"
              />
              <Text style={styles.productName}>{productsData[currentIndex].nome}</Text>
              <Text style={styles.productPrice}>{productsData[currentIndex].prezzo} €/h</Text>
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
        <Text style={styles.text3}>Ottieni coupon {promotion ? `-${promotion}%` : ''}</Text>
      </View>
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
});

export default RentalScreen;

