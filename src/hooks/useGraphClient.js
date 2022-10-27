import { useState } from "react";

// Enter a valid infura key here to avoid being rate limited
// You can get a key for free at https://infura.io/register
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const APIURL_MUMBAI = "https://api.thegraph.com/subgraphs/name/leon-do/mumbai-erc721-erc1155"

const SCIDAO_GRAPH = "https://api.thegraph.com/subgraphs/name/henrique1837/scidao-protocol"

function useGraphClient() {
  const [client, setClient] = useState();
  const [sciDaoClient, setSciDaoClient] = useState();

  const initiateClient = (netId) => {
    //if(!client && netId){
    let newClient = new ApolloClient({
      uri: APIURL_MUMBAI,
      cache: new InMemoryCache()
    });

    const newSciDaoClient = new ApolloClient({
      uri: SCIDAO_GRAPH,
      cache: new InMemoryCache()
    });
    setClient(newClient);
    setSciDaoClient(newSciDaoClient);
  }
  const getNftsFrom = async (address,contractAddress, netId) => {
    let tokensQuery = `
      query {
        accounts(where: {id: "${address.toLowerCase()}"}) {
          id
          ERC1155balances(where: {contract: "${contractAddress.toLowerCase()}"}){
            id
            value
            token {
              id
              uri
            }
          }
        }
      }
   `;
    const results = await client.query({
      query: gql(tokensQuery)
    });
    return (results);
  }



  const getSubmissions = async (address) => {
    const query = `
      query {

        submissions(where: {owner: "${address.toLowerCase()}"}) {
          uri
        }

      }
   `;
    const results = await sciDaoClient.query({
      query: gql(query)
    });
    return (results);
  }


  return ({ client, initiateClient,getNftsFrom,getSubmissions })
}

export default useGraphClient;
