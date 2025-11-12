import React, { Component, ReactNode } from 'react'
import { Box, Text, VStack } from '@chakra-ui/react'
import { Button } from '@/components/ui/button'
import { LuX } from 'react-icons/lu'

interface Props {
  children: ReactNode
  fallback?: ReactNode
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
            <Button onClick={this.handleReset} variant="solid" colorScheme="blue">
              Try Again
            </Button>
          </VStack>
        </Box>
      )
    }

    return this.props.children
  }
}

