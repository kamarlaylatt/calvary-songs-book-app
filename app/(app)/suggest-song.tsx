import { fetchSearchFilters, submitSongSuggestion } from '@/services/api';
import type { SearchFilters, SuggestSongRequest } from '@/types/models';
import { htmlToPlainText } from '@/utils/html';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, IconButton, Menu, Text, TextInput, useTheme } from 'react-native-paper';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';

const SuggestSong = () => {
    const router = useRouter();
    const theme = useTheme();

    // Form state
    const [title, setTitle] = useState('');
    const [lyrics, setLyrics] = useState('');
    const richEditorRef = React.useRef<RichEditor>(null);
    const [youtube, setYoutube] = useState('');
    const [description, setDescription] = useState('');
    const [songWriter, setSongWriter] = useState('');
    const [musicalKey, setMusicalKey] = useState('');
    const [musicNotes, setMusicNotes] = useState('');
    const [email, setEmail] = useState('');
    const [popularRating, setPopularRating] = useState<number | null>(null);

    // Filter state
    const [filters, setFilters] = useState<SearchFilters | null>(null);
    const [selectedStyleId, setSelectedStyleId] = useState<string | undefined>();
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    const [selectedLanguageIds, setSelectedLanguageIds] = useState<string[]>([]);

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

        if (!htmlToPlainText(lyrics).trim()) {
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
            if (selectedStyleId) request.style_id = Number(selectedStyleId);
            if (musicalKey.trim()) request.key = musicalKey.trim();
            if (musicNotes.trim()) request.music_notes = musicNotes.trim();
            if (popularRating !== null) request.popular_rating = popularRating;
            if (email.trim()) request.email = email.trim();
            if (selectedCategoryIds.length > 0) request.category_ids = selectedCategoryIds.map(Number);
            if (selectedLanguageIds.length > 0) request.song_language_ids = selectedLanguageIds.map(Number);

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

    const toggleCategory = (categoryId: string) => {
        setSelectedCategoryIds((prev) =>
            prev.includes(categoryId)
                ? prev.filter((id) => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const toggleLanguage = (languageId: string) => {
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
            minHeight: 160,
            borderRadius: 4,
            overflow: 'hidden',
        },
        toolbar: {
            borderTopWidth: StyleSheet.hairlineWidth,
            borderColor: theme.colors.outlineVariant,
            backgroundColor: theme.colors.surface,
            marginBottom: 8,
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
        () => filters?.styles.find((s) => s.id === selectedStyleId),
        [filters?.styles, selectedStyleId]
    );

    const selectedCategories = useMemo(
        () => filters?.categories.filter((c) => selectedCategoryIds.includes(c.id)),
        [filters?.categories, selectedCategoryIds]
    );

    const selectedLanguages = useMemo(
        () => filters?.song_languages.filter((l) => selectedLanguageIds.includes(l.id)),
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

                    <View style={styles.lyricsInput}>
                        <RichEditor
                            ref={richEditorRef}
                            initialContentHTML={lyrics}
                            onChange={setLyrics}
                            placeholder="Type lyrics here..."
                            editorStyle={{
                                backgroundColor: theme.colors.surface,
                                color: theme.colors.onSurface,
                                caretColor: theme.colors.primary,
                                placeholderColor: theme.colors.onSurfaceVariant,
                            }}
                            style={{ minHeight: 160 }}
                        />
                    </View>
                    <RichToolbar
                        editor={richEditorRef}
                        actions={[
                            actions.undo,
                            actions.redo,
                            actions.setBold,
                            actions.setItalic,
                            actions.setUnderline,
                            actions.heading1,
                            actions.insertBulletsList,
                            actions.insertOrderedList,
                            actions.blockquote,
                            actions.line,
                        ]}
                        selectedIconTint={theme.colors.primary}
                        iconTint={theme.colors.onSurfaceVariant}
                        style={styles.toolbar}
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

                    {/* <TextInput
                        label="Music Notes"
                        value={musicNotes}
                        onChangeText={setMusicNotes}
                        mode="outlined"
                        multiline
                        numberOfLines={3}
                        style={styles.input}
                    /> */}

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
                                    setSelectedStyleId(style.id);
                                    setStyleMenuVisible(false);
                                }}
                                title={style.name}
                                leadingIcon={selectedStyleId === style.id ? 'check' : undefined}
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
                                onPress={() => toggleCategory(category.id)}
                                title={category.name}
                                leadingIcon={
                                    selectedCategoryIds.includes(category.id) ? 'check' : undefined
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
                                    onClose={() => toggleCategory(category.id)}
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
                                onPress={() => toggleLanguage(language.id)}
                                title={language.name}
                                leadingIcon={
                                    selectedLanguageIds.includes(language.id) ? 'check' : undefined
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
                                    onClose={() => toggleLanguage(language.id)}
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
                            Selected: {popularRating} / 4
                        </Text>
                    )}
                    <View style={styles.ratingContainer}>
                        {[1, 2, 3, 4].map((star) => (
                            <IconButton
                                key={star}
                                icon={popularRating !== null && star <= popularRating ? 'star' : 'star-outline'}
                                selected={popularRating !== null && star <= popularRating}
                                onPress={() => setPopularRating(popularRating === star ? null : star)}
                                style={styles.ratingButton}
                                size={24}
                                accessibilityLabel={`Set rating to ${star} ${star === 1 ? 'star' : 'stars'}`}
                            />
                        ))}
                    </View>
                    {popularRating !== null && (
                        <Button
                            mode="text"
                            onPress={() => setPopularRating(null)}
                            style={{ marginTop: 8 }}
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
