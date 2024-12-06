'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ListingPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.push('/listing/token-information');
  }, [router]);

  return null;
};

export default ListingPage;
