import { VaultData } from '../hooks/useVaultData';
import { VaultPropForm } from './parts/VaultPropForm';

export const ReadOnlyVaultProps = (props: { data: VaultData }) => (
  <>
    {Object.entries(props.data)
      .filter(
        (item) => !['collectionImage', 'minPrices', 'minDuration', 'maxDuration', 'ownerFeeRatio'].includes(item[0]),
      )
      .map(([key, value]) => (
        <VaultPropForm readOnly={true} leftLabel={key} value={value as string} />
      ))}
  </>
);
