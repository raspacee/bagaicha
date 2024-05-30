
create table if not exists search (
    id serial primary key,
    user_id uuid not null,
    created_at timestamp with time zone not null, 
    query varchar(200) not null,

    constraint fk_user
        foreign key (user_id)
        references user_(id)
)
