import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  LayoutChangeEvent,
  LayoutRectangle,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
  clockRunning,
  cond,
  debug,
  divide,
  Easing,
  eq,
  event,
  Extrapolate,
  greaterOrEq,
  interpolate,
  lessThan,
  multiply,
  or,
  set,
  sin,
  startClock,
  stopClock,
  timing,
  useCode,
} from 'react-native-reanimated';

// import Slider from '@react-native-community/slider';
// import RangeSlider, { Slider } from 'react-native-range-slider-expo';

const { width, height } = Dimensions.get('window');

const range = (min: number, max: number) => {
  const res = [];
  for (let index = min; index <= max; index++) res.push(index);

  return res;
};

// console.log('Math.PI = ', Math.PI);
// console.log('Math.PI / 2 = ', Math.PI / 2);
// console.log('2 * Math.PI = ', 2 * Math.PI);

// console.log('###################');
// console.log('###################');

// console.log('Math.sin(Math.PI) = ', Math.sin(Math.PI));
// console.log('Math.PI / 2 = ', Math.sin(Math.PI / 2));
// console.log('Math.sin(2 * Math.PI) = ', Math.sin(2 * Math.PI));

const runProgress = (clock: Animated.Clock) => {
  const state: Animated.TimingState = {
    finished: new Animated.Value(0),
    frameTime: new Animated.Value(0),
    time: new Animated.Value(0),
    position: new Animated.Value(0),
  };

  const config: Animated.TimingConfig = {
    duration: 2000,
    toValue: new Animated.Value(1),
    easing: Easing.inOut(Easing.linear),
  };

  return block([
    timing(clock, state, config),
    cond(state.finished, [
      stopClock(clock),
      set(state.finished, 0),
      set(state.frameTime, 0),
      set(state.time, 0),
      // set(state.position, 0),
    ]),
    state.position,
  ]);
};

const interval = () => {
  const res = [];
  let begin = Math.PI / 2;
  const end = 0;
  const step = 0.1;

  while (begin > end) {
    console.log(Math.sin(begin));
    res.push(Math.sin(begin).toPrecision(3));
    begin = begin - step;
  }

  return res;
};

import countries from './countries';

type NormalizedCountries = {
  title: string;
  data: string[];
};

const normalize = () =>
  countries.reduce((prev, curr, index) => {
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
  translateY: Animated.Value<number>
) => {
  return (
    <View style={{ paddingRight: 60 }}>
      {data.map((v, index) => {
        const right = cond(
          and(
            greaterOrEq(divide(translateY, 24), index),
            lessThan(divide(translateY, 24), index + 1)
          ),
          30,
          0
        );

        const adjustedIndex = index + 1;

        const inputRange: number[] = [
          (adjustedIndex - 1) * 24,
          adjustedIndex * 24,
          (adjustedIndex + 1) * 24,
        ];

        console.log(inputRange);

        const outputRange: Animated.Node<number>[] = [
          add(0, 0),
          add(sin(Math.PI / 2), 40),
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
              borderWidth: 1,
            }}
          >
            <Text style={[styles.header]}>{v.title}</Text>
          </Animated.View>
        );
      })}
    </View>
  );
};

export default function App() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const translateY = useRef(new Animated.Value<number>(0)).current;
  const offsetY = useRef(new Animated.Value<number>(0)).current;
  const gestureState = useRef(new Animated.Value<State>(State.UNDETERMINED))
    .current;

  // const clock = useRef(new Animated.Clock()).current;
  // const progress = useRef(new Animated.Value<number>(0)).current;

  // const [positions, setPositions] = useState<LayoutRectangle[]>([]);

  // const animatedSin = interpolate(progress, {
  //   inputRange: [0, 0.5, 1],
  //   outputRange: [
  //     sin(Math.PI),
  //     sin(divide(Math.PI, 2)),
  //     sin(multiply(2, Math.PI)),
  //   ],
  // });

  // useCode(
  //   () =>
  //     block([
  //       startClock(clock),
  //       cond(clockRunning(clock), set(progress, runProgress(clock))),
  //     ]),
  //   []
  // );

  // useCode(() => debug('translateY', translateY), []);
  const onGestureEvent = event<
    PanGestureHandlerGestureEvent | PanGestureHandlerStateChangeEvent
  >([
    {
      nativeEvent: { translationY: translateY, state: gestureState },
    },
  ]);

  const transY = cond(
    eq(gestureState, State.ACTIVE),
    add(offsetY, translateY),
    set(offsetY, add(offsetY, translateY))
  );

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
              top: 20,
              right: 30,
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: 'red',
            },
            { transform: [{ translateY: transY }] },
          ]}
        />
      </PanGestureHandler>

      <SectionList
        sections={DATA}
        keyExtractor={(item, index) => item + index}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.title}>{item}</Text>
          </View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.header}>{title}</Text>
        )}
      />
      {IndexedBar(DATA, translateY)}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
  },
  header: {
    fontSize: 18,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 24,
  },
});
