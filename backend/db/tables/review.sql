create table if not exists review (
    id uuid primary key,
    author_id uuid not null,
    body text not null,
    picture varchar(500) not null,
    like_count integer default 0,
    place_id uuid not null,
    foods_ate varchar(30)[],
    created_at timestamp not null,
    rating smallint not null,
    
    constraint fk_author
        foreign key (author_id)
        references user_(id),

    constraint fk_place
        foreign key (place_id)
        references place(id)
)
