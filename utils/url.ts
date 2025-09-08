/**
 * Utility functions for URL parameter handling
 */

/**
 * Checks if the current URL has the specified search parameter with the given value
 * @param paramName - The name of the URL parameter to check
 * @param expectedValue - The expected value of the parameter
 * @returns boolean - true if the parameter exists and matches the expected value
 */
export const hasUrlParam = (paramName: string, expectedValue: string): boolean => {
  if (typeof window === 'undefined') {
    return false; // Return false during SSR
  }
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(paramName) === expectedValue;
};

/**
 * Checks if the source parameter is set to 'playground_app'
 * @returns boolean - true if source=playground_app
 */
export const isPlaygroundAppSource = (): boolean => {
  return hasUrlParam('source', 'playground_app');
};

/**
 * Gets the value of a specific URL parameter
 * @param paramName - The name of the URL parameter to get
 * @returns string | null - The parameter value or null if not found
 */
export const getUrlParam = (paramName: string): string | null => {
  if (typeof window === 'undefined') {
    return null; // Return null during SSR
  }
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(paramName);
};
