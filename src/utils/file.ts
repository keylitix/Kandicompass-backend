import { extname } from 'path';

export const genrateFileName = (file): string => {
  const ext_name = extname(file.originalname);
  const renamed = Date.now() + ext_name;
  return renamed;
};
