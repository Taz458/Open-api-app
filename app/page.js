import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
      <h1 className="text-4xl font-bold mb-8 text-cyan-400">OpenAI API Testing Suite</h1>
      <Link 
        href="/openai-tester" 
        className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-md transition duration-200"
      >
        Launch Tester
      </Link>
    </div>
  );
}
