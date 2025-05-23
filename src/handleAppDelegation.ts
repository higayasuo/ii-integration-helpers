import { DelegationChain } from '@dfinity/identity';
import { buildURIFragment } from './buildURIFragment';

/**
 * Parameters for handling app delegation
 */
export type HandleAppDelegationParams = {
  /** The deep link to redirect to after processing the delegation */
  deepLink: URL;
  /** The delegation chain to use */
  delegationChain: DelegationChain;
  /** The session ID to include in the URI fragment */
  sessionId: string;
  /** The II login button element */
  iiLoginButton: HTMLElement;
  /** The back to app button element */
  backToAppButton: HTMLElement;
};

/**
 * Handles delegation in a web or native app environment by setting up UI elements and redirecting.
 *
 * @param {HandleAppDelegationParams} params - The parameters for handling app delegation
 */
export const handleAppDelegation = ({
  deepLink,
  delegationChain,
  sessionId,
  iiLoginButton,
  backToAppButton,
}: HandleAppDelegationParams): void => {
  const uriFragment = buildURIFragment({
    delegationChain,
    sessionId,
  });
  // Hide the II login button and show the Back to App button
  iiLoginButton.style.display = 'none';
  backToAppButton.style.display = 'block';

  // Add click event listener to the Back to App button
  backToAppButton.addEventListener('click', () => {
    // Add loading effect
    backToAppButton.textContent = 'Processing...';
    backToAppButton.style.opacity = '0.7';
    backToAppButton.style.cursor = 'wait';

    window.open(`${deepLink.toString()}#${uriFragment}`, '_self');
  });
};
