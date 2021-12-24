import React from 'react';
import { View } from 'react-native'
import { Paragraph, Card, Title } from 'react-native-paper'
import { InfoCardColor } from '../styles/Colors';

const InfoCard = ({title, paragraph, extraContent, style={}}) => (
  <View style={{ margin: 24 }}>
    <Card style={{backgroundColor: 'aliceblue'}}>
      <Card.Content style={style}>
        { title? <Title>{title}</Title> : null }
        { paragraph ? <Paragraph>{paragraph}</Paragraph> : null }
        {extraContent}
      </Card.Content>
    </Card>
  </View>
)

export default InfoCard