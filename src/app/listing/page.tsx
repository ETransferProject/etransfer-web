'use client';
import CircleLoading from 'components/CircleLoading';
import dynamic from 'next/dynamic';

export default dynamic(() => import('pageComponents/ListingContent'), {
  ssr: false,
  loading: () => (
    <div className="row-center pre-loading">
      <CircleLoading />
    </div>
  ),
});
