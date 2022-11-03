import { Input, InputGroup, InputLeftAddon } from '@chakra-ui/react';
import { VaultData } from '../hooks/useVaultData';

export const ReadOnlyVaultProps = (props: { data: VaultData }) => (
  <>
    {Object.entries(props.data)
      .filter((item) => !['collectionImage', 'minPrices', 'minDuration', 'maxDuration'].includes(item[0]))
      .map(([key, value]) => (
        <InputGroup marginBottom="2px" key={props.data.vaultAddress + key}>
          <InputLeftAddon children={key} width="25%" overflow="hidden" />
          <Input value={value as string} readOnly />
        </InputGroup>
      ))}
  </>
);
