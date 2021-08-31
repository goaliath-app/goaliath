import React from 'react';
import { connect } from 'react-redux';
import { View, FlatList } from 'react-native';
import { GeneralColor, SelectWeekliesColor } from '../styles/Colors';
import { Header, Checkbox } from '../components';
import { useTranslation } from 'react-i18next';
import { Appbar, List, Text } from 'react-native-paper';
import { selectAllActivities, selectAllWeekEntriesByActivityId, addEntry, selectActivityEntities, deleteEntry, weekliesSelectedToday, upsertEntry, archiveOrDeleteEntry, createOrUnarchiveEntry } from '../redux';
import { extractActivityList, getToday, getWeeklyStats, getPreferedExpression, newEntry, selectAllActiveActivities } from '../util';
import Duration from 'luxon/src/duration.js'
import { WeekView } from '../components';

const WeeklyListItem = ({name, description, id, checkboxStatus, onCheckboxPress, checkboxColor, selected, onPress}) => {
  // TODO: if checkboxStatus is null, check if the activity has an entry for this date

  const leftSlot = (
    <Checkbox 
      color={checkboxColor}
      uncheckedColor={checkboxColor}
      status={checkboxStatus}
      onPress={onCheckboxPress}
    />
  )

  return (
    <List.Item 
      left={() => leftSlot}
      title={name}
      description={description}
      style={{
        backgroundColor: selected?GeneralColor.selectedSurface:'white'
      }}
      onPress={onPress}
    />
  )
}

export default WeeklyListItem