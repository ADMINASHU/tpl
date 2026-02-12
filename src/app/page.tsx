"use client";
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-10">TPL Scoreboard</h1>
      <div className="flex gap-4">
        <Link href="/admin" className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition">
          Admin Panel
        </Link>
        <Link href="/display" className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-700 transition">
          Live Display
        </Link>
      </div>
    </main>
  );
}
