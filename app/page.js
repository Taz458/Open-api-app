import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between px-4 py-8 md:px-12 lg:px-24">
      <div className="w-full max-w-xl bg-gray-900 flex flex-col items-center justify-center text-white rounded-lg shadow-lg py-12 px-4 md:px-8">
        <h1 className="text-4xl font-bold mb-8 text-cyan-400 text-center">
          OpenAI API Testing Suite
        </h1>
        <div className="space-y-4 w-full">
          <Link
            href="/web-search"
            className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-md transition duration-200 block text-center w-full"
          >
            Web Search Demo
          </Link>
          <Link
            href="/openai-tester"
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-md transition duration-200 block text-center w-full"
          >
            Launch Tester
          </Link>
          <Link
            href="/parse-event"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md transition duration-200 block text-center w-full"
          >
            Event Parser
          </Link>
          <Link
            href="/parse-audio"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-md transition duration-200 block text-center w-full"
          >
            Audio & Speech Features
          </Link>
          <Link
            href="/realtime-chat"
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-md transition duration-200 block text-center w-full"
          >
            Realtime Chat
          </Link>
          <Link
            href="/image-analyzer"
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-md transition duration-200 block text-center w-full"
          >
            Image Analyzer
          </Link>
          <Link
            href="/image-generation"
            className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-md transition duration-200 block text-center w-full"
          >
            Image Generation
          </Link>

          <Link
            href="/file-analyzer"
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-md transition duration-200 block text-center w-full"
          >
            File Analyzer
          </Link>

          <Link
            href="/product-description-generator"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition duration-200 block text-center w-full"
          >
            Multimodal Product Description Generator
          </Link>

          <Link
            href="/simple-realtime-chat"
            className="bg-orange-600 hover:bg-orange-700 text-black font-bold py-3 px-6 rounded-md transition duration-200 block text-center w-full"
          >
            Simple Realtime Chat (no audio)
          </Link>
        </div>
      </div>
    </main>
  );
}
