import React from 'react';
import { View } from 'react-native'
import { Paragraph, Card, Title, withTheme } from 'react-native-paper'

const InfoCard = withTheme(({
  theme,
  title, 
  paragraph, 
  extraContent, 
  style={},
  cardStyle={},
  titleStyle={}, 
  paragraphStyle={}
}) => (
  <View style={{ margin: 24 }}>
    <Card style={[{backgroundColor: theme.colors.primaryLightVariant}, cardStyle]}>
      <Card.Content style={style}>
        { title? <Title style={titleStyle}>{title}</Title> : null }
        { paragraph ? <Paragraph style={paragraphStyle}>{paragraph}</Paragraph> : null }
        {extraContent}
      </Card.Content>
    </Card>
  </View>
))

export default InfoCard