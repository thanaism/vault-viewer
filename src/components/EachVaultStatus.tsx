import useVaultData from '../hooks/useVaultData';
import { BN } from '../utils/utils';
import { ethers } from 'ethers';
import { useState } from 'react';
import { vaultAbi } from '../utils/constants';
import { Box, Button, HStack, Image, Input, Text } from '@chakra-ui/react';

const EachVaultStatus = (props: { chainId: string; signer: ethers.Signer }) => {
    const vaultData = useVaultData(props);
    if (!vaultData) return <div>Loading...</div>;

    return (
        <>
            {vaultData.map((data, index) => (
                <Box maxW="600px" borderWidth="1px" borderRadius="lg" padding="2" margin="2">
                    <Image
                        src={data.collectionImage}
                        borderColor="white"
                        borderWidth="3px"
                        borderStyle="solid"
                        borderRadius="full"
                        width="200px"
                        marginBottom="3px"
                    />
                    <Box>
                        {Object.entries(data)
                            .filter((item) => item[0] !== 'collectionImage')
                            .map(([key, value]) => (
                                <Box>
                                    {key}: {value}
                                </Box>
                            ))}
                        {data.allTokenIdAllowed === 'false' && (
                            <TokenIdForm vaultAddress={data.vaultAddress} signer={props.signer} key={index} />
                        )}
                    </Box>
                </Box>
            ))}
        </>
    );
};
const TokenIdForm = (props: { vaultAddress: string; signer: ethers.Signer; key: number }) => {
    const [tokenId, setTokenId] = useState<string>('');
    const [result, setResult] = useState<boolean | null>(null);

    const handleInputChange = (e: any) => setTokenId(e.target.value);
    const getTokenIdAllowed = async () => {
        setResult(null);
        const vault = new ethers.Contract(props.vaultAddress, vaultAbi, props.signer);
        const tokenIdAllowed = await vault.functions.getTokenIdAllowed(tokenId);
        setResult(BN(tokenIdAllowed).eq(BN(1)));
    };

    return (
        <>
            <HStack>
                <Input placeholder="token id" onChange={handleInputChange} />
                <Button color="black" onClick={getTokenIdAllowed}>
                    submit
                </Button>
            </HStack>
            <Text>getTokenIdAllowed: {String(result)}</Text>
        </>
    );
};

export default EachVaultStatus;
