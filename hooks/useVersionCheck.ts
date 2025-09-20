import { checkAppVersion } from '@/services/api';
import type { VersionCheckResponse } from '@/types/version';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

interface UseVersionCheckResult {
    needsUpdate: boolean;
    versionData: VersionCheckResponse | null;
    isChecking: boolean;
    error: string | null;
}

export function useVersionCheck(): UseVersionCheckResult {
    const [needsUpdate, setNeedsUpdate] = useState(false);
    const [versionData, setVersionData] = useState<VersionCheckResponse | null>(null);
    const [isChecking, setIsChecking] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkVersion = async () => {
            try {
                setIsChecking(true);
                setError(null);

                // Get current app version code from environment variable
                // EXPO_PUBLIC_VERSION_CODE should be an integer (e.g., 100)
                const currentVersionCode = parseInt(process.env.EXPO_PUBLIC_VERSION_CODE || '1', 10);

                const platform = Platform.OS === 'ios' ? 'ios' : 'android';

                const response = await checkAppVersion({
                    version_code: currentVersionCode,
                    platform,
                });

                setVersionData(response);
                setNeedsUpdate(response.needs_update);
            } catch (err) {
                console.error('Version check failed:', err);
                setError(err instanceof Error ? err.message : 'Failed to check version');
            } finally {
                setIsChecking(false);
            }
        };

        checkVersion();
    }, []);

    return {
        needsUpdate,
        versionData,
        isChecking,
        error,
    };
}