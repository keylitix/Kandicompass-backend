import * as bcrypt from 'bcrypt';

export const generateOTP = (): string => {
  let digits = '0123456789';
  let otp = '';

  for (let i = 0; i < 4; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

export const createHash = (payload: string): string => {
  const hash = bcrypt.hashSync(payload, 10);
  return hash;
};

export const compareHash = (hash_password: string, plain_password: string): boolean => {
  const isMatched = bcrypt.compareSync(plain_password, hash_password);
  return isMatched;
};
