import axios from 'axios';
import { Signer, ethers, Contract, BigNumber } from 'ethers';
import { useEffect, useState } from 'react';
import { baseUrl, vaultAbi } from '../utils/constants';
import { BN, durationToDays, unwrapParenthesesIfSingleElement } from '../utils/utils';

export type VaultData = {
  collectionImage: string;
  originalName: string;
  originalAddress: string;
  marketContract: string;
  ownerFeeRatio: string;
  vaultAddress: string;
  wrapContract: string;
  minDuration: string;
  maxDuration: string;
  allAllowed: string;
  payoutAddress: string;
  minPrices: MinPrices;
};

export type MinPrices = Record<string, { paymentToken: string; minPrice: BigNumber; decimals: BigNumber }>;

type CollectionsApiResponse = {
  collections: {
    original_collection_name: string;
    original_collection_address: string;
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
  originalAddress: string;
  collectionImage: string;
};

const getVaultPropsFromBackend = async (chainId: number): Promise<BackendVaultProp[]> => {
  const url = `${baseUrl}/v1/${chainId}/collections/`;
  const response: CollectionsApiResponse = (await axios.get(url)).data;
  const backendVaultProps = response.collections
    .filter((collection) => !collection.is_draft)
    .map((collection) => ({
      vaultAddress: collection.vault_address,
      originalName: collection.original_collection_name,
      originalAddress: collection.original_collection_address,
      collectionImage: collection.collection_image,
    }));
  return backendVaultProps;
};

const getSingleVaultPromise = async (signer: Signer, backendVaultProp: BackendVaultProp) => {
  const { vaultAddress, originalName, originalAddress, collectionImage } = backendVaultProp;
  const vault = new ethers.Contract(vaultAddress, vaultAbi, signer);

  const vaultContractCallPromises = [
    { collectionImage },
    { originalName },
    { originalAddress },
    { vaultAddress },
    Promise.all(await getMinPricePromises(vault)).then((res) => ({ minPrices: Object.fromEntries(res) })),
    vault.functions.wrapContract().then((res) => ({ wrapAddress: String(res) })),
    vault.functions.minDuration().then((res) => ({ minDuration: durationToDays(res) })),
    vault.functions.maxDuration().then((res) => ({ maxDuration: durationToDays(res) })),
    vault.functions.marketContract().then((res) => ({ marketAddress: String(res) })),
    vault.functions.payoutAddress().then((res) => ({ payoutAddress: String(res) })),
    vault.functions.allTokenIdAllowed().then((res) => ({ allAllowed: BN(res).eq(BN(1)).toString() })),
    vault.functions.collectionOwnerFeeRatio().then((res) => ({ ownerFeeRatio: BN(res).div(BN(1000)).toString() })),
  ];
  const resolved = await Promise.all(vaultContractCallPromises);
  return resolved.reduce((prev, now) => (prev != null ? { ...prev, ...now } : now), {}) as VaultData;
};

const getMinPricePromises = async (vault: Contract) => {
  const paymentTokens = unwrapParenthesesIfSingleElement((await vault.functions.getPaymentTokens()) as string[][]);

  const tokenNamePromises = paymentTokens.map((address) => {
    if (address === ethers.constants.AddressZero) return 'ETH';
    const abi = ['function symbol() view returns(string memory)'];
    return new ethers.Contract(address, abi, vault.signer).functions.symbol();
  });

  const decimalPromises = paymentTokens.map((address) => {
    const abi = ['function decimals() view returns (uint256)'];
    return new ethers.Contract(address, abi, vault.signer).functions
      .decimals()
      .then((res) => BN(res))
      .catch((_) => BN(18));
  });

  const pricePromises = paymentTokens.map((address) => vault.functions.minPrices(address).then((res) => BN(res)));

  const namePriceDecimals = await Promise.all([...tokenNamePromises, ...pricePromises, ...decimalPromises]);

  return paymentTokens.map((paymentToken, i) => [
    namePriceDecimals[i],
    {
      paymentToken,
      minPrice: namePriceDecimals[i + paymentTokens.length],
      decimals: namePriceDecimals[i + paymentTokens.length * 2],
    },
  ]);
};

export default useVaultData;
