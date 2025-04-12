import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';  // Importiamo AsyncStorage
import jwtDecode from 'jwt-decode';
import Header from './header';
import { getCoupon } from '../services/api_functions'; // Importa la funzione getCoupon
import { getPartnerList } from '../services/api_functions';

const { width, height } = Dimensions.get('window');

const BookingScreen = ({ navigation }) => {
    const [tokenData, setTokenData] = useState(null);
    const [coupons, setCoupons] = useState([]);
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true); // Stato di caricamento
    const [error, setError] = useState(null); // Stato per eventuali errori

    useEffect(() => {
        
        navigation.addListener('focus', () => {
          fetchCoupons();  // Ricarica i coupon quando la schermata diventa visibile
        });
        
        navigation.setOptions({
            header: () => <Header headerData={['Prenotazioni','']} />,
        });

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
                            console.log(tokenData);
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

        const fetchCoupons = async () => {
            try {
                const couponResponse = await getCoupon(); // Ottieni tutti i coupon
                const coupon = couponResponse.data; // I dati restituiti dal backend
                if (coupon && coupon.length > 0) {
                    setCoupons(coupon); // Imposta lo stato con i coupon ottenuti
                } else {
                    setCoupons([]); // Imposta un array vuoto se non ci sono coupon
                }

                let newCards = []; // Array temporaneo per memorizzare le nuove cards
                for (let couponItem of coupon) {
                    try {
                        // Recupero dei dati del partner
                        const partner = await getPartnerList(null,null,couponItem.partnerID);
                        // Creazione della card
                        const card = {
                        codice: couponItem.codice,
                        partner: partner.data[0].nome,
                        promozione: partner.data[0].promozione
                        };
                        console.log('# card: ',card)
                        // Aggiungi la card all'array temporaneo
                        newCards.push(card);
                    } catch (error) {
                        console.error("Errore durante il recupero dei dati del partner:", error);
                    }
                }
                setCards(newCards);

            } catch (error) {
                console.error('Errore durante il recupero dei coupon:', error);
                setError('Si è verificato un errore durante il caricamento delle prenotazioni.');
            } finally {
                setLoading(false); // Imposta lo stato di caricamento a false quando la richiesta è completata
            }
        };
        
        getToken();
    }, [navigation]);

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="blue" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.body}>
                {coupons.length === 0 ? (
                    <Text style={styles.text}>Non hai prenotazioni..</Text>
                ) : (
                    <ScrollView>
                        {cards.map((card, index) => (
                            <View key={index} style={styles.couponCard}>
                              <Text style={styles.couponText}>{card.partner}</Text>
                              <Text style={styles.couponTitle}>{card.codice}</Text>
                              <Text style={styles.couponText}>Promozione: -{card.promozione}%</Text>
                                {/* Aggiungi ulteriori dettagli delle prenotazioni come preferisci */}
                            </View>
                        ))}
                    </ScrollView>
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
        paddingHorizontal: 20,
    },
    text: {
        fontSize: 24,
        color: 'grey',
    },
    couponCard: {
        backgroundColor: '#f5f5f5',
        padding: 15,
        marginTop: 10,
        borderRadius: 10,
        width: width - 40,
        elevation: 5, // Per aggiungere un'ombra
    },
    couponTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    couponText: {
        fontSize: 16,
        color: '#555',
    },
});

export default BookingScreen;


