import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { withTheme } from 'react-native-paper'
import { 
  selectCurrentOverlay, selectGuideValue, setGuideValue, releaseCurrentOverlay, 
  setCurrentOverlay
} from '../redux';
import Tooltip from 'react-native-walkthrough-tooltip';
import { useIsFocused, useRoute, useFocusEffect } from '@react-navigation/native';

/* this function is used to set a trigger point for a tooltip set in manual mode
 * When the screen is focused, it will show the specified tooltip only if
 * condition is true
 */
export function useTooltipAnchor(tooltipName, tooltipIdentifier, condition){
  const dispatch = useDispatch()

  const guideKey = `${tooltipName}BeenShown`

  const currentOverlay = useSelector(selectCurrentOverlay)
  const hasTooltipBeenShown = useSelector(
    state => selectGuideValue(state, guideKey)
  )

  useFocusEffect(() => {
    // shown overlay if not already shown and there are no other overlays
    if(condition && !currentOverlay && !hasTooltipBeenShown) {
      dispatch(setCurrentOverlay(tooltipIdentifier))
    }
  })
}

export function useTooltip(  
  tooltipName, // So the same message don't get shown twice. Multiple Tooltips
               // can have the same name. If one is shown, the other won't.
  tooltipIdentifier, // this needs to be a unique identifier for this tooltip
  manual=false, // if true, the tooltip won't be shown automatically,
                // you need to set currentOverlay to its id manually
                // our using the useTooltipAnchor hook
){
  const dispatch = useDispatch()

  // key for the boolean shown/not-shown value for this tooltip
  const guideKey = `${tooltipName}BeenShown`

  const currentOverlay = useSelector(selectCurrentOverlay)
  const hasTooltipBeenShown = useSelector(
    state => selectGuideValue(state, guideKey)
  )

  const route = useRoute();
  
  // check if the screen that contains the overlay is focused, we don't want
  // to show the overlay of a screen that is not.
  const isFocused =  useIsFocused()
  
  return withTheme(({theme, children, ...otherProps}) => {

    React.useEffect(() => {
      // shown overlay if not already shown and there are no other overlays
      if(!manual && !currentOverlay && !hasTooltipBeenShown) {
        dispatch(setCurrentOverlay(tooltipIdentifier))
      }
    })

    return(
      <Tooltip
        isVisible={ currentOverlay == tooltipIdentifier && ( isFocused || manual ) }
        displayInsets={{top: 0, bottom: 0, left: 50, right: 50}}
        placement="bottom"
        onClose={() => {
          dispatch(releaseCurrentOverlay())
          dispatch(setGuideValue(guideKey, true))
        }}
        useInteractionManager={true}
        contentStyle={{backgroundColor: theme.colors.tooltipBackground}}
        {...otherProps}
      >
        {children}
      </Tooltip>  
    )
  })
}