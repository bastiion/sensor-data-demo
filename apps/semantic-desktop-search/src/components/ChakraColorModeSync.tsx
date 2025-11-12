import { useEffect } from 'react'
import { useTheme } from 'next-themes'

/**
 * Syncs next-themes with Chakra UI's color mode system
 * Applies the correct CSS classes and data attributes
 */
export function ChakraColorModeSync() {
  const { theme, systemTheme } = useTheme()
  
  useEffect(() => {
    const resolvedTheme = theme === 'system' ? systemTheme : theme
    
    if (resolvedTheme) {
      // Set data-theme attribute for our custom CSS
      document.documentElement.dataset.theme = resolvedTheme
      
      // Set color-scheme for browser defaults
      document.documentElement.style.colorScheme = resolvedTheme
      
      // Set Chakra UI class
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(resolvedTheme)
      
      // Update Chakra's data-theme for its internal CSS variables
      document.documentElement.setAttribute('data-theme', resolvedTheme)
    }
  }, [theme, systemTheme])

  return null
}

