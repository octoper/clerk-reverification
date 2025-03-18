'use server'

import { auth, reverificationError } from '@clerk/nextjs/server'
import { ReverificationConfig } from '@clerk/types'

export const getBalance = async () => {
  const { has } = await auth.protect()

  const reverificationConfig: ReverificationConfig = {
    afterMinutes: 5,
    level: 'first_factor',
  }

  // Check if the user has *not* verified their credentials within the past 10 minutes.
  const shouldUserRevalidate = !has({ reverification: reverificationConfig })

  // If the user hasn't reverified, return an error with the matching configuration (e.g., `strict`)
  if (shouldUserRevalidate) {
    return reverificationError(reverificationConfig)
  }

  return {
    amount: Math.random() * 100,
    currency: 'USD',
  }
}
