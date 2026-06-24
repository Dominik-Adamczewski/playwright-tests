export const changeStringToSlug = (string: string): string => {
  return string.toLowerCase().replace(/\s+/g, '-');
};