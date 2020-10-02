import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';

const { width, height } = Dimensions.get('window');

const range = (min: number, max: number) => {
  const res = [];
  for (let index = min; index <= max; index++) res.push(index);

  return res;
};

export default function App() {
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {range(65, 90).map((value) => (
          <Text key={value.toString()} style={{ marginBottom: 10 }}>
            {String.fromCharCode(value)}
          </Text>
        ))}
      </ScrollView>
      <View
        style={{
          position: 'absolute',
          height: 30,
          width: 30,
          borderRadius: 15,
          top: height / 2 - 15,
          left: width - 40,
          backgroundColor: 'red',
        }}
      />
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
