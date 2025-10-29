import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default function SignupPage(props: { searchParams?: { message?: string } }) {
  const signUp = async (formData: FormData) => {
    'use server'
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = await createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_type: 'agent',
        },
      },
    })

    if (error) {
      return redirect(`/signup?message=${encodeURIComponent(error.message)}`)
    }

    return redirect('/signup/confirm')
  }

  const message = props.searchParams?.message

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-12 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-indigo-100">Join us as an agent today</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Error Message */}
            {message && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm font-medium">{message}</p>
              </div>
            )}

            {/* Form */}
            <form action={signUp} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Password must be at least 6 characters
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all duration-300"
              >
                Create Account
              </button>
            </form>

            {/* Sign In Link */}
            <div className="text-center pt-6 border-t border-gray-200">
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <a href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6">
          By signing up, you agree to our{' '}
          <a href="#" className="text-indigo-600 hover:underline font-medium">
            Terms & Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}