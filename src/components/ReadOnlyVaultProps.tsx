import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Link } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { VaultData } from '../hooks/useVaultData';
import { explorerUrl } from '../utils/utils';
import { VaultPropForm } from './parts/VaultPropForm';

const nonReadOnlyVaultProps = ['collectionImage', 'minPrices', 'minDuration', 'maxDuration', 'ownerFeeRatio'];

export const ReadOnlyVaultProps = (props: { chainId: string; data: VaultData }) => (
  <>
    {(Object.entries(props.data) as [string, string][])
      .filter((item) => !nonReadOnlyVaultProps.includes(item[0]))
      .map(([key, value]) => {
        const isAddress = value.slice(0, 2) === '0x';
        const url = `${explorerUrl(props.chainId)}/address/${value}`;
        const label = isAddress ? <BlockExplorerLink url={url} inner={key.replace('Address', '')} /> : key;
        return <VaultPropForm readOnly leftLabel={label} value={value} key={key + value} />;
      })}
  </>
);

const BlockExplorerLink = (props: { url: string; inner: string | ReactNode }) => (
  <Link href={props.url} target="_blank">
    {props.inner}
    <ExternalLinkIcon mx="2px" />
  </Link>
);
