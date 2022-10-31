import { ethers } from 'ethers';

export const toName = (chainId: string) => {
    switch (Number(chainId)) {
        case 1:
            return 'mainnet';
        case 4:
            return 'rinkeby';
        case 5:
            return 'goerli';
        case 137:
            return 'polygon';
        default:
            return 'unknown';
    }
};

type ResponseBigNumber = { type: 'BigNumber'; hex: string }[];

export const BN = (input: ResponseBigNumber | string | number) =>
    ethers.BigNumber.from(Array.isArray(input) ? input[0] : input);

export const durationToDays = (duration: ResponseBigNumber) => BN(duration).div(BN(86400)).toString();
