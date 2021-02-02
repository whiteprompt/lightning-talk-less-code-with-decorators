import express, { NextFunction, Router } from 'express'
import { read } from 'fs'

export function BuildRoutes() {
    const router = Router()
    for (const [storeKey, store] of Object.entries(entityManager.store)) {
        if (store.subpaths) {
            for (const [subpathKey, handlerData] of Object.entries(store.subpaths)) {
                const method = handlerData.method.toLowerCase() as ('get' | 'post' | 'put' | 'delete')
                router[method](`${store.basepath}${handlerData.subpath}`, handlerData.handler)

                console.log('BUILDING:', storeKey, method.toUpperCase(), `${store.basepath}${handlerData.subpath}`)
            }
        }
    }

    return router
}

const entityManager: EntityManager = {
    store: {},
    transforms: {},
}

export function Transform<T extends Object>(transformFunction: (data : any) => any) {
    return (target: T, propertyKey: string) => {
        const transformStoreEntity = entityManager.transforms[target.constructor.name] || { [propertyKey]: [] }
        transformStoreEntity[propertyKey].push(transformFunction)
        entityManager.transforms[target.constructor.name] = transformStoreEntity
    }
}

export function DataRepository<T extends { new (...args: any[]): {} }>(repo: BasicRepo<any>) {
    return function (constructor: T) {
        entityManager.store[constructor.name] = entityManager.store[constructor.name] || { subpaths: {}, repo } as RoutesDefinition
        entityManager.store[constructor.name].repo = repo
        return constructor
    }
}

export function Route<T extends { new (...args: any[]): {} }>(basepath: string) {
    return function (constructor: T) {
        entityManager.store[constructor.name] = entityManager.store[constructor.name] || { basepath, subpaths: {} } as RoutesDefinition
        entityManager.store[constructor.name].basepath = basepath
        return constructor
    }
}
export function Create<T extends { new (...args: any[]): {} }>(
    requiredFields: string[]
) {
    return function (constructor: T) {
        const controllerStore = entityManager.store[constructor.name] || { subpaths: { } }
        controllerStore.subpaths['POST /'] = {
            async handler(req, res, next) {
                let allRequiredFielsPresent = true
                const fieldsNotPresent: string[] = []
                for (const requiredField of requiredFields) {
                    if (!Object.keys(req.body).includes(requiredField)) {
                        allRequiredFielsPresent = false
                        fieldsNotPresent.push(requiredField)
                    }
                }

                if (allRequiredFielsPresent) {
                    res.json(await controllerStore.repo.create(req.body))
                } else {
                    res.status(400).json({ message: 'Required fields not present', error:  fieldsNotPresent })
                }                
            },
            method: 'POST',
            subpath: '/'
        }
        
        entityManager.store[constructor.name] = controllerStore

        return constructor
    }
}

export function ReadAll<T extends { new (...args: any[]): {} }>() {

}

export function ReadOne<T extends { new (...args: any[]): {} }>() {
    return function (constructor: T) {
        const controllerStore = entityManager.store[constructor.name] || { subpaths: { } }
        controllerStore.subpaths['GET /:id'] = {
            async handler(req, res, next) {
                const { id } = req.params
                const entity = await controllerStore.repo.get(Number(id))

                if (entity) {
                    res.json(applyTransforms(constructor.name, entity))
                } else {
                    res.status(404).json({ message: 'Entity not found', error: { id } })
                }
            },
            method: 'GET',
            subpath: '/:id'
        }
        
        entityManager.store[constructor.name] = controllerStore
    }
}

function applyTransforms<EntityType>(className: string, entity: EntityType): EntityType {
    const transformStoreEntity = entityManager.transforms[className]
    if (transformStoreEntity) {
        let entityShallowCopy = { ...entity } as EntityType
        for (const entityProperty of Object.keys(entityShallowCopy)) {
            if (transformStoreEntity[entityProperty]) {
                entityShallowCopy = Object.assign(entityShallowCopy, {
                    [entityProperty]: transformStoreEntity[entityProperty]
                        .reduce((data, func) => func(data), (entityShallowCopy as any)[entityProperty])
                })
            }
        }
        return entityShallowCopy
    } else {
        return entity
    }
}

export function Delete<T extends { new (...args: any[]): {} }>() {
    return function (constructor: T) {
        
    }
}

type EntityManager = {
    store: {
        [key:string]: RoutesDefinition
    }
    transforms: Transforms
}

type Transforms = {
    [entityName:string]: {
        [propertyName:string]: ((value: any) => any)[]
    }
}

type RoutesDefinition<T = any> = {
    repo: BasicRepo<T>;
    basepath: string
    subpaths: {
        [key:string]: {
            subpath: string
            method: 'POST' | 'GET' | 'PUT' | 'DELETE'
            handler: (req: express.Request, res: express.Response, next: NextFunction) => void
        }
    }
}

export type BasicRepo<T> = {
    all(): Promise<T[]>
    get(id: number): Promise<T>
    set(id: number, entity: T): Promise<void>
    create(entity: T): Promise<T>
}