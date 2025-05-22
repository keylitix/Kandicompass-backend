export const isValidString = (val: string): boolean => {
  if (val === null || val === undefined || val === '' || typeof val !== 'string') {
    return false;
  }
  return true;
};
