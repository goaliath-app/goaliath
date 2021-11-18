import React from 'react';
import { connect, useDispatch } from 'react-redux'
import { View, StyleSheet } from 'react-native'
import { Appbar, TextInput, Subheading, Paragraph, HelperText, Title } from 'react-native-paper';
import { useTranslation } from 'react-i18next'
import { Header, HelpIcon } from '../components'
import { setGoal, selectGoalById } from '../redux';
import { GeneralColor } from '../styles/Colors';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

const GoalFormScreen = ({ navigation, goal=null }) => {
  const { t, i18n } = useTranslation()

  const dispatch = useDispatch()

  const [name, setName] = React.useState(goal?.name?goal.name:'')
  const [motivation, setMotivation] = React.useState(goal?.motivation?goal.motivation:'')

  const [nameInputError, setNameInputError] = React.useState(false)
  
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
      icon='check' 
      onPress={() => {
        const newGoal = {name: name, motivation: motivation}
        if(validate(newGoal)){
          if(goal){
            dispatch(setGoal({...newGoal, id: goal.id}))
          }else{
            dispatch(setGoal({name: name, motivation: motivation}))
          }
          navigation.goBack()}
        }
      } 
    />
  )

  return(
    <View style={{flex: 1, backgroundColor: GeneralColor.screenBackground}}>
      <Header 
        title={goal?.name? goal.name : t('goalForm.headerTitle')} 
        left='back' 
        navigation={navigation} 
        buttons={headerButtons} 
      />
      <KeyboardAwareScrollView style={{ paddingHorizontal: 16 }}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <Subheading style={styles.subheading}>{t('goalForm.goalNameSubheading')}</Subheading>
        </View>
        <TextInput 
          style={styles.textInput}
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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <Subheading style={styles.subheading}>{t('goalForm.goalMotivationSubheading')}</Subheading>
          <HelpIcon dialogContent={
            <View>
              <Title>{t('goalForm.descriptionHelpDialogTitle')}</Title>
              <Paragraph>{t('goalForm.descriptionHelpDialog')}</Paragraph>
            </ View>
          }/>
        </View>
        <TextInput
          style={styles.textInput}
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
}

const mapStateToProps = (state, ownProps) => {
  const goal = selectGoalById(state, ownProps.route.params?.id)
  return { goal }
}

const styles = StyleSheet.create ({
  textInput: {
    fontSize: 16,
    backgroundColor: GeneralColor.textInputBackground
  },
  subheading: {
    marginTop: 16
  }
})

export default connect(mapStateToProps)(GoalFormScreen);