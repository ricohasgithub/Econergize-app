import * as React from 'react';
import { Alert, Text, View, StyleSheet, Button, TouchableOpacity, Form, Input, Label, TextInput } from 'react-native';
import { Constants, Permissions, BarCodeScanner } from 'expo';

import firebase from './firebase'

export default class App extends React.Component {

  state = {
    hasCameraPermission: null,
    scanned: false,
    loggedin: false,
    email: "",
    password: "",
  };

  constructor(props) {
    super(props);
    this.state = {
      loggedin: false,
      email: "",
      password: "",
    };
  }

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  onLogin() {

    const { email, password, loggedin } = this.state;

    this.state.loggedin = true;

  //  Alert.alert('Credentials', `email: ${email} + password: ${password}`);

  try {
    firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(user => {
           console.log(user);
        });
    } catch (error) {
      console.log(error.toString(error));
    }

    this.forceUpdate();

  }

  render() {

    const { hasCameraPermission, scanned, loggedin } = this.state;

    if (loggedin === false) {
      console.log(loggedin);
      return (
        <View style = {styles.container}>
        <TextInput
         value={this.state.email}
         keyboardType = 'email-address'
         onChangeText={(email) => this.setState({ email })}
         placeholder='email'
         placeholderTextColor = 'white'
         style={styles.input}
       />
       <TextInput
         value={this.state.password}
         onChangeText={(password) => this.setState({ password })}
         placeholder={'password'}
         secureTextEntry={true}
         placeholderTextColor = 'white'
        style={styles.input}
       />
       <TouchableOpacity
          style={styles.button}
          onPress={this.onLogin.bind(this)}
       />
       </View>
      );

    } else {
      console.log("Act");
      if (hasCameraPermission === null) {
        return <Text>Requesting for camera permission</Text>;
      }
      if (hasCameraPermission === false) {
        return <Text>No access to camera</Text>;
      }
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
          }}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />

          {scanned && (
            <Button
              title={'Tap to Scan Again'}
              onPress={() => this.setState({ scanned: false })}
            />
          )}
        </View>
      );
    }

  }

  handleBarCodeScanned = ({ type, data }) => {
    this.setState({ scanned: true });
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  }
}

  const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'salmon',
  },
  titleText:{
    fontFamily: 'Baskerville',
    fontSize: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: 'powderblue',
    width: 200,
    height: 44,
    padding: 10,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 25,
    marginBottom: 10,
  },
  buttonText:{
    fontFamily: 'Baskerville',
    fontSize: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    width: 200,
    fontFamily: 'Baskerville',
    fontSize: 20,
    height: 44,
    padding: 10,
    borderWidth: 1,
    borderColor: 'white',
    marginVertical: 10,
  },
});
