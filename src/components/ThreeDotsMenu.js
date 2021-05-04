import React from 'react';
import {View} from 'react-native'
import {Menu, Appbar} from 'react-native-paper'
import { ThreeDotsMenuColor } from '../styles/Colors';


const ThreeDotsMenu = ({ menuItems, visible, openMenu, closeMenu }) => {
  
  return (
    <View>
      <Menu
        style={{ top: 60 }}
        visible={visible}
        onDismiss={closeMenu}
        anchor={<Appbar.Action icon='dots-vertical' color={ThreeDotsMenuColor.menuIcon} onPress={openMenu} />}>
        {menuItems}
      </Menu>
    </View>
    )
}

export default ThreeDotsMenu;