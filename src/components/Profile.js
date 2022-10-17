import React,{useState} from 'react';
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


/** Import Orbis SDK */
import { Orbis } from "@orbisclub/orbis-sdk";

const orbis = new Orbis();

export default function Profile(props) {

  const [user,setUser] = useState();

  /** Connecting with WalletConnect provider */
  async function connectOrbis() {
    /** Connect to Orbis using WalletConnect as a provider */
    const res = await orbis.connect(window.ethereum);
    setUser(res.details);
  }


  return (
    <>
    <Heading>Profile</Heading>
    <Paragraph>
      Connected as {!user?.profile?.username ? props.coinbase : user.profile.username}
    </Paragraph>
    {
      user ?
      <>
      <Paragraph>
        {user.profile?.description}
      </Paragraph>
      <Text>Edit profile at <Anchor href={`https://orbis.club/profile/${user.did}`} target="_blank">Orbis</Anchor></Text>
      </> :
      window.ethereum &&
      <Button secondary onClick={connectOrbis} label="Connect Orbis" />

    }
    </>
  )

}
