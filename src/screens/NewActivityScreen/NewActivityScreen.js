import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Title, Appbar, Text, TextInput, Button, List, Switch } from 'react-native-paper';
import { Header } from '../../components';

const styles = StyleSheet.create({
  icon: {
    margin: 'auto',
    color: 'white',
  },
  repeatOptionsView: {
    flexDirection: 'row',
  },
  repeatOptionsButton: {
    flex: 1,
  }
})

const iconComponent = () => (
  <Text style={styles.icon}>Hola</Text>
)

const GoalScreen = ({ navigation }) => {
  const [name, setName] = React.useState('');
  const [repeatMode, setRepeatMode] = React.useState();
  const [timeGoalOption, setTimeGoalOption] = React.useState(false);

  const headerButtons = (
    <Appbar.Action icon='check' />
  )

  const ActivityOptions = () => {
    let out = <></>

    switch(repeatMode) {
      case 'daily':
        out = (
          <>
          <Text>You will do the activity every day.</Text>
          <TimeGoal />
          </>
        );
        break;
      case 'select':
        out = <Text>You will do the activity these days.</Text>;
        break;
      case 'weekly':
        out = <Text>You can do the activity any day of the week.</Text>
        break;
    }
    
    return (
      out
    )
  }

  const TimeGoal = () => {
    return (
      <>
      <List.Item 
        title='Time goal' 
        right={()=>(
          <Switch value={timeGoalOption} onValueChange={setTimeGoalOption}/>
        )}
      />
      {timeGoalOption?
        <Text>Aqui va el time selector</Text>
      :
        <></>
      }
      </>
    )
  }

  return(
    <View>
      <Header title='New Activity' left='back' navigation={navigation} buttons={headerButtons}/>
      <TextInput label="Activity Name" value={name} onChangeText={name => setName(name)} />
      <Title>Repeat</Title>
      <View style={styles.repeatOptionsView}>
        <Button 
          mode={repeatMode=='daily'? 'contained':'text'} 
          style={styles.repeatOptionsButton}
          onPress={()=>setRepeatMode('daily')}>
            Daily
        </Button>
        <Button 
          mode={repeatMode=='select'? 'contained':'text'} 
          style={styles.repeatOptionsButton}
          onPress={()=>setRepeatMode('select')}>
            Select days
        </Button>
        <Button 
          mode={repeatMode=='weekly'? 'contained':'text'} 
          style={styles.repeatOptionsButton}
          onPress={()=>setRepeatMode('weekly')}>
            Weekly
        </Button>
      </View>
      <ActivityOptions />
    </View>
  )
}

export default GoalScreen;