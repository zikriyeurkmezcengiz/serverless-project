import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todo'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todoAccess = new TodoAccess()

export async function getTodosByUser(userId: string): Promise<TodoItem[]> {
  return todoAccess.getTodosByUser(userId)
}

export async function getTodoItem(
  userId: string,
  todoId: string
): Promise<TodoItem> {
  return todoAccess.getTodoBydId(userId, todoId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  const itemId = uuid.v4()

  return todoAccess.createTodo({
    todoId: itemId,
    userId: userId,
    done: false,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    createdAt: new Date().toISOString()
  })
}

export async function updateTodo(
  userId: string,
  todoId: string,
  updateTodoRequest: UpdateTodoRequest
): Promise<void> {
  return todoAccess.updateTodo(userId, todoId, {
    name: updateTodoRequest.name,
    done: updateTodoRequest.done,
    dueDate: updateTodoRequest.dueDate
  })
}

export async function updateTodoItemImage(
  userId: string,
  todoId: string,
  imageUrl: string
): Promise<void> {
  return todoAccess.updateTodoItemImage(userId, todoId, imageUrl)
}

export async function deleteTodo(
  userId: string,
  todoId: string
): Promise<void> {
  return todoAccess.deleteTodo(userId, todoId)
}