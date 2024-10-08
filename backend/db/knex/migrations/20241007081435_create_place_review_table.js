/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("placeReview", (table) => {
      table.uuid("id").defaultTo(knex.fn.uuid()).unique();
      table.uuid("placeId").defaultTo(knex.fn.uuid());
      table.uuid("userId").defaultTo(knex.fn.uuid());
      table.text("body").notNullable();
      table.smallint("rating").notNullable();
      table.string("imageUrl");
      table.integer("helpfulnessCount").defaultTo(0);
      table.timestamp("createdAt", { useTz: true }).notNullable();
      table.foreign("placeId").references("place.id").deferrable("deferred");
      table.foreign("userId").references("user_.id").deferrable("deferred");
    })
    .createTable("placeReviewHelpful", (table) => {
      table.uuid("placeReviewId").notNullable();
      table.uuid("userId").notNullable();
      table
        .foreign("placeReviewId")
        .references("placeReview.id")
        .deferrable("deferred");
      table.foreign("userId").references("user_.id").deferrable("deferred");
      table.unique(["placeReviewId", "userId"]);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("placeReviewHelpful").dropTable("placeReview");
};
