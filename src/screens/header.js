import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, Modal } from 'react-native';
import Menu from './menu'; // Importiamo il componente Menu

const { width, height } = Dimensions.get("window");

const CustomHeader = ({ headerData }) => {
  const [isOverlayVisible, setOverlayVisible] = useState(false);

  if (!headerData || headerData.length === 0) {
    return null;
  }

  // Funzione per aprire l'overlay
  const openOverlay = () => {
    setOverlayVisible(true);
  };

  // Funzione per chiudere l'overlay
  const closeOverlay = () => {
    setOverlayVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.upperContainer}>
        <View style={styles.leftContainer}>
          <Text style={styles.text1}>{headerData[0]}</Text>
          <Text style={styles.text2}>{headerData[1]}</Text>
        </View>
        <TouchableOpacity onPress={openOverlay}>
          <View style={styles.rightContainer}>
            <Image source={require('../icons/icon_menu.png')} style={[styles.icon, { tintColor: 'gray' }]} />
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.separator} />

      {/* Modal: visibile solo se isOverlayVisible è true */}
      {isOverlayVisible && (
        <Modal
          transparent={true}
          visible={isOverlayVisible}
          onRequestClose={closeOverlay}
        >
          <Menu closeOverlay={closeOverlay} />
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: height * 0.12,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  upperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  leftContainer: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  text1: {
    fontSize: 24,
    color: 'grey',
  },
  text2: {
    fontSize: 14,
    color: 'lightgrey',
  },
  rightContainer: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  icon: {
    width: 25,
    height: 25,
  },
  separator: {
    width: width * 0.94,
    height: 1,
    backgroundColor: '#D3D3D3',
    marginTop: 5,
  },
});

export default CustomHeader;
