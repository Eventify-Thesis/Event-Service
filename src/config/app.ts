import * as process from 'process';

export default () => ({
  PORT: parseInt(process.env.PORT, 10) || 9999,
  BCRYPT: {
    HASH_ROUNDS: Number(process.env.BCRYPT_HASH_ROUNDS || 10),
  },
  AWS: {
    AWS_REGION: process.env.AWS_REGION,
    ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_PUBLIC_BUCKET_NAME: process.env.AWS_PUBLIC_BUCKET_NAME,
  },
  CLERK_CUSTOM_TEMPLATE: process.env.CLERK_CUSTOM_TEMPLATE || 'test',
});
