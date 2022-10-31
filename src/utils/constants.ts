export const baseUrl = 'https://rentafi-production-yvj5gszdhq-an.a.run.app';
export const vaultAbi = [
    'function wrapContract() view returns (address)',
    'function originalCollection() view returns (address)',
    'function marketContract() view returns (address)',
    'function collectionOwner() view returns (address)',
    'function minDuration() view returns (uint256)',
    'function maxDuration() view returns (uint256)',
    'function collectionOwnerFeeRatio() view returns (uint256)',
    'function originalName() view returns (string memory)',
    'function originalSymbol() view returns (string memory)',
    'function allTokenIdAllowed() view returns (uint256)',
    'function payoutAddress() view returns (address)',
    'function getPaymentTokens() view returns (address[])',
    'function getTokenIdAllowed(uint256 tokenId) view returns (uint256)',
];
