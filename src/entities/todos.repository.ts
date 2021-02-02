import { BasicRepo } from "../entity-manager";
import { Todo } from "./todo";

export class TodosRepository implements BasicRepo<Todo> {
    private static sequenceID = 1
    private static todoMapStore: TodoMap = { }

    async all(): Promise<Todo[]> {
        return Object.values(TodosRepository.todoMapStore)
    }

    async get(id: number): Promise<Todo> {
        return TodosRepository.todoMapStore[id]
    }

    async set(id: number, todo: Todo): Promise<void> {
        TodosRepository.todoMapStore[id] = todo
    }

    async create(todo: Todo): Promise<Todo> {
        todo.id = TodosRepository.sequenceID
        todo.done = false
        TodosRepository.todoMapStore[TodosRepository.sequenceID] = todo
        TodosRepository.sequenceID++
        return todo
    }
}

type TodoMap = {
    [key:number]: Todo
}