// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
const moment = require('moment')

import Category from 'App/Models/Category'
export default class CategoriesController {

  async index({ request, response }) {
    const query = Category.query()

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
    const query = new Category()

    const newUserSchema = schema.create({
      name: schema.string({}, [rules.unique({ table: 'categories', column: 'name' })]),
    })

    try {
      await request.validate({
        schema: newUserSchema,
      })
    } catch (error) {
      return response.badRequest(error.messages)
    }

    query.name = request.input('name')

    await query.save()
    return response.status(200).send({ message: 'Create successfully' })
  }

  async show({ params, response }) {
    const query = await Category.findOrFail(params.id)
    return response.status(200).send(query)
  }

  async update({ params, request, response }) {
    const query = await Category.findOrFail(params.id)

    const newUserSchema = schema.create({
      name: schema.string({}, [
        rules.unique({ table: 'categories', column: 'name', whereNot: { id: params.id } }),
      ]),
    })

    try {
      await request.validate({
        schema: newUserSchema,
      })
    } catch (error) {
      return response.badRequest(error.messages)
    }

    query.name = request.input('name')

    await query.save()
    return response.status(200).send({ message: 'Update successfully' })
  }

  async destroy({ params, response }) {
    const query = await Category.findOrFail(params.id)
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
