import { OpenLinkIcon } from 'assets/images';
import { useCallback } from 'react';
import { openWithBlank } from 'utils/common';

export type TOpenLink = {
  className?: string;
  href: string;
};
export default function OpenLink({ className, href }: TOpenLink) {
  const handleClick = useCallback(() => {
    openWithBlank(href);
  }, [href]);

  return (
    <div className={className} onClick={handleClick}>
      <OpenLinkIcon></OpenLinkIcon>
    </div>
  );
}
