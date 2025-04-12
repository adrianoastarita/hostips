import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { startOfMonth, endOfMonth, addDays, eachDayOfInterval, subMonths, addMonths, format, isSameDay, isSameMonth } from 'date-fns';
import { it } from 'date-fns/locale';

const Calendar = ({ onDateSelect, availableDates = [], initialDate = new Date() }) => {
  const [currentDate, setCurrentDate] = useState(new Date(initialDate));
  const [selectedDay, setSelectedDay] = useState(null); // Stato per il giorno selezionato
    
  // Funzione per calcolare il primo giorno del mese corrente
  const startOfCurrentMonth = (date) => startOfMonth(date);

  // Funzione per calcolare il giorno della settimana per il primo giorno del mese (0 = Domenica, 6 = Sabato)
  const getDayOfWeek = (date) => startOfCurrentMonth(date).getDay();

  // Funzione per calcolare tutti i giorni del mese, forzando 6 righe da 7 colonne
  const daysInMonth = () => {
    const start = startOfCurrentMonth(currentDate); // Primo giorno del mese
    const end = endOfMonth(currentDate); // Ultimo giorno del mese

    // Calcoliamo il giorno della settimana del primo giorno del mese (0 = Domenica, 6 = Sabato)
    const startDayOfWeek = getDayOfWeek(currentDate);

    // Calcoliamo quanti giorni devono essere aggiunti dal mese precedente per far iniziare la griglia correttamente
    const daysToAddFromPreviousMonth = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Se inizia di Domenica, aggiungiamo 6 giorni

    // Otteniamo il primo giorno che deve comparire nella griglia (prelevato dai giorni precedenti)
    const startDateForGrid = addDays(start, -daysToAddFromPreviousMonth);

    // Creiamo l'intervallo per ottenere 42 giorni (6 righe da 7 giorni)
    const days = eachDayOfInterval({ start: startDateForGrid, end: addDays(startDateForGrid, 41) });

    // Organizzare i giorni in righe da 7 colonne
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return weeks;
  };

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  const handleDayPress = (day) => {
    setSelectedDay(day); // Impostiamo il giorno selezionato
    onDateSelect(day);  // Passa la data selezionata al genitore
  };

  const isDateSelectable = (day) => {
    return availableDates.some(availableDate =>
      isSameDay(new Date(availableDate), day)
    );
  };

  return (
    <View style={styles.calendarContainer}>
      {/* Header con mese e frecce */}
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={handlePrevMonth}>
          <Text style={styles.arrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{format(currentDate, 'MMMM yyyy', { locale: it })}</Text>
        <TouchableOpacity onPress={handleNextMonth}>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Giorni della settimana */}
      <View style={styles.weekDaysRow}>
        {weekDays.map(day => (
          <Text key={day} style={styles.weekDay}>{day}</Text>
        ))}
      </View>

      {/* Griglia dei giorni */}
      <View style={styles.daysGrid}>
        {daysInMonth().map((week, index) => (
          <View key={index} style={styles.weekRow}>
            {week.map((day, dayIndex) => (
              <TouchableOpacity
                key={dayIndex}
                onPress={() => isDateSelectable(day) && handleDayPress(day)}
                style={styles.dayCellWrapper}
                disabled={!isDateSelectable(day)} // <-- disabilita se non selezionabile
              >
                <Text
                  style={[
                    styles.dayCell,
                    selectedDay && isSameDay(day, selectedDay) && styles.selectedDay,
                    !isSameDay(day, selectedDay) && !isSameMonth(day, currentDate) && styles.otherMonthDay,
                    !isDateSelectable(day) && styles.disabledDay, // nuovo stile per i giorni disabilitati
                  ]}
                >
                  {format(day, 'd')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = {
  calendarContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 5,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 24,
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  weekDay: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '14%',
  },
  daysGrid: {
    flexDirection: 'column',
    marginTop: 10,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  dayCellWrapper: {
    width: '14%',
    height: 30, // Assicuriamoci che la cella abbia un'altezza fissa
    justifyContent: 'center',  // Centra verticalmente
    alignItems: 'center', // Centra orizzontalmente
  },
  dayCell: {
    fontSize: 16,
    textAlign: 'center',
    width: '100%',
    height: '100%', // Assicuriamo che il testo prenda tutta l'altezza della cella
    justifyContent: 'center', // Centra verticalmente
    alignItems: 'center', // Centra orizzontalmente
  },
  selectedDay: {
    backgroundColor: 'lightgrey', // Colore per evidenziare il giorno selezionato
    borderRadius: 15, // Bordo arrotondato per evidenziare meglio
    color: 'white', // Colore del testo per il giorno selezionato
    fontWeight: 'bold', // Opzionale, per rendere il testo più visibile
  },
  otherMonthDay: {
    color: 'lightgrey', // Colore più tenue per i giorni fuori dal mese corrente
  },
  disabledDay: {
    color: '#ccc',
    opacity: 0.4,
  },  
};

export default Calendar;

