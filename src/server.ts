import Fastify from 'fastify'
import cors from '@fastify/cors'
import { appRoutes } from './routes'

const app = Fastify()

/**
 * Método http: get = pegar uma informação,
 *  post = quando eu tenho uma rota que vai criar alguma coisa,
 *  put = quando é uma rota que vai atualizar algo por completo,
 *  patch = quando eu for atualizar uma informação especifica do meu recurso,
 *  Delete = quando for deletar um recurso dentro do meu backend
 */
app.register(cors)
app.register(appRoutes)



app.listen({
    port: 3333,
}).then(() => {
    console.log('HTTP Server running')
})