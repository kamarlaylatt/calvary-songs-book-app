import { fetchSearchFilters, submitSongSuggestion } from '@/services/api';
import type { SearchFilters, SuggestSongRequest } from '@/types/models';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, Menu, Text, TextInput, useTheme } from 'react-native-paper';

const SuggestSong = () => {
    const router = useRouter();
    const theme = useTheme();

    // Form state
    const [title, setTitle] = useState('');
    const [lyrics, setLyrics] = useState('');
    const [youtube, setYoutube] = useState('');
    const [description, setDescription] = useState('');
    const [songWriter, setSongWriter] = useState('');
    const [musicalKey, setMusicalKey] = useState('');
    const [musicNotes, setMusicNotes] = useState('');
    const [email, setEmail] = useState('');
    const [popularRating, setPopularRating] = useState<number | null>(null);

    // Filter state
    const [filters, setFilters] = useState<SearchFilters | null>(null);
    const [selectedStyleId, setSelectedStyleId] = useState<number | undefined>();
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
    const [selectedLanguageIds, setSelectedLanguageIds] = useState<number[]>([]);

    // UI state
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [styleMenuVisible, setStyleMenuVisible] = useState(false);
    const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
    const [languageMenuVisible, setLanguageMenuVisible] = useState(false);

    useEffect(() => {
        loadFilters();
    }, []);

    const loadFilters = async () => {
        try {
            const data = await fetchSearchFilters();
            setFilters(data);
        } catch (error) {
            console.error('Error loading filters:', error);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!lyrics.trim()) {
            newErrors.lyrics = 'Lyrics are required';
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const request: SuggestSongRequest = {
                title: title.trim(),
                lyrics: lyrics.trim(),
            };

            // Add optional fields if provided
            if (youtube.trim()) request.youtube = youtube.trim();
            if (description.trim()) request.description = description.trim();
            if (songWriter.trim()) request.song_writer = songWriter.trim();
            if (selectedStyleId) request.style_id = selectedStyleId;
            if (musicalKey.trim()) request.key = musicalKey.trim();
            if (musicNotes.trim()) request.music_notes = musicNotes.trim();
            if (popularRating !== null) request.popular_rating = popularRating;
            if (email.trim()) request.email = email.trim();
            if (selectedCategoryIds.length > 0) request.category_ids = selectedCategoryIds;
            if (selectedLanguageIds.length > 0) request.song_language_ids = selectedLanguageIds;

            const response = await submitSongSuggestion(request);

            // Show success message
            Alert.alert(
                'Success',
                response.message || 'Your song suggestion has been submitted successfully! It will be reviewed by an admin.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.back(),
                    },
                ]
            );
        } catch (error: any) {
            console.error('Error submitting song suggestion:', error);

            // Handle validation errors from API
            if (error.response?.status === 422 && error.response?.data?.errors) {
                const apiErrors: { [key: string]: string } = {};
                const errorData = error.response.data.errors;

                Object.keys(errorData).forEach((key) => {
                    apiErrors[key] = errorData[key][0]; // Get first error message
                });

                setErrors(apiErrors);
            } else {
                Alert.alert('Error', 'Failed to submit song suggestion. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleCategory = (categoryId: number) => {
        setSelectedCategoryIds((prev) =>
            prev.includes(categoryId)
                ? prev.filter((id) => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const toggleLanguage = (languageId: number) => {
        setSelectedLanguageIds((prev) =>
            prev.includes(languageId)
                ? prev.filter((id) => id !== languageId)
                : [...prev, languageId]
        );
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        scrollContent: {
            padding: 16,
        },
        section: {
            marginBottom: 16,
        },
        sectionTitle: {
            marginBottom: 8,
            fontWeight: '600',
            color: theme.colors.onSurfaceVariant,
        },
        input: {
            marginBottom: 8,
            backgroundColor: theme.colors.surface,
        },
        lyricsInput: {
            marginBottom: 8,
            backgroundColor: theme.colors.surface,
            minHeight: 120,
        },
        error: {
            color: theme.colors.error,
            fontSize: 12,
            marginTop: -4,
            marginBottom: 8,
        },
        menuButton: {
            marginBottom: 8,
        },
        chipContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginTop: 8,
        },
        chip: {
            marginRight: 4,
            marginBottom: 4,
        },
        ratingContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
        },
        ratingButton: {
            marginHorizontal: 4,
        },
        submitButton: {
            marginTop: 16,
            marginBottom: 32,
        },
        requiredLabel: {
            color: theme.colors.error,
        },
    });

    const selectedStyle = useMemo(
        () => filters?.styles.find((s) => Number(s.id) === selectedStyleId),
        [filters?.styles, selectedStyleId]
    );

    const selectedCategories = useMemo(
        () => filters?.categories.filter((c) => selectedCategoryIds.includes(Number(c.id))),
        [filters?.categories, selectedCategoryIds]
    );

    const selectedLanguages = useMemo(
        () => filters?.song_languages.filter((l) => selectedLanguageIds.includes(Number(l.id))),
        [filters?.song_languages, selectedLanguageIds]
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <Text variant="headlineSmall" style={{ marginBottom: 16 }}>
                    Suggest a Song
                </Text>

                <Text variant="bodyMedium" style={{ marginBottom: 24, color: theme.colors.onSurfaceVariant }}>
                    Share your favorite song with us! Your suggestion will be reviewed by an admin
                    before being added to the song list.
                </Text>

                {/* Required Fields */}
                <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        Required Information <Text style={styles.requiredLabel}>*</Text>
                    </Text>

                    <TextInput
                        label="Song Title *"
                        value={title}
                        onChangeText={setTitle}
                        mode="outlined"
                        style={styles.input}
                        error={!!errors.title}
                    />
                    {errors.title && <Text style={styles.error}>{errors.title}</Text>}

                    <TextInput
                        label="Lyrics *"
                        value={lyrics}
                        onChangeText={setLyrics}
                        mode="outlined"
                        multiline
                        numberOfLines={6}
                        style={styles.lyricsInput}
                        error={!!errors.lyrics}
                    />
                    {errors.lyrics && <Text style={styles.error}>{errors.lyrics}</Text>}
                </View>

                {/* Optional Fields */}
                <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        Additional Information
                    </Text>

                    <TextInput
                        label="Song Writer"
                        value={songWriter}
                        onChangeText={setSongWriter}
                        mode="outlined"
                        style={styles.input}
                    />

                    <TextInput
                        label="YouTube URL"
                        value={youtube}
                        onChangeText={setYoutube}
                        mode="outlined"
                        style={styles.input}
                        keyboardType="url"
                        autoCapitalize="none"
                    />

                    <TextInput
                        label="Description"
                        value={description}
                        onChangeText={setDescription}
                        mode="outlined"
                        multiline
                        numberOfLines={3}
                        style={styles.input}
                    />

                    <TextInput
                        label="Musical Key (e.g., G, Am, C#)"
                        value={musicalKey}
                        onChangeText={setMusicalKey}
                        mode="outlined"
                        style={styles.input}
                    />

                    <TextInput
                        label="Music Notes"
                        value={musicNotes}
                        onChangeText={setMusicNotes}
                        mode="outlined"
                        multiline
                        numberOfLines={3}
                        style={styles.input}
                    />

                    <TextInput
                        label="Your Email (for approval notifications)"
                        value={email}
                        onChangeText={setEmail}
                        mode="outlined"
                        style={styles.input}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={!!errors.email}
                    />
                    {errors.email && <Text style={styles.error}>{errors.email}</Text>}
                </View>

                {/* Filters */}
                <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        Style
                    </Text>
                    <Menu
                        visible={styleMenuVisible}
                        onDismiss={() => setStyleMenuVisible(false)}
                        anchor={
                            <Button
                                mode="outlined"
                                onPress={() => setStyleMenuVisible(true)}
                                style={styles.menuButton}
                                icon="chevron-down"
                            >
                                {selectedStyle?.name || 'Select Style'}
                            </Button>
                        }
                    >
                        <Menu.Item
                            onPress={() => {
                                setSelectedStyleId(undefined);
                                setStyleMenuVisible(false);
                            }}
                            title="None"
                            leadingIcon={!selectedStyleId ? 'check' : undefined}
                        />
                        {filters?.styles.map((style) => (
                            <Menu.Item
                                key={style.id}
                                onPress={() => {
                                    setSelectedStyleId(Number(style.id));
                                    setStyleMenuVisible(false);
                                }}
                                title={style.name}
                                leadingIcon={selectedStyleId === Number(style.id) ? 'check' : undefined}
                            />
                        ))}
                    </Menu>
                </View>

                {/* Categories */}
                <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        Categories
                    </Text>
                    <Menu
                        visible={categoryMenuVisible}
                        onDismiss={() => setCategoryMenuVisible(false)}
                        anchor={
                            <Button
                                mode="outlined"
                                onPress={() => setCategoryMenuVisible(true)}
                                style={styles.menuButton}
                                icon="chevron-down"
                            >
                                Select Categories ({selectedCategoryIds.length})
                            </Button>
                        }
                    >
                        {filters?.categories.map((category) => (
                            <Menu.Item
                                key={category.id}
                                onPress={() => toggleCategory(Number(category.id))}
                                title={category.name}
                                leadingIcon={
                                    selectedCategoryIds.includes(Number(category.id)) ? 'check' : undefined
                                }
                            />
                        ))}
                    </Menu>
                    {selectedCategories && selectedCategories.length > 0 && (
                        <View style={styles.chipContainer}>
                            {selectedCategories.map((category) => (
                                <Chip
                                    key={category.id}
                                    style={styles.chip}
                                    onClose={() => toggleCategory(Number(category.id))}
                                >
                                    {category.name}
                                </Chip>
                            ))}
                        </View>
                    )}
                </View>

                {/* Languages */}
                <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        Languages
                    </Text>
                    <Menu
                        visible={languageMenuVisible}
                        onDismiss={() => setLanguageMenuVisible(false)}
                        anchor={
                            <Button
                                mode="outlined"
                                onPress={() => setLanguageMenuVisible(true)}
                                style={styles.menuButton}
                                icon="chevron-down"
                            >
                                Select Languages ({selectedLanguageIds.length})
                            </Button>
                        }
                    >
                        {filters?.song_languages.map((language) => (
                            <Menu.Item
                                key={language.id}
                                onPress={() => toggleLanguage(Number(language.id))}
                                title={language.name}
                                leadingIcon={
                                    selectedLanguageIds.includes(Number(language.id)) ? 'check' : undefined
                                }
                            />
                        ))}
                    </Menu>
                    {selectedLanguages && selectedLanguages.length > 0 && (
                        <View style={styles.chipContainer}>
                            {selectedLanguages.map((language) => (
                                <Chip
                                    key={language.id}
                                    style={styles.chip}
                                    onClose={() => toggleLanguage(Number(language.id))}
                                >
                                    {language.name}
                                </Chip>
                            ))}
                        </View>
                    )}
                </View>

                {/* Popular Rating */}
                <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        Popular Rating (Optional)
                    </Text>
                    {popularRating !== null && (
                        <Text variant="bodyMedium" style={{ marginBottom: 8, color: theme.colors.primary }}>
                            Selected: {popularRating} / 5
                        </Text>
                    )}
                    <View style={styles.ratingContainer}>
                        {[0, 1, 2, 3, 4, 5].map((rating) => (
                            <Button
                                key={rating}
                                mode={popularRating === rating ? 'contained' : 'outlined'}
                                onPress={() => setPopularRating(rating)}
                                style={styles.ratingButton}
                                compact
                            >
                                {rating}
                            </Button>
                        ))}
                    </View>
                    {popularRating !== null && (
                        <Button
                            mode="text"
                            onPress={() => setPopularRating(null)}
                            style={{ marginTop: 8 }}
                            compact
                        >
                            Clear Rating
                        </Button>
                    )}
                </View>

                {/* Submit Button */}
                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={loading}
                    disabled={loading}
                    style={styles.submitButton}
                    icon="send"
                >
                    Submit Suggestion
                </Button>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default SuggestSong;
