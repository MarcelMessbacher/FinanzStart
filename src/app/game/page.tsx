"use client";
import { useEffect, useMemo, useState } from 'react';
import { useGameStore } from '@/lib/gameStore';
import { JOBS, LIVING_RENTS, STUDIES } from '@/lib/gameConstants';
import { Modal } from '@/components/Modal';
import type { PlayerState } from '@/lib/types';

export default function GamePage() {
  const state = useGameStore();
  const [showIntro, setShowIntro] = useState(true);
  const [showFIForm, setShowFIForm] = useState(false);
  const [playerName, setPlayerName] = useState('');

  useEffect(() => {
    // Reset state on mount to ensure a fresh session each visit (per requirement).
    state.reset();
    setShowIntro(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ageYears = Math.floor(state.ageMonths / 12);
  const ageMonthsRemainder = state.ageMonths % 12;

  const income = (state.currentCareer?.monthlySalary ?? 0) + (state.isStudying ? (state.study?.workSideMonthlyIncome ?? 0) : 0)
    + state.investments.reduce((s, i) => s + i.monthlyYield, 0);

  const fixedExpenses = useMemo(() => {
    const base = 250 + 30 + 50 + 120;
    const rent = state.living.mode === 'rented' ? state.living.monthlyRent : 0;
    const mortgage = state.living.mortgagePayment;
    const dependents = (state.dependents.spouse ? 300 : 0) + state.dependents.children.filter((c) => c.ageMonths < 18 * 12).length * 250;
    const parentRent = state.living.mode === 'home' && ageYears >= 21 ? Math.max(0, 500 + (state.ageMonths - 21 * 12) * (50 / 12)) : 0;
    const loans = state.loans.reduce((s, l) => s + l.monthlyPayment, 0);
    const tuition = state.isStudying && state.study ? state.study.annualTuition / 12 : 0;
    const car = state.car?.monthlyCost ?? 0;
    return base + rent + mortgage + dependents + loans + parentRent + tuition + state.lifestyleExtrasMonthly + car;
  }, [state, ageYears]);

  const net = income - fixedExpenses;

  const [choice, setChoice] = useState<'job' | 'study' | null>(null);

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">FinanzStart</h1>
        <div className="text-sm text-gray-600">Age: {ageYears}y {ageMonthsRemainder}m</div>
      </header>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {!state.currentCareer && !state.isStudying && (
            <div className="rounded border p-4">
              <h2 className="font-semibold mb-2">Choose your path</h2>
              <div className="flex gap-3">
                <button className={`rounded border px-4 py-2 ${choice === 'job' ? 'bg-indigo-50 border-indigo-400' : ''}`} onClick={() => setChoice('job')}>Start a Job</button>
                <button className={`rounded border px-4 py-2 ${choice === 'study' ? 'bg-indigo-50 border-indigo-400' : ''}`} onClick={() => setChoice('study')}>Go to College</button>
              </div>

              {choice === 'job' && (
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {JOBS.map((j) => (
                    <button key={j.title} className="rounded border p-3 text-left hover:bg-gray-50" onClick={() => state.startJob(j.title, j.monthlySalary)}>
                      <div className="font-medium">{j.title}</div>
                      <div className="text-sm text-gray-600">Monthly salary: €{j.monthlySalary.toLocaleString()}</div>
                    </button>
                  ))}
                </div>
              )}

              {choice === 'study' && (
                <div className="mt-4 space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Bachelor programs (3 years)</h3>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {STUDIES.bachelor.map((p) => (
                        <button key={p.field} className="rounded border p-3 text-left hover:bg-gray-50" onClick={() => state.startStudy(p.field, 'bachelor', p.years, p.annualTuition)}>
                          <div className="font-medium">{p.field}</div>
                          <div className="text-sm text-gray-600">Expected salary after: €{p.expectedMonthlySalary.toLocaleString()}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {state.isStudying && state.study && (
            <div className="rounded border p-4 space-y-3">
              <div className="font-semibold">Studying {state.study.field} ({state.study.level}) — {state.study.remainingMonths} months remaining</div>
              <div className="flex gap-3 items-end">
                <label className="text-sm">Side job income per month</label>
                <input type="number" className="w-32 rounded border px-2 py-1" value={state.study.workSideMonthlyIncome}
                  onChange={(e) => state.setSideJobIncome(Number(e.target.value))} />
              </div>

              {state.degree === 'bachelor' && !state.currentCareer && state.study.level === 'bachelor' && state.study.remainingMonths <= 0 && (
                <div className="text-sm text-green-700">Bachelor completed. Choose to start a job or continue to a Master.</div>
              )}
            </div>
          )}

          {state.degree === 'bachelor' && !state.isStudying && !state.currentCareer && (
            <div className="rounded border p-4 space-y-3">
              <h3 className="font-semibold">Next steps</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {STUDIES.master.map((p) => (
                  <button key={p.field} className="rounded border p-3 text-left hover:bg-gray-50" onClick={() => state.startStudy(p.field, 'master', p.years, p.annualTuition)}>
                    <div className="font-medium">Master: {p.field}</div>
                    <div className="text-sm text-gray-600">Expected salary after: €{p.expectedMonthlySalary.toLocaleString()}</div>
                  </button>
                ))}
                <button className="rounded border p-3 text-left hover:bg-gray-50" onClick={() => state.startJob('Entry-level in field', 3500)}>
                  <div className="font-medium">Start a job</div>
                  <div className="text-sm text-gray-600">Salary depends on field</div>
                </button>
              </div>
            </div>
          )}

          {state.degree === 'master' && !state.isStudying && !state.currentCareer && (
            <div className="rounded border p-4 space-y-3">
              <h3 className="font-semibold">Next steps</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {STUDIES.phd.map((p) => (
                  <button key={p.field} className="rounded border p-3 text-left hover:bg-gray-50" onClick={() => state.startStudy(p.field, 'phd', p.years, p.annualTuition)}>
                    <div className="font-medium">PhD: {p.field}</div>
                    <div className="text-sm text-gray-600">Expected salary after: €{p.expectedMonthlySalary.toLocaleString()}</div>
                  </button>
                ))}
                <button className="rounded border p-3 text-left hover:bg-gray-50" onClick={() => state.startJob('Advanced role', 5500)}>
                  <div className="font-medium">Start a job</div>
                </button>
              </div>
            </div>
          )}

          {state.degree === 'phd' && !state.isStudying && !state.currentCareer && (
            <div className="rounded border p-4 space-y-3">
              <h3 className="font-semibold">Choose a job</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {['Senior Researcher', 'Quant Analyst', 'R&D Manager'].map((t, i) => (
                  <button key={t} className="rounded border p-3 text-left hover:bg-gray-50" onClick={() => state.startJob(t, 7000 + i * 500)}>
                    <div className="font-medium">{t}</div>
                    <div className="text-sm text-gray-600">Monthly salary: €{(7000 + i * 500).toLocaleString()}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="rounded border p-4 space-y-4">
            <h3 className="font-semibold">Housing</h3>
            <div className="flex flex-wrap gap-2">
              <button className="rounded border px-3 py-2" onClick={() => state.chooseLiving('home', 0)}>Live at home</button>
              {LIVING_RENTS.map((r) => (
                <button key={r.sizeLabel} className="rounded border px-3 py-2" onClick={() => state.chooseLiving('rented', r.monthlyRent, r.sizeLabel)}>
                  Rent {r.sizeLabel} (€{r.monthlyRent})
                </button>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="rounded border p-3">
                <div className="font-medium mb-2">Buy house (cash)</div>
                <HouseBuyer mode="cash" />
              </div>
              <div className="rounded border p-3">
                <div className="font-medium mb-2">Buy house (mortgage)</div>
                <HouseBuyer mode="mortgage" />
              </div>
            </div>
          </div>

          <div className="rounded border p-4 space-y-3">
            <h3 className="font-semibold">Car</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { tier: 'none', label: 'No car', cost: 0 },
                { tier: 'used', label: 'Used', cost: 100 },
                { tier: 'compact', label: 'Compact', cost: 200 },
                { tier: 'sedan', label: 'Sedan', cost: 350 },
                { tier: 'luxury', label: 'Luxury', cost: 600 }
              ].map((c) => (
                <button key={c.tier} className={`rounded border px-3 py-2 ${state.car?.tier === c.tier ? 'bg-indigo-50 border-indigo-400' : ''}`} onClick={() => state.setCar(c.tier as any, c.cost)}>
                  {c.label} (€{c.cost}/mo)
                </button>
              ))}
            </div>
          </div>

          <div className="rounded border p-4 space-y-3">
            <h3 className="font-semibold">Investments</h3>
            <div className="flex gap-2">
              <button className="rounded border px-3 py-2" onClick={() => state.invest('etf', 500)}>Invest €500 in ETF</button>
              <button className="rounded border px-3 py-2" onClick={() => state.invest('bond', 500)}>Invest €500 in Bonds</button>
              <button className="rounded border px-3 py-2" onClick={() => state.invest('real_estate', 1000)}>Invest €1000 in REIT</button>
            </div>
          </div>

          <div className="rounded border p-4 space-y-3">
            <h3 className="font-semibold">Loans</h3>
            <LoanForm />
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Kind</th>
                    <th className="py-2 pr-4">Principal</th>
                    <th className="py-2 pr-4">APR</th>
                    <th className="py-2 pr-4">Monthly</th>
                  </tr>
                </thead>
                <tbody>
                  {state.loans.map((l, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2 pr-4">{l.kind}</td>
                      <td className="py-2 pr-4">€{l.principal.toLocaleString()}</td>
                      <td className="py-2 pr-4">{(l.rateAPR * 100).toFixed(2)}%</td>
                      <td className="py-2 pr-4">€{l.monthlyPayment.toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded border p-4 space-y-2">
            <h3 className="font-semibold">Month Summary</h3>
            <div className="text-sm text-gray-700">Income: €{income.toFixed(0)} | Expenses: €{fixedExpenses.toFixed(0)} | Net: €{net.toFixed(0)} | Cash: €{state.cash.toFixed(0)}</div>
            <button className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700" onClick={() => state.nextMonth()}>
              Confirm End of Month
            </button>
            <button className="ml-2 rounded border px-4 py-2" onClick={() => state.triggerOffer()}>Trigger Offer</button>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded border p-4">
            <h3 className="font-semibold mb-2">Status</h3>
            <ul className="space-y-1 text-sm">
              <li>Career: {state.currentCareer ? `${state.currentCareer.title} (€${state.currentCareer.monthlySalary})` : state.isStudying ? 'Studying' : 'None'}</li>
              <li>Degree: {state.degree}</li>
              <li>Living: {state.living.mode}{state.living.sizeLabel ? ` (${state.living.sizeLabel})` : ''}</li>
              <li>Investments passive income: €{state.investments.reduce((s, i) => s + i.monthlyYield, 0).toFixed(0)}</li>
              <li>Extras monthly: €{state.lifestyleExtrasMonthly.toFixed(0)}</li>
              {state.jobSearchCooldownMonths > 0 && <li className="text-amber-700">Job search: {state.jobSearchCooldownMonths} months</li>}
            </ul>
          </div>

          <div className="rounded border p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Monthly Spreadsheet (last 12)</h3>
              <button className="rounded border px-3 py-1 text-sm" onClick={() => exportCSV(state)}>Export CSV</button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs md:text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-3">Month</th>
                    <th className="py-2 pr-3">Income</th>
                    <th className="py-2 pr-3">Passive</th>
                    <th className="py-2 pr-3">Expenses</th>
                    <th className="py-2 pr-3">Invested</th>
                    <th className="py-2 pr-3">Liabilities</th>
                    <th className="py-2 pr-3">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {state.monthHistory.slice(-12).map((h) => (
                    <tr key={h.monthIndex} className="border-b">
                      <td className="py-2 pr-3">{h.monthIndex}</td>
                      <td className="py-2 pr-3">€{h.budget.income.toFixed(0)}</td>
                      <td className="py-2 pr-3">€{h.budget.passiveIncome.toFixed(0)}</td>
                      <td className="py-2 pr-3">€{h.budget.expenses.toFixed(0)}</td>
                      <td className="py-2 pr-3">€{h.budget.investments.toFixed(0)}</td>
                      <td className="py-2 pr-3">€{h.budget.liabilities.toFixed(0)}</td>
                      <td className="py-2 pr-3">€{(h.budget.income - h.budget.expenses).toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {!state.isStudying && (
            <div className="rounded border p-4">
              <h3 className="font-semibold mb-2">Education while working</h3>
              {state.degree === 'none' && (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {STUDIES.bachelor.map((p) => (
                    <button key={p.field} className="rounded border p-3 text-left hover:bg-gray-50" onClick={() => state.startStudy(p.field, 'bachelor', p.years, p.annualTuition)}>
                      <div className="font-medium">Bachelor: {p.field}</div>
                      <div className="text-sm text-gray-600">Expected salary after: €{p.expectedMonthlySalary.toLocaleString()}</div>
                    </button>
                  ))}
                </div>
              )}
              {state.degree === 'bachelor' && (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {STUDIES.master.map((p) => (
                    <button key={p.field} className="rounded border p-3 text-left hover:bg-gray-50" onClick={() => state.startStudy(p.field, 'master', p.years, p.annualTuition)}>
                      <div className="font-medium">Master: {p.field}</div>
                      <div className="text-sm text-gray-600">Expected salary after: €{p.expectedMonthlySalary.toLocaleString()}</div>
                    </button>
                  ))}
                </div>
              )}
              {state.degree === 'master' && (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {STUDIES.phd.map((p) => (
                    <button key={p.field} className="rounded border p-3 text-left hover:bg-gray-50" onClick={() => state.startStudy(p.field, 'phd', p.years, p.annualTuition)}>
                      <div className="font-medium">PhD: {p.field}</div>
                      <div className="text-sm text-gray-600">Expected salary after: €{p.expectedMonthlySalary.toLocaleString()}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="rounded border p-4">
            <h3 className="font-semibold mb-2">Family</h3>
            <div className="space-x-2">
              {!state.dependents.spouse && <button className="rounded border px-3 py-2" onClick={() => state.marry()}>Marry</button>}
              <button className="rounded border px-3 py-2" onClick={() => state.addChild()}>Add Child</button>
            </div>
          </div>

          {state.achievedFI && (
            <div className="rounded border p-4 bg-green-50">
              <div className="font-semibold">Congratulations!</div>
              <p className="text-sm">You have reached financial independence.</p>
              {!state.leaderboardSubmitted && (
                <div className="mt-3">
                  <button className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700" onClick={() => setShowFIForm(true)}>Submit to Leaderboard</button>
                </div>
              )}
            </div>
          )}

          {state.pendingOffers.length > 0 && (
            <div className="rounded border p-4 bg-yellow-50">
              <h3 className="font-semibold mb-2">Offers</h3>
              <div className="space-y-2">
                {state.pendingOffers.map((o) => (
                  <div key={o.id} className="rounded border p-2 bg-white">
                    <div className="text-sm">{o.description} {o.costMonthly ? `(€${o.costMonthly}/mo)` : ''} {o.oneTimeCost ? `(€${o.oneTimeCost} one-time)` : ''}</div>
                    <div className="mt-2 space-x-2">
                      <button className="rounded bg-emerald-600 px-3 py-1 text-white" onClick={() => state.acceptOffer(o.id)}>Accept</button>
                      <button className="rounded border px-3 py-1" onClick={() => state.declineOffer(o.id)}>Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded border p-4">
            <h3 className="font-semibold mb-2">Random Events</h3>
            <button className="rounded border px-3 py-2" onClick={() => state.randomEvent()}>Trigger Random Event</button>
          </div>
        </aside>
      </section>

      <Modal open={showIntro} onClose={() => setShowIntro(false)}>
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Welcome to FinanzStart</h2>
          <p>
            Welcome to "FinanzStart", your easy way to learn financial responsibility and start your journey to your personal
            financial freedom. Every player starts at the same place. Fresh out of High School you can choose your career path.
            Your decisions during the game will lead you to financial success or financial failure. Choose wisely.
          </p>
          <div className="text-right">
            <button className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700" onClick={() => setShowIntro(false)}>Begin</button>
          </div>
        </div>
      </Modal>

      <Modal open={showFIForm} onClose={() => setShowFIForm(false)}>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Add your name to the Leaderboards</h3>
          <input className="w-full rounded border px-3 py-2" placeholder="Your name" value={playerName} onChange={(e) => setPlayerName(e.target.value)} />
          <div className="text-right space-x-2">
            <button className="rounded border px-4 py-2" onClick={() => setShowFIForm(false)}>Cancel</button>
            <button
              className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
              onClick={async () => {
                const ageAtFI = state.ageMonths;
                const passive = state.investments.reduce((s, i) => s + i.monthlyYield, 0);
                await fetch('/api/leaderboard/db-route', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ playerName, retirementAgeMonths: ageAtFI, passiveIncomeAtRetirement: passive }) });
                useGameStore.getState().submitLeaderboardFlag();
                setShowFIForm(false);
              }}
            >
              Submit
            </button>
          </div>
        </div>
      </Modal>
    </main>
  );
}

function HouseBuyer({ mode }: { mode: 'cash' | 'mortgage' }) {
  const state = useGameStore();
  const [price, setPrice] = useState(150000);
  const [rate, setRate] = useState(0.04);
  const [years, setYears] = useState(25);
  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-center gap-2">
        <label className="w-24">Price</label>
        <input type="number" className="w-36 rounded border px-2 py-1" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
      </div>
      {mode === 'mortgage' && (
        <>
          <div className="flex items-center gap-2">
            <label className="w-24">Rate (APR)</label>
            <input type="number" step="0.001" className="w-36 rounded border px-2 py-1" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-24">Years</label>
            <input type="number" className="w-36 rounded border px-2 py-1" value={years} onChange={(e) => setYears(Number(e.target.value))} />
          </div>
        </>
      )}
      <div>
        {mode === 'cash' ? (
          <button className="rounded border px-3 py-2" onClick={() => state.buyHouseCash(price)}>Buy Cash</button>
        ) : (
          <button className="rounded border px-3 py-2" onClick={() => state.buyHouseMortgage(price, rate, years)}>Buy with Mortgage</button>
        )}
      </div>
    </div>
  );
}

function LoanForm() {
  const state = useGameStore();
  const [amount, setAmount] = useState(5000);
  const [apr, setApr] = useState(0.08);
  const [years, setYears] = useState(3);
  return (
    <div className="flex flex-wrap items-end gap-3 text-sm">
      <div>
        <label className="block text-xs text-gray-600">Amount</label>
        <input type="number" className="w-36 rounded border px-2 py-1" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
      </div>
      <div>
        <label className="block text-xs text-gray-600">APR</label>
        <input type="number" step="0.001" className="w-28 rounded border px-2 py-1" value={apr} onChange={(e) => setApr(Number(e.target.value))} />
      </div>
      <div>
        <label className="block text-xs text-gray-600">Years</label>
        <input type="number" className="w-24 rounded border px-2 py-1" value={years} onChange={(e) => setYears(Number(e.target.value))} />
      </div>
      <button className="rounded border px-3 py-2" onClick={() => state.takePersonalLoan(amount, apr, years)}>Take Personal Loan</button>
    </div>
  );
}

function exportCSV(state: PlayerState) {
  const rows = [['Month','Income','Passive','Expenses','Invested','Liabilities','Net']];
  for (const h of state.monthHistory) {
    const net = h.budget.income - h.budget.expenses;
    rows.push([String(h.monthIndex), String(Math.round(h.budget.income)), String(Math.round(h.budget.passiveIncome)), String(Math.round(h.budget.expenses)), String(Math.round(h.budget.investments)), String(Math.round(h.budget.liabilities)), String(Math.round(net))]);
  }
  const csv = rows.map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'finanzstart_spreadsheet.csv';
  a.click();
  URL.revokeObjectURL(url);
}

