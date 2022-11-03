import { Signer, ethers } from 'ethers';
import { useState } from 'react';
import { VaultData } from '../hooks/useVaultData';
import { vaultAbi } from '../utils/constants';
import { BN } from '../utils/utils';
import { VaultPropForm } from './parts/VaultPropForm';

export const SetOwnerFeeRatio = (props: { signer: Signer; data: VaultData }) => {
  const vault = new ethers.Contract(props.data.vaultAddress, vaultAbi, props.signer);
  const [feeRatio, setFeeRaio] = useState<string>(props.data.ownerFeeRatio);

  const submit = async () => {
    const rawFeeRatio = BN(feeRatio).mul(BN(1000));
    const gasLimit = (await vault.estimateGas.setCollectionOwnerFeeRatio(rawFeeRatio)).mul(BN(12).div(10));
    const { maxPriorityFeePerGas, maxFeePerGas } = await vault.provider.getFeeData();
    await vault.estimateGas.setCollectionOwnerFeeRatio(rawFeeRatio, {
      maxPriorityFeePerGas,
      maxFeePerGas,
      gasLimit,
    });
  };

  return (
    <VaultPropForm
      leftLabel="ownerFee(%)"
      value={feeRatio}
      onChange={(e) => setFeeRaio(e.target.value)}
      submit={submit}
      submitLabel="update"
    />
  );
};
