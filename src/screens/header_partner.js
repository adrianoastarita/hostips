import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import Constants from 'expo-constants'; // Importa expo-constants per accedere a app.json

const { width, height } = Dimensions.get("window"); // Otteniamo l'altezza dello schermo

const header_height = height * 0.3;

const PartnerHeader = ({ headerData }) => {
  // Recupera l'URL base dal file app.json
  const baseUrl = Constants.expoConfig.extra.BACKEND_URL;
  
  // Costruisci l'URL completo dell'immagine
  const coverImageUrl = `${baseUrl}/public/${headerData[0]}/${headerData[1]}/cover/cover_${headerData[1]}.png`;

  return (
    <View style={styles.container}>
      <Image 
        source={{ uri: coverImageUrl }}  // Utilizziamo 'uri' per caricare l'immagine da un URL
        style={styles.image}
        resizeMode="cover" // 'cover' per adattare l'immagine mantenendo le proporzioni
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: header_height,  // Imposta l'altezza del container principale
    justifyContent: 'top', // Centra verticalmente tutto il contenuto
    alignItems: 'center',  // Centra orizzontalmente tutto il contenuto
    backgroundColor: 'white',
    // Ombra per iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0, 
      height: 5, // Ombra verso il basso
    },
    shadowOpacity: 0.3, // Opacità dell'ombra
    shadowRadius: 6, // Raggio di diffusione dell'ombra
    // Ombra per Android
    elevation: 6, // Intensità dell'ombra su Android
  },
  image: {
    width: width,
    height: header_height,
  },
});

export default PartnerHeader;
