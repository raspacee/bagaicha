create table if not exists comment_like (
    id serial primary key,
    liker_id uuid not null,
    comment_id integer not null,

    constraint fk_liker
        foreign key (liker_id)
        references user_(id),

    constraint fk_comment
        foreign key (comment_id)
        references review_comment(id)
)
