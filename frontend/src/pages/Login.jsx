import { useState } from 'react'
import {
  LayoutDashboard,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import { authAPI } from '../api/admin'

const Login = ({ onLogin }) => {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const isLogin = mode === 'login'

  // Password validation function
  const validatePassword = (pwd) => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters long'
    }
    if (pwd.toLowerCase().includes('password')) {
      return 'Password cannot contain the word "password"'
    }
    return ''
  }

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    setPasswordError(validatePassword(newPassword))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      setErrorMessage('Email and password are required')
      return
    }

    if (!isLogin && !name) {
      setErrorMessage('Full name is required for signup')
      return
    }

    // Validate password before submitting
    const error = validatePassword(password)
    if (error) {
      setPasswordError(error)
      return
    }

    setErrorMessage('')
    setIsLoading(true)

    try {
      const response = isLogin
        ? await authAPI.login(email, password)
        : await authAPI.register(
            name.trim().toLowerCase().replace(/\s+/g, '_'),
            email,
            password,
            name,
          )

      if (!response || response.success === false) {
        setErrorMessage(response?.message || 'Unable to process authentication')
        return
      }

      if (!response.data?.access_token) {
        setErrorMessage('Signup or login failed: no valid token returned')
        return
      }

      onLogin(response.data)
      setEmail('')
      setPassword('')
      setName('')
      setShowPassword(false)
      setPasswordError('')
    } catch (error) {
      setErrorMessage(
        error?.message || typeof error === 'string' ? error : 'Network error'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const switchMode = () => {
    setMode(isLogin ? 'signup' : 'login')
    setEmail('')
    setPassword('')
    setName('')
    setShowPassword(false)
    setPasswordError('')
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030712] text-white">

      {/* ================= BACKGROUND ================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div
          className="
            absolute
            -left-40
            -top-40
            h-[420px]
            w-[420px]
            rounded-full
            bg-violet-600/[0.10]
            blur-[120px]
          "
        />

        <div
          className="
            absolute
            -right-40
            top-[20%]
            h-[450px]
            w-[450px]
            rounded-full
            bg-indigo-600/[0.08]
            blur-[130px]
          "
        />

        <div
          className="
            absolute
            bottom-[-250px]
            left-[35%]
            h-[500px]
            w-[500px]
            rounded-full
            bg-purple-600/[0.06]
            blur-[140px]
          "
        />

      </div>

      {/* ================= MAIN ================= */}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10">

        <div className="w-full max-w-[1040px]">

          {/* ================= MAIN CARD ================= */}

          <div
            className="
              grid
              overflow-hidden
              rounded-[28px]
              border
              border-white/[0.07]
              bg-[#070c19]/95
              shadow-[0_35px_100px_-45px_rgba(0,0,0,0.95)]
              backdrop-blur-xl
              lg:grid-cols-[1.1fr_0.9fr]
            "
          >

            {/* ==================================================
                LEFT CONTENT
            ================================================== */}

            <div className="p-8 sm:p-10 lg:p-12">

              {/* Badge */}

              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-indigo-400/20
                  bg-indigo-500/[0.07]
                  px-3
                  py-1.5
                "
              >

                <Sparkles className="h-3.5 w-3.5 text-indigo-300" />

                <span
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.25em]
                    text-[#fff]
                  "
                >
                  PMS Workspace
                </span>

              </div>

              {/* Heading */}

              <h1
                className="
                  mt-7
                  max-w-[560px]
                  text-[38px]
                  font-semibold
                  leading-[1.08]
                  tracking-[-0.04em]
                  sm:text-[46px]
                "
              >
                <span
                  className="
                    bg-gradient-to-r
                    from-indigo-300
                    via-violet-300
                    to-white-400
                    to-purple-300
                    bg-clip-text
                    text-transparent
                  "
                >
               AeroPilot 
               <br></br>Project Management for a smoother{' '}
                </span> 

                <span
                  className="
                    bg-gradient-to-r
                    from-indigo-300
                    via-violet-300
                    to-purple-300
                    bg-clip-text
                    text-transparent
                  "
                >
                  project workflow.
                </span>
              </h1>

              {/* Description */}

              <p
                className="
                  mt-5
                  max-w-[500px]
                  text-sm
                  leading-6
                  text-slate-400
                "
              >
                Log in quickly, stay secure, and access your dashboard
                with a clean interface built for focused project work.
              </p>

              {/* Small Features */}

              <div className="mt-11 grid gap-3 sm:grid-cols-2">

                <div
                  className="
                    rounded-xl
                    border
                    border-white/[0.07]
                    bg-white/[0.018]
                    px-4
                    py-3
                  "
                >

                  <p
                    className="
                      text-[9px]
                      uppercase
                      tracking-[0.2em]
                      text-slate-600
                    "
                  >
                    Fast access
                  </p>

                  <div className="mt-2 flex items-center gap-2">

                    <CheckCircle2 className="h-4 w-4 text-indigo-400" />

                    <span className="text-sm font-medium text-slate-200">
                      Instant sign in
                    </span>

                  </div>

                </div>

                <div
                  className="
                    rounded-xl
                    border
                    border-white/[0.07]
                    bg-white/[0.018]
                    px-4
                    py-3
                  "
                >

                  <p
                    className="
                      text-[9px]
                      uppercase
                      tracking-[0.2em]
                      text-slate-600
                    "
                  >
                    Safe login
                  </p>

                  <div className="mt-2 flex items-center gap-2">

                    <CheckCircle2 className="h-4 w-4 text-violet-400" />

                    <span className="text-sm font-medium text-slate-200">
                      Secure connection
                    </span>

                  </div>

                </div>

              </div>

              {/* Security */}

              <div
                className="
                  mt-5
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  border
                  border-white/[0.06]
                  bg-white/[0.018]
                  px-4
                  py-3
                "
              >

                <div
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-indigo-500/[0.08]
                  "
                >

                  <ShieldCheck className="h-4 w-4 text-indigo-300" />

                </div>

                <p className="text-[11px] leading-5 text-slate-500">
                  Your information is protected with modern encryption
                  and a secure authentication process.
                </p>

              </div>

            </div>

            {/* ==================================================
                RIGHT LOGIN
            ================================================== */}

            <div
              className="
                border-t
                border-white/[0.06]
                p-7
                sm:p-9
                lg:border-l
                lg:border-t-0
                lg:p-10
              "
            >

              {/* Header */}

              <div className="flex items-start justify-between">

                <div>

                  <p
                    className="
                      text-[9px]
                      uppercase
                      tracking-[0.28em]
                      text-indigo-300
                    "
                  >
                    Secure access
                  </p>

                  <h2
                    className="
                      mt-2
                      text-[29px]
                      font-semibold
                      tracking-[-0.03em]
                    "
                  >
                    {isLogin
                      ? 'Welcome back'
                      : 'Create your account'}
                  </h2>

                  <p
                    className="
                      mt-1.5
                      text-xs
                      leading-5
                      text-slate-500
                    "
                  >
                    {isLogin
                      ? 'Sign in to manage your projects and stay on track.'
                      : 'Create your account and start organizing your work.'}
                  </p>

                </div>

                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-gradient-to-br
                    from-indigo-500
                    to-violet-500
                    shadow-lg
                    shadow-indigo-500/20
                  "
                >
                  <LayoutDashboard className="h-5 w-5" />
                </div>

              </div>

              {/* ================= FORM ================= */}

              <form
                onSubmit={handleSubmit}
                className="mt-8"
              >

                {/* NAME */}

                {!isLogin && (
                  <div className="mb-5">

                    <label
                      className="
                        mb-2
                        block
                        text-[11px]
                        font-medium
                        text-slate-300
                      "
                    >
                      Full Name
                    </label>

                    <div className="relative">

                      <User
                        className="
                          pointer-events-none
                          absolute
                          left-3.5
                          top-1/2
                          h-4
                          w-4
                          -translate-y-1/2
                          text-slate-600
                        "
                      />

                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        required
                        autoComplete="name"
                        className="
                          h-11
                          w-full
                          rounded-xl
                          border
                          border-white/[0.09]
                          bg-[#0d1426]
                          px-4
                          pl-10
                          text-[13px]
                          text-white
                          outline-none
                          transition
                          placeholder:text-slate-600
                          hover:border-white/[0.14]
                          focus:border-indigo-500/60
                          focus:bg-[#10182c]
                          focus:ring-4
                          focus:ring-indigo-500/[0.05]
                        "
                      />

                    </div>

                  </div>
                )}

                {/* EMAIL */}

                <div className="mb-5">

                  <label
                    className="
                      mb-2
                      block
                      text-[11px]
                      font-medium
                      text-slate-300
                    "
                  >
                    Email Address
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    className="
                      h-11
                      w-full
                      rounded-xl
                      border
                      border-white/[0.09]
                      bg-[#0d1426]
                      px-4
                      text-[13px]
                      text-white
                      outline-none
                      transition
                      placeholder:text-slate-600
                      hover:border-white/[0.14]
                      focus:border-indigo-500/60
                      focus:bg-[#10182c]
                      focus:ring-4
                      focus:ring-indigo-500/[0.05]
                    "
                  />

                </div>

                {/* PASSWORD */}

                <div className="mb-6">

                  <div className="mb-2 flex items-center justify-between">

                    <label
                      className="
                        text-[11px]
                        font-medium
                        text-slate-300
                      "
                    >
                      Password
                    </label>

                    {isLogin && (
                      <button
                        type="button"
                        className="
                          text-[10px]
                          font-medium
                          text-indigo-300
                          hover:text-indigo-200
                        "
                      >
                        Forgot password?
                      </button>
                    )}

                  </div>

                  <div className="relative">

                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder="Enter your password"
                      required
                      autoComplete={
                        isLogin
                          ? 'current-password'
                          : 'new-password'
                      }
                      className={`
                        h-11
                        w-full
                        rounded-xl
                        border
                        bg-[#0d1426]
                        px-4
                        pr-11
                        text-[13px]
                        text-white
                        outline-none
                        transition
                        placeholder:text-slate-600
                        hover:border-white/[0.14]
                        focus:bg-[#10182c]
                        focus:ring-4
                        focus:ring-indigo-500/[0.05]
                        ${
                          passwordError
                            ? 'border-red-500/50 focus:border-red-500/60'
                            : password.length > 0
                            ? 'border-green-500/50 focus:border-green-500/60'
                            : 'border-white/[0.09]'
                        }
                      `}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="
                        absolute
                        right-2
                        top-1/2
                        flex
                        h-7
                        w-7
                        -translate-y-1/2
                        items-center
                        justify-center
                        rounded-lg
                        text-slate-500
                        transition
                        hover:bg-white/[0.05]
                        hover:text-white
                      "
                      aria-label={
                        showPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>

                  </div>

                  {/* Password Error Message */}
                  {passwordError && (
                    <p className="mt-1.5 text-xs text-red-400">
                      {passwordError}
                    </p>
                  )}

                  {/* API Error Message */}
                  {errorMessage && (
                    <p className="mt-1.5 text-xs text-red-400">
                      {errorMessage}
                    </p>
                  )}

                  {/* Password Strength Indicator */}
                  {!errorMessage && password.length > 0 && !passwordError && (
                    <p className="mt-1.5 text-xs text-green-400">
                      ✓ Password is valid
                    </p>
                  )}

                </div>

                {/* =================================================
                    LOGIN BUTTON
                    REFERENCE SIZE
                ================================================= */}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="
                    flex
                    h-11
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-gradient-to-r
                    from-indigo-500
                    via-violet-500
                    to-purple-500
                    text-[13px]
                    font-semibold
                    text-white
                    shadow-[0_8px_25px_-8px_rgba(99,102,241,0.7)]
                    transition-all
                    duration-200
                    hover:-translate-y-[1px]
                    hover:shadow-[0_12px_30px_-8px_rgba(99,102,241,0.8)]
                    active:translate-y-0
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >

                  {isLoading ? (
                    <>
                      <span
                        className="
                          h-4
                          w-4
                          animate-spin
                          rounded-full
                          border-2
                          border-white/30
                          border-t-white
                        "
                      />

                      {isLogin
                        ? 'Signing in...'
                        : 'Creating account...'}
                    </>
                  ) : (
                    <>
                      <span>
                        {isLogin
                          ? 'Sign In'
                          : 'Create Account'}
                      </span>

                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}

                </button>

              </form>

              {/* ================= DIVIDER ================= */}

              <div className="my-6 flex items-center gap-3">

                <div className="h-px flex-1 bg-white/[0.07]" />

                <span
                  className="
                    text-[9px]
                    uppercase
                    tracking-[0.15em]
                    text-slate-600
                  "
                >
                  or continue with
                </span>

                <div className="h-px flex-1 bg-white/[0.07]" />

              </div>

              {/* ================= SOCIAL ================= */}

              <div className="grid grid-cols-2 gap-3">

                <button
                  type="button"
                  className="
                    flex
                    h-10
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-white/[0.08]
                    bg-white/[0.018]
                    text-[11px]
                    font-medium
                    text-slate-300
                    transition
                    hover:border-white/[0.14]
                    hover:bg-white/[0.04]
                  "
                >

                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    />

                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />

                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />

                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>

                  Google

                </button>

                <button
                  type="button"
                  className="
                    flex
                    h-10
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-white/[0.08]
                    bg-white/[0.018]
                    text-[11px]
                    font-medium
                    text-slate-300
                    transition
                    hover:border-white/[0.14]
                    hover:bg-white/[0.04]
                  "
                >

                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.253-.447-1.27.098-2.646 0 0 .84-.269 2.75 1.025.8-.223 1.65-.334 2.5-.334.85 0 1.7.111 2.5.334 1.91-1.294 2.75-1.025 2.75-1.025.545 1.376.201 2.393.099 2.646.64.698.1 1.591.1 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>

                  GitHub

                </button>

              </div>

              {/* ================= SWITCH ================= */}

              <div
                className="
                  mt-6
                  text-center
                  text-xs
                  text-slate-600
                "
              >

                {isLogin
                  ? "Don't have an account?"
                  : 'Already have an account?'}

                {' '}

                <button
                  type="button"
                  onClick={switchMode}
                  className="
                    font-semibold
                    text-indigo-300
                    transition
                    hover:text-indigo-200
                  "
                >
                  {isLogin
                    ? 'Create Account'
                    : 'Sign In'}
                </button>

              </div>

              {/* Terms */}

              {!isLogin && (
                <p
                  className="
                    mt-3
                    text-center
                    text-[9px]
                    leading-4
                    text-slate-700
                  "
                >
                  By creating an account, you agree to our{' '}

                  <span className="text-indigo-300/70">
                    Terms of Service
                  </span>{' '}

                  and{' '}

                  <span className="text-indigo-300/70">
                    Privacy Policy
                  </span>.
                </p>
              )}

            </div>

          </div>

          {/* Footer */}

          <p className="mt-5 text-center text-[9px] text-[#fff]">
            © 2026 AeroPilot Project Management. All rights reserved.
          </p>

        </div>

      </div>
    </div>
  )
}

export default Login