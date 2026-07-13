import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

interface Props {
  size?: 'sm' | 'md' | 'lg';
}

// Approximate aspect ratio of the Mended Light horizontal reversed logo (~4.8:1)
const HEIGHTS = { sm: 22, md: 30, lg: 42 };

export function BrandMark({ size = 'md' }: Props) {
  const h = HEIGHTS[size];
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/mended-light-logo.png')}
        style={{ height: h, width: h * 4.8 }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
