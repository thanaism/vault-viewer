import { ethers, Signer } from 'ethers';
import { useState } from 'react';
import { VaultData } from '../hooks/useVaultData';
import { vaultAbi } from '../utils/constants';
import { BN } from '../utils/utils';
import { VaultPropForm } from './parts/VaultPropForm';

export const CheckTokenId = (props: { signer: Signer; data: VaultData }) => {
  const vault = new ethers.Contract(props.data.vaultAddress, vaultAbi, props.signer);
  const [tokenId, setTokenId] = useState<string>('');

  if (props.data.allAllowed === 'true') return null;

  const getTokenIdAllowed = async () => {
    const tokenIdAllowed = await vault.functions.getTokenIdAllowed(BN(tokenId));
    setTokenId((prev) => `${prev}: ${BN(tokenIdAllowed).eq(BN(1))}`);
  };

  return (
    <VaultPropForm
      leftLabel="isAllowed"
      value={tokenId}
      onChange={(e) => setTokenId(e.target.value)}
      submit={getTokenIdAllowed}
      submitLabel="check"
      placeholder="token id"
    />
  );
};
