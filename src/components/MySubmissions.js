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
  Anchor,
  List
 } from 'grommet';


export default function MySubmissions (props) {

  const [submissions,setSubmissions] = useState();

  useMemo(async () => {
    if(!props.submissions){
      return
    }
    if(props.coinbase && props.nftScience){
      const coinbase = props.coinbase;
      const nftScience = props.nftScience;
      const filter = nftScience.filters.Submited(coinbase);
      const newSubmissions = props.submissions.map(obj => {
        console.log(obj)
        return({
          name: 'Submission',
          uri: obj.uri,
          uriLink: <Anchor href={`https://nftstorage.link/ipfs/${obj.uri}`} target="_blank">{obj.uri}</Anchor>
        })
      })
      console.log(newSubmissions)
      setSubmissions(newSubmissions)
      nftScience.on(filter, async (from,uri,uriHash) => {

        const obj = {
          name: "Submission",
          from: from,
          uri: uri,
          uriHash: uriHash,
          uriLink: <Anchor href={`https://ipfs.io/ipfs/${uri}`} target="_blank">{uri}</Anchor>
        }

        setSubmissions([obj,...submissions]);
      });
    }
  },[props]);

  return(
    <>
    {
      submissions?.length > 0 &&
      <>
      <Heading level="5">Submissions</Heading>
      <Box alignContent="center" align="center" pad="medium" direction="row-responsive" wrap={true}>
      <List
        primaryKey="name"
        secondaryKey="uriLink"
        data={submissions}
        style={{wordBreak: 'break-all'}}
      />

      </Box>
      </>
    }
    </>
  )
}
