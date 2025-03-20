import { describe, it, expect } from 'vitest';
import aelfInstance from '../../aelf/aelfInstance';
import { AllSupportedELFChainId } from 'constants/chain';

describe('AelfAbstract', () => {
  it('Create singleton and instance', () => {
    const instance = aelfInstance.getInstance(AllSupportedELFChainId.AELF);
    expect(instance).toHaveProperty('chain');
  });

  it('Get the created aelf instance', () => {
    const instance = aelfInstance.getInstance(AllSupportedELFChainId.AELF);
    expect(instance).toHaveProperty('chain');
  });
});
