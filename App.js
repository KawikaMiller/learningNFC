import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import NfcManager, { NfcTech, NfcEvents, Ndef } from 'react-native-nfc-manager';

NfcManager.start();

export default function App() {

  const [nfcSupported, setNfcSupported] = useState(false);
  const [nfcEnabled, setNfcEnabled] = useState(false);

  useEffect(() => {
    const getNfcStatus = async () => {
      try {
        support = await NfcManager.isSupported();
        enabled = await NfcManager.isEnabled();
        setNfcSupported(support);
        setNfcEnabled(enabled);
      } catch (e) {
        Alert.alert('getNfcSupport Failed', e.message)
      }
    }
    getNfcStatus();
  }, [])

  useEffect(() => {
    NfcManager.setEventListener(NfcEvents.DiscoverTag, tag => console.log('tag found', tag))

    return () => { NfcManager.setEventListener(NfcEvents.DiscoverTag, null) }
  }, [])

  const readTag = async () => {
    try {
      // request NDef technology - I think this checks to see if the NfcTag has NDef capabilities?
      await NfcManager.requestTechnology(NfcTech.Ndef)
      // once we know that the tag has NDef tech capabilities, we get the tag data
      const tag = await NfcManager.getTag();
      console.log('TAG DATA: ', tag);
      console.log('TAG NDEF MESSAGE: ', tag.ndefMessage[0]);
      // check to see if a tag has a message attached to it
      const message = await NfcManager.ndefHandler.getNdefMessage();
      // if the message exists, it should be encoded/stored as bytes on the tag - therefore we need to decode it into a string
      if (message){
          console.log("TAG MESSAGE: ", message)
          // the message is stored here as the payload
          const bytes = message["ndefMessage"][0]["payload"];
          // console logging 'bytes' to confirm it is the array of bytes that we need in order to decode the message
          console.log("BYTES: ", bytes)
          // decode the message text
          const decoded = Ndef.text.decodePayload(bytes)
          console.log("DECODED MESSAGE: ", decoded)
          Alert.alert("TAG MESSAGE", decoded)
      }
    } catch (e) {
      console.warn('Error reading tag: ', e)
    } finally {
      NfcManager.cancelTechnologyRequest();
      console.log("read tag finished")
    }
  }

  const writeTag = async () => {
    try {
      // request/check for ndef capabilities of Nfc tag
      await NfcManager.requestTechnology(NfcTech.Ndef)
      // encode the message that we want to store on the tag
      const message = Ndef.encodeMessage([Ndef.textRecord('Write A Test Message')])
      // write the message to the tag
      await NfcManager.ndefHandler.writeNdefMessage(message)
    } catch (e) {
      console.warn('Error writing to tag', e)
    } finally {
      NfcManager.cancelTechnologyRequest();
      console.log('writeTag finished')
    }
  }

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!!!</Text>
      <Text>NFC Supported: {`${nfcSupported}`}</Text>
      <Text>NFC Enabled: {`${nfcEnabled}`}</Text>
      <Button title={"Read NFC"} onPress={readTag} style={{padding: '1rem', margin: '2rem 0'}} />
      <Button title={"Write NFC"} onPress={writeTag} style={{padding: '1rem', margin: '2rem 0'}} color={"green"}/>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
