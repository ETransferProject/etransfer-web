import Link from 'next/link';
import { ReactNode } from 'react';

interface ILinkForBlankProps {
  href: string;
  className?: string;
  ariaLabel?: string;
  element?: ReactNode;
}
export default function LinkForBlank({ href, className, ariaLabel, element }: ILinkForBlankProps) {
  return (
    <Link
      href={href}
      passHref
      className={className}
      target="_blank"
      aria-label={ariaLabel}
      rel="noopener noreferrer">
      {element}
    </Link>
  );
}
