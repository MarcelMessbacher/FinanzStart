import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <section className="text-center space-y-6">
        <h1 className="text-4xl font-bold">FinanzStart</h1>
        <p className="text-lg text-gray-600">
          Welcome to FinanzStart, your easy way to learn financial responsibility and start your journey
          to your personal financial freedom.
        </p>
        <div className="space-x-4">
          <Link
            className="inline-block rounded bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700"
            href="/game"
          >
            Start Game
          </Link>
          <Link className="inline-block rounded border px-6 py-3 hover:bg-gray-50" href="/leaderboard">
            Leaderboards
          </Link>
        </div>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold">About the game</h2>
        <p>
          Every player starts at the same place. Fresh out of High School you can choose your career path.
          Your decisions during the game will lead you to financial success or financial failure. Choose wisely.
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li>Confirm each month to age and apply income, expenses, and events</li>
          <li>Study with side jobs, or start working right away</li>
          <li>Manage housing, living costs, and investments to reach FI</li>
          <li>Hit FI to submit your result to the leaderboards</li>
        </ul>
      </section>
    </main>
  );
}

