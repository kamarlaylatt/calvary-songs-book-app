import { StyleSheet, View } from "react-native";
import { Button, Text, useTheme } from 'react-native-paper';

export default function Index() {
  const theme = useTheme();

  const themedStyles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.background,
      padding: 16,
    },
    text: {
      color: theme.colors.onSurfaceVariant,
      marginTop: 16,
      textAlign: 'center',
    },
  });

  return (
    <View style={themedStyles.container}>
      <Button
        icon="camera"
        mode="contained"
        onPress={() => console.log('Pressed')}
        buttonColor={theme.colors.primary}
        textColor={theme.colors.onPrimary}
      >
        Press me
      </Button>
      <Text variant="bodyMedium" style={themedStyles.text}>
        Edit app/index.tsx to edit this screen.
      </Text>
    </View>
  );
}
