import React from 'react';
import { Linking, Share, View, ScrollView } from 'react-native'
import { connect, useDispatch, useSelector } from 'react-redux';
import { Text, List, Divider, Paragraph, Portal, Switch, Dialog,
  Button, withTheme } from 'react-native-paper'
import { DateTime } from 'luxon'
import DateTimePickerModal from "react-native-modal-datetime-picker"
import email from 'react-native-email'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import * as DocumentPicker from 'expo-document-picker'
import { useTranslation } from 'react-i18next'
import { setDayStartHour, importState, setLanguage, setDailyNotificationHour,
  updateLogs, selectDarkTheme,
} from '../redux'
import { Header } from '../components'
import FeatherIcon from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Notifications from '../notifications';
import { Context } from '../../App'
import { serializeDate, deserializeDate } from '../time';


const SettingsScreen = withTheme(({ theme, settings, setLanguage, navigation, state, importState }) => {
  const darkThemeSwitch = useSelector(selectDarkTheme)
  
  const [ isStartHourPickerVisible, setStartHourPickerVisibility ] = React.useState(false);
  const [ isNotificationHourPickerVisible, setNotificationHourPickerVisibility ] = React.useState(false);
  const [ isLanguageDialogVisible, setLanguageDialogVisible ] = React.useState(false);
  const [ isSupportDialogVisible, setSupportDialogVisible ] = React.useState(false);
  const [ isImportDialogVisible, setImportDialogVisible ] = React.useState(false);
  const [ importedStateText, setImportedStateText ] = React.useState('');
  const [ dailyNotificationSwitch, setDailyNotificationSwitch ] = React.useState(true)

  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const { showSnackbar, setDarkTheme } = React.useContext(Context);

  const changeDayStartHour = (JSDate) => {
    const dateTime = DateTime.fromJSDate(JSDate)
    setStartHourPickerVisibility(false)
    dispatch(setDayStartHour(serializeDate(dateTime)))
    dispatch(updateLogs())
    
    //Snackbar
    showSnackbar(dateTime.toFormat('T') > DateTime.now().toFormat('T')?
     t('settings.yesterdaySnackbar', {startHour: dateTime.toFormat('T').toString()}) 
     : t('settings.todaySnackbar', {startHour: dateTime.toFormat('T').toString()}))
  };

  const readFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({type: 'application/oda'})
    const text = await FileSystem.readAsStringAsync(result.assets[0].uri)
    setImportedStateText(text)
    setImportDialogVisible(true)
  }

  function importStateFromText(text){
    // TODO: dont break if file is bad formatted
    setImportDialogVisible(false)
    let state
    try {
      state = JSON.parse(text)
    } catch(e) {
      showSnackbar("Import failed: wrong file format")
      return
    }
    if(state){
    importState(state)
  }
  }

  const changeDailyNotificationHour = (JSDate, t) => {
    const dateTime = DateTime.fromJSDate(JSDate)
    setNotificationHourPickerVisibility(false)
    dispatch(setDailyNotificationHour(serializeDate(dateTime)))
    Notifications.reminderScheduleNotification(dateTime, t)
  }

  const dailyNotificationHour = useSelector((state) => state.settings.dailyNotificationHour)

  const changeDailyNotificationSwitch = ( t ) => {
    if(dailyNotificationSwitch) {
      setDailyNotificationSwitch(false)
      Notifications.cancelReminderScheduleNotification()
    }
    else if(!dailyNotificationSwitch) {
      setDailyNotificationSwitch(true)
      Notifications.reminderScheduleNotification(deserializeDate(dailyNotificationHour), t)
      
    }
  }

  return (
    <View style={{flex: 1, backgroundColor: theme.colors.settingsScreenBackground}}>
      <Header title={t('settings.headerTitle')} left='back' navigation={navigation}/>
      <ScrollView style={{flex: 1}} >
      <List.Item
        left={() => <FeatherIcon style={{alignSelf: 'center', margin: 5}} size={25} name={"heart"} color={theme.colors.settingsIcons} />}
        title={t('settings.supportUs')}
        description={t('settings.supportUsDescription')}
        titleNumberOfLines={2}
        onPress={() => setSupportDialogVisible(true)}
      />
      <Divider />
      <List.Item
        left={() => <FeatherIcon style={{alignSelf: 'center', margin: 5}} size={25} name={"moon"} color={theme.colors.settingsIcons} />}
        title={t('settings.darkTheme')}
        titleNumberOfLines={2}
        right={() => (
          <Switch 
            value={darkThemeSwitch} 
            onValueChange={ () => setDarkTheme(!darkThemeSwitch) }
            style={{ height: 48, width: 48 }}
          />
        )}
      />
      <Divider />
      <List.Item
        left={() => <FeatherIcon style={{alignSelf: 'center', margin: 5}} size={25} name={"clock"} color={theme.colors.settingsIcons} />}
        title={t('settings.startHour')}
        description={t('settings.startHourDescription')}
        onPress={() => setStartHourPickerVisibility(true)} 
        right={() => 
          <Text style={{marginRight: 10, marginTop: 10, color: theme.colors.settingValueText, fontSize: 17}}>
            {deserializeDate(settings.dayStartHour).toFormat('HH:mm')}
          </Text>} 
      />
      <Divider />
      <List.Item
        left={() => <FeatherIcon style={{alignSelf: 'center', margin: 5}} size={25} name={"mail"} color={theme.colors.settingsIcons} />}
        title={t('settings.feedback')}
        description={t('settings.feedbackDescription')}
        onPress={() => email('goaliath@mailfence.com')}
      />
      <Divider />
      <List.Item
        left={() => <AntDesign style={{alignSelf: 'center', margin: 5}} size={25} name={"sharealt"} color={theme.colors.settingsIcons} />}
        title={t('settings.share')}
        description={t('settings.shareDescription')}
        onPress={() => Share.share({message: t('settings.shareMessage')})}
      />
      <Divider />
      <List.Item
        left={() => <FeatherIcon style={{alignSelf: 'center', margin: 5}} size={25} name={"save"} color={theme.colors.settingsIcons} />}
        title={t('settings.export')}
        description={t('settings.exportDescription')}
        onPress={() => writeFile(state)}
      />
      <Divider />
      <List.Item
        left={() => <FeatherIcon style={{alignSelf: 'center', margin: 5}} size={25} name={"download-cloud"} color={theme.colors.settingsIcons} />}
        title={t('settings.import')}
        description={t('settings.importDescription')}
        onPress={() => readFile()}
      />
      <Divider />
      <List.Item
        left={() => <FeatherIcon style={{alignSelf: 'center', margin: 5}} size={25} name={"globe"} color={theme.colors.settingsIcons} />}
        title={t('settings.language')}
        onPress={() => setLanguageDialogVisible(true)}
        right={() => 
          <Text style={{
            marginRight: 10, marginTop: 10, 
            color: theme.colors.settingValueText, fontSize: 17
          }}>
            {t('settings.languageLocale')}
          </Text>} />
      <Divider />
      <List.Item
        left={() => <FeatherIcon style={{alignSelf: 'center', margin: 5}} size={25} name={"bell"} color={theme.colors.settingsIcons} />}
        title={t('settings.dailyNotification')}
        titleNumberOfLines={2}
        right={() => (
          <Switch 
            value={dailyNotificationSwitch} 
            onValueChange={ () => changeDailyNotificationSwitch( t ) }
            style={{ height: 48, width: 48 }}
          />
        )}
        description={t('settings.dailyNotificationDescription')}
      />
      <Divider />
      {dailyNotificationSwitch?
        <View>
          <List.Item 
            title={t('settings.dailyNotificationHour')}
            onPress={() => setNotificationHourPickerVisibility(true)} 
            right={() => 
              <Text style={{marginRight: 10, marginTop: 10, color: theme.colors.settingValueText, fontSize: 17, paddingBottom: 7}}>
                {deserializeDate(settings.dailyNotificationHour).toFormat('HH:mm')}
              </Text>}
            style={{paddingLeft: 20}} 
          />
          <Divider />
        </View>
        : null
      }
      <List.Item
          left= { () => <FeatherIcon style={{alignSelf: 'center', margin: 5}} size={25} name={"coffee"} color={theme.colors.settingsIcons} />}
          title={t('settings.aboutUs')}
          onPress={() => navigation.navigate('AboutUs')}
        />
        <Divider />
        <List.Item
          left={() => <FeatherIcon style={{alignSelf: 'center', margin: 5}} size={25} name={"book"} color={theme.colors.settingsIcons} />}
          title={t('settings.aboutGoaliath.title')}
          onPress={() => Linking.openURL(t('settings.aboutGoaliath.blogURL'))}
          description={t('settings.aboutGoaliath.description')}
        />
        <Divider />
      </ScrollView>
      
      
      {/*Start Hour Picker*/}
      <DateTimePickerModal
        isVisible={isStartHourPickerVisible}
        mode="time"
        onConfirm={(JSDate) => changeDayStartHour(JSDate)}
        onCancel={() => setStartHourPickerVisibility(false)}
        date={deserializeDate(settings.dayStartHour).toJSDate()}
      />
      {/*Daily Notification Picker*/}
      <DateTimePickerModal
        isVisible={isNotificationHourPickerVisible}
        mode="time"
        onConfirm={(JSDate) => changeDailyNotificationHour(JSDate, t)}
        onCancel={() => setNotificationHourPickerVisibility(false)}
        date={deserializeDate(settings.dailyNotificationHour).toJSDate()}
      />

      <Portal>
        {/* Import dialog */}
        <Dialog visible={isImportDialogVisible} 
          onDismiss={() => {setImportDialogVisible(false)}}
          style={{backgroundColor: theme.colors.dialogBackground}}>
          <Dialog.Title>{t('settings.importDialog.title')}</Dialog.Title>
          <Dialog.Content>
            <Paragraph>{t('settings.importDialog.content')}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setImportDialogVisible(false)}>{t('settings.importDialog.buttonCancel')}</Button>
            <Button onPress={() => importStateFromText(importedStateText)}>{t('settings.importDialog.buttonAcept')}</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Language dialog */}
        <Dialog visible={isLanguageDialogVisible} 
          onDismiss={() => {setLanguageDialogVisible(false)}}
          style={{backgroundColor: theme.colors.dialogBackground}}>
          <Dialog.Title>{t('settings.languageDialog.title')}</Dialog.Title>
            <Dialog.Content>
              <Divider />
              <List.Item title={t('settings.languageDialog.english')} onPress={() => {i18n.changeLanguage('en'); setLanguage('en'); setLanguageDialogVisible(false); /*onChangeLanguage()*/}} />
              <Divider />
              <List.Item title={t('settings.languageDialog.spanish')} onPress={() => {i18n.changeLanguage('es'); setLanguage('es'); setLanguageDialogVisible(false); /*onChangeLanguage()*/}} />
              <Divider />
            </Dialog.Content>
        </Dialog>

        {/* Support us dialog */}
        <Dialog visible={isSupportDialogVisible} 
            onDismiss={() => {setSupportDialogVisible(false)}}
            style={{backgroundColor: theme.colors.dialogBackground}}>
            <Dialog.Title>{t('settings.supportDialog.title')}</Dialog.Title>
              <Dialog.Content>
                <Paragraph>
                  {t('settings.supportDialog.body')}
                </Paragraph>
              </Dialog.Content>
              <Button onPress={() => Linking.openURL('https://ko-fi.com/goaliath')}>
                {t('settings.supportDialog.donate')}
              </Button>
              <View style={{height: 20}} />
          </Dialog>

      </Portal>

    </View>
    
  );
});

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
  setLanguage,
  setDailyNotificationHour,
}

export default connect(mapStateToProps, actionToProps)(SettingsScreen);