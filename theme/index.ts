import defaultColors from "@/theme/default-color";
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

// Light theme with yellow primary color
const lightTheme = {
    ...MD3LightTheme,
    colors: defaultColors.light
};

// Dark theme with yellow primary color
const darkTheme = {
    ...MD3DarkTheme,
    colors: defaultColors.dark
};

// Function to get theme based on color scheme
export const getTheme = (isDark?: boolean) => {
    return isDark ? darkTheme : lightTheme;
};

// Default export uses dark theme as requested
const theme = lightTheme;

export default theme;
export { darkTheme, lightTheme };
