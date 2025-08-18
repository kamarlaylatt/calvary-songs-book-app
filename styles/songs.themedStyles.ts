import { StyleSheet } from 'react-native';
import type { MD3Theme } from 'react-native-paper';
import { styles as baseStyles } from './songs.styles';

export function createThemedStyles(theme: MD3Theme) {
    return StyleSheet.create({
        ...baseStyles,
        description: {
            ...baseStyles.description,
            color: theme.colors.onSurfaceVariant,
        },
        songId: {
            ...baseStyles.songId,
            color: theme.colors.onSurfaceVariant,
            fontSize: 12,
            opacity: 0.7,
            marginTop: 2,
        },
        songWriter: {
            ...baseStyles.songWriter,
            color: theme.colors.onSurfaceVariant,
        },
        indicatorText: {
            ...baseStyles.indicatorText,
            color: theme.colors.onSurfaceVariant,
        },
        indicator: {
            ...baseStyles.indicator,
            backgroundColor: theme.colors.surfaceVariant,
        },
        emptyText: {
            ...baseStyles.emptyText,
            color: theme.colors.onSurfaceVariant,
        },
        emptySubtext: {
            ...baseStyles.emptySubtext,
            color: theme.colors.onSurfaceVariant,
        },
        titleRow: {
            ...baseStyles.titleRow,
        },
        recentBadge: {
            ...baseStyles.recentBadge,
            color: theme.colors.primary,
        },
        headerActions: {
            ...baseStyles.headerActions,
        },
        deleteButton: {
            ...baseStyles.deleteButton,
            backgroundColor: theme.colors.errorContainer,
        },
        deleteButtonText: {
            ...baseStyles.deleteButtonText,
            color: theme.colors.onErrorContainer,
        },
        listHeaderTitle: {
            ...baseStyles.listHeaderTitle,
            color: theme.colors.onSurfaceVariant,
        },
        clearHistoryButton: {
            ...baseStyles.clearHistoryButton,
            backgroundColor: theme.colors.surfaceVariant,
        },
        clearHistoryButtonText: {
            ...baseStyles.clearHistoryButtonText,
            color: theme.colors.primary,
        },
        recentMetaChip: {
            ...baseStyles.recentMetaChip,
            backgroundColor: theme.colors.surfaceVariant,
        },
        recentMetaChipText: {
            ...baseStyles.recentMetaChipText,
            color: theme.colors.onSurfaceVariant,
        },
        sectionDivider: {
            ...baseStyles.sectionDivider,
            borderBottomColor: theme.colors.surfaceVariant,
        },
        pagerView: {
            ...baseStyles.pagerView,
        },
        pageContainer: {
            ...baseStyles.pageContainer,
        },
        customTabBar: {
            ...baseStyles.customTabBar,
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.outline,
        },
        tabButton: {
            ...baseStyles.tabButton,
        },
        activeTabButton: {
            ...baseStyles.activeTabButton,
            borderBottomColor: theme.colors.primary,
        },
        tabButtonText: {
            ...baseStyles.tabButtonText,
            color: theme.colors.onSurfaceVariant,
        },
        activeTabButtonText: {
            ...baseStyles.activeTabButtonText,
            color: theme.colors.primary,
        },
        recentHeader: {
            ...baseStyles.recentHeader,
        },
        clearAllButton: {
            ...baseStyles.clearAllButton,
            backgroundColor: theme.colors.errorContainer,
        },
        clearAllButtonText: {
            ...baseStyles.clearAllButtonText,
            color: theme.colors.onErrorContainer,
        },
    });
}