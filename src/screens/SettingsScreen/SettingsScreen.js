import React from 'react';
import { View, Share } from 'react-native'
import { connect, useStore } from 'react-redux';
import { Text, List, Divider, Paragraph, Portal, Dialog, Button } from 'react-native-paper'
import { DateTime } from 'luxon'
import { setDayStartHour, importState } from '../../redux'
import { Header } from '../../components'
import DateTimePickerModal from "react-native-modal-datetime-picker"
import email from 'react-native-email'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import * as DocumentPicker from 'expo-document-picker'


const SettingsScreen = ({ settings, setDayStartHour, navigation, state, importState }) => {
  const [isDatePickerVisible, setDatePickerVisibility] = React.useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (time) => {
    const dateTime = DateTime.fromJSDate(time)
    hideDatePicker();
    setDayStartHour(dateTime.toISO());
  };

  const [dialogVisible, setDialogVisible] = React.useState(false);
  const showDialog = () => setDialogVisible(true);
  const hideDialog = () => setDialogVisible(false);
  
  const [text, setText] = React.useState('');

  const readFile = () => {
    DocumentPicker.getDocumentAsync({type: 'application/oda'})
      .then(({ type, uri }) => FileSystem.readAsStringAsync(uri)
        .then((text) => {
          setText(text)
          showDialog()
          }
        )
      )
  }

  function importStateFromText(text){
    // TODO: dont break if file is bad formatted
    hideDialog()
    const state = JSON.parse(text)
    importState(state)
  }

  return (
    <View>
      <Header title='Settings' left='hamburger' navigation={navigation}/>
      <List.Item 
        title="Start of next day"
        description='At this time the daily activities will reset.' 
        onPress={showDatePicker} 
        right={() => <Text style={{marginRight: 10, marginTop: 10, color:'blue', fontSize: 17}}>{DateTime.fromISO(settings.dayStartHour).toFormat('HH:mm')}</Text>} />
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="time"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        date={DateTime.fromISO(settings.dayStartHour).toJSDate()}
      />
      <Divider />
      <List.Item
        title='Send feedback'
        description='Send a message to the developers'
        onPress={() => email('jimenaa971@gmail.com')}
      />
      <Divider />
      <List.Item
        title='Share'
        description='Introduce us to your friends'
        onPress={() => Share.share({message:"Goaliath is a nice app to achieve your goals, ¡try it!\n\nIt is not available from the play store yet, but you can download it here: (android)\nhttps://anonfiles.com/r4G5B4raue/Goaliath-1ac4cc84001d4f32980c40e9869c79d9-signed_apk \n\nIt is open source, you can check the code here: \nhttps://github.com/OliverLSanz/routines-app"})}
      />
      <Divider />
      <List.Item
        title='Export'
        description='Save your data'
        onPress={() => writeFile(state)}
      />
      <Divider />
      <List.Item
        title='Import'
        description='Do you have any backup? Restore your data'
        onPress={() => readFile()}
      />
      <Divider />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => {hideDialog()}}>
          <Dialog.Title>Import data?</Dialog.Title>
          <Dialog.Content>
            <Paragraph>This can't be undone, your app data will be rewrite.</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => importStateFromText(text)}>Import</Button>
            <Button onPress={() => hideDialog()}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

    </View>
    
  );
};

const writeFile =  (state) => {
  const date = DateTime.now().toFormat('dd-MM-yy')
  let fileUri = FileSystem.cacheDirectory + `Goaliat_Export_${date}.oda`
  FileSystem.writeAsStringAsync(fileUri, JSON.stringify(state, null, 2), { encoding: FileSystem.EncodingType.UTF8 })
    .then(()=>Sharing.shareAsync(fileUri))
}

const mapStateToProps = (state) => {
  const settings = state.settings
  return { settings, state }
}


const actionToProps = {
    setDayStartHour,
    importState
}

export default connect(mapStateToProps, actionToProps)(SettingsScreen);