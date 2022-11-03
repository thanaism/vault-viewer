import useVaultData from '../hooks/useVaultData';
import { Signer } from 'ethers';
import { Box, Image } from '@chakra-ui/react';
import { SetMinPrices } from './SetMinPrices';
import { SetDuraion } from './SetDuration';
import { CheckTokenId } from './CheckTokenId';
import { ReadOnlyVaultProps } from './ReadOnlyVaultProps';

const EachVaultStatus = (props: { chainId: string; signer: Signer }) => {
  const vaultData = useVaultData(props);
  const { signer } = props;

  if (!vaultData) return <div>Loading...</div>;

  return (
    <>
      {vaultData.map((data) => (
        <Box maxW="600px" borderWidth="1px" borderRadius="lg" padding="2" margin="2" key={data.vaultAddress}>
          <Image src={data.collectionImage} width="200px" marginBottom="3px" />
          <ReadOnlyVaultProps data={data} />
          <SetMinPrices signer={signer} data={data} key={data.vaultAddress + 'minPrices'} />
          <SetDuraion signer={signer} data={data} key={data.vaultAddress + 'duration'} />
          <CheckTokenId data={data} signer={props.signer} />
        </Box>
      ))}
    </>
  );
};

export default EachVaultStatus;
