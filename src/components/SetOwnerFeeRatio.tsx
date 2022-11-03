import { Button, Input, InputGroup, InputLeftAddon, InputRightElement } from '@chakra-ui/react';
import { Signer, ethers } from 'ethers';
import { useState } from 'react';
import { VaultData } from '../hooks/useVaultData';
import { vaultAbi } from '../utils/constants';
import { BN } from '../utils/utils';

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
    <InputGroup marginBottom="2px">
      <InputLeftAddon children="ownerFee(%)" width="25%" overflow="hidden" />
      <Input width="60%" value={feeRatio} onChange={(e) => setFeeRaio(e.target.value)} />
      <InputRightElement width="15%">
        <Button rounded="full" colorScheme={'blackAlpha'} height="70%" onClick={submit} minW="100%" ml="5px">
          update
        </Button>
      </InputRightElement>
    </InputGroup>
  );
};
