import { Signer, ethers } from 'ethers';
import { useState } from 'react';
import { VaultData } from '../hooks/useVaultData';
import { vaultAbi } from '../utils/constants';
import { BN } from '../utils/utils';
import { VaultPropForm } from './parts/VaultPropForm';

export const SetMinPrices = (props: { signer: Signer; data: VaultData }) => {
  const vault = new ethers.Contract(props.data.vaultAddress, vaultAbi, props.signer);
  const [minPrices, setMinPrices] = useState<Record<string, Record<string, string>>>(props.data.minPrices);

  const updateMinPrice = (key: string, e: any) =>
    setMinPrices((prev) => ({ ...prev, [key]: { paymentToken: prev![key].paymentToken, minPrice: e.target.value } }));

  const submit = async () => {
    const prices = Object.values(minPrices).map((e) => BN(e.minPrice));
    const tokens = Object.values(minPrices).map((e) => e.paymentToken);
    const gasLimit = (await vault.estimateGas.setMinPrices(prices, tokens)).mul(BN(12)).div(BN(10));
    const { maxPriorityFeePerGas, maxFeePerGas } = await vault.provider.getFeeData();
    await vault.setMinPrices(prices, tokens, {
      maxPriorityFeePerGas,
      maxFeePerGas,
      gasLimit,
    });
  };

  return (
    <>
      {Object.entries(minPrices).map(([key, value], i) => {
        if (i === 0)
          return (
            <VaultPropForm
              leftLabel={`minPrice (${key})`}
              value={value.minPrice}
              onChange={(e) => updateMinPrice(key, e)}
              submit={submit}
              submitLabel="update"
              key={props.data.vaultAddress + key}
            />
          );
        return (
          <VaultPropForm
            leftLabel={`minPrice (${key})`}
            value={value.minPrice}
            onChange={(e) => updateMinPrice(key, e)}
            key={props.data.vaultAddress + key}
          />
        );
      })}
    </>
  );
};
