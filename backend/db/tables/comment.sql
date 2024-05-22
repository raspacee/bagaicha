create table if not exists review_comment (
	id serial primary key,
	review_id uuid not null,
	author_id uuid not null,
	body varchar(500),
	created_at timestamp with time zone,
	reply_to integer default null,
  like_count integer default 0,

	constraint fk_review
		foreign key (review_id)
		references review(id),

	constraint fk_reply
		foreign key (reply_to)
		references review_comment(id),

	constraint fk_author
		foreign key (author_id)
		references user_(id)
)
