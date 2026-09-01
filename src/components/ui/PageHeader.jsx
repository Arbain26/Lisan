import { motion } from "framer-motion";

/**
 * Reusable PageHeader Component for Public Pages
 * Enhances visual hierarchy, accessibility, and modern glassmorphic aesthetic.
 */
const PageHeader = ({ 
  title, 
  subtitle, 
  badge,
  breadcrumbs = []
}) => {
  return (
    <header
      className="relative pt-32 pb-24 sm:pt-36 sm:pb-28 flex items-center justify-center overflow-hidden"
      style={{
        background: "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(185, 28, 28, 0.25), rgba(17, 24, 39, 1))"
      }}
    >
      {/* Background Decorative Grid */}
      <div 
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.07] pointer-events-none" 
        style={{ 
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(245, 158, 11, 0.8) 1px, transparent 0)", 
          backgroundSize: "32px 32px" 
        }} 
      />

      {/* Ambient Glowing Orbs */}
      <div 
        aria-hidden="true"
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-[550px] h-[250px] bg-red-600/20 blur-[100px] rounded-full pointer-events-none" 
      />
      <div 
        aria-hidden="true"
        className="absolute -bottom-10 right-10 w-72 h-72 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none" 
      />

      <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6">
        {/* Badge */}
        {badge && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 backdrop-blur-md"
            style={{ 
              background: "rgba(245, 158, 11, 0.12)", 
              border: "1px solid rgba(245, 158, 11, 0.3)" 
            }}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-amber-300 text-xs font-inter font-bold uppercase tracking-wider">
              {badge}
            </span>
          </motion.div>
        )}

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="font-poppins font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight mb-4"
        >
          {title}
        </motion.h1>

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="text-gray-300 font-inter text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            {subtitle}
          </motion.p>
        )}

        {/* Optional Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <motion.nav
            aria-label="Breadcrumb"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400"
          >
            {breadcrumbs.map((crumb, idx) => (
              <span key={idx} className="flex items-center gap-2">
                {idx > 0 && <span>/</span>}
                <span className={idx === breadcrumbs.length - 1 ? "text-amber-400 font-semibold" : ""}>
                  {crumb.label}
                </span>
              </span>
            ))}
          </motion.nav>
        )}
      </div>

      {/* Subtle bottom separator border */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
    </header>
  );
};

export default PageHeader;
