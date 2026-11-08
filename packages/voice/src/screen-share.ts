/**
 * COLLABO — Screen Share Acquisition & Track Management
 * Manages WebRTC display media capture, stream lifecycle, track termination,
 * and offline simulation for unit testing and headless environments.
 */

export interface ScreenShareOptions {
  audio?: boolean;
  video?: boolean | Record<string, unknown>;
  onEnded?: () => void;
}

export interface ScreenShareStatus {
  isSharing: boolean;
  streamId?: string;
  hasAudio: boolean;
  error?: string | null;
}

export class ScreenShareController {
  private activeStream: unknown | null = null;
  private isSharingActive: boolean = false;
  private onEndedCallback?: () => void;

  /**
   * Checks whether the current environment supports navigator.mediaDevices.getDisplayMedia.
   */
  static isSupported(): boolean {
    return (
      typeof navigator !== "undefined" &&
      typeof navigator.mediaDevices !== "undefined" &&
      typeof navigator.mediaDevices.getDisplayMedia === "function"
    );
  }

  /**
   * Requests a screen share MediaStream from the browser's display media engine.
   * If running in a mock/non-browser environment, returns a simulated stream handle.
   */
  async startScreenShare(options?: ScreenShareOptions): Promise<ScreenShareStatus> {
    this.onEndedCallback = options?.onEnded;

    if (!ScreenShareController.isSupported()) {
      // Offline / headless simulation fallback
      this.isSharingActive = true;
      const mockStreamId = `mock-stream-${Math.random().toString(36).slice(2, 9)}`;
      this.activeStream = { id: mockStreamId, active: true };

      return {
        isSharing: true,
        streamId: mockStreamId,
        hasAudio: options?.audio ?? false,
        error: null,
      };
    }

    try {
      const displayMediaOptions: DisplayMediaStreamOptions = {
        video: options?.video ?? {
          displaySurface: "monitor",
          frameRate: { ideal: 30, max: 60 },
        },
        audio: options?.audio ?? true,
      };

      const stream = await navigator.mediaDevices.getDisplayMedia(
        displayMediaOptions
      );
      this.activeStream = stream;
      this.isSharingActive = true;

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        // Register browser-native 'Stop Sharing' floating bar listener
        videoTrack.onended = () => {
          this.stopScreenShare();
        };
      }

      const hasAudio = stream.getAudioTracks().length > 0;

      return {
        isSharing: true,
        streamId: stream.id,
        hasAudio,
        error: null,
      };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to acquire screen share media";
      this.isSharingActive = false;
      this.activeStream = null;

      return {
        isSharing: false,
        hasAudio: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Stops all active tracks on the screen share stream and triggers cleanup callbacks.
   */
  stopScreenShare(): ScreenShareStatus {
    if (this.activeStream && typeof (this.activeStream as { getTracks?: () => { stop: () => void }[] }).getTracks === "function") {
      const stream = this.activeStream as { getTracks: () => { stop: () => void }[] };
      for (const track of stream.getTracks()) {
        try {
          track.stop();
        } catch {
          // Ignore track stop errors
        }
      }
    }

    this.activeStream = null;
    this.isSharingActive = false;

    if (this.onEndedCallback) {
      try {
        this.onEndedCallback();
      } catch {
        // Suppress callback exceptions
      }
    }

    return {
      isSharing: false,
      hasAudio: false,
      error: null,
    };
  }

  /**
   * Returns current sharing state and active stream if mounted.
   */
  getStatus(): ScreenShareStatus {
    return {
      isSharing: this.isSharingActive,
      streamId: (this.activeStream as { id?: string })?.id,
      hasAudio: false,
      error: null,
    };
  }
}

