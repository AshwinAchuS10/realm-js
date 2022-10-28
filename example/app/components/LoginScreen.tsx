import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import colors from '../styles/colors';
import { shadows } from '../styles/shadows';
import { buttonStyles } from '../styles/button';
import { Realm, useApp } from '@realm/react';

export enum AuthState {
  None,
  Loading,
  LoginError,
  RegisterError,
}

export const LoginScreen = () => {
  const app = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authState, setAuthState] = useState(AuthState.None);

  // If the user presses "login" from the auth screen, try to log them in
  // with the supplied credentials
  const handleLogin = useCallback(async () => {
    console.log(email);
    console.log(password);
    setAuthState(AuthState.Loading);

    let token =
      // This token is valid for 30seconds 
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2FzaHdpbmFjaHUuYXV0aDAuY29tLyIsInN1YiI6IkhUZ1RBTktIWjdkZzloT2pZb2czWHlpbTlqVnI5S1FMQGNsaWVudHMiLCJhdWQiOiJyZWFsbS10ZXN0IiwiaWF0IjoxNjY2OTUzMDQ1LCJleHAiOjE2NjY5NTMwNzUsImF6cCI6IkhUZ1RBTktIWjdkZzloT2pZb2czWHlpbTlqVnI5S1FMIiwiZ3R5IjoiY2xpZW50LWNyZWRlbnRpYWxzIn0.Z6elJE6fwjZuX9b9yIyT9gyjbG5QsQAEuGbOpkBTm7o';
    const credentials = Realm.Credentials.jwt(token);
    try {
      let user = await app.logIn(credentials);
      // This Access token will be valid for 30minutes, we dont have to handle refresh the tokens, 
      // as it will be automatically handled under the SDK
      console.log('user: accessToken', user.accessToken);
      // This Refresh token will be valid for 60days
      console.log('user: refreshToken ', user.refreshToken);

      setAuthState(AuthState.None);
    } catch (e) {
      console.log('Error logging in', e);
      setAuthState(AuthState.LoginError);
    }
  }, [email, password, setAuthState, app]);

  // If the user presses "register" from the auth screen, try to register a
  // new account with the  supplied credentials and login as the newly created user
  const handleRegister = useCallback(async () => {
    setAuthState(AuthState.Loading);

    try {
      // Register the user...
      await app.emailPasswordAuth.registerUser({ email, password });
      // ...then login with the newly created user
      const credentials = Realm.Credentials.emailPassword(email, password);

      await app.logIn(credentials);
      setAuthState(AuthState.None);
    } catch (e) {
      console.log('Error registering', e);
      setAuthState(AuthState.RegisterError);
    }
  }, [email, password, setAuthState, app]);

  return (
    <View style={styles.content}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCompleteType="email"
          textContentType="emailAddress"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Email"
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCompleteType="password"
          textContentType="password"
          placeholder="Password"
        />
      </View>

      {authState === AuthState.LoginError && (
        <Text style={[styles.error]}>
          There was an error logging in, please try again
        </Text>
      )}
      {authState === AuthState.RegisterError && (
        <Text style={[styles.error]}>
          There was an error registering, please try again
        </Text>
      )}

      <View style={styles.buttons}>
        <Pressable
          onPress={handleLogin}
          style={[
            styles.button,
            authState === AuthState.Loading && styles.buttonDisabled,
          ]}
          disabled={authState === AuthState.Loading}>
          <Text style={buttonStyles.text}>Login</Text>
        </Pressable>

        <Pressable
          onPress={handleRegister}
          style={[
            styles.button,
            authState === AuthState.Loading && styles.buttonDisabled,
            styles.registerButton,
          ]}
          disabled={authState === AuthState.Loading}>
          <Text style={buttonStyles.text}>Register</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.darkBlue,
  },

  inputContainer: {
    padding: 10,
    alignSelf: 'stretch',
    marginHorizontal: 10,
  },

  error: {
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
    fontSize: 14,
    color: colors.white,
  },

  input: {
    borderWidth: 1,
    borderColor: colors.gray,
    padding: 10,
    height: 50,
    marginVertical: 8,
    backgroundColor: colors.white,
    borderRadius: 5,
    ...shadows,
  },

  buttons: {
    marginTop: 16,
    flexDirection: 'row',
  },

  button: {
    ...buttonStyles.button,
    ...shadows,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  registerButton: {
    backgroundColor: colors.purpleDark,
  },
});
