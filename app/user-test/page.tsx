'use client'

import { useUser, useReverification } from '@clerk/nextjs'
import { ExternalAccountResource, OAuthStrategy } from '@clerk/types'
import { useRouter } from 'next/navigation'

// Capitalize the first letter of the provider name
// E.g. 'discord' -> 'Discord'
const capitalize = (provider: string) => {
  return `${provider.slice(0, 1).toUpperCase()}${provider.slice(1)}`
}

// Remove the prefix from the provider name
// E.g. 'oauth_discord' -> 'discord'
const normalizeProvider = (provider: string) => {
  return provider.split('_')[1]
}

export default function AddAccount() {
  const router = useRouter()
  // Use Clerk's `useUser()` hook to get the current user's `User` object
  const { isLoaded, user } = useUser()
  const createExternalAccount = useReverification((params: CreateExternalAccountParams) => user?.createExternalAccount(params))
  const accountDestroy = useReverification((account: ExternalAccountResource) => account.destroy())

  // List the options the user can select when adding a new external account
  // Edit this array to include all of your enabled SSO connections
  const options: OAuthStrategy[] = ['oauth_discord', 'oauth_google', 'oauth_github']

  // Handle adding the new external account
  const addSSO = async (strategy: OAuthStrategy) => {
    await createExternalAccount({
        strategy,
        redirectUrl: '/account/manage-external-accounts',
      })
      .then((res) => {
        if (res?.verification?.externalVerificationRedirectURL) {
          router.push(res.verification.externalVerificationRedirectURL.href)
        }
      })
      .catch((err) => {
        console.log('ERROR', err)
      })
      .finally(() => {
        console.log('Redirected user to oauth provider')
      })
  }

  // Show a loading message until Clerk loads
  if (!isLoaded) return <p>Loading...</p>

  // Find the external accounts from the options array that the user has not yet added to their account
  // This prevents showing an 'add' button for existing external account types
  const unconnectedOptions = options.filter(
    (option) =>
      !user?.externalAccounts.some((account) => account.provider === normalizeProvider(option)),
  )

  return (
    <>
      <div>
        <p>Connected accounts</p>
        {user?.externalAccounts.map((account) => {
          return (
            <ul key={account.id}>
              <li>Provider: {capitalize(account.provider)}</li>
              <li>Scopes: {account.approvedScopes}</li>
              <li>
                Status:{' '}
                {/* This example uses the `longMessage` returned by the API. You can use account.verification.error.code to determine the error and then provide your own message to the user. */}
                {account.verification?.status === 'verified'
                  ? capitalize(account.verification?.status)
                  : account.verification?.error?.longMessage}
              </li>
              {account.verification?.status !== 'verified' &&
                account.verification?.externalVerificationRedirectURL && (
                  <li>
                    <a href={account.verification?.externalVerificationRedirectURL?.href}>
                      Reverify {capitalize(account.provider)}
                    </a>
                  </li>
                )}
              <li>
                <button onClick={() => accountDestroy(account)}>
                  Remove {capitalize(account.provider)}
                </button>
              </li>
            </ul>
          )
        })}
      </div>
      {unconnectedOptions.length > 0 && (
        <div>
          <p>Add a new external account</p>
          <ul>
            {unconnectedOptions.map((strategy) => {
              return (
                <li key={strategy}>
                  <button onClick={() => addSSO(strategy)}>
                    Add {capitalize(normalizeProvider(strategy))}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </>
  )
}
