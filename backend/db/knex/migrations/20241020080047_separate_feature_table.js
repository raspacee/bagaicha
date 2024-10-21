/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("feature", (table) => {
      table.increments("id", { primaryKey: true });
      table.string("featureName");
    })
    .createTable("placeFeature", (table) => {
      table.integer("featureId").notNullable();
      table.uuid("placeId").notNullable();
      table
        .foreign("featureId")
        .references("feature.id")
        .deferrable("deferred");
      table.foreign("placeId").references("place.id").deferrable("deferred");
      table.primary(["featureId", "placeId"]);
    })
    .table("place", (table) => {
      table.dropColumn("placeFeatures");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTable("placeFeature")
    .dropTable("feature")
    .table("place", (table) => {
      table.specificType("placeFeatures", "text[]");
    });
};
