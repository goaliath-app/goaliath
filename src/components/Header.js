import React from 'react';
import { Appbar, IconButton, withTheme } from 'react-native-paper';
import { IconHighlighter } from '../components';

const Header = withTheme(({ theme, title, subtitle, left, navigation, buttons }) => {
    let leftComponent;

    if(left === 'back'){
        leftComponent = (
            <Appbar.BackAction onPress={navigation.goBack} style={{ height: 48, width: 48 }} color={theme.colors.headerContent} />
        )
    }else if( left == 'highlightedBack'){
        leftComponent = (
            <IconHighlighter highlightStyle={{backgroundColor: theme.colors.headerContent}}>
                <Appbar.BackAction color={theme.colors.headerContent} onPress={navigation.goBack} style={{ height: 48, width: 48 }} />
            </IconHighlighter>
        )
    }

    return (
        <Appbar style={{backgroundColor: theme.colors.headerBackground}}>
            {leftComponent}
            <Appbar.Content title={title} subtitle={subtitle} titleStyle={{color: theme.colors.headerContent}} />
            {buttons}
        </Appbar>
    )
})

export default Header;