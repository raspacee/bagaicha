create table if not exists review_bookmark (
    id serial primary key,
    user_id uuid not null,
    review_id uuid not null,
    created_at timestamptz,

    constraint fk_liker
        foreign key (user_id)
        references user_(id),

    constraint fk_review
        foreign key (review_id)
        references review(id)
)
