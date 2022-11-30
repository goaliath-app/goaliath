import React from 'react';
import {View} from 'react-native'
import { Menu, Appbar, withTheme, IconButton } from 'react-native-paper'
import { ThreeDotsMenuColor } from '../styles/Colors';


const ThreeDotsMenu = withTheme(({ theme, menuItems, visible, openMenu, closeMenu }) => {
  
  return (
    <View>
      <Menu
        style={{ top: 60}}
        contentStyle={{backgroundColor: theme.colors.menuBackground}}
        visible={visible}
        onDismiss={closeMenu}
        anchor={<Appbar.Action icon='dots-vertical' color={theme.colors.headerContent} onPress={openMenu} style={{ height: 48, width: 48 }} />}>
        {menuItems}
      </Menu>
    </View>
    )
})

/* New version of the three dots menu, that manages its own state.
 * TODO: refactor all usages of the old ThreeDotsMenu to this one, since it
 * prevents unnecesary rerenders of the parent component each time the menu is
 * opened or closed.
 */ 
export const SelfManagedThreeDotsMenu = withTheme(({ 
  theme, 
  /* items is a list of objects, each with the following properties: 
    - title: the text to display in the menu item
    - onPress: the function to call when the menu item is pressed
  */
  items,
  color,
  size
}) => {
  const [menuVisible, setMenuVisible] = React.useState(false)

  const menuItems = items.map(item => (
    <Menu.Item
      key={item.title}
      title={item.title}
      onPress={() => {
        item.onPress()
        setMenuVisible(false)
      }}
    />
  ))
  
  return (
    <View>
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <IconButton 
            icon='dots-vertical' color={color ? color : theme.colors.headerContent} 
            onPress={() => setMenuVisible(true)} 
            style={{ height: 48, width: 48 }} 
            { ...(size ? { size: size } : {}) }
          />
        }
      >
        {menuItems}
      </Menu>
    </View>
    )
})

export default ThreeDotsMenu;