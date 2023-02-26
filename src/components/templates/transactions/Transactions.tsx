import {
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Tfoot,
  Heading,
  Box,
  useColorModeValue,
  FormControl,
  FormLabel,
  Button,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberDecrementStepper,
  NumberIncrementStepper,
} from '@chakra-ui/react';
import { useEvmWalletTransactions } from '@moralisweb3/next';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { getEllipsisTxt } from 'utils/format';
import { useNetwork, usePrepareContractWrite, useContractWrite } from 'wagmi';
import { readContract } from '@wagmi/core';
import { useForm } from 'react-hook-form';
import abi from '../home/abi.json';

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

interface Officiant {
  officiantName: string;
  officiantAddress: string;
  officiantLocation: string;
  issuingAuthority: string;
  rootAuthority: string;
  permissions: number;
  isActive: boolean;
}

const address = '0x0e669F9078470a48896D825e2f3e719928D0720d';

const Transactions = () => {
  const hoverTrColor = useColorModeValue('gray.100', 'gray.700');
  const { data } = useSession();
  const { chain } = useNetwork();
  const { data: transactions } = useEvmWalletTransactions({
    address: data?.user?.address,
    chain: chain?.id,
  });

  useEffect(() => console.log('transactions: ', transactions), [transactions]);

  // Form logic for viewing an address' marriage record
  const [firstPartnerAddress, setFirstPartnerAddress] = useState<string>();
  const [records, setRecords] = useState<Record[]>();
  const {
    register: registerViewRecordForm,
    handleSubmit: handleSubmitViewRecord,
    formState: { errors: errorViewRecord },
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

  // Form logic for viewing an officiant's record
  const [officiantAddress, setOfficiantAddress] = useState<string>();
  const [officiantRecords, setOfficiantRecords] = useState<Officiant[]>();
  const {
    register: registerViewOfficiantRecordForm,
    handleSubmit: handleSubmitViewOfficiantRecord,
    formState: { errors: errorViewOfficiantRecord },
  } = useForm();
  const onViewOfficiantRecord = async (data: any) => {
    try {
      const record = (await readContract({
        address: address,
        abi: abi,
        functionName: 'getOfficiantRecord',
        args: [data.officiantAddress],
      })) as Officiant[];
      console.log(record);
      setOfficiantRecords(data.officiantAddress);
      setOfficiantRecords(record);
    } catch (error) {
      console.log(error);
    }
  };

  // Officiant sign-off
  const { config: officiantSignConfig } = usePrepareContractWrite({
    address: address,
    abi: abi,
    functionName: 'officiantSignOff',
    args: [firstPartnerAddress],
  });
  const { data: d1, isLoading, isSuccess, error, write: officiantSign } = useContractWrite(officiantSignConfig);
  const onOfficiantSign = async () => {
    officiantSign?.();
  };

  // Form logic for adding a first root officiant
  const [officiantInfo, setOfficiantInfo] = useState({
    officiantName: '-',
    officiantAddress: '-',
    officiantLocation: '-',
    issuingAuthority: '-',
    rootAuthority: '-',
    permissions: -1,
  });
  const {
    register: registerAddFirstRootOfficiantForm,
    handleSubmit: handleSubmitAddFirstRootOfficiant,
    formState: { errors: errorAddFirstRootOfficiant },
  } = useForm();
  const { config: addFirstRootOfficiantConfig } = usePrepareContractWrite({
    address: address,
    abi: abi,
    functionName: 'addFirstRootOfficiant',
    args: [officiantInfo.officiantName, officiantInfo.officiantAddress, officiantInfo.officiantLocation],
  });
  const { data: d2, isLoading: l2, isSuccess: s2, error: e2, write: addFirstRootOfficiant } = useContractWrite(addFirstRootOfficiantConfig);
  const onAddFirstRootOfficiant = async (data: any) => {
    setOfficiantInfo({
      officiantName: data.officiantName,
      officiantAddress: data.officiantAddress,
      officiantLocation: data.officiantLocation,
      issuingAuthority: '-',
      rootAuthority: '-',
      permissions: 2,
    })
    addFirstRootOfficiant?.();
  };

  // Form logic for adding an officiant
  const {
    register: registerAddOfficiantForm,
    handleSubmit: handleSubmitAddOfficiant,
    formState: { errors: errorAddOfficiant },
  } = useForm();
  const { config: addOfficiantConfig } = usePrepareContractWrite({
    address: address,
    abi: abi,
    functionName: 'addOfficiant',
    args: [officiantInfo.officiantName, officiantInfo.officiantAddress, officiantInfo.officiantLocation, officiantInfo.issuingAuthority, officiantInfo.rootAuthority, officiantInfo.permissions],
  });
  const { data: d3, isLoading: l3, isSuccess: s3, error: e3, write: addOfficiant } = useContractWrite(addOfficiantConfig);
  const onAddOfficiant = async (data: any) => {
    setOfficiantInfo({
      officiantName: data.officiantName,
      officiantAddress: data.officiantAddress,
      officiantLocation: data.officiantLocation,
      issuingAuthority: data.issuingAuthority,
      rootAuthority: data.rootAuthority,
      permissions: data.permissions,
    })
    addOfficiant?.();
    console.log(data);
  };

  // Render app
  return (
    <>
      <Heading size="lg" marginBottom={6}>
        View Marriage Records
      </Heading>
      <form onSubmit={handleSubmitViewRecord(onViewRecord)}>
        <FormControl isRequired>
          <FormLabel>First Partner Address</FormLabel>
          <Input placeholder="First Partner Address" {...registerViewRecordForm('firstPartnerAddress')} />
        </FormControl>
        <Button mt={4} colorScheme="teal" type="submit">
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
                    <Td>{tx?.secondPartnerSigned ? 'True' : 'False'}</Td>
                    <Td>{tx?.firstWitnessName}</Td>
                    <Td>{getEllipsisTxt(tx?.firstWitnessAddress)}</Td>
                    <Td>{tx?.firstWitnessSigned ? 'True' : 'False'}</Td>
                    <Td>{tx?.secondWitnessName}</Td>
                    <Td>{getEllipsisTxt(tx?.secondWitnessAddress)}</Td>
                    <Td>{tx?.secondWitnessSigned ? 'True' : 'False'}</Td>
                    <Td>{new Date(tx.weddingDate).toLocaleDateString()}</Td>
                    <Td>{tx.weddingLocation}</Td>
                    <Td>{getEllipsisTxt(tx?.officiantAddress)}</Td>
                    <Td>
                      {tx?.officiantSigned ? (
                        <Td>{tx.officiantSigned ? 'True' : 'False'}</Td>
                      ) : (
                        <Button colorScheme="teal" type="submit" onClick={onOfficiantSign}>
                          Sign
                        </Button>
                      )}
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
      <Heading size="lg" marginBottom={6}>
        Add First Root Officiant
      </Heading>
      <form onSubmit={handleSubmitAddFirstRootOfficiant(onAddFirstRootOfficiant)}>
        <FormControl isRequired>
          <FormLabel>Officiant Name</FormLabel>
          <Input placeholder="Officiant Name" {...registerAddFirstRootOfficiantForm('officiantName')} />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Officiant Address</FormLabel>
          <Input placeholder="Officiant Address" {...registerAddFirstRootOfficiantForm('officiantAddress')} />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Officiant Location</FormLabel>
          <Input placeholder="Officiant Location" {...registerAddFirstRootOfficiantForm('officiantLocation')} />
        </FormControl>
        <Button mt={4} colorScheme="teal" type="submit">
          Add
        </Button>
      </form>
      <Heading size="lg" marginBottom={6}>
        Add Officiants
      </Heading>
      <form onSubmit={handleSubmitAddOfficiant(onAddOfficiant)}>
        <FormControl isRequired>
          <FormLabel>Officiant Name</FormLabel>
          <Input placeholder="Officiant Name" {...registerAddOfficiantForm('officiantName')} />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Officiant Address</FormLabel>
          <Input placeholder="Officiant Address" {...registerAddOfficiantForm('officiantAddress')} />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Officiant Location</FormLabel>
          <Input placeholder="Officiant Location" {...registerAddOfficiantForm('officiantLocation')} />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Issuing Authority</FormLabel>
          <Input placeholder="Issuing Authority" {...registerAddOfficiantForm('issuingAuthority')} />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Root Authority</FormLabel>
          <Input placeholder="Root Authority" {...registerAddOfficiantForm('rootAuthority')} />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Permissions</FormLabel>
          <Input type='number' max='2' min='0' step={1} placeholder="Permission Level eg 1" {...registerAddOfficiantForm('permissions')} />
        </FormControl>
       
        <Button mt={4} colorScheme="teal" type="submit">
          Add
        </Button>
      </form>
      <Heading size="lg" marginBottom={6}>
        View Officiant Records
      </Heading>
      <form onSubmit={handleSubmitViewOfficiantRecord(onViewOfficiantRecord)}>
        <FormControl isRequired>
          <FormLabel>Officiant Address</FormLabel>
          <Input placeholder="Officiant Address" {...registerViewOfficiantRecordForm('officiantAddress')} />
        </FormControl>
        <Button mt={4} colorScheme="teal" type="submit">
          Submit
        </Button>
      </form>
      {officiantRecords?.length ? (
        <Box border="2px" borderColor={hoverTrColor} borderRadius="xl" padding="24px 18px">
          <TableContainer w={'full'}>
            <Table>
              <Thead>
                <Tr>
                  <Th>Officiant Name</Th>
                  <Th>Officiant Address</Th>
                  <Th>Officiant Location</Th>
                  <Th>Issuing Authority</Th>
                  <Th>Root Authority</Th>
                  <Th>Permission Level</Th>
                  <Th>First Witness Signed</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {officiantRecords?.map((tx, key) => (
                  <Tr key={key} _hover={{ bgColor: hoverTrColor }} cursor="pointer">
                    <Td>{tx?.officiantName}</Td>
                    <Td>{getEllipsisTxt(tx?.officiantAddress)}</Td>
                    <Td>{tx?.officiantLocation}</Td>
                    <Td>{getEllipsisTxt(tx?.issuingAuthority)}</Td>
                    <Td>{getEllipsisTxt(tx?.rootAuthority)}</Td>
                    <Td>{tx?.permissions}</Td>
                    <Td>{tx?.isActive ? 'Active' : 'Inactive'}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      ) : (
        <Box>Looks like there aren't any records</Box>
      )}
      <Heading size="lg" marginBottom={6}>
        Transactions
      </Heading>
      {transactions?.length ? (
        <Box border="2px" borderColor={hoverTrColor} borderRadius="xl" padding="24px 18px">
          <TableContainer w={'full'}>
            <Table>
              <Thead>
                <Tr>
                  <Th>Hash</Th>
                  <Th>From</Th>
                  <Th>To</Th>
                  <Th>Gas used</Th>
                  <Th>Date</Th>
                  <Th isNumeric>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {transactions?.map((tx, key) => (
                  <Tr key={key} _hover={{ bgColor: hoverTrColor }} cursor="pointer">
                    <Td>{getEllipsisTxt(tx?.hash)}</Td>
                    <Td>{getEllipsisTxt(tx?.from.checksum)}</Td>
                    <Td>{getEllipsisTxt(tx?.to?.checksum)}</Td>
                    <Td>{tx.gasUsed.toString()}</Td>
                    <Td>{new Date(tx.blockTimestamp).toLocaleDateString()}</Td>
                    <Td isNumeric>{tx.receiptStatus}</Td>
                  </Tr>
                ))}
              </Tbody>
              <Tfoot>
                <Tr>
                  <Th>Hash</Th>
                  <Th>From</Th>
                  <Th>To</Th>
                  <Th>Gas used</Th>
                  <Th>Date</Th>
                  <Th isNumeric>Status</Th>
                </Tr>
              </Tfoot>
            </Table>
          </TableContainer>
        </Box>
      ) : (
        <Box>Looks like you do not have any transactions</Box>
      )}
    </>
  );
};

export default Transactions;
