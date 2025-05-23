import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupLoginButtonHandler } from '../setupLoginButtonHandler';
import { PublicKey } from '@dfinity/agent';
import { prepareLogin } from '../prepareLogin';
import { buildMiddleToAppDelegationChain } from '../buildMiddleToAppDelegationChain';
import { handleAppDelegation } from '../handleAppDelegation';
import { renderError } from '../renderError';
import { formatError } from '../formatError';
import { ERROR_MESSAGES } from '../constants';

// Mock all dependencies
vi.mock('../prepareLogin', () => ({
  prepareLogin: vi.fn(),
}));

vi.mock('../buildMiddleToAppDelegationChain', () => ({
  buildMiddleToAppDelegationChain: vi.fn(),
}));

vi.mock('../handleAppDelegation', () => ({
  handleAppDelegation: vi.fn(),
}));

vi.mock('../renderError', () => ({
  renderError: vi.fn(),
}));

vi.mock('../formatError', () => ({
  formatError: vi.fn(),
}));

describe('setupLoginButtonHandler', () => {
  const mockIILoginButton = document.createElement('button');
  const mockBackToAppButton = document.createElement('button');
  const mockDeepLink = new URL('https://example.com');
  const mockSessionId = 'test-session-id';
  const mockAppPublicKey = {} as PublicKey;
  const mockInternetIdentityURL = new URL('https://identity.ic0.app');
  const mockMiddleDelegationIdentity = {};
  const mockDelegationChain = {};
  const mockFormattedError = 'Formatted error message';
  const mockTtlMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Reset all mocks to their initial state
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  it('should handle successful login', async () => {
    // Setup mocks
    (prepareLogin as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      vi.fn().mockResolvedValue(mockMiddleDelegationIdentity),
    );
    (
      buildMiddleToAppDelegationChain as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockDelegationChain);
    (formatError as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockFormattedError,
    );

    // Execute
    await setupLoginButtonHandler({
      iiLoginButton: mockIILoginButton,
      backToAppButton: mockBackToAppButton,
      deepLink: mockDeepLink,
      sessionId: mockSessionId,
      appPublicKey: mockAppPublicKey,
      internetIdentityURL: mockInternetIdentityURL,
      ttlMs: mockTtlMs,
    });

    // Simulate click
    mockIILoginButton.click();

    // Wait for all promises to resolve
    await vi.waitFor(() => {
      expect(prepareLogin).toHaveBeenCalledWith({
        internetIdentityURL: mockInternetIdentityURL,
      });
      expect(buildMiddleToAppDelegationChain).toHaveBeenCalledWith({
        middleDelegationIdentity: mockMiddleDelegationIdentity,
        appPublicKey: mockAppPublicKey,
        expiration: expect.any(Date),
      });
      expect(handleAppDelegation).toHaveBeenCalledWith({
        deepLink: mockDeepLink,
        sessionId: mockSessionId,
        delegationChain: mockDelegationChain,
        iiLoginButton: mockIILoginButton,
        backToAppButton: mockBackToAppButton,
      });
      expect(renderError).toHaveBeenCalledWith('');
    });
  });

  it('should handle login error in click handler', async () => {
    const mockIILoginButton = document.createElement('button');
    const mockBackToAppButton = document.createElement('button');
    const mockDeepLink = new URL('app://login');
    const mockSessionId = 'test-session-id';
    const mockAppPublicKey = {} as PublicKey;
    const mockInternetIdentityURL = new URL('https://identity.ic0.app');

    // Mock prepareLogin to return a function that rejects
    vi.mocked(prepareLogin).mockResolvedValueOnce(async () => {
      throw new Error('Login failed');
    });

    // Setup the login button handler
    await setupLoginButtonHandler({
      iiLoginButton: mockIILoginButton,
      backToAppButton: mockBackToAppButton,
      deepLink: mockDeepLink,
      sessionId: mockSessionId,
      appPublicKey: mockAppPublicKey,
      internetIdentityURL: mockInternetIdentityURL,
      ttlMs: mockTtlMs,
    });

    // Trigger the click event
    mockIILoginButton.click();

    // Wait for all async operations to complete
    await vi.waitFor(() => {
      // Verify that the error was rendered
      expect(renderError).toHaveBeenCalledWith(
        formatError(ERROR_MESSAGES.LOGIN_PROCESS, new Error('Login failed')),
      );

      // Verify that buildMiddleToAppDelegationChain was not called
      expect(buildMiddleToAppDelegationChain).not.toHaveBeenCalled();

      // Verify that handleAppDelegation was not called
      expect(handleAppDelegation).not.toHaveBeenCalled();
    });
  });
});
