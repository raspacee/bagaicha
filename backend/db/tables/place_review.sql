create table if not exists place_review (
    id serial primary key,
    place_id uuid not null,
    author_id uuid not null,
    rating smallint not null,
    body varchar(500),
    created_at timestamp with time zone not null,

    constraint fk_author
      foreign key (author_id)
      references user_(id),
    constraint fk_place
      foreign key (place_id)
      references place(id)
)
