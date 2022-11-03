import axios from 'axios';
import { Signer, ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { baseUrl, vaultAbi } from '../utils/constants';
import { BN, durationToDays, unwrapParenthesesIfSingleElement } from '../utils/utils';

export type VaultData = {
  collectionImage: string;
  originalName: string;
  marketContract: string;
  collectionOwnerFeeRatio: string;
  vaultAddress: string;
  wrapContract: string;
  minDuration: string;
  maxDuration: string;
  allTokenIdAllowed: string;
  // paymentTokens: string[];
  minPrices: Record<string, { paymentToken: string; minPrice: string }>;
  payoutAddress: string;
};

type CollectionsApiResponse = {
  collections: {
    original_collection_name: string;
    collection_image: string;
    vault_address: string;
    is_draft: boolean;
  }[];
};

const useVaultData = (props: { chainId: string; signer: ethers.Signer }): VaultData[] | null => {
  const [data, setData] = useState<VaultData[] | null>(null);

  const getVaultDataList = async () => {
    const backendVaultProps = await getVaultPropsFromBackend(Number(props.chainId));
    const promises = backendVaultProps.map((backendVaultProp) => getSingleVaultPromise(props.signer, backendVaultProp));
    setData(await Promise.all(promises));
  };

  useEffect(() => {
    setData(null);
    getVaultDataList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.chainId]);

  return data;
};

type BackendVaultProp = {
  vaultAddress: string;
  originalName: string;
  collectionImage: string;
};

const getVaultPropsFromBackend = async (chainId: number): Promise<BackendVaultProp[]> => {
  const url = `${baseUrl}/v1/${chainId}/collections/`;
  const response: CollectionsApiResponse = (await axios.get(url)).data;
  const backendVaultProps = response.collections.flatMap((item) =>
    item.is_draft
      ? []
      : [
          {
            vaultAddress: item.vault_address,
            originalName: item.original_collection_name,
            collectionImage: item.collection_image,
          },
        ],
  );
  return backendVaultProps;
};

const getSingleVaultPromise = async (signer: Signer, backendVaultProp: BackendVaultProp) => {
  const { vaultAddress, originalName, collectionImage } = backendVaultProp;
  const vault = new ethers.Contract(vaultAddress, vaultAbi, signer);
  const paymentTokens = unwrapParenthesesIfSingleElement(await vault.functions.getPaymentTokens()) as string[];
  const tokenNamePromises = paymentTokens.map((address) =>
    address === ethers.constants.AddressZero
      ? 'ETH'
      : new ethers.Contract(address, ['function symbol() view returns(string memory)'], signer).functions.symbol(),
  );
  const tokenNames = await Promise.all(tokenNamePromises);
  const minPricePromises = paymentTokens.map((paymentToken, i) =>
    vault.functions
      .minPrices(paymentToken)
      .then((res) => [tokenNames[i], { paymentToken, minPrice: BN(res).toString() }]),
  );

  const vaultContractCallPromises = [
    new Promise<{ vaultAddress: string }>((resolve) => resolve({ vaultAddress })),
    new Promise<{ originalName: string }>((resolve) => resolve({ originalName })),
    new Promise<{ collectionImage: string }>((resolve) => resolve({ collectionImage })),
    Promise.all(minPricePromises).then((res) => ({ minPrices: Object.fromEntries(res) })),
    vault.functions.wrapContract().then((res) => ({ wrapContract: res as string })),
    vault.functions.minDuration().then((res) => ({ minDuration: durationToDays(res) })),
    vault.functions.maxDuration().then((res) => ({ maxDuration: durationToDays(res) })),
    vault.functions.allTokenIdAllowed().then((res) => ({ allAllowed: BN(res).eq(BN(1)).toString() })),
    // vault.functions
    //   .getPaymentTokens()
    //   .then((res) => ({ paymentTokens: unwrapParenthesesIfSingleElement(res) as string[] })),
    vault.functions.marketContract().then((res) => ({ marketContract: res as string })),
    vault.functions
      .collectionOwnerFeeRatio()
      .then((res) => ({ ownerFeeRatio: BN(res).div(BN(1000)).toString() + '%' })),
    vault.functions.payoutAddress().then((res) => ({ payoutAddress: res as string })),
  ];
  const resolved = await Promise.all(vaultContractCallPromises);
  return resolved.reduce((prev, now) => (prev != null ? { ...prev, ...now } : now), {}) as VaultData;
};

export default useVaultData;
