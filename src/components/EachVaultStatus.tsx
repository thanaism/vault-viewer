import useVaultData from '../hooks/useVaultData';
import { BN } from '../utils/utils';
import { Signer, ethers } from 'ethers';
import { useState } from 'react';
import { vaultAbi } from '../utils/constants';
import { Box, Button, HStack, Image, Input, InputGroup, InputLeftAddon, Text } from '@chakra-ui/react';
import { SetMinPrices } from './SetMinPrices';
import { SetDuraion } from './SetDuration';

const EachVaultStatus = (props: { chainId: string; signer: Signer }) => {
  const vaultData = useVaultData(props);
  if (!vaultData) return <div>Loading...</div>;

  return (
    <>
      {vaultData.map((data, index) => (
        <Box maxW="600px" borderWidth="1px" borderRadius="lg" padding="2" margin="2">
          <Image src={data.collectionImage} width="200px" marginBottom="3px" />
          <Box>
            {Object.entries(data)
              .filter((item) => !['collectionImage', 'minPrices', 'minDuration', 'maxDuration'].includes(item[0]))
              .map(([key, value]) => (
                <InputGroup marginBottom="2px">
                  <InputLeftAddon children={key} width="25%" overflow="hidden" />
                  <Input value={value as string} readOnly />
                </InputGroup>
              ))}
            <SetMinPrices vaultAddress={data.vaultAddress} signer={props.signer} minPrices={data.minPrices} />
            <SetDuraion
              vaultAddress={data.vaultAddress}
              signer={props.signer}
              minDuration={data.minDuration}
              maxDuration={data.maxDuration}
            />
            {data.allTokenIdAllowed === 'false' && (
              <TokenIdForm vaultAddress={data.vaultAddress} signer={props.signer} key={index} />
            )}
          </Box>
        </Box>
      ))}
    </>
  );
};
const TokenIdForm = (props: { vaultAddress: string; signer: ethers.Signer; key: number }) => {
  const [tokenId, setTokenId] = useState<string>('');
  const [result, setResult] = useState<boolean | null>(null);

  const handleInputChange = (e: any) => setTokenId(e.target.value);
  const getTokenIdAllowed = async () => {
    setResult(null);
    const vault = new ethers.Contract(props.vaultAddress, vaultAbi, props.signer);
    const tokenIdAllowed = await vault.functions.getTokenIdAllowed(tokenId);
    setResult(BN(tokenIdAllowed).eq(BN(1)));
  };

  return (
    <>
      <HStack>
        <Input placeholder="token id" onChange={handleInputChange} />
        <Button onClick={getTokenIdAllowed}>submit</Button>
      </HStack>
      <Text>getTokenIdAllowed: {String(result)}</Text>
    </>
  );
};

export default EachVaultStatus;
