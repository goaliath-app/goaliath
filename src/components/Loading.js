import React from 'react';
import { View, ActivityIndicator } from 'react-native'
import { withTheme } from 'react-native-paper'

const LoadingContainer = ({ children, LoadingComponent=()=><View/>, bypassLoading=false }) => {
  if(children.length > 1){
    throw 'Loading container can only have one child, wrap them in a View'
  }


  const [ isLoading, setLoading ] = React.useState(!bypassLoading)
  
  React.useEffect(() => {
    // set Loading to false after small timeout to allow the rendered loading
    // component to appear. Without the timeout it may be disposed and just
    // the final component would be rendered.
    setTimeout(() => setLoading(false), 1)
  }, [])

  return ( 
    isLoading ? 
      <LoadingComponent />
    :
      children
  )
}

/* Higher order component that wraps the children in a LoadingContainer */
export function loadedComponent(Component, LoadingComponent){
  return ({ loading=LoadingComponent, bypassLoading=false, ...otherProps }) => (
    <LoadingContainer LoadingComponent={loading}  bypassLoading={bypassLoading}>
      <Component {...otherProps} />
    </LoadingContainer>
  )
}

export const FullScreenActivityIndicator = withTheme(({ theme }) => (
  <View style={{flex: 1, justifyContent: "center"}}>
    <ActivityIndicator style={{transform: [{scale: 2.5}]}} color={theme.colors.primary} />
  </View>
))

export const patata = 'PATATA'