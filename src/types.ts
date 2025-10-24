export type CardTier = 'basic' | 'gold'

export type LoyaltyCardProps = {
  colorFrom: string
  colorTo: string
  backgroundImageUrl?: string
  tierLabel: string
  name: string
  pointsLabel: string
  cardNumber: string
  holderLabel: string
  selected?: boolean
  onClick?: () => void
  avatarUrl?: string
  hideChoose?: boolean
}


export type FormValues = {
  name: string
  phone: string
  email: string
  birthday: string
  photoFile: File | null
}

export type FormErrors = {
  name?: string
  phone?: string
  email?: string
  birthday?: string
  photoFile?: string
}


export type Coupon = {
  image: string
  name: string
}

export type CreateMembershipResponse = {
  data: {
    cardImage: string
    tierId: number
    totalCoupons: number
    serial: string
    coupons: Coupon[]
    name: string
    tierTitle: string
    profileImage: string
    isEligibleForCoupon: boolean
    point: number
  }
  message: string
  status: string
}

