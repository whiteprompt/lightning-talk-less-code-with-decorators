import express from 'express'
import bodyParser from 'body-parser'
import { BuildRoutes } from './entity-manager'
import { importEntities } from './utils'

importEntities()

async function main() {
    const app = express()
    app.use(bodyParser.json())
    app.use(BuildRoutes())
    const PORT = 3000
    app.listen(PORT, () => console.log('Server listening on port:', PORT))
}

main()