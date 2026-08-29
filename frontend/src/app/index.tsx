import { StyleSheet } from 'react-native';

import { Camera, Map } from '@maplibre/maplibre-react-native';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <Map style={styles.map} mapStyle="https://tiles.openfreemap.org/styles/liberty">
        <Camera center={[-122.3321, 47.6062]} zoom={14} />
      </Map>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
