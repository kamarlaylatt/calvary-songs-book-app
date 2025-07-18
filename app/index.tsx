import { Text, View } from "react-native";
import { Button, PaperProvider } from 'react-native-paper';

export default function Index() {
  return (
    <PaperProvider>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Button icon="camera" mode="contained" onPress={() => console.log('Pressed')}>
          Press me
        </Button>
        <Text>Edit app/index.tsx to edit this screen.</Text>
      </View >
    </PaperProvider>

  );
}
