// Site
export const SITE_NAME        = 'IIT NEET'
export const SITE_DOMAIN      = 'iitneet.in'
export const SITE_TAGLINE     = "India's #1 Platform for NEET & JEE Preparation"
export const SITE_SUBTITLE    = "Where Toppers Practice Daily 🔥"
export const SITE_DESCRIPTION = "Practice MCQs, attempt mock tests, and crack NEET & JEE with India's most trusted test series platform."

// Support
export const SUPPORT_WHATSAPP = '+919876543210'
export const SUPPORT_EMAIL    = 'support@iitneet.in'

// Auth
export const COOKIE_NAME      = 'iitneet_token'
export const OTP_HARDCODED    = '123456'
export const JWT_EXPIRY       = '7d'

// Payment
export const RAZORPAY_NAME    = 'IIT NEET'
export const RAZORPAY_COLOR   = '#0D9488'

// Free limits
export const FREE_VIDEO_SOLUTIONS = false  // video solutions require purchase
export const FREE_ALL_INDIA_RANK  = false  // rank requires purchase
export const FREE_CHAPTER_ANALYSIS = false // chapter analysis requires purchase

// Tab switch
export const MAX_TAB_SWITCHES = 3

// OTP
export const OTP_RESEND_SECONDS = 20
export const OTP_EXPIRY_MINUTES = 5

// Toppers - hardcoded
export const TOPPERS = [
  { name: 'Mrinal K.',  air: 4,  exam: 'NEET 2025', mcq: 158000, score: '715/720', college: 'AIIMS Delhi' },
  { name: 'Aarav A.',   air: 10, exam: 'NEET 2025', mcq: 11000,  score: '712/720', college: 'AIIMS Mumbai' },
  { name: 'Rachit C.',  air: 16, exam: 'NEET 2025', mcq: 22000,  score: '710/720', college: 'AIIMS Jodhpur' },
  { name: 'Umaid K.',   air: 21, exam: 'NEET 2025', mcq: 32000,  score: '709/720', college: 'AIIMS Bhopal' },
  { name: 'Priya S.',   air: 35, exam: 'NEET 2025', mcq: 45000,  score: '707/720', college: 'AIIMS Delhi' },
  { name: 'Rahul M.',   air: 8,  exam: 'JEE 2025',  mcq: 28000,  score: '340/360', college: 'IIT Bombay' },
  { name: 'Ananya R.',  air: 15, exam: 'JEE 2025',  mcq: 19000,  score: '336/360', college: 'IIT Delhi' },
  { name: 'Vikram P.',  air: 22, exam: 'JEE 2025',  mcq: 35000,  score: '333/360', college: 'IIT Madras' },
]

// Platform stats - hardcoded
export const PLATFORM_STATS = [
  { label: 'Daily Visitors',     value: '45,000+',   icon: '👥' },
  { label: 'Questions Practiced', value: '8 Lakh+',  icon: '📝' },
  { label: 'Tests Generated',    value: '18 Lakh+',  icon: '📋' },
  { label: 'Toppers Selected',   value: '7,000+',    icon: '🏆' },
]

// Key features - hardcoded
export const KEY_FEATURES = [
  {
    icon: '🎥',
    title: 'Video Solutions',
    desc: 'Every question explained by expert teachers with step-by-step video solutions',
    color: '#EFF6FF',
    iconBg: '#DBEAFE',
  },
  {
    icon: '🏆',
    title: 'All India Rank',
    desc: 'Know exactly where you stand among lakhs of NEET & JEE aspirants across India',
    color: '#FFF7ED',
    iconBg: '#FED7AA',
  },
  {
    icon: '🎯',
    title: 'Custom Tests',
    desc: 'Build your own test from any subject, chapter or topic in seconds',
    color: '#F0FDF4',
    iconBg: '#BBF7D0',
  },
  {
    icon: '📊',
    title: 'Smart Analytics',
    desc: 'Identify weak chapters and track improvement with detailed performance insights',
    color: '#F5F3FF',
    iconBg: '#DDD6FE',
  },
  {
    icon: '🛡️',
    title: 'Exam Environment',
    desc: 'CBT interface exactly like NTA — tab switch detection, auto submit, real exam feel',
    color: '#FFF0F0',
    iconBg: '#FECACA',
  },
  {
    icon: '📅',
    title: 'Crash Courses',
    desc: '30/60/90 day structured courses with daily tests, PDF notes and video lectures',
    color: '#FFFBEB',
    iconBg: '#FDE68A',
  },
]

// Media coverage - hardcoded
export const MEDIA_COVERAGE = [
  { name: 'Times of India',   logo: '/media/toi.png' },
  { name: 'Hindustan Times',  logo: '/media/ht.png' },
  { name: 'NDTV',             logo: '/media/ndtv.png' },
  { name: 'The Hindu',        logo: '/media/hindu.png' },
  { name: 'India Today',      logo: '/media/indiatoday.png' },
]

// Nav links
export const NAV_LINKS = [
  { label: 'Browse Tests', href: '/browse' },
  { label: 'Courses',      href: '/courses' },
  { label: 'Blog',         href: '/blog' },
]

// Exam colors
export const EXAM_COLORS = {
  'NEET UG':       { bg: '#FFF0F9', text: '#9D174D', border: '#FBCFE8' },
  'JEE Main':      { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE' },
  'JEE Advanced':  { bg: '#F5F3FF', text: '#5B21B6', border: '#DDD6FE' },
  'EAMCET AP':     { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' },
  'EAMCET TS':     { bg: '#F0FDFA', text: '#0F766E', border: '#99F6E4' },
  'Class 11':      { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A' },
  'Class 12':      { bg: '#FFF7ED', text: '#9A3412', border: '#FED7AA' },
  'Olympiad':      { bg: '#F0F9FF', text: '#075985', border: '#BAE6FD' },
}

export const DEFAULT_EXAM_COLOR = { bg: '#F8FAFC', text: '#475569', border: '#E2E8F0' }
