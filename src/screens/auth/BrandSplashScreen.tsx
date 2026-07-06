import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  StatusBar,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const BrandSplashScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const logoFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(logoFade, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    const navTimer = setTimeout(() => {
      navigation.replace('Splash');
    }, 2000);

    return () => clearTimeout(navTimer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <Animated.View style={[styles.content, { opacity: logoFade }]}>
        <Image
            source={require('../../../assets/New Logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 121,
    height: 121,
    marginTop: 16,
  },
});

export default BrandSplashScreen;
