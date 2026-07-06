import * as Font from 'expo-font';

export const fonts = {
  heading: 'Poppins_500Medium' as const,
  subheading: 'Poppins_500Medium' as const,
  body: 'Poppins_400Regular' as const,
  bodyBold: 'Poppins_500Medium' as const,
  button: 'Poppins_500Medium' as const,
  buttonAlt: 'Poppins_500Medium' as const,
  slogan: 'BebasNeue_Regular' as const,
  splashSlogan: 'Nunito_BoldItalic' as const,
  splashSloganLight: 'Nunito_SemiBoldItalic' as const,
};

export const loadFonts = async () => {
  await Font.loadAsync({
    'Poppins_400Regular': require('@expo-google-fonts/poppins/400Regular/Poppins_400Regular.ttf'),
    'Poppins_500Medium': require('@expo-google-fonts/poppins/500Medium/Poppins_500Medium.ttf'),
    'BebasNeue_Regular': require('../../assets/fonts/BebasNeue-Regular.ttf'),
    'Outfit_Regular': require('../../assets/fonts/Outfit-Regular.ttf'),
    'Nunito_BoldItalic': require('../../assets/fonts/Nunito-BoldItalic.ttf'),
    'Nunito_MediumItalic': require('../../assets/fonts/Nunito-MediumItalic.ttf'),
  });
};
