import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import NfcManager, { NfcTech, NfcEvents, Ndef } from 'react-native-nfc-manager';

NfcManager.start();

export default function App() {
  const [nfcSupported, setNfcSupported] = useState(false);
  const [nfcEnabled, setNfcEnabled] = useState(false);

  useEffect(() => {
    const getNfcStatus = async () => {
      try {
        const support = await NfcManager.isSupported();
        const enabled = await NfcManager.isEnabled();
        console.log('NFC Support:', support);
        console.log('NFC Enabled:', enabled);
        setNfcSupported(support);
        setNfcEnabled(enabled);
      } catch (e) {
        console.error('getNfcStatus Failed:', e);
        Alert.alert('NFC Status Error', e.message);
      }
    };

    getNfcStatus();
  }, []);

  useEffect(() => {
    NfcManager.setEventListener(NfcEvents.DiscoverTag, tag => console.log('Tag found:', tag));

    return () => {
      NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
    };
  }, []);

  const readTag = async () => {
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      console.log('Tag found:', tag);

      if (tag) {
        const message = await NfcManager.ndefHandler.getNdefMessage();
        if (message) {
          const bytes = message.ndefMessage[0].payload;
          console.log('Bytes:', bytes);
          const decoded = Ndef.text.decodePayload(bytes);
          console.log('Decoded message:', decoded);
          Alert.alert('Tag Message', decoded);
        }
      }
    } catch (e) {
      console.warn('Error reading tag:', e);
      Alert.alert('Read Tag Error', 'Failed to read NFC tag. Ensure NFC is enabled and permissions are granted.');
    } finally {
      NfcManager.cancelTechnologyRequest();
      console.log('Read tag finished');
    }
  };

  const writeTag = async () => {
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const message = Ndef.encodeMessage([Ndef.textRecord('Write A Test Message')]);
      await NfcManager.ndefHandler.writeNdefMessage(message);
      console.log('Tag written successfully');
      Alert.alert('Success', 'Tag written successfully');
    } catch (e) {
      console.warn('Error writing to tag:', e);
      Alert.alert('Write Tag Error', 'Failed to write NFC tag. Ensure NFC is enabled and permissions are granted.');
    } finally {
      NfcManager.cancelTechnologyRequest();
      console.log('Write tag finished');
    }
  };

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!!!</Text>
      <Text>NFC Supported: {`${nfcSupported}`}</Text>
      <Text>NFC Enabled: {`${nfcEnabled}`}</Text>
      <Button title="Read NFC" onPress={readTag} style={{ padding: 16, marginVertical: 16 }} />
      <Button title="Write NFC" onPress={writeTag} style={{ padding: 16, marginVertical: 16 }} color="green" />
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
