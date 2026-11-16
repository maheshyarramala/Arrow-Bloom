/**
 * Arrow Bloom - Google AdMob Rewarded Video Ads Service (@capacitor-community/admob)
 * Initializes AdMob on native platforms, handles UMP consent, preloads Rewarded Hint ads,
 * verifies completion via RewardAdPluginEvents.Rewarded, and provides clean web fallback.
 */
import { Capacitor, type PluginListenerHandle } from '@capacitor/core';
import {
  AdMob,
  AdmobConsentStatus,
  RewardAdPluginEvents,
  type AdMobError,
  type RewardAdOptions,
} from '@capacitor-community/admob';

// Google's official Android test Rewarded Video Ad Unit ID.
// Swap via VITE_ADMOB_REWARDED_HINT_ID in your .env or replace the fallback string below for production.
export const TEST_ANDROID_REWARDED_HINT_AD_UNIT_ID = 'ca-app-pub-3940256099942544/5224354917';
export const REWARDED_HINT_AD_UNIT_ID =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMOB_REWARDED_HINT_ID) ||
  TEST_ANDROID_REWARDED_HINT_AD_UNIT_ID;

const IS_TEST_AD_UNIT = REWARDED_HINT_AD_UNIT_ID === TEST_ANDROID_REWARDED_HINT_AD_UNIT_ID;

export interface ShowRewardedAdCallbacks {
  onAdOpened?: () => void;
  onAdClosed?: () => void;
}

export interface RewardedAdResult {
  rewarded: boolean;
  unavailableOnWeb?: boolean;
  errorMessage?: string;
}

let initializePromise: Promise<boolean> | null = null;
let preloadPromise: Promise<boolean> | null = null;
let isAdReady = false;
let isShowingAd = false;
let lastLoadError: string | null = null;

function formatAdErrorMessage(error?: Partial<AdMobError> | unknown, fallback = 'Ad is unavailable right now. Please try again shortly.'): string {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return 'You appear to be offline. Connect to the internet to watch a hint ad.';
  }
  const msg =
    error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string'
      ? (error as { message: string }).message
      : '';
  const code =
    error && typeof error === 'object' && 'code' in error && typeof (error as { code?: unknown }).code === 'number'
      ? (error as { code: number }).code
      : undefined;

  const lower = msg.toLowerCase();
  if (lower.includes('network') || code === 2) {
    return 'Network error loading video ad. Check your connection and try again.';
  }
  if (lower.includes('no fill') || lower.includes('no ad') || code === 3) {
    return 'No video ads available right now. Please try again in a moment.';
  }
  return fallback;
}

/**
 * Initializes Google AdMob and checks UMP consent on native Capacitor platforms.
 * Safe no-op in desktop/mobile web browsers.
 */
export async function initializeAdMob(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }

  if (initializePromise) {
    return initializePromise;
  }

  initializePromise = (async () => {
    try {
      await AdMob.initialize({
        initializeForTesting: IS_TEST_AD_UNIT,
      });

      // Request User Messaging Platform (UMP) consent status and show form if required (EEA/UK GDPR)
      try {
        const consentInfo = await AdMob.requestConsentInfo();
        if (
          consentInfo.isConsentFormAvailable &&
          consentInfo.status === AdmobConsentStatus.REQUIRED
        ) {
          await AdMob.showConsentForm();
        }
      } catch {
        // Consent form may not be configured in AdMob console yet; proceed safely
      }

      // Preload the first rewarded hint ad immediately in the background
      void preloadRewardedHintAd();
      return true;
    } catch (err) {
      lastLoadError = formatAdErrorMessage(err, 'Could not initialize video ads.');
      initializePromise = null;
      return false;
    }
  })();

  return initializePromise;
}

/**
 * Preloads the next Rewarded Video Ad in the background for zero-wait playback.
 */
export async function preloadRewardedHintAd(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  if (isAdReady) return true;
  if (preloadPromise) return preloadPromise;

  preloadPromise = (async () => {
    const initialized = await initializeAdMob();
    if (!initialized) return false;

    const handles: PluginListenerHandle[] = [];
    try {
      lastLoadError = null;
      const loadedHandle = await AdMob.addListener(RewardAdPluginEvents.Loaded, () => {
        isAdReady = true;
      });
      const failedHandle = await AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (err) => {
        isAdReady = false;
        lastLoadError = formatAdErrorMessage(err);
      });
      handles.push(loadedHandle, failedHandle);

      const options: RewardAdOptions = {
        adId: REWARDED_HINT_AD_UNIT_ID,
        isTesting: IS_TEST_AD_UNIT,
      };
      await AdMob.prepareRewardVideoAd(options);
      isAdReady = true;
      return true;
    } catch (err) {
      isAdReady = false;
      lastLoadError = formatAdErrorMessage(err);
      return false;
    } finally {
      for (const handle of handles) {
        try {
          await handle.remove();
        } catch {
          // Ignore listener cleanup errors
        }
      }
      preloadPromise = null;
    }
  })();

  return preloadPromise;
}

/**
 * Displays a preloaded AdMob Rewarded Video Ad for +1 Hint.
 * Grants reward ONLY when RewardAdPluginEvents.Rewarded fires (never on early close or error).
 * Immediately preloads the next rewarded ad when dismissed or failed.
 */
export async function showRewardedHintAd(
  callbacks?: ShowRewardedAdCallbacks
): Promise<RewardedAdResult> {
  if (!Capacitor.isNativePlatform()) {
    return {
      rewarded: false,
      unavailableOnWeb: true,
      errorMessage: 'Available in mobile app',
    };
  }

  if (isShowingAd) {
    return { rewarded: false };
  }

  const ready = isAdReady || (await preloadRewardedHintAd());
  if (!ready) {
    return {
      rewarded: false,
      errorMessage: lastLoadError || formatAdErrorMessage(undefined),
    };
  }

  isShowingAd = true;
  let rewardEarned = false;
  let audioPaused = false;
  let settled = false;
  const handles: PluginListenerHandle[] = [];

  const cleanupListeners = async () => {
    for (const handle of handles) {
      try {
        await handle.remove();
      } catch {
        // Ignore cleanup errors
      }
    }
    handles.length = 0;
  };

  return new Promise<RewardedAdResult>((resolve) => {
    const finish = async (result: RewardedAdResult) => {
      if (settled) return;
      settled = true;
      isShowingAd = false;
      isAdReady = false;
      await cleanupListeners();
      if (audioPaused) {
        callbacks?.onAdClosed?.();
      }
      // Preload next ad immediately so subsequent hints have zero wait
      void preloadRewardedHintAd();
      resolve(result);
    };

    const run = async () => {
      try {
        handles.push(
          await AdMob.addListener(RewardAdPluginEvents.Showed, () => {
            if (!audioPaused) {
              audioPaused = true;
              callbacks?.onAdOpened?.();
            }
          }),
          await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
            rewardEarned = true;
          }),
          await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
            void finish({
              rewarded: rewardEarned,
              errorMessage: rewardEarned
                ? undefined
                : 'Watch the full video to earn +1 Hint.',
            });
          }),
          await AdMob.addListener(RewardAdPluginEvents.FailedToShow, (err) => {
            void finish({
              rewarded: false,
              errorMessage: formatAdErrorMessage(err, 'Unable to display video ad. Please try again.'),
            });
          })
        );

        if (!audioPaused) {
          audioPaused = true;
          callbacks?.onAdOpened?.();
        }

        await AdMob.showRewardVideoAd();
      } catch (err) {
        void finish({
          rewarded: false,
          errorMessage: formatAdErrorMessage(err, 'Failed to load video ad. Please try again.'),
        });
      }
    };

    void run();
  });
}
