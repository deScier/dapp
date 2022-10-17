import { useCallback,useMemo, useState } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";


const providerOptions = {


  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      rpc:{
        80001: "https://matic-mumbai.chainstacklabs.com"
      }
    }
  }


};


const web3Modal = new Web3Modal({
  cacheProvider: true,
  providerOptions
});
// Register the web3modal so the connector has access to it.
function useWeb3Modal(config = {}) {
  const [provider, setProvider] = useState();
  const [coinbase, setCoinbase] = useState();
  const [self,setSelf] = useState();
  const [netId , setNetId] = useState();
  const [connecting , setConnecting] = useState();
  const [noProvider , setNoProvider] = useState();
  //const [cyberConnect , setCyberConnect] = useState();

  const [autoLoaded, setAutoLoaded] = useState(false);
  // Web3Modal also supports many other wallets.
  // You can see other options at https://github.com/Web3Modal/web3modal
  const logoutOfWeb3Modal = useCallback(
    async function () {
      await web3Modal.clearCachedProvider();
      setCoinbase();
      setNetId(80001);
      setProvider(new ethers.providers.JsonRpcProvider("https://matic-mumbai.chainstacklabs.com"));
    },
    [],
  );
  // Open wallet selection modal.
  const loadWeb3Modal = useCallback(async () => {

    try{
      setConnecting(true)
      setAutoLoaded(true);
      const conn = await web3Modal.connect();
      //const conn = await window.ethereum.enable()

      const newProvider = new ethers.providers.Web3Provider(conn,"any");
      const signer = newProvider.getSigner()
      const newCoinbase = await signer.getAddress();
      const {chainId} = await newProvider.getNetwork();
      setProvider(newProvider);
      setCoinbase(newCoinbase);
      setNetId(chainId);
      setNoProvider(true);
      setConnecting(false);
      console.log(newCoinbase)
      conn.on('accountsChanged', accounts => {
        setCoinbase(accounts[0]);
      });
      conn.on('chainChanged', async chainId => {
        window.location.reload();
      });
      // Subscribe to provider disconnection
      conn.on("disconnect", async (error: { code: number; message: string }) => {
        logoutOfWeb3Modal();
      });
      conn.on("close", async () => {
        logoutOfWeb3Modal();
      });
      return;
    } catch(err){
      setConnecting(false)
      logoutOfWeb3Modal();
    }

  }, [logoutOfWeb3Modal]);




  // If autoLoad is enabled and the the wallet had been loaded before, load it automatically now.
  /*
  useMemo(() => {
    if (!autoLoaded && web3Modal.cachedProvider) {
      setAutoLoaded(true);
      loadWeb3Modal();
      setNoProvider(true);
    }
  },[autoLoaded,loadWeb3Modal]);
  */
  /*
  useMemo(() => {

    if(!noProvider && !autoLoaded && !web3Modal.cachedProvider && !connecting){
      setProvider(new ethers.providers.JsonRpcProvider("https://rpc.xdaichain.com"));
      setNetId(0x64);
      setNoProvider(true);
      setAutoLoaded(true);
    }



  },[
    noProvider,
    autoLoaded,
    connecting
   ]);
   */
  return({provider, loadWeb3Modal, logoutOfWeb3Modal,coinbase,netId});
}



export default useWeb3Modal;
