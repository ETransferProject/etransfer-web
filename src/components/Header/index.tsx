import Head from 'next/head';
import React from 'react';
import MobileHeader from './MobileHeader';
import WebHeader from './WebHeader';
import { useCommonState } from 'store/Provider/hooks';
import styles from './styles.module.scss';
import { BrandName } from 'constants/index';

export type DefaultHeadProps = { title?: string; description?: string };

export default function Header(props: DefaultHeadProps) {
  const { isPadPX } = useCommonState();
  return (
    <div className={styles['header-wrapper']}>
      <DefaultHead {...props} />
      {isPadPX ? <MobileHeader /> : <WebHeader />}
    </div>
  );
}

export function DefaultHead({ title = BrandName, description }: DefaultHeadProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <meta
        name="viewport"
        content="width=device-width,height=device-height,inital-scale=1.0,maximum-scale=1.0,user-scalable=no;"
      />
      <meta name="description" content={description || title} />
    </Head>
  );
}
