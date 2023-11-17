import React from 'react';
import { connect, useSelector, useDispatch } from 'react-redux'
import { Keyboard, Pressable, View, StyleSheet } from 'react-native';
import { 
  Appbar, TextInput, HelperText, Subheading, Portal, Dialog, Divider, List, 
  Switch, Text, Paragraph, withTheme 
} from 'react-native-paper';
import { useTranslation } from 'react-i18next'
import { Header, TimeInput, BottomScreenPadding, InfoCard, RepetitionsInput } from '../../components';
import { setActivity, selectActivityById } from '../../redux'
import NumberOfWeeklyDaysInput from './NumberOfWeeklyDaysInput'
import WeekdaySelector from './WeekdaySelector'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Context } from '../../../App'
import { faCalendarCheck } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import FeatherIcon from 'react-native-vector-icons/Feather';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import { getFrequencyString } from './../../activityHandler'

// Previews a frequency string of an activity that has not yet been created by 
// puting it in a fake redux state and using the getFrequencyString selector
// over that state
function previewFrequencyString(activity, t){
  const id = 0
  const date = "2022-01-02T00:00:00.000+01:00"

  const state = {
    activities: {
      ids: [
        id
      ],
      entities: {
        [id]: {
          id: id,
          entries: {
            ids: [
              date
            ],
            entities: {
              [date]: {
                ...activity,
                id: date
              }
            }
          }
        }
      },
    },
  }

  return getFrequencyString(state, id, t, date)
}

const ActivityFormScreen = withTheme(({ theme, route, navigation }) => {

  const { showSnackbar } = React.useContext(Context);

  // extract data from route params and redux
  const activityId = route.params.activityId
  const activity = useSelector(state => selectActivityById(state, activityId))
  let goalId
  
  if(activity){
    goalId = activity.goalId
  }else{
    if(route.params.goalId == null){
      throw "Navigated to ActivityFormScreen without providing activityId nor goalId. At least one is required."
    }
    goalId = route.params.goalId
  }

  // misc. hooks
  const dispatch = useDispatch()
  const { t, i18n } = useTranslation()
 
  // state default values
  const initialName = activity?.name?activity.name:''
  const initialDescription = activity?.description ? activity.description : ''
  const initialfrequencySelector = (
    activity?.type == 'doFixedDays'? 'daily' :
    activity?.type == 'doNDaysEachWeek'? 'free' :
    activity?.type == 'doNSecondsEachWeek'? 'weekly' :
    activity?.type == 'doNTimesEachWeek'? 'weekly' :
    null
  )

  const initialDailySeconds = (
    activity && activity.type == "doFixedDays" && activity.params.dailyGoal.type == "doNSeconds"?
      activity.params.dailyGoal.params.seconds
      : 0
  )

  const initialFreeSeconds = (
    activity && activity.type == "doNDaysEachWeek" && activity.params.dailyGoal.type == "doNSeconds"?
    activity.params.dailyGoal.params.seconds
    : 0
  )

  const initialWeeklySeconds = (
    activity && activity.type == "doNSecondsEachWeek" && activity.params.seconds?
    activity.params.seconds
    : 0
  )

  const initialTimeGoalSwitch = initialDailySeconds || initialFreeSeconds || initialWeeklySeconds ? true : false
  const initialRepetitions = (
    activity?.params.repetitions? activity.params.repetitions :
    activity?.params.dailyGoal?.params.repetitions? activity.params.dailyGoal.params.repetitions :
    '2'
  )
  const initialMultipleTimesSwitch = (
    activity?.params.dailyGoal?.type == 'doNTimes'
  )
  const initialDaysOfWeek = (
    activity?.params.daysOfWeek? activity.params.daysOfWeek :
    { '1': true, '2': true, '3': true, '4': true, '5': true, '6': true, '7': true }
  )
  const initialDays = (
    activity?.params.days? String(activity.params.days) : '1'
  )
  const initialRepetitionsGoalSwitch = (
    activity?.type == 'doNTimesEachWeek'
  )

  const [name, setName] = React.useState(initialName)
  const [description, setDescription] = React.useState(initialDescription)
  const [frequencySelector, setFrequencySelector] = React.useState(initialfrequencySelector)  // 'daily', 'free' or 'weekly'
  const [dailySeconds, setDailySeconds] = React.useState(initialDailySeconds) // 'seconds' daily activities
  const [freeSeconds, setFreeSeconds] = React.useState(initialFreeSeconds) // 'seconds' free activities
  const [weeklySeconds, setWeeklySeconds] = React.useState(initialWeeklySeconds) // 'seconds' weekly activities
  const [repetitions, setRepetitions] = React.useState(initialRepetitions) // 'repetitions'
  const [daysOfWeek, setDaysOfWeek] = React.useState(initialDaysOfWeek) // '1', '2', '3', '4', '5', '6', '7'
  const [days, setDays] = React.useState(initialDays) // int
 
  const [timeGoalSwitch, setTimeGoalSwitch] = React.useState(initialTimeGoalSwitch)
  // switch to do multiple times each day
  const [multipleTimesSwitch, setMultipleTimesSwitch] = React.useState(initialMultipleTimesSwitch)
  // switch to do multiple times each week
  const [repetitionsGoalSwitch, setRepetitionsGoalSwitch] = React.useState(initialRepetitionsGoalSwitch)

  const [nameInputError, setNameInputError] = React.useState(false)
  const [daysOfWeekError, setDaysOfWeekError] = React.useState(false)
  const [timeInputError, setTimeInputError] = React.useState(false)
  const [noFrequencyError, setNoFrequencyError] = React.useState(false)
  const [noRepetitionsError, setNoRepetitionsError] = React.useState(false)

  const [isFrecuencyVisible, setFrequencyVisible] = React.useState(false)

  //TODO: actualizar la función validate
  const validate = () => {
    let error = false

    if(!name){
      setNameInputError(true)
      error = true
    }

    if(frequencySelector === null){
      setNoFrequencyError(true)
      error = true
    }

    if(parseInt(repetitions) <= 0 || Number.isNaN(parseInt(repetitions))){
      setNoRepetitionsError(true)
      error = true
    }
    
    if(
      timeGoalSwitch && (
        frequencySelector == "daily" && !dailySeconds
        || frequencySelector == "weekly" && !weeklySeconds
        || frequencySelector == "free" && !freeSeconds
      )
    ){
      setTimeInputError(true)
      error = true
    }
    
    // if daily activity but all weekdays are false
    if(frequencySelector == 'daily'){
      let aDayIsSelected = false
      for(let day in daysOfWeek){
        if (daysOfWeek[day] == true){ aDayIsSelected = true }
      }
      if(!aDayIsSelected){
        setDaysOfWeekError(true)
        error = true
      }
    }

    if(error){
      return false
    }else{
      setTimeInputError(false)
      setNameInputError(false)
      setDaysOfWeekError(false)
      setNoFrequencyError(false)
      setNoRepetitionsError(false)
      return true
    }
  }

  // Generate new activity object based on input values
  const type = (
    frequencySelector=='daily'? 'doFixedDays'
      : frequencySelector=='free'? 'doNDaysEachWeek'
      : frequencySelector=='weekly' && repetitionsGoalSwitch? 'doNTimesEachWeek'
      : frequencySelector=='weekly' && timeGoalSwitch? 'doNSecondsEachWeek'
      : null
  )

  let params

  if(type == 'doFixedDays'){
    let dailyGoal

    if(timeGoalSwitch){
      dailyGoal = {
        type: 'doNSeconds',
        params: { seconds: dailySeconds }
      }
    }else if(multipleTimesSwitch){
      dailyGoal = {
        type: 'doNTimes',
        params: { repetitions }
      }
    }else{
      dailyGoal = {
        type: 'doOneTime',
        params: {}
      }
    }

    params = {
      daysOfWeek, 
      dailyGoal
    }

  }else if(type == 'doNDaysEachWeek'){
    params = {
      days: Number.parseInt(days), 
      dailyGoal: (
        timeGoalSwitch? {type: 'doNSeconds', params: { seconds: freeSeconds } } :
          {type: 'doOneTime', params:  {}}
      )
    }
  }else if(type == 'doNTimesEachWeek'){
    params = { repetitions }
  }else if(type == 'doNSecondsEachWeek'){
    params = { seconds: weeklySeconds }
  }

  const newActivity = { 
    name, 
    description,
    goalId, 
    type, 
    params, 
  }

  let activityPreviewText = ""
  
  try{
    activityPreviewText = previewFrequencyString(newActivity, t)
  }catch (e){
    console.log(e)
  }

  const headerButtons = (
    <Appbar.Action icon='check' color={theme.colors.headerContent} onPress={() => {
        Keyboard.dismiss()

        if(validate()){
          if(activityId !== undefined){
            dispatch(setActivity({ ...activity, ...newActivity }))
            showSnackbar(t("activityForm.snackbar.activityUpdated"))
          }else{
            dispatch(setActivity({ ...newActivity, archived: false, active: true }))
            showSnackbar(t("activityForm.snackbar.activityCreated"))
          }
          navigation.goBack()
        }
      }}
      style={{ height: 48, width: 48 }}
    /> 
  )

  return(
    <View style={{flex: 1, backgroundColor: theme.colors.activityFormScreenBackground}}>
      <Header 
        title={activity?.name?activity.name:t('activityForm.headerTitle')} 
        left='back' navigation={navigation} 
        buttons={headerButtons}
      />
      <KeyboardAwareScrollView style={{flex: 1, paddingHorizontal: 15}} overScrollMode='never' contentContainerStyle={{flexGrow: 1}} keyboardShouldPersistTaps='handled' >
        <TextInput 
          error={nameInputError} 
          style={{marginTop: 15, fontSize: 16, backgroundColor: theme.colors.textInputBackground}} 
          mode= 'outlined' 
          label={t('activityForm.nameInputLabel')}
          value={name} 
          onChangeText={name => {
            setName(name)
            setNameInputError(false)
          }} 
        />
        {
          nameInputError?
            <HelperText style={{paddingLeft:25}} type="error" visible={nameInputError}>
              {t('activityForm.errors.noName')}
            </HelperText> : null
        }
        <TextInput 
          style={{marginTop: 10, marginBottom: 15, fontSize: 16, backgroundColor: theme.colors.textInputBackground}} 
          mode= 'outlined' 
          multiline={true}
          label={t('activityForm.descriptionInputLabel')}
          value={description} 
          onChangeText={description => {
            setDescription(description)
          }} 
        />

        <Subheading style={{marginLeft: 10}}>{t('activityForm.frequencyTitle')}</Subheading>
        <Pressable style={{flexDirection: 'row', alignItems: 'center', borderWidth: 1, marginTop: 10, paddingHorizontal: 15, paddingVertical: 10, height: 60, borderRadius: 5, borderColor: theme.colors.frequencySelectorBorder}} onPress={() => {
          Keyboard.dismiss()
          setFrequencyVisible(true)
          setNoFrequencyError(false)
        }}>
          { frequencySelector=='daily'? <FontAwesomeIcon style={{alignSelf: 'center', marginRight: 10}} size={28}  icon={faCalendarCheck} color={theme.colors.frequencySelectorIcons} /> :
            frequencySelector=='free'? <FeatherIcon style={{alignSelf: 'center', marginRight: 10}} name={"feather"} size={28} color={theme.colors.frequencySelectorIcons} /> :
            frequencySelector=='weekly'? <EntypoIcon style={{alignSelf: 'center', marginRight: 10}} size={30} name={"bar-graph"} color={theme.colors.frequencySelectorIcons} /> :
            null }
            <View>
          <Text style={{ fontSize: 16 }}>{!frequencySelector? t('activityForm.frequencyLabel')
            :frequencySelector=='daily'? t('activityForm.dialog.dailyTitle')
            :frequencySelector=='free'? t('activityForm.dialog.freeTitle')
            :frequencySelector=='weekly'? t('activityForm.dialog.weeklyTitle')
            : null
          }</Text>
          {/* This shows the activity preview text inside the frequency selector item */}
          {/* { activityPreviewText.length > 0 && <Text style={{ fontSize: 14 }}>{activityPreviewText}</Text> } */}
          </View>
        </Pressable>
        <HelperText style={{paddingLeft:25}} type="error" visible={noFrequencyError}>
          {t('activityForm.errors.noFrequency')}
        </HelperText>

        {frequencySelector=='daily'?
          <View> 
            <Subheading style={{marginLeft: 10, marginBottom: 10}}>{t('activityForm.weekdaysTitle')}</Subheading>
            <WeekdaySelector 
              state='select'
              weekDays={daysOfWeek} 
              setWeekDays={setDaysOfWeek} 
              setWeekDaysError={setDaysOfWeekError}
            />
            <HelperText 
              style={{
                textAlign: 'center', 
                borderTopWidth: 1, 
                borderTopColor: theme.colors.error, 
                marginHorizontal: 25 
              }} 
              type="error" 
              visible={daysOfWeekError}
            >
              {t('activityForm.errors.noDaysSelected')}
            </HelperText>

            <List.Item 
              title={t('activityForm.switch.multipleTimes')}
              right={() => (
                <View style={{ marginRight: 12 }}>
                  <Switch value={multipleTimesSwitch} onValueChange={() => {setTimeGoalSwitch(false), setMultipleTimesSwitch(!multipleTimesSwitch)}} style={{ height: 48, width: 48 }} />
                </View>
              )}
            />
            {multipleTimesSwitch?
              <RepetitionsInput  
                description={t('activityForm.dailyRepetitions')}
                value={repetitions}
                onValueChange={setRepetitions}
                error={noRepetitionsError}
                clearError={() => setNoRepetitionsError(false)}
              />
            : null
            }
          </View>
          : <></>        
        }

        {frequencySelector == 'free'?
          <NumberOfWeeklyDaysInput daysPerWeek={days} setDaysPerWeek={setDays} theme={theme} />
          : null 
        }

        {frequencySelector=='weekly'?
          <View>
            <List.Item 
              title={t('activityForm.switch.repetitionsGoal')}
              right={() => (
                <View style={{ marginRight: 12 }}>
                  <Switch value={repetitionsGoalSwitch} style={{ height: 48, width: 48 }} onValueChange={() => {
                    if(!timeGoalSwitch){
                      setTimeGoalSwitch(true)
                    } else{
                      setTimeGoalSwitch(false)
                    }
                    setRepetitionsGoalSwitch(!repetitionsGoalSwitch)
                  }} />
                </View>
              )}
            />
            {repetitionsGoalSwitch?
              <RepetitionsInput  
                description={t('activityForm.weeklyRepetitions')}
                value={repetitions}
                onValueChange={setRepetitions}
                error={noRepetitionsError}
                clearError={() => setNoRepetitionsError(false)}
              />
            : null}
          </View>
          : null
        }
        
        {frequencySelector?
          <View>
            <List.Item 
              title={t('activityForm.switch.timeGoal')}
              right={() => (
                <View style={{ marginRight: 12 }}>
                  <Switch value={timeGoalSwitch} style={{ height: 48, width: 48 }} onValueChange={( newValue ) => {
                    if (!repetitionsGoalSwitch && !newValue) {
                      setRepetitionsGoalSwitch(true)
                    } else {
                      setRepetitionsGoalSwitch(false)
                    }
                    setMultipleTimesSwitch(false)
                    setTimeGoalSwitch(newValue)
                  }} />
                </View>
              )}
            />
            {timeGoalSwitch?
              <View>
                <TimeInput
                  value={frequencySelector=='daily'? dailySeconds :
                          frequencySelector=='free'? freeSeconds :
                          frequencySelector=='weekly'? weeklySeconds :
                          null}
                  onValueChange={ (value) => {
                    frequencySelector=='daily'? setDailySeconds(value) :
                    frequencySelector=='free'? setFreeSeconds(value) :
                    frequencySelector=='weekly'? setWeeklySeconds(value) :
                    null
                    setTimeInputError(false)
                  }}
                  maxHours={frequencySelector=='weekly'? 99 : 23}
                />
                <HelperText 
                  style={{
                    textAlign: 'center', 
                    borderTopWidth: 1, 
                    borderTopColor: theme.colors.error, 
                    marginHorizontal: 35
                  }} 
                  type="error" 
                  visible={timeInputError}
                >
                  {t('activityForm.errors.noTime')}
                </HelperText>
              </View>
            : null }
          </View>
        : null}

        

        <Portal>
          <Dialog style={{marginHorizontal: 12, backgroundColor: theme.colors.dialogBackground}} visible={isFrecuencyVisible} onDismiss={() => {setFrequencyVisible(false)}}>
            <Dialog.Title>{t('activityForm.dialog.title')}</Dialog.Title>
              <Dialog.Content>
                <Divider />
                <List.Item left={() => <FontAwesomeIcon style={{alignSelf: 'center'}} size={30} icon={faCalendarCheck} color={theme.colors.frequencySelectorIcons} />} title={t('activityForm.dialog.dailyTitle')} descriptionNumberOfLines={4} description={t('activityForm.dialog.dailyDescription')} onPress={() => {setFrequencySelector('daily'), setFrequencyVisible(false)}} />
                <Divider />
                <List.Item left={() => <FeatherIcon style={{alignSelf: 'center'}} name={"feather"} size={32} color={theme.colors.frequencySelectorIcons} />} title={t('activityForm.dialog.freeTitle')} descriptionNumberOfLines={4} description={t('activityForm.dialog.freeDescription')} onPress={() => {setFrequencySelector('free'), setFrequencyVisible(false)}} />
                <Divider />
                <List.Item left={() => <EntypoIcon style={{alignSelf: 'center'}} size={30} name={"bar-graph"} color={theme.colors.frequencySelectorIcons} />} title={t('activityForm.dialog.weeklyTitle')} descriptionNumberOfLines={4} description={t('activityForm.dialog.weeklyDescription')} onPress={() => {
                  setFrequencySelector('weekly')
                  setFrequencyVisible(false)
                  if (!repetitionsGoalSwitch && !timeGoalSwitch) {
                    setRepetitionsGoalSwitch(true)
                  }
                }} />
                <Divider />
              </Dialog.Content>
          </Dialog>
        </Portal>
        <BottomScreenPadding />
      </KeyboardAwareScrollView>
      { frequencySelector != undefined ? 
          /* Another alternative to show the activity frequency preview */
          <InfoCard 
            style={{marginVertical: 0}}
            cardStyle={{marginVertical: 0}}
            paragraphStyle={{marginVertical: 0, fontSize: 16, textAlign: 'center'}}
            paragraph={name? `${name} ${activityPreviewText}` : activityPreviewText} 
          /> 
        : null }
    </View>
  )
})

const styles = StyleSheet.create({
  textInput: {
    fontSize: 40,
    textAlign: 'center',
    backgroundColor: 'transparent'
  }
})

export default ActivityFormScreen;
