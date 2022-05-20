# Goaliath
Goaliath is a free time and goal management app. Goaliath seeks to make you feel proud of your daily actions.

Goaliath is opinionated and designed to support a specific time management strategy. You can learn the method in [our website](https://goaliath-app.github.io/guide).

We are still an early work in progress! If you want to know more, feel free to check our quick guide and download an alpha build also available at [our website](https://goaliath-app.github.io).

If you want to use the app, you can access to Goaliath's beta version in the [Play Store](https://play.google.com/store/apps/details?id=app.goaliath). For now it is only available for Android.

## State of the project
| Version | Description | State |
|---|---|---|
| v0.1 | First fully functional approximation | 100% |
| v0.2 | Improve the underlying time management method | 100% |
| v0.3 | Add not essential features (stats, notes, etc.) | 100% |
| v0.4 | Quality of Life improvements | 100% |
| v0.5 | Onboarding and tutorial | 100% |
| v0.6 | Visual and styling improvements | 100% |
| v1.0 | First version to be publised to the Play Store | 100% |
| Future | Fixes, improvements and new features | - |

## Our stack
Goaliath is written in JavaScript using **[React Native](https://github.com/facebook/react-native)** over **[Expo](https://github.com/expo/expo)**. We also use:
* **[Redux](https://github.com/reduxjs/redux)** to keep all the app's state.
* **[redux-persist](https://github.com/rt2zz/redux-persist)** as our persist method.
* **[Luxon](https://github.com/moment/luxon/)** for the date and time management.
* **[i18next](https://github.com/i18next/i18next)** for translations.
* **[OpenMoji](https://github.com/hfg-gmuend/openmoji)** as part of the illustrations on the onboarding slides.
* **[React Navigation](https://github.com/react-navigation/react-navigation)** as our navigation method.
* **[react-native-paper](https://github.com/callstack/react-native-paper)** for our basic ui components.
* **[react-native-walkthrough-tooltip](https://github.com/jasongaare/react-native-walkthrough-tooltip)** for the highlighted tutorial messages.
* **[react-native-vector-icons](https://github.com/oblador/react-native-vector-icons)** and **[fortawesome](https://github.com/FortAwesome/Font-Awesome)** for the icons in the app.
* **[react-native-progress](https://github.com/oblador/react-native-progress)** and **[react-native-circular-progress](https://github.com/bartgryszko/react-native-circular-progress)** to show the progress of goals and activities.
* **[react-native-switch-selector](https://github.com/App2Sales/react-native-switch-selector)** to switch between bar chart options.
* **[react-native-reanimated](https://github.com/software-mansion/react-native-reanimated)** to animate components.
* **[react-native-gesture-handler](https://github.com/software-mansion/react-native-gesture-handler)** for gesture management.
* **[react-native-wheel-scrollview-picker](https://github.com/rheng001/react-native-wheel-scrollview-picker)** for a custom wheel date picker component.
* **[react-native-app-intro-slider](https://github.com/Jacse/react-native-app-intro-slider)** for the onboarding.
* **[react-native-async-storage](https://github.com/react-native-async-storage/async-storage)** as our data storage system.
* **[react-native-keyboard-aware-scroll-view](https://github.com/APSL/react-native-keyboard-aware-scroll-view)** to handle the keyboard appearance.
* **[react-native-modal-datetime-picker](https://github.com/mmazzarolo/react-native-modal-datetime-picker)** as time selector.
* **[react-native-dropdown-picker](https://github.com/hossein-zare/react-native-dropdown-picker)** to select a goal from a list to view its stats.
* **[react-native-email](https://github.com/tiaanduplessis/react-native-email)** to allow users to send e-mails to us.
* **[expo-file-system](https://github.com/expo/expo/tree/main/packages/expo-file-system)** to read and write backups data.
* **[expo-sharing](https://github.com/expo/expo/tree/main/packages/expo-sharing)** to export app backups.
* **[expo-notifications](https://github.com/expo/expo/tree/main/packages/expo-notifications)** to display notifications to the user.
* **[expo-status-bar](https://github.com/expo/expo/tree/main/packages/expo-status-bar)** to control the app's status bar.
* **[expo-document-picker](https://github.com/expo/expo/tree/main/packages/expo-document-picker)** to select documents on the user's device for importing app backups.
* **[expo-localization](https://github.com/expo/expo/tree/main/packages/expo-localization)** for localization.
* **[color](https://github.com/Qix-/color)** for immutable color conversion and manipulation.
* **[array-move](https://github.com/sindresorhus/array-move)** to mpve an array item to a different position.
* **[sentry-expo](https://github.com/expo/sentry-expo)** to keep bugs at bay.



## How to test locally
You'll need yarn and expo-client installed. After that, just clone this repository, and run:

```
yarn install
yarn start
```

Then the expo developer tools will be available, and from that you'll be able to run the app from the Expo Go app. Note that running the app in web browser mode is not supported.

## Contributors
* [JimenaAndrea](https://github.com/JimenaAndrea)
* [OliverLSanz](https://github.com/OliverLSanz)




