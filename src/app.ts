import * as ethers from 'ethers'
import CDP_MANAGER_ABI from './cdpmanager.abi.json'
import PROXY_ABI from './proxy.abi.json'
import { PrismaClient } from '@prisma/client'
import api from './api'

import dotenv from 'dotenv'
dotenv.config()


const CDP_MANAGER_ADDR = process.env.GOERLI?
    "0xdcBf58c9640A7bd0e062f8092d70fb981Bb52032"
    : "0x5ef30b9986345249bc32d8928B7ee64DE9435E39";

const prisma = new PrismaClient()

const provider = new ethers.providers.AlchemyProvider(
    process.env.GOERLI?
    "goerli"
    : "mainnet",
    process.env.ALCHEMY_KEY
)
const manager = new ethers.Contract(CDP_MANAGER_ADDR, CDP_MANAGER_ABI, provider)

const main = async () => {
    provider.getBlockNumber().then(n => {
        console.log(`Listening for blocks... Latest #${n}`)

        console.log("Listening for new cdp events...")

        const filter = manager.filters.NewCdp()
        provider.on(filter, async (log) => {
            let address = "0x" + log.topics[1].split("").slice(log.topics[1].length - 40).join("")
            console.log(log.topics[1], '->', address)

            let found = await prisma.address.findFirst({
                where: {
                    address
                }
            })

            if (!found) {
                var addr = await prisma.address.create({
                    data: {
                        address
                    }
                })
            } else {
                var addr = found
            }

            let cdp = await prisma.cdp.create({
                data: {
                    ownerId: addr.id,
                    create_tx: log.transactionHash,
                    block_number: log.blockNumber,
                    datetime_created: new Date().toISOString()
                }
            })

            if (await provider.getCode(address)) {
                // assume it is a DSProxy instance
                try {
                    const proxy = new ethers.Contract(address, PROXY_ABI, provider)
                    let ownerAddress = await proxy.owner()
                    await prisma.address.update({
                        where: {
                            id: addr.id
                        },
                        data: {
                            address: ownerAddress
                        }
                    })
                } catch(e) {
                    console.warn(`address ${address} isn't a DSProxy.`)
                }
            }

            console.log(`logged new cdp from ${address}: txhash ${cdp.create_tx}`)
        })
        api.listen(process.env.PORT, () => console.log(`API up and running at :${process.env.PORT}`))
    })
}

main()
    .then(
        () => prisma.$disconnect()
    )
    .catch(
        (e) => {
            console.error("An error ocurred: ", e)
            prisma.$disconnect()
        }
    )

