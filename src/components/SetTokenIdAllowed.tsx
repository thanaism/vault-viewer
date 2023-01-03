import { Signer, ethers } from 'ethers';
import { useState } from 'react';
import { VaultData } from '../hooks/useVaultData';
import { vaultAbi } from '../utils/constants';
import { BN } from '../utils/utils';
import { VaultPropForm } from './parts/VaultPropForm';

export const SetTokenIdAllowed = (props: { signer: Signer; data: VaultData }) => {
  const [allowedIds, setAllowedIds] = useState<string>();
  const [disallowedIds, setDisallowedIds] = useState<string>();

  const vault = new ethers.Contract(props.data.vaultAddress, vaultAbi, props.signer);

  const submit = async () => {
    if (!allowedIds?.length && !disallowedIds?.length) {
      alert('no input!');
      return;
    }
    try {
      const splitAllowedIds = allowedIds?.split(',');
      const splitDisallowedIds = disallowedIds?.split(',');
      const allowedIdsBN = splitAllowedIds?.map((id) => BN(id));
      const disallowedIdsBN = splitDisallowedIds?.map((id) => BN(id));

      const trues = [...Array(allowedIdsBN?.length ?? 0).keys()].map((e) => BN(1));
      const falses = [...Array(disallowedIdsBN?.length ?? 0).keys()].map((e) => BN(0));

      const ids = allowedIdsBN?.concat(disallowedIdsBN ?? []);
      const bools = trues.concat(falses);

      const gasLimit = (await vault.estimateGas.setTokenIdAllowed(ids, bools)).mul(BN(12)).div(BN(10));
      const { maxPriorityFeePerGas, maxFeePerGas } = await vault.provider.getFeeData();
      await vault.setTokenIdAllowed(ids, bools, {
        maxPriorityFeePerGas,
        maxFeePerGas,
        gasLimit,
      });
    } catch (e) {
      alert((e as Error).message);
    }
  };

  return (
    <>
      <VaultPropForm
        leftLabel="ok-ids"
        value={allowedIds ?? ''}
        onChange={(e) => setAllowedIds(e.target.value)}
        submit={submit}
        submitLabel="update"
        placeholder="comma separated token ids"
      />
      <VaultPropForm
        leftLabel="ng-ids"
        value={disallowedIds ?? ''}
        onChange={(e) => setDisallowedIds(e.target.value)}
        placeholder="comma separated token ids"
      />
    </>
  );
};
