import { View } from "react-native";
import { Text } from 'react-native-paper';

export default function Index() {
    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center"
            }}
        >
            <Text variant="titleMedium">Welcome to Calvary Song Book</Text>
        </View>
    );
}