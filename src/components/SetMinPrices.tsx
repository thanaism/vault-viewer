import { Signer, ethers, BigNumber } from 'ethers';
import { useState } from 'react';
import { VaultData } from '../hooks/useVaultData';
import { vaultAbi } from '../utils/constants';
import { BN } from '../utils/utils';
import { VaultPropForm } from './parts/VaultPropForm';

export const SetMinPrices = (props: { signer: Signer; data: VaultData }) => {
  const prices = Object.values(props.data.minPrices).map((value) => encodePrice(value.minPrice, value.decimals));
  const names = Object.keys(props.data.minPrices);
  const tokens = Object.values(props.data.minPrices).map((value) => value.paymentToken);
  const decimals = Object.values(props.data.minPrices).map((value) => value.decimals);

  const [minPrices, setMinPrices] = useState<string[]>(prices);

  const vault = new ethers.Contract(props.data.vaultAddress, vaultAbi, props.signer);

  const updateMinPrice = (index: number, e: any) =>
    setMinPrices((prev) => {
      prev[index] = e.target.value;
      return prev;
    });

  const submit = async () => {
    const prices = minPrices.map((price, i) => decodePrice(price, decimals[i]));
    const gasLimit = (await vault.estimateGas.setMinPrices(prices, tokens)).mul(BN(12)).div(BN(10));
    const { maxPriorityFeePerGas, maxFeePerGas } = await vault.provider.getFeeData();
    await vault.setMinPrices(prices, tokens, {
      maxPriorityFeePerGas,
      maxFeePerGas,
      gasLimit,
    });
  };

  minPrices.forEach((price, i) => console.log(decodePrice(price, decimals[i]).toString()));

  return (
    <>
      {names.map((name, i) => (
        <VaultPropForm
          leftLabel={`minPrice (${name})`}
          value={minPrices[i]}
          onChange={(e) => updateMinPrice(i, e)}
          submit={i === 0 ? submit : undefined}
          submitLabel={i === 0 ? 'update' : undefined}
          key={props.data.vaultAddress + name}
        />
      ))}
    </>
  );
};

const encodePrice = (rawPrice: BigNumber, decimals: BigNumber): string => {
  const priceWithLeadingZeros = '0'.repeat(36) + rawPrice.toString();
  const leftHandWithLeadingZeros = priceWithLeadingZeros.slice(0, -decimals.toNumber());
  const rightHandWithTrailingZeros = priceWithLeadingZeros.slice(-decimals.toNumber());

  const leftHandOrEmpty = leftHandWithLeadingZeros.replace(/^0+/, '');
  const rightHandOrEmpty = rightHandWithTrailingZeros.replace(/0+$/, '');

  const leftHand = leftHandOrEmpty === '' ? '0' : leftHandOrEmpty;
  const rightHand = rightHandOrEmpty === '' ? '' : '.' + rightHandOrEmpty;

  return leftHand + rightHand;
};

const decodePrice = (formattedPrice: string, decimals: BigNumber): BigNumber => {
  const dotPos = formattedPrice.indexOf('.');
  if (dotPos === -1) return BN(formattedPrice).mul(BN(10).pow(decimals));
  const diff = BN(formattedPrice.length - dotPos - 1);
  return BN(formattedPrice.replace('.', '')).mul(BN(10).pow(decimals.sub(diff)));
};
