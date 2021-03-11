import React from 'react';
import { Appbar, IconButton } from 'react-native-paper';


const HeaderContainer = ({ scene, navigation, previous }) => {  
    const { options } = scene.descriptor
    const title = options.headerTitle !== undefined ? options.headerTitle : 'Default';

    return(
        <Header 
            title={title} 
            left={previous? 'back':'hamburger'} 
            navigation={navigation} />
    )
  };

const Header = ({title, left, navigation}) => {
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
        </Appbar.Header>
    )
}

export default HeaderContainer;