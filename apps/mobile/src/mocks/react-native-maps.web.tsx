/**
 * Web stub for react-native-maps.
 * react-native-maps is native-only and cannot run in a browser.
 * This stub prevents Metro bundling errors when building for web.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MapPlaceholder = ({ style, children }: any) => (
  <View style={[styles.placeholder, style]}>
    <Text style={styles.text}>🗺️ Map not available on web</Text>
    {children}
  </View>
);

const Marker = ({ children }: any) => <>{children}</>;
const Callout = ({ children }: any) => <>{children}</>;
const Circle = () => null;
const Polygon = () => null;
const Polyline = () => null;
const Overlay = () => null;

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    minHeight: 200,
  },
  text: {
    color: '#888',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
});

export default MapPlaceholder;
export { Marker, Callout, Circle, Polygon, Polyline, Overlay };
export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = null;
