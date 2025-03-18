'use server'

import { RatelimitError } from '@/lib/error'
import { auth, reverificationError } from '@clerk/nextjs/server'
import { ReverificationConfig } from '@clerk/types'

export const getBalance = async () => {
  const { has } = await auth.protect()

  const reverificationConfig: ReverificationConfig = {
    afterMinutes: 10,
    level: 'first_factor',
  }

  // Check if the user has *not* verified their credentials within the past 10 minutes.
  const shouldUserRevalidate = !has({ reverification: reverificationConfig })

  // If the user hasn't reverified, return an error with the matching configuration (e.g., `strict`)
  if (shouldUserRevalidate) {
    return reverificationError(reverificationConfig)
  }

  if (Math.random() < 0.5) {
    throw new RatelimitError()
  }

  return {
    amount: 147467813.66,
    currency: 'USD',
  }
}
