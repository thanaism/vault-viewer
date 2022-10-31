import { Box, Button, Heading } from '@chakra-ui/react';
import { toName } from '../utils/utils';

const SwitchButtons = (props: { chainId: string; chainName: string }) => {
    const chainIds = ['1', '5', '137'];
    return (
        <Box maxW="800px" borderWidth="1px" borderRadius="lg" overflow="hidden" padding="2" margin="2">
            <Heading>chain: {props.chainName}</Heading>
            {chainIds
                .filter((id) => Number(id) !== Number(props.chainId))
                .map((id, index) => (
                    <SwitchButton chainId={id} key={index} />
                ))}
        </Box>
    );
};

const SwitchButton = (props: { chainId: string; key: number }) => {
    const changeTo = async () => {
        const { ethereum } = window as unknown as { ethereum: any };
        const chainId = '0x' + Number(props.chainId).toString(16);
        console.log('chainId is...', chainId);
        await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId }],
        });
    };
    return (
        <Button margin="0.5" color="black" onClick={changeTo}>
            to: {toName(props.chainId)}
        </Button>
    );
};

export default SwitchButtons;
