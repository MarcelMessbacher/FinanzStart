"use client";
import useSWR from 'swr';

type Row = {
  id: string;
  playerName: string;
  retirementAgeMonths: number;
  passiveIncomeAtRetirement: number;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function LeaderboardClient() {
  const { data, error } = useSWR<{ youngest: Row[]; richest: Row[] }>("/api/leaderboard/db-route", fetcher);
  if (error) return <div className="text-red-600">Failed to load</div>;
  if (!data) return <div>Loading…</div>;

  const toYears = (months: number) => `${Math.floor(months / 12)}y ${months % 12}m`;

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold mb-2">Youngest retirement age</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Player</th>
                <th className="py-2 pr-4">Age</th>
              </tr>
            </thead>
            <tbody>
              {data.youngest.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="py-2 pr-4">{r.playerName}</td>
                  <td className="py-2 pr-4">{toYears(r.retirementAgeMonths)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Highest passive income at retirement</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Player</th>
                <th className="py-2 pr-4">Passive Income</th>
              </tr>
            </thead>
            <tbody>
              {data.richest.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="py-2 pr-4">{r.playerName}</td>
                  <td className="py-2 pr-4">€{r.passiveIncomeAtRetirement.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

