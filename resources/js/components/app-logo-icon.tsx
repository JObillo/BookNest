import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <img src="philcstlogo.png" 
        alt="PhilCST Logo" 
        className='w-24 h-24 object-contain'
        />
    );
}
