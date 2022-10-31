import { Button, Text } from '@chakra-ui/react';
import { toName } from '../utils/utils';

const SwitchButtons = (props: { chainId: string; chainName: string }) => {
    const chainIds = ['1', '5', '137'];
    return (
        <>
            <Text>chain: {props.chainName}</Text>
            {chainIds
                .filter((id) => Number(id) !== Number(props.chainId))
                .map((id, index) => (
                    <SwitchButton chainId={id} key={index} />
                ))}
        </>
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
        <Button margin={'0.5'} color={'black'} onClick={changeTo}>
            to: {toName(props.chainId)}
        </Button>
    );
};

export default SwitchButtons;
