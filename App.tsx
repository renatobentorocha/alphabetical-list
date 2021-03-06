import { StatusBar } from 'expo-status-bar';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import React, { useRef } from 'react';
import { Dimensions, SectionList, StyleSheet, Text, View } from 'react-native';

import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  PanGestureHandlerStateChangeEvent,
  State,
} from 'react-native-gesture-handler';

import Animated, {
  add,
  call,
  cond,
  divide,
  eq,
  event,
  Extrapolate,
  interpolate,
  multiply,
  onChange,
  round,
  set,
  sin,
  useCode,
} from 'react-native-reanimated';

import { scale, WIDTH_ORIGIN } from './utils';

import countries from './countries';

const { width } = Dimensions.get('window');

const MAX_SCALE = 1.7;

const scaleWithWidth = (size: number) =>
  scale({ origin_size: WIDTH_ORIGIN, destination_size: width, size });

type NormalizedCountries = {
  title: string;
  data: string[];
};

enum RowType {
  SECTION_HEADER,
  SECTION_DATA,
}

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

const flattedData = DATA.map((v) => [
  RowType.SECTION_HEADER,
  ...v.data.map((_) => RowType.SECTION_DATA),
]).flat();

function IndexedBar({
  data,
  translateY,
}: {
  data: NormalizedCountries[];
  translateY: Animated.Node<number>;
}) {
  return (
    <Animated.View
      style={{
        marginLeft: scaleWithWidth(20),
        paddingRight: scaleWithWidth(50),
      }}
    >
      {data.map((v, index) => {
        const inputRange: number[] = [
          (index - 3) * Math.min(scaleWithWidth(23.2), 23.2 * MAX_SCALE),
          (index - 2) * Math.min(scaleWithWidth(23.2), 23.2 * MAX_SCALE),
          (index - 1) * Math.min(scaleWithWidth(23.2), 23.2 * MAX_SCALE),
          index * Math.min(scaleWithWidth(23.2), 23.2 * MAX_SCALE),
          (index + 1) * Math.min(scaleWithWidth(23.2), 23.2 * MAX_SCALE),
          (index + 2) * Math.min(scaleWithWidth(23.2), 23.2 * MAX_SCALE),
          (index + 3) * Math.min(scaleWithWidth(23.2), 23.2 * MAX_SCALE),
        ];

        const outputRange: Animated.Node<number>[] = [
          add(0, 0),
          add(sin(Math.PI / 15), Math.min(scaleWithWidth(10), 10 * MAX_SCALE)),
          add(sin(Math.PI / 10), Math.min(scaleWithWidth(20), 20 * MAX_SCALE)),
          add(sin(Math.PI / 2), Math.min(scaleWithWidth(40), 40 * MAX_SCALE)),
          add(sin(Math.PI / 10), Math.min(scaleWithWidth(20), 20 * MAX_SCALE)),
          add(sin(Math.PI / 15), Math.min(scaleWithWidth(10), 10 * MAX_SCALE)),
          add(0, 0),
        ];

        const outputRangeScale: number[] = [1, 1.1, 1.2, 1.5, 1.2, 1.1, 1];

        const angle = interpolate(translateY, {
          inputRange,
          outputRange,
          extrapolate: Extrapolate.CLAMP,
        });

        const scale = interpolate(translateY, {
          inputRange,
          outputRange: outputRangeScale,
          extrapolate: Extrapolate.CLAMP,
        });

        return (
          <Animated.View
            key={v.title}
            style={[
              {
                justifyContent: 'center',
                marginBottom: Math.min(scaleWithWidth(6), 6 * MAX_SCALE),
              },
              { transform: [{ translateX: multiply(angle, -1) }] },
            ]}
          >
            <Animated.Text
              style={[
                {
                  fontSize: Math.min(scaleWithWidth(14), 14 * MAX_SCALE),
                  color: '#DBBF69',
                  fontWeight: '500',
                },
                { transform: [{ scale }] },
              ]}
            >
              {v.title}
            </Animated.Text>
          </Animated.View>
        );
      })}
    </Animated.View>
  );
}

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
    });
  };

  useCode(
    () =>
      onChange(
        gestureState,
        cond(eq(gestureState, State.END), [
          set(
            sectionIndex,
            round(
              divide(transY, Math.min(scaleWithWidth(23.2), 23.2 * MAX_SCALE))
            )
          ),
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
              top: getStatusBarHeight() + scaleWithWidth(18),
              right: scaleWithWidth(20),
              width: Math.min(scaleWithWidth(21), 21 * MAX_SCALE),
              height: Math.min(scaleWithWidth(21), 21 * MAX_SCALE),
              borderRadius: Math.min(scaleWithWidth(21), 21 * MAX_SCALE) / 2,
              backgroundColor: '#8F7936',
            },
            { transform: [{ translateY: transY }] },
          ]}
        />
      </PanGestureHandler>

      <SectionList
        showsVerticalScrollIndicator={false}
        initialNumToRender={flattedData.length * 1.5}
        getItemLayout={(data, index) => {
          if (flattedData[index] === RowType.SECTION_HEADER) {
            return {
              length: scaleWithWidth(40),
              offset: scaleWithWidth(40) * index,
              index,
            };
          }

          return {
            length: scaleWithWidth(50),
            offset: scaleWithWidth(50) * index,
            index,
          };
        }}
        ref={listRef}
        sections={DATA}
        keyExtractor={(item, index) => item + index}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text numberOfLines={1} style={styles.title}>
              {item}
            </Text>
          </View>
        )}
        ItemSeparatorComponent={() => (
          <View style={{ height: scaleWithWidth(10) }} />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={{ height: scaleWithWidth(40) }}>
            <Text style={styles.header}>{title}</Text>
          </View>
        )}
      />
      <IndexedBar data={DATA} translateY={transY} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#36458f',
    justifyContent: 'center',
    paddingVertical: getStatusBarHeight() + scaleWithWidth(20),
  },
  item: {
    backgroundColor: '#697CDB',
    height: scaleWithWidth(40),
    justifyContent: 'center',
  },
  header: {
    fontSize: scaleWithWidth(25),
    backgroundColor: 'transparent',
    color: '#DBBF69',
    marginLeft: scaleWithWidth(20),
  },
  title: {
    fontSize: scaleWithWidth(17),
    marginLeft: scaleWithWidth(20),
    color: '#f5f5f5',
  },
});
