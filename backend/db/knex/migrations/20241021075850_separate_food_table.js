/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("placeFood", (table) => {
    table.increments("id");
    table.string("name").notNullable();
    table.string("category").notNullable();
    table.string("cuisine").notNullable();
    table.integer("price").nullable();
    table.uuid("placeId");
    table.foreign("placeId").references("place.id").deferrable("deferred");
    table.primary("id");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("placeFood");
};
