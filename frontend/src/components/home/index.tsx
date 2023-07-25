/* eslint-disable @next/next/no-img-element */
/**
 * @since 2023/07/16
 * @author ThinhHV <thinh@thinhhv.com>
 * @description description
 * @copyright (c) 2023 Company Platform
 */

'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  useAccount,
  useConnect,
  useContractRead,
  useContractReads,
  useContractWrite,
  useNetwork,
  useSwitchNetwork,
  useWaitForTransaction,
} from 'wagmi'
import votingABI from 'src/configs/contracts/voting.abi.json'
import tokenABI from 'src/configs/contracts/token.abi.json'
import { CONFIGS } from 'src/configs'
import { LoadingCircle } from '@/components/shared/icons'
import { BigNumber, utils } from 'ethers'
import { useSignInModal } from '@/components/layout/sign-in-modal'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import { config } from '../../app/providers'
import { formatTime } from '@/lib/utils'
import Button from '../shared/button'
import HeroSection from './hero-section'
import Modal from '../shared/modal'

const TOTAL_ITEM = 6
const MIN_APPROVE_AMOUNT = 5
const contract = {
  voting: {
    address: CONFIGS.CONTRACT_VOTING,
    abi: votingABI as any,
    chainId: CONFIGS.CHAIN_ID,
  },
  token: {
    address: CONFIGS.TOKEN_VOTING,
    abi: tokenABI,
    chainId: CONFIGS.CHAIN_ID,
  },
}

const Home = () => {
  const [data, setData] = useState<
    {
      name: string
      avatar: string
      images: string[]
      description: string
      amountVote: BigNumber
    }[]
  >([])
  const [dataTotalVote, setDataTotalVote] = useState<number>(0)
  const [dataTime, setDataTime] = useState<number[]>([0, 0])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false)
  const [hash, setHash] = useState<string>('')
  const [hashApprove, setHashApprove] = useState<string>('')
  const [imageId, setImageId] = useState<number>(0)
  const { data: session } = useSession()
  const { address: walletAddress } = useAccount()
  const { chain } = useNetwork()
  const { switchNetwork } = useSwitchNetwork({
    chainId: CONFIGS.CHAIN_ID,
    onError: (error) => {
      console.log(error)
      // setError(error.message)
    },
  })
  const { SignInModal, setShowSignInModal } = useSignInModal()
  // const { VotingModal, setShowModal: setShowVotingModal } = useVotingModal()
  const { connect, error: errorConnect } = useConnect({ connector: config.connectors[1] })

  ////////////////////////////////////////////////
  ///////////// CONTRACT FUNCTIONS ///////////////
  ////////////////////////////////////////////////

  // Get list artist
  const {
    data: dataFetch,
    isError,
    error: errorFetchList,
    isSuccess: isSuccessFetchList,
    isLoading: isLoadingFetchList,
    refetch: refetchList,
  } = useContractReads({
    enabled: true,
    watch: true,
    contracts: Array.from(Array(TOTAL_ITEM).keys()).map((_, index) => ({
      ...contract.voting,
      functionName: 'imageId',
      args: [index + 1],
    })),
  })
  // Get total voted
  const {
    data: dataFetchTotalVote,
    refetch: refetchTotalVote,
    isSuccess: isSuccessTotalVote,
  } = useContractRead({
    enabled: true,
    watch: true,
    ...contract.voting,
    functionName: 'totalVote',
  })
  // Get start/end time
  const {
    data: dataFetchTime,
    isSuccess: isSuccessFetchTime,
    refetch: refetchTime,
  } = useContractReads({
    enabled: false,
    contracts: [
      {
        ...contract.voting,
        functionName: 'votingStartTime',
      },
      {
        ...contract.voting,
        functionName: 'votingEndTime',
      },
    ],
  })
  // Process approve
  const {
    data: dataApprove,
    isLoading: isLoadingApprove,
    error: errorApprove,
    isSuccess: isSuccessApprove,
    write: writeApprove,
  } = useContractWrite({
    ...contract.token,
    functionName: 'approve',
    args: [CONFIGS.CONTRACT_VOTING, 1000000 * Math.pow(10, 18)],
  })
  // approve
  const {
    isFetching: isFetchingTransactionApprove,
    isLoading: isLoadingTransactionApprove,
    isSuccess: isSuccessTransactionApprove,
    refetch: refetchTransactionApprove,
  } = useWaitForTransaction({
    enabled: false,
    hash: hashApprove as any,
  })
  // Check allowance
  const { data: dataAllowance, refetch: refetchDataAllowance } = useContractRead({
    enabled: false,
    ...contract.token,
    functionName: 'allowance',
    args: [(session as any)?.address, CONFIGS.CONTRACT_VOTING],
  })
  // Voting
  const {
    data: dataVoting,
    isLoading: isLoadingVoting,
    isSuccess: isSuccessVoting,
    write: writeVoting,
  } = useContractWrite({
    ...contract.voting,
    functionName: 'vote',
  })
  const {
    isFetching: isFetchingTransaction,
    isLoading: isLoadingTransactionVoting,
    isSuccess: isSuccessTransactionVoting,
    refetch: refetchVotingTransaction,
  } = useWaitForTransaction({
    enabled: false,
    hash: hash as any,
  })

  ////////////////////////////////////////////////
  /////////// END CONTRACT FUNCTIONS /////////////
  ////////////////////////////////////////////////

  useEffect(() => {
    refetchList()
    refetchTotalVote()
    refetchTime()
  }, [])

  useEffect(() => {
    console.log('errorConnect', errorConnect)
  }, [errorConnect])

  useEffect(() => {
    const { address } = (session as any) || {}
    if (address) {
      connect()
      refetchDataAllowance()
    }
  }, [session])

  useEffect(() => {
    if (dataVoting?.hash) {
      setHash(dataVoting.hash)
    }
  }, [dataVoting])

  useEffect(() => {
    if (dataApprove?.hash) {
      setHashApprove(dataApprove.hash)
    }
  }, [dataApprove])

  useEffect(() => {
    if (isSuccessTransactionApprove) {
      toast.success('Successfully approve!')
      refetchDataAllowance()
    }
  }, [isSuccessTransactionApprove])

  useEffect(() => {
    if (errorApprove) {
      toast.error(errorApprove.message.split('.')[0].substring(0, 100))
    }
  }, [errorApprove])

  useEffect(() => {
    setIsLoading(
      isLoadingVoting ||
        isFetchingTransaction ||
        isLoadingTransactionVoting ||
        isFetchingTransactionApprove ||
        isLoadingTransactionApprove ||
        isLoadingApprove,
    )
  }, [
    isLoadingVoting,
    isFetchingTransaction,
    isLoadingTransactionVoting,
    isFetchingTransactionApprove,
    isLoadingTransactionApprove,
    isLoadingApprove,
  ])

  useEffect(() => {
    if (hash) {
      // toast.promise(new Promise((rs, rj) => {
      //   if (isSuccessTransactionVoting) {
      //     rs(true)
      //   }
      //   setTimeout(() => rs(true), 5000)
      // }), {
      //   loading: 'Confirming transaction...',
      //   success: <b>Transaction confirmed!</b>,
      //   error: <b>Could not confirm.</b>,
      // })
      if (isSuccessVoting) {
        refetchVotingTransaction?.()
      }
    }
  }, [isSuccessVoting, hash])

  useEffect(() => {
    if (hashApprove && isSuccessApprove) {
      refetchTransactionApprove()
    }
  }, [isSuccessApprove, hashApprove])

  useEffect(() => {
    if (isSuccessTransactionVoting) {
      toast.success('Successfully voting!')
      refetchList()
      refetchTotalVote()
      refetchDataAllowance()
    }
  }, [isSuccessTransactionVoting])

  useEffect(() => {
    if (isSuccessTotalVote && dataFetchTotalVote) {
      setDataTotalVote(
        !dataFetchTotalVote
          ? 0
          : Number(utils.formatUnits(dataFetchTotalVote as unknown as BigNumber)),
      )
    }
  }, [dataFetchTotalVote, isSuccessTotalVote])

  useEffect(() => {
    if (isSuccessFetchList && dataFetch) {
      setData(
        (dataFetch as any[])?.map((e) => ({
          name: e.result[0],
          avatar: e.result[1],
          images: [e.result[2], e.result[3], e.result[4]],
          description: e.result[5],
          amountVote: e.result[6],
        })),
      )
      console.log('Received data', dataFetch)
    }
  }, [dataFetch, isSuccessFetchList])

  useEffect(() => {
    if (isSuccessFetchTime && dataFetchTime) {
      setDataTime([
        Number(dataFetchTime?.[0]?.result?.toString() || 0) * 1000,
        Number(dataFetchTime?.[1]?.result?.toString() || 0) * 1000,
      ])
      console.log('Received dataTime', dataFetchTime)
    }
  }, [dataFetchTime, isSuccessFetchTime])

  useEffect(() => {
    if (isSuccessTransactionApprove) {
      // handle voting
      console.log('Writing contract vote')
      writeVoting?.({
        args: [MIN_APPROVE_AMOUNT * Math.pow(10, 18), imageId],
      })
    }
  }, [isSuccessTransactionApprove, imageId])

  const onClickVote = useCallback(
    async (index: number) => {
      console.log('Voting for ' + index)
      setImageId(index)
      const { address } = (session as any) || {}
      if (!address) {
        setShowSignInModal(true)
        return
      }
      if (!walletAddress) {
        connect()
      }
      console.log('Current chain ID', chain?.id)
      if (chain?.id !== CONFIGS.CHAIN_ID) {
        switchNetwork?.()
      }
      console.log('dataAllowance', dataAllowance)
      if (
        Number(utils.formatUnits((dataAllowance as BigNumber) || BigNumber.from(0), 0)) <
        Number(MIN_APPROVE_AMOUNT * Math.pow(10, 18))
      ) {
        writeApprove?.()
      } else {
        // handle voting
        console.log('Writing contract vote')
        writeVoting?.({
          args: [MIN_APPROVE_AMOUNT * Math.pow(10, 18), index],
        })
      }
    },
    [session, chain, writeApprove, writeVoting, dataAllowance, walletAddress],
  )

  return (
    <>
      <HeroSection />
      <div id="voting" className="py-8"></div>
      <div className="z-10 text-center text-3xl text-blue-500">
        <div className=" font-bold">INCOMING</div>
        <div className="z-10 text-center text-sm text-blue-500">
          {formatTime(dataTime[0]) + ' UTC'} ~ {formatTime(dataTime[1]) + ' UTC'}
        </div>
      </div>
      <div className="z-10 w-full max-w-xl px-5 xl:px-0">
        {(!data || data.length === 0) && (
          <p className="mt-6 flex justify-center text-center md:text-xl">
            <LoadingCircle height={12} width={12} />
          </p>
        )}
        {isError && !isLoadingFetchList && (
          <>
            <p className="mt-6 text-center text-gray-500 md:text-xl">
              Cannot fetch data from blockchain. {errorFetchList?.message}
            </p>
            <p className="mt-6 text-center text-gray-500 md:text-xl">
              <Button onClick={() => refetchList()}>Refetch</Button>
            </p>
          </>
        )}
      </div>
      {!isLoadingFetchList && data && data.length > 0 && (
        <div className="z-10 mt-5 font-bold">TOTAL DEPOSITED: {dataTotalVote} DV</div>
      )}
      <div className="z-10 my-5 grid w-full max-w-screen-xl grid-cols-1 gap-5 px-5 md:grid-cols-2 xl:px-0">
        {data &&
          data.length > 0 &&
          data.map(({ name, amountVote, avatar }, index) => (
            <a
              onClick={(e) => {
                e.preventDefault()
                setImageId(index + 1)
                setShowDetailModal(true)
              }}
              className="flex flex-col rounded-lg bg-gray-500 bg-cover bg-local bg-center bg-no-repeat p-8 text-left bg-blend-multiply hover:bg-blend-soft-light dark:hover:bg-blend-darken"
              style={{ backgroundImage: `url(${avatar})`, height: '300px' }}
            >
              <div className="flex-1 text-right text-white">
                <span className="p-2 bg-white text-black rounded-md text-xs bg-opacity-75">
                  {Math.round(Number(utils.formatUnits(amountVote || BigNumber.from(0))) * 100) /
                    100}{' '}
                  DV (
                  {Math.round(
                    (Number(utils.formatUnits(amountVote || BigNumber.from(0))) /
                      Number(dataTotalVote)) *
                      100,
                  )}
                  %)
                </span>
              </div>
              <div className="text-white">
                <p className="mb-5 max-w-xl font-extrabold leading-tight tracking-tight">{name}</p>
                <div className="mt-5 flex text-center">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={(e: any) => {
                      e.preventDefault()
                      onClickVote(index + 1)
                      if (e.stopPropagation) e.stopPropagation()
                    }}
                    className="mr-2 inline-flex items-center rounded-lg border border-white bg-white px-2.5 py-1.5 text-center text-xs font-medium text-black hover:text-blue-500 focus:outline-none focus:ring-4 focus:ring-gray-700"
                  >
                    {isLoading && imageId === index + 1 && (
                      <LoadingCircle className="mr-2 inline-block" />
                    )}
                    {imageId !== index + 1
                      ? 'Vote'
                      : isFetchingTransaction || isLoadingTransactionVoting
                      ? 'Confirming'
                      : isLoadingApprove ||
                        isFetchingTransactionApprove ||
                        isLoadingTransactionApprove
                      ? 'Approving'
                      : 'Vote'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageId(index + 1)
                      setShowDetailModal(true)
                    }}
                    className="inline-flex items-center rounded-lg border border-white px-2.5 py-1.5 text-center text-xs font-medium text-white hover:bg-white hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-700"
                  >
                    Detail
                    <svg
                      className="ml-2 h-3 w-3"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 14 10"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M1 5h12m0 0L9 1m4 4L9 9"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </a>
          ))}
      </div>
      <Modal showModal={showDetailModal} setShowModal={setShowDetailModal}>
        <div
          className="max-h-full w-full max-w-5xl overflow-auto rounded-lg border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800 sm:p-6"
          style={{ maxHeight: '90%' }}
        >
          <p className="mb-5 max-w-xl font-extrabold leading-tight tracking-tight">
            {data[imageId]?.name}
          </p>
          <div className="text-center">{data[imageId]?.description}</div>
          <div className="flex flex-col gap-3 text-center">
            <img src={data[imageId]?.avatar} alt="image" />
            {data[imageId]?.images.map((e) => (
              <img src={e} alt="image" />
            ))}
          </div>
          <a href="#"></a>
        </div>
      </Modal>
      <SignInModal />
    </>
  )
}

export default Home
