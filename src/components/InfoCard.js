import React from 'react';
import { View } from 'react-native'
import { Paragraph, Card } from 'react-native-paper'

const InfoCard = ({content}) => (
  <View style={{ margin: 24 }}>
    <Card>
      <Card.Content>
        <Paragraph style={{color: 'gray'}}>
          {content}
        </Paragraph>
      </Card.Content>
    </Card>
  </View>
)

export default InfoCard