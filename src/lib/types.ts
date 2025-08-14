export type DegreeLevel = 'none' | 'bachelor' | 'master' | 'phd';

export type CareerType =
  | { kind: 'job'; title: string; monthlySalary: number }
  | { kind: 'study'; field: string; level: Exclude<DegreeLevel, 'none'>; years: number; expectedMonthlySalary: number; annualTuition: number };

export interface MonthlyBudget {
  income: number;
  passiveIncome: number;
  expenses: number;
  investments: number;
  liabilities: number;
}

export interface LivingSituation {
  mode: 'home' | 'rented' | 'owned';
  monthlyRent: number;
  mortgagePayment: number;
  sizeLabel?: string;
}

export interface PlayerState {
  ageMonths: number; // start 18y => 216
  cash: number;
  degree: DegreeLevel;
  currentCareer?: { title: string; monthlySalary: number };
  isStudying: boolean;
  study?: { field: string; level: Exclude<DegreeLevel, 'none'>; remainingMonths: number; annualTuition: number; workSideMonthlyIncome: number };
  living: LivingSituation;
  dependents: { spouse: boolean; children: Array<{ ageMonths: number }> };
  loans: Array<{ kind: 'student' | 'mortgage' | 'personal'; principal: number; rateAPR: number; monthlyPayment: number }>;
  investments: Array<{ kind: 'etf' | 'bond' | 'real_estate' | 'business'; principal: number; monthlyYield: number }>;
  monthHistory: Array<{ monthIndex: number; budget: MonthlyBudget; notes?: string[] }>;
  gameOver: boolean;
  achievedFI: boolean;
  lifestyleExtrasMonthly: number;
  pendingOffers: Array<{ id: string; kind: 'upgrade_car' | 'upgrade_house' | 'buy_clothes' | 'vacation'; description: string; costMonthly?: number; oneTimeCost?: number }>;
  leaderboardSubmitted: boolean;
  jobSearchCooldownMonths: number;
  car?: { tier: 'none' | 'used' | 'compact' | 'sedan' | 'luxury'; monthlyCost: number };
  pendingInvestmentThisMonth: number;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  retirementAgeMonths: number;
  passiveIncomeAtRetirement: number;
  createdAt: string;
}

