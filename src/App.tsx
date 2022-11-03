import useMetamask from './hooks/useMetamask';
import SwitchButtons from './components/SwitchButtons';
import EachVaultStatus from './components/EachVaultStatus';
import { Box, Heading } from '@chakra-ui/react';

function App() {
  const { available, chainName, chainId, signer } = useMetamask();

  if (!available) return <Heading>Please Install MetaMask.</Heading>;
  if (chainId === 'unknown') return null;
  return (
    <Box minHeight="100vh" padding="2">
      <SwitchButtons chainId={chainId} chainName={chainName} />
      <EachVaultStatus chainId={chainId} signer={signer} />
    </Box>
  );
}

export default App;
