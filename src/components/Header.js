import React from 'react';
import { Appbar, IconButton } from 'react-native-paper';
import { HeaderColor } from '../styles/Colors';
import { IconHighlighter } from '../components';

const Header = ({ title, subtitle, left, navigation, buttons }) => {
    let leftComponent;

    if(left === 'back'){
        leftComponent = (
            <Appbar.BackAction onPress={navigation.goBack} />
        )
    }else if( left == 'highlightedBack'){
        leftComponent = (
            <IconHighlighter highlightStyle={{backgroundColor: 'white'}}>
                <Appbar.BackAction color={HeaderColor.icon} onPress={navigation.goBack} />
            </IconHighlighter>
        )
    }else if(left == 'hamburger'){
        leftComponent = (
            <IconButton icon='menu' color={HeaderColor.icon} onPress={navigation.openDrawer}/>
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