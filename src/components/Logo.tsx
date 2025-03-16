import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Logo: React.FC = () => {
	return (
		<Link href="/" className="flex items-center gap-2">
			<div className="flex items-center bg-black text-white rounded-md px-2 py-1">
				<span className="font-bold text-lg">GND</span>
			</div>
		</Link>
	);
};

export default Logo;
