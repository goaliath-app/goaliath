import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Subheading, Title, Paragraph, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next'
import { HelpIcon } from '../../components';

const ActivityTypeSelector = ({ repeatMode, setRepeatMode }) => {
  const { t, i18n } = useTranslation()
  return(
    <>
      <View 
        style={{
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginHorizontal: 16, 
          paddingBottom: 10
        }}
      >
      <Subheading>{t('activityForm.repeatSwitchBar.title')}</Subheading>
        <HelpIcon dialogContent={
          <>
          <Title>{t('activityForm.repeatInfoDialog.mainTitle')}</Title>
          <Subheading>{t('activityForm.repeatInfoDialog.dailyTitle')}</Subheading>
          <Paragraph>{t('activityForm.repeatInfoDialog.dailyText')}</Paragraph>
          <Subheading>{t('activityForm.repeatInfoDialog.selectTitle')}</Subheading>
          <Paragraph>{t('activityForm.repeatInfoDialog.selectText')}</Paragraph>
          <Subheading>{t('activityForm.repeatInfoDialog.weeklyTitle')}</Subheading>
          <Paragraph>{t('activityForm.repeatInfoDialog.weeklyText')}</Paragraph>
          </>
        } />
      </View>
      <ButtonSwitchBar
        options={[
          {label: t('activityForm.repeatSwitchBar.daily'), value: 'daily'},
          {label: t('activityForm.repeatSwitchBar.select'), value: 'select'},
          {label: t('activityForm.repeatSwitchBar.weekly'), value: 'weekly'},
        ]}
        state={repeatMode} setState={setRepeatMode}
      />
    </>
  )
}

const ButtonSwitchBar = ({ options, state, setState }) => {
  /* generic switch bar component */
  const styles = StyleSheet.create({
    buttonSwitchBarView: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 10,
    },
  })
  
  return(
    <View style={styles.buttonSwitchBarView}>
      {options.map((option) => (
        <Button style={{flex:1, borderRadius: 0}}
        mode={state==option.value? 'contained':'text'} 
        onPress={()=>setState(option.value)}
        labelStyle={{ fontSize: 11}}>
            {option.label}
        </Button>
      ))}
    </View>
  )
}

export default ActivityTypeSelector