import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // experimental:{
  //   ppr: 'incremental'
  // }
  api: {
    bodyParser: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kr-next-js-bucket.s3.us-east-2.amazonaws.com'
      },
    ]
  }
  
};

export default nextConfig;
