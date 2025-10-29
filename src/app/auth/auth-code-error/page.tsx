export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="relative flex flex-col m-6 space-y-8 bg-white shadow-2xl rounded-2xl p-8 md:p-14">
        <h1 className="text-2xl font-bold text-gray-800">Authentication Error</h1>
        <p className="text-gray-600">
          There was an error authenticating your account. Please try again.
        </p>
      </div>
    </div>
  )
}
