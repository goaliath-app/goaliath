import React from 'react';
import { connect } from 'react-redux'
import { View, Alert, StyleSheet } from 'react-native'
import { Appbar, TextInput, Subheading } from 'react-native-paper';
import { Header } from '../../components'
import { createGoal, updateGoal, selectGoalById } from '../../redux';
import { useTranslation } from 'react-i18next'



const GoalFormScreen = ({ navigation, createGoal, updateGoal, goal=null }) => {
  const { t, i18n } = useTranslation()

  const [name, setName] = React.useState(goal?.name?goal.name:'')
  const [motivation, setMotivation] = React.useState(goal?.motivation?goal.motivation:'')
  
  const validate = ( newGoal ) => {
    if(!newGoal.name){
      Alert.alert(t('goalForm.nameAlert'))
      return false
    }
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
    <View>
      <Header title={t('goalForm.headerTitle')} left='back' navigation={navigation} buttons={headerButtons} />
      <Subheading style={styles.subheading}>{t('goalForm.goalNameSubheading')}</Subheading>
      <TextInput 
        style={styles.textInput}
        mode='outlined' 
        label={t('goalForm.nameTextInputLabel')}
        value={name} 
        onChangeText={setName} />
      <Subheading style={styles.subheading}>{t('goalForm.goalMotivationSubheading')}</Subheading>
      <TextInput
        style={styles.textInput}
        mode='outlined'
        label={t('goalForm.motivationTextInputLabel')}
        multiline={true}
        numberOfLines={10}
        value={motivation}
        onChangeText={setMotivation}
      />
    </View>
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
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 15,
    fontSize: 16
  },
  subheading: {
    marginLeft: 16,
    marginTop: 16
  }
})



export default connect(mapStateToProps, actionsToProps)(GoalFormScreen);