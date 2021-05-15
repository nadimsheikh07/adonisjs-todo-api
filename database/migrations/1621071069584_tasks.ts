import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Tasks extends BaseSchema {
  protected tableName = 'tasks'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
      .integer('category_id')
      .unsigned()
      .references('categories.id')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE')
      table.string('name').unique().notNullable()
      table.boolean('completed').defaultTo(false)
      table.timestamps(true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
