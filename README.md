# RabbitHole

Stack: Node.js, Fastify, Prisma, CloudFlare R2

## Requisitos

### Requisitos Funcionais (RFs):
- [ ] Deve ser possível realizar novos uploads;
- [ ] Deve ser possível visualizar os últimos 5 uploads realizados;

### Regras de Negócio (RNs):
- [ ] Os uploads devem ser removidos automaticamente aopós 7 dias;
- [ ] Só deve ser possível visualizar uploads não expirados;
- [ ] Só deve ser possível realizar upload de arquivos seguros;
- [ ] Só deve ser possível upload de arquivos até 1gb cada;

### Requisitos não funcionais (RNFs):
- [ ] Utilização do CloudFlare R2 para upload de arquivos;
- [ ] O upload deve ser feito diretamente pelo front-end utilizando Presigned URLs;
- [ ] Os links para compartilhamento devem ser assinados evitando acesso público;

## Anotações importantes

### Mime Types

```ts
const bannedMimeTypes = [
    '.exe', //(executáveis)
    '.dll', //(bibliotecas dinamicas)
    '.bat', //(arquivos de lote)
    '.cmd', //(arquivos de comando)
    '.sh', //(scripts shell)
    '.cgi', //(scripts CGI)
    '.jar', //(arquivos java)
    '.app' //(aplicativos macOS)
]
```

### Trechos de código

#### Conexão com CloudFlare (AWS SDK)

``` ts
import { S3Client } from '@aws-sdk/client-s3'

export const r2 = new S3Client({
    region: 'auto',
    endpoint: env.CLOUDFLARE_ENDPOINT,
    credentials: {
        accessKeyId: env.CLOUDFLARE_ACCESS_KEY,
        secretAccessKey: env.CLOUDFLARE_SECRET_KEY,
    }
})
```

### Upload no CloudFlare 

``` ts
const signedUrl = await getSignedUrl(
    r2,
    new PutObjectCommand({
        bucket: 'bucket-name',
        key: 'file.mp4',
        ContentType: 'video/mp4',
    }),
    { expiresIn: 600 }
)
```

``` ts
await axios.put(uploadUrl, file, {
    headers: {
        'ContentType': file.type,
    },
})
```