import React from 'react';
import { View } from 'react-native'
import { Paragraph, Card } from 'react-native-paper'
import { InfoCardColor } from '../styles/Colors';

const InfoCard = ({content}) => (
  <View style={{ margin: 24 }}>
    <Card>
      <Card.Content>
        <Paragraph style={{color: InfoCardColor.paragraph}}>
          {content}
        </Paragraph>
      </Card.Content>
    </Card>
  </View>
)

export default InfoCard