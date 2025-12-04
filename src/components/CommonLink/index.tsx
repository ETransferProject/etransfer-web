import LinkOutlined from '@ant-design/icons/LinkOutlined';
import { Button } from 'antd';
import React from 'react';
import { isUrl } from '../../utils/reg';
import clsx from 'clsx';
import { useCommonState } from 'store/Provider/hooks';

export default function CommonLink({
  href,
  children,
  className,
  showIcon = true,
  isTagA,
}: {
  href: string;
  children?: React.ReactNode;
  className?: string;
  showIcon?: boolean;
  isTagA?: boolean;
}) {
  const { isMobile } = useCommonState();
  const target = isMobile ? '_self' : '_blank';
  if (isTagA)
    return (
      <a target={target} href={href} rel="noreferrer">
        {children}
      </a>
    );
  return (
    <Button
      className={clsx('common-link', className)}
      disabled={!href || !isUrl(href)}
      onClick={(e) => e.stopPropagation()}
      target={target}
      type="link"
      href={href}>
      {showIcon && <LinkOutlined />}
      {children}
    </Button>
  );
}
