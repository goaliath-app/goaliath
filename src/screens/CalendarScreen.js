import React from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Header } from '../components';
import { CalendarColor, GeneralColor } from '../styles/Colors';
import { Calendar } from '../components/index'

const CalendarScreen = ({ navigation }) => {  
  const { t, i18n } = useTranslation()

  return (
    <View style={{
      flex: 1, 
      backgroundColor: GeneralColor.screenBackground, 
      justifyContent: 'space-between'
    }}>
      <View>
        <Header title={t('calendar.headerTitle')} navigation={navigation}/>
        <Calendar 
          onDayPress={weekDate => navigation.navigate('CalendarWeekView', {date: weekDate.toISO()})}
          onDayLongPress={dayDate => navigation.navigate('CalendarDayView', {date: dayDate.toISO()})} 
        />
      </View>
    </View>
  );
}

const mapStateToProps = (state) => ({ state })

const actionsToProps = {
}

export default connect(mapStateToProps, actionsToProps)(CalendarScreen)
