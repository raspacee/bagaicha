/*
  place_features
  0 - offers delivery
  1 - offers takeout
  2 - pet friendly
  3 - very clean
  4 - affordable
*/
create table if not exists place (
    id uuid primary key,
    openmaps_place_id varchar(20),
    name varchar(250) not null,
    lat varchar(20) not null,
    long varchar(20) not null,
    display_name varchar(500),
    open_days varchar(10)[],
    opening_time time with time zone,
    closing_time time with time zone,
    place_features smallint[],
    cover_img_url varchar(500),
    thumbnail_img_url varchar(500),
    foods_offered varchar(50)[],
    alcohol_allowed boolean default false,
    owned_by uuid,

    constraint fk_owned_by
      foreign key owned_by
      references user_(id)
)
