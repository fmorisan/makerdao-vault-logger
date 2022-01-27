import express from 'express'
import { PrismaClient } from "@prisma/client"
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

export default app