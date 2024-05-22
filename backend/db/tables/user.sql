create table if not exists user_ (
    id uuid primary key,
    first_name varchar(50) not null,
    last_name varchar(50) not null,
    password varchar(255) not null,
    email varchar(100) unique not null,
    created_at timestamp not null,
    profile_picture_url varchar(500),
    moderation_lvl smallint default 0
)
