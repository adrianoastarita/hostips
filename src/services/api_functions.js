// src/services/api_functions.js

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const backendUrl = Constants.expoConfig.extra.BACKEND_URL;

// Funzione per verificare la password
export const handleAccessButtonPress = async (password) => {
  try {
    const response = await axios.post(`${backendUrl}/api/verify-password`, { password });
    if (response && response.data) {
      if (response.data.success) {
        // ✅ Salviamo il token in AsyncStorage
        await AsyncStorage.setItem('token', response.data.token); 
        console.log('Token salvato');
        // Restituiamo il token anche al chiamante
        return { success: true, message: response.data.message, token: response.data.token };
      } else {
        return { success: false, message: response.data.message };
      }
    }
  } catch (error) {
    console.error("Errore durante la richiesta al backend:", error);
    if (error.response) {
      console.error("Errore nella risposta del server:", error.response);
    } else if (error.request) {
      console.error("La richiesta è stata fatta ma non c'è risposta:", error.request);
    } else {
      console.error("Errore durante la configurazione della richiesta:", error.message);
    }
    return { success: false, message: 'Errore di connessione: Impossibile connettersi al server.' };
  }
};

// Funzione per importare dati appartamento
export const getApartmentData = async (aptID) => {
  try {
    // Effettua la richiesta GET per ottenere i dettagli dell'appartamento
    const response = await axios.get(`${backendUrl}/api/apt-list/${aptID}`);
    // Se la richiesta ha successo, ritorna i dati dell'appartamento
    if (response && response.data) {
      console.log('Dettagli dell\'appartamento:', response.data);
      return { success: true, data: response.data };
    } else {
      return { success: false, message: 'Nessun dato trovato.' };
    }
  } catch (error) {
    // Gestione degli errori
    console.error('Errore durante la richiesta al backend (getAparmentData):', error);
    // Se la richiesta ha fallito, restituiamo un messaggio di errore
    if (error.response) {
      console.error('Errore nella risposta del server:', error.response);
      return { success: false, message: `Errore del server: ${error.response.status}` };
    } else if (error.request) {
      console.error('La richiesta è stata fatta ma non c\'è risposta:', error.request);
      return { success: false, message: 'Errore di rete: Nessuna risposta dal server' };
    } else {
      console.error('Errore durante la configurazione della richiesta:', error.message);
      return { success: false, message: `Errore: ${error.message}` };
    }
  }
};

// Funzione per importare dati zona
export const getZoneData = async (zoneID) => {
  try {
    const response = await axios.get(`${backendUrl}/api/zone-data/${zoneID}`);
    if (response && response.data) {
      return { success: true, data: response.data };
    } else {
      return { success: false, message: 'Nessun dato trovato.' };
    }
  } catch (error) {
    // Gestione degli errori
    console.error('Errore durante la richiesta al backend (getZoneData):', error);
    // Se la richiesta ha fallito, restituiamo un messaggio di errore
    if (error.response) {
      console.error('Errore nella risposta del server:', error.response);
      return { success: false, message: `Errore del server: ${error.response.status}` };
    } else if (error.request) {
      console.error('La richiesta è stata fatta ma non c\'è risposta:', error.request);
      return { success: false, message: 'Errore di rete: Nessuna risposta dal server' };
    } else {
      console.error('Errore durante la configurazione della richiesta:', error.message);
      return { success: false, message: `Errore: ${error.message}` };
    }
  }
};

//Funzione per importare le categorie con dei partner nella zona desiderata
export const getPartnerZoneData = async (zoneID=null) => {
  try {
    const url = (zoneID) ? `${backendUrl}/api/partner-zone/${zoneID}` : `${backendUrl}/api/partner-zone`
    const response = await axios.get(url);
    if (response && response.data) {
      return { success: true, data: response.data };
    } else {
      return { success: false, message: 'Nessun dato trovato.' };
    }
  } catch (error) {
    // Gestione degli errori
    console.error('Errore durante la richiesta al backend (getPartnerData):', error);
    // Se la richiesta ha fallito, restituiamo un messaggio di errore
    if (error.response) {
      console.error('Errore nella risposta del server:', error.response);
      return { success: false, message: `Errore del server: ${error.response.status}` };
    } else if (error.request) {
      console.error('La richiesta è stata fatta ma non c\'è risposta:', error.request);
      return { success: false, message: 'Errore di rete: Nessuna risposta dal server' };
    } else {
      console.error('Errore durante la configurazione della richiesta:', error.message);
      return { success: false, message: `Errore: ${error.message}` };
    }
  }
};

// Funzione per importare i partner associati alla categoria e alla zona
export const getPartnerList = async (zoneID=null, catID=null, partnerID=null) => {
  try {
    let url = `${backendUrl}/api/partner-list`;
    const params = new URLSearchParams();
    if (zoneID && catID) {
      params.append("zoneID", zoneID);
      params.append("catID", catID);
    } else if (partnerID) {
      params.append("partnerID", partnerID);
    } else {
      throw new Error("Nessun parametro valido passato per la ricerca dei partner.");
    }
    url += `?${params.toString()}`;
    
    console.log('API_FUNCTION --->', url, partnerID);
    const response = await axios.get(url);
    if (response && response.data) {
      return { success: true, data: response.data };
    } else {
      return { success: false, message: 'Nessun dato trovato.' };
    }
  } catch (error) {
    console.error('Errore durante la richiesta al backend (getPartnerList):', error);
    if (error.response) {
      console.error('Errore nella risposta del server:', error.response);
      return { success: false, message: `Errore del server: ${error.response.status}` };
    } else if (error.request) {
      console.error('La richiesta è stata fatta ma non c\'è risposta:', error.request);
      return { success: false, message: 'Errore di rete: Nessuna risposta dal server' };
    } else {
      console.error('Errore durante la configurazione della richiesta:', error.message);
      return { success: false, message: `Errore: ${error.message}` };
    }
  }
};

// Funzione per importare la promozione del partner
export const getPromotion = async (partnerID) => {
  try {
    const response = await axios.get(`${backendUrl}/api/get-promotion/${partnerID}`);
    return response.data; // restituisce gli appartamenti trovati
  } catch (error) {
    console.error('Errore nel caricamento della promozione:', error);
    throw error;
  }
};

// Funzione per creare un coupon
export const createCoupon = async (bookingID, partnerID, codice) => {
  try {
    const payload = {
      bookingID: bookingID,
      partnerID: partnerID,
      codice: codice,
    };

    // Fai una richiesta POST al backend
    const response = await axios.post(`${backendUrl}/api/new-coupon`, payload);

    // Se la richiesta ha successo, la risposta conterrà il nuovo oggetto creato
    console.log("Coupon creato con successo:", response.data);
    return response.data; // Restituisci i dati ricevuti (se hai bisogno di fare qualcos'altro con la risposta)
  } catch (error) {
    console.error("Errore nella creazione del coupon:", error);
    throw error; // Rilancia l'errore se vuoi gestirlo più avanti
  }
};

// Funzione per controllare l'esistenza di un coupon
export const getCoupon = async (bookingID=null,partnerID=null) => {
    try {
        // Passa anche catID alla richiesta
        const url = (bookingID && partnerID) ? `${backendUrl}/api/get-coupon/${bookingID}/${partnerID}` : `${backendUrl}/api/get-coupon`
        const response = await axios.get(url);
        if (response && response.data) {
            return { success: true, data: response.data };
        } else {
            return { success: false, message: 'Nessun dato trovato.' };
        }
    } catch (error) {
        console.error('Errore durante la richiesta al backend (get-coupon):', error);
        if (error.response) {
            console.error('Errore nella risposta del server:', error.response);
            return { success: false, message: `Errore del server: ${error.response.status}` };
        } else if (error.request) {
            console.error('La richiesta è stata fatta ma non c\'è risposta:', error.request);
            return { success: false, message: 'Errore di rete: Nessuna risposta dal server' };
        } else {
            console.error('Errore durante la configurazione della richiesta:', error.message);
            return { success: false, message: `Errore: ${error.message}` };
        }
    }
};

// Funzione per importare le prenotazioni dell'ospite
export const getReservations = async (bookingID) => {
  try {
    const response = await axios.get(`${backendUrl}/api/get-reservations/${bookingID}`);
    return response.data; // restituisce le prenotazioni trovate
  } catch (error) {
    console.error('Errore nel caricamento delle prenotazioni:', error);
    throw error;
  }
};
