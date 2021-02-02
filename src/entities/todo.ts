import { Create, Transform, Delete, ReadAll, Route, BasicRepo, DataRepository, ReadOne } from '../entity-manager';
import { TodosRepository } from './todos.repository';

@Route('/api/todos')
@Create(['description'])
@ReadOne()
@DataRepository(new TodosRepository())
@ReadAll()
export class Todo {
    id?: number;

    @Transform(description => `${description} YOW`)
    description?: string;
    done?: boolean;
}