/* eslint-disable no-useless-escape */
const protocolAndDomainRE = /^(?:\w+:)?\/\/(\S+)$/;
const localhostDomainRE = /^localhost[\:?\d]*(?:[^\:?\d]\S*)?$/;
const nonLocalhostDomainRE = /^[^\s\.]+\.\S{2,}$/;

export function isUrl(string: string) {
  if (typeof string !== 'string') {
    return false;
  }

  const match = string.match(protocolAndDomainRE);
  if (!match) {
    return false;
  }

  const everythingAfterProtocol = match[1];
  if (!everythingAfterProtocol) {
    return false;
  }

  if (
    localhostDomainRE.test(everythingAfterProtocol) ||
    nonLocalhostDomainRE.test(everythingAfterProtocol)
  ) {
    return true;
  }

  return false;
}

const SYMBOL_REG = /^[A-Za-z0-9]+$/;
export function isSymbol(symbol?: string) {
  if (!symbol) return false;
  return SYMBOL_REG.test(symbol);
}

const P_N_REG = /^([0-9]+\.?[0-9]*|-[0-9]+\.?[0-9]*)$/;

export function isValidNumber(n?: string) {
  if (!n) return false;
  if (n === '-') return true;
  return P_N_REG.test(n);
}
export function isValidPositiveNumber(n?: string) {
  if (!n || n.includes('-')) return false;
  return P_N_REG.test(n);
}
