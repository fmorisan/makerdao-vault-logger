import express from 'express'
import Joi from 'joi'
import { Prisma, prisma, PrismaClient } from "@prisma/client"

export async function allCDPs(req: express.Request, res: express.Response) {
    const prisma = new PrismaClient()
    const cdps = await prisma.cdp.findMany()

    res.json(cdps).status(200).end()
}

const DateFilteredCDPsArgs = Joi.object({
    from: Joi.date().iso().required(),
    to: Joi.date().iso().default(new Date())
})

export async function dateFilteredCDPs(req: express.Request, res: express.Response) {
    const prisma = new PrismaClient({
        log: [
            "query"
        ]
    })

    try {
        const args = await DateFilteredCDPsArgs.validateAsync(req.query)

        console.log(
            `from ${args.from}; to ${args.to}`,
            args
        )

        // FIXME: this should definitely use native SQL filtering
        // but for some reason prisma doesn't execute queries
        // the way I expect it to do so.

        const cdps = await prisma.cdp.findMany()

        const filtered = cdps.filter(cdp => 
            cdp.datetime_created
            && cdp.datetime_created >= args.from
            && cdp.datetime_created <= args.to
        )
        if (!filtered) {
            res.status(204).end()
        } else {
            res.json(filtered).status(200).end()
        }
    } catch (e) {
        res.json({
            error: e
        }).status(500).end()
        console.error(e)
    }
}