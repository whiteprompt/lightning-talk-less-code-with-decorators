import { Create, Transform, Delete, ReadAll, Route, BasicRepo, DataRepository, ReadOne } from '../entity-manager';
import { TodosRepository } from './todos.repository';

@Route('/api/todos')
@Create(['description'])
@ReadOne()
@DataRepository(new TodosRepository())
export class Todo {
    id?: number;
    description?: string;
    done?: boolean;
}