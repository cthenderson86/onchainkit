/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useName } from './useName';
import { publicClient } from '../../network/client';
import { getNewReactQueryTestProvider } from './getNewReactQueryTestProvider';
import { base, optimism } from 'viem/chains';

jest.mock('../../network/client');
jest.mock('../../network/getChainPublicClient', () => ({
  ...jest.requireActual('../../network/getChainPublicClient'),
  getChainPublicClient: jest.fn(() => publicClient),
}));

describe('useName', () => {
  const mockGetEnsName = publicClient.getEnsName as jest.Mock;
  const mockReadContract = publicClient.readContract as jest.Mock;
  const testAddress = '0x123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the correct ENS name and loading state', async () => {
    const testEnsName = 'test.ens';

    // Mock the getEnsName method of the publicClient
    mockGetEnsName.mockResolvedValue(testEnsName);

    // Use the renderHook function to create a test harness for the useName hook
    const { result } = renderHook(() => useName({ address: testAddress }), {
      wrapper: getNewReactQueryTestProvider(),
    });

    // Wait for the hook to finish fetching the ENS name
    await waitFor(() => {
      // Check that the ENS name and loading state are correct
      expect(result.current.data).toBe(testEnsName);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('returns the loading state true while still fetching from ens action', async () => {
    // Use the renderHook function to create a test harness for the useName hook
    const { result } = renderHook(() => useName({ address: testAddress }), {
      wrapper: getNewReactQueryTestProvider(),
    });

    // Wait for the hook to finish fetching the ENS name
    await waitFor(() => {
      // Check that the ENS name and loading state are correct
      expect(result.current.data).toBe(undefined);
      expect(result.current.isLoading).toBe(true);
    });
  });

  it('returns the correct ENS name and loading state for custom chain ', async () => {
    const testEnsName = 'test.customchain.eth';

    // Mock the getEnsName method of the publicClient
    mockReadContract.mockResolvedValue(testEnsName);

    // Use the renderHook function to create a test harness for the useName hook
    const { result } = renderHook(
      () => useName({ address: testAddress, chain: base }),
      {
        wrapper: getNewReactQueryTestProvider(),
      },
    );

    // Wait for the hook to finish fetching the ENS name
    await waitFor(() => {
      // Check that the ENS name and loading state are correct
      expect(result.current.data).toBe(testEnsName);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('returns undefined unsupported chain ', async () => {
    // Use the renderHook function to create a test harness for the useName hook
    const { result } = renderHook(
      () => useName({ address: testAddress, chain: optimism }),
      {
        wrapper: getNewReactQueryTestProvider(),
      },
    );

    // Wait for the hook to finish fetching the ENS name
    await waitFor(() => {
      // Check that the ENS name and loading state are correct
      expect(result.current.data).toBe(undefined);
    });
  });
});
