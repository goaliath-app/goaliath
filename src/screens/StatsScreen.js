import React from 'react';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, ScrollView } from 'react-native'
import { 
  DayContent, GenericStats, ActivityCalendarHeatmap, Header, 
  ActivityBarChartPicker, StatsPannel, BottomScreenPadding 
} from '../components'
import { getTodaySelector, selectAllGoals } from '../redux'
import { useTranslation } from 'react-i18next'
import { GeneralColor } from '../styles/Colors';
import DropDownPicker from 'react-native-dropdown-picker';
import { Subheading, Divider } from 'react-native-paper'

const StatsScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation()

  // the id of the goal selected by the user
  const [ selectedGoal, setSelectedGoal ] = useState(null)

  return (
    <ScrollView style={{flex: 1, backgroundColor: GeneralColor.screenBackground}}>
      <Header title={t('statsScreen.headerTitle')} navigation={navigation} />
      <GoalSelector onGoalSelection={setSelectedGoal}/>
      <Divider style={{marginHorizontal: 8}}/>
      <StatsPannel goalId={selectedGoal == "all"? null : selectedGoal} />
      <BottomScreenPadding />
    </ScrollView>
  );
}

const GoalSelector = ({onGoalSelection}) => {
  const { t, i18n } = useTranslation()

  function innerOnGoalSelection(goalId){
    onGoalSelection(goalId)
    setValue(goalId)
  }

  const goals = useSelector(selectAllGoals)

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState(
    [ 
      {label: t("stats.genericStats.allGoals"), value: 'all'},
      ...goals.map( goal => ({label: goal.name, value: goal.id}) ),
    ]
  );

  return (
    <View style={{marginHorizontal: 8, marginVertical: 8}}>
      <View style={{flex: 1}}>
        <DropDownPicker
          placeholder={t("stats.genericStats.filterByGoal")}
          open={open}
          value={value}
          items={items}
          setOpen={setOpen}
          setValue={innerOnGoalSelection}
          setItems={setItems}
          listMode="SCROLLVIEW"
          scrollViewProps={{
            nestedScrollEnabled: true,
          }}  
          dropDownContainerStyle={{position: 'relative', top : 0}}
        />
      </View>
    </View>
  );
}

export default StatsScreen
