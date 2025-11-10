import * as React from "react"

const Badge = React.forwardRef(({ className = "", variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-gray-900 text-white hover:bg-gray-800",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    outline: "text-gray-900 border border-gray-300",
  }

  return (
    <div
      ref={ref}
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${variants[variant]} ${className}`}
      {...props}
    />
  )
})
Badge.displayName = "Badge"

export { Badge }