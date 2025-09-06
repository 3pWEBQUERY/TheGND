export type EscortItem = {
  id: string
  name: string | null
  city: string | null
  country: string | null
  image: string | null
  visibility?: 'PUBLIC' | 'VERIFIED' | 'PRIVATE'
  isVerified?: boolean
  isAgeVerified?: boolean
  // Optional highlight flags for homepage badges
  isEscortOfWeek?: boolean
  isEscortOfMonth?: boolean
  badges?: string[]
}

export type EscortFilters = {
  height?: string
  weight?: string
  breastType?: string
  breastSize?: string
  eyeColor?: string
  hairColor?: string
  hairLength?: string
  clothingStyle?: string
  clothingSize?: string
}
