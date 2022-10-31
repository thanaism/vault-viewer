import axios from 'axios';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { baseUrl, vaultAbi } from '../utils/constants';
import { BN, durationToDays } from '../utils/utils';

type VaultData = { [key: string]: string }[] | null;

type CollectionsApiResponse = {
    collections: {
        original_collection_name: string;
        collection_image: string;
        vault_address: string;
        is_draft: boolean;
    }[];
};

const useVaultData = (props: { chainId: string; signer: ethers.Signer }): VaultData => {
    const [data, setData] = useState<VaultData>(null);

    const getAddress = async () => {
        const url = `${baseUrl}/v1/${Number(props.chainId)}/collections/`;
        const response: CollectionsApiResponse = (await axios.get(url)).data;
        const items = response.collections.flatMap((item) =>
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
        const signer = props.signer;
        const dataList = [];
        for (const item of items) {
            const { vaultAddress, originalName, collectionImage } = item;
            const vault = new ethers.Contract(vaultAddress, vaultAbi, signer);
            const wrapContract = await vault.functions.wrapContract();
            const minDuration = durationToDays(await vault.functions.minDuration());
            const maxDuration = durationToDays(await vault.functions.maxDuration());
            const allTokenIdAllowed = BN(await vault.functions.allTokenIdAllowed())
                .eq(BN(1))
                .toString();
            const paymentTokens = JSON.stringify((await vault.functions.getPaymentTokens())[0]);
            const marketContract = await vault.functions.marketContract();
            const collectionOwnerFeeRatio =
                BN(await vault.functions.collectionOwnerFeeRatio())
                    .div(BN(1000))
                    .toString() + '%';
            const payoutAddress = await vault.functions.payoutAddress();
            dataList.push({
                collectionImage,
                originalName,
                marketContract,
                collectionOwnerFeeRatio,
                vaultAddress,
                wrapContract,
                minDuration,
                maxDuration,
                allTokenIdAllowed,
                paymentTokens,
                payoutAddress,
            });
        }
        setData(dataList);
        return dataList;
    };

    useEffect(() => {
        setData(null);
        getAddress();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.chainId]);

    return data;
};

export default useVaultData;
