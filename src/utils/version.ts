export function compareVersion(version1: string, version2: string) {
  const version1CharsArray = version1.split('.');
  const version2CharsArray = version2.split('.');
  const length1 = version1CharsArray.length;
  const length2 = version2CharsArray.length;

  const minlength = Math.min(length1, length2);
  let i = 0;
  for (i; i < minlength; i++) {
    const a = parseInt(version1CharsArray[i]);
    const b = parseInt(version2CharsArray[i]);
    if (a > b) {
      return 1;
    } else if (a < b) {
      return -1;
    }
  }
  if (length1 > length2) {
    for (let j = i; j < length1; j++) {
      if (parseInt(version1CharsArray[j]) != 0) {
        return 1;
      }
    }
    return 0;
  } else if (length1 < length2) {
    for (let j = i; j < length2; j++) {
      if (parseInt(version2CharsArray[j]) != 0) {
        return -1;
      }
    }
    return 0;
  }
  return 0;
}
