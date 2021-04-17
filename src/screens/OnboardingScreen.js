import { Image, View, Text, StyleSheet } from 'react-native';
import { Title, Paragraph, Subheading } from 'react-native-paper'
import React from 'react';

import AppIntroSlider from 'react-native-app-intro-slider';

const styles = StyleSheet.create({
    buttonCircle: {
      width: 40,
      height: 40,
      backgroundColor: 'rgba(0, 0, 0, .2)',
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    slide: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    }
    //[...]
  });

const slides = [
    {
      key: 'one',
      title: 'Welcome to Goaliath',
      text: 'Managing your own time is hard. You need to define your goals, prioritize, build a plan and be consistent.\nGoaliath is here to help you.',
    },
    {
      key: 'two',
      title: 'The Goaliath\'s approach',
      text: 'If you are into time management apps you know that most of the time they require too much effort to be used effectively.\n\nWe think that tools are made to reduce effort, not to increase it. Goliath is made so that you can plan once and execute without hesitation.',
    },
    {
      key: 'three',
      title: 'Be serene',
      text: 'Have you felt that angst, knowing you are not acting according to your values?\n\nFeel it no more, knowing that each day is what you want it to be.\n\nAs Seneca once said: “Life is very short and anxious for those who forget the past, neglect the present, and fear the future”',
    }
  ];

 const _renderItem = ({ item }) => {
    return(
        <View style={styles.slide}>
            <View style={{ alignItems: 'center', justifyContent: 'center', marginHorizontal: 18 }}>
                <Title style={{ marginBottom: 8}} >{item.title}</Title>
                <Paragraph style={{ textAlign: 'justify' }} >{item.text}</Paragraph>
            </View>
        </View>
    )
  }

const NotSoSimple = ({ finishOnboarding }) => (
    <AppIntroSlider 
        renderItem={_renderItem} 
        data={slides} 
        onDone={finishOnboarding}
        activeDotStyle={{ backgroundColor: '#555555' }}
        renderNextButton={() => <Subheading style={{ marginRight: 12, color: 'black' }}>Next</Subheading>}
        renderDoneButton={() => <Subheading style={{ marginRight: 12, color: 'black' }}>Begin</Subheading>}
    />
);


export default NotSoSimple;