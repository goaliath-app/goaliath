import React from 'react';
import { View, Share } from 'react-native'
import { connect, useStore } from 'react-redux';
import { Text, List, Divider, Paragraph, Portal, Dialog, Button } from 'react-native-paper'
import { DateTime } from 'luxon'
import { setDayStartHour, importState, setLanguage } from '../../redux'
import { Header } from '../../components'
import DateTimePickerModal from "react-native-modal-datetime-picker"
import email from 'react-native-email'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import * as DocumentPicker from 'expo-document-picker'
import { useTranslation } from 'react-i18next'
import { GeneralColor, SettingsColor } from '../../styles/Colors';


const SettingsScreen = ({ settings, setDayStartHour, setLanguage, navigation, state, importState }) => {
  const [isDatePickerVisible, setDatePickerVisibility] = React.useState(false);

  const { t, i18n } = useTranslation()
  
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

  const [languageDialogVisible, setLanguageDialogVisible] = React.useState(false);
  const showLanguageDialog = () => setLanguageDialogVisible(true);
  const hideLanguageDialog = () => setLanguageDialogVisible(false);

  const [importDialogVisible, setImportDialogVisible] = React.useState(false);
  const showImportDialog = () => setImportDialogVisible(true);
  const hideImportDialog = () => setImportDialogVisible(false);
  
  const [text, setText] = React.useState('');

  const readFile = () => {
    DocumentPicker.getDocumentAsync({type: 'application/oda'})
      .then(({ type, uri }) => FileSystem.readAsStringAsync(uri)
        .then((text) => {
          setText(text)
          showImportDialog()
          }
        )
      )
  }

  function importStateFromText(text){
    // TODO: dont break if file is bad formatted
    hideImportDialog()
    const state = JSON.parse(text)
    importState(state)
  }

  return (
    <View style={{flex: 1, backgroundColor: GeneralColor.screenBackground}}>
      <Header title={t('settings.headerTitle')} left='hamburger' navigation={navigation}/>
      <List.Item 
        title={t('settings.startHour')}
        description={t('settings.startHourDescription')}
        onPress={showDatePicker} 
        right={() => <Text style={{marginRight: 10, marginTop: 10, color: SettingsColor.accentColor, fontSize: 17}}>{DateTime.fromISO(settings.dayStartHour).toFormat('HH:mm')}</Text>} />
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="time"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        date={DateTime.fromISO(settings.dayStartHour).toJSDate()}
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
        onPress={() => showLanguageDialog()}
        right={() => <Text style={{marginRight: 10, marginTop: 10, color: SettingsColor.accentColor, fontSize: 17}}>{t('settings.languageLocale')}</Text>} />
      <Divider />

      <Portal>
        <Dialog visible={importDialogVisible} onDismiss={() => {hideImportDialog()}}>
          <Dialog.Title>{t('settings.importDialog.title')}</Dialog.Title>
          <Dialog.Content>
            <Paragraph>{t('settings.importDialog.content')}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => importStateFromText(text)}>{t('settings.importDialog.buttonAcept')}</Button>
            <Button onPress={() => hideImportDialog()}>{t('settings.importDialog.buttonCancel')}</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={languageDialogVisible} onDismiss={() => {hideLanguageDialog()}}>
          <Dialog.Title>{t('settings.languageDialog.title')}</Dialog.Title>
            <Dialog.Content>
              <Divider />
              <List.Item title={t('settings.languageDialog.english')} onPress={() => {i18n.changeLanguage('en'); setLanguage('en'); hideLanguageDialog(); /*onChangeLanguage()*/}} />
              <Divider />
              <List.Item title={t('settings.languageDialog.spanish')} onPress={() => {i18n.changeLanguage('es'); setLanguage('es'); hideLanguageDialog(); /*onChangeLanguage()*/}} />
              <Divider />
            </Dialog.Content>
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
    importState,
    setLanguage
}

export default connect(mapStateToProps, actionToProps)(SettingsScreen);