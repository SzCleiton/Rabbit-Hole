import fastify from "fastify";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl }  from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { r2 } from "../lib/cloudflare";
import { PrismaClient } from '@prisma/client';
import { z } from "zod";

const app = fastify()

const prisma = new PrismaClient()

app.post('/uploads', async (request) => {
    const uploadBodySchema = z.object({
        name: z.string().min(1),
        contentType: z.string().regex(/\w+\/[-+.\w]+/),
    })

    const { name, contentType }  = uploadBodySchema.parse(request.body)

    const fileKey = randomUUID().concat('-').concat(name)

    const signedUrl = await getSignedUrl(
        r2,
        new PutObjectCommand({
            Bucket: 'rabbithole-prod',
            Key: fileKey,
            ContentType: contentType,
        }),
        { expiresIn: 600 }
    )

    await prisma.file.create({
        data: {
            name,
            contentType,
            key: fileKey,
        }
    })

    return signedUrl
})

app.listen({
    port: 3333,
    host: '0.0.0.8',
}).then(() => {
    console.log('HTTP server runnig!')
})