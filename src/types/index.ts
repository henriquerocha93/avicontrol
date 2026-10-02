export type UserRole = 'SUPER_ADMIN' | 'OWNER' | 'ADMIN' | 'STAFF' | 'VIEWER' | 'SELLER';

export type BirdSex = 'MALE' | 'FEMALE' | 'UNKNOWN';

export type BirdStatus = 
  | 'ACTIVE' 
  | 'BREEDING' 
  | 'FOR_SALE' 
  | 'TRANSFERRED' 
  | 'DECEASED' 
  | 'LOST' 
  | 'IN_TREATMENT' 
  | 'QUARANTINE';

export type RingStatus = 'IN_STOCK' | 'USED' | 'RESERVED' | 'TRANSFERRED' | 'LOST' | 'CANCELLED';

export type EggStatus = 'INCUBATING' | 'FERTILE' | 'INFERTILE' | 'HATCHED' | 'BROKEN' | 'LOST';

export type BreedingStatus = 'ACTIVE' | 'RESTING' | 'SEPARATED' | 'COMPLETED';

export type PlanType = 'FREE' | 'PRO' | 'PREMIUM';

export type PartnerType = 'VENDEDOR' | 'EMBAIXADOR';

export interface SellerAffiliate {
  id: string;
  name: string;
  email: string;
  phone: string;
  pixKey: string;
  pixKeyType: 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM';
  type?: PartnerType;
  linkedTenantId?: string; // If linked to an existing criatório tenant
  linkedUserId?: string;   // If linked to an existing user
  isIndependentSeller?: boolean; // If pure seller with separate login
  password?: string;       // Login password for independent seller
  commissionPercent: number;
  monthlySalesGoal?: number;
  monthlySignupsGoal?: number;
  goalBonusPercent?: number;
  goalBonusFixed?: number;
  instagram?: string;
  youtube?: string;
  couponCode: string;
  affiliateCode: string;
  affiliateUrl: string;
  totalClicks: number;
  totalSignups: number;
  totalSalesValue: number;
  totalCommissionsEarned: number;
  totalCommissionsPaid: number;
  balanceAvailable: number;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  createdAt: string;
  notes?: string;
}

export interface AffiliateCommission {
  id: string;
  affiliateId: string;
  affiliateName: string;
  tenantId: string;
  tenantName: string;
  planName: string;
  saleValue: number;
  commissionPercent: number;
  commissionAmount: number;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED';
  createdAt: string;
  paidAt?: string;
}

export interface AffiliatePayout {
  id: string;
  affiliateId: string;
  affiliateName: string;
  amount: number;
  pixKey: string;
  receiptUrl?: string;
  status: 'REQUESTED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  createdAt: string;
  completedAt?: string;
}

export interface ReferredFriend {
  id: string;
  friendName: string;
  criatorioName: string;
  email: string;
  phone?: string;
  signupDate: string;
  planName?: string;
  status: 'TRIAL' | 'ACTIVE_PAID' | 'EXPIRED';
  saleAmount?: number;
  rewardAmount: number;
  rewardStatus: 'PENDING' | 'AVAILABLE' | 'PAID';
}

export interface UserReferralProgram {
  tenantId: string;
  referralCode: string;
  referralUrl: string;
  couponCode: string;
  friendDiscountPercent: number;
  userCommissionPercent: number;
  pixKey?: string;
  pixKeyType?: 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM';
  totalClicks: number;
  totalInvited: number;
  totalPaid: number;
  totalEarnings: number;
  balanceAvailable: number;
  totalWithdrawn: number;
  // Official partner overrides
  isOfficialPartner?: boolean;
  partnerType?: PartnerType;
  monthlySalesGoal?: number;
  monthlySignupsGoal?: number;
  goalBonusPercent?: number;
  goalBonusFixed?: number;
  referrals: ReferredFriend[];
  payouts: AffiliatePayout[];
}

export interface GlobalSystemConfig {
  systemName: string;
  systemTagline: string;
  systemDomain: string;
  systemSiteUrl: string;
  systemLogoUrl: string;
  supportEmail: string;
  supportPhone: string;
  supportWhatsApp: string;
  defaultTrialDays: number;
  defaultCommissionPercent: number;
  cookieDurationDays: number;
  allowSelfRegistration: boolean;
  maintenanceMode: boolean;
  gatewayProvider: 'PAGBANK' | 'MERCADOPAGO' | 'ASAAS' | 'STRIPE' | 'MANUAL';
  gatewayApiKey?: string;
  gatewayWebhookSecret?: string;
  gatewayLiveMode: boolean;
  // PagBank (PagSeguro) specific config
  pagbankToken?: string;
  pagbankEmail?: string;
  pagbankSandbox?: boolean;
  pagbankPixKey?: string;
  pagbankAppId?: string;
  pagbankAppKey?: string;
  pagbankWebhookUrl?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpFromEmail?: string;
}

export interface CouponValidationResult {
  valid: boolean;
  code: string;
  discountPercent: number;
  discountAmount?: number;
  sellerId?: string;
  sellerName?: string;
  message: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  tenantId: string;
  phone?: string;
  avatar?: string;
  active: boolean;
  createdAt: string;
}

export interface BreederOwner {
  id: string;
  name: string;
  nickname?: string;
  cpf: string;
  city: string;
  state: string;
  phone?: string;
  isMain?: boolean;
  avatarUrl?: string;
}

export interface TenantVisualConfig {
  textColorGenealogy?: string;
  textColorLabelFront?: string;
  textColorLabelBack?: string;
  colorField?: string;
  colorTextField?: string;
  colorPaletteMale?: string;
  colorPaletteFemale?: string;
  colorTextPaletteMale?: string;
  colorTextPaletteFemale?: string;
  levelDisplayPaletteGenealogy?: number;
  levelDisplayPaletteLabel?: number;
  printTitleCertificate?: boolean;
  printSixthGeneration?: boolean;
  logoGenealogyUrl?: string;
  bgGenealogyUrl?: string;
  logoLabelUrl?: string;
  bgLabelFrontUrl?: string;
  bgLabelBackUrl?: string;

  // Aliases and additional form fields
  treeTextColor?: string;
  labelFrontTextColor?: string;
  labelBackTextColor?: string;
  fieldBgColor?: string;
  fieldTextColor?: string;
  maleColor?: string;
  femaleColor?: string;
  maleTextColor?: string;
  femaleTextColor?: string;
  malePaletteDisplay?: number;
  femalePaletteDisplay?: number;
  printCertificateTitle?: boolean;
  printUpToSixthGeneration?: boolean;
  treeLogoUrl?: string;
  treeLogoScale?: number;
  treeBackgroundUrl?: string;
  treeBackgroundScale?: number;
  labelLogoUrl?: string;
  labelLogoScale?: number;
  labelFrontBackgroundUrl?: string;
  labelFrontScale?: number;
  labelBackBackgroundUrl?: string;
  labelBackScale?: number;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  document: string; // CPF or CNPJ
  cpfCnpj?: string;
  email: string;
  phone: string;
  cellphone?: string;
  mobile?: string;
  whatsapp?: string;
  address?: string;
  addressNumber?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  cep?: string;
  complement?: string;
  description?: string;
  registrationNumber?: string;
  registryNumber?: string;
  licenseDate?: string;
  category?: string;
  speciesType?: 'Ambos' | 'SISPASS' | 'FOB';
  website?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  socialMedia?: {
    whatsapp?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  owners: BreederOwner[];
  visualConfig: TenantVisualConfig;
  logoUrl?: string;
  coverUrl?: string;
  active?: boolean;
  plan: PlanType;
  billingCycle?: 'MENSAL' | 'ANUAL' | 'ISENTO';
  planStatus?: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'TRIAL' | 'BLOCKED';
  priceAmount?: number;
  lastPaymentDate?: string;
  maxBirds: number;
  setupProgress?: number;
  isPublic?: boolean;
  expiresAt: string;
  createdAt: string;
}

export interface Bird {
  id: string;
  tenantId: string;
  name: string;
  nickname?: string;
  ringNumber: string;
  species: string;
  subspecies?: string;
  sex: BirdSex;
  birthDate?: string;
  breed?: string;
  mutation?: string;
  color?: string;
  features?: string;
  origin: 'BRED_HERE' | 'PURCHASED' | 'EXCHANGED' | 'GIFT' | 'OTHER';
  breederOrigin?: string;
  fatherId?: string;
  motherId?: string;
  paternalGrandfatherId?: string;
  paternalGrandmotherId?: string;
  maternalGrandfatherId?: string;
  maternalGrandmotherId?: string;
  fatherName?: string;
  fatherRing?: string;
  motherName?: string;
  motherRing?: string;
  location?: string;
  cageId?: string;
  status: BirdStatus;
  notes?: string;
  entryDate: string;
  exitDate?: string;
  exitReason?: string;
  isPublic: boolean;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ring {
  id: string;
  tenantId: string;
  number: string;
  code?: string;
  year: number;
  type: string;
  origin?: string;
  acquisitionDate?: string;
  birdId?: string;
  birdName?: string;
  status: RingStatus;
  notes?: string;
  createdAt?: string;
}

export interface Cage {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  location: string;
  type: 'FLIGHT' | 'BREEDING' | 'INDIVIDUAL' | 'HOSPITAL' | 'NURSERY';
  size?: string;
  capacity: number;
  status: 'ACTIVE' | 'MAINTENANCE' | 'CLEANING' | 'INACTIVE';
  notes?: string;
  createdAt: string;
}

export interface BreedingPair {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  maleId: string;
  maleName: string;
  maleRing: string;
  maleSpecies: string;
  femaleId: string;
  femaleName: string;
  femaleRing: string;
  femaleSpecies: string;
  cageId?: string;
  cageCode?: string;
  formedDate: string;
  endDate?: string;
  status: BreedingStatus;
  notes?: string;
  clutchesCount: number;
  totalEggs: number;
  hatchedCount: number;
  createdAt: string;
}

export interface Clutch {
  id: string;
  tenantId: string;
  pairId: string;
  clutchNumber: number;
  startDate: string;
  totalEggs: number;
  fertileEggs: number;
  infertileEggs: number;
  hatchedEggs: number;
  lostEggs: number;
  status: 'INCUBATING' | 'HATCHED' | 'FAILED' | 'COMPLETED';
  notes?: string;
  createdAt: string;
}

export interface Egg {
  id: string;
  tenantId: string;
  clutchId: string;
  pairId: string;
  eggNumber: number;
  layDate: string;
  expectedHatchDate: string;
  actualHatchDate?: string;
  status: EggStatus;
  offspringBirdId?: string;
  notes?: string;
  createdAt: string;
}

export interface DiseaseRecord {
  id: string;
  tenantId: string;
  birdId: string;
  birdName: string;
  birdRing: string;
  diseaseName: string;
  symptoms: string;
  diagnosis: string;
  diagnosedDate: string;
  veterinarian?: string;
  treatmentNotes?: string;
  result: 'CURED' | 'IN_TREATMENT' | 'CHRONIC' | 'DECEASED';
  cureDate?: string;
  createdAt: string;
}

export interface Medication {
  id: string;
  tenantId: string;
  name: string;
  activeIngredient: string;
  manufacturer?: string;
  standardDosage?: string;
  applicationMethod: 'WATER' | 'FOOD' | 'INJECTABLE' | 'TOPICAL' | 'DIRECT_ORAL' | 'SPRAY';
  notes?: string;
  stockQuantity?: string;
  createdAt: string;
}

export interface Treatment {
  id: string;
  tenantId: string;
  birdId: string;
  birdName: string;
  birdRing: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  responsiblePerson: string;
  status: 'ACTIVE' | 'COMPLETED' | 'SUSPENDED';
  notes?: string;
  createdAt: string;
}

export interface BehaviorRecord {
  id: string;
  tenantId: string;
  birdId: string;
  date: string;
  tamenessScore: number;
  aggressivenessScore: number;
  singingScore: number;
  territorialityScore: number;
  maternalInstinctScore: number;
  stressScore: number;
  notes?: string;
  createdAt: string;
}

export interface SexingRecord {
  id: string;
  tenantId: string;
  birdId: string;
  birdName: string;
  birdRing: string;
  result: BirdSex;
  method: 'DNA_FEATHER' | 'DNA_BLOOD' | 'SURGICAL' | 'BEHAVIORAL' | 'DIMORPHISM';
  laboratory: string;
  sampleDate: string;
  resultDate: string;
  certificateNumber?: string;
  documentUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface GenotypingRecord {
  id: string;
  tenantId: string;
  birdId: string;
  birdName: string;
  birdRing: string;
  laboratory: string;
  sampleDate: string;
  resultDate: string;
  geneticCode?: string;
  mutationsIdentified: string[];
  carrierGenes: string[];
  documentUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface BirdDocument {
  id: string;
  tenantId: string;
  birdId?: string;
  birdName?: string;
  title: string;
  category: 'INVOICE' | 'ORIGIN' | 'SEXING' | 'GENETICS' | 'EXAM' | 'TREATMENT' | 'CERTIFICATE' | 'OTHER';
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize?: string;
  issueDate?: string;
  notes?: string;
  createdAt: string;
}

export interface BirdPhoto {
  id: string;
  tenantId: string;
  birdId: string;
  url: string;
  caption?: string;
  isMain: boolean;
  date: string;
  createdAt: string;
}

export interface BirdTimelineEvent {
  id: string;
  tenantId: string;
  birdId: string;
  date: string;
  title: string;
  description: string;
  eventType: 
    | 'BIRTH' 
    | 'RINGING' 
    | 'CAGE_TRANSFER' 
    | 'TREATMENT' 
    | 'DISEASE' 
    | 'BREEDING' 
    | 'SEXING' 
    | 'GENETICS' 
    | 'TRANSFER' 
    | 'SALE' 
    | 'PHOTO' 
    | 'NOTE';
  userName: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  tenantId: string;
  title: string;
  message: string;
  type: 'ALERT' | 'INFO' | 'WARNING' | 'SUCCESS';
  category: 'MEDICATION' | 'EGG_HATCH' | 'SEXING' | 'RING' | 'CAGE' | 'DOCUMENT' | 'SYSTEM' | 'CUSTOM';
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate?: string;
  dueTime?: string;
  birdName?: string;
  cageName?: string;
  dosage?: string;
  status?: 'PENDING' | 'COMPLETED' | 'SNOOZED';
  pushEnabled?: boolean;
  link?: string;
  actionText?: string;
  read: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface SupportTicketMessage {
  id: string;
  sender: string;
  senderRole?: 'USER' | 'ADMIN' | 'SUPPORT_AGENT';
  isStaff: boolean;
  content: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketCode: string;
  tenantId: string;
  criatorioName: string;
  userName: string;
  userEmail: string;
  userWhatsapp: string; // Obrigatório para abertura do chamado
  subject: string;
  category: 'TECHNICAL' | 'BILLING' | 'QUESTION' | 'FEATURE_REQUEST' | 'BUG';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  messages: SupportTicketMessage[];
  unreadByAdmin?: boolean;
  unreadByUser?: boolean;
  lastReplyBy?: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}

// Config Auxiliaries
export interface ConfigItem {
  id: string;
  tenantId: string;
  name: string;
  code?: string;
  description?: string;
  active: boolean;
  createdAt: string;
}

// Calendar & Appointments with Push Notification Alerts
export type EventCategory = 
  | 'MEDICATION' 
  | 'VACCINE' 
  | 'BREEDING' 
  | 'RINGING' 
  | 'TOURNAMENT' 
  | 'VET' 
  | 'CLEANING' 
  | 'GENERAL' 
  | 'HOLIDAY';

export interface CalendarEvent {
  id: string;
  tenantId: string;
  title: string;
  category: EventCategory;
  startDate: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string;   // HH:mm
  allDay: boolean;
  birdId?: string;
  birdName?: string;
  cageId?: string;
  location?: string;
  description?: string;
  color?: string;
  // Push Notification & Alerts
  enablePushAlert: boolean;
  reminderMinutesBefore: number; // 0, 15, 30, 60, 1440, 2880
  alertSent?: boolean;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

// Anotações & Bloco de Notas
export type NotePriority = 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface NoteItem {
  id: string;
  tenantId: string;
  title: string;
  content: string;
  type: 'NOTE_ONLY' | 'CALENDAR_REMINDER'; // Bloco de Notas ou Lembrete na Agenda
  agendaDate?: string; // YYYY-MM-DD
  agendaTime?: string; // HH:mm
  priority: NotePriority; // HIGH (red), MEDIUM (yellow), LOW (green), INFO (blue)
  finalized: boolean;
  pinned?: boolean;
  color?: string;
  birdId?: string;
  birdName?: string;
  createdAt: string;
  updatedAt: string;
}

// Aprendizado Contínuo & Memória do Consultor
export interface AiLearnedInsight {
  id: string;
  topic: string;
  userQuery: string;
  insightSummary: string;
  learnedFromUser?: string;
  occurrences: number;
  createdAt: string;
  updatedAt: string;
}

