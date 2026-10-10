import { 
  Bird, Cage, Ring, BreedingPair, Clutch, Egg, DiseaseRecord, Medication, 
  Treatment, SexingRecord, GenotypingRecord, BirdTimelineEvent, 
  NotificationItem, Tenant, User, SupportTicket, BirdDocument, BirdPhoto,
  CalendarEvent, NoteItem, UserReferralProgram, SellerAffiliate, AffiliateCommission, AffiliatePayout, GlobalSystemConfig,
  BreedingObservation
} from '@/types';

export const INITIAL_TENANT: Tenant = {
  id: 'tenant-demo-01',
  name: '',
  slug: '',
  document: '',
  email: '',
  phone: '',
  cellphone: '',
  whatsapp: '',
  address: '',
  addressNumber: '',
  neighborhood: '',
  city: '',
  state: '',
  zipCode: '',
  complement: '',
  registryNumber: '',
  licenseDate: '',
  category: 'Amador',
  speciesType: 'Ambos',
  website: '',
  facebook: '',
  twitter: '',
  instagram: '',
  youtube: '',
  description: '',
  logoUrl: '',
  coverUrl: '',
  isPublic: true,
  plan: 'PREMIUM',
  billingCycle: 'ANUAL' as const,
  planStatus: 'ACTIVE',
  maxBirds: 9999,
  setupProgress: 0,
  expiresAt: '2028-12-31T23:59:59Z',
  createdAt: '2026-01-01T10:00:00Z',
  owners: [],
  visualConfig: {
    textColorGenealogy: '#000000',
    textColorLabelFront: '#000000',
    textColorLabelBack: '#000000',
    colorField: '#ffffff',
    colorTextField: '#000000',
    colorPaletteMale: '#cce5ff',
    colorPaletteFemale: '#ffd1dc',
    colorTextPaletteMale: '#000000',
    colorTextPaletteFemale: '#000000',
    levelDisplayPaletteGenealogy: 70,
    levelDisplayPaletteLabel: 60,
    printTitleCertificate: true,
    printSixthGeneration: true,
    treeLogoUrl: '',
    treeBackgroundUrl: '',
    logoGenealogyUrl: '',
    bgGenealogyUrl: '',
    labelLogoUrl: '',
    bgLabelFrontUrl: '',
    bgLabelBackUrl: ''
  }
};

export const INITIAL_ALL_TENANTS: Tenant[] = [
  INITIAL_TENANT
];

export const INITIAL_USER: User = {
  id: 'user-01',
  name: 'Usuário BIRDPRO',
  email: 'usuario@birdpro.com.br',
  password: '123',
  role: 'OWNER',
  tenantId: 'tenant-demo-01',
  phone: '',
  avatar: '',
  active: true,
  createdAt: '2026-01-01T10:00:00Z',
};

export const INITIAL_USERS: User[] = [
  INITIAL_USER,
  {
    id: 'user-master-admin-01',
    name: 'Henrique Rocha',
    email: 'henrique_rocha@live.com',
    password: 'admin',
    role: 'SUPER_ADMIN',
    tenantId: 'tenant-demo-01',
    phone: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-criatorio-01',
    name: 'Henrique Rocha',
    email: 'henriquerocha93@hotmail.com',
    password: 'admin',
    role: 'OWNER',
    tenantId: 'tenant-demo-01',
    phone: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-admin-official',
    name: 'Super Admin BIRDPRO',
    email: 'admin@birdpro.com.br',
    password: 'admin',
    role: 'SUPER_ADMIN',
    tenantId: 'tenant-demo-01',
    phone: '',
    avatar: '',
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
  }
];

export const INITIAL_CAGES: Cage[] = [];

export const INITIAL_BIRDS: Bird[] = [];

export const INITIAL_RINGS: Ring[] = [];

export const INITIAL_PAIRS: BreedingPair[] = [];

export const INITIAL_CLUTCHES: Clutch[] = [];

export const INITIAL_EGGS: Egg[] = [];

export const INITIAL_MEDICATIONS: Medication[] = [];

export const INITIAL_TREATMENTS: Treatment[] = [];

export const INITIAL_DISEASES: DiseaseRecord[] = [];

export const INITIAL_SEXINGS: SexingRecord[] = [];

export const INITIAL_GENOTYPING: GenotypingRecord[] = [];

export const INITIAL_TIMELINE: BirdTimelineEvent[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_DOCUMENTS: BirdDocument[] = [];

export const INITIAL_TICKETS: SupportTicket[] = [];

export const INITIAL_COMMISSIONS: AffiliateCommission[] = [];

export const INITIAL_PAYOUTS: AffiliatePayout[] = [];

export const INITIAL_SELLERS: SellerAffiliate[] = [];

export const INITIAL_GLOBAL_CONFIG: GlobalSystemConfig = {
  systemName: 'BIRDPRO',
  systemTagline: 'Gestão Inteligente de Criatórios e Genealogia Aviária',
  systemDomain: 'www.birdpro.com.br',
  systemSiteUrl: 'https://www.birdpro.com.br',
  systemLogoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80',
  supportEmail: 'suporte@birdpro.com.br',
  supportPhone: '(51) 98225-1103',
  supportWhatsApp: '5551982251103',
  defaultTrialDays: 30,
  defaultCommissionPercent: 20,
  cookieDurationDays: 60,
  allowSelfRegistration: true,
  maintenanceMode: false,
  gatewayProvider: 'MERCADOPAGO' as const,
  gatewayApiKey: 'APP_USR-2206919071973254-100300-ea83c87a6255da4fb612333ca41d1714-213948720',
  gatewayWebhookSecret: '',
  gatewayLiveMode: true,
  pagbankToken: 'a3050b81-68f0-4c49-b3bf-8565e29ba699174876b44c749dc97df2b75b4d38fa70e2eb-4624-438a-a571-8b37b36881a6',
  pagbankEmail: 'polpadelivery@hotmail.com',
  pagbankSandbox: false,
  pagbankPixKey: '6f33236f-92cb-4812-b0a8-332e3af35839',
  pagbankWebhookUrl: 'https://www.birdpro.com.br/api/webhooks/pagbank',
  monthlySalesGoal: 25000,
  monthlySubscribersGoal: 50,
  smtpHost: 'smtp.birdpro.com.br',
  smtpPort: 587,
  smtpUser: 'nao-responda@birdpro.com.br',
  smtpPass: '',
  smtpFromEmail: 'nao-responda@birdpro.com.br'
};

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [];

export const INITIAL_NOTES: NoteItem[] = [];

export const INITIAL_USER_REFERRALS: Record<string, UserReferralProgram> = {
  'tenant-demo-01': {
    tenantId: 'tenant-demo-01',
    referralCode: 'birdpro10',
    referralUrl: 'https://www.birdpro.com.br/cadastro?ref=birdpro10',
    couponCode: 'BIRDPRO10',
    friendDiscountPercent: 10,
    userCommissionPercent: 20,
    pixKey: '',
    pixKeyType: 'CPF',
    totalClicks: 0,
    totalInvited: 0,
    totalPaid: 0,
    totalEarnings: 0,
    balanceAvailable: 0,
    totalWithdrawn: 0,
    referrals: [],
    payouts: []
  }
};

export const INITIAL_BREEDING_OBSERVATIONS: BreedingObservation[] = [];
