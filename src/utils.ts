import fs from 'fs'
import path from 'path'

export function importEntities() {
    const entitiesFiles = fs.readdirSync(path.join(__dirname, './entities/'))
    for (const entityFile of entitiesFiles) {
        require(path.join(__dirname, './entities/', entityFile))
    }
}