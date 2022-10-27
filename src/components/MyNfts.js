import React,{useMemo,useState} from 'react'
import {
  Button,
  Box,
  Heading,
  Image,
  Paragraph,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Anchor
 } from 'grommet';


export default function MyNfts (props) {
  const [myOwnedNfts,setOwnedNFTs] = useState();

  useMemo(async () => {
    if(props.coinbase && props.nftScience && !myOwnedNfts){

      const coinbase = props.coinbase;
      const nftScience = props.nftScience;
      const filter = nftScience.filters.TransferSingle(null,"0x0000000000000000000000000000000000000000",coinbase,null,null);
      setOwnedNFTs(props.myNfts)
      nftScience.on(filter, async (operator,from,to,id,value) => {

        if(from !== '0x0000000000000000000000000000000000000000' && to !== coinbase){
          return;
        }
        const uriToken = await nftScience.uri(id);
        const metadataToken = JSON.parse(await (await fetch(`${uriToken.replace("ipfs://","https://ipfs.io/ipfs/")}`)).text());
        fetch(metadataToken.image.replace("ipfs://","https://ipfs.io/ipfs/"));

        const obj = {
          id: id,
          metadata: metadataToken,
          uri: uriToken
        }

        setOwnedNFTs([obj,...myOwnedNfts]);
      });
    }
  },[props,myOwnedNfts]);
  return(
    <>
    {
      myOwnedNfts?.length > 0 &&
      <>
      <Heading level="5">NFTs (Submissions Approved)</Heading>
      <Box alignContent="center" align="center" pad="medium" direction="row-responsive" wrap={true}>
      {
        myOwnedNfts?.map(obj => {
          if(!obj.metadata){
            return;
          }
          const imageURI = obj.metadata.image;
          const uriImage = imageURI.replace("ipfs://","https://nftstorage.link/ipfs/");
          const uriMetadata = obj.uri.replace("ipfs://","https://nftstorage.link/ipfs/");
          return(
            <Box pad="medium">
              <Card  height="medium" width="small" background="light-1">
                <CardHeader pad="medium"><b>{obj.metadata.name}</b></CardHeader>
                <CardBody pad="small"><Image alignSelf="center" src={uriImage} width="150px"/></CardBody>
                <CardFooter pad={{horizontal: "small"}} background="light-2" align="center" alignContent="center">
                  <Anchor href={uriMetadata} target="_blank">Info</Anchor>
                  <Anchor href={`https://testnet.rarible.com/collection/polygon/${props.nftScience.address}:${obj.id}`} target="_blank">Marketplace</Anchor>
                </CardFooter>
              </Card>
            </Box>
          )
        })
      }
      </Box>
      </>
    }
    </>
  )
}
