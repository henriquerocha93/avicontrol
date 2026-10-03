import { 
  Bird, Cage, Ring, BreedingPair, Clutch, Egg, DiseaseRecord, Medication, 
  Treatment, SexingRecord, GenotypingRecord, BirdTimelineEvent, 
  NotificationItem, Tenant, User, SupportTicket, BirdDocument, BirdPhoto,
  CalendarEvent, NoteItem, UserReferralProgram, SellerAffiliate, AffiliateCommission, AffiliatePayout, GlobalSystemConfig
} from '@/types';

export const INITIAL_TENANT: Tenant = {
  id: 'tenant-demo-01',
  name: 'Luis Henrique Schreiber Júnior "Madruguinha"',
  slug: 'madruguinha',
  document: '022.034.960-61',
  email: 'luis.henrique.schreiber@hotmail.com',
  phone: '(55) 9134-3265',
  cellphone: '(55) 9 9134-3265',
  whatsapp: '5555991343265',
  address: 'Rua das violetas',
  addressNumber: '109',
  neighborhood: 'universitario',
  city: 'IJUI',
  state: 'RS',
  zipCode: '98700-000',
  complement: '',
  registryNumber: '4719754',
  licenseDate: '2009-10-29',
  category: 'Amador',
  speciesType: 'Ambos',
  website: '',
  facebook: 'LUIS HENRIQUE MADRUGUINHA',
  twitter: '',
  instagram: 'LUIS HENRIQUE MADRUGUINHA',
  youtube: '',
  description: 'Criatório de elite especializado na preservação, seleção genética e manejo zootécnico.',
  logoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80',
  coverUrl: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=1200&auto=format&fit=crop&q=80',
  isPublic: true,
  plan: 'PREMIUM',
  billingCycle: 'ANUAL' as const,
  planStatus: 'ACTIVE',
  maxBirds: 9999,
  setupProgress: 100,
  expiresAt: '2028-12-31T23:59:59Z',
  createdAt: '2026-01-01T10:00:00Z',
  owners: [
    {
      id: 'owner-01',
      name: 'Luis Henrique Schreiber júnior "Madruguinha"',
      nickname: 'Madruguinha',
      cpf: '022.034.960-61',
      city: 'IJUI',
      state: 'RS',
      phone: '(55) 9134-3265',
      isMain: true
    }
  ],
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
    treeLogoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80',
    treeBackgroundUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1150&auto=format&fit=crop&q=80',
    logoGenealogyUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80',
    bgGenealogyUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
    labelLogoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80',
    bgLabelFrontUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80',
    bgLabelBackUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80'
  }
};

export const INITIAL_ALL_TENANTS: Tenant[] = [
  INITIAL_TENANT
];

export const INITIAL_USER: User = {
  id: 'user-01',
  name: 'Luis Henrique Schreiber Júnior',
  email: 'luis.henrique.schreiber@hotmail.com',
  password: '123',
  role: 'OWNER',
  tenantId: 'tenant-demo-01',
  phone: '(55) 9 9134-3265',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
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
    phone: '(55) 9 9134-3265',
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
    phone: '(55) 9 9134-3265',
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

export const INITIAL_COMMISSIONS: AffiliateCommission[] = [
  {
    id: 'comm-mari-01',
    affiliateId: 'seller-mari-embaixadora',
    affiliateName: 'Mariana R. Silveira (Canal Canto & Fibra)',
    tenantId: 'tenant-novo-01',
    tenantName: 'Criatório Diamante Negro',
    planName: 'Plano Anual PRO',
    saleValue: 169.99,
    commissionPercent: 30, // 25% + 5% bônus
    commissionAmount: 51.00,
    status: 'APPROVED',
    createdAt: '2026-10-01T14:20:00Z',
    paidAt: '2026-10-01T14:20:00Z'
  },
  {
    id: 'comm-mari-02',
    affiliateId: 'seller-mari-embaixadora',
    affiliateName: 'Mariana R. Silveira (Canal Canto & Fibra)',
    tenantId: 'tenant-novo-02',
    tenantName: 'Criadouro Vale das Aves',
    planName: 'Plano Anual PRO',
    saleValue: 169.99,
    commissionPercent: 30,
    commissionAmount: 51.00,
    status: 'APPROVED',
    createdAt: '2026-09-28T09:15:00Z',
    paidAt: '2026-09-28T09:15:00Z'
  },
  {
    id: 'comm-mari-03',
    affiliateId: 'seller-mari-embaixadora',
    affiliateName: 'Mariana R. Silveira (Canal Canto & Fibra)',
    tenantId: 'tenant-novo-03',
    tenantName: 'Criatório Canto Nobre',
    planName: 'Plano Mensal PRO',
    saleValue: 14.99,
    commissionPercent: 30,
    commissionAmount: 4.50,
    status: 'APPROVED',
    createdAt: '2026-09-25T18:40:00Z',
    paidAt: '2026-09-25T18:40:00Z'
  },
  {
    id: 'comm-carlos-01',
    affiliateId: 'seller-carlos-vendas',
    affiliateName: 'Carlos Eduardo Menezes',
    tenantId: 'tenant-novo-04',
    tenantName: 'Criatório Canto & Ouro',
    planName: 'Plano Anual PRO',
    saleValue: 169.99,
    commissionPercent: 20,
    commissionAmount: 34.00,
    status: 'APPROVED',
    createdAt: '2026-09-29T11:05:00Z',
    paidAt: '2026-09-29T11:05:00Z'
  },
  {
    id: 'comm-carlos-02',
    affiliateId: 'seller-carlos-vendas',
    affiliateName: 'Carlos Eduardo Menezes',
    tenantId: 'tenant-novo-05',
    tenantName: 'Centro de Reprodução Santa Fé',
    planName: 'Plano Anual PRO',
    saleValue: 169.99,
    commissionPercent: 20,
    commissionAmount: 34.00,
    status: 'APPROVED',
    createdAt: '2026-09-22T16:30:00Z',
    paidAt: '2026-09-22T16:30:00Z'
  }
];

export const INITIAL_PAYOUTS: AffiliatePayout[] = [
  {
    id: 'pay-mari-01',
    affiliateId: 'seller-mari-embaixadora',
    affiliateName: 'Mariana R. Silveira (Canal Canto & Fibra)',
    amount: 1000.00,
    pixKey: '098.765.432-11',
    receiptUrl: 'https://comprovante.pix.birdpro.com.br/tx-mari-setembro-2026',
    status: 'COMPLETED',
    createdAt: '2026-09-30T10:00:00Z',
    completedAt: '2026-09-30T10:05:00Z'
  },
  {
    id: 'pay-carlos-01',
    affiliateId: 'seller-carlos-vendas',
    affiliateName: 'Carlos Eduardo Menezes',
    amount: 300.00,
    pixKey: 'carlos.comercial@birdpro.com.br',
    receiptUrl: 'https://comprovante.pix.birdpro.com.br/tx-carlos-setembro-2026',
    status: 'COMPLETED',
    createdAt: '2026-09-30T10:15:00Z',
    completedAt: '2026-09-30T10:18:00Z'
  }
];

export const INITIAL_SELLERS: SellerAffiliate[] = [
  {
    id: 'seller-carlos-vendas',
    name: 'Carlos Eduardo Menezes',
    email: 'carlos.comercial@birdpro.com.br',
    phone: '(11) 98765-4321',
    pixKey: 'carlos.comercial@birdpro.com.br',
    pixKeyType: 'EMAIL',
    type: 'VENDEDOR',
    isIndependentSeller: true,
    commissionPercent: 20,
    monthlySalesGoal: 5000,
    monthlySignupsGoal: 25,
    goalBonusPercent: 5,
    goalBonusFixed: 200,
    couponCode: 'CARLOS20',
    affiliateCode: 'carlos-vendas',
    affiliateUrl: 'https://www.birdpro.com.br/?ref=carlos-vendas',
    totalClicks: 284,
    totalSignups: 16,
    totalSalesValue: 2719.84,
    totalCommissionsEarned: 543.96,
    totalCommissionsPaid: 300.00,
    balanceAvailable: 243.96,
    status: 'ACTIVE',
    createdAt: '2026-08-01T10:00:00Z',
    notes: 'Especialista comercial em criatórios de Bicudos e Curiós no interior de SP e MG.'
  },
  {
    id: 'seller-mari-embaixadora',
    name: 'Mariana R. Silveira (Canal Canto & Fibra)',
    email: 'mariana.aves@gmail.com',
    phone: '(21) 99876-5432',
    pixKey: '098.765.432-11',
    pixKeyType: 'CPF',
    type: 'EMBAIXADOR',
    linkedTenantId: 'tenant-demo-01',
    isIndependentSeller: false,
    commissionPercent: 25,
    monthlySalesGoal: 10000,
    monthlySignupsGoal: 50,
    goalBonusPercent: 5,
    goalBonusFixed: 500,
    instagram: '@cantoefibra_oficial',
    youtube: 'Canal Canto & Fibra',
    couponCode: 'MARI25',
    affiliateCode: 'mari-canto',
    affiliateUrl: 'https://www.birdpro.com.br/?ref=mari-canto',
    totalClicks: 840,
    totalSignups: 42,
    totalSalesValue: 7139.58,
    totalCommissionsEarned: 1784.89,
    totalCommissionsPaid: 1000.00,
    balanceAvailable: 784.89,
    status: 'ACTIVE',
    createdAt: '2026-07-15T14:30:00Z',
    notes: 'Embaixadora oficial BIRDPRO. Divulgação em vídeos semanais e Instagram Stories.'
  }
];

export const INITIAL_GLOBAL_CONFIG: GlobalSystemConfig = {
  systemName: 'BIRDPRO',
  systemTagline: 'Gestão Inteligente de Criatórios e Genealogia Aviária',
  systemDomain: 'www.birdpro.com.br',
  systemSiteUrl: 'https://www.birdpro.com.br',
  systemLogoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80',
  supportEmail: 'suporte@birdpro.com.br',
  supportPhone: '(55) 9134-3265',
  supportWhatsApp: '5555991343265',
  defaultTrialDays: 30,
  defaultCommissionPercent: 20,
  cookieDurationDays: 60,
  allowSelfRegistration: true,
  maintenanceMode: false,
  gatewayProvider: 'PAGBANK' as const,
  gatewayApiKey: '',
  gatewayWebhookSecret: '',
  gatewayLiveMode: true,
  pagbankToken: '20213321-f0b7-455f-9ff6-c437a0b1ff105b6fd3a74fc3b060014c934662d746b6f421-e06a-4ed4-be40-a4becc0ec004',
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
    referralCode: 'madruguinha10',
    referralUrl: 'https://www.birdpro.com.br/cadastro?ref=madruguinha10',
    couponCode: 'MADRUGUINHA10',
    friendDiscountPercent: 10,
    userCommissionPercent: 20,
    pixKey: '5555991343265',
    pixKeyType: 'PHONE',
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
