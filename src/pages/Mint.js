import React,{useState,useMemo,useEffect} from 'react';
import {
  Anchor,
  Button,
  Paragraph,
  Box,
  TextInput,
  Spinner,
  FileInput,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Tab,
  Tabs,
  Text,
  Heading
} from 'grommet'

import { ethers } from "ethers";
import {Buffer} from 'buffer'
import { NFTStorage, Blob } from 'nft.storage'


import useWeb3Modal from '../hooks/useWeb3Modal';
import useContract from '../hooks/useContract';
import useIPFS from "../hooks/useIPFS";
import useClient from "../hooks/useGraphClient";

import { addresses, abis } from "../contracts/index.js";


import MySubmissions from '../components/MySubmissions'
import MyNfts from '../components/MyNfts'
import Profile from '../components/Profile'


const NFT_STORAGE_TOKEN = process.env.REACT_APP_NFT_STORAGE_API
const client = new NFTStorage({ token: NFT_STORAGE_TOKEN })

const fr = new FileReader();

export default function Mint() {
  //const [connection, connect, disconnect] = useConnection()
  // Need to do AppState so it can reuse those above
  const {provider,netId,loadWeb3Modal,coinbase} = useWeb3Modal();
  //const {nftScience} = useContract();
  const [nftScience,setNFTScience] = useState();
  const [hash,setHash] = useState();
  const [fileList,setFileList] = useState();
  const [uploading,setUploading] = useState();
  const [submitMsg,setSubmitMsg] = useState();
  const [submitted,setSubmitted] = useState();

  const [submissions,setSubmissions] = useState();
  const [myNfts,setMyNFts] = useState();

  const { ipfs,ipfsErr } = useIPFS();
  const {
    client,
    initiateClient,
    getNftsFrom,
    getSubmissions
  } = useClient();

  useEffect(() => {
    initiateClient(netId);
  }, [netId]);
  useEffect(async () => {
    if (client && coinbase && netId) {
      try {
        const resultsSubmissions = await getSubmissions(coinbase);
        const ownedNfts = await getNftsFrom(coinbase,netId);
        if (ownedNfts.data.accounts[0]?.ERC1155balances) {
          const erc1155Tokens = ownedNfts.data.accounts[0].ERC1155balances;
          console.log(erc1155Tokens)
          const promises = erc1155Tokens.map(getMetadata);
          const newMyOwnedERC1155 = await Promise.all(promises)
          setMyNFts(newMyOwnedERC1155);
        }
        setSubmissions(resultsSubmissions.data.submissions)
        //setLoadingMyNFTs(false);
      } catch (err) {
        console.log(err)
        //setLoadingMyNFTs(false);
      }
    }
  }, [client, coinbase, netId]);



  const getMetadata = item => {
    return (
      new Promise(async (resolve, reject) => {
        try {
          const metadata = JSON.parse(await (await fetch(item.token.uri.replace("ipfs://",`https://nftstorage.link/ipfs/`))).text());
          resolve({
            id: item.id,
            metadata: metadata,
            uri: item.token.uri
          })
        } catch (err) {
          resolve({});
        }
      })
    )
  }




  const handleOnChange = async event => {
    const files = event.target.files;
    setHash(null);
    setFileList(files);
  }

  const uploadIFS = () => {
    for (let i = 0; i < fileList.length; i += 1) {
      const file = fileList[i];
      fr.readAsArrayBuffer(file)
    }
  }

  const submit = async () => {
    try{
      setSubmitMsg(<><Spinner/><small>Approve Transaction ...</small></>);
      const signer = provider.getSigner()
      const gasPrice = provider.getGasPrice();
      const tokenWithSigner = nftScience.connect(signer);
      const tx = await tokenWithSigner.submit(hash,{
        value: ethers.utils.parseEther('0.001'),
        gasPrice: gasPrice
      });
      setSubmitMsg(
        <>
          <Spinner/>
          <small style={{wordBreak: 'break-word'}}>Transaction <Anchor href={`https://mumbai.polygonscan.com//tx/${tx.hash}`} target="_blank">{tx.hash}</Anchor> sent, wait confirmation ...</small>
        </>
      );
      await tx.wait();
      setSubmitMsg(
        <small style={{wordBreak: 'break-word'}}>Transaction <Anchor href={`https://mumbai.polygonscan.com//tx/${tx.hash}`} target="_blank">{tx.hash}</Anchor> confirmed</small>
      );
      setTimeout(() => {
        setSubmitMsg(null);
        setSubmitted(true);
      },10000)
    } catch(err){
      setSubmitMsg(<Paragraph style={{wordBreak: 'break-word'}}><small>{err.message}</small></Paragraph>)
      setTimeout(() => {
        setSubmitMsg(null);
      },5000)
    }
  }


  useEffect(() => {
    if(!ipfs){
      return
    }
    fr.addEventListener('progress', event => {setUploading(true)});
    fr.addEventListener('load', async event => {
      console.log(event.target.result)
      const buffer = Buffer.from(event.target.result);
      const {path} = await ipfs.add(buffer,{cidVersion: 1});
      let { car } = await NFTStorage.encodeBlob(new Blob([buffer]));
      const cidNftStorageImage = await client.storeCar(car);
      console.log(`Local node CID: ${path}`);
      console.log(`NFT Storage CID: ${cidNftStorageImage}`);
      const metadata = {
        description: "Some general description here",
        external_link: `https://ipfs.io/ipfs/${path}`,
        image: "ipfs://bafkreiazpmw3b5ssvj7obek5dizbyoo4zfknnbugg75dxrweubbuk5r67q",
        name: "The revision",
        attributes: [
          {
            "trait_type": "Authors",
            "value": ["Test Sir","aut2"]
          },
          {
            "trait_type": "Preview",
            "value": "This is the Preview"
          },
          {
            "trait_type": "Full",
            "value": `ipfs://${path}`
          }
        ]
      }
      const res = await ipfs.add(JSON.stringify(metadata),{cidVersion: 1});
      const storageRes = await NFTStorage.encodeBlob(new Blob([JSON.stringify(metadata)]));
      const cidNftStorageMetadata = await client.storeCar(storageRes.car);
      setHash(res.path)
      console.log(`Local node CID Metadata: ${res.path}`)
      console.log(`NFT Storage CID Metadata: ${cidNftStorageMetadata}`);


      setUploading(false);
    });
  },[ipfs]);

  useEffect(() => {
    if(provider){
      const newNftScience = new ethers.Contract(addresses.nftScience,abis.nftScienceAbi,provider);
      setNFTScience(newNftScience);
    }
  },[provider])



  return (
    <>
    <Heading>Submit Article</Heading>

    {
      coinbase ?
      <>
      <Profile coinbase={coinbase} provider={provider} />
      {
        nftScience &&
        <Paragraph>
        NFTScience at: <Anchor href={`https://mumbai.polygonscan.com/token/${nftScience.address}`} target="_blank">{nftScience.address}</Anchor>
        </Paragraph>
      }

      <FileInput
        name="file"
        onChange={handleOnChange}
      />
      {
        uploading &&
        <>
        <Spinner/>
        <small>Uploading file to ipfs</small>
        </>
      }
      {
        !hash && fileList && !uploading && ipfs &&
        <Button primary label="Upload to IPFS" onClick={uploadIFS} />
      }

      {
        hash &&
        <>
        <Paragraph style={{wordBreak: 'break-word'}}>
          <small>File uploaded to ipfs: <Anchor href={`https://nftstorage.link/ipfs/${hash}`} target="_blank">{hash}</Anchor></small>
        </Paragraph>
        </>
      }

      {
        netId === 80001 ?
        (
          hash && !submitMsg ?
          <Button primary label="Submit to Review" onClick={submit}/> :
          (
            !submitted ?
            submitMsg :
            <Paragraph style={{wordBreak: 'break-word'}}>
              <small>File submitted! Check review status at .....</small>
            </Paragraph>
          )
        ) :
        <Paragraph style={{wordBreak: 'break-word'}}>
          <Anchor href="https://chainlist.network/" target="_blank" rel="noreferrer">
            Please connect to Mumbai Testnetwork
          </Anchor>
        </Paragraph>
      }
      <Box pad="large">
      {
        coinbase && nftScience &&
        <Tabs>
          <Tab title="Submissions">
            <Box pad="medium">
              <MySubmissions provider={provider} coinbase={coinbase} nftScience={nftScience} submissions={submissions}/>
            </Box>
          </Tab>
          <Tab title="NFTs">
            <Box pad="medium">
              <MyNfts provider={provider} coinbase={coinbase} nftScience={nftScience} myNfts={myNfts}  />
            </Box>
          </Tab>
        </Tabs>
      }
      </Box>

      </> :
      <Button primary label="Login" onClick={loadWeb3Modal}/>
    }
    </>
  )

}
