import bcrypt from 'bcrypt';

export const hashPassword = async (password) => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};
