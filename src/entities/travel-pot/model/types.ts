export interface PotMember {
  id: string
  nickname: string
  profileImageUrl: string | null
}

export interface TravelPot {
  id: string
  name: string
  inviteCode: string
  members: Array<PotMember>
}
