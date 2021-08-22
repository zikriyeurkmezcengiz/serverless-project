import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { deleteTodo, getTodoItem } from '../../businessLayer/todo'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import * as middy from 'middy'

const logger = createLogger('deleteTodo')
const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

const bucketName = process.env.TODO_IMAGES_S3_BUCKET

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    const todoItem = await getTodoItem(userId, todoId)
    const isItemExists = !!todoItem

    if (!isItemExists) {
      logger.error(
        `${userId} attempted to delete non-existing todo item with id of : ${todoId}`
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

    await deleteTodo(userId, todoId)

    if (todoItem.attachmentUrl) {
      await deleteFromS3(todoId)
    }

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

async function deleteFromS3(todoId: string): Promise<void> {
  const params = {
    Bucket: bucketName,
    Key: todoId
  }

  try {
    await s3.deleteObject(params).promise()
  } catch (err) {
    logger.error(`Cant delete image of todo id : ${todoId}`, err)
  }
}