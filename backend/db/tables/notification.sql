create table if not exists notification_object (
  id serial primary key,
  object_type varchar(20) not null,
  object_url varchar(500)
)

create table if not exists notification (
	id serial primary key,
	actor uuid not null,
	victim uuid not null,
	notification_object_id int,
	action_type varchar(20),
	unread boolean default true,
	created_at timestamp with time zone,

	constraint fk_actor
		foreign key(actor)
		references user_(id),
	constraint fk_victim
		foreign key(victim)
		references user_(id),
  constraint fk_notificatin_object
    foreign key(notification_object_id)
    references notification_object(id)
)
