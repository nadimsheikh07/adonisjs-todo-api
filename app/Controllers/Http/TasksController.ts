// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { schema, rules } from '@ioc:Adonis/Core/Validator'
const moment = require('moment')

import Task from 'App/Models/Task'

export default class TasksController {
  async index({ request, response }) {
    const query = Task.query()
    query.preload('category')
    const search = request.input('search')
    const orderBy = request.input('orderBy')
    const orderDirection = request.input('orderDirection')

    if (orderBy && orderDirection) {
      query.orderBy(`${orderBy}`, orderDirection)
    }

    if (search) {
      query.where('name', search)
    }

    if (request.input('filters')) {
      const filters = JSON.parse(request.input('filters'))
      filters.forEach((filter) => {
        switch (filter.name) {
          case 'created_at':
            query.whereRaw(`DATE(${filter.name}) = '${moment(filter.value).format('YYYY-MM-DD')}'`)
            break
          case 'updated_at':
            query.whereRaw(`DATE(${filter.name}) = '${moment(filter.value).format('YYYY-MM-DD')}'`)
            break
          default:
            query.whereRaw(`${filter.name} LIKE '%${filter.value}%'`)
            break
        }
      })
    }

    let page = null
    let pageSize = null

    if (request.input('page')) {
      page = request.input('page')
    }
    if (request.input('pageSize')) {
      pageSize = request.input('pageSize')
    }

    var result
    if (page && pageSize) {
      result = await query.paginate(page, pageSize)
    } else {
      result = await query
    }

    return response.status(200).send(result)
  }

  async store({ request, response }) {
    const query = new Task()

    const newUserSchema = schema.create({
      name: schema.string({}, [rules.unique({ table: 'tasks', column: 'name' })]),
      category_id: schema.number(),
      completed: schema.boolean(),
    })

    try {
      await request.validate({
        schema: newUserSchema,
      })
    } catch (error) {
      return response.badRequest(error.messages)
    }

    query.categoryId = request.input('category_id')
    query.name = request.input('name')
    query.completed = request.input('completed')

    await query.save()
    return response.status(200).send({ message: 'Create successfully' })
  }

  async show({ params, response }) {
    const query = await Task.findOrFail(params.id)
    return response.status(200).send(query)
  }

  async update({ params, request, response }) {
    const query = await Task.findOrFail(params.id)

    const newUserSchema = schema.create({
      name: schema.string({}, [
        rules.unique({ table: 'tasks', column: 'name', whereNot: { id: params.id } }),
      ]),
      category_id: schema.number(),
      completed: schema.boolean(),
    })

    try {
      await request.validate({
        schema: newUserSchema,
      })
    } catch (error) {
      return response.badRequest(error.messages)
    }

    query.categoryId = request.input('category_id')
    query.name = request.input('name')
    query.completed = request.input('completed')

    await query.save()
    return response.status(200).send({ message: 'Update successfully' })
  }

  async destroy({ params, response }) {
    const query = await Task.findOrFail(params.id)
    try {
      await query.delete()
      return response.status(200).send({ message: 'Delete successfully' })
    } catch (error) {
      return response
        .status(423)
        .send({ message: 'Something went wrong or check the module where assign' })
    }
  }
}
