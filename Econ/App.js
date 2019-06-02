import * as React from 'react';
import { Alert, Text, View, StyleSheet, Button, TouchableOpacity, Form, Input, Label, TextInput } from 'react-native';
import { Constants, Permissions, BarCodeScanner } from 'expo';

import * as firebase from 'firebase';
import '@firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAJWkVyOlQhLk3nn-kzqYq_ZinqBgLRVUA",
  authDomain: "econergize.firebaseapp.com",
  databaseURL: "https://econergize.firebaseio.com",
  projectId: "econergize",
  storageBucket: "econergize.appspot.com"
};

firebase.initializeApp(firebaseConfig);

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
         placeholderTextColor = 'gray'
         style={styles.input}
       />
       <TextInput
         value={this.state.password}
         onChangeText={(password) => this.setState({ password })}
         placeholder={'password'}
         secureTextEntry={true}
         placeholderTextColor = 'gray'
         style={styles.input}
       />
       <TouchableOpacity
          style={styles.button}
          onPress={this.onLogin.bind(this)}
       >
        <Text style={styles.buttonText}> Login </Text>
       </TouchableOpacity>
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

      let cemail = this.state.email;

      console.log(cemail);

      let prodname = "";
      let manufacturer = "";

      let reqUrl = "https://api.barcodelookup.com/v2/products?barcode=" + data + "&formatted=y&key=qsck3p89hna02fijg03an4kz0cm52k";

      fetch(reqUrl)
        .then(function(response) {
          return response.json();
        })
        .then(function(prod) {
          // do something with jsonResponse
          prodname = prod.products[0].product_name;
          console.log(prod.products[0].product_name);
          manufacturer = prod.products[0].manufacturer;
          console.log(prod.products[0].manufacturer);
          console.log(prod);

          const db = firebase.firestore();

          let cUserDocument = db.collection("users").doc(cemail);

          cUserDocument.collection("Items").add({
            Name: prodname,
            SusVal: 0.5
          })

        })
        .catch((error) => {
          console.error(error);
        });


    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  }
}

  const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  button: {
    alignItems: 'center',
    backgroundColor: 'green',
    width: 200,
    height: 44,
    padding: 10,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 25,
    marginBottom: 10,
  },
  buttonText:{
    fontFamily: 'Arial',
    color: 'white',
    fontSize: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    width: 200,
    fontFamily: 'Arial',
    color: 'black',
    fontSize: 20,
    height: 44,
    padding: 10,
    borderWidth: 2,
    borderColor: 'black',
    marginVertical: 10,
  },
});
