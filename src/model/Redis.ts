import { createClient } from 'redis'



const getClient = async () => {
    const {host, username, password, port} = new URL(process.env.REDIS_URL)
    try {
        const client = createClient({ url:process.env.REDIS_URL  });
        client.on('error', (err) => console.log('Redis Client Error', err));

        await client.connect()
        return client
    } catch (error) {
        console.log("Erro ao conectar no redis ", error);
        return null
    }
}


export default getClient