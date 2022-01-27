import * as ethers from 'ethers'
import CDP_MANAGER_ABI from './cdpmanager.abi.json'
import { PrismaClient } from '@prisma/client'

const CDP_MANAGER_ADDR = process.env.GOERLI?"0xdcBf58c9640A7bd0e062f8092d70fb981Bb52032":"0x5ef30b9986345249bc32d8928B7ee64DE9435E39"

const prisma = new PrismaClient()

const provider = new ethers.providers.AlchemyProvider(process.env.GOERLI?"goerli":"mainnet", "qbi9x5mKPZEtl6eUwBjVFUrfSpBpfCoo")
const manager = new ethers.Contract(CDP_MANAGER_ADDR, CDP_MANAGER_ABI, provider)

const main = async () => {
    provider.getBlockNumber().then(n => {
        console.log(`Listening for blocks... Latest #${n}`)

        console.log("Listening for new cdp events...")

        const filter = manager.filters.NewCdp()
        provider.on(filter, async (log) => {
            console.log(log)
            let found = await prisma.address.findFirst({
                where: {
                    address: log.topics[1]
                }
            })

            if (!found) {
                var addr = await prisma.address.create({
                    data: {
                        address: log.topics[1]
                    }
                })
            } else {
                var addr = found
            }

            let cdp = await prisma.cdp.create({
                data: {
                    ownerId: addr.id,
                    create_tx: log.transactionHash,
                    block_number: log.blockNumber
                }
            })

            console.log(`logged new cdp from ${addr.address}: txhash ${cdp.create_tx}`)
        })
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

