export function HeroIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-blue-500/20 via-cyan-400/20 to-indigo-400/10 blur-2xl" />
      <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white/90 p-6 shadow-card backdrop-blur">
        <svg
          viewBox="0 0 480 340"
          className="h-auto w-full"
          role="img"
          aria-label="Healthcare AI dashboard illustration"
        >
          <defs>
            <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#EFF6FF" />
              <stop offset="100%" stopColor="#ECFEFF" />
            </linearGradient>
            <linearGradient id="pulseGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width="480" height="340" rx="20" fill="url(#bgGrad)" />

          {/* Top portal bar */}
          <rect x="24" y="22" width="432" height="44" rx="12" fill="#FFFFFF" stroke="#DBEAFE" />
          <circle cx="48" cy="44" r="10" fill="#2563EB" />
          <path d="M44 44h8M48 40v8" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
          <rect x="68" y="38" width="130" height="12" rx="6" fill="#CBD5E1" />
          <rect x="356" y="34" width="84" height="20" rx="10" fill="#E0F2FE" />
          <rect x="370" y="41" width="56" height="6" rx="3" fill="#06B6D4" />

          {/* Left AI Assistant card */}
          <rect x="24" y="82" width="256" height="156" rx="16" fill="#FFFFFF" stroke="#DBEAFE" />
          <rect x="42" y="100" width="96" height="10" rx="5" fill="#2563EB" opacity="0.85" />
          <rect x="42" y="122" width="208" height="28" rx="10" fill="#EFF6FF" />
          <rect x="54" y="132" width="150" height="8" rx="4" fill="#60A5FA" />
          <rect x="42" y="160" width="218" height="36" rx="10" fill="#ECFEFF" />
          <rect x="54" y="170" width="184" height="7" rx="3.5" fill="#06B6D4" />
          <rect x="54" y="182" width="128" height="7" rx="3.5" fill="#67E8F9" />
          {/* Pulse line */}
          <path
            d="M42 216 H95 L108 202 L120 228 L133 206 L144 216 H256"
            fill="none"
            stroke="url(#pulseGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Right Lab Report card */}
          <rect x="296" y="82" width="160" height="156" rx="16" fill="#FFFFFF" stroke="#DBEAFE" />
          <rect x="314" y="100" width="80" height="10" rx="5" fill="#0F172A" opacity="0.8" />
          <rect x="314" y="124" width="124" height="24" rx="8" fill="#F0FDF4" />
          <circle cx="328" cy="136" r="5" fill="#10B981" />
          <rect x="340" y="132" width="76" height="8" rx="4" fill="#86EFAC" />

          <rect x="314" y="156" width="124" height="24" rx="8" fill="#EFF6FF" />
          <circle cx="328" cy="168" r="5" fill="#2563EB" />
          <rect x="340" y="164" width="84" height="8" rx="4" fill="#93C5FD" />

          <rect x="314" y="188" width="124" height="24" rx="8" fill="#FFFBEB" />
          <circle cx="328" cy="200" r="5" fill="#F59E0B" />
          <rect x="340" y="196" width="68" height="8" rx="4" fill="#FCD34D" />

          {/* Bottom Safety & Vision strip */}
          <rect x="24" y="254" width="432" height="62" rx="16" fill="#FFFFFF" stroke="#DBEAFE" />
          <circle cx="56" cy="285" r="16" fill="#DBEAFE" />
          <path
            d="M56 277l7 3v5c0 4.5-3 8.2-7 9.5-4-1.3-7-5-7-9.5v-5l7-3z"
            fill="#2563EB"
          />
          <rect x="84" y="274" width="170" height="9" rx="4.5" fill="#1E293B" opacity="0.85" />
          <rect x="84" y="290" width="240" height="7" rx="3.5" fill="#94A3B8" />
          <rect x="356" y="273" width="82" height="24" rx="12" fill="url(#pulseGrad)" />
          <rect x="372" y="282" width="50" height="6" rx="3" fill="#FFFFFF" />
        </svg>
      </div>
    </div>
  );
}
