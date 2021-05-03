import React from 'react';
import { connect } from 'react-redux'
import { View, Alert, StyleSheet, KeyboardAvoidingView, ScrollView, Platform } from 'react-native'
import { Appbar, TextInput, Subheading, Paragraph, HelperText, Title } from 'react-native-paper';
import { Header, HelpIcon } from '../../components'
import { createGoal, updateGoal, selectGoalById } from '../../redux';
import { useTranslation } from 'react-i18next'



const GoalFormScreen = ({ navigation, createGoal, updateGoal, goal=null }) => {
  const { t, i18n } = useTranslation()

  const [name, setName] = React.useState(goal?.name?goal.name:'')
  const [motivation, setMotivation] = React.useState(goal?.motivation?goal.motivation:'')

  const [nameInputError, setNameInputError] = React.useState(false)
  
  const validate = ( newGoal ) => {
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
            updateGoal({...newGoal, id: goal.id})
          }else{
            createGoal({name: name, motivation: motivation})
          }
          navigation.goBack()}
        }
      } 
    />
    
  )

  return(
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: 'white' }}>
      <Header title={t('goalForm.headerTitle')} left='back' navigation={navigation} buttons={headerButtons} />
      <ScrollView style={{flex: 1, marginHorizontal: 16}} overScrollMode='never' >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
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
          } />
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
        </ScrollView>
    </KeyboardAvoidingView>
  )
}

const mapStateToProps = (state, ownProps) => {
  const goal = selectGoalById(state, ownProps.route.params?.id)
  return { goal }
}

const actionsToProps = {
  createGoal,
  updateGoal
}

const styles = StyleSheet.create ({
  textInput: {
    fontSize: 16,
    backgroundColor: '#FBFCFC'
  },
  subheading: {
    marginTop: 16
  }
})



export default connect(mapStateToProps, actionsToProps)(GoalFormScreen);