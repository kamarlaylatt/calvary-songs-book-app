import { fetchSearchFilters } from '@/services/api';
import type { SearchFilters } from '@/types/models';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, IconButton, Menu, Text, useTheme } from 'react-native-paper';

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

type BasicItem = { id: string; name: string };

type FilterMenuProps = {
    label: string;
    allLabel: string;
    visible: boolean;
    setVisible: (v: boolean) => void;
    selectedId?: string;
    selectedName: string;
    items: BasicItem[];
    onSelect: (id?: string) => void;
    buttonStyle: any;
    activeButtonStyle: any;
    buttonContentStyle: any;
};

const FilterMenu: React.FC<FilterMenuProps> = ({
    label,
    allLabel,
    visible,
    setVisible,
    selectedId,
    selectedName,
    items,
    onSelect,
    buttonStyle,
    activeButtonStyle,
    buttonContentStyle,
}) => {
    return (
        <>
            <Text variant="titleSmall" style={{ marginBottom: 8, fontWeight: '600' }}>
                {label}
            </Text>
            <Menu
                visible={visible}
                onDismiss={() => setVisible(false)}
                anchor={
                    <Button
                        mode="outlined"
                        onPress={() => setVisible(true)}
                        style={[buttonStyle, selectedId && activeButtonStyle]}
                        icon="chevron-down"
                        contentStyle={buttonContentStyle}
                    >
                        {selectedName}
                    </Button>
                }
            >
                <Menu.Item
                    onPress={() => {
                        onSelect(undefined);
                        setVisible(false);
                    }}
                    title={allLabel}
                    leadingIcon={!selectedId ? 'check' : undefined}
                />
                {items.map((it) => (
                    <Menu.Item
                        key={it.id}
                        onPress={() => {
                            onSelect(it.id);
                            setVisible(false);
                        }}
                        title={it.name}
                        leadingIcon={selectedId === it.id ? 'check' : undefined}
                    />
                ))}
            </Menu>
        </>
    );
};

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
    const [searchFilters, setSearchFilters] = useState<SearchFilters>({
        categories: [],
        styles: [],
        song_languages: [],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
    const [styleMenuVisible, setStyleMenuVisible] = useState(false);
    const [languageMenuVisible, setLanguageMenuVisible] = useState(false);
    const [animatedHeight] = useState(new Animated.Value(0));

    const styles = useMemo(
        () =>
            StyleSheet.create({
                container: {
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    backgroundColor: theme.colors.surface,
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
                    backgroundColor: theme.colors.surfaceVariant,
                },
                activeFiltersLabel: {
                    marginBottom: 8,
                    fontWeight: '600',
                    color: theme.colors.onSurface,
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
                    backgroundColor: theme.colors.surfaceVariant,
                },
                filterSection: {
                    marginBottom: 16,
                },
                sectionTitle: {
                    marginBottom: 8,
                    fontWeight: '600',
                    color: theme.colors.onSurface,
                },
                filterButton: {
                    borderWidth: 1,
                    borderRadius: 8,
                    borderColor: theme.colors.outline,
                },
                activeFilterButton: {
                    borderWidth: 2,
                    backgroundColor: theme.colors.primaryContainer,
                    borderColor: theme.colors.primary,
                },
                filterButtonContent: {
                    justifyContent: 'space-between',
                    flexDirection: 'row-reverse',
                },
                clearButton: {
                    marginTop: 8,
                    borderWidth: 1,
                    borderColor: theme.colors.error,
                },
                loadingText: {
                    textAlign: 'center',
                    padding: 16,
                    color: theme.colors.onSurface,
                },
                errorContainer: {
                    alignItems: 'center',
                    padding: 16,
                },
                errorText: {
                    textAlign: 'center',
                    marginBottom: 8,
                    color: theme.colors.error,
                },
                inlineContainer: {
                    position: 'relative',
                },
                inlineToggleButton: {
                    margin: 0,
                    borderRadius: 8,
                },
                inlineToggleButtonActive: {
                    backgroundColor: theme.colors.primaryContainer,
                },
                inlineExpandableContainer: {
                    position: 'absolute',
                    top: 48,
                    right: 0,
                    zIndex: 1000,
                    minWidth: 280,
                    maxWidth: 320,
                    backgroundColor: theme.colors.surface,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                },
            }),
        [theme]
    );

    // Load search filters on component mount
    useEffect(() => {
        loadSearchFilters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Animate height when expanded state changes (for non-inline)
    useEffect(() => {
        Animated.timing(animatedHeight, {
            toValue: isExpanded ? 1 : 0,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [isExpanded, animatedHeight]);

    const loadSearchFilters = async () => {
        setLoading(true);
        setError(null);
        try {
            const filters = await fetchSearchFilters();
            setSearchFilters(filters);
        } catch (err) {
            setError('Failed to load filter options');
            // eslint-disable-next-line no-console
            console.error('Error loading search filters:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCategorySelect = useCallback(
        (categoryId?: string) => {
            const newCategoryId = categoryId === selectedCategoryId ? undefined : categoryId;
            onFiltersChange({
                categoryId: newCategoryId,
                styleId: selectedStyleId,
                languageId: selectedLanguageId,
            });
        },
        [selectedCategoryId, selectedStyleId, selectedLanguageId, onFiltersChange]
    );

    const handleStyleSelect = useCallback(
        (styleId?: string) => {
            const newStyleId = styleId === selectedStyleId ? undefined : styleId;
            onFiltersChange({
                categoryId: selectedCategoryId,
                styleId: newStyleId,
                languageId: selectedLanguageId,
            });
        },
        [selectedCategoryId, selectedStyleId, selectedLanguageId, onFiltersChange]
    );

    const handleLanguageSelect = useCallback(
        (languageId?: string) => {
            const newLanguageId = languageId === selectedLanguageId ? undefined : languageId;
            onFiltersChange({
                categoryId: selectedCategoryId,
                styleId: selectedStyleId,
                languageId: newLanguageId,
            });
        },
        [selectedCategoryId, selectedStyleId, selectedLanguageId, onFiltersChange]
    );

    const getSelectedCategoryName = () => {
        if (!selectedCategoryId) return 'All Categories';
        const category = searchFilters.categories.find((c) => c.id === selectedCategoryId);
        return category?.name || 'Unknown Category';
    };

    const getSelectedStyleName = () => {
        if (!selectedStyleId) return 'All Styles';
        const style = searchFilters.styles.find((s) => s.id === selectedStyleId);
        return style?.name || 'Unknown Style';
    };

    const getSelectedLanguageName = () => {
        if (!selectedLanguageId) return 'All Languages';
        const language = searchFilters.song_languages.find((l) => l.id === selectedLanguageId);
        return language?.name || 'Unknown Language';
    };

    const hasActiveFilters = !!(selectedCategoryId || selectedStyleId || selectedLanguageId);

    const animatedStyle = {
        maxHeight: animatedHeight.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 300],
        }),
        opacity: animatedHeight,
    };

    const FiltersCardContent = () => (
        <Card style={styles.card}>
            <Card.Content>
                {loading && (
                    <Text variant="bodyMedium" style={styles.loadingText}>
                        Loading filters...
                    </Text>
                )}

                {error && (
                    <View style={styles.errorContainer}>
                        <Text variant="bodyMedium" style={styles.errorText}>
                            {error}
                        </Text>
                        <Button mode="text" onPress={loadSearchFilters}>
                            Retry
                        </Button>
                    </View>
                )}

                {!loading && !error && (
                    <>
                        <View style={styles.filterSection}>
                            <FilterMenu
                                label="Category"
                                allLabel="All Categories"
                                visible={categoryMenuVisible}
                                setVisible={setCategoryMenuVisible}
                                selectedId={selectedCategoryId}
                                selectedName={getSelectedCategoryName()}
                                items={searchFilters.categories}
                                onSelect={handleCategorySelect}
                                buttonStyle={styles.filterButton}
                                activeButtonStyle={styles.activeFilterButton}
                                buttonContentStyle={styles.filterButtonContent}
                            />
                        </View>

                        <View style={styles.filterSection}>
                            <FilterMenu
                                label="Style"
                                allLabel="All Styles"
                                visible={styleMenuVisible}
                                setVisible={setStyleMenuVisible}
                                selectedId={selectedStyleId}
                                selectedName={getSelectedStyleName()}
                                items={searchFilters.styles}
                                onSelect={handleStyleSelect}
                                buttonStyle={styles.filterButton}
                                activeButtonStyle={styles.activeFilterButton}
                                buttonContentStyle={styles.filterButtonContent}
                            />
                        </View>

                        <View style={styles.filterSection}>
                            <FilterMenu
                                label="Language"
                                allLabel="All Languages"
                                visible={languageMenuVisible}
                                setVisible={setLanguageMenuVisible}
                                selectedId={selectedLanguageId}
                                selectedName={getSelectedLanguageName()}
                                items={searchFilters.song_languages}
                                onSelect={handleLanguageSelect}
                                buttonStyle={styles.filterButton}
                                activeButtonStyle={styles.activeFilterButton}
                                buttonContentStyle={styles.filterButtonContent}
                            />
                        </View>

                        {hasActiveFilters && (
                            <Button
                                mode="outlined"
                                onPress={onClearFilters}
                                style={styles.clearButton}
                                icon="close"
                                disabled={loading}
                            >
                                Clear All Filters
                            </Button>
                        )}
                    </>
                )}
            </Card.Content>
        </Card>
    );

    // Render inline version for compact layout
    if (inline) {
        return (
            <View style={styles.inlineContainer}>
                <IconButton
                    icon="tune"
                    size={24}
                    onPress={onToggleExpanded}
                    style={[styles.inlineToggleButton, hasActiveFilters && styles.inlineToggleButtonActive]}
                    iconColor={hasActiveFilters ? theme.colors.primary : theme.colors.onSurfaceVariant}
                />

                {isExpanded && (
                    <View style={styles.inlineExpandableContainer}>
                        <FiltersCardContent />
                    </View>
                )}
            </View>
        );
    }

    // Default (non-inline) rendering
    return (
        <View style={styles.container}>
            <View style={styles.toggleContainer}>
                <Button
                    mode="outlined"
                    onPress={onToggleExpanded}
                    icon={isExpanded ? 'chevron-up' : 'chevron-down'}
                    style={styles.toggleButton}
                    disabled={loading}
                >
                    Advanced Filters
                </Button>

                {hasActiveFilters && (
                    <IconButton
                        icon="close"
                        size={20}
                        onPress={onClearFilters}
                        style={styles.clearIconButton}
                        iconColor={theme.colors.error}
                        disabled={loading}
                    />
                )}
            </View>

            {hasActiveFilters && (
                <View style={styles.activeFiltersContainer}>
                    <Text variant="labelMedium" style={styles.activeFiltersLabel}>
                        Active Filters:
                    </Text>
                    <View style={styles.activeFiltersRow}>
                        {selectedCategoryId && (
                            <Chip mode="flat" onClose={() => handleCategorySelect(selectedCategoryId)} style={styles.activeFilterChip}>
                                {getSelectedCategoryName()}
                            </Chip>
                        )}
                        {selectedStyleId && (
                            <Chip mode="flat" onClose={() => handleStyleSelect(selectedStyleId)} style={styles.activeFilterChip}>
                                {getSelectedStyleName()}
                            </Chip>
                        )}
                        {selectedLanguageId && (
                            <Chip mode="flat" onClose={() => handleLanguageSelect(selectedLanguageId)} style={styles.activeFilterChip}>
                                {getSelectedLanguageName()}
                            </Chip>
                        )}
                    </View>
                </View>
            )}

            <Animated.View style={[styles.expandableContainer, animatedStyle]}>
                <FiltersCardContent />
            </Animated.View>
        </View>
    );
};

export default AdvancedSearchFilters;