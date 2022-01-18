import React from 'react';
import { Appbar, IconButton, withTheme } from 'react-native-paper';
import { IconHighlighter } from '../components';

const Header = withTheme(({ theme, title, subtitle, left, navigation, buttons }) => {
    let leftComponent;

    if(left === 'back'){
        leftComponent = (
            <Appbar.BackAction onPress={navigation.goBack} />
        )
    }else if( left == 'highlightedBack'){
        leftComponent = (
            <IconHighlighter highlightStyle={{backgroundColor: theme.colors.onPrimary}}>
                <Appbar.BackAction color={theme.colors.onPrimary} onPress={navigation.goBack} />
            </IconHighlighter>
        )
    }else if(left == 'hamburger'){
        leftComponent = (
            <IconButton icon='menu' color={theme.colors.onPrimary} onPress={navigation.openDrawer}/>
        )
    }

    return (
        <Appbar>
            {leftComponent}
            <Appbar.Content title={title} subtitle={subtitle} />
            {buttons}
        </Appbar>
    )
})

export default Header;