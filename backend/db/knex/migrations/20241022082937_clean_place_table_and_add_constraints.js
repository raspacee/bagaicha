/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .alterTable("place", (table) => {
      table.dropColumn("openingTime");
      table.dropColumn("closingTime");
      table.dropColumn("foodsOffered");
    })
    .alterTable("placeFood", (table) => {
      table.unique(["name", "placeId"]);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("place", (table) => {
    table.time("openingTime");
    table.time("closingTime");
    table.specificType("foodsOffered", "varchar[]");
  });
};
