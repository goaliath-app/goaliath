import React from 'react';
import {View} from 'react-native'
import {Menu, Appbar} from 'react-native-paper'

const data = [
    {item1: 'Edit activity', item2: 'Delete activity'},
    {item1: 'Edit goal', item2: 'Delete goal'} ]

const ThreeDotsMenu = ({ menuItems }) => {
  const [visible, setVisible] = React.useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <View>
      <Menu
        style={{ top: 60 }}
        visible={visible}
        onDismiss={closeMenu}
        anchor={<Appbar.Action icon='dots-vertical' color='white' onPress={openMenu}/>}>
        {/* <Menu.Item onPress={() => {}} title={data[0].item1} />
        <Menu.Item onPress={() => {}} title='Delete activity' /> */}
        {menuItems}
      </Menu>
    </View>
    )
}

export default ThreeDotsMenu;