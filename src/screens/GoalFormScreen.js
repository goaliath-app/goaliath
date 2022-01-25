import React from 'react';
import { connect, useDispatch, useSelector } from 'react-redux'
import { View, StyleSheet } from 'react-native'
import { Appbar, TextInput, Subheading, Paragraph, HelperText, Title, withTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next'
import { Header, HelpIcon, SpeechBubble } from '../components'
import { setGoal, selectGoalById, selectTutorialState, setTutorialState } from '../redux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import tutorialStates from '../tutorialStates'

const GoalFormScreen = withTheme(({ theme, navigation, goal=null }) => {
  const { t, i18n } = useTranslation()

  const dispatch = useDispatch()

  const [name, setName] = React.useState(goal?.name?goal.name:'')
  const [motivation, setMotivation] = React.useState(goal?.motivation?goal.motivation:'')

  const [nameInputError, setNameInputError] = React.useState(false)

  const tutorialState = useSelector(selectTutorialState)
  
  function validate(newGoal){
    if(!newGoal.name){
      setNameInputError(true)
      return false
    }
    setNameInputError(false)
    return true
  }

  const headerButtons = (
    <Appbar.Action 
      color={theme.colors.headerContent}
      icon='check' 
      onPress={() => {
        const newGoal = {name: name, motivation: motivation}
        if(validate(newGoal)){
          if(tutorialState == tutorialStates.FirstGoalCreation){
            dispatch(setTutorialState(tutorialStates.GoalScreenIntroduction))
          }
          if(goal){
            dispatch(setGoal({...goal, ...newGoal, id: goal.id}))
          }else{
            dispatch(setGoal({name: name, motivation: motivation}))
          }
          navigation.goBack()}
        }
      } 
    />
  )

  return(
    <View style={{flex: 1, backgroundColor: theme.colors.goalFormScreenBackground}}>
      <Header 
        title={goal?.name? goal.name : t('goalForm.headerTitle')} 
        left='back' 
        navigation={navigation} 
        buttons={headerButtons} 
      />
      <KeyboardAwareScrollView style={{ paddingHorizontal: 16 }}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <Subheading style={{marginTop: 16}}>{t('goalForm.goalNameSubheading')}</Subheading>
        </View>
        <TextInput 
          style={{fontSize: 16, backgroundColor: theme.colors.textInputBackground}}
          error={nameInputError} 
          mode='outlined' 
          label={t('goalForm.nameTextInputLabel')}
          value={name} 
          onChangeText={(value) => {
            setNameInputError(false)
            setName(value)
          }} 
        />
        <HelperText style={{paddingLeft:15}} type="error" visible={nameInputError}>
          {t('goalForm.nameError')}
        </HelperText>
        { tutorialState == tutorialStates.FirstGoalCreation ?
          <SpeechBubble 
            speeches={[
              {id: 0, text: t('tutorial.FirstGoalCreation.2')},
            ]}
            bubbleStyle={{height: 80, marginLeft: 0, marginRight: 0}}
          />
          : null}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <Subheading style={{marginTop: 16}}>{t('goalForm.goalMotivationSubheading')}</Subheading>
          <HelpIcon dialogContent={
            <View>
              <Title>{t('goalForm.descriptionHelpDialogTitle')}</Title>
              <Paragraph>{t('goalForm.descriptionHelpDialog')}</Paragraph>
            </ View>
          }/>
        </View>
        <TextInput
          style={{fontSize: 16, backgroundColor: theme.colors.textInputBackground}}
          mode='outlined'
          label={t('goalForm.motivationTextInputLabel')}
          multiline={true}
          numberOfLines={10}
          maxLength={1200}
          value={motivation}
          onChangeText={setMotivation}
          />
      </KeyboardAwareScrollView>
    </View>
  )
})

const mapStateToProps = (state, ownProps) => {
  const goal = selectGoalById(state, ownProps.route.params?.id)
  return { goal }
}

export default connect(mapStateToProps)(GoalFormScreen);