import { StatusBar } from 'expo-status-bar';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import React, { useRef, useState } from 'react';
import { Dimensions, SectionList, StyleSheet, Text, View } from 'react-native';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  PanGestureHandlerStateChangeEvent,
  State,
} from 'react-native-gesture-handler';
import Animated, {
  add,
  and,
  block,
  call,
  clockRunning,
  cond,
  debug,
  divide,
  Easing,
  eq,
  event,
  Extrapolate,
  floor,
  greaterOrEq,
  interpolate,
  lessThan,
  multiply,
  onChange,
  or,
  round,
  set,
  sin,
  startClock,
  stopClock,
  sub,
  timing,
  useCode,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const STATUS_BAR_HEIGHT = getStatusBarHeight();

import countries from './countries';

type NormalizedCountries = {
  title: string;
  data: string[];
};

const normalize = () =>
  countries.reduce((prev, curr) => {
    const prevIndex = prev.findIndex((v) => v.title === curr.Name[0]);

    if (prevIndex >= 0) {
      prev[prevIndex].data.push(curr.Name);
    } else {
      prev.push({ title: curr.Name[0], data: [curr.Name] });
    }

    return prev;
  }, []);

const DATA = normalize() as NormalizedCountries[];

const IndexedBar = (
  data: NormalizedCountries[],
  translateY: Animated.Node<number>
) => {
  return (
    <View style={{ marginLeft: 20, paddingRight: 50 }}>
      {data.map((v, index) => {
        const inputRange: number[] = [
          (index - 2) * 24,
          (index - 1) * 24,
          index * 24,
          (index + 1) * 24,
          (index + 2) * 24,
        ];

        const outputRange: Animated.Node<number>[] = [
          add(0, 0),
          add(sin(Math.PI / 10), 20),
          add(sin(Math.PI / 2), 40),
          add(sin(Math.PI / 10), 20),
          add(0, 0),
        ];

        const angle = interpolate(translateY, {
          inputRange,
          outputRange,
          extrapolate: Extrapolate.CLAMP,
        });

        return (
          <Animated.View
            key={v.title}
            style={{
              justifyContent: 'center',
              right: angle,
              marginBottom: 5,
            }}
          >
            <Text style={{ fontSize: 16 }}>{v.title}</Text>
          </Animated.View>
        );
      })}
    </View>
  );
};

export default function App() {
  const pointY = useRef(new Animated.Value<number>(0)).current;
  const translateY = useRef(new Animated.Value<number>(0)).current;
  const offsetY = useRef(new Animated.Value<number>(0)).current;
  const gestureState = useRef(new Animated.Value<State>(State.UNDETERMINED))
    .current;
  const sectionIndex = useRef(new Animated.Value<number>(0)).current;

  const listRef = useRef<SectionList>();

  const onGestureEvent = event<
    PanGestureHandlerGestureEvent | PanGestureHandlerStateChangeEvent
  >([
    {
      nativeEvent: {
        translationY: translateY,
        state: gestureState,
        absoluteY: pointY,
      },
    },
  ]);

  const translateTo = (sectionIndex: number) => {
    listRef.current?.scrollToLocation({
      itemIndex: 0,
      sectionIndex,
      animated: true,
    });
  };

  useCode(
    () =>
      onChange(
        gestureState,
        cond(eq(gestureState, State.END), [
          set(sectionIndex, round(divide(transY, 24))),
          call([sectionIndex], translateTo),
        ])
      ),
    []
  );

  const transY = cond(
    eq(gestureState, State.ACTIVE),
    [add(offsetY, translateY)],
    set(offsetY, add(offsetY, translateY))
  );

  // console.log(DATA.length);
  return (
    <View style={styles.container}>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onGestureEvent}
      >
        <Animated.View
          style={[
            {
              zIndex: 999,
              position: 'absolute',
              top: getStatusBarHeight(),
              right: 20,
              width: 21,
              height: 21,
              borderRadius: 21 / 2,
              backgroundColor: 'red',
            },
            { transform: [{ translateY: transY }] },
          ]}
        />
      </PanGestureHandler>

      <SectionList
        // onSczrollToIndexFailed={(info) => console.log(info)}
        getItemLayout={(data, index) => {
          if (data[index])
            return {
              length: 40,
              offset: 40 * index,
              index,
            };

          return {
            length: 50,
            offset: 50 * index,
            index,
          };
        }}
        ref={listRef}
        sections={DATA}
        keyExtractor={(item, index) => item + index}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.title}>{item}</Text>
          </View>
        )}
        // ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderSectionHeader={({ section: { title } }) => (
          <View style={{ height: 40 }}>
            <Text style={styles.header}>{title}</Text>
          </View>
        )}
      />
      {IndexedBar(DATA, transY)}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgb(54, 69, 143)',
    justifyContent: 'center',
    paddingVertical: getStatusBarHeight(),
  },
  item: {
    backgroundColor: 'rgb(242, 244, 250)',
    height: 40,
    justifyContent: 'center',
    marginBottom: 10,
  },
  header: {
    fontSize: 25,
    backgroundColor: 'transparent',
    color: 'rgb(205, 209, 217)',
    marginLeft: 20,
  },
  title: {
    fontSize: 17,
  },
});
