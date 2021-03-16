import React from 'react';
import {View} from 'react-native'
import {Menu, Provider, Appbar } from 'react-native-paper'

const data = [
    {item1: 'Edit activity', item2: 'Delete activity'},
    {item1: 'Edit goal', item2: 'Delete goal'} ]

const ThreeDotsMenu = () => {
  const [visible, setVisible] = React.useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <Provider>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'right',
        }}>
        <Menu
          visible={visible}
          onDismiss={closeMenu}
          anchor={<Appbar.Action icon='dots-vertical' color='white' onPress={openMenu}/>}>
          <Menu.Item onPress={() => {}} title='Edit activity' />
          <Menu.Item onPress={() => {}} title='Delete activity' />
        </Menu>
      </View>
    </Provider>   
    )
}

export default ThreeDotsMenu;