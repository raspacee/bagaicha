/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table("place", function (table) {
    table.specificType("contactNumbers", "varchar[]");
    table.string("websiteLink");
    table.string("instagramLink");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table("place", function (table) {
    table.dropColumn("contactNumbers");
    table.dropColumn("websiteLink");
    table.dropColumn("instagramLink");
  });
};
