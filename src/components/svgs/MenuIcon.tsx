import React from "react"

interface MenuIconProps {
	className?: string
	size?: number
}

export const MenuIcon: React.FC<MenuIconProps> = ({ className = "w-4 h-4", size }) => {
	const sizeStyle = size ? { width: size, height: size } : {}

	return (
		<svg
			className={className}
			style={sizeStyle}
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M4 6h16M4 12h16M4 18h7"
			/>
		</svg>
	)
} 