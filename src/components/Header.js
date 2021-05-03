import React from 'react';
import { Appbar, IconButton } from 'react-native-paper';

const Header = ({ title, subtitle, left, navigation, buttons }) => {
    let leftComponent;

    if(left === 'back'){
        leftComponent = (
            <Appbar.BackAction onPress={navigation.goBack} />
        )
    }else if(left == 'hamburger'){
        leftComponent = (
            <IconButton icon='menu' color='white' onPress={navigation.openDrawer}/>
        )
    }

    return (
        <Appbar>
            {leftComponent}
            <Appbar.Content title={title} subtitle={subtitle} />
            {buttons}
        </Appbar>
    )
}

export default Header;