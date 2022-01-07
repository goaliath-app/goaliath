import React from 'react';
import { View } from 'react-native'
import { Paragraph, Card, Title } from 'react-native-paper'
import { InfoCardColor } from '../styles/Colors';

const InfoCard = ({
  title, 
  paragraph, 
  extraContent, 
  style={},
  cardStyle={},
  titleStyle={}, 
  paragraphStyle={}
}) => (
  <View style={{ margin: 24 }}>
    <Card style={[{backgroundColor: 'aliceblue'}, cardStyle]}>
      <Card.Content style={style}>
        { title? <Title style={titleStyle}>{title}</Title> : null }
        { paragraph ? <Paragraph style={paragraphStyle}>{paragraph}</Paragraph> : null }
        {extraContent}
      </Card.Content>
    </Card>
  </View>
)

export default InfoCard