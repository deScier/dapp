import { useMemo, useState,useCallback } from "react";
import { addresses, abis } from "../contracts";
import { ethers } from "ethers";

import useWeb3Modal from './useWeb3Modal';

function useContract() {

  const {provider,netId} = useWeb3Modal();
  const [nftScience,setNftScience] = useState()

  useMemo(() => {
    if(!nftScience && provider && netId){
      if(netId === 80001){
        setNftScience(new ethers.Contract(addresses.nftScience,abis.nftScienceAbi,provider))
      } else {
        setNftScience(new ethers.Contract(addresses.nftScience,abis.nftScienceAbi,provider))
      }
    }
  },[nftScience,provider,netId])



  return({nftScience})
}

export default useContract;
