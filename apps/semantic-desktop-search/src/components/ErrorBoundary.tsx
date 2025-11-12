import React, { Component, ReactNode } from 'react'
import { Box, Text, VStack } from '@chakra-ui/react'
import { Button } from '@/components/ui/button'
import { LuX, LuRefreshCw } from 'react-icons/lu'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Box
          height="100%"
          width="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="bg"
          padding={8}
        >
          <VStack gap={4} maxWidth="500px">
            <Box color="red.500">
              <LuX size={48} />
            </Box>
            <Text fontSize="xl" fontWeight="bold">
              Something went wrong
            </Text>
            <Text fontSize="sm" color="fg.muted" textAlign="center">
              {this.state.error?.message || 'An error occurred while rendering this view'}
            </Text>
            <Button 
              onClick={this.handleReset} 
              variant="solid" 
              bg="blue.500"
              color="white"
              _hover={{ bg: 'blue.600' }}
            >
              <LuRefreshCw size={16} style={{ marginRight: '8px' }} />
              Reload View
            </Button>
          </VStack>
        </Box>
      )
    }

    return this.props.children
  }
}

