import useMetamask from './hooks/useMetamask';
import SwitchButtons from './components/SwitchButtons';
import EachVaultStatus from './components/EachVaultStatus';
import { Box, Heading } from '@chakra-ui/react';

function App() {
  const { available, chainName, chainId, signer } = useMetamask();

  if (!available) return <Heading>Please Install MetaMask.</Heading>;
  if (chainId === 'unknown') return null;
  return (
    <Box backgroundColor="#282c34" minHeight="100vh" color="white" padding="2">
      <SwitchButtons chainId={chainId} chainName={chainName} />
      <EachVaultStatus chainId={chainId} signer={signer} />
    </Box>
  );
}

export default App;
