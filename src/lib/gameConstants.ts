export const START_AGE_MONTHS = 18 * 12;

export const JOBS: Array<{ title: string; monthlySalary: number }> = [
  { title: 'Retail Associate', monthlySalary: 1800 },
  { title: 'Barista', monthlySalary: 1700 },
  { title: 'Administrative Assistant', monthlySalary: 2400 },
  { title: 'Apprentice Electrician', monthlySalary: 2600 },
  { title: 'Delivery Driver', monthlySalary: 2200 },
  { title: 'Warehouse Worker', monthlySalary: 2300 }
];

export const STUDIES = {
  bachelor: [
    { field: 'Business Administration', expectedMonthlySalary: 3500, years: 3, annualTuition: 4000 },
    { field: 'Computer Science', expectedMonthlySalary: 4200, years: 3, annualTuition: 5000 },
    { field: 'Nursing', expectedMonthlySalary: 3200, years: 3, annualTuition: 3500 }
  ],
  master: [
    { field: 'MBA', expectedMonthlySalary: 5500, years: 2, annualTuition: 7000 },
    { field: 'Data Science', expectedMonthlySalary: 6000, years: 2, annualTuition: 7500 }
  ],
  phd: [
    { field: 'Economics', expectedMonthlySalary: 7000, years: 3, annualTuition: 8000 },
    { field: 'Computer Science', expectedMonthlySalary: 8000, years: 3, annualTuition: 9000 }
  ]
} as const;

export const LIVING_RENTS = [
  { sizeLabel: 'Studio', monthlyRent: 700 },
  { sizeLabel: '1-Bedroom', monthlyRent: 1000 },
  { sizeLabel: '2-Bedroom', monthlyRent: 1400 }
];

export const BASE_EXPENSES = {
  food: 250,
  phone: 30,
  clothes: 50,
  transport: 120
};

export const INVESTMENTS = [
  { kind: 'etf' as const, name: 'Global Stock ETF', monthlyYieldRate: 0.004 },
  { kind: 'bond' as const, name: 'Bond Fund', monthlyYieldRate: 0.002 },
  { kind: 'real_estate' as const, name: 'REIT', monthlyYieldRate: 0.003 }
];

export const MORTGAGE_CASHFLOW_MULTIPLE = 300; // max principal ≈ monthly cashflow * 300

