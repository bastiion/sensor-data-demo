import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { ColorModeProvider } from '@/components/ui/color-mode'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import './index.css'
import App from './App.tsx'
import MosaicView from './pages/MosaicView.tsx'
import MeilisearchTest from './MeilisearchTest.tsx'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={defaultSystem}>
        <ColorModeProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<MosaicView />} />
              <Route path="/simple" element={<App />} />
              <Route path="/test/meilisearch" element={<MeilisearchTest />} />
            </Routes>
          </BrowserRouter>
        </ColorModeProvider>
      </ChakraProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
)
