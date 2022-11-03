import { Button, Input, InputGroup, InputLeftAddon, InputRightElement } from '@chakra-ui/react';
import { Signer, ethers } from 'ethers';
import { useState } from 'react';
import { vaultAbi } from '../utils/constants';
import { BN } from '../utils/utils';

export const SetDuraion = (props: {
  vaultAddress: string;
  signer: Signer;
  minDuration: string;
  maxDuration: string;
}) => {
  const vault = new ethers.Contract(props.vaultAddress, vaultAbi, props.signer);
  const [minDuration, setMinDuration] = useState<string>(props.minDuration);
  const [maxDuration, setMaxDuration] = useState<string>(props.maxDuration);

  const submit = async () => {
    const minDurationBySec = BN(minDuration).mul(BN(86400));
    const maxDurationBySec = BN(maxDuration).mul(BN(86400));
    await vault.functions.setDuration(minDurationBySec, maxDurationBySec);
    const gasLimit = (await vault.estimateGas.setDuration(minDurationBySec, maxDurationBySec)).mul(1.2);
    const { maxPriorityFeePerGas, maxFeePerGas } = await vault.provider.getFeeData();
    await vault.setDuration(minDurationBySec, maxDurationBySec, {
      maxPriorityFeePerGas,
      maxFeePerGas,
      gasLimit,
    });
  };

  return (
    <>
      <InputGroup marginBottom="2px">
        <InputLeftAddon children="minDuration" width="25%" overflow="hidden" />
        <Input width="60%" value={minDuration} onChange={(e) => setMinDuration(e.target.value)} />
        <InputRightElement width="15%">
          <Button rounded="full" colorScheme={'blackAlpha'} height="70%" onClick={submit}>
            update
          </Button>
        </InputRightElement>
      </InputGroup>
      <InputGroup marginBottom="2px">
        <InputLeftAddon children="maxDuration" width="25%" overflow="hidden" />
        <Input width="60%" value={maxDuration} onChange={(e) => setMaxDuration(e.target.value)} />
      </InputGroup>
    </>
  );
};
