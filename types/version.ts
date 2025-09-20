// Version check types for app update functionality

export interface VersionCheckRequest {
    version_code: number;
    platform: 'android' | 'ios';
}

export interface VersionCheckResponse {
    needs_update: boolean;
    current_version_code: number;
    minimum_version_code: number;
    latest_version_code: number;
    latest_version_name: string;
    update_url: string;
    release_notes: string;
    message: string;
}

export interface VersionCheckError {
    error: string;
    message: string;
}