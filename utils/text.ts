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
