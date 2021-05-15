import { DateTime } from 'luxon'
import { BaseModel, column,belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Category from './Category'

export default class Task extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public categoryId: number


  @belongsTo(() => Category,{


  })
  public category: BelongsTo<typeof Category>

  @column()
  public name: string

  @column()
  public completed: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
