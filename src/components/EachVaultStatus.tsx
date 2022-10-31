import useVaultData from '../hooks/useVaultData';
import { BN } from '../utils/utils';
import { ethers } from 'ethers';
import { useState } from 'react';
import { vaultAbi } from '../utils/constants';
import { Box, Button, Input } from '@chakra-ui/react';

const EachVaultStatus = (props: { chainId: string; signer: ethers.Signer }) => {
    const vaultData = useVaultData(props);
    if (!vaultData) return <div>Loading...</div>;
    return (
        <>
            {vaultData.map((data, index) => (
                <>
                    <p>--------------------------------------------------</p>
                    {Object.entries(data).map(([key, value]) => (
                        <Box>
                            {key}: {value}
                        </Box>
                    ))}
                    {data.allTokenIdAllowed === 'false' && (
                        <TokenIdForm vaultAddress={data.vaultAddress} signer={props.signer} key={index} />
                    )}
                </>
            ))}
        </>
    );
};
const TokenIdForm = (props: { vaultAddress: string; signer: ethers.Signer; key: number }) => {
    const [tokenId, setTokenId] = useState<string>('');
    const [result, setResult] = useState<any | null>(null);
    const handleInputChange = (e: any) => setTokenId(e.target.value);
    const getTokenIdAllowed = async () => {
        setResult(null);
        const vault = new ethers.Contract(props.vaultAddress, vaultAbi, props.signer);
        const tokenIdAllowed = await vault.functions.getTokenIdAllowed(tokenId);
        setResult(BN(tokenIdAllowed).eq(BN(1)));
    };
    return (
        <div>
            getTokenIdAllowed: {String(result)}
            <Input placeholder="token id" onChange={handleInputChange} />
            <Button color={'black'} onClick={getTokenIdAllowed}>
                submit
            </Button>
        </div>
    );
};

export default EachVaultStatus;
