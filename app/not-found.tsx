import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='min-h-screen bg-[#FFF8E8] flex flex-col items-center justify-center p-6'>
      <div className='text-center max-w-md mx-auto'>
        <h1 className='text-6xl font-bold text-gray-900 mb-4'>404</h1>
        <h2 className='text-2xl font-bold text-gray-900 mb-4 junegull-font'>
          Page Not Found
        </h2>
        <p className='text-gray-700 nunito-font mb-8'>
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href='/dashboard'
          className='inline-block py-3 px-6 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-lg transition-colors duration-300 nunito-font'
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
