import React from 'react';
import { useSelector } from 'react-redux'
import { getTodaySelector } from '../redux'
import { Linking, View, Image } from 'react-native'
import { Divider, Title, Subheading } from 'react-native-paper'
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faCalendarDay, faCalendarWeek, faTrophy, faCalendarAlt, faCog, faBlog, faChartBar } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'
import { DateTime } from 'luxon'
import { DrawerColor } from '../styles/Colors'


const Drawer = (props) => {
  const { t, i18n } = useTranslation()

  const CustomDrawerItem = ({label, icon, route, index}) => (
    <DrawerItem
      label={label}
      icon={({ color })=> <FontAwesomeIcon icon={icon} color={color} size={20} />}
      onPress={()=>props.navigation.navigate(route)}
      focused={props.state.index==index}
    />
  )

/* Another option for the drawer header
<View style={{paddingTop: 10, paddingBottom: 10, paddingHorizontal: 20, alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between'}}>
  <Title>Goaliath</Title>
  <Image source={require('../../assets/icon.png')} style={{height: 60, width: 60, marginBottom: 5}} resizeMode='contain' />
</View>
*/
  const todayDate = useSelector(getTodaySelector)
  const monthLabel = t('units.monthNames.' + todayDate.toFormat('MMMM').toLowerCase())
  const weekdayLabel = t('units.dayNames.' + todayDate.toFormat('cccc').toLowerCase())
  return (
    <DrawerContentScrollView {...props} style={{marginTop: -4}}>
      <View style={{ backgroundColor: DrawerColor.headerBackground, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20}}>
        <Image source={require('../../assets/icon.png')} style={{height: 50, width: 50}} resizeMode='contain' />
        <Subheading style={{ fontSize: 25, paddingHorizontal: 20, paddingTop: 5, color: DrawerColor.headerText}}>{t('drawer.appName')}</Subheading>
      </View>
      <View style={{paddingTop: 10, paddingBottom: 10, paddingHorizontal: 20}}>
        <Subheading>{`${weekdayLabel}, ${todayDate.day} ${monthLabel} ${todayDate.year}`}</Subheading>
      </View>
      <CustomDrawerItem label={t('today.headerTitle')} icon={faCalendarDay} route={'Today'} index={0} />
      {/* <Divider style={{marginHorizontal: 10}} /> */}
      <CustomDrawerItem label={t('goals.headerTitle')} icon={faTrophy} route='Goals' index={1} />
      <CustomDrawerItem label={t('calendar.headerTitle')} icon={faCalendarAlt} route='Calendar' index={2} />
      <CustomDrawerItem label={t('settings.headerTitle')} icon={faCog} route='Settings' index={3} />
      <CustomDrawerItem label={t('statsScreen.drawerTitle')} icon={faChartBar} route='Stats' index={4} />
      <DrawerItem
        label={t('drawer.blog')}
        icon={({color})=> <FontAwesomeIcon icon={faBlog} color={color} size={20} />}
        onPress={() => Linking.openURL(t('drawer.blogURL'))}
      />
    </DrawerContentScrollView>
  );
  }

export default Drawer