/**
 * Tests for StorageFactory
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StorageFactory } from './storage.factory';
import { LocalStorageService } from './localStorage.service';
import { ApiStorageService } from './api.service';
import { SupabaseStorageService } from './supabase.service';

// Mock the config modules
vi.mock('../../config/storage.config', () => ({
    getStorageType: vi.fn(),
}));

vi.mock('../../config/env.config', () => ({
    getApiUrl: vi.fn(),
    getSupabaseUrl: vi.fn(),
    getSupabaseAnonKey: vi.fn(),
}));

// Mock Supabase config
vi.mock('../../config/supabase.config', () => ({
    getSupabase: vi.fn(() => ({
        from: vi.fn(),
    })),
}));

describe('StorageFactory', () => {
    beforeEach(() => {
        // Reset the factory instance before each test
        StorageFactory.reset();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('create', () => {
        it('should create LocalStorageService when type is localStorage', async () => {
            const { getStorageType } = await import('../../config/storage.config');
            vi.mocked(getStorageType).mockReturnValue('localStorage');

            const service = StorageFactory.create();

            expect(service).toBeInstanceOf(LocalStorageService);
        });

        it('should create ApiStorageService when type is api', async () => {
            const { getStorageType } = await import('../../config/storage.config');
            const { getApiUrl } = await import('../../config/env.config');

            vi.mocked(getStorageType).mockReturnValue('api');
            vi.mocked(getApiUrl).mockReturnValue('https://api.example.com');

            const service = StorageFactory.create();

            expect(service).toBeInstanceOf(ApiStorageService);
        });

        it('should throw error when API URL is not configured', async () => {
            const { getStorageType } = await import('../../config/storage.config');
            const { getApiUrl } = await import('../../config/env.config');

            vi.mocked(getStorageType).mockReturnValue('api');
            vi.mocked(getApiUrl).mockReturnValue('');

            expect(() => StorageFactory.create()).toThrow(
                'API storage requires VITE_API_URL to be configured'
            );
        });

        it('should create SupabaseStorageService when type is supabase', async () => {
            const { getStorageType } = await import('../../config/storage.config');
            const { getSupabaseUrl, getSupabaseAnonKey } = await import('../../config/env.config');

            vi.mocked(getStorageType).mockReturnValue('supabase');
            vi.mocked(getSupabaseUrl).mockReturnValue('https://xxx.supabase.co');
            vi.mocked(getSupabaseAnonKey).mockReturnValue('test-anon-key');

            const service = StorageFactory.create();

            expect(service).toBeInstanceOf(SupabaseStorageService);
        });

        it('should throw error when Supabase URL is not configured', async () => {
            const { getStorageType } = await import('../../config/storage.config');
            const { getSupabaseUrl, getSupabaseAnonKey } = await import('../../config/env.config');

            vi.mocked(getStorageType).mockReturnValue('supabase');
            vi.mocked(getSupabaseUrl).mockReturnValue('');
            vi.mocked(getSupabaseAnonKey).mockReturnValue('test-key');

            expect(() => StorageFactory.create()).toThrow(
                'Supabase storage requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
            );
        });

        it('should throw error when Supabase anon key is not configured', async () => {
            const { getStorageType } = await import('../../config/storage.config');
            const { getSupabaseUrl, getSupabaseAnonKey } = await import('../../config/env.config');

            vi.mocked(getStorageType).mockReturnValue('supabase');
            vi.mocked(getSupabaseUrl).mockReturnValue('https://xxx.supabase.co');
            vi.mocked(getSupabaseAnonKey).mockReturnValue('');

            expect(() => StorageFactory.create()).toThrow(
                'Supabase storage requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
            );
        });

        it('should throw error for unknown storage type', async () => {
            const { getStorageType } = await import('../../config/storage.config');

            vi.mocked(getStorageType).mockReturnValue('unknown' as any);

            expect(() => StorageFactory.create()).toThrow('Unknown storage type: unknown');
        });

        it('should return same instance on subsequent calls (singleton)', async () => {
            const { getStorageType } = await import('../../config/storage.config');
            vi.mocked(getStorageType).mockReturnValue('localStorage');

            const service1 = StorageFactory.create();
            const service2 = StorageFactory.create();

            expect(service1).toBe(service2);
        });

        it('should create new instance after reset', async () => {
            const { getStorageType } = await import('../../config/storage.config');
            vi.mocked(getStorageType).mockReturnValue('localStorage');

            const service1 = StorageFactory.create();
            StorageFactory.reset();
            const service2 = StorageFactory.create();

            expect(service1).not.toBe(service2);
            expect(service1).toBeInstanceOf(LocalStorageService);
            expect(service2).toBeInstanceOf(LocalStorageService);
        });
    });
});
