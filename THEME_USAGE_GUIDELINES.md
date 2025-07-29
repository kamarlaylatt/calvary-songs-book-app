# Theme Usage Guidelines

This document provides guidelines for using the theme system consistently throughout the Calvary Songs Book application.

## Theme Structure

The application uses React Native Paper's Material Design 3 theme system with custom yellow primary colors defined in [`theme/default-color.ts`](theme/default-color.ts).

### Theme Files
- [`theme/default-color.ts`](theme/default-color.ts) - Main theme colors (yellow primary)
- [`theme/index.ts`](theme/index.ts) - Theme configuration and exports
- [`theme/light-colors.ts`](theme/light-colors.ts) - Alternative light theme (teal primary)
- [`theme/dark-colors.ts`](theme/dark-colors.ts) - Alternative dark theme (teal primary)

## Accessing Theme Colors

### Using the useTheme Hook
```typescript
import { useTheme } from 'react-native-paper';

const MyComponent = () => {
    const theme = useTheme();
    
    return (
        <View style={{ backgroundColor: theme.colors.background }}>
            <Text style={{ color: theme.colors.onBackground }}>
                Hello World
            </Text>
        </View>
    );
};
```

### Creating Theme-Aware Styles
```typescript
const MyComponent = () => {
    const theme = useTheme();
    
    const themedStyles = StyleSheet.create({
        container: {
            backgroundColor: theme.colors.surface,
            padding: 16,
        },
        text: {
            color: theme.colors.onSurface,
            fontSize: 16,
        },
        errorText: {
            color: theme.colors.error,
        },
    });
    
    return <View style={themedStyles.container}>...</View>;
};
```

## Semantic Color Usage

### Primary Colors
Use for main actions, branding elements, and primary interactive components:
- `theme.colors.primary` - Main brand color (yellow)
- `theme.colors.onPrimary` - Text/icons on primary background
- `theme.colors.primaryContainer` - Lighter primary background
- `theme.colors.onPrimaryContainer` - Text/icons on primary container

**Examples:**
- Main action buttons
- App bar backgrounds
- Active navigation items
- Brand elements

### Secondary Colors
Use for supporting elements and secondary actions:
- `theme.colors.secondary` - Secondary brand color
- `theme.colors.onSecondary` - Text/icons on secondary background
- `theme.colors.secondaryContainer` - Lighter secondary background
- `theme.colors.onSecondaryContainer` - Text/icons on secondary container

**Examples:**
- Secondary buttons
- Supporting UI elements
- Complementary accents

### Tertiary Colors
Use for accent elements and additional variety:
- `theme.colors.tertiary` - Tertiary accent color
- `theme.colors.onTertiary` - Text/icons on tertiary background
- `theme.colors.tertiaryContainer` - Lighter tertiary background
- `theme.colors.onTertiaryContainer` - Text/icons on tertiary container

**Examples:**
- Accent elements
- Category tags
- Decorative elements

### Semantic Colors

#### Success/Positive Actions
- Use `theme.colors.tertiary` for positive actions (green-tinted)
- Examples: Success messages, positive status indicators

#### Warning/Caution
- Use `theme.colors.secondary` for warnings (brown/amber-tinted)
- Examples: Warning messages, caution indicators

#### Error/Destructive Actions
- Use `theme.colors.error` for errors and destructive actions
- `theme.colors.onError` for text on error backgrounds
- `theme.colors.errorContainer` for error backgrounds
- `theme.colors.onErrorContainer` for text on error containers

**Examples:**
- Error messages
- Delete buttons
- Validation errors

### Surface Colors
Use for backgrounds and containers:
- `theme.colors.background` - Main app background
- `theme.colors.onBackground` - Text/icons on background
- `theme.colors.surface` - Card/container backgrounds
- `theme.colors.onSurface` - Text/icons on surface
- `theme.colors.surfaceVariant` - Alternative surface color
- `theme.colors.onSurfaceVariant` - Text/icons on surface variant

### Outline Colors
Use for borders and dividers:
- `theme.colors.outline` - Primary outline color
- `theme.colors.outlineVariant` - Secondary outline color

## Style Categories and Color Mapping

For song style categories, use semantic theme colors:

```typescript
const getStyleColor = (style: string, theme: any) => {
    const colors: { [key: string]: string } = {
        'Hymn': theme.colors.tertiary,        // Green-tinted for traditional
        'Worship': theme.colors.primary,      // Yellow for main worship
        'Gospel': theme.colors.secondary,     // Brown for gospel
        'Contemporary': theme.colors.error,   // Red for contemporary
        'Traditional': theme.colors.outline,  // Neutral for traditional
    };
    return colors[style] || theme.colors.onSurfaceVariant;
};
```

## Best Practices

### DO:
- ✅ Always use `useTheme()` hook to access theme colors
- ✅ Create theme-aware styles using `StyleSheet.create()` with theme colors
- ✅ Use semantic colors based on context (error for destructive actions, etc.)
- ✅ Use `onSurface` colors for primary text
- ✅ Use `onSurfaceVariant` colors for secondary text
- ✅ Use `outline` colors for borders and dividers
- ✅ Test components in both light and dark themes

### DON'T:
- ❌ Use hardcoded hex colors (e.g., `#FF0000`, `#666666`)
- ❌ Use hardcoded rgba values (e.g., `rgba(0, 0, 0, 0.6)`)
- ❌ Import theme directly in components (use `useTheme()` instead)
- ❌ Mix theme colors with hardcoded colors
- ❌ Use colors that don't match the semantic meaning

## Component Examples

### Button with Theme Colors
```typescript
<Button
    mode="contained"
    buttonColor={theme.colors.primary}
    textColor={theme.colors.onPrimary}
    onPress={handlePress}
>
    Primary Action
</Button>

<Button
    mode="outlined"
    buttonColor={theme.colors.error}
    textColor={theme.colors.error}
    onPress={handleDelete}
>
    Delete
</Button>
```

### Card with Theme Colors
```typescript
<Card style={{ backgroundColor: theme.colors.surface }}>
    <Card.Content>
        <Text style={{ color: theme.colors.onSurface }}>
            Title
        </Text>
        <Text style={{ color: theme.colors.onSurfaceVariant }}>
            Subtitle
        </Text>
    </Card.Content>
</Card>
```

### Status Indicators
```typescript
// Success
<Chip
    mode="outlined"
    style={{ backgroundColor: theme.colors.tertiary }}
    textStyle={{ color: theme.colors.onTertiary }}
>
    Success
</Chip>

// Warning
<Chip
    mode="outlined"
    style={{ backgroundColor: theme.colors.secondary }}
    textStyle={{ color: theme.colors.onSecondary }}
>
    Warning
</Chip>

// Error
<Chip
    mode="outlined"
    style={{ backgroundColor: theme.colors.error }}
    textStyle={{ color: theme.colors.onError }}
>
    Error
</Chip>
```

## Theme Switching

The app supports light/dark theme switching through the `getTheme()` function:

```typescript
import { getTheme } from '@/theme';

const isDarkMode = useColorScheme() === 'dark';
const currentTheme = getTheme(isDarkMode);
```

## Accessibility Considerations

- Theme colors are designed with proper contrast ratios
- Use `onSurface` and `onBackground` colors for text to ensure readability
- Test color combinations for accessibility compliance
- Consider users with color vision deficiencies

## Migration from Hardcoded Colors

When updating existing components:

1. Replace hardcoded colors with theme equivalents
2. Create theme-aware styles using `StyleSheet.create()`
3. Use semantic colors based on component purpose
4. Test in both light and dark themes
5. Ensure proper contrast and accessibility

## Common Color Mappings

| Hardcoded Color | Theme Equivalent | Usage |
|----------------|------------------|-------|
| `#666666` | `theme.colors.onSurfaceVariant` | Secondary text |
| `#333333` | `theme.colors.onSurface` | Primary text |
| `#FFFFFF` | `theme.colors.surface` | Card backgrounds |
| `#F5F5F5` | `theme.colors.background` | App background |
| `#FF0000` | `theme.colors.error` | Error states |
| `#4169E1` | `theme.colors.primary` | Primary actions |

Remember: Always prioritize semantic meaning over visual appearance when choosing theme colors.