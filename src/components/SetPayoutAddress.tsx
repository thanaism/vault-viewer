import { Signer, ethers } from 'ethers';
import { useState } from 'react';
import { VaultData } from '../hooks/useVaultData';
import { vaultAbi } from '../utils/constants';
import { BN } from '../utils/utils';
import { VaultPropForm } from './parts/VaultPropForm';

export const SetPayoutAddress = (props: { signer: Signer; data: VaultData }) => {
  const vault = new ethers.Contract(props.data.vaultAddress, vaultAbi, props.signer);
  const [payoutAddress, setPayoutAddress] = useState<string>(props.data.payoutAddress);
  const [formattedAddress, setFormattedAddress] = useState<string | undefined>(props.data.payoutAddress);

  const onChange = async (e: any) => {
    setPayoutAddress(e.target.value);
    try {
      const formatted = ethers.utils.getAddress(e.target.value);
      setFormattedAddress(formatted);
    } catch {
      setFormattedAddress(undefined);
    }
  };

  const submit = async () => {
    const gasLimit = (await vault.estimateGas.setPayoutAddress(formattedAddress)).mul(BN(12).div(10));
    const { maxPriorityFeePerGas, maxFeePerGas } = await vault.provider.getFeeData();
    await vault.setPayoutAddress(formattedAddress, {
      maxPriorityFeePerGas,
      maxFeePerGas,
      gasLimit,
    });
  };

  return (
    <VaultPropForm
      leftLabel="payoutAddress"
      value={payoutAddress}
      onChange={onChange}
      submit={submit}
      submitLabel="update"
      invalid={formattedAddress == null}
    />
  );
};
