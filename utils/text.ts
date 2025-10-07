/**
 * Text utility functions for addresses and hashes
 */

/**
 * Trim address or hash for display purposes
 * @param {string} text - The full address or hash
 * @param {number} prefixLength - Number of characters to show at the beginning (default: 6)
 * @param {number} suffixLength - Number of characters to show at the end (default: 5)
 * @returns {string} Trimmed text with "..." in the middle
 */
export const trimText = (
  text: string,
  prefixLength: number = 6,
  suffixLength: number = 5
): string => {
  if (!text || text.length <= prefixLength + suffixLength + 3) {
    return text; // Return original if too short
  }

  return `${text.slice(0, prefixLength)}...${text.slice(-suffixLength)}`;
};

/**
 * Format proving time from seconds (as string or number) to readable format
 * @param {string | number} timeInput - Time in seconds (e.g., "455.535819" or 455.535819)
 * @returns {string} Formatted time string (e.g., "7 mins 35 secs" or "1 hr 10 mins")
 */
export const formatProvingTime = (timeInput: string | number): string => {
  if (!timeInput || timeInput === '0' || timeInput === 0) {
    return '0 secs';
  }

  // Convert to number and round to nearest second
  const totalSeconds = Math.round(typeof timeInput === 'string' ? parseFloat(timeInput) : timeInput);
  
  if (isNaN(totalSeconds) || totalSeconds < 0) {
    return 'N/A';
  }

  // Calculate hours, minutes, and seconds
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Format based on duration
  if (hours > 0) {
    if (minutes > 0) {
      return `${hours} hr ${minutes} mins`;
    }
    return `${hours} hr`;
  } else if (minutes > 0) {
    if (seconds > 0) {
      return `${minutes} mins ${seconds} secs`;
    }
    return `${minutes} mins`;
  } else {
    return `${seconds} secs`;
  }
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @param {() => void} onSuccess - Callback function on successful copy
 * @param {(error: Error) => void} onError - Callback function on copy error
 */
export const copyToClipboard = async (
  text: string,
  onSuccess?: () => void,
  onError?: (error: Error) => void
): Promise<void> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      // Use modern clipboard API
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      textArea.remove();
    }

    onSuccess?.();
  } catch (error) {
    const err = error instanceof Error ? error : new Error("Copy failed");
    onError?.(err);
    console.error("Failed to copy text:", err);
  }
};
