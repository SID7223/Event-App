import { useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { useAuth } from '../store';
import { API_BASE_URL } from '../constants/config';
import { useNavigation } from '@react-navigation/native';

WebBrowser.maybeCompleteAuthSession();

const DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { loginWithTokens } = useAuth();
  const navigation = useNavigation<any>();

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: '1016005422620-455ef36nor6tfh6ffimrs2fe5uqpkjlh.apps.googleusercontent.com',
      scopes: ['openid', 'profile', 'email'],
      redirectUri: makeRedirectUri({ useProxy: false }),
    },
    DISCOVERY
  );

  const signIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await promptAsync();
      if (result.type !== 'success') {
        setIsLoading(false);
        return;
      }

      const { idToken, accessToken } = result.params;

      const res = await fetch(`${API_BASE_URL}/auth/social/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, accessToken }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || 'Google login failed');

      const authData = data.data;
      const user = authData.user;
      const hasLocation = user.location?.city || user.city;
      const hasPreferences = user.preferences?.length > 0 || user.interests?.length > 0;
      const hasCompletedOnboarding = !!(hasLocation && hasPreferences);
      
      loginWithTokens(authData.accessToken, authData.refreshToken, authData.accessTokenExpiresAt, user);
      
      if (!hasCompletedOnboarding) {
        navigation.navigate('LocationStep', { user });
      }
      
      return user;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { signIn, isLoading, error };
}
