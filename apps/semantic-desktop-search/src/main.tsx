import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { ColorModeProvider } from '@/components/ui/color-mode'
import { store } from '@/store'
import { ViewRegistry } from '@/views/ViewRegistry'
import { SearchFAB } from '@/components/SearchFAB'
import MosaicView from './pages/MosaicView.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
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
    </Provider>
  </StrictMode>
)
