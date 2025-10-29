export default function SignupConfirmPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="relative flex flex-col m-6 space-y-8 bg-white shadow-2xl rounded-2xl p-8 md:p-14">
        <h1 className="text-2xl font-bold text-gray-800">Check your email</h1>
        <p className="text-gray-600">
          We have sent you an email with a confirmation link. Please click the link to activate your account.
        </p>
      </div>
    </div>
  )
}
