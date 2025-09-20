import type { VersionCheckResponse } from '@/types/version';
import React from 'react';
import { StyleSheet } from 'react-native';
import {
    Button,
    Dialog,
    Divider,
    Portal,
    Text,
    useTheme,
} from 'react-native-paper';

interface UpdateDialogProps {
    visible: boolean;
    versionData: VersionCheckResponse | null;
    onUpdate: () => void;
    onDismiss: () => void;
}

export function UpdateDialog({
    visible,
    versionData,
    onUpdate,
    onDismiss,
}: UpdateDialogProps) {
    const theme = useTheme();

    if (!versionData) return null;

    const styles = StyleSheet.create({
        dialog: {
            backgroundColor: theme.colors.surface,
        },
        title: {
            color: theme.colors.onSurface,
        },
        content: {
            color: theme.colors.onSurfaceVariant,
        },
        button: {
            marginHorizontal: 4,
        },
        updateButton: {
            backgroundColor: theme.colors.primary,
        },
        updateButtonText: {
            color: theme.colors.onPrimary,
        },
        dismissButtonText: {
            color: theme.colors.primary,
        },
        divider: {
            backgroundColor: theme.colors.outline,
        },
    });

    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
                <Dialog.Title style={styles.title}>
                    Update Available
                </Dialog.Title>
                <Dialog.Content>
                    <Text variant="bodyMedium" style={styles.content}>
                        {versionData.message}
                    </Text>
                    <Text variant="bodySmall" style={[styles.content, { marginTop: 8 }]}>
                        Current version: {versionData.current_version_code}
                    </Text>
                    <Text variant="bodySmall" style={styles.content}>
                        Latest version: {versionData.latest_version_name} (code: {versionData.latest_version_code})
                    </Text>
                    {versionData.release_notes && (
                        <>
                            <Divider style={[styles.divider, { marginVertical: 12 }]} />
                            <Text variant="bodySmall" style={styles.content}>
                                Release notes: {versionData.release_notes}
                            </Text>
                        </>
                    )}
                </Dialog.Content>
                <Dialog.Actions>
                    {!versionData.needs_update && (
                        <Button
                            onPress={onDismiss}
                            style={styles.button}
                            textColor={styles.dismissButtonText.color}
                        >
                            Later
                        </Button>
                    )}
                    <Button
                        onPress={onUpdate}
                        mode="contained"
                        style={[styles.button, styles.updateButton]}
                        textColor={styles.updateButtonText.color}
                    >
                        Update Now
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
}