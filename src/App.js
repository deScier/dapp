import { useState } from 'react'
import {
  Anchor,
  Box,
  Heading,
  Header,
  Paragraph,
  Footer,
  Text,
  Accordion,
  AccordionPanel
 } from 'grommet';


import React from 'react'

import { ChatBox } from '@orbisclub/modules'
import "@orbisclub/modules/dist/index.modern.css";
// Need to implement routes to do pages. Insert menu, profile page, use Orbis SDK from orbis.club

import Mint from './pages/Mint'

export default function App() {


  return (
    <>
    <ChatBox context="kjzl6cwe1jw14af4m1gtj7yiavgkeejcxrfhli33g12872bwed8d9vq3nu56p3g" poweredByOrbis="black" />
    <Header background="brand">
      <Heading>DAOScience Test</Heading>
      <Text pad="medium">This is a demo dapp, use it in Mumbai testnetwork</Text>
    </Header>
    <Box align="center" flex pad="large">
      <Mint />
      <Accordion>
        <AccordionPanel label="Informations">
          <Box pad="medium" background="light-2">
            <Text>
              Orbis club can be used to allow users follow each other, create open/closed groups
              (acessible with nft, specific id of ERC1155 or specific identities), make its profile, discuss about submissions and lots of other things
            </Text>
            <Text>
              Maybe the nft can be minted and an attribute (verified / not verified) can be set by the scidao after, maybe the NFT can stay non transferable until it is verified / approved.
              This would allow to use already done subgraphs for ERC1155 tokens, we get the URI and then show metadata in the user interface
            </Text>
          </Box>
        </AccordionPanel>
      </Accordion>
      <Footer>
        <Paragraph>
          Learn more about {' '}
          <Anchor href="https://orbis.club/" target="_blank">
            Orbis
          </Anchor> and{' '}
          <Anchor href="https://gitcoin.co/grants/7431/publish-science-scidao" target="_blank">
            DAOScience
          </Anchor>

        </Paragraph>
      </Footer>

    </Box>
    </>
  )
}
