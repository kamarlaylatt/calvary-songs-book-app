import React, { useCallback, useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, IconButton, Menu, Text, useTheme } from 'react-native-paper';
import { fetchSearchFilters, SearchFilters } from '../services/api';

interface AdvancedSearchFiltersProps {
    onFiltersChange: (filters: {
        categoryId?: string;
        styleId?: string;
        languageId?: string;
    }) => void;
    isExpanded: boolean;
    onToggleExpanded: () => void;
    selectedCategoryId?: string;
    selectedStyleId?: string;
    selectedLanguageId?: string;
    onClearFilters: () => void;
    inline?: boolean;
}

const AdvancedSearchFilters: React.FC<AdvancedSearchFiltersProps> = ({
    onFiltersChange,
    isExpanded,
    onToggleExpanded,
    selectedCategoryId,
    selectedStyleId,
    selectedLanguageId,
    onClearFilters,
    inline = false,
}) => {
    const theme = useTheme();
    const [searchFilters, setSearchFilters] = useState<SearchFilters>({ categories: [], styles: [], song_languages: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
    const [styleMenuVisible, setStyleMenuVisible] = useState(false);
    const [languageMenuVisible, setLanguageMenuVisible] = useState(false);
    const [animatedHeight] = useState(new Animated.Value(0));

    // Create theme-aware styles
    const themedStyles = StyleSheet.create({
        ...styles,
        container: {
            ...styles.container,
            backgroundColor: theme.colors.surface,
        },
        card: {
            ...styles.card,
            backgroundColor: theme.colors.surfaceVariant,
        },
        sectionTitle: {
            ...styles.sectionTitle,
            color: theme.colors.onSurface,
        },
        errorText: {
            ...styles.errorText,
            color: theme.colors.error,
        },
        filterButton: {
            ...styles.filterButton,
            borderColor: theme.colors.outline,
        },
        activeFilterButton: {
            ...styles.activeFilterButton,
            backgroundColor: theme.colors.primaryContainer,
            borderColor: theme.colors.primary,
        },
        clearButton: {
            ...styles.clearButton,
            borderColor: theme.colors.error,
        },
        activeFiltersContainer: {
            ...styles.activeFiltersContainer,
            backgroundColor: theme.colors.surfaceVariant,
        },
        inlineToggleButtonActive: {
            ...styles.inlineToggleButtonActive,
            backgroundColor: theme.colors.primaryContainer,
        },
        inlineExpandableContainer: {
            ...styles.inlineExpandableContainer,
            backgroundColor: theme.colors.surface,
        },
    });

    // Load search filters on component mount
    useEffect(() => {
        loadSearchFilters();
    }, []);

    // Animate height when expanded state changes
    useEffect(() => {
        Animated.timing(animatedHeight, {
            toValue: isExpanded ? 1 : 0,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [isExpanded]);

    const loadSearchFilters = async () => {
        setLoading(true);
        setError(null);
        try {
            const filters = await fetchSearchFilters();
            setSearchFilters(filters);
        } catch (err) {
            setError('Failed to load filter options');
            console.error('Error loading search filters:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCategorySelect = useCallback((categoryId: string) => {
        setCategoryMenuVisible(false);
        const newCategoryId = categoryId === selectedCategoryId ? undefined : categoryId;
        onFiltersChange({
            categoryId: newCategoryId,
            styleId: selectedStyleId,
            languageId: selectedLanguageId,
        });
    }, [selectedCategoryId, selectedStyleId, selectedLanguageId, onFiltersChange]);

    const handleStyleSelect = useCallback((styleId: string) => {
        setStyleMenuVisible(false);
        const newStyleId = styleId === selectedStyleId ? undefined : styleId;
        onFiltersChange({
            categoryId: selectedCategoryId,
            styleId: newStyleId,
            languageId: selectedLanguageId,
        });
    }, [selectedCategoryId, selectedStyleId, selectedLanguageId, onFiltersChange]);

    const handleLanguageSelect = useCallback((languageId: string) => {
        setLanguageMenuVisible(false);
        const newLanguageId = languageId === selectedLanguageId ? undefined : languageId;
        onFiltersChange({
            categoryId: selectedCategoryId,
            styleId: selectedStyleId,
            languageId: newLanguageId,
        });
    }, [selectedCategoryId, selectedStyleId, selectedLanguageId, onFiltersChange]);

    const getSelectedCategoryName = () => {
        if (!selectedCategoryId) return 'All Categories';
        const category = searchFilters.categories.find(c => c.id === selectedCategoryId);
        return category?.name || 'Unknown Category';
    };

    const getSelectedStyleName = () => {
        if (!selectedStyleId) return 'All Styles';
        const style = searchFilters.styles.find(s => s.id === selectedStyleId);
        return style?.name || 'Unknown Style';
    };

    const getSelectedLanguageName = () => {
        if (!selectedLanguageId) return 'All Languages';
        const language = searchFilters.song_languages.find(l => l.id === selectedLanguageId);
        return language?.name || 'Unknown Language';
    };

    const hasActiveFilters = selectedCategoryId || selectedStyleId || selectedLanguageId;

    const animatedStyle = {
        maxHeight: animatedHeight.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 300],
        }),
        opacity: animatedHeight,
    };

    // Render inline version for compact layout
    if (inline) {
        return (
            <View style={themedStyles.inlineContainer}>
                <IconButton
                    icon="tune"
                    size={24}
                    onPress={onToggleExpanded}
                    style={[
                        themedStyles.inlineToggleButton,
                        hasActiveFilters && themedStyles.inlineToggleButtonActive
                    ]}
                    iconColor={hasActiveFilters ? theme.colors.primary : theme.colors.onSurfaceVariant}
                />
                {/* Expandable Filters Section for inline mode */}
                {isExpanded && (
                    <View style={themedStyles.inlineExpandableContainer}>
                        <Card style={themedStyles.card}>
                            <Card.Content>
                                {loading && (
                                    <Text variant="bodyMedium" style={themedStyles.loadingText}>
                                        Loading filters...
                                    </Text>
                                )}

                                {error && (
                                    <View style={themedStyles.errorContainer}>
                                        <Text variant="bodyMedium" style={themedStyles.errorText}>
                                            {error}
                                        </Text>
                                        <Button mode="text" onPress={loadSearchFilters}>
                                            Retry
                                        </Button>
                                    </View>
                                )}

                                {!loading && !error && (
                                    <>
                                        {/* Category Filter */}
                                        <View style={themedStyles.filterSection}>
                                            <Text variant="titleSmall" style={themedStyles.sectionTitle}>
                                                Category
                                            </Text>
                                            <Menu
                                                visible={categoryMenuVisible}
                                                onDismiss={() => setCategoryMenuVisible(false)}
                                                anchor={
                                                    <Button
                                                        mode="outlined"
                                                        onPress={() => setCategoryMenuVisible(true)}
                                                        style={[
                                                            themedStyles.filterButton,
                                                            selectedCategoryId && themedStyles.activeFilterButton
                                                        ]}
                                                        icon="chevron-down"
                                                        contentStyle={themedStyles.filterButtonContent}
                                                    >
                                                        {getSelectedCategoryName()}
                                                    </Button>
                                                }
                                            >
                                                <Menu.Item
                                                    onPress={() => handleCategorySelect('')}
                                                    title="All Categories"
                                                    leadingIcon={!selectedCategoryId ? 'check' : undefined}
                                                />
                                                {searchFilters.categories.map((category) => (
                                                    <Menu.Item
                                                        key={category.id}
                                                        onPress={() => handleCategorySelect(category.id)}
                                                        title={category.name}
                                                        leadingIcon={selectedCategoryId === category.id ? 'check' : undefined}
                                                    />
                                                ))}
                                            </Menu>
                                        </View>

                                        {/* Style Filter */}
                                        <View style={themedStyles.filterSection}>
                                            <Text variant="titleSmall" style={themedStyles.sectionTitle}>
                                                Style
                                            </Text>
                                            <Menu
                                                visible={styleMenuVisible}
                                                onDismiss={() => setStyleMenuVisible(false)}
                                                anchor={
                                                    <Button
                                                        mode="outlined"
                                                        onPress={() => setStyleMenuVisible(true)}
                                                        style={[
                                                            themedStyles.filterButton,
                                                            selectedStyleId && themedStyles.activeFilterButton
                                                        ]}
                                                        icon="chevron-down"
                                                        contentStyle={themedStyles.filterButtonContent}
                                                    >
                                                        {getSelectedStyleName()}
                                                    </Button>
                                                }
                                            >
                                                <Menu.Item
                                                    onPress={() => handleStyleSelect('')}
                                                    title="All Styles"
                                                    leadingIcon={!selectedStyleId ? 'check' : undefined}
                                                />
                                                {searchFilters.styles.map((style) => (
                                                    <Menu.Item
                                                        key={style.id}
                                                        onPress={() => handleStyleSelect(style.id)}
                                                        title={style.name}
                                                        leadingIcon={selectedStyleId === style.id ? 'check' : undefined}
                                                    />
                                                ))}
                                            </Menu>
                                        </View>

                                        {/* Language Filter */}
                                        <View style={themedStyles.filterSection}>
                                            <Text variant="titleSmall" style={themedStyles.sectionTitle}>
                                                Language
                                            </Text>
                                            <Menu
                                                visible={languageMenuVisible}
                                                onDismiss={() => setLanguageMenuVisible(false)}
                                                anchor={
                                                    <Button
                                                        mode="outlined"
                                                        onPress={() => setLanguageMenuVisible(true)}
                                                        style={[
                                                            themedStyles.filterButton,
                                                            selectedLanguageId && themedStyles.activeFilterButton
                                                        ]}
                                                        icon="chevron-down"
                                                        contentStyle={themedStyles.filterButtonContent}
                                                    >
                                                        {getSelectedLanguageName()}
                                                    </Button>
                                                }
                                            >
                                                <Menu.Item
                                                    onPress={() => handleLanguageSelect('')}
                                                    title="All Languages"
                                                    leadingIcon={!selectedLanguageId ? 'check' : undefined}
                                                />
                                                {searchFilters.song_languages.map((language) => (
                                                    <Menu.Item
                                                        key={language.id}
                                                        onPress={() => handleLanguageSelect(language.id)}
                                                        title={language.name}
                                                        leadingIcon={selectedLanguageId === language.id ? 'check' : undefined}
                                                    />
                                                ))}
                                            </Menu>
                                        </View>

                                        {/* Clear All Button */}
                                        {hasActiveFilters && (
                                            <Button
                                                mode="outlined"
                                                onPress={onClearFilters}
                                                style={themedStyles.clearButton}
                                                icon="close"
                                            >
                                                Clear All Filters
                                            </Button>
                                        )}
                                    </>
                                )}
                            </Card.Content>
                        </Card>
                    </View>
                )}
            </View>
        );
    }

    return (
        <View style={themedStyles.container}>
            {/* Toggle Button */}
            <View style={themedStyles.toggleContainer}>
                <Button
                    mode="outlined"
                    onPress={onToggleExpanded}
                    icon={isExpanded ? 'chevron-up' : 'chevron-down'}
                    style={themedStyles.toggleButton}
                >
                    Advanced Filters
                </Button>
                {hasActiveFilters && (
                    <IconButton
                        icon="close"
                        size={20}
                        onPress={onClearFilters}
                        style={themedStyles.clearIconButton}
                        iconColor={theme.colors.error}
                    />
                )}
            </View>

            {/* Active Filters Badges */}
            {hasActiveFilters && (
                <View style={themedStyles.activeFiltersContainer}>
                    <Text variant="labelMedium" style={themedStyles.activeFiltersLabel}>
                        Active Filters:
                    </Text>
                    <View style={themedStyles.activeFiltersRow}>
                        {selectedCategoryId && (
                            <Chip
                                mode="flat"
                                onClose={() => handleCategorySelect(selectedCategoryId)}
                                style={themedStyles.activeFilterChip}
                            >
                                {getSelectedCategoryName()}
                            </Chip>
                        )}
                        {selectedStyleId && (
                            <Chip
                                mode="flat"
                                onClose={() => handleStyleSelect(selectedStyleId)}
                                style={themedStyles.activeFilterChip}
                            >
                                {getSelectedStyleName()}
                            </Chip>
                        )}
                        {selectedLanguageId && (
                            <Chip
                                mode="flat"
                                onClose={() => handleLanguageSelect(selectedLanguageId)}
                                style={themedStyles.activeFilterChip}
                            >
                                {getSelectedLanguageName()}
                            </Chip>
                        )}
                    </View>
                </View>
            )}

            {/* Expandable Filters Section */}
            <Animated.View style={[themedStyles.expandableContainer, animatedStyle]}>
                <Card style={themedStyles.card}>
                    <Card.Content>
                        {loading && (
                            <Text variant="bodyMedium" style={themedStyles.loadingText}>
                                Loading filters...
                            </Text>
                        )}

                        {error && (
                            <View style={themedStyles.errorContainer}>
                                <Text variant="bodyMedium" style={themedStyles.errorText}>
                                    {error}
                                </Text>
                                <Button mode="text" onPress={loadSearchFilters}>
                                    Retry
                                </Button>
                            </View>
                        )}

                        {!loading && !error && (
                            <>
                                {/* Category Filter */}
                                <View style={themedStyles.filterSection}>
                                    <Text variant="titleSmall" style={themedStyles.sectionTitle}>
                                        Category
                                    </Text>
                                    <Menu
                                        visible={categoryMenuVisible}
                                        onDismiss={() => setCategoryMenuVisible(false)}
                                        anchor={
                                            <Button
                                                mode="outlined"
                                                onPress={() => setCategoryMenuVisible(true)}
                                                style={[
                                                    themedStyles.filterButton,
                                                    selectedCategoryId && themedStyles.activeFilterButton
                                                ]}
                                                icon="chevron-down"
                                                contentStyle={themedStyles.filterButtonContent}
                                            >
                                                {getSelectedCategoryName()}
                                            </Button>
                                        }
                                    >
                                        <Menu.Item
                                            onPress={() => handleCategorySelect('')}
                                            title="All Categories"
                                            leadingIcon={!selectedCategoryId ? 'check' : undefined}
                                        />
                                        {searchFilters.categories.map((category) => (
                                            <Menu.Item
                                                key={category.id}
                                                onPress={() => handleCategorySelect(category.id)}
                                                title={category.name}
                                                leadingIcon={selectedCategoryId === category.id ? 'check' : undefined}
                                            />
                                        ))}
                                    </Menu>
                                </View>

                                {/* Style Filter */}
                                <View style={themedStyles.filterSection}>
                                    <Text variant="titleSmall" style={themedStyles.sectionTitle}>
                                        Style
                                    </Text>
                                    <Menu
                                        visible={styleMenuVisible}
                                        onDismiss={() => setStyleMenuVisible(false)}
                                        anchor={
                                            <Button
                                                mode="outlined"
                                                onPress={() => setStyleMenuVisible(true)}
                                                style={[
                                                    themedStyles.filterButton,
                                                    selectedStyleId && themedStyles.activeFilterButton
                                                ]}
                                                icon="chevron-down"
                                                contentStyle={themedStyles.filterButtonContent}
                                            >
                                                {getSelectedStyleName()}
                                            </Button>
                                        }
                                    >
                                        <Menu.Item
                                            onPress={() => handleStyleSelect('')}
                                            title="All Styles"
                                            leadingIcon={!selectedStyleId ? 'check' : undefined}
                                        />
                                        {searchFilters.styles.map((style) => (
                                            <Menu.Item
                                                key={style.id}
                                                onPress={() => handleStyleSelect(style.id)}
                                                title={style.name}
                                                leadingIcon={selectedStyleId === style.id ? 'check' : undefined}
                                            />
                                        ))}
                                    </Menu>
                                </View>

                                {/* Language Filter */}
                                <View style={themedStyles.filterSection}>
                                    <Text variant="titleSmall" style={themedStyles.sectionTitle}>
                                        Language
                                    </Text>
                                    <Menu
                                        visible={languageMenuVisible}
                                        onDismiss={() => setLanguageMenuVisible(false)}
                                        anchor={
                                            <Button
                                                mode="outlined"
                                                onPress={() => setLanguageMenuVisible(true)}
                                                style={[
                                                    themedStyles.filterButton,
                                                    selectedLanguageId && themedStyles.activeFilterButton
                                                ]}
                                                icon="chevron-down"
                                                contentStyle={themedStyles.filterButtonContent}
                                            >
                                                {getSelectedLanguageName()}
                                            </Button>
                                        }
                                    >
                                        <Menu.Item
                                            onPress={() => handleLanguageSelect('')}
                                            title="All Languages"
                                            leadingIcon={!selectedLanguageId ? 'check' : undefined}
                                        />
                                        {searchFilters.song_languages.map((language) => (
                                            <Menu.Item
                                                key={language.id}
                                                onPress={() => handleLanguageSelect(language.id)}
                                                title={language.name}
                                                leadingIcon={selectedLanguageId === language.id ? 'check' : undefined}
                                            />
                                        ))}
                                    </Menu>
                                </View>

                                {/* Clear All Button */}
                                {hasActiveFilters && (
                                    <Button
                                        mode="outlined"
                                        onPress={onClearFilters}
                                        style={themedStyles.clearButton}
                                        icon="close"
                                    >
                                        Clear All Filters
                                    </Button>
                                )}
                            </>
                        )}
                    </Card.Content>
                </Card>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    toggleButton: {
        flex: 1,
        marginRight: 8,
    },
    clearIconButton: {
        margin: 0,
    },
    activeFiltersContainer: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    activeFiltersLabel: {
        marginBottom: 8,
        fontWeight: '600',
    },
    activeFiltersRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    activeFilterChip: {
        marginBottom: 4,
    },
    expandableContainer: {
        overflow: 'hidden',
    },
    card: {
        elevation: 2,
        borderRadius: 12,
    },
    filterSection: {
        marginBottom: 16,
    },
    sectionTitle: {
        marginBottom: 8,
        fontWeight: '600',
    },
    filterButton: {
        borderWidth: 1,
        borderRadius: 8,
    },
    activeFilterButton: {
        borderWidth: 2,
    },
    filterButtonContent: {
        justifyContent: 'space-between',
        flexDirection: 'row-reverse',
    },
    clearButton: {
        marginTop: 8,
        borderWidth: 1,
    },
    loadingText: {
        textAlign: 'center',
        padding: 16,
    },
    errorContainer: {
        alignItems: 'center',
        padding: 16,
    },
    errorText: {
        textAlign: 'center',
        marginBottom: 8,
    },
    inlineContainer: {
        position: 'relative',
    },
    inlineToggleButton: {
        margin: 0,
        borderRadius: 8,
    },
    inlineToggleButtonActive: {
        backgroundColor: 'rgba(103, 80, 164, 0.12)', // Light purple background when active
    },
    inlineExpandableContainer: {
        position: 'absolute',
        top: 48,
        right: 0,
        zIndex: 1000,
        minWidth: 280,
        maxWidth: 320,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});

export default AdvancedSearchFilters;