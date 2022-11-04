import { ethers } from 'ethers';

export const chainName = (chainId: string) => {
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

export const explorerUrl = (chainId: string) => {
  switch (Number(chainId)) {
    case 1:
      return 'https://etherscan.io';
    case 4:
      return 'https://rinkeby.etherscan.io';
    case 5:
      return 'https://goerli.etherscan.io';
    case 137:
      return 'https://polygonscan.com';
    default:
      return 'unknown';
  }
};

type ResponseBigNumber = { type: 'BigNumber'; hex: string }[];

export const BN = (input: ResponseBigNumber | string | number) =>
  ethers.BigNumber.from(Array.isArray(input) ? input[0] : input);

export const durationToDays = (duration: ResponseBigNumber) => BN(duration).div(BN(86400)).toString();

export const unwrapParenthesesIfSingleElement = <T>(input: T[]) => {
  if (!Array.isArray(input)) throw Error('input is not an array');
  if (input.length !== 1) throw Error('element is not single');
  return input[0];
};

export const avoidIpfs = (imageUrl: string) => {
  if (imageUrl.slice(0, 4) === 'ipfs') return 'https://ipfs.io/ipfs' + imageUrl.slice(6);
  return imageUrl;
};
