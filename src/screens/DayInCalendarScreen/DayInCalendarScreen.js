import React from 'react';
import { View, Pressable } from 'react-native'
import { connect } from 'react-redux';
import { Text, Subheading } from 'react-native-paper'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faCalendarDay, faCalendarWeek, faSlash } from '@fortawesome/free-solid-svg-icons'
import { DateTime } from 'luxon'
import { selectEntriesByDay, selectActivityById } from '../../redux'
import { Header, ActivityList } from '../../components' 
import { extractActivityLists } from '../../util'

const DayInCalendarScreen = ({ navigation, dayActivities, weekActivities, day }) => {
  const [ viewMode, setViewMode ] = React.useState('day') // can be 'day' or 'week'
  
  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <Header title={day.toFormat("d MMMM yyyy")} left='back' navigation={navigation}/>
      <View style={{flexDirection: 'row', height: 48, justifyContent: 'space-between', alignItems: 'center'}}>
          <Subheading style={{paddingLeft: 16}}>{viewMode=='day'?'Daily':'Weekly'} Activities</Subheading>
          <Pressable onPress={() => {
            setViewMode(viewMode=='day'?'week':'day')
          }} >
            <View style={{flexDirection: 'row', paddingRight: 12, alignItems: 'center'}}>
                <FontAwesomeIcon icon={faCalendarDay} size={20} transform={{up: 10}} color={viewMode=='day'?'#6200EE':'#666666'}/>
                <Text style={{fontSize: 30, position: 'relative', top: 4, color: '#666666'}}> / </Text>
                <FontAwesomeIcon icon={faCalendarWeek} size={20} color={viewMode=='week'?'#6200EE':'#666666'}/>
            </View>
          </Pressable>
      </View>
      <ActivityList data={viewMode=='day'?dayActivities:weekActivities} disabled={true} />
    </View>
  )
}

const mapStateToProps = (state, ownProps) => {
  const dateString = ownProps.route.params.day
  const day = DateTime.fromFormat(dateString, 'yyyy-MM-dd')

  const { dayActivities, weekActivities } = extractActivityLists(state, day)

  return { dayActivities, weekActivities, day }
}


const actionToProps = {
}

export default connect(mapStateToProps, actionToProps)(DayInCalendarScreen);

