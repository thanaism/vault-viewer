import { ethers, Signer } from 'ethers';
import { ChangeEvent, useState } from 'react';
import { VaultData } from '../hooks/useVaultData';
import { vaultAbi } from '../utils/constants';
import { BN } from '../utils/utils';
import { VaultPropForm } from './parts/VaultPropForm';

export const CheckTokenId = (props: { signer: Signer; data: VaultData }) => {
  const vault = new ethers.Contract(props.data.vaultAddress, vaultAbi, props.signer);
  const initialSubmitLabel = 'check';
  const [tokenId, setTokenId] = useState<string>('');
  const [submitLabel, setSubmitLabel] = useState<string>(initialSubmitLabel);

  if (props.data.allAllowed === 'true') return null;

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSubmitLabel(initialSubmitLabel);
    setTokenId(e.target.value);
  };

  const submit = async () => {
    const tokenIdAllowed = BN(await vault.functions.getTokenIdAllowed(BN(tokenId))).eq(BN(1));
    setSubmitLabel(tokenIdAllowed ? 'OK' : 'NG');
  };

  return (
    <VaultPropForm
      leftLabel="isAllowed"
      value={tokenId}
      onChange={onChange}
      submit={submit}
      submitLabel={submitLabel}
      placeholder="token id"
    />
  );
};
