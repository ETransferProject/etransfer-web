/**
 * this function is to format address,just like "formatStr2EllipsisStr" ---> "for...Str"
 * @param address
 * @param digits [pre_count, suffix_count]
 * @param type
 * @returns
 */
export const formatStr2Ellipsis = (
  address = '',
  digits = [10, 10],
  type: 'middle' | 'tail' = 'middle',
): string => {
  if (!address) return '';

  const len = address.length;

  if (type === 'tail') return `${address.slice(0, digits[0])}...`;

  if (len < digits[0] + digits[1]) return address;
  const pre = address.substring(0, digits[0]);
  const suffix = address.substring(len - digits[1]);
  return `${pre}...${suffix}`;
};
