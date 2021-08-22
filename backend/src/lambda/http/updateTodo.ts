import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getTodoItem, updateTodo } from '../../businessLayer/todo'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import * as middy from 'middy'

const logger = createLogger('updateTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    const todoItem = await getTodoItem(userId, todoId)
    const isItemExists = !!todoItem

    if (!isItemExists) {
      logger.error(
        `${userId} attempted to update non-existing todo item with id of : ${todoId}`
      )
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          error: `${todoId} item not exists.`
        })
      }
    }

    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

    await updateTodo(userId, todoId, updatedTodo)

    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: ''
    }
  }
)