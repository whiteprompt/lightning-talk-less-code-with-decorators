import { Create, Delete, Read, Route, BasicRepo, DataRepository, ReadOne } from '../entity-manager';

type TodoMap = {
    [key:number]: Todo
}

let sequenceID = 1
const todoMapStore: TodoMap = { }

const TodoRepo: BasicRepo<Todo> = {
    all(): Todo[] {
        return Object.values(todoMapStore)
    },
    get(id: number): Todo {
        return todoMapStore[id]
    },
    set(id: number, todo: Todo): void {
        todoMapStore[id] = todo
    },
    create(todo: Todo): Todo {
        todo.id = sequenceID
        todo.done = false
        todoMapStore[sequenceID] = todo
        sequenceID++
        return todo
    }
}

@Route('/api/todos')
@Create(['description'])
@ReadOne()
@DataRepository(TodoRepo)
export class Todo {
    id?: number;
    description?: string;
    done?: boolean;
}