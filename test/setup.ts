// Test setup for HUD Forge quality testing
import { afterEach, beforeEach } from 'vitest'

// Global test setup
beforeEach(() => {
  // Reset any global state before each test
})

afterEach(() => {
  // Clean up after each test
})

// Mock environment variables for testing
process.env.REPLICATE_API_TOKEN = 'test-token'
process.env.REPLICATE_MODEL = 'black-forest-labs/flux-schnell'