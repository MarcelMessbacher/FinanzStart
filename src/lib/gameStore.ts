"use client";
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { BASE_EXPENSES, INVESTMENTS, JOBS, LIVING_RENTS, MORTGAGE_CASHFLOW_MULTIPLE, START_AGE_MONTHS, STUDIES } from './gameConstants';
import type { PlayerState } from './types';

const initialState = (): PlayerState => ({
  ageMonths: START_AGE_MONTHS,
  cash: 0,
  degree: 'none',
  currentCareer: undefined,
  isStudying: false,
  study: undefined,
  living: { mode: 'home', monthlyRent: 0, mortgagePayment: 0 },
  dependents: { spouse: false, children: [] },
  loans: [],
  investments: [],
  monthHistory: [],
  gameOver: false,
  achievedFI: false,
  lifestyleExtrasMonthly: 0,
  pendingOffers: [],
  leaderboardSubmitted: false,
  jobSearchCooldownMonths: 0,
  car: undefined,
  pendingInvestmentThisMonth: 0
});

type GameActions = {
  reset: () => void;
  startJob: (title: string, monthlySalary: number) => void;
  startStudy: (field: string, level: 'bachelor' | 'master' | 'phd', years: number, annualTuition: number) => void;
  setSideJobIncome: (monthlyIncome: number) => void;
  chooseLiving: (mode: PlayerState['living']['mode'], monthlyRent: number, sizeLabel?: string) => void;
  nextMonth: () => void;
  invest: (kind: 'etf' | 'bond' | 'real_estate' | 'business', amount: number) => void;
  buyHouseCash: (price: number) => void;
  buyHouseMortgage: (price: number, rateAPR: number, years: number) => void;
  triggerOffer: () => void;
  acceptOffer: (id: string) => void;
  declineOffer: (id: string) => void;
  addChild: () => void;
  marry: () => void;
  submitLeaderboardFlag: () => void;
  randomEvent: () => void;
  setCar: (tier: 'none' | 'used' | 'compact' | 'sedan' | 'luxury', monthlyCost: number) => void;
  takePersonalLoan: (amount: number, rateAPR: number, years: number) => void;
};

export const useGameStore = create<PlayerState & GameActions>()(
  persist(
    (set, get) => ({
      ...initialState(),
      reset: () => set(() => initialState()),
      startJob: (title, monthlySalary) => set({ currentCareer: { title, monthlySalary }, isStudying: false, study: undefined }),
      startStudy: (field, level, years, annualTuition) => {
        const remainingMonths = years * 12;
        set({
          isStudying: true,
          study: { field, level, remainingMonths, annualTuition, workSideMonthlyIncome: 0 },
          currentCareer: undefined
        });
      },
      setSideJobIncome: (monthlyIncome) => set((s) => ({ study: s.study ? { ...s.study, workSideMonthlyIncome: monthlyIncome } : s.study })),
      chooseLiving: (mode, monthlyRent, sizeLabel) => set({ living: { mode, monthlyRent, mortgagePayment: 0, sizeLabel } }),
      nextMonth: () => {
        const s = get();
        if (s.gameOver) return;

        const isAtHome = s.living.mode === 'home';
        const monthsSince21 = Math.max(0, s.ageMonths - 21 * 12);
        const parentRent = isAtHome && s.ageMonths >= 21 * 12 ? 500 + monthsSince21 * 50 : 0;

        const baseExpenses = BASE_EXPENSES.food + BASE_EXPENSES.phone + BASE_EXPENSES.clothes + BASE_EXPENSES.transport;
        const rentExpense = s.living.mode === 'rented' ? s.living.monthlyRent : 0;
        const mortgageExpense = s.living.mortgagePayment;
        const childrenExpense = s.dependents.children.reduce((sum, c) => sum + (c.ageMonths < 18 * 12 ? 250 : 0), 0);
        const dependentsExpense = (s.dependents.spouse ? 300 : 0) + childrenExpense;
        const carExpense = s.car?.monthlyCost ?? 0;

        const loanPayments = s.loans.reduce((sum, l) => sum + l.monthlyPayment, 0);
        const passiveIncome = s.investments.reduce((sum, inv) => sum + inv.monthlyYield, 0);
        const activeIncome = (s.currentCareer?.monthlySalary ?? 0) + (s.isStudying ? (s.study?.workSideMonthlyIncome ?? 0) : 0);
        const tuition = s.isStudying && s.study ? s.study.annualTuition / 12 : 0;

        const income = activeIncome + passiveIncome;
        const expenses = baseExpenses + rentExpense + mortgageExpense + loanPayments + dependentsExpense + parentRent + s.lifestyleExtrasMonthly + tuition + carExpense;

        const net = income - expenses;
        const newCash = s.cash + net;

        let nextState: Partial<PlayerState> = {
          ageMonths: s.ageMonths + 1,
          cash: newCash,
          monthHistory: [
            ...s.monthHistory,
            { monthIndex: s.ageMonths - START_AGE_MONTHS + 1, budget: { income, passiveIncome, expenses, investments: s.pendingInvestmentThisMonth, liabilities: loanPayments } }
          ],
          pendingInvestmentThisMonth: 0
        };

        if (s.isStudying && s.study) {
          const remainingMonths = s.study.remainingMonths - 1;
          nextState = {
            ...nextState,
            study: { ...s.study, remainingMonths }
          };
          if (remainingMonths <= 0) {
            const newDegree = s.study.level;
            nextState.degree = newDegree;
            nextState.isStudying = false;
            nextState.study = undefined;
          }
        }

        // Age children
        if (s.dependents.children.length > 0) {
          nextState.dependents = {
            spouse: s.dependents.spouse,
            children: s.dependents.children.map((c) => ({ ageMonths: c.ageMonths + 1 }))
          };
        }

        const achievedFI = !s.achievedFI && passiveIncome >= expenses && expenses > 0;
        if (achievedFI) {
          nextState.achievedFI = true;
        }

        // Update job search cooldown
        if (s.jobSearchCooldownMonths > 0) {
          nextState.jobSearchCooldownMonths = s.jobSearchCooldownMonths - 1;
        }

        set(nextState as PlayerState);
      },
      invest: (kind, amount) => set((s) => {
        if (amount <= 0 || s.cash < amount) return s;
        const product = INVESTMENTS.find((i) => i.kind === kind);
        if (!product) return s;
        const monthlyYield = amount * product.monthlyYieldRate;
        return {
          cash: s.cash - amount,
          investments: [...s.investments, { kind, principal: amount, monthlyYield }],
          pendingInvestmentThisMonth: s.pendingInvestmentThisMonth + amount
        };
      }),
      buyHouseCash: (price) => set((s) => (s.cash >= price ? { cash: s.cash - price, living: { mode: 'owned', monthlyRent: 0, mortgagePayment: 0 } } : s)),
      buyHouseMortgage: (price, rateAPR, years) => set((s) => {
        const monthlyCashflow = (s.currentCareer?.monthlySalary ?? 0) + (s.isStudying ? (s.study?.workSideMonthlyIncome ?? 0) : 0)
          + s.investments.reduce((sum, inv) => sum + inv.monthlyYield, 0)
          - (BASE_EXPENSES.food + BASE_EXPENSES.phone + BASE_EXPENSES.clothes + BASE_EXPENSES.transport)
          - (s.living.mode === 'rented' ? s.living.monthlyRent : 0);
        const maxPrincipal = Math.max(0, monthlyCashflow) * MORTGAGE_CASHFLOW_MULTIPLE;
        if (price > maxPrincipal) return s;
        const n = years * 12;
        const r = rateAPR / 12;
        const payment = r === 0 ? price / n : (price * r) / (1 - Math.pow(1 + r, -n));
        return {
          living: { mode: 'owned', monthlyRent: 0, mortgagePayment: payment },
          loans: [...s.loans, { kind: 'mortgage', principal: price, rateAPR, monthlyPayment: payment }]
        };
      }),
      triggerOffer: () => set((s) => {
        // Randomly propose a lifestyle offer
        const offers = [
          { kind: 'upgrade_car', description: 'Upgrade your car - nicer ride!', costMonthly: 250 },
          { kind: 'upgrade_house', description: 'Move to a bigger apartment', costMonthly: 400 },
          { kind: 'buy_clothes', description: 'Designer clothing subscription', costMonthly: 120 },
          { kind: 'vacation', description: 'Take a luxury vacation', oneTimeCost: 2000 }
        ] as const;
        const o = offers[Math.floor(Math.random() * offers.length)];
        const id = Math.random().toString(36).slice(2);
        return { pendingOffers: [...s.pendingOffers, { id, ...o }] } as PlayerState;
      }),
      acceptOffer: (id) => set((s) => {
        const offer = s.pendingOffers.find((o) => o.id === id);
        if (!offer) return s;
        return {
          pendingOffers: s.pendingOffers.filter((o) => o.id !== id),
          lifestyleExtrasMonthly: s.lifestyleExtrasMonthly + (offer.costMonthly ?? 0),
          cash: s.cash - (offer.oneTimeCost ?? 0)
        };
      }),
      declineOffer: (id) => set((s) => ({ pendingOffers: s.pendingOffers.filter((o) => o.id !== id) })),
      addChild: () => set((s) => ({ dependents: { ...s.dependents, children: [...s.dependents.children, { ageMonths: 0 }] } })),
      marry: () => set((s) => ({ dependents: { ...s.dependents, spouse: true } })),
      submitLeaderboardFlag: () => set({ leaderboardSubmitted: true })
      ,
      randomEvent: () => set((s) => {
        const events = [
          () => ({ // Housing crisis: rent rises
            living: s.living.mode === 'rented' ? { ...s.living, monthlyRent: Math.round(s.living.monthlyRent * 1.15) } : s.living,
            monthHistory: [...s.monthHistory, { monthIndex: s.ageMonths - START_AGE_MONTHS, budget: { income: 0, passiveIncome: 0, expenses: 0, investments: 0, liabilities: 0 }, notes: ['Housing crisis: rent increased'] }]
          }),
          () => ({ // Job loss
            currentCareer: undefined,
            jobSearchCooldownMonths: Math.max(s.jobSearchCooldownMonths, 3),
            monthHistory: [...s.monthHistory, { monthIndex: s.ageMonths - START_AGE_MONTHS, budget: { income: 0, passiveIncome: 0, expenses: 0, investments: 0, liabilities: 0 }, notes: ['You lost your job. Searching for new role...'] }]
          }),
          () => ({ // Promotion
            currentCareer: s.currentCareer ? { ...s.currentCareer, monthlySalary: Math.round(s.currentCareer.monthlySalary * 1.1) } : s.currentCareer,
            monthHistory: [...s.monthHistory, { monthIndex: s.ageMonths - START_AGE_MONTHS, budget: { income: 0, passiveIncome: 0, expenses: 0, investments: 0, liabilities: 0 }, notes: ['Good news: You received a promotion!'] }]
          })
        ];
        const e = events[Math.floor(Math.random() * events.length)];
        return e();
      }),
      setCar: (tier, monthlyCost) => set({ car: { tier, monthlyCost } }),
      takePersonalLoan: (amount, rateAPR, years) => set((s) => {
        if (amount <= 0 || years <= 0) return s;
        const n = years * 12;
        const r = rateAPR / 12;
        const payment = r === 0 ? amount / n : (amount * r) / (1 - Math.pow(1 + r, -n));
        return {
          cash: s.cash + amount,
          loans: [...s.loans, { kind: 'personal', principal: amount, rateAPR, monthlyPayment: payment }]
        };
      })
    }),
    {
      name: 'finanzstart-session',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);

