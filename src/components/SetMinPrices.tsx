import { Button, Input, InputGroup, InputLeftAddon, InputRightElement } from '@chakra-ui/react';
import { Signer, ethers } from 'ethers';
import { useState } from 'react';
import { vaultAbi } from '../utils/constants';
import { BN } from '../utils/utils';

export const SetMinPrices = (props: {
  vaultAddress: string;
  signer: Signer;
  minPrices: Record<string, Record<string, string>>;
}) => {
  const vault = new ethers.Contract(props.vaultAddress, vaultAbi, props.signer);
  const [minPrices, setMinPrices] = useState<Record<string, Record<string, string>>>(props.minPrices);

  const updateMinPrice = (key: string, e: any) =>
    setMinPrices((prev) => ({ ...prev, [key]: { paymentToken: prev![key].paymentToken, minPrice: e.target.value } }));

  const submit = async () => {
    const prices = Object.values(minPrices).map((e) => BN(e.minPrice));
    const tokens = Object.values(minPrices).map((e) => e.paymentToken);
    const gasLimit = (await vault.estimateGas.setMinPrices(prices, tokens)).mul(1.2);
    const { maxPriorityFeePerGas, maxFeePerGas } = await vault.provider.getFeeData();
    await vault.setMinPrices(prices, tokens, {
      maxPriorityFeePerGas,
      maxFeePerGas,
      gasLimit,
    });
  };

  return (
    <>
      {Object.entries(minPrices).map(([key, value], i) => (
        <InputGroup marginBottom="2px">
          <InputLeftAddon children={`minPrice(${key})`} width="25%" overflow="hidden" />
          <Input width="60%" value={value.minPrice} onChange={(e) => updateMinPrice(key, e)} />
          {i === 0 && (
            <InputRightElement width="15%">
              <Button rounded="full" colorScheme={'blackAlpha'} height="70%" onClick={submit}>
                update
              </Button>
            </InputRightElement>
          )}
        </InputGroup>
      ))}
    </>
  );
};
