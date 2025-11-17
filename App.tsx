import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { auth, db, analytics } from './src/config/firebaseConfig';

export default function App() {
  // Test Firebase initialization
  console.log('🔥 Firebase Services Initialized:');
  console.log('  ✅ Auth:', !!auth);
  console.log('  ✅ Firestore:', !!db);
  console.log('  ✅ Analytics:', !!analytics);
  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style='auto' />
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
