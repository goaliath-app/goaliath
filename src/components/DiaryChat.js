import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, Text } from 'react-native'
import { DayContent } from '../components'
import { Header } from '../components';
import { getTodaySelector } from '../redux'
import { useTranslation } from 'react-i18next'
import { GeneralColor } from '../styles/Colors';

import { GiftedChat } from 'react-native-gifted-chat'

const DiaryChat = ({}) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: 'This is the diary for the activity. You can write here anything you want: your progress, any relevant landmarks, your thoughts and feelings, etc.',
        createdAt: new Date(Date.UTC(2016, 5, 11, 17, 20, 0)),
        user: {
          _id: 2,
          name: 'React Native',
          avatar: 'https://avatars.githubusercontent.com/u/83209919?s=200&v=4',
        },
      },
      // {
      //   _id: 2,
      //   text: 'This is a system message',
      //   createdAt: new Date(Date.UTC(2016, 5, 11, 17, 20, 0)),
      //   system: true,
      //   // Any additional custom parameters are passed through
      // }
    ])
  }, [])

  const onSend = useCallback((messages = []) => {
    setMessages(previousMessages => GiftedChat.append(previousMessages, messages))
  }, [])

  return (
    <GiftedChat
      placeholder={"Type a note..."}
      messages={messages}
      onSend={messages => onSend(messages)}
      user={{
        _id: 1,
      }}
    />
  )
}

export default DiaryChat
