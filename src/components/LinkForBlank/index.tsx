import Link from 'next/link';
import { ReactNode } from 'react';

interface ILinkForBlankProps {
  href: string;
  className?: string;
  ariaLabel?: string;
  element?: ReactNode;
}
export default function LinkForBlank({ href, className, ariaLabel, element }: ILinkForBlankProps) {
  const isExternalLink = !href.startsWith('/');
  const target = isExternalLink ? '_blank' : '_self';
  return (
    <Link
      href={href}
      passHref
      className={className}
      target={target}
      aria-label={ariaLabel}
      rel="noopener noreferrer">
      {element}
    </Link>
  );
}
