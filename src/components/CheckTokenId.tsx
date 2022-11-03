import { Button, Input, InputGroup, InputLeftAddon, InputRightElement } from '@chakra-ui/react';
import { ethers, Signer } from 'ethers';
import { useState } from 'react';
import { VaultData } from '../hooks/useVaultData';
import { vaultAbi } from '../utils/constants';
import { BN } from '../utils/utils';

export const CheckTokenId = (props: { signer: Signer; data: VaultData }) => {
  const vault = new ethers.Contract(props.data.vaultAddress, vaultAbi, props.signer);
  const [tokenId, setTokenId] = useState<string>('');

  if (props.data.allAllowed === 'true') return null;

  const getTokenIdAllowed = async () => {
    const tokenIdAllowed = await vault.functions.getTokenIdAllowed(BN(tokenId));
    setTokenId((prev) => `${prev}: ${BN(tokenIdAllowed).eq(BN(1))}`);
  };

  return (
    <InputGroup>
      <InputLeftAddon children="isAllowed" width="25%" overflow="hidden" bgColor="blue.700" color="white" />
      <Input placeholder="token id" value={tokenId} onChange={(e) => setTokenId(e.target.value)} width="60%" />
      <InputRightElement width="15%">
        <Button rounded="full" colorScheme={'blackAlpha'} height="70%" onClick={getTokenIdAllowed}>
          check
        </Button>
      </InputRightElement>
    </InputGroup>
  );
};
