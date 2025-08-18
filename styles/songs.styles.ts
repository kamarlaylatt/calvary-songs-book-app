import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    fetchButton: {
        margin: 16,
        padding: 12,
        backgroundColor: '#4169E1',
        borderRadius: 8,
        alignItems: 'center',
    },
    fetchButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    container: {
        flex: 1,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        // backgroundColor: '#fff',
        borderBottomWidth: 1,
        // borderBottomColor: '#e0e0e0',
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    searchBar: {
        flex: 1,
        elevation: 2,
        borderRadius: 8,
    },
    searchInput: {
        fontSize: 16,
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontWeight: 'bold',
        color: '#333',
    },
    headerSubtitle: {
        color: '#666',
        marginTop: 4,
    },
    listContainer: {
        paddingVertical: 8,
        paddingBottom: 30,
    },
    listHeader: {
        paddingHorizontal: 16,
        paddingTop: 4,
        paddingBottom: 8,
    },
    listHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    listHeaderTitle: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    clearHistoryButton: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 14,
    },
    clearHistoryButtonText: {
        fontSize: 12,
        fontWeight: '600',
    },
    songItem: {
        marginHorizontal: 16,
        marginVertical: 6,
    },
    card: {
        elevation: 2,
        borderRadius: 12,
    },
    cardContent: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    songHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    titleContainer: {
        flex: 1,
        marginRight: 12,
    },
    songTitle: {
        fontWeight: '600',
        marginBottom: 2,
    },
    styleChip: {
        height: 32,
        borderRadius: 16,
        alignSelf: 'flex-start',
    },
    description: {
        marginBottom: 8,
        lineHeight: 18,
        opacity: 0.8,
    },
    songId: {
        fontSize: 12,
        opacity: 0.7,
    },
    recentMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    recentMetaChip: {
        height: 30,
        borderRadius: 12,
    },
    recentMetaChipText: {
        fontSize: 10,
        fontWeight: '600',
        opacity: 0.9,
    },
    songWriter: {
        fontStyle: 'italic',
        fontSize: 12,
        opacity: 0.7,
    },
    songFooter: {
        marginTop: 8,
    },
    contentIndicators: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    indicator: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    indicatorText: {
        fontSize: 11,
        fontWeight: '500',
        opacity: 0.8,
    },
    youtubeChip: {
        height: 28
    },
    lyricsChip: {
        height: 28,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
    },
    fetchButtonDisabled: {
        backgroundColor: '#9cb3e0',
    },
    loadingMore: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    chipText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    },
    categoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
        marginBottom: 8,
    },
    categoryChip: {
        height: 28,
        borderRadius: 14,
        marginBottom: 2,
    },
    categoryChipText: {
        fontSize: 10,
        fontWeight: '500',
    },
    contentChip: {
        height: 30,
        borderRadius: 15,
        marginRight: 4,
    },
    contentChipText: {
        fontSize: 10,
        fontWeight: '500',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    recentBadge: {
        fontSize: 10,
        fontWeight: '600',
        marginLeft: 8,
        paddingHorizontal: 4,
        paddingVertical: 2,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    deleteButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 4,
    },
    deleteButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        lineHeight: 16,
    },
    sectionDivider: {
        marginTop: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    historyCard: {
        // subtle elevation difference for recents
    },
    pagerView: {
        flex: 1,
    },
    pageContainer: {
        flex: 1,
    },
    customTabBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTabButton: {
        borderBottomWidth: 2,
    },
    tabButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    activeTabButtonText: {
        fontWeight: '600',
    },
    recentHeader: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        alignItems: 'flex-end',
    },
    clearAllButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    clearAllButtonText: {
        fontSize: 12,
        fontWeight: '600',
    },
});