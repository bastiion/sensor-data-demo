import { Link, useLocation } from 'react-router-dom'
import { Box, HStack } from '@chakra-ui/react'
import { useTheme } from 'next-themes'
import { LuSun, LuMoon } from 'react-icons/lu'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

/**
 * Navigation component to switch between different views
 */
export const Navigation = () => {
  const location = useLocation()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const links = [
    { path: '/', label: 'Mosaic View' },
    { path: '/simple', label: 'Simple View' },
    { path: '/test/meilisearch', label: 'Test' },
  ]

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <Box
      position="fixed"
      top={4}
      right={4}
      zIndex={1000}
      bg="bg.panel"
      borderRadius="md"
      boxShadow="md"
      padding={2}
      borderWidth="1px"
      borderColor="border"
    >
      <HStack gap={2}>
        {links.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: location.pathname === path ? 'bold' : 'normal',
              backgroundColor: location.pathname === path ? 'var(--chakra-colors-gray-200)' : 'transparent',
              color: 'var(--chakra-colors-fg)',
              transition: 'background-color 0.2s',
            }}
          >
            {label}
          </Link>
        ))}
        {mounted && (
          <Button
            onClick={toggleTheme}
            size="sm"
            variant="ghost"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <LuSun size={18} /> : <LuMoon size={18} />}
          </Button>
        )}
      </HStack>
    </Box>
  )
}

