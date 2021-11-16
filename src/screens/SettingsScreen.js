import React from 'react';
import { View, Share } from 'react-native'
import { connect } from 'react-redux';
import { Text, List, Divider, Paragraph, Portal, Snackbar, Dialog, Button } from 'react-native-paper'
import { DateTime } from 'luxon'
import DateTimePickerModal from "react-native-modal-datetime-picker"
import email from 'react-native-email'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import * as DocumentPicker from 'expo-document-picker'
import { useTranslation } from 'react-i18next'
import { setDayStartHour, importState, setLanguage } from '../redux'
import { Header } from '../components'
import { GeneralColor, SettingsColor } from '../styles/Colors';


const SettingsScreen = ({ settings, setDayStartHour, setLanguage, navigation, state, importState }) => {
  const [isDatePickerVisible, setDatePickerVisibility] = React.useState(false);
  const [isLanguageDialogVisible, setLanguageDialogVisible] = React.useState(false);
  const [isImportDialogVisible, setImportDialogVisible] = React.useState(false);
  const [importedStateText, setImportedStateText] = React.useState('');
  const [ snackbarMessage, setSnackbarMessage ] = React.useState("")

  const { t, i18n } = useTranslation()


  const changeDayStartHour = (JSDate) => {
    const dateTime = DateTime.fromJSDate(JSDate)
    setDatePickerVisibility(false)
    setDayStartHour(dateTime.toISO());
    
    //Snackbar
    setSnackbarMessage(dateTime.toFormat('T') > DateTime.now().toFormat('T')?
     t('settings.yesterdaySnackbar', {startHour: dateTime.toFormat('T').toString()}) 
     : t('settings.todaySnackbar', {startHour: dateTime.toFormat('T').toString()}))
  };

  const readFile = () => {
    DocumentPicker.getDocumentAsync({type: 'application/oda'})
      .then(({ type, uri }) => FileSystem.readAsStringAsync(uri)
        .then((text) => {
          setImportedStateText(text)
          setImportDialogVisible(true)
          }
        )
      )
  }

  function importStateFromText(text){
    // TODO: dont break if file is bad formatted
    setImportDialogVisible(false)
    try {
      const state = JSON.parse(text)
    } catch(e) {
      setSnackbarMessage("Import failed: wrong file format")
    }
    importState(state)
  }

  return (
    <View style={{flex: 1, backgroundColor: GeneralColor.screenBackground}}>
      <Header title={t('settings.headerTitle')} left='hamburger' navigation={navigation}/>
      <List.Item 
        title={t('settings.startHour')}
        description={t('settings.startHourDescription')}
        onPress={() => setDatePickerVisibility(true)} 
        right={() => 
          <Text style={{marginRight: 10, marginTop: 10, color: SettingsColor.accentColor, fontSize: 17}}>
            {DateTime.fromISO(settings.dayStartHour).toFormat('HH:mm')}
          </Text>} 
      />
      <Divider />
      <List.Item
        title={t('settings.feedback')}
        description={t('settings.feedbackDescription')}
        onPress={() => email('jimenaa971@gmail.com')}
      />
      <Divider />
      <List.Item
        title={t('settings.share')}
        description={t('settings.shareDescription')}
        onPress={() => Share.share({message: t('settings.shareMessage')})}
      />
      <Divider />
      <List.Item
        title={t('settings.export')}
        description={t('settings.exportDescription')}
        onPress={() => writeFile(state)}
      />
      <Divider />
      <List.Item
        title={t('settings.import')}
        description={t('settings.importDescription')}
        onPress={() => readFile()}
      />
      <Divider />
      <List.Item
        title={t('settings.language')}
        description={t('settings.languageDescription')}
        onPress={() => setLanguageDialogVisible(true)}
        right={() => 
          <Text style={{
            marginRight: 10, marginTop: 10, 
            color: SettingsColor.accentColor, fontSize: 17
          }}>
            {t('settings.languageLocale')}
          </Text>} />
      <Divider />
      
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="time"
        onConfirm={(JSDate) => changeDayStartHour(JSDate)}
        onCancel={() => setDatePickerVisibility(false)}
        date={DateTime.fromISO(settings.dayStartHour).toJSDate()}
      />

      <Portal>
        <Dialog visible={isImportDialogVisible} onDismiss={() => {setImportDialogVisible(false)}}>
          <Dialog.Title>{t('settings.importDialog.title')}</Dialog.Title>
          <Dialog.Content>
            <Paragraph>{t('settings.importDialog.content')}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => importStateFromText(importedStateText)}>{t('settings.importDialog.buttonAcept')}</Button>
            <Button onPress={() => setImportDialogVisible(false)}>{t('settings.importDialog.buttonCancel')}</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={isLanguageDialogVisible} onDismiss={() => {setLanguageDialogVisible(false)}}>
          <Dialog.Title>{t('settings.languageDialog.title')}</Dialog.Title>
            <Dialog.Content>
              <Divider />
              <List.Item title={t('settings.languageDialog.english')} onPress={() => {i18n.changeLanguage('en'); setLanguage('en'); setLanguageDialogVisible(false); /*onChangeLanguage()*/}} />
              <Divider />
              <List.Item title={t('settings.languageDialog.spanish')} onPress={() => {i18n.changeLanguage('es'); setLanguage('es'); setLanguageDialogVisible(false); /*onChangeLanguage()*/}} />
              <Divider />
            </Dialog.Content>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snackbarMessage != ""}
        onDismiss={()=>setSnackbarMessage("")}
        duration={5000}
      >{snackbarMessage}</Snackbar>

    </View>
    
  );
};

const writeFile =  (state) => {
  const date = DateTime.now().toFormat('dd-MM-yy')
  let fileUri = FileSystem.cacheDirectory + `Goaliat_Export_${date}.oda`
  FileSystem.writeAsStringAsync(
    fileUri, 
    JSON.stringify(state, null, 2), 
    { encoding: FileSystem.EncodingType.UTF8 }
  ).then(()=>Sharing.shareAsync(fileUri))
}

const mapStateToProps = (state) => {
  const settings = state.settings
  return { settings, state }
}

const actionToProps = {
  setDayStartHour,
  importState,
  setLanguage
}

export default connect(mapStateToProps, actionToProps)(SettingsScreen);