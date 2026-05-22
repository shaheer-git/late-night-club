/**
 * Auth screen icons as pure React Native Views.
 * Only RegisterIcon is used here — the other 3 screens use PNG images.
 */

import { View } from 'react-native';

const LIME = '#C6FF34';

// ─────────────────────────────────────────────────────────────────────────────
// RegisterIcon — stacked bowls (Register-Icon.svg)
// Three filled half-ellipses, flat side up, stacked vertically
// Smallest on top, largest on bottom
// ─────────────────────────────────────────────────────────────────────────────
export function RegisterIcon({ size = 130 }: { size?: number }) {
  const gap = size * 0.05;

  const bowls = [
    { w: size * 0.36 },  // top small
    { w: size * 0.64 },  // middle
    { w: size },          // bottom full
  ];

  return (
    <View style={{ width: size, alignItems: 'center', gap }}>
      {bowls.map((b, i) => (
        <View
          key={i}
          style={{
            width: b.w,
            height: b.w * 0.5,
            borderBottomLeftRadius: b.w / 2,
            borderBottomRightRadius: b.w / 2,
            backgroundColor: LIME,
          }}
        />
      ))}
    </View>
  );
}
