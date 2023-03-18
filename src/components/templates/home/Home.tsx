import { CheckCircleIcon, EditIcon, EmailIcon, SettingsIcon, ViewIcon } from '@chakra-ui/icons';
import { Heading, VStack, List, ListIcon, ListItem, FormControl, FormLabel, Input, Button, Divider, useToast, Box, Table, TableContainer, Tbody, Td, Th, Thead, Tr, useColorModeValue } from '@chakra-ui/react';
import { EvmChain } from 'moralis/common-evm-utils';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import abi from './abi.json';
import { useContractWrite, usePrepareContractWrite } from 'wagmi';
import { readContract } from '@wagmi/core';
import Moralis from 'moralis';
import { ethers } from 'ethers';
import { getEllipsisTxt } from 'utils/format';

const chain = EvmChain.MUMBAI;
const address = '0x0e669F9078470a48896D825e2f3e719928D0720d';

interface Record {
  firstPartnerName: string;
  secondPartnerName: string;
  firstWitnessName: string;
  secondWitnessName: string;
  secondPartnerAddress: string;
  firstWitnessAddress: string;
  secondWitnessAddress: string;
  officiantAddress: string;
  weddingDate: string;
  weddingLocation: string;
  secondPartnerSigned: boolean;
  firstWitnessSigned: boolean;
  secondWitnessSigned: boolean;
  officiantSigned: boolean;
}

const Home = () => {
  const hoverTrColor = useColorModeValue('gray.100', 'gray.700');
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const chain = EvmChain.MUMBAI;
  const [marriageInfo, setMarriageInfo] = useState({
    firstPartnerName: '-',
    secondPartnerName: '-',
    firstWitnessName: '-',
    secondWitnessName: '-',
    secondPartnerAddress: '-',
    firstWitnessAddress: '-',
    secondWitnessAddress: '-',
    weddingDate: '-',
    weddingLocation: '-',
  });
  const { config: firstPartnerSignConfig } = usePrepareContractWrite({
    address: address,
    abi: abi,
    functionName: 'firstPartnerSign',
    args: [
      marriageInfo.firstPartnerName,
      marriageInfo.secondPartnerName,
      marriageInfo.firstWitnessName,
      marriageInfo.secondWitnessName,
      marriageInfo.secondPartnerAddress,
      marriageInfo.firstWitnessAddress,
      marriageInfo.secondWitnessAddress,
      marriageInfo.weddingDate,
      marriageInfo.weddingLocation,
    ],
  });
  const { data, isLoading, isSuccess, error, write: firstPartnerSign } = useContractWrite({
    ...firstPartnerSignConfig, 
    onError(error) {
      console.log('Error', error);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
    onSuccess(d1) {
      console.log('Success', d1)
      toast({
        title: 'Success',
        description: 'Your proposal is now on the blockchain!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    }
  });
  const onFirstPartnerSign = async (data: any) => {
    setMarriageInfo({
      firstPartnerName: data.firstPartner,
      secondPartnerName: data.secondPartner,
      firstWitnessName: data.firstWitness,
      secondWitnessName: data.secondWitness,
      secondPartnerAddress: data.secondPartnerAddress,
      firstWitnessAddress: data.firstWitnessAddress,
      secondWitnessAddress: data.secondWitnessAddress,
      weddingDate: data.marriageDate,
      weddingLocation: data.marriageLocation,
    });
    firstPartnerSign?.();
    console.log(data);
  };

  const [firstPartner, setFirstPartner] = useState({ firstPartnerAddress: '' });
  const {
    register: registerSecondPartnerForm,
    handleSubmit: handleSubmitSecondPartner,
    formState: { errors: errorSecondPartner },
  } = useForm();
  const { config: secondPartnerSignConfig } = usePrepareContractWrite({
    address: address,
    abi: abi,
    functionName: 'secondPartnerSign',
    args: [firstPartner.firstPartnerAddress],
  });
  const {
    data: d2,
    isLoading: isL2,
    isSuccess: isS2,
    error: e2,
    write: secondPartnerSign,
  } = useContractWrite({
    ...secondPartnerSignConfig, 
    onError(error) {
      console.log('Error', error);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
    onSuccess(data) {
      console.log('Success', data)
      toast({
        title: 'Success',
        description: 'You have accepted the proposal!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    }
  });
  const onSecondPartnerSign = async (data: any) => {
    setFirstPartner(data);
    secondPartnerSign?.();
    console.log(data);
    return (
      <div>
        {isLoading && <div>Check Wallet</div>}
        {isSuccess && <div>Transaction: {JSON.stringify(data)}</div>}
      </div>
    );
  };

  const {
    register: registerFirstWitnessForm,
    handleSubmit: handleSubmitFirstWitness,
    formState: { errors: errorFirstWitness },
  } = useForm();
  const { config: firstWitnessSignConfig } = usePrepareContractWrite({
    address: address,
    abi: abi,
    functionName: 'firstWitnessSignOff',
    args: [firstPartner.firstPartnerAddress],
  });
  const {
    data: w1,
    isLoading: isLW1,
    isSuccess: isSW1,
    error: eW1,
    write: firstWitnessSign,
  } = useContractWrite({
    ...firstWitnessSignConfig, 
    onError(error) {
      console.log('Error', error);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
    onSuccess(data) {
      console.log('Success', data)
      toast({
        title: 'Success',
        description: 'You have signed off as a witness!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    }
  });
  const onFirstWitnessSign = async (data: any) => {
    try {
    setFirstPartner(data);
    firstWitnessSign?.();
    } catch (error) {
    console.log('Error', error);
    toast({
      title: 'Error',
      description: 'error.message',
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
    }
  };

  const {
    register: registerSecondWitnessForm,
    handleSubmit: handleSubmitSecondWitness,
    formState: { errors: errorSecondWitness },
  } = useForm();
  const { config: secondWitnessSignConfig } = usePrepareContractWrite({
    address: address,
    abi: abi,
    functionName: 'secondWitnessSignOff',
    args: [firstPartner.firstPartnerAddress],
  });
  const {
    data: w2,
    isLoading: isLW2,
    isSuccess: isSW2,
    error: eW2,
    write: secondWitnessSign,
  } = useContractWrite({
    ...secondWitnessSignConfig, 
    onError(error) {
      console.log('Error', error);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
    onSuccess(data) {
      console.log('Success', data)
      toast({
        title: 'Success',
        description: 'You have signed off as a witness!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    }
  });
  const onSecondWitnessSign = async (data: any) => {
    setFirstPartner(data);
    secondWitnessSign?.();
    console.log(data);
    return (
      <div>
        {isLoading && <div>Check Wallet</div>}
        {isSuccess && <div>Transaction: {JSON.stringify(data)}</div>}
      </div>
    );
  };

  const {
    register: registerOfficiantForm,
    handleSubmit: handleSubmitOfficiant,
    formState: { errors: errorOfficiant },
  } = useForm();
  const { config: officiantSignConfig } = usePrepareContractWrite({
    address: address,
    abi: abi,
    functionName: 'officiantSignOff',
    args: [firstPartner.firstPartnerAddress],
  });
  const {
    data: o,
    isLoading: isLO,
    isSuccess: isSO,
    error: eO,
    write: officiantSign,
  } = useContractWrite({
    ...firstWitnessSignConfig, 
    onError(error) {
      console.log('Error', error);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
    onSuccess(data) {
      console.log('Success', data)
      toast({
        title: 'Success',
        description: 'You have officiated the marriage!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    }
  });
  const onOfficiantSign = async (data: any) => {
    setFirstPartner(data);
    officiantSign?.();
    console.log(data);
    return (
      <div>
        {isLoading && <div>Check Wallet</div>}
        {isSuccess && <div>Transaction: {JSON.stringify(data)}</div>}
      </div>
    );
  };

  const {
    register: registerViewRecordForm,
    handleSubmit: handleSubmitViewRecord,
    formState: { errors: errorViewRecord },
  } = useForm();

  // Form logic for viewing an address' marriage record
  const [firstPartnerAddress, setFirstPartnerAddress] = useState<string>();
  const [records, setRecords] = useState<Record[]>();
  const {
    register: registerViewRecordsForm,
    handleSubmit: handleSubmitViewRecords,
    formState: { errors: errorViewRecords },
  } = useForm();
  const onViewRecord = async (data: any) => {
    try {
      const record = (await readContract({
        address: address,
        abi: abi,
        functionName: 'getRecords',
        args: [data.firstPartnerAddress],
      })) as Record[];
      console.log(record);
      setFirstPartnerAddress(data.firstPartnerAddress);
      setRecords(record);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Heading size="lg" marginBottom={6}>
        Ethereum Marriage Registry
      </Heading>
      <List spacing={3}>
        <ListItem>
          <ListIcon as={SettingsIcon} color="green.500" />
          First, log in to your preferred wallet
        </ListItem>
        <ListItem>
          <ListIcon as={EditIcon} color="green.500" />
          One partner fills up the form first, signs and submits it
        </ListItem>
        <ListItem>
          <ListIcon as={EditIcon} color="green.500" />
          Then get your other partner to sign and submit it
        </ListItem>
        <ListItem>
          <ListIcon as={EditIcon} color="green.500" />
          Next, the two witnesses will sign and submit it too
        </ListItem>
        <ListItem>
          <ListIcon as={CheckCircleIcon} color="green.500" />
          Finally get your marriage officiant to sign off
        </ListItem>
        <ListItem>
          <ListIcon as={ViewIcon} color="green.500" />
          Now you can view your marriage record! Congratulations!!
        </ListItem>
      </List>
      <Divider marginTop={6}/>
      <Heading size="md" marginTop={6} marginBottom={6}>
        First Partner Section
      </Heading>
      <form onSubmit={handleSubmit(onFirstPartnerSign)}>
        <FormControl isRequired>
          <FormLabel>First Partner</FormLabel>
          <Input placeholder="First Partner" {...register('firstPartner')} />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Second Partner</FormLabel>
          <Input placeholder="Second Partner" {...register('secondPartner')} />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>First Witness</FormLabel>
          <Input placeholder="First Witness" {...register('firstWitness')} />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Second Witness</FormLabel>
          <Input placeholder="Second Witness" {...register('secondWitness')} />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Second Partner's Address</FormLabel>
          <Input placeholder="Second Partner's Address" {...register('secondPartnerAddress')} />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>First Witness' Address</FormLabel>
          <Input placeholder="First Witness' Address" {...register('firstWitnessAddress')} />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Second Witness' Address</FormLabel>
          <Input placeholder="Second Witness' Address" {...register('secondWitnessAddress')} />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Marriage date</FormLabel>
          <Input placeholder="Marriage date" {...register('marriageDate')} />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Marriage location</FormLabel>
          <Input placeholder="Marriage location" {...register('marriageLocation')} />
        </FormControl>
        <Button mt={4} colorScheme="teal" type="submit">
          Submit
        </Button>
      </form>
      <Divider marginTop={6}/>
      <Heading size="md" marginTop={6} marginBottom={6}>
        Second Partner Section
      </Heading>
      <form onSubmit={handleSubmitSecondPartner(onSecondPartnerSign)}>
        <FormControl isRequired>
          <FormLabel>Second Partner</FormLabel>
          <Input placeholder="First Partner Address" {...registerSecondPartnerForm('firstPartnerAddress')} />
        </FormControl>
        <Button mt={4} colorScheme="teal" type="submit">
          Sign
        </Button>
      </form>
      <Divider marginTop={6}/>
      <Heading size="md" marginTop={6} marginBottom={6}>
        First Witness Section
      </Heading>
      <form onSubmit={handleSubmitFirstWitness(onFirstWitnessSign)}>
        <FormControl isRequired>
          <FormLabel>First Witness</FormLabel>
          <Input placeholder="First Partner Address" {...registerFirstWitnessForm('firstPartnerAddress')} />
        </FormControl>
        <Button mt={4} colorScheme="teal" type="submit">
          Sign
        </Button>
      </form>
      <Divider marginTop={6}/>
      <Heading size="md" marginTop={6} marginBottom={6}>
        Second Witness Section
      </Heading>
      <form onSubmit={handleSubmitSecondWitness(onSecondWitnessSign)}>
        <FormControl isRequired>
          <FormLabel>Second Witness</FormLabel>
          <Input placeholder="First Partner Address" {...registerSecondWitnessForm('firstPartnerAddress')} />
        </FormControl>
        <Button mt={4} colorScheme="teal" type="submit">
          Sign
        </Button>
      </form>
      <Divider marginTop={6}/>
      <Heading size="md" marginTop={6} marginBottom={6}>
        View Marriage Record
      </Heading>
      <form onSubmit={handleSubmitViewRecord(onViewRecord)}>
        <FormControl isRequired>
          <FormLabel>First Partner Address</FormLabel>
          <Input placeholder="First Partner Address" {...registerViewRecordForm('firstPartnerAddress')} />
        </FormControl>
        <Button mt={4} colorScheme="teal" type="submit" marginBottom={6}>
          Submit
        </Button>
      </form>
      {records?.length ? (
        <Box border="2px" borderColor={hoverTrColor} borderRadius="xl" padding="24px 18px">
          <TableContainer w={'full'}>
            <Table>
              <Thead>
                <Tr>
                  <Th>First Partner</Th>
                  <Th>Second Partner</Th>
                  <Th>Second Partner Address</Th>
                  <Th>Second Partner Signed</Th>
                  <Th>First Witness</Th>
                  <Th>First Witness Address</Th>
                  <Th>First Witness Signed</Th>
                  <Th>Second Witness</Th>
                  <Th>Second Witness Address</Th>
                  <Th>Second Witness Signed</Th>
                  <Th>Date</Th>
                  <Th>Location</Th>
                  <Th>Officiant Address</Th>
                  <Th>Officiant Signed</Th>
                </Tr>
              </Thead>
              <Tbody>
                {records?.map((tx, key) => (
                  <Tr key={key} _hover={{ bgColor: hoverTrColor }} cursor="pointer">
                    <Td>{tx?.firstPartnerName}</Td>
                    <Td>{tx?.secondPartnerName}</Td>
                    <Td>{getEllipsisTxt(tx?.secondPartnerAddress)}</Td>
                    <Td>{tx?.secondPartnerSigned ? 'Yes' : 'No'}</Td>
                    <Td>{tx?.firstWitnessName}</Td>
                    <Td>{getEllipsisTxt(tx?.firstWitnessAddress)}</Td>
                    <Td>{tx?.firstWitnessSigned ? 'Yes' : 'No'}</Td>
                    <Td>{tx?.secondWitnessName}</Td>
                    <Td>{getEllipsisTxt(tx?.secondWitnessAddress)}</Td>
                    <Td>{tx?.secondWitnessSigned ? 'Yes' : 'No'}</Td>
                    <Td>{new Date(tx.weddingDate).toLocaleDateString()}</Td>
                    <Td>{tx.weddingLocation}</Td>
                    <Td>{getEllipsisTxt(tx?.officiantAddress)}</Td>
                    <Td>
                      {tx?.officiantSigned ? 'Yes' : 'No'}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      ) : (
        <Box>Looks like you do not have any records</Box>
      )}
    </>
  );
};

export default Home;