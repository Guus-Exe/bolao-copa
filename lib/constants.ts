export const SCORING_RULES = {
  EXACT_SCORE: 3,
  CORRECT_WINNER: 1,
  WRONG: 0
} as const

export const GAME_STAGES = [
  "grupo",
  "oitavas",
  "quartas",
  "semi",
  "final"
] as const

export const PREDICTION_DEADLINE_HOURS = 1

export type GameStage = (typeof GAME_STAGES)[number]

/** Mapeamento de nome de país (em inglês) para emoji de bandeira. */
export const COUNTRY_FLAGS: Record<string, string> = {
  "Morocco": "🇲🇦", "USA": "🇺🇸", "United States": "🇺🇸", "Mexico": "🇲🇽", "Canada": "🇨🇦",
  "Brazil": "🇧🇷", "Argentina": "🇦🇷", "France": "🇫🇷", "England": "🇬🇧", "Spain": "🇪🇸",
  "Germany": "🇩🇪", "Portugal": "🇵🇹", "Netherlands": "🇳🇱", "Belgium": "🇧🇪", "Italy": "🇮🇹",
  "Croatia": "🇭🇷", "Uruguay": "🇺🇾", "Colombia": "🇨🇴", "Japan": "🇯🇵", "South Korea": "🇰🇷",
  "Korea Republic": "🇰🇷", "Australia": "🇦🇺", "Saudi Arabia": "🇸🇦", "Iran": "🇮🇷",
  "Qatar": "🇶🇦", "Ecuador": "🇪🇨", "Senegal": "🇸🇳", "Ghana": "🇬🇭", "Cameroon": "🇨🇲",
  "Nigeria": "🇳🇬", "Tunisia": "🇹🇳", "Egypt": "🇪🇬", "Algeria": "🇩🇿", "Ivory Coast": "🇨🇮",
  "Cote D'Ivoire": "🇨🇮", "Serbia": "🇷🇸", "Switzerland": "🇨🇭", "Denmark": "🇩🇰", "Poland": "🇵🇱",
  "Wales": "🏴󠁧󠁢󠁷󠁬󠁳󠁿", "Sweden": "🇸🇪", "Austria": "🇦🇹", "Czech Republic": "🇨🇿", "Turkey": "🇹🇷",
  "Ukraine": "🇺🇦", "Scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "Costa Rica": "🇨🇷", "Paraguay": "🇵🇾", "Chile": "🇨🇱",
  "Peru": "🇵🇪", "Venezuela": "🇻🇪", "Bolivia": "🇧🇴", "Honduras": "🇭🇳", "Panama": "🇵🇦",
  "Jamaica": "🇯🇲", "Trinidad And Tobago": "🇹🇹", "China": "🇨🇳", "Indonesia": "🇮🇩",
  "India": "🇮🇳", "New Zealand": "🇳🇿", "Uzbekistan": "🇺🇿", "Iraq": "🇮🇶", "Jordan": "🇯🇴",
  "Palestine": "🇵🇸", "Bahrain": "🇧🇭", "Oman": "🇴🇲", "North Macedonia": "🇲🇰", "Iceland": "🇮🇸",
  "Norway": "🇳🇴", "Romania": "🇷🇴", "Hungary": "🇭🇺", "Slovakia": "🇸🇰", "Slovenia": "🇸🇮",
  "Georgia": "🇬🇪", "Finland": "🇫🇮", "Albania": "🇦🇱", "Montenegro": "🇲🇪",
  "Bosnia and Herzegovina": "🇧🇦", "Russia": "🇷🇺", "Ireland": "🇮🇪",
  "Republic of Ireland": "🇮🇪", "Greece": "🇬🇷", "DR Congo": "🇨🇩", "Mali": "🇲🇱",
  "Burkina Faso": "🇧🇫", "Zambia": "🇿🇲", "Tanzania": "🇹🇿", "Uganda": "🇺🇬", "Kenya": "🇰🇪",
  "South Africa": "🇿🇦", "Congo": "🇨🇬", "Mozambique": "🇲🇿", "Sudan": "🇸🇩", "Comoros": "🇰🇲",
  "Benin": "🇧🇯", "Cape Verde": "🇨🇻", "Gabon": "🇬🇦", "Guatemala": "🇬🇹", "El Salvador": "🇸🇻",
  "Cuba": "🇨🇺", "Haiti": "🇭🇹", "Suriname": "🇸🇷", "Curacao": "🇨🇼", "Guyana": "🇬🇾",
  "Thailand": "🇹🇭", "Vietnam": "🇻🇳", "Philippines": "🇵🇭", "Malaysia": "🇲🇾", "Myanmar": "🇲🇲",
  "Tajikistan": "🇹🇯", "Kyrgyzstan": "🇰🇬", "Turkmenistan": "🇹🇲", "North Korea": "🇰🇵",
  "Lebanon": "🇱🇧", "Syria": "🇸🇾", "Yemen": "🇾🇪", "Afghanistan": "🇦🇫", "Kuwait": "🇰🇼",
  "United Arab Emirates": "🇦🇪", "Fiji": "🇫🇯", "Papua New Guinea": "🇵🇬",
  "Solomon Islands": "🇸🇧", "Tahiti": "🇵🇫", "New Caledonia": "🇳🇨", "Samoa": "🇼🇸",
  "Tonga": "🇹🇴", "Vanuatu": "🇻🇺",
}
