import React from 'react';
import { Appbar, IconButton } from 'react-native-paper';

const Header = ({ title, left, navigation, buttons }) => {
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
        <Appbar.Header>
            {leftComponent}
            <Appbar.Content title={title} />
            {buttons}
        </Appbar.Header>
    )
}

export default Header;