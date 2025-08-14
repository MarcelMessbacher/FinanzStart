import LeaderboardClient from './table';

export default async function LeaderboardPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">Leaderboards</h1>
      <LeaderboardClient />
    </main>
  );
}

