import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';

const Menu = ({ closeOverlay }) => {
  return (
    <View style={styles.overlay}>
      <TouchableOpacity onPress={closeOverlay} style={styles.overlayCloseButton}>
        <Image source={require('../icons/icon_ics.png')} style={[styles.icon, { tintColor: 'gray' }]} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    opacity: 0.85,
  },
  overlayCloseButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 25,
    height: 25,
  },
});

export default Menu;
