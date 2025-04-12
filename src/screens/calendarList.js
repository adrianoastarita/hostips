import React, { useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Funzione per formattare la data
const formatDate = (dateStr) => {
  const dateObj = new Date(dateStr);
  const giorno = dateObj.toLocaleDateString('it-IT', { weekday: 'short' }); // es. "mer"
  const giornoCap = giorno.charAt(0).toUpperCase() + giorno.slice(1); // "Mer"

  const giornoNum = dateObj.getDate().toString().padStart(2, '0');
  const meseNum = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const annoShort = dateObj.getFullYear().toString().slice(2); // es. "25"

  return `${giornoCap} ${giornoNum}/${meseNum}/${annoShort}`;
};

const DateSelector = ({ availableDates, onDateSelect }) => {
  // Stato per tenere traccia della data selezionata
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateSelect = (date) => {
    setSelectedDate(date); // Memorizza la data selezionata
    onDateSelect(date); // Esegui la funzione onDateSelect (se fornita)
  };

  // Imposta l'altezza dell'area visibile per 3 date
  const itemHeight = 70; // Altezza di ogni elemento (può essere regolata)
  const visibleHeight = itemHeight * 3; // 3 date visibili alla volta

  return (
    <View style={styles.container}>
      <FlatList
        data={availableDates}
        keyExtractor={(item) => item}
        renderItem={({ item }) => {
          const formattedDate = formatDate(item);

          // Verifica se l'elemento è quello selezionato
          const isSelected = item === selectedDate;

          return (
            <TouchableOpacity
              onPress={() => handleDateSelect(item)}
              style={[
                styles.dateItem,
                isSelected && styles.selectedDate, // Aggiungi stile se selezionato
              ]}
            >
              <Text style={[styles.dateText, isSelected && styles.selectedDateText]}>
                {formattedDate}
              </Text>
            </TouchableOpacity>
          );
        }}
        showsVerticalScrollIndicator={false} // Nasconde la barra di scorrimento verticale
        snapToInterval={itemHeight} // Imposta la distanza tra gli item (uno alla volta quando scorre)
        decelerationRate="fast" // Velocizza il movimento dello scroll
        contentContainerStyle={styles.scrollContainer}
        style={{ height: visibleHeight }} // Limita l'altezza visibile per 3 date
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
  },
  scrollContainer: {
    alignItems: 'center', // Allinea al centro i dati
  },
  dateItem: {
    width: '80%', // Imposta la larghezza per avere spazio ai lati
    paddingVertical: 5, // Aggiungi padding verticale per separare le date
    borderBottomWidth: 1,
    borderColor: '#ddd',
    marginBottom: 5, // Spazio tra le date
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center', // Centra il contenuto orizzontalmente
  },
  dateText: {
    fontSize: 20,
    color: '#333',
    textAlign: 'center', // Centra il testo
  },
  selectedDate: {
    backgroundColor: '#4CAF50', // Colore di sfondo verde per la data selezionata
    opacity: 1, // Data selezionata non opaca
  },
  selectedDateText: {
    color: '#fff', // Colore del testo per la data selezionata (bianco)
  },
});

export default DateSelector;
