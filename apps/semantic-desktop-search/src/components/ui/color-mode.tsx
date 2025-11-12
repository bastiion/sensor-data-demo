import type { ReactNode } from "react"
import { ThemeProvider, useTheme } from "next-themes"
import { useEffect } from "react"

export interface ColorModeProviderProps {
  children: ReactNode
}

export function ColorModeProvider({ children }: ColorModeProviderProps) {
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange>
      <ColorModeSync />
      {children}
    </ThemeProvider>
  )
}

function ColorModeSync() {
  const { theme } = useTheme()
  
  useEffect(() => {
    if (theme) {
      document.documentElement.dataset.theme = theme
      document.documentElement.style.colorScheme = theme
    }
  }, [theme])

  return null
}

