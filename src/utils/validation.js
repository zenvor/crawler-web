/**
 * Validates if a string is a valid URL
 * @param {string} url - The URL string to validate
 * @returns {boolean} True if the URL is valid, false otherwise
 */
export function isValidUrl(url) {
  if (!url || typeof url !== 'string') {
    return false
  }

  try {
    const urlObj = new URL(url)
    // Only allow http and https protocols
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch (error) {
    return false
  }
}

/**
 * Validates and normalizes a URL
 * @param {string} url - The URL string to validate and normalize
 * @returns {{valid: boolean, url?: string, error?: string}} Validation result
 */
export function validateUrl(url) {
  if (!url || typeof url !== 'string') {
    return {
      valid: false,
      error: 'URL is required',
    }
  }

  const trimmedUrl = url.trim()

  if (trimmedUrl.length === 0) {
    return {
      valid: false,
      error: 'URL cannot be empty',
    }
  }

  // Add protocol if missing
  let normalizedUrl = trimmedUrl
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = `https://${normalizedUrl}`
  }

  try {
    const urlObj = new URL(normalizedUrl)

    // Only allow http and https protocols
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return {
        valid: false,
        error: 'Only HTTP and HTTPS protocols are supported',
      }
    }

    // Check for valid hostname
    if (!urlObj.hostname || urlObj.hostname.length === 0) {
      return {
        valid: false,
        error: 'Invalid hostname',
      }
    }

    return {
      valid: true,
      url: normalizedUrl,
    }
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid URL format',
    }
  }
}
