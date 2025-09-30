export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
        <p className="text-gray-600 mb-4">
          Sorry, we couldn't log you in. There was an error with the authentication code.
        </p>
        <a href="/login" className="text-blue-600 hover:text-blue-800 underline">
          Try logging in again
        </a>
      </div>
    </div>
  )
}
