import { StyleSheet } from 'react-native';

import { Camera, Map } from '@maplibre/maplibre-react-native';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <Map style={styles.map} mapStyle="https://demotiles.maplibre.org/style.json">
        <Camera
          initialViewState={{
            centerCoordinate: [-122.3321, 47.6062],
            zoomLevel: 12,
          }}
        />
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
