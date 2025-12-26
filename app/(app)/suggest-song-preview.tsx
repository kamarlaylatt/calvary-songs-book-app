import { submitSongSuggestion } from '@/services/api';
import type { SuggestSongRequest } from '@/types/models';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Button, Card, Chip, Text, useTheme } from 'react-native-paper';
import RenderHTML from 'react-native-render-html';

interface PreviewParams {
    title: string;
    lyrics: string;
    youtube?: string;
    description?: string;
    songWriter?: string;
    musicalKey?: string;
    musicNotes?: string;
    email?: string;
    popularRating?: string;
    styleId?: string;
    styleName?: string;
    categoryIds?: string;
    categoryNames?: string;
    languageIds?: string;
    languageNames?: string;
}

const flattenParagraphsToLineBreaks = (html: string): string => {
    // Convert block-level paragraph tags into single line breaks so Enter behaves like <br />
    let normalized = html || '';
    normalized = normalized.replace(/<\/p>\s*<p>/gi, '<br/>');
    normalized = normalized.replace(/<\/(p|div|section|article|h[1-6]|li)>/gi, '<br/>');
    normalized = normalized.replace(/<(p|div|section|article|h[1-6]|li)[^>]*>/gi, '');
    normalized = normalized.replace(/(<br\s*\/?>(\s|&nbsp;)*){2,}/gi, '<br/>');
    return normalized.trim();
};

const SuggestSongPreview = () => {
    const router = useRouter();
    const theme = useTheme();
    const { width } = useWindowDimensions();
    const params = useLocalSearchParams();
    const [loading, setLoading] = useState(false);

    const normalizedLyrics = useMemo(
        () => flattenParagraphsToLineBreaks(String(params.lyrics || '')),
        [params.lyrics]
    );

    const buildRequest = (): SuggestSongRequest => {
        const request: SuggestSongRequest = {
            title: String(params.title || ''),
            lyrics: normalizedLyrics,
        };

        if (params.youtube) request.youtube = String(params.youtube);
        if (params.description) request.description = String(params.description);
        if (params.songWriter) request.song_writer = String(params.songWriter);
        if (params.styleId) request.style_id = Number(params.styleId);
        if (params.musicalKey) request.key = String(params.musicalKey);
        if (params.musicNotes) request.music_notes = String(params.musicNotes);
        if (params.popularRating) request.popular_rating = Number(params.popularRating);
        if (params.email) request.email = String(params.email);
        if (params.categoryIds) {
            request.category_ids = String(params.categoryIds).split(',').map(Number);
        }
        if (params.languageIds) {
            request.song_language_ids = String(params.languageIds).split(',').map(Number);
        }

        return request;
    };

    const handleSubmit = async () => {
        setLoading(true);

        try {
            const request = buildRequest();
            const response = await submitSongSuggestion(request);

            Alert.alert(
                'Success',
                response.message || 'Your song suggestion has been submitted successfully! It will be reviewed by an admin.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.push('/(app)/(drawer)/songs'),
                    },
                ]
            );
        } catch (error: any) {
            console.error('Error submitting song suggestion:', error);

            if (error.response?.status === 422 && error.response?.data?.errors) {
                const errorData = error.response.data.errors;
                const errorMessages = Object.keys(errorData)
                    .map((key) => `${key}: ${errorData[key][0]}`)
                    .join('\n');
                Alert.alert('Validation Error', errorMessages);
            } else {
                Alert.alert('Error', 'Failed to submit song suggestion. Please try again.');
            }
        } finally {
            setLoading(false);
        }
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
            marginBottom: 16,
            fontWeight: '700',
            color: theme.colors.primary,
            fontSize: 20,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },
        fieldLabel: {
            fontWeight: '700',
            marginBottom: 8,
            color: theme.colors.primary,
            fontSize: 14,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },
        fieldValue: {
            marginBottom: 20,
            fontSize: 17,
            lineHeight: 26,
            color: theme.colors.onSurface,
            backgroundColor: theme.colors.surfaceVariant,
            padding: 12,
            borderRadius: 8,
        },
        lyricsContainer: {
            marginBottom: 20,
            padding: 16,
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: 8,
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.primary,
        },
        chipContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 12,
        },
        chip: {
            marginRight: 4,
            marginBottom: 4,
        },
        buttonContainer: {
            flexDirection: 'row',
            gap: 8,
            marginTop: 16,
            marginBottom: 32,
        },
        button: {
            flex: 1,
        },
    });

    const categoryNames = params.categoryNames ? String(params.categoryNames).split(',') : [];
    const languageNames = params.languageNames ? String(params.languageNames).split(',') : [];

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <Text variant="headlineMedium" style={{ marginBottom: 20, fontSize: 24 }}>
                Preview Suggestion
            </Text>

            <Card style={styles.section}>
                <Card.Content>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        Required Information
                    </Text>

                    <Text variant="labelMedium" style={styles.fieldLabel}>
                        Title
                    </Text>
                    <Text style={styles.fieldValue}>
                        {params.title}
                    </Text>

                    <Text variant="labelMedium" style={styles.fieldLabel}>
                        Lyrics
                    </Text>
                    <View style={styles.lyricsContainer}>
                        <RenderHTML
                            source={{ html: normalizedLyrics }}
                            contentWidth={width - 80}
                            baseStyle={{
                                fontSize: 16,
                                lineHeight: 24,
                                color: theme.colors.onSurface,
                            }}
                        />
                    </View>
                </Card.Content>
            </Card>

            {(params.songWriter ||
                params.youtube ||
                params.description ||
                params.musicalKey ||
                params.musicNotes ||
                params.email) && (
                <Card style={styles.section}>
                    <Card.Content>
                        <Text variant="titleMedium" style={styles.sectionTitle}>
                            Additional Information
                        </Text>

                        {params.songWriter && (
                            <>
                                <Text variant="labelMedium" style={styles.fieldLabel}>
                                    Song Writer
                                </Text>
                                <Text style={styles.fieldValue}>{params.songWriter}</Text>
                            </>
                        )}

                        {params.youtube && (
                            <>
                                <Text variant="labelMedium" style={styles.fieldLabel}>
                                    YouTube URL
                                </Text>
                                <Text style={styles.fieldValue}>{params.youtube}</Text>
                            </>
                        )}

                        {params.description && (
                            <>
                                <Text variant="labelMedium" style={styles.fieldLabel}>
                                    Description
                                </Text>
                                <Text style={styles.fieldValue}>{params.description}</Text>
                            </>
                        )}

                        {params.musicalKey && (
                            <>
                                <Text variant="labelMedium" style={styles.fieldLabel}>
                                    Musical Key
                                </Text>
                                <Text style={styles.fieldValue}>{params.musicalKey}</Text>
                            </>
                        )}

                        {params.musicNotes && (
                            <>
                                <Text variant="labelMedium" style={styles.fieldLabel}>
                                    Music Notes
                                </Text>
                                <Text style={styles.fieldValue}>{params.musicNotes}</Text>
                            </>
                        )}

                        {params.email && (
                            <>
                                <Text variant="labelMedium" style={styles.fieldLabel}>
                                    Email
                                </Text>
                                <Text style={styles.fieldValue}>{params.email}</Text>
                            </>
                        )}
                    </Card.Content>
                </Card>
            )}

            {(params.styleName || params.popularRating || categoryNames.length > 0 || languageNames.length > 0) && (
                <Card style={styles.section}>
                    <Card.Content>
                        <Text variant="titleMedium" style={styles.sectionTitle}>
                            Categories & Metadata
                        </Text>

                        {params.styleName && (
                            <>
                                <Text variant="labelMedium" style={styles.fieldLabel}>
                                    Style
                                </Text>
                                <Text style={styles.fieldValue}>{params.styleName}</Text>
                            </>
                        )}

                        {params.popularRating && (
                            <>
                                <Text variant="labelMedium" style={styles.fieldLabel}>
                                    Popular Rating
                                </Text>
                                <Text style={styles.fieldValue}>{params.popularRating} / 4 ⭐</Text>
                            </>
                        )}

                        {categoryNames.length > 0 && (
                            <>
                                <Text variant="labelMedium" style={styles.fieldLabel}>
                                    Categories
                                </Text>
                                <View style={styles.chipContainer}>
                                    {categoryNames.map((name, idx) => (
                                        <Chip key={idx} style={styles.chip}>
                                            {name}
                                        </Chip>
                                    ))}
                                </View>
                            </>
                        )}

                        {languageNames.length > 0 && (
                            <>
                                <Text variant="labelMedium" style={styles.fieldLabel}>
                                    Languages
                                </Text>
                                <View style={styles.chipContainer}>
                                    {languageNames.map((name, idx) => (
                                        <Chip key={idx} style={styles.chip}>
                                            {name}
                                        </Chip>
                                    ))}
                                </View>
                            </>
                        )}
                    </Card.Content>
                </Card>
            )}

            <View style={styles.buttonContainer}>
                <Button
                    mode="outlined"
                    onPress={() => router.back()}
                    style={styles.button}
                    icon="pencil"
                    disabled={loading}
                >
                    Edit
                </Button>
                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    style={styles.button}
                    icon="send"
                    loading={loading}
                    disabled={loading}
                >
                    Confirm & Submit
                </Button>
            </View>
        </ScrollView>
    );
};

export default SuggestSongPreview;
