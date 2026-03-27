export type SignupRequest = {
  email: string
  password: string
  display_name: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type UserResponse = {
  id: string
  email: string
  display_name: string
  created_at: string
}
