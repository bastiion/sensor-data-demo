import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { ColorModeProvider } from '@/components/ui/color-mode'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { store } from '@/store'
import { ViewRegistry } from '@/views/ViewRegistry'
import { SearchFAB } from '@/components/SearchFAB'
import MosaicView from './pages/MosaicView.tsx'
import './index.css'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider value={defaultSystem}>
          <ColorModeProvider>
            <ViewRegistry>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<MosaicView />} />
                </Routes>
                <SearchFAB />
              </BrowserRouter>
            </ViewRegistry>
          </ColorModeProvider>
        </ChakraProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Provider>
  </StrictMode>
)
