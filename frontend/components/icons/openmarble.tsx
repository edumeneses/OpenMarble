import type { SVGProps } from 'react'

const OpenMarbleIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" {...props}>
    <circle
      cx="12"
      cy="12"
      r="9.5"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <ellipse
      cx="12"
      cy="12"
      rx="4"
      ry="9.5"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <path
      d="M3 9h18M3 15h18"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
)
export default OpenMarbleIcon
