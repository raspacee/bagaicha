create table
    if not exists review_like (
        id uuid primary key,
        liker_id uuid not null,
        review_id uuid not null,
        constraint fk_liker foreign key (liker_id) references user_ (id),
        constraint fk_review foreign key (review_id) references review (id)
    )