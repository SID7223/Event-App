import * as Font from 'expo-font';

// Semantic font families — Poppins everywhere, boldness reduced by 50%
export const fonts = {
  heading: 'Poppins_500Medium' as const,
  subheading: 'Poppins_400Regular' as const,
  body: 'Poppins_500Medium' as const,
  bodyBold: 'Poppins_500Medium' as const,
  button: 'Poppins_500Medium' as const,
  buttonAlt: 'Poppins_500Medium' as const,
};

// Load the specific fonts we need
export const loadFonts = async () => {
  await Font.loadAsync({
    'Poppins_400Regular': require('@expo-google-fonts/poppins/400Regular/Poppins_400Regular.ttf'),
    'Poppins_500Medium': require('@expo-google-fonts/poppins/500Medium/Poppins_500Medium.ttf'),
  });
};
