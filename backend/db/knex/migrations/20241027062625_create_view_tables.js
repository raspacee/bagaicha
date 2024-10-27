/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
    create or replace view "foodsView" as 
    select "placeId",
	array_agg(lower("name"::varchar)) as "foodsArray"
	from "placeFood"
	group by "placeId";

    create or replace view "featuresView" as 
	select "placeId",
	array_agg("featureName"::varchar) as "featuresArray"
	from "placeFeature" as pf
	inner join "feature" as f
	on pf."featureId" = f."id" 
	group by "placeId";

    create or replace view "reviewRatingAvgView" as 
    select p."id" as "placeId", coalesce(avg(rating), 0) as "reviewAvg" 
    from "place" as p
    left join "placeReview" as pr on p.id = pr."placeId"
    group by p."id";
    
    create or replace view "postRatingAvgView" as 
    select p.id as "placeId", coalesce(avg(rating), 0) as "postAvg"
    from "place" as p
    left join "post" as po on p.id = po."placeId"
    group by p."id";
    
    create or replace view "placeRatingView" as 
    select "postRatingAvgView"."placeId", round(("reviewAvg" + "postAvg") / 2.0::numeric, 1) as "averageRating"
    from "reviewRatingAvgView"
    inner join "postRatingAvgView"
    on "reviewRatingAvgView"."placeId" = "postRatingAvgView"."placeId"`);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropView("placeRatingView")
    .dropView("postRatingAvgView")
    .dropView("reviewRatingAvgView")
    .dropView("featuresView")
    .dropView("foodsView");
};
