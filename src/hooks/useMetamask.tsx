import { ethers } from 'ethers';
import { useEffect } from 'react';
import { atom, useRecoilState } from 'recoil';
import { toName } from '../utils/utils';
import useBoolean from './useBoolean';

const metamaskConnected = atom<boolean>({
  key: 'metamask.connected',
  default: false,
});

const metamaskAccount = atom<string | null>({
  key: 'metamask.account',
  default: null,
});

const metamaskChainId = atom<string>({
  key: 'metamask.chainId',
  default: 'unknown',
});

const metamaskChainName = atom<string>({
  key: 'metamask.chainName',
  default: 'unknown',
});

const useMetamask = () => {
  const available = !!(window as any).ethereum;
  const initialized = useBoolean(false);
  const [connected, setConnected] = useRecoilState(metamaskConnected);
  const [account, setAccount] = useRecoilState(metamaskAccount);
  const [chainId, setChainId] = useRecoilState(metamaskChainId);
  const [chainName, setChainName] = useRecoilState(metamaskChainName);

  useEffect(() => {
    connect();
    console.info('account:', account);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  const connect = async () => {
    if (!available) {
      console.warn('Metamask is not available.');
      return;
    }

    if (initialized.value) {
      console.info('Already initialized.');
      return;
    }

    await getAccount();
    await getChain();

    const ethereum = (window as unknown as { ethereum: ethers.providers.BaseProvider }).ethereum;

    ethereum.on('accountsChanged', (accounts) => {
      if (!accounts.length) setConnected(false);
      setAccount(accounts[0]);
    });

    ethereum.on('chainChanged', (chainId) => {
      setChainId(chainId);
      setChainName(toName(chainId));
    });

    initialized.setTrue();
  };

  const getProvider = () => {
    if (!available) throw Error('Metamask is not available.');
    return new ethers.providers.Web3Provider((window as any).ethereum);
  };

  const getAccount = async () => {
    const provider = getProvider();
    const accounts = await provider.send('eth_requestAccounts', []);
    if (accounts.length) {
      setConnected(true);
      setAccount(accounts[0]);
    }
    return accounts[0];
  };

  const getChain = async () => {
    const provider = getProvider();
    const chainId = await provider.send('net_version', []);
    setChainId(chainId);
    setChainName(toName(chainId));
    return chainId;
  };

  const signer = getProvider().getSigner();

  return { connect, available, connected, account, chainId, chainName, signer };
};

export default useMetamask;
