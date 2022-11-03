import { Button, Input, InputGroup, InputLeftAddon, InputRightElement } from '@chakra-ui/react';
import { Signer, ethers } from 'ethers';
import { useState } from 'react';
import { VaultData } from '../hooks/useVaultData';
import { vaultAbi } from '../utils/constants';
import { BN } from '../utils/utils';

export const SetDuraion = (props: { signer: Signer; data: VaultData }) => {
  const vault = new ethers.Contract(props.data.vaultAddress, vaultAbi, props.signer);
  const [minDuration, setMinDuration] = useState<string>(props.data.minDuration);
  const [maxDuration, setMaxDuration] = useState<string>(props.data.maxDuration);

  const submit = async () => {
    const minDurationBySec = BN(minDuration).mul(BN(86400));
    const maxDurationBySec = BN(maxDuration).mul(BN(86400));
    const gasLimit = (await vault.estimateGas.setDuration(minDurationBySec, maxDurationBySec)).mul(BN(12)).div(BN(10));
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
        <InputLeftAddon children="minDur(day)" width="25%" overflow="hidden" />
        <Input width="60%" value={minDuration} onChange={(e) => setMinDuration(e.target.value)} />
        <InputRightElement width="15%">
          <Button rounded="full" colorScheme={'blackAlpha'} height="70%" onClick={submit}>
            update
          </Button>
        </InputRightElement>
      </InputGroup>
      <InputGroup marginBottom="2px">
        <InputLeftAddon children="maxDur(day)" width="25%" overflow="hidden" />
        <Input width="60%" value={maxDuration} onChange={(e) => setMaxDuration(e.target.value)} />
      </InputGroup>
    </>
  );
};
