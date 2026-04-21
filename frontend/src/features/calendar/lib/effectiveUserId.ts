export const DUMMY_USER_ID = '11111111-1111-1111-1111-111111111111'

export function getEffectiveUserId(): string {
  const envValue = process.env.NEXT_PUBLIC_CURRENT_USER_ID
  if (typeof envValue === 'string' && envValue.trim().length > 0) {
    return envValue.trim()
  }
  return DUMMY_USER_ID
}

