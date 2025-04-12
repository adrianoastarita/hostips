import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';

const Footer = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.footerContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const onPress = () => {
          if (!isFocused) {
            navigation.navigate(route.name);
          }
        };

        const iconSource = options.tabBarIcon ? options.tabBarIcon({ focused: isFocused }) : null;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={[
              styles.tabButton,
              isFocused ? styles.activeTab : styles.inactiveTab,
            ]}
          >
            {iconSource && (
              <Image
                source={iconSource.props.source} // Usa la source dell'icona passata
                style={[
                  styles.icon,
                  isFocused ? styles.activeIcon : styles.inactiveIcon,
                ]}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingBottom: 20,
    backgroundColor: 'white',
  },
  tabButton: {
    backgroundColor:'transparent',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  icon: {
    width: 30,
    height: 30,
  },
  activeTab: {
    borderColor: 'grey',
  },
  inactiveTab: {
    borderColor: '#ccc',
  },
  activeIcon: {
    tintColor: 'grey',
  },
  inactiveIcon: {
    tintColor: '#ccc',
  },
});

export default Footer;
