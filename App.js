import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_900Black,
  PlayfairDisplay_700Bold_Italic,
} from '@expo-google-fonts/playfair-display';
import {
  SourceSerif4_300Light,
  SourceSerif4_400Regular,
  SourceSerif4_400Regular_Italic,
} from '@expo-google-fonts/source-serif-4';
import {
  DMSans_400Regular,
  DMSans_500Medium,
} from '@expo-google-fonts/dm-sans';
import { AppProvider } from './src/context/AppContext';
import Navigation from './src/navigation';
import { COLORS } from './src/theme';

export default function App() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_900Black,
    PlayfairDisplay_700Bold_Italic,
    SourceSerif4_300Light,
    SourceSerif4_400Regular,
    SourceSerif4_400Regular_Italic,
    DMSans_400Regular,
    DMSans_500Medium,
  });

  if (!fontsLoaded) {
    return <View style={styles.loading} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <StatusBar style="dark" backgroundColor={COLORS.cream} />
        <Navigation />
      </AppProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
});
