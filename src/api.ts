import express from 'express'
import { PrismaClient } from "@prisma/client"
import { allCDPs, dateFilteredCDPs } from './endpoints/cdps'
const app = express()

app.use(express.json())

app.get("/addresses",
    async (req, res) => {
        const prisma: PrismaClient = new PrismaClient()

        const addresses = await prisma.address.findMany()
        res.status(200).send(JSON.stringify(addresses))

        prisma.$disconnect()
    }
)

app.get("/cdp", allCDPs)
app.get("/cdpFilter", dateFilteredCDPs)

export default app