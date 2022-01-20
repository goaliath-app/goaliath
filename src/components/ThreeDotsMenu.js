import React from 'react';
import {View} from 'react-native'
import { Menu, Appbar, withTheme } from 'react-native-paper'
import { ThreeDotsMenuColor } from '../styles/Colors';


const ThreeDotsMenu = withTheme(({ theme, menuItems, visible, openMenu, closeMenu }) => {
  
  return (
    <View>
      <Menu
        style={{ top: 60 }}
        visible={visible}
        onDismiss={closeMenu}
        anchor={<Appbar.Action icon='dots-vertical' color={theme.colors.onPrimary} onPress={openMenu} style={{ height: 48, width: 48 }} />}>
        {menuItems}
      </Menu>
    </View>
    )
})

export default ThreeDotsMenu;