export type EscortItem = {
  id: string
  name: string | null
  city: string | null
  country: string | null
  image: string | null
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
