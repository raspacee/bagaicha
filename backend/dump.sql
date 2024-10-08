--
-- PostgreSQL database dump
--

-- Dumped from database version 14.13 (Ubuntu 14.13-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 14.13 (Ubuntu 14.13-0ubuntu0.22.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- Name: haversine(double precision, double precision, double precision, double precision); Type: FUNCTION; Schema: public; Owner: raspace
--

CREATE FUNCTION public.haversine(lat1 double precision, long1 double precision, lat2 double precision, long2 double precision) RETURNS double precision
    LANGUAGE plpgsql IMMUTABLE
    AS $$
	declare 
	dLat double precision;
	dLon double precision;
	a double precision;
	rad smallint;
	c double precision;
	begin
		dLat := ((lat2 - lat1) * PI())/180.0;
		dLon := ((long2 - long1) * PI())/180.0;
		-- convert latitudes to radians
  		lat1 := (lat1 * PI()) / 180.0;
  		lat2 := (lat2 * PI()) / 180.0;

		a := POWER(SIN(dLat / 2), 2) + POWER(SIN(dLon / 2), 2) * COS(lat1) * COS(lat2);
		rad := 6371; -- Earth's radius in kilometers
  		c := 2 * ASIN(SQRT(a));
		RETURN ROUND((rad * c)::numeric, 1);
	end
	$$;


ALTER FUNCTION public.haversine(lat1 double precision, long1 double precision, lat2 double precision, long2 double precision) OWNER TO raspace;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: comment; Type: TABLE; Schema: public; Owner: raspace
--

CREATE TABLE public.comment (
    id uuid NOT NULL,
    "postId" uuid NOT NULL,
    "authorId" uuid NOT NULL,
    body character varying(500) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "likeCount" integer DEFAULT 0
);


ALTER TABLE public.comment OWNER TO raspace;

--
-- Name: commentLike; Type: TABLE; Schema: public; Owner: raspace
--

CREATE TABLE public."commentLike" (
    "likerId" uuid NOT NULL,
    "commentId" uuid NOT NULL
);


ALTER TABLE public."commentLike" OWNER TO raspace;

--
-- Name: haversineCache; Type: TABLE; Schema: public; Owner: raspace
--

CREATE TABLE public."haversineCache" (
    lat1 double precision,
    lon1 double precision,
    lat2 double precision,
    lon2 double precision,
    result double precision
);


ALTER TABLE public."haversineCache" OWNER TO raspace;

--
-- Name: notification; Type: TABLE; Schema: public; Owner: raspace
--

CREATE TABLE public.notification (
    id uuid NOT NULL,
    "recipientId" uuid NOT NULL,
    "senderId" uuid NOT NULL,
    "postId" uuid,
    "commentId" uuid,
    type character varying(50) NOT NULL,
    "isRead" boolean DEFAULT false,
    "createdAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.notification OWNER TO raspace;

--
-- Name: operatingHour; Type: TABLE; Schema: public; Owner: raspace
--

CREATE TABLE public."operatingHour" (
    id integer NOT NULL,
    "openingTime" time without time zone,
    "closingTime" time without time zone,
    day character varying(9) NOT NULL,
    "placeId" uuid NOT NULL,
    CONSTRAINT "operatingHour_day_check" CHECK (((day)::text = ANY ((ARRAY['Sunday'::character varying, 'Monday'::character varying, 'Tuesday'::character varying, 'Wednesday'::character varying, 'Thursday'::character varying, 'Friday'::character varying, 'Saturday'::character varying])::text[])))
);


ALTER TABLE public."operatingHour" OWNER TO raspace;

--
-- Name: operatingHour_id_seq; Type: SEQUENCE; Schema: public; Owner: raspace
--

CREATE SEQUENCE public."operatingHour_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."operatingHour_id_seq" OWNER TO raspace;

--
-- Name: operatingHour_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: raspace
--

ALTER SEQUENCE public."operatingHour_id_seq" OWNED BY public."operatingHour".id;


--
-- Name: ownershipRequest; Type: TABLE; Schema: public; Owner: raspace
--

CREATE TABLE public."ownershipRequest" (
    id uuid NOT NULL,
    "requestedBy" uuid NOT NULL,
    "placeId" uuid NOT NULL,
    "ownershipGranted" boolean DEFAULT false,
    "documentImageUrl" character varying(500) NOT NULL,
    "requestedDate" timestamp with time zone NOT NULL
);


ALTER TABLE public."ownershipRequest" OWNER TO raspace;

--
-- Name: place; Type: TABLE; Schema: public; Owner: raspace
--

CREATE TABLE public.place (
    id uuid NOT NULL,
    "osmId" character varying(20) NOT NULL,
    name character varying(250) NOT NULL,
    lat double precision NOT NULL,
    lon double precision NOT NULL,
    "openingTime" time without time zone,
    "closingTime" time without time zone,
    "placeFeatures" text[],
    "coverImgUrl" text,
    "foodsOffered" text[],
    "ownedBy" uuid,
    "createdAt" timestamp with time zone NOT NULL,
    road character varying(50),
    neighbourhood character varying(50),
    city character varying(50),
    state character varying(50)
);


ALTER TABLE public.place OWNER TO raspace;

--
-- Name: placeImage; Type: TABLE; Schema: public; Owner: raspace
--

CREATE TABLE public."placeImage" (
    id integer NOT NULL,
    "imageUrl" text NOT NULL,
    "placeId" uuid NOT NULL,
    "addedBy" uuid NOT NULL,
    description text,
    "createdAt" timestamp with time zone NOT NULL,
    "cloudinaryId" text NOT NULL,
    "isMenu" boolean DEFAULT false
);


ALTER TABLE public."placeImage" OWNER TO raspace;

--
-- Name: placeImage_id_seq; Type: SEQUENCE; Schema: public; Owner: raspace
--

CREATE SEQUENCE public."placeImage_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."placeImage_id_seq" OWNER TO raspace;

--
-- Name: placeImage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: raspace
--

ALTER SEQUENCE public."placeImage_id_seq" OWNED BY public."placeImage".id;


--
-- Name: post; Type: TABLE; Schema: public; Owner: raspace
--

CREATE TABLE public.post (
    id uuid NOT NULL,
    "authorId" uuid NOT NULL,
    body text NOT NULL,
    "imageUrl" character varying(500) NOT NULL,
    "likeCount" integer DEFAULT 0,
    "placeId" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    rating smallint NOT NULL
);


ALTER TABLE public.post OWNER TO raspace;

--
-- Name: postBookmark; Type: TABLE; Schema: public; Owner: raspace
--

CREATE TABLE public."postBookmark" (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "postId" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."postBookmark" OWNER TO raspace;

--
-- Name: postLike; Type: TABLE; Schema: public; Owner: raspace
--

CREATE TABLE public."postLike" (
    "likerId" uuid NOT NULL,
    "postId" uuid NOT NULL
);


ALTER TABLE public."postLike" OWNER TO raspace;

--
-- Name: search; Type: TABLE; Schema: public; Owner: raspace
--

CREATE TABLE public.search (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    query character varying(200) NOT NULL
);


ALTER TABLE public.search OWNER TO raspace;

--
-- Name: search_id_seq; Type: SEQUENCE; Schema: public; Owner: raspace
--

CREATE SEQUENCE public.search_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.search_id_seq OWNER TO raspace;

--
-- Name: search_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: raspace
--

ALTER SEQUENCE public.search_id_seq OWNED BY public.search.id;


--
-- Name: user_; Type: TABLE; Schema: public; Owner: raspace
--

CREATE TABLE public.user_ (
    id uuid NOT NULL,
    "firstName" character varying(50) NOT NULL,
    "lastName" character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    email character varying(100) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "profilePictureUrl" character varying(500),
    "moderationLvl" smallint DEFAULT 0,
    bio character varying(500) DEFAULT NULL::character varying,
    "isOAuth2Account" boolean DEFAULT false
);


ALTER TABLE public.user_ OWNER TO raspace;

--
-- Name: operatingHour id; Type: DEFAULT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public."operatingHour" ALTER COLUMN id SET DEFAULT nextval('public."operatingHour_id_seq"'::regclass);


--
-- Name: placeImage id; Type: DEFAULT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public."placeImage" ALTER COLUMN id SET DEFAULT nextval('public."placeImage_id_seq"'::regclass);


--
-- Name: search id; Type: DEFAULT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public.search ALTER COLUMN id SET DEFAULT nextval('public.search_id_seq'::regclass);


--
-- Data for Name: comment; Type: TABLE DATA; Schema: public; Owner: raspace
--

COPY public.comment (id, "postId", "authorId", body, "createdAt", "likeCount") FROM stdin;
7eb75227-7767-46fd-bf79-a56da3ec1c0d	c3bafcc7-646c-4ea0-9583-3aae312cc39d	9664807e-ac7e-48c3-b5cb-c201a8cd73b0	yes	2024-08-21 10:57:32.898+05:45	0
8582ccdc-5043-448f-8414-e344a522482d	c3bafcc7-646c-4ea0-9583-3aae312cc39d	9664807e-ac7e-48c3-b5cb-c201a8cd73b0	then every minute	2024-08-21 14:03:00.172+05:45	0
4b7c31cd-395f-4bd0-8f71-dc7a4df6dac0	c3bafcc7-646c-4ea0-9583-3aae312cc39d	1cbe8398-8bbd-4a87-b58b-88332aad780b	nice	2024-08-29 19:41:14.95+05:45	0
\.


--
-- Data for Name: commentLike; Type: TABLE DATA; Schema: public; Owner: raspace
--

COPY public."commentLike" ("likerId", "commentId") FROM stdin;
\.


--
-- Data for Name: haversineCache; Type: TABLE DATA; Schema: public; Owner: raspace
--

COPY public."haversineCache" (lat1, lon1, lat2, lon2, result) FROM stdin;
0.4827443597950279	85.3114211	0.47123889803846897	30	1
\.


--
-- Data for Name: notification; Type: TABLE DATA; Schema: public; Owner: raspace
--

COPY public.notification (id, "recipientId", "senderId", "postId", "commentId", type, "isRead", "createdAt") FROM stdin;
8a55bf21-cb47-47ad-a2b0-e360c654177a	9664807e-ac7e-48c3-b5cb-c201a8cd73b0	1cbe8398-8bbd-4a87-b58b-88332aad780b	c3bafcc7-646c-4ea0-9583-3aae312cc39d	\N	UserCommentsOnPost	t	2024-08-29 19:41:14.954+05:45
\.


--
-- Data for Name: operatingHour; Type: TABLE DATA; Schema: public; Owner: raspace
--

COPY public."operatingHour" (id, "openingTime", "closingTime", day, "placeId") FROM stdin;
26	\N	\N	Monday	0d063452-f834-48d4-b926-fc5283e86452
27	09:00:00	18:00:00	Thursday	0d063452-f834-48d4-b926-fc5283e86452
28	10:00:00	20:00:00	Friday	0d063452-f834-48d4-b926-fc5283e86452
\.


--
-- Data for Name: ownershipRequest; Type: TABLE DATA; Schema: public; Owner: raspace
--

COPY public."ownershipRequest" (id, "requestedBy", "placeId", "ownershipGranted", "documentImageUrl", "requestedDate") FROM stdin;
6fb9c841-2dec-497e-8277-1094140c62cb	9664807e-ac7e-48c3-b5cb-c201a8cd73b0	a4aeb41a-a51d-4630-98b6-4f646d87c555	t	https://res.cloudinary.com/dqiqiczlk/image/upload/v1723282322/bquqcfxgakormwzzpzjy.png	2024-08-10 15:17:02.583+05:45
6a79222d-e8f4-4dd4-83e8-2dd0938003d0	9664807e-ac7e-48c3-b5cb-c201a8cd73b0	f6f90257-bffb-4b0c-96a5-6b77875704f9	t	https://res.cloudinary.com/dqiqiczlk/image/upload/v1723297957/dougtf0oay0ao4umavvz.png	2024-08-10 19:37:37.698+05:45
9d7c5e83-cb1a-4390-9aaa-12027df19451	43b3d77e-44e5-4395-a2cd-9d64f48d7262	0d063452-f834-48d4-b926-fc5283e86452	t	https://res.cloudinary.com/dqiqiczlk/image/upload/v1727941801/z3bmtk7en8mgx3lqhr2x.jpg	2024-10-03 13:35:01.234+05:45
\.


--
-- Data for Name: place; Type: TABLE DATA; Schema: public; Owner: raspace
--

COPY public.place (id, "osmId", name, lat, lon, "openingTime", "closingTime", "placeFeatures", "coverImgUrl", "foodsOffered", "ownedBy", "createdAt", road, neighbourhood, city, state) FROM stdin;
f0257f12-87e6-4218-914b-33862fc50e7f	669259323	KFC Branch Thapathali	27.691989600000003	85.3166288	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.688+05:45	Tripureshwar Marg	Tripureshwar	Kathmandu	Bagmati Province
fb405511-c05f-42a6-98d4-7799ec8f139c	669269004	Cafe U	27.682649700000002	85.3062865	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.688+05:45	सिकाली मार्ग	Dhobighat	Lalitpur	Bagmati Province
6a400e6f-78d2-464b-9c48-f7ce07d55b2d	4499960405	Crown Plaza Himalayas	28.206793	83.96365180000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.815+05:45	6th Street,Peaceful Road	Baidam	Pokhara	Gandaki Province
83396dbe-c83b-41e1-93af-e296b7657ff5	4513618393	Canteen of Neuro hospital	27.748469	85.34619260000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.816+05:45	Golfutar West Road	Golphutar	Kathmandu	Bagmati Province
a9f4f8da-b0b7-46cc-88b7-7059b3a6cda0	669530117	Vesper Cafe	27.6761258	85.31354440000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.688+05:45	सीताकवो मार्ग	Pulchowk	Lalitpur	Bagmati Province
59f13d0c-6431-4c35-8ea0-1fa8175b4de2	10011697892	Bibek Chowmein House	27.746434500000003	85.32577300000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.082+05:45	Bhandari Street	Tokha	Kathmandu	Bagmati Province
0d063452-f834-48d4-b926-fc5283e86452	669249210	DanRan Japanese Restaurant	27.676206200000003	85.31337330000001	\N	\N	\N	\N	\N	43b3d77e-44e5-4395-a2cd-9d64f48d7262	2024-08-06 16:06:30.687+05:45	सीताकवो मार्ग	Pulchowk	Lalitpur	Bagmati Province
a9538123-ff6f-4b25-b81e-229a9ef6b692	10011697901	Shrijana Special Chiya Pasal	27.7464696	85.3261832	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.082+05:45	Bhandari Street	Tokha	Kathmandu	Bagmati Province
722bce9c-30c0-427b-9245-8512a52777fa	4478346289	nepali	27.673492500000002	85.27982850000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.815+05:45	Town Planning Road	Hanuman Ghat	Kathmandu	Bagmati Province
7cb2b89e-fdd6-49ce-802c-b9704f83188d	5298738717	Aozora	28.2133274	83.96028410000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.853+05:45	Baidam Road	Baidam	Pokhara	Gandaki Province
259ff949-350f-4cc5-ab97-4d2200183f5c	5298738718	Lake Way Momo Center	28.2141121	83.9571245	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.853+05:45	Camping Chok Road	Baidam	Pokhara	Gandaki Province
9947b54f-72ec-4843-bdb4-e294b8f5d6ea	10701333067	Ninja	27.6887906	85.3282544	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.138+05:45	Rudramati Marg	Thapa Gaun	Kathmandu	Bagmati Province
5b80fe85-5409-4106-bab2-0afadba6d0e8	10718269805	Eco Love Restro	28.2276905	83.9635494	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.139+05:45	Parsyang Ratamata Road	Methlang	Pokhara	Gandaki Province
6ad1a9b1-ce31-4387-a44d-56c201445f27	9655511106	Gorkha Strong	27.682309	85.27305820000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.955+05:45	Kirtipur Ring Road	Khahsi bazar	Kathmandu	Bagmati Province
aa48f8f3-9837-4e7d-9d2d-1543a2d63104	2090620860	Tukche Thakali Kitchen	27.718030700000003	85.32108190000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.726+05:45	Uttar Dhoka Road	Kholagaal	Kathmandu	Bagmati Province
3d04c470-a6a3-4de0-94bd-5dc39adcd9d9	2090623548	Durbar Cafe and Fast Food	27.717988100000003	85.32172750000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.726+05:45	Kailashchaur Marga	Dhobi chaur	Kathmandu	Bagmati Province
e20e2bd0-0945-4167-8c61-b7aa65ec38ee	10012633389	Burger king and crunchy fried chicken	27.759519800000003	85.3285877	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.087+05:45	NH40	\N	Kathmandu	Bagmati Province
d817fa87-c9b3-4391-b7d5-e45a35dca523	9942584723	Yala Choila Pasa	27.6754949	85.3210318	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.05+05:45	Chha Baha Jagmadu Pukhu Marg	\N	Lalitpur	Bagmati Province
53711877-0d5e-42b4-b13e-539910023df3	9942585122	Patan Lassi Station and Tea Coffee	27.6774369	85.32139860000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.051+05:45	Pyangathan Jagmadu Pukhu Marg	\N	Lalitpur	Bagmati Province
a0037a6c-0741-420f-ad8e-734f133c8b3a	10012977816	Okhaldhunga Khaja Nasta MoMo Center	27.7475799	85.3308214	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.087+05:45	Sangam Marg	Tokha	Kathmandu	Bagmati Province
fe000b71-f05f-4297-a071-289cda3330a8	1350468459	Museum Cafe	27.673320500000003	85.32556100000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.694+05:45	Patan Durbar Square	Mangal Bazar	Lalitpur	Bagmati Province
e34119f4-6edb-445e-a3af-58dbc7e9d273	9933907125	Meraki	27.720224100000003	85.35953810000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.05+05:45	Chabhil-Baudha-Jorpati Sadak	Tusal	Kathmandu	Bagmati Province
4e6a04bc-bb61-4026-89a2-8dbea8e6f279	9942142818	Yala Vyanjan Restaurant	27.6733669	85.3265085	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.05+05:45	chyasal to patan durbar square	Tulsi Pho: Nani	Lalitpur	Bagmati Province
4fa94dda-f2a7-4976-9b40-83886899f3fb	9942157117	Cafe Samaya Baji	27.673519900000002	85.3263386	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.05+05:45	chyasal to patan durbar square	Tulsi Pho: Nani	Lalitpur	Bagmati Province
1f6fedb4-dcfa-4a8c-9b15-ddf1c6164453	9942197918	the home de patan	27.672980600000002	85.3275302	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.05+05:45	Khapinchhen Road	Khapinche temple area	Lalitpur	Bagmati Province
f051a61d-4ef4-4e16-bb20-677509951fc5	4791332627	Tamuhita Restaurant Barbecue Korea	28.2115797	83.9576669	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.827+05:45	Street 16t (Samikopatan)	Baidam	Pokhara	Gandaki Province
26bc8808-cd01-4423-beec-68fdd7ed654e	9942584919	De Karma Cafe	27.6737982	85.3242457	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.051+05:45	Mha Maru Galli	Mangal Bazar	Lalitpur	Bagmati Province
c3700048-913d-43bf-80d9-0a8b7acad520	9942585120	Sechuwan Delights	27.677317900000002	85.32172410000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.051+05:45	Nakabahil Road	Jhātāpol	Lalitpur	Bagmati Province
cfa90d7c-f46f-4711-865c-7057ceb6a2b2	4791341093	Korean Restaurant Cafe and Bar	28.212446200000002	83.9555916	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.827+05:45	Devisthan Marg	Baidam	Pokhara	Gandaki Province
e1ebd840-8deb-4024-bdc3-7a6116f75c6f	5470609417	Ashis kja Gar	28.146585	84.0686335	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.864+05:45	Prithvi Highway	Bhandardik	Pokhara	Gandaki Province
30036913-f22a-4705-9414-ba699d9deeaa	10121397637	Aaroma Fast Food Hub	27.6830861	85.3439132	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.118+05:45	Subidha Marg	Basuki Nagar	Kathmandu	Bagmati Province
119c98f4-f670-4562-b702-bccfe100a538	568514900	Hungry Eye	28.207985400000002	83.9575283	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.684+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
0e8bd940-12c1-4e61-a664-3a09d6576544	568542788	Elegant View	28.210507500000002	83.9566693	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.685+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
a7ae71e9-782d-40b8-afbe-bab1e949bc48	1352860978	Pokhara Steak House	28.2141422	83.95762380000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.694+05:45	Camping Chok Road	Baidam	Pokhara	Gandaki Province
c30e96df-8b27-48f8-94c4-e01ac42395b4	5588197679	3 View star Restaurant	28.194140700000002	83.94743310000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.881+05:45	Siddhartha Highway	\N	Pokhara	Gandaki Province
792a6e4c-25e4-4e32-9f47-8e32514b5b65	1366695536	Ever Green	28.1653194	84.091336	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.694+05:45	F162	Sundarindanda	Pokhara	Gandaki Province
3723c2c7-f6cf-45c4-b83b-62e3bfd04b6b	10121417272	EveryDay Food Cafe	27.6854519	85.34587420000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.121+05:45	Munibhairab Marg	Basuki Nagar	Kathmandu	Bagmati Province
f71fa50d-888f-478c-9b1d-40c2a213b957	10121424465	Aaha Lumbini Cafe	27.680901900000002	85.3399198	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.122+05:45	Sahayogi Nagar Marg	Thulodhara	Kathmandu	Bagmati Province
90246bcd-0007-4cff-81b4-77e1fef2776d	10121424470	Bindebasini Cafe	27.6808388	85.33973370000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.122+05:45	Sahayogi Nagar Marg	Thulodhara	Kathmandu	Bagmati Province
f22aec21-c709-406d-aa1d-39fbc3f69669	10104876563	Kavre Bhojanalaya And Coffee Shop	27.6743388	85.38896550000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.114+05:45	Araniko Highway	\N	Bhaktapur	Bagmati Province
da590f97-5394-4359-ae74-677da134930f	4388734393	Hankook Sarang Korean Restaurant	27.7139755	85.31003150000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.811+05:45	J.P. School Road	Paknajol	Kathmandu	Bagmati Province
e75b6097-9c29-42f7-9f21-3c26ee572d75	4800927851	Yoko Manudu Restro and Bar	28.217187300000003	83.95873160000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.829+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
99b71ecb-ddf2-4ce6-8407-26fdd310037c	2007775803	MADZ Multicuisine Restaurant and Bar	27.719150900000002	85.328624	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.718+05:45	Shantiniketan Marg	Bhrikuti Tole	Kathmandu	Bagmati Province
faebe46e-e8f7-4966-86a8-c685e5b36656	8696860173	Hankook Sarang Korean Resturant With Garden	27.71441	85.30992810000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.919+05:45	J.P. School Road	Paknajol	Kathmandu	Bagmati Province
ef6a6f08-d967-4f88-9531-b2efc4ba3b3a	8696860180	Hotel Road House	27.714501700000003	85.31016620000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.919+05:45	J.P. School Road	Paknajol	Kathmandu	Bagmati Province
849a17de-7c84-4bf4-8a8d-06fb8c3ba5b4	2090735354	BNR Coffee Shop and Cold Store	27.716515700000002	85.33300910000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.726+05:45	Kotal Marg	Kotal Tol 	Kathmandu	Bagmati Province
a197fce6-34d6-4b70-a0de-555a89160501	2127657061	Neighborhood Cafe and Grill	27.7346676	85.34218820000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.729+05:45	Banshidhar Marg	Laligurans Chok	Kathmandu	Bagmati Province
edb1692d-fb9d-44a2-8d65-880b1dc4c1e6	10011854437	UR cafe	27.7545973	85.31800960000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.084+05:45	F81	Baluwapati Chowk	Kathmandu	Bagmati Province
698aa1b6-9156-41e4-abc7-269b68039a9b	8696860183	Yin Yang Restaurant	27.7145668	85.3103373	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.919+05:45	J.P. School Road	Paknajol	Kathmandu	Bagmati Province
451025bb-2435-4209-b787-2ba32f59e733	9708720317	Chapate Panipuri Shop	27.680164400000002	85.27959270000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.965+05:45	Way To Naya Bazaar	Chi-ba-hah	Kathmandu	Bagmati Province
8983f6ca-bcf6-4cc2-894f-9eb93cbbf851	9527316359	Zen Bistro And Cafe	27.7437755	85.3404991	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.94+05:45	Bansbari Sadak	Narayan Gopal Chowk	Kathmandu	Bagmati Province
77aed218-94e1-4357-954c-477e237db629	5094137121	Loving heart	27.720276300000002	85.3595808	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.839+05:45	Boudha Main Road	Maiju Bahal	Kathmandu	Bagmati Province
eff9284f-aa62-457d-bb61-5878d3f59586	4264062071	Norlahi Momo	27.7257983	85.35012850000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.806+05:45	F83	Ananda Nagar	Kathmandu	Bagmati Province
b9112120-9f05-47c8-a6ba-d8691b563ed3	8696860184	Thamel Villa Hotel And Jatra Cafe And Bar	27.7138007	85.3102607	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.919+05:45	J.P. School Road	Paknajol	Kathmandu	Bagmati Province
b999d8e0-70fd-4ee6-bc9d-82ca8cd68aaa	8696860189	Inspired Tribe Kitchen	27.714064500000003	85.3102552	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.92+05:45	J.P. School Road	Paknajol	Kathmandu	Bagmati Province
398067de-29d3-4a65-93dd-207087f6d65f	7688040709	Kafti restaurant	27.6744103	85.3617215	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.913+05:45	Arniko Raj Marga	sachet marga tole	Bhaktapur	Bagmati Province
e3198e01-24a9-45c0-9de1-d19e1b079a36	5603560003	Hotel	28.197676	83.9953816	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.883+05:45	Machhapuchre Marg	Phalepatan Chok	Pokhara	Gandaki Province
6acbaf2a-4eb9-4fd8-bec5-7aa4b34c477f	5603560014	Hotel Bandipure	28.1989179	83.9962101	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.883+05:45	Machhapuchre Marg	Phalepatan Chok	Pokhara	Gandaki Province
92b11794-69ae-430f-a6e8-5181d1ecc26a	1353127718	Cyber Cafe	28.2291038	83.989866	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.694+05:45	Dharmasthali Buddha Bihar Marga	\N	Pokhara	Gandaki Province
74975706-c7a6-48dd-aea3-c613060c7fe3	1366436403	Sun Welcome Restaurant	28.2188905	83.9587102	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.694+05:45	40DR012	\N	Pokhara	Gandaki Province
fc6945a6-b3d1-4208-8a29-51f6c4a48925	5298738719	Kathmandu Momo Center	28.214135700000003	83.95706820000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.853+05:45	Camping Chok Road	Baidam	Pokhara	Gandaki Province
a3037d44-d676-4fa5-adcd-7f7e5162a558	2133391518	Cafe nec	27.709704300000002	85.41508660000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.729+05:45	F95	\N	Bhaktapur	Bagmati Province
339b81f8-31b0-4962-a71a-0e059de910d3	1792706214	Wimpies	27.672633700000002	85.3142614	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.7+05:45	Yala Sadak	Dhobighat	Lalitpur	Bagmati Province
43acd272-c40b-4a14-8e9f-2d1d4b7ad57c	5603560321	Santosh Hotel	28.200239600000003	83.99585370000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.884+05:45	Machhapuchre Marg	Phalepatan Chok	Pokhara	Gandaki Province
fec7534e-f8b5-4632-b61c-c438b991d510	5603560327	Hotel	28.200386700000003	83.9962885	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.884+05:45	Machhapuchre Marg	Phalepatan Chok	Pokhara	Gandaki Province
b9224a28-2a46-4ccc-94d6-7afee91ac89a	5616497591	Baglung Nbina Hotel	28.219109000000003	83.9974918	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.884+05:45	Hospital Marg	Bhrikuti Tol	Pokhara	Gandaki Province
1652ba04-f383-402e-9a06-51cf60a7d76a	5537615880	Moondance Resturant and Bar	28.208094300000003	83.957598	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.875+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
3c66d3cb-4031-476b-83a1-7faee1241856	2128601996	D Entrance	27.682387100000003	85.3171757	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.729+05:45	Maitri Marg (Bakhundole)	Bakhundol	Lalitpur	Bagmati Province
182f23d6-ad43-4514-aa5a-df11e50b24ab	5581858142	Damside Mini Restaurant	28.170976000000003	84.0910386	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.881+05:45	Piple marga	\N	Pokhara	Gandaki Province
2489c141-1e1e-4f8e-8106-52463611a76d	2144299583	Tukche Cafe	27.7244731	85.33111360000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.729+05:45	Thirbam Sadak	Kirtan Chok	Kathmandu	Bagmati Province
aa5ad6a3-1807-417d-a0de-8791717d355b	2152851362	NEC Restaurant	27.708518700000003	85.41444200000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.73+05:45	F93	sarki tol	Bhaktapur	Bagmati Province
4ec7c249-590d-4f5c-8fe0-61a53636da2b	2152922729	Saroj Bhojanalaya	27.7079811	85.4141951	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.73+05:45	F93	sarki tol	Bhaktapur	Bagmati Province
7ff85499-000c-4d79-9e12-028ca6a9a57e	4158802891	Dupka Family Resturant	27.690442700000002	85.340698	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.797+05:45	Surya Bikram Marg	Suruchi Tol	Kathmandu	Bagmati Province
02b30599-506f-406e-b7f0-2b979e9b221e	5426666110	Zeon Cafe	28.2404468	83.98800820000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.858+05:45	Bhim Kali Patan	Taxi Chowk	Pokhara	Gandaki Province
27c224da-5ee2-4af9-a88d-71ea23d54909	5470406025	The Rising cafe	28.2071016	83.9606725	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.864+05:45	9th Street,Durbar Path	Baidam	Pokhara	Gandaki Province
55ff8a98-eccf-40b8-9b0e-408e337bf45a	4791341096	Red Sun Cafe	28.212354	83.9559212	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.828+05:45	Devisthan Marg	Baidam	Pokhara	Gandaki Province
0e3cdbf0-8d9c-4563-8009-086dbc134075	5581869660	Namaste Begnas resturant	28.1844019	84.0892898	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.881+05:45	urban road	Lamaswara	Pokhara	Gandaki Province
fdb007e1-e91a-4877-9b79-65461134fcda	5664104521	Wellness Organic Club	27.718415200000003	85.31903390000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.886+05:45	Uttar Dhoka Road	Kailash Chok	Kathmandu	Bagmati Province
b3190454-7f32-4bcd-8d0b-7a2aeb234e25	10017342619	King MOMO	27.7422988	85.3333108	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.105+05:45	Samanantar Marg	Narayan Gopal Chowk	Kathmandu	Bagmati Province
eb3b2b60-92d0-424e-a027-26dc7d6b1fd7	10147414070	Asbin Fast Food	27.681930700000002	85.3399614	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.129+05:45	Samparka Marg	Sahayogi Nagar	Kathmandu	Bagmati Province
61c399de-205d-4aab-8484-4a66e4243ae6	5469167411	Kutumba Girls Hostel	28.1468923	84.0838248	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.863+05:45	40DR025	Tagako Mukh Chok	Pokhara	Gandaki Province
5c9be39f-be7c-4979-94ce-64553d5c3597	10038480607	Tahara Cafe	27.739529100000002	85.31616000000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.109+05:45	Shanti Milan Marga	Tokha	Kathmandu	Bagmati Province
b499a46b-287d-4bed-8849-5ab6e609f414	9582478369	Quick bites cafe	27.6687556	85.28297950000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.949+05:45	Shahid Path	Itagol	Kathmandu	Bagmati Province
dc48bc84-1203-43c7-a6c3-e0a5899328d9	10121598993	Chindo Cafe	27.6803835	85.34205850000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.127+05:45	Dharmasthal Marg	Seti O.P.	Kathmandu	Bagmati Province
dbd2a307-f872-4cb9-b4db-317a9d5269e3	10121598994	Mahadevsthan Cafe	27.680435900000003	85.341971	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.127+05:45	Dharmasthal Marg	Seti O.P.	Kathmandu	Bagmati Province
93f4b146-f8c9-475c-ba5f-331728b5f7e5	10121599002	Raj Coffee Shop	27.6812043	85.3436868	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.127+05:45	Mahadevasthan Marg	Basuki Nagar	Kathmandu	Bagmati Province
716d5be4-8c0a-4150-a89f-71fd53bedaaa	4377572768	Siddhartha Sweets and Bakery	27.683243400000002	85.3477695	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.81+05:45	Subidha Marga	Sahayogi Nagar	Kathmandu	Bagmati Province
26f965fb-5618-4a34-905b-9ab049c40279	4384726350	Cherry on Top	27.7000706	85.3386464	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.81+05:45	Devkota Sadak	Pushpa Nagar	Kathmandu	Bagmati Province
907757ec-8818-4a8a-a06f-f6a3e627fcd8	1555308347	Rice Bowl Restaurant	28.2097982	83.95689010000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.698+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
ce39552d-a2dc-470c-9fe9-fbee9b8c5cf9	1555308358	Viewpoint	28.221546500000002	83.9523229	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.699+05:45	40DR012	\N	Pokhara	Gandaki Province
c1016b79-ac8e-473c-83d2-18eac1a84965	1555308333	Lemongrass Restaurant	28.2187489	83.95852670000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.698+05:45	40DR012	\N	Pokhara	Gandaki Province
2c5ed0e6-80fe-4c32-8bd6-313a30dc78a4	1787036666	coffee corner	27.6715757	85.3193698	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.7+05:45	Kumari Marga	Itapukhu	Lalitpur	Bagmati Province
fd608407-67b7-404b-a29d-4e5e0a9cc0e6	1891343755	Rupy Party Palace	27.732594700000003	85.34430730000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.702+05:45	Nawa Marg	Ananda Nagar	Kathmandu	Bagmati Province
cda05a1e-3bb3-4bf4-8cc1-2a2af008e4cb	1891446165	alishan	27.672942300000003	85.314002	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.702+05:45	Jawalakhel	Dhobighat	Lalitpur	Bagmati Province
e9de3cff-c8b0-472f-bdec-3ffa88fd1a5b	1891985126	The Bakery Cafe	27.7190407	85.33126100000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.702+05:45	Bishalnagar Marg	Dhalku Chowk	Kathmandu	Bagmati Province
608ea94f-21b9-4e37-8403-b39b026dc845	1892718840	Beijing Duck	27.690675900000002	85.3362894	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.702+05:45	Old Baneshwor Road	Bogati Tol	Kathmandu	Bagmati Province
f983d52c-212a-47d0-a44e-2de4808b801e	11359540677	Brewshala	27.6776687	85.31106530000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.147+05:45	Pulchowk Jhamsikhel Marga	Dhobighat	Lalitpur	Bagmati Province
8a9c3aa1-8854-45a8-b997-d623d6bb3132	1989508688	Radission Restaurant	27.6855055	85.34457640000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.715+05:45	Shri Ganesh Marg	Mahadevasthan	Kathmandu	Bagmati Province
d99797ca-46c0-476a-a364-1bc5fcb5dba3	1990673886	Chilly Cafe	27.6737341	85.37319090000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.715+05:45	Araniko Highway	Araniko Basti	Bhaktapur	Bagmati Province
efc6142e-548e-451d-9c2a-7f12d8d5261e	1990673919	Kavre Bhojanalaya	27.6736122	85.3755146	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.715+05:45	Araniko Highway	Araniko Basti	Bhaktapur	Bagmati Province
b9ba09ec-fecb-431e-87e5-7d1346174dc0	9899557697	Bachhu Dai ko Momo Pasal	27.6856307	85.3069758	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.046+05:45	Sanepa marg	Bakhundol	Lalitpur	Bagmati Province
ac49ff9f-d219-428b-90f0-cdd495267305	10121424551	Salyan Basanta Tandoori Dawa and Cafe	27.679617200000003	85.3468835	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.123+05:45	Himali Marg	Basuki Nagar	Kathmandu	Bagmati Province
aa6f3b72-57cc-441e-b36d-f83c20f1789b	9969484794	Dipika Bhojanayala And Resturant	27.703219800000003	85.321309	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.063+05:45	Adwait Marg	Baghbazar	Kathmandu	Bagmati Province
7a4051ea-9e45-4f6c-a0cb-bf7aa18264b6	11359655710	Salon de Kathmandu	27.721357800000003	85.32088750000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.148+05:45	Kumari Mai Marga	Kailash Chok	Kathmandu	Bagmati Province
31cbe097-8e08-4aba-8f58-e9bf6d801523	11361370950	Arabica Coffee	27.715496100000003	85.3130881	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.148+05:45	Amrit Marg	Lut Chok	Kathmandu	Bagmati Province
2f0da866-48d9-4664-b4e7-5cefb8dc1870	9610470238	Samay baji restaurant	27.6702635	85.2708272	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.949+05:45	Pushpalal Marg	San-la	Kathmandu	Bagmati Province
a7ca9c22-f300-4c05-84a9-7a379e4da14d	5509844258	Dream High Restaurant	28.2227922	83.98856020000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.872+05:45	Deurali Galli	Chipledhunga	Pokhara	Gandaki Province
5ecdac56-28b5-44ae-8899-5a244c52f264	9899585339	Cafe Mozart	27.6819011	85.3109421	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.046+05:45	Bakhundol	Arun Thapa Murti Chowk	Lalitpur	Bagmati Province
b8a06fbe-d2d8-4311-b42c-571fe20a1843	5522654034	Sungava MoMo Restaurant	28.189736600000003	83.99364290000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.874+05:45	Kantipur Marg	Phalepatan Chok	Pokhara	Gandaki Province
ac8284ee-b292-45ee-b790-2eb940db55c2	10013020921	AS laphing and panipuri	27.7377603	85.30935020000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.087+05:45	Kulanta Marga	Deepjyoti	Kathmandu	Bagmati Province
3cb70741-404d-429a-b562-69ad66e7a125	2034533037	Golden Dragon Chinese Restaurant	27.719864100000002	85.3311692	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.719+05:45	Thirbam Sadak	Dhalku Chowk	Kathmandu	Bagmati Province
d6033fb0-3e3c-43fd-9d20-26564a65bf25	2034664127	Khana Khazana Cafe	27.737840600000002	85.3400257	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.719+05:45	Kathmandu Ringroad	Ganesh Basti	Kathmandu	Bagmati Province
1d4927ee-606f-4a81-b4d0-50e8795d2f9c	2036056711	Bakery Cafe Pulchowk	27.6799685	85.315827	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.719+05:45	हरिहर भवन मार्ग	Pulchowk	Lalitpur	Bagmati Province
17dc68d9-439d-40a0-a7d5-bd92beab3db9	2077194590	Diyalo Foodland	27.7415087	85.3298156	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.722+05:45	Kathmandu Ringroad	Narayan Gopal Chowk	Kathmandu	Bagmati Province
e5c09c8f-e97a-41da-8ad6-59650f60de25	2077209026	The KABAB Center And Restaurent	27.741813500000003	85.33215410000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.723+05:45	Kathmandu Ringroad	Narayan Gopal Chowk	Kathmandu	Bagmati Province
72e1d5f8-10cd-414a-94f5-c51abfdcf45e	10601074706	Mitho Dal Bhat House	27.714316500000002	85.29474	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.136+05:45	Swayambhu Marg	Dallu	Kathmandu	Bagmati Province
16c5f0b3-90e1-4528-a3b4-739ca31973d2	11361373924	The sushi bar	27.7154832	85.313378	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.148+05:45	Amrit Marg	Lut Chok	Kathmandu	Bagmati Province
3a5d3fd4-f911-4b5b-a719-a69308583e5c	11363394046	Cafe Joshi	27.737417500000003	85.33446830000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.148+05:45	Maharajganj Sadak	Narayan Gopal Chowk	Kathmandu	Bagmati Province
69e65d3a-5617-41a9-a761-1753d7adf63d	11363642470	Holiday Cafe	27.730786000000002	85.32993850000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.148+05:45	Thirbam Sadak	Kiran Chok	Kathmandu	Bagmati Province
e5b66e17-a5a0-4453-b71e-e83c32431e78	2684770259	Manavog Cafe	27.6719459	85.3121674	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.741+05:45	Jawalakhel Yekantakuna Sadak	Dhobighat	Lalitpur	Bagmati Province
df37af7a-2ef4-4ac4-9e78-f4ffa20852e5	2684773539	Om Laxmi Tanduri Bhojanalaya	27.67257	85.31219730000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.741+05:45	Jawalakhel Yekantakuna Sadak	Dhobighat	Lalitpur	Bagmati Province
cc332f4f-f3c4-4049-9ffa-e2cf399ee96c	2684776545	Sekuwa And Tass House With Resturant	27.6718003	85.31224800000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.741+05:45	Jawalakhel Yekantakuna Sadak	Dhobighat	Lalitpur	Bagmati Province
e42cc008-7d09-49e1-8485-e9eb23ba5434	2684818080	Common Cafe Sekuwa Corner	27.6671784	85.3163129	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.742+05:45	Thasikhel Siddibinayak Marga	Kumaripati	Lalitpur	Bagmati Province
fb557a02-2815-4f6c-8b0f-aaf5cc325898	1891535244	Momo Box	27.684297400000002	85.318483	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.702+05:45	Kupondole Marg	Kupondole	Lalitpur	Bagmati Province
3f9d85d4-6530-4e95-8e2f-e75172f42d06	1892815653	8 degrees	27.676310100000002	85.3129267	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.703+05:45	Damkal-Chakrapath Marg	Dhobighat	Lalitpur	Bagmati Province
016e4c94-d0f6-439c-a8dd-5e3d7377c6bf	1898414114	Old House Cafe	27.7138792	85.32491370000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.703+05:45	Bhagwati marg	Kamalpokhari	Kathmandu	Bagmati Province
a03f3eff-cd21-4193-9487-d465e175cece	1898436170	Ktm Espresso Restaurant	27.714331100000003	85.3249229	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.704+05:45	Nag Pokhari Sadak	Kamalpokhari	Kathmandu	Bagmati Province
70712cd6-231c-4490-9cb3-deb0c0c504a2	1898521000	Amigo Fresh Mexican Grill	27.714789600000003	85.3271809	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.704+05:45	Sama Marg	Kamalpokhari	Kathmandu	Bagmati Province
4e1122e3-18ff-471e-ba1f-e62b459590a0	2684818086	The Red Devils Restaurent and Bar	27.6672459	85.3162664	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.742+05:45	Thasikhel Siddibinayak Marga	Kumaripati	Lalitpur	Bagmati Province
c1ef7d64-affe-4b53-bde2-9d483712b58b	9956505900	Bhok Lagyo Mad about Food	27.7020693	85.31931870000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.055+05:45	Exhibition Road	Baghbazar	Kathmandu	Bagmati Province
d6227923-7258-49a1-bc19-d827bc1384ef	3266705819	Burger Lounge	27.672302700000003	85.2800813	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.757+05:45	Town Planning Road	Bhajangal	Kathmandu	Bagmati Province
843feb7a-2272-417f-8001-51341cd5c936	2122394955	Peace Zone Cafe	27.6937402	85.2824554	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.728+05:45	Kalanki	Kalanki	Kathmandu	Bagmati Province
79c4de72-394b-4498-86f2-1dc02aa759f2	5102457364	Dolphine Resturant	28.206550600000003	83.99389160000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.84+05:45	Prithvi Highway	Buddha Chok	Pokhara	Gandaki Province
d277aa4b-3ab1-4832-bc06-84bc6fd4c8ca	9956505902	Ghanshyam Daii ko Khaja	27.7020619	85.3193775	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.055+05:45	Exhibition Road	Baghbazar	Kathmandu	Bagmati Province
b1f94c7b-9e04-45cb-8d1a-9c39ce3be14f	4204112095	Taplejung Tongba House	27.701180500000003	85.3296045	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.803+05:45	Pathivara Marg	Ghattekulo	Kathmandu	Bagmati Province
3c23d9f0-5d5e-491b-a71a-46c9d4e9d161	4551845190	Dream In The Pool	28.2138728	83.95778320000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.818+05:45	Lakeside Road	Baidam	Pokhara	Gandaki Province
7dcaedd2-5799-4470-82da-5b96b68ed853	4553443416	Lunch Hour	27.671589	85.32019820000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.818+05:45	Kumari Marga	Itapukhu	Lalitpur	Bagmati Province
bf6e836c-b238-4f08-b632-93a3b0036ea8	4559864590	Rickshaw Cafe and Juice Bar	27.7138852	85.31034070000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.818+05:45	J.P. School Road	Paknajol	Kathmandu	Bagmati Province
2c51263c-4bd8-4a91-95bf-c216703b4bbd	5457975860	Tiwari Restaurant and Lodge	28.1895823	83.9586065	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.861+05:45	Siddhartha Highway	Belghari	Pokhara	Gandaki Province
94cf0c38-e175-4730-b1d9-49f2a19274d7	11373235172	Namanta kitchen	27.720455	85.3196977	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.149+05:45	Kumari Mai Marg	Lazimpat	Kathmandu	Bagmati Province
8d970da1-f073-47e6-b683-fb94ee8c8b48	6984580886	Roadhouse Cafe	27.7144428	85.3103073	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.91+05:45	J.P. School Road	Paknajol	Kathmandu	Bagmati Province
006c9757-6bc5-4e13-aa0c-44ad772916ed	3428158794	Mezze by Roadhouse	27.7128231	85.3175004	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.772+05:45	Darbar Marg	Kamalpokhari	Kathmandu	Bagmati Province
11657307-45b7-444c-960a-c0f6ac3cf438	3289870205	Samsara Restaurant	27.712450500000003	85.30926430000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.758+05:45	Kunphen Marg	Paknajol	Kathmandu	Bagmati Province
17a36f81-7ec2-438b-943d-4589774919b5	9969484656	The Burger House And Crunchy Fried Chicken	27.705735200000003	85.3188138	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.062+05:45	Baghbazar Sadak	Baghbazar	Kathmandu	Bagmati Province
2958116c-8e9e-433e-869d-19a3cc62629b	6936316985	China Lanzhou Lamian	27.7122694	85.3121661	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.906+05:45	Jyatha Marg	Lut Chok	Kathmandu	Bagmati Province
104e1730-8c53-4e46-a825-96a5aa41d518	6942571196	The Best Kathmandu Kitchen	27.715241600000002	85.31151	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.906+05:45	Thamel Marg	Lut Chok	Kathmandu	Bagmati Province
030bcf3d-67da-48c1-b2de-52cfcd12831b	6959698848	Coffee Cloud Cafe	27.7061415	85.33371000000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.908+05:45	Maiti Devi marg	Gyaneshwar	Kathmandu	Bagmati Province
a3990a13-cf7a-4866-ae7b-04c591a4853b	4791497363	Full Power Resturant	28.2107762	83.9557386	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.828+05:45	Fewa Walkway	Baidam	Pokhara	Gandaki Province
2eaf7d57-4f07-4871-9ade-e84e113fa301	3266672113	Broz Garden Restaurent	27.6739755	85.27993550000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.757+05:45	Panga Road	Nayabazar	Kathmandu	Bagmati Province
570d2206-1a20-4760-a3c3-e11f1f55633d	4292019390	Tristar	28.2081957	83.9575037	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.807+05:45	Baidam Road	Baidam	Pokhara	Gandaki Province
224e196f-90be-4894-8f91-e5f7c3566469	3328301769	New Show Palace Restaurant	27.709748100000002	85.32750460000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.759+05:45	Pashupati Sadak	Kamalpokhari	Kathmandu	Bagmati Province
24c71c2d-38b1-4393-becd-a00d2825dafc	9969217022	The Fast Food Resturant And Momo Shop	27.6741661	85.3599985	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.061+05:45	Tikathali-Lokanthali Road	Madhyapur Thimi	Bhaktapur	Bagmati Province
09d07e3b-0404-4486-b75c-9afb95cff599	10024851021	Chaswaa Jhol Momo	27.6829864	85.3442141	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.106+05:45	Subidha Marg	Basuki Nagar	Kathmandu	Bagmati Province
424a174b-155f-4793-bb15-0da0c4a32cb0	3702834113	Smile Cafe	28.2230926	83.9912982	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.785+05:45	Naya Bazar	Chipledhunga	Pokhara	Gandaki Province
c923cacf-4ee7-4cc5-a74e-e2494fa73440	3702839511	Muktinath Thakali Kitchen	28.2108586	83.9863761	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.785+05:45	Naya Bazar	Chipledhunga	Pokhara	Gandaki Province
ac188703-f528-48f2-a1f3-2a2404a21dd0	1894392422	Eatempus	27.693548500000002	85.3277393	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.703+05:45	Tanka Prasad Ghumti Sadak	Ghattekulo	Kathmandu	Bagmati Province
6a9f1ced-4fb8-4f7d-aab4-184763e3287b	1894359635	Newari Kitchen	27.690837600000002	85.3173072	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.703+05:45	Tripureshwar Marg	Thapathali	Kathmandu	Bagmati Province
0f3d6664-fe8c-4aa3-bade-193af53c46c4	3637654255	Madhushala	28.2114413	83.9569585	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.783+05:45	Lakeside Road	Baidam	Pokhara	Gandaki Province
fa59e95c-5976-4c31-99ac-976759092edd	1904346816	The Side Walk Cafe	27.673679300000003	85.3244212	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.705+05:45	Mha Maru Galli	Mangal Bazar	Lalitpur	Bagmati Province
6cb7a0ae-a820-4939-936f-a694d9424f2f	1905155334	Belly Busters Restaurant	27.739339	85.3390931	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.705+05:45	Milijuli Marg	Narayan Gopal Chowk	Kathmandu	Bagmati Province
3f4a93d3-4eec-4305-9d8d-c6104adbd9e7	1905155372	Ruby Sweets	27.7405252	85.3365727	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.706+05:45	Kathmandu Ringroad	Narayan Gopal Chowk	Kathmandu	Bagmati Province
f6f90257-bffb-4b0c-96a5-6b77875704f9	1905155380	Thakali Chulo Restaurant	27.739471700000003	85.33879320000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.706+05:45	Milijuli Marg	Narayan Gopal Chowk	Kathmandu	Bagmati Province
020a43a1-8455-4aee-966a-ca0a7b81d1bb	4293342628	Family Cafe	27.7268611	85.31417470000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.807+05:45	Samakhusi Marg	Lut Chok	Kathmandu	Bagmati Province
15dbeb65-9818-4cd5-81ac-80a40935cb5f	1904243455	kwalkhu cafe	27.674520700000002	85.32455900000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.705+05:45	Bagalamukhi Marg	Jhātāpol	Lalitpur	Bagmati Province
ca7eb747-f66e-44ea-8613-7cdeced455b2	4293343214	Red pepper cafe	27.717471300000003	85.32736170000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.807+05:45	Gairidhara Road	Bhrikuti Tole	Kathmandu	Bagmati Province
65d6bcd2-9821-4e22-a5fa-aa7a2d9dd571	4294385095	Crazy burger	27.7158434	85.31050570000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.807+05:45	Chaksibari Marg	Lut Chok	Kathmandu	Bagmati Province
b69e10f9-7de9-4d2c-abd9-d6064d967ef0	4329284695	Mellow Mug	27.6809659	85.32043370000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.808+05:45	Yella Dhwakha Marg	Kupondole	Lalitpur	Bagmati Province
9c71b4d6-fb4d-4ff1-8227-7bef9138ae1a	3359111280	Kwality Fast Food Cafe	27.6911886	85.3273446	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.763+05:45	Daphe Marg	\N	Kathmandu	Bagmati Province
7d894099-8a7b-41db-b0b0-633b2c0fad7a	4573477556	Vintage Food Factory	27.706601900000003	85.3230599	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.818+05:45	Putali Sadak	Dillibazar	Kathmandu	Bagmati Province
5428e968-2865-4576-a05a-f661944528a6	4580884892	Gurkha Restaurant	28.2140965	83.9572363	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.818+05:45	Camping Chok Road	Baidam	Pokhara	Gandaki Province
fb181d95-87a2-47cc-bc72-357d07dbcd10	4329295892	Chiya Pasal	27.673291600000002	85.32478730000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.808+05:45	Patan Durbar Square	Mangal Bazar	Lalitpur	Bagmati Province
ca649dde-2981-4743-8b92-1acf7d5bca79	9969484837	Club Katti Roll And Burger	27.703274	85.3195338	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.063+05:45	Adwait Marg	Baghbazar	Kathmandu	Bagmati Province
ba924740-5085-4487-84cd-b7d0caae92b2	9969484847	Super Lumbini Tandoori Resturant And Lodge	27.703300700000003	85.3193641	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.063+05:45	Adwait Marg	Baghbazar	Kathmandu	Bagmati Province
a2c3a384-d3d0-4feb-9fa5-8b3919fe6fe5	4934513527	Le Lapin Blanc	28.221774200000002	83.9546811	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.834+05:45	40DR012	\N	Pokhara	Gandaki Province
142ded0e-2e04-447e-8918-fe2ce52da0ed	11070539005	Galley 1	27.676389200000003	85.3196721	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.144+05:45	Chha Baha Jagmadu Pukhu Marg	\N	Lalitpur	Bagmati Province
f484a280-d2a4-4675-9e2e-b24510b6284b	11073546596	RK Restaurant	27.671395	85.43917180000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.144+05:45	chyamasingh	\N	Bhaktapur	Bagmati Province
b04bf428-6909-4ec3-a1a1-935448e18118	1280030125	Sanu lake Restaurant	28.173255400000002	84.09367970000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.692+05:45	Piple marga	\N	Pokhara	Gandaki Province
93c1dece-d36c-4dec-ade8-74f1678d4788	10016135257	Friends Of Cafe	27.761246500000002	85.3181406	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.098+05:45	NH38	\N	Kathmandu	Bagmati Province
cf312598-f87f-49c3-aa9a-fe54c0cbafef	1927427331	The Free Zone Cafe and Food Land	27.677936900000002	85.34756030000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.709+05:45	Shri Shanta Marg	Basuki Nagar	Kathmandu	Bagmati Province
a84352de-7d7d-490f-b1b0-7c459412c865	1927559639	Classic Food Home	27.670708800000003	85.33843590000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.709+05:45	Kathmandu Ringroad	Tikhidol	Lalitpur	Bagmati Province
524e6d93-1e80-4b5a-95cf-c339f3d26b08	10016366562	marja resturant	27.745174600000002	85.31896110000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.1+05:45	F81	Baniyatar	Kathmandu	Bagmati Province
622aac24-1b71-48bf-9e56-7c0166452086	10016371514	Dhading resturant and tandooori	27.7461862	85.31680510000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.1+05:45	Sayapatrinagar	Baniyatar	Kathmandu	Bagmati Province
d5ddd757-b6dc-495e-9e12-6ac4712339f6	10010867929	The Royal Blue House Cafe	27.7397142	85.3211596	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.081+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
5c9e5fbf-a284-4dd3-9112-aa8fae3e8c0b	10011697915	3 Star Coffee and Crunch	27.7463759	85.3270258	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.082+05:45	Bhandari Street	Tokha	Kathmandu	Bagmati Province
aa18a6ae-a791-4924-a867-d799e419ffbe	10011751906	A One MoMo Center	27.7364816	85.3110352	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.082+05:45	Buddha Marga	Deepjyoti	Kathmandu	Bagmati Province
44e22f73-2553-4c2d-b5fc-c3ba17c3341f	10024851083	Roadside Cafe	27.685862500000002	85.34474060000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.106+05:45	Shri Ganesh Marg	Mahadevasthan	Kathmandu	Bagmati Province
f2a915b9-d0ce-4395-86bc-7f211a34c50b	11072483405	Organic	27.720492200000002	85.3209183	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.144+05:45	Kumari Mai Marga	Kailash Chok	Kathmandu	Bagmati Province
6b614adb-4197-4ccb-a321-78e55eef616d	10015764451	The Blur Sky Cafe	27.7495538	85.3159114	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.098+05:45	Srijansheel Marga	Baniyatar	Kathmandu	Bagmati Province
a517ae27-aaef-4857-8888-f2dc6f451656	10016058608	evergreen fastfood and resturant	27.7512295	85.3257318	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.098+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
fd68e9cc-64dd-42ad-98b2-2c5a8cdbbd35	4295592032	Family Restaurant	27.682842	85.38591620000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.807+05:45	F86	\N	Bhaktapur	Bagmati Province
0b0fdfbf-041d-4eb2-8707-44852d047d3b	4296155923	Thakali Restaurant	28.2116796	83.98035	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.807+05:45	Phewa Marg	\N	Pokhara	Gandaki Province
c753a3ac-e792-4463-aeeb-23fbadeb086a	4311685089	New Family Hotel	28.2116343	83.95787370000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.808+05:45	Street 16t (Samikopatan)	Baidam	Pokhara	Gandaki Province
67440161-1fdb-46c2-a4db-89a8a6a40f9e	1937659965	Hungry Treat home	27.671430800000003	85.3162181	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.71+05:45	Man bhawan Marga	Pulchowk	Lalitpur	Bagmati Province
2a88aada-b7be-44c6-861d-0c5a8afaff5f	6869638487	Tibetan and Nepali Kitchen	27.7147876	85.31020930000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.904+05:45	Center Mart Galli	Paknajol	Kathmandu	Bagmati Province
7727fc9f-2fab-4599-bd98-fa99d2fe296e	1937673105	ItalCaffe	27.669854	85.3163179	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.711+05:45	Man bhawan Marga	Pulchowk	Lalitpur	Bagmati Province
ffb3ad18-a854-40c2-9c2c-e906bd01c499	9626257242	Upendra tea shop	27.667981400000002	85.2756282	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.951+05:45	Panga Road	Da-thal	Kathmandu	Bagmati Province
88512417-485b-4ace-9d25-e3e325a30c48	1937659964	Food Universe Cafe	27.6716109	85.3161255	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.71+05:45	Man bhawan Marga	Pulchowk	Lalitpur	Bagmati Province
36c79966-9ae8-401c-b16e-7013d043e22f	4264064695	First Kitchen	27.7416215	85.3311221	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.806+05:45	Kathmandu Ringroad	Narayan Gopal Chowk	Kathmandu	Bagmati Province
c6a68d79-bd1e-4bcc-bbe8-ad3e36dca05d	4264065732	dibeshwory party palace	27.6745592	85.3591871	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.806+05:45	Araniko Highway	Madhyapur Thimi	Bhaktapur	Bagmati Province
a2ed6fe2-449c-4496-b4fd-a06eab6c3fd5	2166417292	Rice and Bowl Restaurant	27.6940995	85.3125904	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.731+05:45	Tripureshwar Marg	Tripureshwar	Kathmandu	Bagmati Province
2a5dcb85-fa87-425b-8013-bd6658a60733	4437847089	Teafresho Tea Lounge	27.7116015	85.3126146	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.814+05:45	Bharma Kuamri Margh	Kamalachi	Kathmandu	Bagmati Province
8b233e4d-0aec-4273-b0ce-e6ca0a2f8636	4210701043	Chilly Restro and Bar	28.214762500000003	83.9579971	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.804+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
75d2c14b-afd6-40ba-a21b-851404480683	4178127536	New Dang Valley Resturant and Bar	28.222291000000002	83.9782454	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.799+05:45	Pokhara Baglung Highway	Dharapani	Pokhara	Gandaki Province
8147fd13-3c28-4419-b844-fbd7569f99a4	4523157392	Wendy Juice Shop	28.2103542	83.9579131	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.816+05:45	Street 15 (Pahari Marg)	Baidam	Pokhara	Gandaki Province
500b26a9-9900-4602-9887-6473089515ea	10121412572	Aadangbey Sekuwa Corner	27.6778738	85.34692120000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.119+05:45	Saraswati Mata Marg	Seti O.P.	Kathmandu	Bagmati Province
da5fd7a0-d412-4431-a46e-ee03b9dab390	10121412601	Burger House	27.678293	85.3452137	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.12+05:45	Saraswati Mata Marg	Seti O.P.	Kathmandu	Bagmati Province
5b1a5488-1efd-4cd1-8391-5573a1395d02	10121412604	Dakshinkali Fastfood and Sekuwa Corner	27.678537000000002	85.3450849	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.12+05:45	Seti O.P. Marga; Gyanodaya Galli; Seti O.P. Marga	Seti O.P.	Kathmandu	Bagmati Province
f4190609-36a5-4294-847d-1e903578c836	9708731383	Lumbini Tandoori And Fast Food	27.680843300000003	85.2795411	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.965+05:45	Way To Naya Bazaar	Chi-ba-hah	Kathmandu	Bagmati Province
cfaab07d-2923-40b6-957d-1348e23ad8d2	4535952270	Artmandu Lounge	27.715790600000002	85.30766770000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.817+05:45	Kushlechaur Marg	Paknajol	Kathmandu	Bagmati Province
79124526-5dd5-428c-b8b7-276f3f7bc56e	4540699092	Sabitane	28.2107214	83.9601377	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.817+05:45	Street 15 (Pahari Marg)	Baidam	Pokhara	Gandaki Province
4c37d0f2-d47a-4821-9ec7-a9303b9c8307	4535189493	Michael Grills	27.7173133	85.3276546	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.817+05:45	Gairidhara Road	Bhrikuti Tole	Kathmandu	Bagmati Province
92eb8f01-b692-4dd1-83a4-9ba562b89f17	10023291074	Royal Thai Hospitality	27.674903500000003	85.396471	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.106+05:45	Araniko Highway	\N	Bhaktapur	Bagmati Province
b6df0899-747c-4634-b912-24461dd39eef	8696860193	Green Organic Cafe And Farmers Bar	27.7140382	85.30984240000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.92+05:45	J.P. School Road	Paknajol	Kathmandu	Bagmati Province
1350c593-07c2-4685-9689-e5c5c9373dba	8332897777	Annapurna Mithai Bhandar	27.707620000000002	85.3435568	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.915+05:45	Kathmandu Ringroad	Pipple Bot	Kathmandu	Bagmati Province
27fcd50a-dabb-4952-9e34-7f5da72c8740	8332897781	Gaushala Height Corner Bhojanalaya	27.7079947	85.34234670000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.916+05:45	Pashupati Sadak	Paneku Tol	Kathmandu	Bagmati Province
888bbd6e-b3c1-4a90-92b5-97d108fc890a	5100226173	I Miss You Resturant	28.1631269	84.0573044	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.839+05:45	Lake Road	Ekata Tol	Pokhara	Gandaki Province
2e612a6f-3aff-487e-9512-2cfb904d7f22	10024851024	Parbati Bojanayala	27.683000900000003	85.3444791	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.106+05:45	Subidha Marg	Basuki Nagar	Kathmandu	Bagmati Province
61020f83-a3c2-4c83-affb-0e4d308ad18e	1937672800	Backyard Foodjoint and Pub	27.676489	85.3111848	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.711+05:45	Damkal-Chakrapath Marg	Dhobighat	Lalitpur	Bagmati Province
1d27d05c-73ea-4d18-80ee-4cb862cb5372	8696865576	Jatra Cafe And Bar	27.713587800000003	85.31015570000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.92+05:45	J.P. School Road	Paknajol	Kathmandu	Bagmati Province
fd79feb8-271f-4329-b494-b92b5f50d864	1940014117	GAIA	27.7133347	85.3129639	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.713+05:45	Bharma Kumari Marga	Kamalachi	Kathmandu	Bagmati Province
01c8708c-f391-4f6c-a176-2ed1128208d5	1940788944	Green Land Cafe	27.699508400000003	85.3385865	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.713+05:45	Devkota Sadak	Srijana Tole	Kathmandu	Bagmati Province
e487c8d0-1dc0-407f-8a58-fe04eb119122	1945608815	Susmita Hotel	27.6875204	85.3264731	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.713+05:45	Rudramati Marg	Thapa Gaun	Kathmandu	Bagmati Province
aa66b059-bc3e-4b7b-9acc-203511c24a17	1947167450	A Cube Cafe	27.6898738	85.305712	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.713+05:45	Dharma Bhakta Mathema Road	Arun Thapa Murti Chowk	Lalitpur	Bagmati Province
4422f419-cdb2-4bb1-934e-0e06121e5f02	1950516695	Alice Restaurant	27.7205781	85.3288454	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.713+05:45	Tukucha Marg	Jor Pipal	Kathmandu	Bagmati Province
55c7a34f-2551-46bc-89d4-f24f1eb4d2d0	5242332537	Begnas Top Restaurant and Guest House	28.172121800000003	84.0921503	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.851+05:45	Piple marga	\N	Pokhara	Gandaki Province
99493b2a-3f28-4b27-8b67-408e209ef06f	6452250286	Cafe de Gengre	27.7116092	85.3089813	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.9+05:45	J.P. Road	Paknajol	Kathmandu	Bagmati Province
23fdd0d2-e856-4472-9e59-0869edb7473f	6497936366	Heritage Restaurant	27.7162469	85.43135090000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.901+05:45	Bhaktapur- Changunanrayan Road	\N	Bhaktapur	Bagmati Province
e65b2228-b066-4594-91d2-acf452f22f36	5102457369	Diyalo Resturant and Bar	28.2061449	83.9962533	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.84+05:45	Prithvi Highway	Buddha Chok	Pokhara	Gandaki Province
f14db143-3a0e-48ce-9563-e0165751bc28	10053803436	Chasi Newari Khaja Tatha Bojanalaya	27.6774938	85.3833309	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.112+05:45	अजिमा ननी	\N	Bhaktapur	Bagmati Province
5e53f11d-e02a-4c95-93f4-d1b3b176a389	5242332538	Marley Restaurant	28.169674500000003	84.0913209	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.851+05:45	F129	Sangam Chok	Pokhara	Gandaki Province
bd2363ff-bfd1-4006-b06f-ab436d1aeae6	6428350487	Kantipur Tandoori House	27.7126169	85.3126613	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.9+05:45	Bharma Kuamri Margh	Kamalachi	Kathmandu	Bagmati Province
7688a3e7-bad8-48e9-8877-59e103ead55b	10053803442	Bishal Momo And Stick Food	27.6779997	85.3833295	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.112+05:45	अजिमा ननी	\N	Bhaktapur	Bagmati Province
5f6b5318-ef87-401c-b49e-71f90e9b7297	10053803446	R And R Newari Khaja tatha Momo Centre	27.678544900000002	85.3833711	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.112+05:45	Purano Thimi- Naya Thimi	\N	Bhaktapur	Bagmati Province
45e33649-c4e8-4d84-a9e5-2109c6450426	6740120723	Himali Farmers Kitchen	27.7159662	85.31038380000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.903+05:45	Chaksibari Marg	Lut Chok	Kathmandu	Bagmati Province
0ff47279-f11c-4e61-a3c2-03de4ba08757	10053465389	Samjhana Dairy and Coffee Shop	27.679788300000002	85.3647687	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.112+05:45	Pepal Bota(SanoThimi) to Lokanthali	sachet marga tole	Bhaktapur	Bagmati Province
75349f3b-ab0e-4c8a-943f-7d4a18148983	10068365166	Rina jhir house and restaurant	28.1962277	83.9703257	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.114+05:45	Pardi Marg	Birauta chowk	Pokhara	Gandaki Province
83fa3cc4-413b-42f6-bf65-c68cbfeca1f8	10076152724	Shandar Momo	27.673780100000002	85.373468	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.114+05:45	Araniko Highway	Araniko Basti	Bhaktapur	Bagmati Province
5e080c2e-f6ca-422b-a083-c374b676ceac	10078969630	German Homes party palace	27.674417100000003	85.37625050000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.114+05:45	Araniko Highway	Araniko Basti	Bhaktapur	Bagmati Province
4782eeec-55f7-432a-a2aa-1700f4d0254f	10079021854	White Palace Banquet	27.674204600000003	85.3660648	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.114+05:45	Arniko Raj Marga	Sagbari	Bhaktapur	Bagmati Province
30a9861a-8588-4acc-855f-9ed7a03e052d	10013301551	Sonam hotel	27.748760400000002	85.3314292	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.089+05:45	Sangam Marg	Tokha	Kathmandu	Bagmati Province
82fa8b49-073d-4dff-9d0e-da912bf7b78a	10013318128	Utpala Cafe	27.7246357	85.36227980000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.089+05:45	Pawo Gompa Marg	Dhara Tole	Kathmandu	Bagmati Province
de92c6f0-706d-48b0-a72c-60ffadd5340f	10013318519	Karma Cafe	27.7242888	85.362194	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.089+05:45	Pawo Gompa Marg	Dhara Tole	Kathmandu	Bagmati Province
e788f87f-cc12-470f-acc4-d15143743e42	10017313481	Sunkoshi tanduri Cafe	27.7424199	85.3321928	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.105+05:45	Samanantar Marg	Narayan Gopal Chowk	Kathmandu	Bagmati Province
88c12ee8-f1af-4ed9-ba86-41493a3a29a7	1937718428	Junction Cafe	27.6729425	85.31560590000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.713+05:45	Machhindra Marg	\N	Lalitpur	Bagmati Province
3694fe5c-326c-49da-8350-5ce61dc89187	8696860201	Helenas Restaurant And Bar	27.713969000000002	85.31028760000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.92+05:45	J.P. School Road	Paknajol	Kathmandu	Bagmati Province
f5ae91c4-d451-4c0c-b997-c0ea471fedf2	8696865571	Niranjana Tea Coffee And Handicrafts Pvt Ltd	27.713204800000003	85.3103112	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.92+05:45	J.P. School Road	Paknajol	Kathmandu	Bagmati Province
54653ec1-cabd-4299-9985-dd036c086002	4198902415	Station Resturant And Bar	28.2261245	83.98859680000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.803+05:45	Panthi Galli	\N	Pokhara	Gandaki Province
5afcbede-6c75-471c-af49-ef526f28b37a	8730039692	Sadbhab Party Palace	27.760261900000003	85.32909480000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.922+05:45	NH40	\N	Kathmandu	Bagmati Province
8ce6c117-092a-4e99-bc54-982ae1f15146	1999643944	Cafereena	27.7107855	85.3177285	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.716+05:45	Durbar Marg	Kamalpokhari	Kathmandu	Bagmati Province
f9700fbd-7732-4f29-a01c-5ffd69093a66	2001058350	Coffee Time	27.723989200000002	85.33117920000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.717+05:45	Kendriya Marga	Kirtan Chok	Kathmandu	Bagmati Province
01aa5643-95d8-4b69-b5a2-59bf47a2ca3a	4805411462	Paragon Hotel and Restaurant	28.188955800000002	83.9592846	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.83+05:45	Siddhartha Highway	Om Shanti Chok	Pokhara	Gandaki Province
ba3306be-8424-4240-913f-8080f9b56fbb	1996638819	Venus Kitchen Restaurant	27.6971068	85.33788	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.716+05:45	Devkota Sadak	Srijana Tole	Kathmandu	Bagmati Province
716e21df-7f7e-45ee-beef-2a635f6e8f4a	4817922522	Aniyor	27.7125951	85.311259	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.83+05:45	Narsingh Chowk	Lut Chok	Kathmandu	Bagmati Province
03973b67-17fe-4ff1-a8d4-ce87f4e6ae66	4824705822	Potala Restaurant	27.7130897	85.31078330000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.831+05:45	Narsingh Chowk	Lut Chok	Kathmandu	Bagmati Province
15f1da81-b6cf-463b-95dd-83964e830896	4160825738	healthy tiffin bakery	28.2415927	83.9886924	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.798+05:45	Bhim Kali Patan	Taxi Chowk	Pokhara	Gandaki Province
8c19005f-d438-45e8-89dd-a2d4953cf88c	6292867585	Nagomi Japanese restaurant	27.711933700000003	85.3098136	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.899+05:45	J.P. Road	Paknajol	Kathmandu	Bagmati Province
42a1bc03-1de1-4459-ad10-1af1acede2a5	10024794489	Three Brothers Cafe And Resturant	27.683037000000002	85.3447883	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.106+05:45	Subidha Marg	Basuki Nagar	Kathmandu	Bagmati Province
a117a09e-8faf-46d9-a025-f3d32ff8cff6	4198642246	Himalayan Cafe	27.721512800000003	85.36263360000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.802+05:45	Phulbari street	Dhara Tole	Kathmandu	Bagmati Province
635fcbd8-de84-4f1c-a2d1-cd3fb5c0bfe8	6499238736	Rooftop Restaurant	27.716455300000003	85.4300152	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.901+05:45	Kapahity - Changu Buspark	\N	Bhaktapur	Bagmati Province
4bb59c54-8389-4519-be67-f1e34e50de40	11399799684	Himalayan Java Coffee	27.712987100000003	85.31757520000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.149+05:45	Darbar Marg	Kamalpokhari	Kathmandu	Bagmati Province
329b6ecc-e099-4965-885e-266830dd9fb1	8699927607	Lahana Food Station	27.713842200000002	85.31136280000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.922+05:45	Narsingh Chowk	Lut Chok	Kathmandu	Bagmati Province
a5a0b89c-54b5-4879-a839-afad5d25349d	8699932823	Chicken Station	27.7143808	85.31164650000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.922+05:45	Thabahi Sadak	Lut Chok	Kathmandu	Bagmati Province
998e79d0-9cd5-4111-90c6-1c40b6e7c372	8699944192	Gilingche Tibetan Restaurant	27.715273600000003	85.31143540000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.922+05:45	Thamel Marg	Lut Chok	Kathmandu	Bagmati Province
903a62ac-0120-475d-8cab-281d1ff3165d	6292852385	Lotus Japanese restaurant	27.712565100000003	85.31219820000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.899+05:45	Jyatha Marg	Lut Chok	Kathmandu	Bagmati Province
107d0f97-6eac-457a-9ef7-12f2a714c064	1817306834	Falcha	27.676332100000003	85.31128550000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.7+05:45	भानिमंडल मार्ग	Dhobighat	Lalitpur	Bagmati Province
f7bc509a-0602-4ceb-8068-64486b391ac3	6371985765	H2O Cafe	27.717814100000002	85.3474135	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.899+05:45	Galli	Maiju Bahal	Kathmandu	Bagmati Province
6e9fe9cf-890a-4a57-8b67-880974a49eb1	6385093509	Om Krishna Restaurant	27.697250200000003	85.2951609	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.9+05:45	Ganeshman Singh Road	Kalimati	Kathmandu	Bagmati Province
6fef5af9-2e9c-43b8-be09-164e207fb647	6385093527	Gopal Daiko Bhojanalay	27.6985163	85.29501420000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.9+05:45	Jana Prabhat Marg	Kalimati	Kathmandu	Bagmati Province
0537ca45-eee8-4f19-898d-bfc8031ee99e	6390260885	Cafe du Pashupati	27.7098173	85.3506801	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.9+05:45	Guru Marga	Kumarigal	Kathmandu	Bagmati Province
ed6221c8-468f-42ce-a944-2a1643cd9b5a	9969484795	Kantipur Tandoori And Bhojanayala	27.7031947	85.32127080000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.063+05:45	Adwait Marg	Baghbazar	Kathmandu	Bagmati Province
64606340-8aa8-481c-8be0-551bfdeaa09f	9969484821	New Lumbini Tandoori Bhojanayala	27.703207600000002	85.32001890000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.063+05:45	Adwait Marg	Baghbazar	Kathmandu	Bagmati Province
3a975ba0-228a-4abd-a69c-bdd8b0b884d7	9969194268	Pizza and Burger House	27.675747800000003	85.3453018	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.06+05:45	Devasthal Marg	Seti O.P.	Kathmandu	Bagmati Province
5cdb600d-4b02-44bc-afc6-2f7c72990f9b	5093636696	Ghandruk Resturant	28.240866500000003	83.9888725	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.838+05:45	Bhim Kali Patan	Taxi Chowk	Pokhara	Gandaki Province
3ace81f7-2493-4c42-9166-b8e2bb0aaaf4	9999286851	Bakery And Coffee	27.669860200000002	85.352708	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.067+05:45	Manohara Corridor	Thulodhara	Kathmandu	Bagmati Province
e97ba235-6b7b-4713-aae6-4abdfb0c8540	9999286854	Dharaney Sekuwa Corner	27.6700969	85.35268590000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.067+05:45	Manohara Corridor	Thulodhara	Kathmandu	Bagmati Province
380d7f4b-cc98-430a-a866-806cb00c8c59	1996639811	Ever Green Restaurant and Cafe	27.699247300000003	85.3384541	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.716+05:45	Basuki Marg	Naya Baneshwar	Kathmandu	Bagmati Province
2979eb45-a898-4ccc-a106-35c435897700	1998479223	Bhetghat Restaurant	27.694034100000003	85.32791660000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.716+05:45	Tanka Prasad Ghumti Sadak	Ghattekulo	Kathmandu	Bagmati Province
22cc5255-5b80-4ab8-bad7-10d532da2531	5479338260	Sarangkot Lodge and Resturent	28.2428877	83.95706220000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.867+05:45	Thapa Marg	\N	Pokhara	Gandaki Province
c8e3d2fa-c8f2-4993-b0c7-00126b5b8306	2047712323	City Food Cafe Restaurant	27.6813986	85.317548	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.72+05:45	Pulchok Marg	Pulchowk	Lalitpur	Bagmati Province
288cb38d-c562-4128-afe6-9485dacfcdab	2052479244	Pizza Hut	27.7108625	85.3172796	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.72+05:45	Darbar Marg	Kamalpokhari	Kathmandu	Bagmati Province
9221c958-55f7-4847-bb6e-31d1f43e0680	5109470621	Chat N Chill	28.221133100000003	83.9575216	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.842+05:45	40DR012	\N	Pokhara	Gandaki Province
0c42bd48-5ea0-4e68-bc87-42c56132a87d	9999286856	The Burger House And Crunchy Fried Chicken	27.6701897	85.35270050000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.067+05:45	Manohara Corridor	Thulodhara	Kathmandu	Bagmati Province
c169447a-b5d3-4240-a2d4-0b82fba943cd	9642636345	Miransh resort	27.6500905	85.28175180000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.953+05:45	Dakchhinkali Road	Taudaha	Kathmandu	Bagmati Province
61676c26-577c-4a5d-9bbf-98914c7e7e87	9999286860	Hamro Sekuwa And Resturant	27.6697917	85.3532656	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.068+05:45	Manohara Corridor	Thulodhara	Kathmandu	Bagmati Province
9654d269-cd7e-4d1f-aefb-d43bbf8a42f0	9999286863	Biswas Tandoori Naan House	27.669859600000002	85.35319630000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.068+05:45	Manohara Corridor	Thulodhara	Kathmandu	Bagmati Province
34f0f3ad-d790-427a-9aeb-eea17321e052	9999286867	Pizza Cafe With Gaming House	27.6702623	85.35287720000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.068+05:45	Manohara Corridor	Thulodhara	Kathmandu	Bagmati Province
c9601889-30fa-47c2-a07f-ff04a5ee789b	4409617192	Perky Beans	28.2127252	83.9570386	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.812+05:45	Lakeside Road	Baidam	Pokhara	Gandaki Province
0db05e66-cf05-46eb-89e5-89d58cf74f08	5287432942	Lumbini Tea Shop	27.7050699	85.3190575	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.853+05:45	Dharma Chakra Galli	Baghbazar	Kathmandu	Bagmati Province
06000adc-4565-4a52-8f8f-1317d14848ef	5242388580	Royal Restaurant and Lodge	28.163155900000003	84.05896960000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.851+05:45	Lake Road	Ekata Tol	Pokhara	Gandaki Province
00063f2a-053b-4a8c-a863-3217c0b3fcfc	5242393910	Rupa view restaurant	28.159781400000004	84.106323	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.852+05:45	F162	Sundarindanda	Pokhara	Gandaki Province
1e3211e6-e841-407c-aa58-f661524ba7ae	11845003096	Nepal Tea Collective	27.715090800000002	85.3096982	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.153+05:45	Center Mart Galli	Paknajol	Kathmandu	Bagmati Province
11cece6e-e616-4e2f-a21d-6267b8d84a0f	5256020021	Try Again Momo 35r	27.7099772	85.31240770000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.852+05:45	Jyatha Marg	Lut Chok	Kathmandu	Bagmati Province
a97239a7-14d0-4510-9bd7-3d5fa4549a89	5263409221	Airport View Thakali Bhancha	28.2009042	83.9794722	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.852+05:45	Siddhartha Highway	Indrapuri Tol	Pokhara	Gandaki Province
9f3ac863-0a5d-4c6e-848a-7df5e3af95e3	3766699543	Madhyapur Family Restaurant	27.6829137	85.3866318	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.787+05:45	F86	\N	Bhaktapur	Bagmati Province
3a8a3b81-2247-487a-bee2-b6a6b6ba0d4d	6041542086	Just Coffee Nepal	27.7128297	85.30889420000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.894+05:45	Kunphen Marg	Paknajol	Kathmandu	Bagmati Province
df3307f0-56da-4cb8-8fdb-ed0c78637117	11869527761	Sugam Restaurant	28.203515200000002	83.982546	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.153+05:45	Siddhartha Highway	Indrapuri Tol	Pokhara	Gandaki Province
5cb1f68b-4379-4393-a02b-aee41067d086	6047623635	Dunga	28.208989600000002	83.9572476	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.894+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
dd923988-45ae-4def-8355-4b6476dc6c11	5581807943	Sarojini Cafe	28.165732700000003	84.0885159	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.88+05:45	F129	Sangam Chok	Pokhara	Gandaki Province
df780966-e7b4-4b4b-996f-44305f964293	5581858113	Ahiva Restaurent	28.1840969	84.0871561	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.88+05:45	urban road	Lamaswara	Pokhara	Gandaki Province
ac8f10ac-8b5d-4596-9d78-f4ea6ff78b0a	5992292026	Avocado Cafe	27.7228664	85.33113970000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.892+05:45	Thirbam Sadak	Kirtan Chok	Kathmandu	Bagmati Province
09d59c22-2d2c-4885-84ce-585e4d954f7c	6052247709	Tip Top Quality	27.6691834	85.3222604	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.895+05:45	Karunamaya Marg	Itapukhu	Lalitpur	Bagmati Province
3a6e5e89-603c-4201-9164-9a8fab7822f6	6065654379	Siddhi Banquet	27.687676200000002	85.28873700000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.895+05:45	Kathmandu Ringroad	Balkhu	Kathmandu	Bagmati Province
a76bfb71-c003-49ab-a6a6-dd8d349f07fa	6047623636	Nsrpha Thakali	27.738929700000003	85.33580590000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.894+05:45	Maharajganj Sadak	Narayan Gopal Chowk	Kathmandu	Bagmati Province
24182f27-76ce-4fe1-8b86-93f2e3f0b1fa	9662688967	Czech Pub	27.717268100000002	85.31022390000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.958+05:45	Chaksibari Marg	Sorakhutte	Kathmandu	Bagmati Province
71d6f755-bf65-4027-8f8c-1740e20b95d8	6052315066	Yak Palace	27.6778465	85.31638450000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.895+05:45	Shri Sai Marg	Pulchowk	Lalitpur	Bagmati Province
22517f32-a40e-4b16-988c-c7969b19289b	6052315067	Yak Restaurant	27.677815600000002	85.3163014	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.895+05:45	Pulchowk Road	Pulchowk	Lalitpur	Bagmati Province
d19ced03-f7ca-4fe8-8240-e63b22a1567b	6052315069	Party World Banqeut	27.674783700000003	85.3152563	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.895+05:45	Jwalakhel to Pulchowk Road	Dhobighat	Lalitpur	Bagmati Province
431958d8-5dfb-4a1a-a0da-8807e525843f	6056855122	Himalayan Beanz barista and bakery school	27.708597400000002	85.3259225	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.895+05:45	Kamal Marg	Kamalpokhari	Kathmandu	Bagmati Province
ef0e67ae-7768-407e-bc2c-4b6e71659baf	6056855123	The Chinese Resturant Beijing Garden	27.7090277	85.32626880000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.895+05:45	Kamal Marg	Kamalpokhari	Kathmandu	Bagmati Province
d97af8f9-1d5f-4af8-bd67-886c4dbeaf2f	6064242847	Ruby Bakery Cafe	27.6742674	85.37239170000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.895+05:45	कुशल‌ भैरव मार्ग	Araniko Basti	Bhaktapur	Bagmati Province
feaad21c-4d1d-4ba0-8ee6-b2da86c89229	9527262987	Priya Sweet and Chat House	27.739905500000003	85.33679500000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.937+05:45	Maharajganj Sadak	Narayan Gopal Chowk	Kathmandu	Bagmati Province
c52e29b6-264a-480a-b377-2cff299abf22	7146490785	Om Shree Food Center	27.714938200000002	85.31228870000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.911+05:45	Dabali Marga	Lut Chok	Kathmandu	Bagmati Province
52a70a7c-3f97-4625-a3a1-d93acdccff94	9662482712	Kirtipur Cafeteria	27.679957700000003	85.2845558	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.958+05:45	TU road	Nayabazar	Kathmandu	Bagmati Province
74be71a3-a238-4738-8582-11794f01d71a	9671838110	AB resturant Kapan	27.743672	85.3558404	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.959+05:45	Santa Srijana Marga	Baluwakhani Chok	Kathmandu	Bagmati Province
614ef3fc-b799-4f13-8459-f30302141112	3144951825	Stranger Cafe	27.711120700000002	85.3087644	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.752+05:45	Swa Chapu marg	Tahiti	Kathmandu	Bagmati Province
a797ff41-0753-44b2-b2be-1c7598359502	2054176670	Malta Restaurant	27.7080802	85.3138909	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.72+05:45	Yogbir Singh Marg	\N	Kathmandu	Bagmati Province
4f2dad4c-26d6-441e-a3aa-0b6b5b67b44d	2041594256	China Town Chinese Restaurant and bar	27.720709000000003	85.3197181	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.72+05:45	Narayan Gopal Road	Lazimpat	Kathmandu	Bagmati Province
a0f34887-76a2-41ff-aba2-48d58663fd37	8696865600	Grill Steak House	27.7134396	85.3103171	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.92+05:45	J.P. School Road	Paknajol	Kathmandu	Bagmati Province
b5162b5e-3950-468c-bc9c-fd3310911b6b	2083721999	Layaku	27.703567200000002	85.3084575	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.724+05:45	Ganga Path	Makkhan Tol	Kathmandu	Bagmati Province
e18a9380-4d0b-4e3a-9619-77d6c094adc0	5477151751	New Galaxy Lodge and Resturent	28.2436627	83.9481882	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.866+05:45	Twins Road	Garjati	Pokhara	Gandaki Province
60231261-3877-4865-9a83-77c9cdf37a6e	9697333597	Thakali Restaurant	28.2566598	83.9778261	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.961+05:45	Lamachaur Marg	Amala Bisaune	Pokhara	Gandaki Province
865bed34-3192-477f-ac1a-f0e5a2abcf5b	2082988632	A to Z Bakery Cafe	27.7209147	85.33151500000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.724+05:45	Thirbam Sadak	Dhalku Chowk	Kathmandu	Bagmati Province
6ac2d50c-65db-46c2-b53e-c7fd6b5ba508	2027855268	Kwality Party Place	27.692416700000003	85.3291878	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.718+05:45	Bhaktithapa Road	Lakhe Chaur	Kathmandu	Bagmati Province
00a82a02-eae7-4b46-9ff1-abb0d64bc0a7	2074228091	Asian Village Restaurant and Bar	27.7230746	85.3214621	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.721+05:45	Lazimpat Sadak	Narayan Tole	Kathmandu	Bagmati Province
84c5ab8c-d86f-49be-8a60-47deca216179	2074278687	Centre Point Cafe	27.7306908	85.3258394	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.721+05:45	Lazimpat Sadak	Narayan Tole	Kathmandu	Bagmati Province
b7dc9c4d-1f11-40d1-b5c3-86e888fcc684	9634998046	Manmaya hotel	27.658154600000003	85.29122840000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.952+05:45	F22	Chobhar	Kathmandu	Bagmati Province
6301e4bd-74f7-4d29-9f24-28744aae0506	10013011008	baglung Khaja GFhar	27.738120700000003	85.3097079	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.087+05:45	Basantanagr Marg	Machhapokhari	Kathmandu	Bagmati Province
80876b03-bd69-4b6c-8f79-94da2874a522	2090732553	Peace Corner Food Cafe	27.717403700000002	85.3251821	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.726+05:45	Gairidhara Road	Bhrikuti Tole	Kathmandu	Bagmati Province
1234c820-5fc2-4429-8080-dc852110002f	5530458641	Grace Camp Restaurant	28.2315003	83.99863710000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.875+05:45	40DR015	Ghimire Chok	Pokhara	Gandaki Province
c74a8cdb-6d13-4a79-950b-acdb434faaec	8697027792	Trisara	27.714937000000003	85.3102559	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.92+05:45	Chaksibari Marg	Lut Chok	Kathmandu	Bagmati Province
c24bd144-9242-490b-9c4d-19bf217ada60	9642111397	Universal Cafe	27.649958100000003	85.2795256	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.953+05:45	Dakchhinkali Road	Taudaha	Kathmandu	Bagmati Province
7871c77b-c510-4b91-bc3c-4f78832dd6c7	9555707140	The Burger House	27.674223400000002	85.27974950000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.947+05:45	Panga Road	Nayabazar	Kathmandu	Bagmati Province
0a3432cd-61b5-4463-abf4-a21700906c81	9555715679	D Aroma Fast Food	27.671355300000002	85.27642920000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.947+05:45	Nagaon road	Be-kwah-tan	Kathmandu	Bagmati Province
51d7ef92-df9e-45b7-ad22-4cfe4b2cb107	9956141400	Puranoo Duhu Fastfood	27.6737189	85.3649152	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.053+05:45	Kausaltar-Balkot	Sagbari	Bhaktapur	Bagmati Province
ec3eabb8-0723-4a1d-a58e-c2fee3d4312b	4915476486	Avataar Cafe	27.7169041	85.30978590000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.833+05:45	Z Marg	Sorakhutte	Kathmandu	Bagmati Province
bf754491-da01-40a7-aaee-247c6a6abce4	10011926527	Vakka Kitchen	27.742520300000002	85.329379	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.085+05:45	Hari Marga Tole	Tokha	Kathmandu	Bagmati Province
7bc38bff-a56e-42c4-aa35-c973b3f1a1ea	4916454475	Hot Sandwich	28.211678900000003	83.95765320000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.833+05:45	Street 16t (Samikopatan)	Baidam	Pokhara	Gandaki Province
e4fe194d-b823-49de-8225-42f567d1ea29	1349664587	Kathmandu Terrace	27.713995800000003	85.3113644	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.693+05:45	Narsingh Chowk	Lut Chok	Kathmandu	Bagmati Province
aee3f920-c25c-4321-87e4-d8620a26d8c2	9657780693	The burger house and Cafe	27.6755806	85.28104540000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.956+05:45	Kirtipur Ring Road	Nayabazar	Kathmandu	Bagmati Province
e357509b-c25b-4124-9fd1-bf557d8cda72	10015238391	New Bhattarai delicious momo	27.7381613	85.31396380000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.093+05:45	F81	Deepjyoti	Kathmandu	Bagmati Province
4972b995-23a9-4877-84db-998041421d50	10015238393	jammys bubble tea	27.738158600000002	85.31400830000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.093+05:45	F81	Deepjyoti	Kathmandu	Bagmati Province
95086515-317e-40bf-b61e-5ab429be9806	10015238394	Ghale Gurung mini cafe	27.738159900000003	85.3140176	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.093+05:45	F81	Deepjyoti	Kathmandu	Bagmati Province
853a876b-c383-413b-9762-2c1b31fcd295	10015238395	Dreams Tanduri resturant	27.738305200000003	85.3139931	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.093+05:45	F81	Deepjyoti	Kathmandu	Bagmati Province
9bf4553e-de92-4dad-80b1-d18882a102a4	4918143862	Green Apple Fast Food	27.671995900000002	85.3127791	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.833+05:45	Jawalakhel Yekantakuna Sadak	Dhobighat	Lalitpur	Bagmati Province
069b44be-8f63-4299-9746-aa1cd1b4eebd	10015268717	Burger King and crunchy fried chicken	27.739177100000003	85.31397510000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.094+05:45	F81	Tokha	Kathmandu	Bagmati Province
06aa59ba-9fc3-4d9d-8528-937da1257ca4	10015268721	Tango kathi roll	27.739226700000003	85.3139604	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.094+05:45	F81	Tokha	Kathmandu	Bagmati Province
18866315-ca64-470e-bfb8-683327bacb32	2083721972	Everest Tea House	27.7035981	85.3076355	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.724+05:45	Jhochhen Tol	\N	Kathmandu	Bagmati Province
2692187c-de92-4c04-b5a6-cb31ef527e47	2082921627	Shisha Cafe and Lounge	27.703437	85.31037330000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.724+05:45	New Road	\N	Kathmandu	Bagmati Province
a858e75e-edd6-4f77-9a1d-e9b3a0fb577f	2074278689	Down Town Tandoori Restaurant	27.7302256	85.32531610000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.721+05:45	Krishna Dhara Marg	Panipokhari	Kathmandu	Bagmati Province
29afea42-24f5-41b9-a4dd-f2e789cfe515	2074428015	Mankamana Height Family Restaurant	27.745484200000003	85.3580451	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.722+05:45	Shanti Ram Chowk Road	\N	Kathmandu	Bagmati Province
2974c2a8-5d91-48da-bcd4-38264995f1dd	2097794105	Kalinpong Restaurant	27.730677800000002	85.3345111	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.727+05:45	Sheetal Marga	Narayan Tole	Kathmandu	Bagmati Province
9bad063e-2b05-4eff-a847-2cee8dbb5dbc	2111924049	Bajra Cafe	27.708902700000003	85.28913800000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.728+05:45	Ganesh Mandir Marg	Dallu	Kathmandu	Bagmati Province
b537ff6f-58d7-4e7a-a005-7108afe32f65	2117332527	Top Of The World Coffee	27.6806586	85.3104612	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.728+05:45	Bakhundol	Arun Thapa Murti Chowk	Lalitpur	Bagmati Province
23d9e1af-932c-4f38-b5d0-30cc8093db59	3488601015	Aroma	27.7089046	85.3147168	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.776+05:45	Kanti Path	Bhotahity	Kathmandu	Bagmati Province
5460256e-18ca-4e8f-bc49-bc86e77aa2c6	10015268728	FAMILY ZONE RESTURANT AND CAFE	27.739675100000003	85.3139938	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.094+05:45	F81	Tokha	Kathmandu	Bagmati Province
374e2901-b87d-4d9c-b807-83e0a67fe4ee	2097704747	Coffee Express	27.710668000000002	85.3177124	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.727+05:45	Darbar Marg	Kamalpokhari	Kathmandu	Bagmati Province
1b7f29a7-ffbe-40d5-8913-987aafffb9a0	10015268740	I CAFE RESTURANT	27.7402446	85.31416200000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.094+05:45	F81	Tokha	Kathmandu	Bagmati Province
c916be92-fac1-4178-8cef-d66e579cad61	10015268749	FASTFOOD RESTRO	27.7406806	85.3144462	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.094+05:45	F81	Tokha	Kathmandu	Bagmati Province
8db013b7-86d2-4381-aca0-6de9374b9d80	10015764417	Western Foods Bakery and Cafe	27.7471117	85.3155397	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.098+05:45	Sayapatrinagar	Baniyatar	Kathmandu	Bagmati Province
84bd9d37-4c61-4a6d-b4e4-a4b662ee5474	5491531718	Chakati Restro Bar	28.2255284	83.9453021	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.87+05:45	40DR012	Bhakunde	Pokhara	Gandaki Province
8ff59149-dfda-4a6b-bc15-f30c411be34c	5491531719	Crazy Circle Resturent and Bar	28.225383100000002	83.9451157	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.87+05:45	40DR012	Bhakunde	Pokhara	Gandaki Province
85db5fd7-4d67-47b1-9fe2-5a3dc847d7f2	9899595481	Jalpa Coffee Club	27.6815496	85.3106779	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.046+05:45	Bakhundol	Arun Thapa Murti Chowk	Lalitpur	Bagmati Province
f51f6181-73dd-48e7-b318-f75d5aae7251	9899619783	Himalayan Java Coffee	27.679077500000002	85.3100067	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.046+05:45	Bakhundol	Arun Thapa Murti Chowk	Lalitpur	Bagmati Province
3603d3ab-c4d6-4009-8d45-4a877d5c85d7	9916683307	Sahara Tandoori Cafe	27.706845100000002	85.3227269	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.047+05:45	Putali Sadak	Kamalpokhari	Kathmandu	Bagmati Province
53e963ba-a642-4498-8abb-2730c0923cae	4800813804	Lake Food India Kitchen	28.212728900000002	83.95845320000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.829+05:45	Street 17 (Lalupate Marg)	Baidam	Pokhara	Gandaki Province
e83378b8-8ae6-45f3-aff9-612cca3aa798	4800870883	Family Restaurant	28.217689800000002	83.9588231	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.829+05:45	40DR012	\N	Pokhara	Gandaki Province
d061345f-cbc2-4410-ad88-06a811421d15	10013666889	Ravtona Grilled and fried	27.752974400000003	85.32678080000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.091+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
6199c664-8a14-45f7-b0d2-924025e37e28	10013666893	Crunchy Food Station	27.7529895	85.3268659	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.091+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
79cf9219-7607-44d1-a860-f1164a2fe2c5	10013666913	Rooftop Marshyangdi Restaurant	27.755130100000002	85.328333	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.091+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
31c20ab9-9db1-43f4-b01f-9eaa4a2d3e6b	10013692755	Kaka and vatij Cafe	27.737601700000003	85.316879	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.091+05:45	Shanti Milan Marg	Tokha	Kathmandu	Bagmati Province
83791382-d6c1-4254-b436-45b3d1fd6e44	5479218518	Mount River View Sukuti House	28.245711300000004	83.97104320000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.867+05:45	Thapa Marg	\N	Pokhara	Gandaki Province
441a489a-83e0-4adb-a424-a1434eec7755	9969484754	Bimala Sweets	27.7055186	85.3219658	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.063+05:45	Baghbazar Sadak	Baghbazar	Kathmandu	Bagmati Province
33ad7a4f-395c-4e56-8291-583b6ae2a718	10013765059	New Kaligandaki Tanduri Restaurant	27.7527201	85.3270571	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.091+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
7a72c6da-8468-4ca0-9350-c7d755332621	10013666888	Hotel De Grande	27.753028800000003	85.32669290000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.091+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
b8d1b118-cd2b-41bf-8035-7eff0b5bcf14	3072768284	Hydrabadi House	27.7192909	85.3310146	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.748+05:45	Thirbam Sadak	Dhalku Chowk	Kathmandu	Bagmati Province
29e0df3e-d116-4a6d-8fd0-3b58c29015d9	9916683313	Chaudary Juice Bhandar	27.7066254	85.3228131	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.048+05:45	Putali Sadak	Baghbazar	Kathmandu	Bagmati Province
c39fa9ec-4f87-480a-b063-efb8065e95de	9916683314	Himalayan Fast Food And Syanko Katti Roll	27.7066073	85.3227995	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.048+05:45	Putali Sadak	Baghbazar	Kathmandu	Bagmati Province
2e776fd9-62fe-4564-acfd-ffeb5ae41a7e	4800813799	David Restro and Bar	28.2127641	83.95841300000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.829+05:45	Street 17 (Lalupate Marg)	Baidam	Pokhara	Gandaki Province
e5ad475e-39ba-4e1f-8891-b18979fa34f8	2164025605	College Cafe	27.689237300000002	85.31218290000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.73+05:45	Ghusingal Marga West	Bakhundol	Lalitpur	Bagmati Province
5d405f5f-0d72-4606-93a9-a08d522dc041	2164964250	ASSA Cafe	27.6701365	85.3096762	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.73+05:45	Bhanimandal Sadak	Dhobighat	Lalitpur	Bagmati Province
a0eb0067-222e-46f8-8627-56195b8ab0b8	2165161995	San Riverside Resturant	27.712318000000003	85.362622	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.73+05:45	Bagmati Corridor Sadak	Pati Tar	Kathmandu	Bagmati Province
dc45c59e-143b-4ac3-8637-4e553139efd8	2160902984	Farmhouse Resturant	27.7126956	85.36081080000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.73+05:45	Dibya Marg	Pati Tar	Kathmandu	Bagmati Province
e65ffae8-7dbf-43e7-99fc-c54a22b487e6	4191244514	Ganapati Chat House	28.2127465	83.98515040000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.8+05:45	New Road	\N	Pokhara	Gandaki Province
719ee470-88b6-436e-bc4e-5be25e744907	5544259263	Bajeko Sekuwa	28.2070681	83.9835599	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.876+05:45	Siddhartha Highway	Indrapuri Tol	Pokhara	Gandaki Province
5175243b-dd19-4f64-855b-198edc5b1469	5544259265	Nepa Restaurant	28.205440300000003	83.9826613	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.876+05:45	Siddhartha Highway	Indrapuri Tol	Pokhara	Gandaki Province
102f1f4e-9eb4-422c-96b1-12268faba545	9645230119	Setey newari restaurant	27.6789999	85.27260890000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.954+05:45	Kirtipur Ring Road	Khahsi bazar	Kathmandu	Bagmati Province
1d493c75-f51d-4771-8d92-e148d4760e74	9645267117	Zuzu garden and events	27.675807000000002	85.2700147	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.954+05:45	Salyanthan road	Salyansthan	Kathmandu	Bagmati Province
9ef24e28-1603-4aa9-b66e-a0836cc5ed02	3152148744	Valley Top Momo	27.713749900000003	85.3447881	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.753+05:45	Charu Mati Marg	Bulbulley	Kathmandu	Bagmati Province
ff642acd-5840-472f-8721-a04ed5c53875	4191244520	Palati Homes Cafe	28.2120132	83.98480040000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.801+05:45	New Road	\N	Pokhara	Gandaki Province
e0df6699-1c34-45c5-9bd7-ee1f87795a4f	10012154598	Hotel Rupakot	27.7361477	85.312464	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.086+05:45	Kathmandu Ringroad	Gongabu	Kathmandu	Bagmati Province
84592143-f87d-46aa-b0e2-2d3eba1c1e52	9648142009	Kiran Restaurant	27.6756041	85.27640720000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.954+05:45	Kirtipur Ring Road	Khahsi bazar	Kathmandu	Bagmati Province
bd97c6dc-121f-4b18-8531-9564592b002f	9655510305	K valley kitchen	27.6872113	85.2820289	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.955+05:45	Way To Ring Road	Sa-lin-chhn	Kathmandu	Bagmati Province
88e3e495-270f-4bee-9efb-bb2d1c4cd92a	10013010961	Galaxy Valley Cafe And Resturant	27.741442600000003	85.3138632	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.087+05:45	Subedi Marga	Shivanagar Tole	Kathmandu	Bagmati Province
5f2cc364-c0ac-4342-a2a6-57a46636e0d3	10121599013	Ringo S Cafe	27.679780500000003	85.3397379	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.127+05:45	Mahadevasthan Marg	Sahayogi Nagar	Kathmandu	Bagmati Province
1182dc77-c9a1-4f06-be92-cf5510cf7d7c	10010431204	Pizza and Burger House	27.735815600000002	85.3206461	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.077+05:45	Kathmandu Ringroad	Deepjyoti	Kathmandu	Bagmati Province
e3c3d13a-61d5-4186-b478-a9eaecd9c4a3	10011753529	On The Way Food House	27.7452994	85.3291422	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.083+05:45	Hari Marga Tole	Tokha	Kathmandu	Bagmati Province
bf059aff-6553-4a65-920d-a4f60b408252	10012154603	New Purbhanchal guest House	27.736088600000002	85.31268030000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.086+05:45	Kathmandu Ringroad	Gongabu	Kathmandu	Bagmati Province
dca4bbaf-f58b-4c43-a231-4adf11ac3c21	2164905855	Sajan Goth Sweets Shop	27.692127900000003	85.31555	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.73+05:45	Tripureshwar Marg	Tripureshwar	Kathmandu	Bagmati Province
a053ae16-4a18-4b7a-a40e-51e3f8908ce3	5463386015	Kingsway Restaurant	28.207431300000003	83.9609662	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.862+05:45	9th Street,Durbar Path	Baidam	Pokhara	Gandaki Province
48369138-0a19-4567-a70c-15d09ab29835	2166613272	Tik i Jhyaa	27.7030335	85.3076911	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.732+05:45	Jhochhen Tol	\N	Kathmandu	Bagmati Province
2b2a8d90-aac8-47d2-ac9e-ecdcd2ee9482	9527958351	hide out	27.695477500000003	85.37573490000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.941+05:45	F89	\N	Kathmandu	Bagmati Province
cb77278b-bdfd-443d-b6ed-9bcecadb36bc	9724480591	Manichya cafe	27.649341200000002	85.28006280000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.97+05:45	Dakchhinkali Road	Taudaha	Kathmandu	Bagmati Province
e15a2615-7917-4a56-9b8f-8ca80a735b12	9724482604	Arju  Fast Food	27.649806700000003	85.27999270000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.97+05:45	Dakchhinkali Road	Taudaha	Kathmandu	Bagmati Province
234c9c54-2578-4ec4-b682-4c0b896cc322	5543309625	Annapurna Restaurant	28.2203273	83.99134550000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.876+05:45	Naya Bazar	Chipledhunga	Pokhara	Gandaki Province
c07b19bc-1d24-4c5f-af14-a74c3b532ce9	5543309641	Suajn Sekuwa Centre	28.2218695	83.9913325	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.876+05:45	Naya Bazar	Chipledhunga	Pokhara	Gandaki Province
41303095-19b3-4c5e-9cae-fbd7acc29776	5544129825	De Himalayan Aroma Restaurant	27.710040900000003	85.31438370000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.876+05:45	Jyatha Marg	Kamalachi	Kathmandu	Bagmati Province
8e446b2a-40f9-4f42-8d5c-308e1368c5a0	5106846368	999 Triple Nine Garden Restaurant	27.7128841	85.3086834	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.842+05:45	Paknajol	Tahiti	Kathmandu	Bagmati Province
c0b20a2b-903a-4b4a-b90a-70f02d1454d9	9527316365	Kfc Fast Food	27.742215100000003	85.33306350000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.941+05:45	Samanantar Marg	Narayan Gopal Chowk	Kathmandu	Bagmati Province
9a0dd088-e10c-4197-a2ca-b5f408b68882	9527316366	Gaunle Ko Sekuwa	27.7439435	85.3303336	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.941+05:45	Hari Marga Tole	Tokha	Kathmandu	Bagmati Province
8cda0feb-5bfd-4ff9-ace0-6534e1a4b15f	9527316369	Nu Kitchen	27.743426000000003	85.34258410000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.941+05:45	sallahghari road	Narayan Gopal Chowk	Kathmandu	Bagmati Province
e259bdd6-01c3-4353-bc2b-2b3120955b1f	9527316370	Kaffeine	27.744225	85.3410678	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.941+05:45	Bansbari Sadak	Narayan Gopal Chowk	Kathmandu	Bagmati Province
3afedcf6-d4cb-4560-9080-b442e824443b	9527316371	Wild Leaves Restaurant	27.7423764	85.33185370000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.941+05:45	Samanantar Marg	Narayan Gopal Chowk	Kathmandu	Bagmati Province
df95b482-6de1-465a-b4c8-9858eb5fd588	9969478213	Unity Food Cafe	27.7058521	85.31763430000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.062+05:45	Baghbazar Sadak	Baghbazar	Kathmandu	Bagmati Province
ca8a1fa6-143a-49ad-9af7-93208e638310	9555963761	Dharane Kalo Bungur Ko Sekuwa House	27.6690076	85.26915240000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.947+05:45	Pushpalal Marg	San-la	Kathmandu	Bagmati Province
43dbd129-f46e-47ef-a824-13f6910d44c5	11933628451	Matina Cafe	27.671339300000003	85.4298158	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.157+05:45	kwachhen	Aadarsha	Bhaktapur	Bagmati Province
af5951e7-2e65-41f9-8913-beafe12c2269	9480171162	Burger House and Crunchy Fried Chicken	27.6878855	85.33613840000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.93+05:45	Madan Bhandari Path	Suruchi Tol	Kathmandu	Bagmati Province
415cddc7-2396-4341-bc2c-c61f70458278	9510233771	Himalayan Takeaway	27.725386	85.3401889	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.931+05:45	Dhumbharai Marg	Dhumbarahi Pipal Bot	Kathmandu	Bagmati Province
d544afe8-5cd7-4bb8-9d09-9e091f210285	9518537245	KTM Bubble Tea	27.7277282	85.3423011	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.931+05:45	Lakhepati marg	Dhumbarahi Pipal Bot	Kathmandu	Bagmati Province
035fdc2b-10d0-4d32-b7cf-e8400f12a01b	9518551317	Lekali Cofee House	28.2051225	83.99871970000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.931+05:45	Prithvi Highway	Buddha Chok	Pokhara	Gandaki Province
f1909607-c5de-4613-8b78-5369681ce638	9520867739	New Tasty Momo Restaurant	28.224888900000003	83.97651590000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.932+05:45	Dharapani Marg	Dharapani	Pokhara	Gandaki Province
42a59f48-28dd-44df-ad2e-14662b1c5563	9969478214	Famous Lumbini Tandoori Bhojanalaya	27.7058475	85.3176777	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.062+05:45	Baghbazar Sadak	Baghbazar	Kathmandu	Bagmati Province
e38a882f-0c33-45da-a9e8-a7c05b3f608f	9969484645	Sudhurpachsim Fast Food	27.705779900000003	85.3185205	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.062+05:45	Baghbazar Sadak	Baghbazar	Kathmandu	Bagmati Province
4c806586-9f60-4e45-9e93-d7cf581f9c3c	8832175850	Hello Sister Cafe	27.682568800000002	85.286113	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.922+05:45	Kathmandu Ringroad	Nayabazar	Kathmandu	Bagmati Province
0c2e1375-f631-476a-bfe5-3e80718ad503	10013765061	Majheri Tandoori Restaurant	27.7526495	85.3270215	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.092+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
fb1e8396-db78-4f7f-9ef5-9ea9b5031785	2166602188	VIshram	27.703465700000002	85.30725650000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.732+05:45	Gyachemuga Galli	\N	Kathmandu	Bagmati Province
9ee40264-9f4b-4133-9c52-22a10feaf8e0	2166606917	Snowman	27.702504	85.3079539	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.732+05:45	Nhusa marg	\N	Kathmandu	Bagmati Province
5535e410-8bc0-4ecd-a9b7-2516a5623826	2166614273	Firefly	27.703090600000003	85.307516	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.732+05:45	Jhochhen Tol	\N	Kathmandu	Bagmati Province
d42aa3ed-912d-4297-a1a5-8591934eeb22	2166600599	Bhatti newari cuisine	27.703453900000003	85.3076669	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.731+05:45	Jhochhen Tol	\N	Kathmandu	Bagmati Province
b4425fe8-dd60-4dec-936d-c3087927f1d6	2165231925	Tamas Restaurant	27.714084600000003	85.309917	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.73+05:45	J.P. School Road	Paknajol	Kathmandu	Bagmati Province
6d690492-f019-4a29-bdc9-582e31c298ba	2524449206	Korean Taste Restaurant	27.680263200000002	85.31005710000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.737+05:45	Bakhundol	Arun Thapa Murti Chowk	Lalitpur	Bagmati Province
de83a46a-0168-485c-b91e-3b7abf7686cd	2572297171	The Lazy Gringo	27.6732438	85.3141519	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.737+05:45	Yela Sadak	Dhobighat	Lalitpur	Bagmati Province
dca22468-7dac-4dd0-bcad-9d5af10e5d9d	2481347311	Chop House	28.2419431	83.9888856	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.737+05:45	Bhim Kali Patan	Taxi Chowk	Pokhara	Gandaki Province
8300752d-cc66-4a3c-96e4-d42a7877bed5	9406605883	Love Station Restaurant	28.148645100000003	84.11434720000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.925+05:45	Rupa Lake Road	Talbesi	Kaski	Gandaki Province
eb01a70f-a849-41f0-90b3-630393c081dd	9406605885	Cozy Restaurant	28.145416400000002	84.1140043	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.925+05:45	Rupa Lake Road	Bhimsendanda	Kaski	Gandaki Province
56f4d36d-c25b-4a9d-a9b7-e401364c0c74	9406605886	Brindaban Cottage and Restaurant	28.1452494	84.11377990000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.925+05:45	Rupa Lake Road	Bhimsendanda	Kaski	Gandaki Province
93765472-59c5-4317-a6cb-5f2e00b79567	9521566117	Nepali Khana	27.7080935	85.334874	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.932+05:45	Pashupati Sadak	Gyaneshwar	Kathmandu	Bagmati Province
35acc470-056e-4cea-9c69-ee4b89de4eb4	9523223618	The B2 Cafe	27.725262400000002	85.3421965	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.932+05:45	Baraha Marga	Dhumbarahi Pipal Bot	Kathmandu	Bagmati Province
1feb0489-3f46-48ea-a7bd-14f0ec782003	9523229320	Bubble Tea Station	27.7243482	85.3399528	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.933+05:45	Baraha Marga	Dhumbarahi Pipal Bot	Kathmandu	Bagmati Province
eb51d0e4-151b-4d69-84a4-f9d78e4fdfe0	9523229418	The Burger House And Crunchy Fried Chicken	27.724152200000002	85.3399607	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.933+05:45	Baraha Marga	Dhumbarahi Pipal Bot	Kathmandu	Bagmati Province
356eeb4a-3938-45de-af44-a627e53074b5	9523234918	Yangla new restaurant	27.7229223	85.3387112	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.933+05:45	Dhumbharai Marg	Dhumbarahi Pipal Bot	Kathmandu	Bagmati Province
29efb38a-72a7-4105-a6f3-aedcd1ecf898	9523235117	Friends cafe	27.7228043	85.33865060000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.933+05:45	Dhumbharai Marg	Dhumbarahi Pipal Bot	Kathmandu	Bagmati Province
faa81c20-d177-4f09-9aeb-21864326da17	10011926441	Khotang Sherpa Hotel	27.744101	85.33045320000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.085+05:45	Hari Marga Tole	Tokha	Kathmandu	Bagmati Province
06189e28-b430-40e9-a2ef-f9baca7e934e	9526102917	Himali Chayangra Restaurant	27.734780800000003	85.3178211	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.936+05:45	Kathmandu Ringroad	Deepjyoti	Kathmandu	Bagmati Province
74c35748-3e18-4dbc-8202-ce4e1e710848	9526103419	Global cafe	27.734753	85.31709620000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.936+05:45	Kathmandu Ringroad	Deepjyoti	Kathmandu	Bagmati Province
e104cfee-259c-45d8-825d-90d9763c3d2a	9526105818	Cafe Zen	27.7183047	85.3470401	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.936+05:45	Kathmandu Ringroad	Maiju Bahal	Kathmandu	Bagmati Province
808e8456-be25-40b0-904e-ed8a7998c7c7	9526106919	Tandoori Bhojanalaya and momo center	27.7176952	85.34706600000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.936+05:45	Galli	Maiju Bahal	Kathmandu	Bagmati Province
f2518e02-f232-4818-9871-f3057bb5ad68	9526106920	Raj Gajal	27.7176803	85.34701480000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.936+05:45	Kathmandu Ringroad	Maiju Bahal	Kathmandu	Bagmati Province
e57d57fd-72d3-41dc-aa22-f2533b11b275	9526863476	Sandar momo	27.7129078	85.2899469	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.937+05:45	Swayambhu Parikarma	Dallu	Kathmandu	Bagmati Province
797f026b-3876-4d37-b3e5-46f23c0ac196	9642621935	Subbu  restaurant	27.650165100000002	85.28227190000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.953+05:45	Dakchhinkali Road	Taudaha	Kathmandu	Bagmati Province
2ab7fb00-4729-4ff8-9105-1f2a72dcac1e	10121397643	Tree Amigos Cafe and Bar	27.6833357	85.3445006	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.118+05:45	Shri Ganesh Marg	Mahadevasthan	Kathmandu	Bagmati Province
a689adeb-6737-4b22-ae27-46cb09b185ab	10121400955	3 Clowns Restro and Bar	27.678872300000002	85.3396213	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.118+05:45	Sahayogi Nagar Marg	Thulodhara	Kathmandu	Bagmati Province
22dda1bc-72ee-4107-9357-e005808ea6ee	9642604692	UB food corner	27.655188600000002	85.2768355	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.953+05:45	Charghare road	Da-na	Kathmandu	Bagmati Province
eb6fb863-a303-4526-b403-d05a58a780c7	11341095597	Bricks cafe	27.685743400000003	85.3178048	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.146+05:45	Kupondol Marg	Kupondole	Lalitpur	Bagmati Province
edd60f8f-8aac-4670-adbc-a5f13aaaca3a	5589968224	Riverside REstaurant	28.1824763	83.93166570000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.882+05:45	Siddhartha Highway	\N	Pokhara	Gandaki Province
21bc5bb5-d1ae-4ac5-8c43-57006d248e29	7796975542	Kasaudi Resatautant	28.207725600000003	83.97766560000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.914+05:45	Rastra Bank Road	Indrapuri Tol	Pokhara	Gandaki Province
2fd4f3f3-7eb8-47c2-bd18-d86042e06d37	7796975547	Break Cafe	28.2065497	83.9767664	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.914+05:45	Rastra Bank Road	Indrapuri Tol	Pokhara	Gandaki Province
ecc9d7fb-4580-4173-b560-e809cae723ad	5594595621	Orchid Garden Restaurant	27.7159985	85.32706470000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.883+05:45	Sama Marga	Kamalpokhari	Kathmandu	Bagmati Province
d9674758-3aef-4999-b51b-aad8d16decee	5598345065	Brothers Cafe	28.2084924	84.0098768	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.883+05:45	Kundar, Annapurna Marga	Sambridhi Tol	Pokhara	Gandaki Province
802f7036-8a63-4ca4-9b5a-8941a34a814e	2521950150	Roadhouse Cafe	27.6761042	85.31302330000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.737+05:45	Damkal-Chakrapath Marg	Dhobighat	Lalitpur	Bagmati Province
4214d5ef-4099-4c82-b5f6-e280a1f68a12	2555552074	The Red Tomato	28.2096319	83.95717350000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.737+05:45	Baidam Road	Baidam	Pokhara	Gandaki Province
0805c740-9ce7-4b24-823c-8bf4a74d65fb	2699906123	Dhumbarahi vojanalaya	27.727642200000002	85.3416028	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.742+05:45	Dhumbharai Marg	Dhumbarahi Pipal Bot	Kathmandu	Bagmati Province
1cb220cb-af05-42a2-a252-2ca70184db39	2702359050	Kathmandu Coffee	27.653813200000002	85.3044253	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.742+05:45	Ekantakuna - Tikabhairab Road	Bhaisepati	Lalitpur	Bagmati Province
99e12dde-47d6-4312-b407-fc019680d95e	2754314875	Islington Canteen	27.7077309	85.32515740000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.742+05:45	Kamal Marg	Kamalpokhari	Kathmandu	Bagmati Province
52ade8f5-3d6c-4745-86f3-df28acb9e919	2469797676	Peace Dragon Restaurant	28.200226100000002	83.94728160000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.736+05:45	Peace Pagoda Road	\N	Pokhara	Gandaki Province
aebc01c1-d628-4839-b882-dfdd58ecb509	5598345160	Gurung Green Momo	28.2126175	84.0096467	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.883+05:45	Street No 8C, Bhadrakali Marga	Bhadrakali Tol	Pokhara	Gandaki Province
8eed09a3-3010-43c1-a3c8-0e3cf3b290c9	2686592416	Momo Magic	27.681061300000003	85.317366	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.742+05:45	Pulchok Marg	Pulchowk	Lalitpur	Bagmati Province
43168fc2-c43d-4e71-8f5e-4dcb56e021fc	2174589424	Lumbini Cafe	27.694887700000002	85.3405908	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.732+05:45	Balbhadra Marg	Naya Baneshwar	Kathmandu	Bagmati Province
49562fd9-9002-4a0c-abb4-69f7b8950575	4264065757	Belle Ville	27.7223702	85.3312126	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.806+05:45	Thirbam Sadak	Kirtan Chok	Kathmandu	Bagmati Province
051ed712-3bef-47fb-a7c8-353aeaa1ddd9	8512503699	Bhetghat Sekuwa Station	27.673271600000003	85.364894	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.916+05:45	Kausaltar-Balkot	Sagbari	Bhaktapur	Bagmati Province
fdd6b966-8626-4cc1-b435-964a4885c8e7	8696242385	Hamro Cafe	27.7119536	85.3121862	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.918+05:45	Jyatha Marg	Lut Chok	Kathmandu	Bagmati Province
0c65cf40-1224-4c65-8909-6b8046f9ac9c	5240763240	Evergreen Restaurant	28.165246300000003	84.09167160000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.849+05:45	F162	Sundarindanda	Pokhara	Gandaki Province
ac745403-105b-471b-acd6-67254c59fe03	10147376705	Royal Dharaney Kalo Bungur Sekuwa Corner	27.679096400000002	85.34395830000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.128+05:45	Seti O.P. Marga; Gyanodaya Galli; Seti O.P. Marga	Seti O.P.	Kathmandu	Bagmati Province
c3ec0964-8754-44b8-bf7c-722cfe03bd68	10147376706	Famous Restro And Fast Food	27.6788774	85.34384	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.128+05:45	Seti O.P. Marga; Gyanodaya Galli; Seti O.P. Marga	Seti O.P.	Kathmandu	Bagmati Province
3b41750d-2f91-4fd1-9de1-3017ba9d2cb6	10013326083	Momo Chowmien Resturant	27.7387115	85.31211950000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.09+05:45	Ram Marga	Tarakeshwar	Kathmandu	Bagmati Province
1f97b6fe-768b-40a2-88c1-b4c5fdb981f5	10121542503	Syanko Katti Roll	27.685651500000002	85.3453607	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.126+05:45	Munibhairab Marg	Basuki Nagar	Kathmandu	Bagmati Province
cf43ea84-95ce-4c3c-b9d3-9e82d0e092f1	3074604293	Bridge Side Cafe	27.7081611	85.3376065	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.75+05:45	Paneku Marg	Paneku Tol	Kathmandu	Bagmati Province
b9862c9f-9118-437f-bd17-75c52e952dea	3074604294	Cross Road Cafe	27.708259	85.3395086	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.751+05:45	Pashupati Sadak	Paneku Tol	Kathmandu	Bagmati Province
fb0cdf91-21f9-4aeb-a565-ab9d08d860fb	3081212891	blossom restaurant	27.699726400000003	85.3441722	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.751+05:45	Bhimsen Gola Marg	Bhimsen Gola	Kathmandu	Bagmati Province
cdac54b5-df58-49c7-8bc9-38a1e9893a85	9523794917	Darjeeling Momo	27.7259169	85.3446876	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.934+05:45	Kathmandu Ringroad	Anandanagar	Kathmandu	Bagmati Province
afdd7879-7b9d-44fa-a28e-c2499ce73c7b	1905155387	Universal Cafe	27.739398700000002	85.33892630000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.706+05:45	Milijuli Marg	Narayan Gopal Chowk	Kathmandu	Bagmati Province
75615e33-aa84-48ff-8687-66a97b05cb0b	2297964825	Roadhouse Cafe	27.720917600000003	85.36205310000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.735+05:45	Chabhil-Baudha-Jorpati Sadak	Sundar Tole	Kathmandu	Bagmati Province
ca5b58c4-7fb0-4bec-8303-2db9644b8c0b	2195425745	4 BEES FAMILY RESTAURANT AND BAR WITH GAJAL	27.675550700000002	85.3157374	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.732+05:45	Jal Binayak Marg	\N	Lalitpur	Bagmati Province
49fedca7-f6ad-4362-9242-b4744d0c1060	9999246010	Sekuwa Corner	27.6685923	85.35303090000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.067+05:45	Manohara Corridor	Thulodhara	Kathmandu	Bagmati Province
3658d1d4-9f80-41bf-a7bc-2beeb43d3953	9999286836	Renu Bhojanalaya	27.6684877	85.3532138	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.067+05:45	Balkumari-Balkot road	Phaudegau	Lalitpur	Bagmati Province
06e77311-2eac-4df3-b000-ad0e6ea935fe	3171509309	Rupa Lake New Restaurant	28.148467200000002	84.1123455	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.754+05:45	Rupa Lake Road	Bhimsendanda	Kaski	Gandaki Province
7b960514-044f-45e7-bbdc-7f5aaeb58495	5679932822	The Lake House	28.2108127	83.9418706	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.886+05:45	Peace Pagoda Road	\N	Pokhara	Gandaki Province
90999be7-0cd3-48b3-8c2d-ea201b09492b	5616497597	PK Cafe And Restaurant	28.2195988	83.997518	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.884+05:45	Hospital Marg	Bhrikuti Tol	Pokhara	Gandaki Province
6bee7d92-442c-4de9-88d3-eab3a9d3704e	5690484121	Dark Beans Cafe	28.216542200000003	83.9587711	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.886+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
5b9ded47-b1c3-4869-99df-5527e682e438	5709669579	Hungry Hut	27.708259100000003	85.32384160000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.886+05:45	Dhobidhara Marg	Kamalpokhari	Kathmandu	Bagmati Province
4c48ec1d-fa9a-472a-8c13-0083ad77e583	2805430664	Local BBQ	28.213581100000003	83.95953370000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.744+05:45	Baidam Road	Baidam	Pokhara	Gandaki Province
fcedc4aa-789c-4d62-9a1f-96c2b968830a	3637654256	Nepali Kitchen	28.207734400000003	83.9575952	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.783+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
c585c462-082f-4869-a874-34061639c6c0	3074563854	Purbeli Hotel	27.708073000000002	85.3398853	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.749+05:45	Pashupati Sadak	Paneku Tol	Kathmandu	Bagmati Province
ec56a90e-7980-4c42-80eb-300874aa79e1	3074563855	RK Cafe	27.7081079	85.3396627	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.749+05:45	Pashupati Sadak	Paneku Tol	Kathmandu	Bagmati Province
f6bdf5fc-77ed-4864-b4fa-4fab5c7407d2	3074569319	Newaaz cafe	27.708086	85.3399227	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.75+05:45	Pashupati Sadak	Paneku Tol	Kathmandu	Bagmati Province
5e91e358-37e1-4777-92e7-de07f055fd36	3074575796	Gupta and Gupta Sweet Shop	27.716380400000002	85.34645060000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.75+05:45	BANHITI GALLI	Maiju Bahal	Kathmandu	Bagmati Province
92f13cae-95ef-4036-a8cb-e35a1b07fb8d	8832647903	Bagaicha Steak and Grill Bar	27.689246800000003	85.28750480000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.923+05:45	Sunar Gau Marg	Kalanki	Kathmandu	Bagmati Province
bac8ecbe-e5aa-4385-a83c-3ba886ede3c8	3074563852	Lumbini Tandoori Restaruant	27.7080756	85.33979070000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.749+05:45	Pashupati Sadak	Paneku Tol	Kathmandu	Bagmati Province
d9b55bcf-f9be-4566-b0b3-cc253dbd0bb8	9035536617	Hotel Fewa Heritage	28.215503400000003	83.95829110000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.923+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
0ba86486-49db-4de1-80d1-54e2de28a062	5808956853	Delicious Food Cafe	27.7304579	85.2870006	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.887+05:45	Jamacho Marg	Buddha Chowk	Kathmandu	Bagmati Province
193ccc57-f1cf-444f-9c80-49fe30750df4	10017313483	Newa Kitchen Family Restaurant	27.742429400000002	85.332417	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.105+05:45	Samanantar Marg	Narayan Gopal Chowk	Kathmandu	Bagmati Province
b2a56575-16b0-48ca-a5f7-2b2eccb21680	9626259598	Quick bites cafe	27.668431100000003	85.2834407	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.951+05:45	Shahid Path	Itagol	Kathmandu	Bagmati Province
68869a75-0a45-49e2-a668-90677787eedc	10016442191	Pokhreli Resturant	27.746262	85.3173951	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.102+05:45	F81	Baniyatar	Kathmandu	Bagmati Province
ebd89689-85e2-44b8-a5f9-96ca05461ca5	5472132089	Thapa Brothers Fresh House	28.1888964	83.9837938	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.864+05:45	Bagmara Marg	RatoPairo	Pokhara	Gandaki Province
d1888c58-d40a-447e-97c4-97ef2338d4f9	5472153399	Dadys Burger Station	28.1913713	83.9700213	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.865+05:45	Rameshwor Marg	Birauta chowk	Pokhara	Gandaki Province
2c871e21-7a54-41c4-b912-94119aa08548	9280798852	White Rabbit Coffee	28.20953	83.9566429	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.924+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
74dfaa5c-29f4-423f-a158-97d61e4115eb	7981067883	Ninamma Foods	27.7271846	85.3841519	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.915+05:45	Bagmati Corridor Marg	Makalbari	Kathmandu	Bagmati Province
aef8fbb2-8e7c-43c4-a1b6-65a47a607463	10010484022	New Gulmi Resunga Bhojanalaya	27.7365649	85.3221613	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.079+05:45	Kathmandu Ringroad	Tokha	Kathmandu	Bagmati Province
7ba641e0-0154-462a-96a1-28c232cb4151	10010484025	Lumbini Tandoori Dawa And Bhojanalaya	27.7367479	85.32241180000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.079+05:45	Kathmandu Ringroad	Tokha	Kathmandu	Bagmati Province
4148ed53-54d3-4125-99d0-14befa6a658e	10010484027	Herpay Restaurant	27.7367916	85.3225074	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.079+05:45	Kathmandu Ringroad	Tokha	Kathmandu	Bagmati Province
69fadea9-bcec-4021-a961-9fc1df20c522	10010484029	Cafe Tree Netra	27.7369324	85.3227653	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.079+05:45	Kathmandu Ringroad	Tokha	Kathmandu	Bagmati Province
f7aa6504-8170-490f-ac3a-f797d76ee7de	10010484033	Green City Cafe	27.7370038	85.3228965	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.079+05:45	Kathmandu Ringroad	Tokha	Kathmandu	Bagmati Province
d1577ed3-b265-440b-b433-2c4a2ce4a45b	10015151577	3 Way Restaurant	27.737255800000003	85.31692100000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.093+05:45	Pragati Sadak	Nav Milan Bastii	Kathmandu	Bagmati Province
0d12808c-d359-40bc-9301-1b39dda86e22	9614642352	Araniko Cafe	27.654098400000002	85.39201750000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.95+05:45	Thimi-Biruwa Road	\N	Bhaktapur	Bagmati Province
23594d91-bf13-48db-ae8c-7a039ca68bf3	9914334744	Yum Yum	27.6759926	85.31320500000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.047+05:45	Damkal-Chakrapath Marg	Dhobighat	Lalitpur	Bagmati Province
8d5bd5ea-d489-4879-8151-6d8f36c00823	9062471016	Angan	27.6888995	85.3341144	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.923+05:45	ChhakkuBakku Marg	Bogati Tol	Kathmandu	Bagmati Province
4c0ddbb6-025d-4656-ab05-7f62a87ba30f	9916683271	Samins Before Lunch And Restaurant And Bar	27.7079261	85.3217554	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.047+05:45	Thati Nati Galli	Baghbazar	Kathmandu	Bagmati Province
00ffba0f-751f-489f-ae61-c52b296b29df	9379215806	OBC Cafe	27.742371900000002	85.31469390000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.924+05:45	Manamaiju Nayapul	Shivanagar Tole	Kathmandu	Bagmati Province
de993ad6-182c-4f17-9167-303bb56a0d92	9385083906	Joshinani Heritage Homes and Newa Restaurant	27.676366700000003	85.2787311	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.925+05:45	Manatwa	Yan-gah-cha	Kathmandu	Bagmati Province
58fcd15a-465f-4361-9f74-e9be8ee80c11	9612920241	Bagh Bhairav Cottage	27.657685200000003	85.25991660000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.95+05:45	Pushpalal Marg	Naya Naikap	Kathmandu	Bagmati Province
e66b7205-3851-4c3a-946e-ee7f8d4b2c67	9613032437	Himalayan Java	27.737163600000002	85.3338104	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.95+05:45	Maharajganj Sadak	Narayan Gopal Chowk	Kathmandu	Bagmati Province
b11ff19b-21fe-41d5-bc55-dbe99f92bc5f	10036515875	Lumbini Tanduri Bhoojanalaya and resturant	27.735066600000003	85.31101840000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.109+05:45	Kathmandu Ringroad	Gongabu	Kathmandu	Bagmati Province
83e6743c-7414-4fde-9d66-5a65f8107bce	10036515877	MK Sekuwa Corner	27.7350864	85.3109838	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.109+05:45	Kathmandu Ringroad	Gongabu	Kathmandu	Bagmati Province
d278b214-11f1-444a-a15d-482e9d839fc4	10036515879	Mumtaaz Resturant	27.735148000000002	85.311018	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.109+05:45	Kathmandu Ringroad	Gongabu	Kathmandu	Bagmati Province
ea67ca03-96e1-4ce7-9206-94b1f0137ca2	5474999712	New Kalika Restaurant and Cafe	28.162745	84.05852750000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.866+05:45	Lake Road	Ekata Tol	Pokhara	Gandaki Province
7a9aadc2-8952-41e7-96a8-f321797415c2	5749809713	Bullet Restro And Bar	28.2007775	83.9709175	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.887+05:45	\N	\N	Pokhara	Gandaki Province
ae27cca5-2316-4558-884c-06491654b07f	5755072321	Mustang Thakali Kitchen	27.6781834	85.3129155	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.887+05:45	Pulchowk Jhamsikhel Marga	Dhobighat	Lalitpur	Bagmati Province
a7a73842-a964-4ed5-a9ec-bb8f1c2f7702	973821284	Blue Diamond Restaurant	28.204241800000002	83.9629221	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.69+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
f7848d36-b908-45d2-a47d-8c88f7e7f31e	3076357353	Himalayan Java	27.7069817	85.323031	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.751+05:45	Dhobidhara Marg	Kamalpokhari	Kathmandu	Bagmati Province
18bcb422-fef1-4805-8eb0-92e016f0a901	3079598141	Pipal Bot Cafe	27.6892092	85.2709334	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.751+05:45	Tribhuvan Rajpath	Anand Chok	Kathmandu	Bagmati Province
83a19255-8589-4264-b86e-778b316e4a3c	3081211125	typical Newari Restaurant	27.715702500000003	85.34660570000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.751+05:45	Gaurighat Marg	Maiju Bahal	Kathmandu	Bagmati Province
ee33b653-9467-4adf-9985-3dba4cb677a9	3074604300	Motorway Sifal Chiya Pasal	27.709621100000003	85.33986490000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.751+05:45	Jaya Bageshwari Marg	Paneku Tol	Kathmandu	Bagmati Province
e274220d-ebf1-4a75-b3a4-b1b792fd6c56	10049306624	Tea Time Cafe	27.6820774	85.3794082	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.11+05:45	F86	Madhyapur Thimi	Bhaktapur	Bagmati Province
b9d195e9-e9fc-4683-a8e0-d4800b468b46	10049362160	Michael Momo	27.675732900000003	85.39774030000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.11+05:45	RadheRadhe Road	Madhyapur Thimi	Bhaktapur	Bagmati Province
50403fc2-6ab3-452a-bd41-7fb830fd91ab	9626222309	Dawn cafe	27.668079000000002	85.27869840000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.951+05:45	Charghare road	Da-na	Kathmandu	Bagmati Province
bd42076b-bdf1-4c18-940d-5c5490771aaa	9626245919	Sawa chen	27.6672137	85.2795325	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.951+05:45	Ajaya marga	Samocha	Kathmandu	Bagmati Province
66bd6e39-f18d-4e49-b2fc-e7dde21f6f82	5472241529	Shree Krishna Ice Cream	28.190806300000002	83.97635000000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.865+05:45	Annapurna Marg	Birauta chowk	Pokhara	Gandaki Province
52022b72-fad0-483d-84e1-4dbaa577c265	5552007307	Embassey Cafe	28.241695500000002	83.98408090000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.876+05:45	Pokhara Baglung Highway	\N	Pokhara	Gandaki Province
f0c8b21d-e4df-490d-b10b-7220d1f79630	6499299152	View Point Rooftop and Restaurant	27.716248200000003	85.42868680000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.901+05:45	Buspark- Dolagiri path	\N	Bhaktapur	Bagmati Province
b853b5a2-82df-40fe-ad88-1f0d78935ddf	6516415585	Freddo Cafe	27.7129274	85.3087436	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.901+05:45	Kunphen Marg	Paknajol	Kathmandu	Bagmati Province
91783e89-3198-446f-a777-2acc0353ec8d	5556007765	Green Sceent	28.1768611	84.0476404	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.877+05:45	Prithvi Highway	Shanti Chowk	Pokhara	Gandaki Province
febf6182-3cc3-40e6-a835-09f9e80184d3	5556007780	Adhakari Tanduri	28.1751089	84.04913090000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.877+05:45	Prithvi Highway	Shanti Chowk	Pokhara	Gandaki Province
b4d6c60b-0252-474c-985f-1f05be107b50	5556160921	Manakamana Hungery House	28.1869611	84.0354719	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.877+05:45	Prithvi Highway	Shanti Chowk	Pokhara	Gandaki Province
88b742c7-16a4-4c3a-9596-fc5c81b47c47	6547035991	sweet shop	27.719902200000003	85.3007539	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.902+05:45	Khusibu Sadak	Nayabazar	Kathmandu	Bagmati Province
bfbfe757-6e6e-4d04-8b4b-2c1ea0fce48b	6547050835	Matka Takeaway	27.676045000000002	85.31297430000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.902+05:45	Damkal-Chakrapath Marg	Dhobighat	Lalitpur	Bagmati Province
87e41e02-0bde-42c1-ad2c-a5731cf438f8	9928590096	Namaste Lumbini Tandoori Bhojanalaya	27.698714300000002	85.3132042	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.049+05:45	Kanti Path	\N	Kathmandu	Bagmati Province
22d8ad96-88c5-4fc7-8949-db66081ea811	6547037197	Matka Takeaway	27.676599200000002	85.316215	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.902+05:45	Jwalakhel to Pulchowk Road	Dhobighat	Lalitpur	Bagmati Province
7b943fbc-948c-47e9-9092-a3bab9ea8b24	9928590109	Suprim Cafe Canteen	27.699999100000003	85.31313820000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.049+05:45	Kanti Path	\N	Kathmandu	Bagmati Province
2bc57a1c-ae4a-4c37-8c03-0c6178519240	5516604623	Kalpana Momo Centre	28.2233382	83.98851760000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.872+05:45	Niva Galli	Chipledhunga	Pokhara	Gandaki Province
95d0c84a-b14d-4d29-abe1-1002efe3fc37	5516604626	Cafe Rollovers	28.2230284	83.98850850000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.872+05:45	Niva Galli	Chipledhunga	Pokhara	Gandaki Province
99856229-3131-430e-b608-8342427f2628	5516693171	Flavour Battle of Dishes	28.223393400000003	83.9889287	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.872+05:45	Deurali Galli	Chipledhunga	Pokhara	Gandaki Province
9a958cec-43d8-443d-b64f-cd39998615d9	5516693172	City Momo Restaurant	28.2232418	83.9889199	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.872+05:45	Deurali Galli	Chipledhunga	Pokhara	Gandaki Province
17863f7d-7dab-409c-b095-3dc3f4b3229d	5517629177	Gaunlae Family Restaurant	28.137287500000003	84.08350150000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.873+05:45	F164	Rambazar Chok	Pokhara	Gandaki Province
b5886b01-af06-48fd-91e2-e19743d9fa22	5517692036	Denish Restaurant	28.132372500000002	84.08049340000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.873+05:45	Prithvi Highway	Gagangaunda	Pokhara	Gandaki Province
6ff4bf1f-636e-4fe9-9779-b1d25a59fda8	5517954472	Moon Soon Cafe	28.1323323	84.08265060000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.873+05:45	Prithvi Highway	Gagangaunda	Pokhara	Gandaki Province
df19889c-118b-49f6-8f9a-51a72c3b9a5f	9993276366	Manohara Indoor Cafe	27.671200600000002	85.35634350000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.065+05:45	Naya Basti Marg	Madhyapur Thimi	Bhaktapur	Bagmati Province
c46304db-db5a-4463-b7b9-05df27080169	9993276372	LittleDoor Mega Kunjina	27.6707877	85.35629730000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.065+05:45	Naya Basti Marg	Madhyapur Thimi	Bhaktapur	Bagmati Province
09df9c39-0241-4597-a966-ed9b42d1e90a	9956505778	Bagbazar Special Momo Center	27.7058134	85.3199628	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.055+05:45	Baghbazar Sadak	Baghbazar	Kathmandu	Bagmati Province
9bdb67bf-55d3-4be3-b9af-b5b6a8a61f82	5525019673	Greenline Restaurant	28.233940800000003	83.99807390000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.874+05:45	40DR014	\N	Pokhara	Gandaki Province
1eaa6ec2-4c0b-4be1-bbe8-e799d52718ae	3176866861	Sarangi restaurant	27.715280600000003	85.3099794	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.756+05:45	Chaksibari Marg	Lut Chok	Kathmandu	Bagmati Province
5e0c9c5b-610d-4987-bc38-1389dadfe015	3188098274	Revolution Cafe	27.715039200000003	85.3125311	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.756+05:45	Amrit Marg	Lut Chok	Kathmandu	Bagmati Province
cd1fc005-f3ac-44cd-8529-5b80bddfba39	3254965461	MM cyber	27.670203200000003	85.2809058	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.757+05:45	Shahid Path	Shalik	Kathmandu	Bagmati Province
c286dfb7-344d-4cc8-ab0d-ea4321a3de76	11804484770	Nectar Carpe Diem lounge and bakery	27.717245100000003	85.3079711	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.152+05:45	Phoolbari Galli	Paknajol	Kathmandu	Bagmati Province
f2ceb030-dbff-4935-80f6-95a3b145c879	11738392475	Kwality Food Cafe and Banquet	27.7194596	85.2875343	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.151+05:45	Kathmandu Ringroad	Nagarjun	Kathmandu	Bagmati Province
11883406-398e-4dec-adf7-94d49b4301d3	9527281354	Bhandari Tanduri Restaurant	27.739000700000002	85.3491295	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.939+05:45	Golfutar Residential Road	Golphutar	Kathmandu	Bagmati Province
51f0eff1-9760-43e8-a2db-f55af180e781	11812308045	Mitho restaurant	28.189116300000002	83.9590933	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.152+05:45	Siddhartha Highway	Om Shanti Chok	Pokhara	Gandaki Province
f35639e5-2759-4d63-ba7f-f099a38a805d	11812308049	Sagarmatha Sherpa Kitchen Restaurant and lodge	28.188999300000003	83.9594258	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.152+05:45	Siddhartha Highway	Om Shanti Chok	Pokhara	Gandaki Province
ee6678c7-2f5e-44c2-aaef-73d1b2c84ce5	11812308051	Dil Singh Dhawa	28.188994200000003	83.95963180000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.152+05:45	Siddhartha Highway	Om Shanti Chok	Pokhara	Gandaki Province
2982517b-0197-48b8-a669-4aaf7b5196ae	11814398417	Tea Villa Station	28.190973500000002	83.96616470000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.152+05:45	Siddhartha Highway	Om Shanti Chok	Pokhara	Gandaki Province
f5773d27-ac03-428d-860b-13c2cc2a78e5	5472241533	Chandra Snooker	28.1909549	83.97403960000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.865+05:45	Annapurna Marg	Birauta chowk	Pokhara	Gandaki Province
4ee33d0c-6ed5-4073-8ba5-9dd3d4d6ac63	9527281356	Mandikhatar Food Junction	27.7364175	85.3462746	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.939+05:45	Nawa Marg	Rudramati Chowk	Kathmandu	Bagmati Province
0e91052b-f9b3-4d5e-92e6-7d3702cc528f	5458009714	Taas House Face Book Food Cafe	28.214600100000002	83.9859308	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.861+05:45	New Road	\N	Pokhara	Gandaki Province
1138a5b4-da88-46a1-b534-47bee98d3c30	9527281358	Mando Momo House	27.7372222	85.3438047	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.939+05:45	Likhu Marga	Narayan Gopal Chowk	Kathmandu	Bagmati Province
b892c032-a1f2-4cfd-8367-ad686b73d930	9527281361	Thakali Kitchen	27.734012300000003	85.34352630000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.939+05:45	Kathmandu Ringroad	Milijuli Tol	Kathmandu	Bagmati Province
aa020298-7cc1-4d23-8f8e-669dd18d283a	9527281362	Full Moon Pizzeria Cafe	27.734078800000002	85.34317870000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.939+05:45	Kathmandu Ringroad	Milijuli Tol	Kathmandu	Bagmati Province
5edc7732-92bf-47a0-85c3-e561a9ef958b	9527281363	Fast Food And Sandar Momo Center	27.7345091	85.34277820000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.939+05:45	Kathmandu Ringroad	Milijuli Tol	Kathmandu	Bagmati Province
7142c528-3bd8-475e-aec0-f402a3b4b6ae	10016539960	Shrestha Stick Food	27.750525600000003	85.33658550000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.102+05:45	Phaimalchuli Road	Tokha	Kathmandu	Bagmati Province
91d4b77e-3351-460b-924f-c1326e0e90c6	8699925701	Mount Strada Coffee	27.714653400000003	85.3107878	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.921+05:45	Paryatan Marg	Lut Chok	Kathmandu	Bagmati Province
53ec2d33-94fa-4325-a3a5-671c38ad2883	4923827856	Phyaphulla Resturant	27.7230366	85.3798426	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.833+05:45	Shankarchowk Marg	Bensigaun	Kathmandu	Bagmati Province
2c3cfc38-0cc1-42cc-b665-e1e3275ea11a	11949430375	Bhadgoan Kitchen	27.680346500000002	85.4457687	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.159+05:45	26DR005	\N	Bhaktapur	Bagmati Province
1182ca52-795f-41d6-8697-423abe5c186b	5458045941	Prabesh Cottage Tandoori Resturant and Sausage House	28.2013825	83.9723709	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.861+05:45	Rastra bank RD lane -1	Milijuli Tole	Pokhara	Gandaki Province
12abc5a3-b6a0-4cb4-863c-a0e103b1df60	11949458992	Food Corner Cafe	27.6790407	85.44407290000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.159+05:45	26DR005	\N	Bhaktapur	Bagmati Province
0077202d-4490-4454-add7-5f4f1830e1ca	11949484763	Hungry Eye Kitchen	27.676144	85.44269290000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.159+05:45	CHYAMASINGH NALA ROAD	\N	Bhaktapur	Bagmati Province
375080eb-c488-4614-8ad1-6820bd43c135	11949524699	Trishuli Bhojanalaya	27.6749279	85.4268457	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.159+05:45	F28	Itachhen	Bhaktapur	Bagmati Province
17cc453f-448f-4265-8027-305abb39a981	11949500384	Bajeko Bhojanalaya	27.680791900000003	85.4440903	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.159+05:45	F28	Ratopati	Bhaktapur	Bagmati Province
64fcb9c1-d3b1-42f7-99cf-e7ff33bbaf14	4791101571	Namaste Potala Restaurant	28.213112000000002	83.9577345	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.826+05:45	Street 17 (Lalupate Marg)	Baidam	Pokhara	Gandaki Province
b918bef4-cd36-4b16-a41a-a57f7a35b6f6	4791101873	Ruslan Lake Valley Restaurant and Bar	28.213528	83.95733960000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.826+05:45	Lakeside Road	Baidam	Pokhara	Gandaki Province
609bf888-48fe-43a9-9a8a-e9816351e37c	9956505860	Syanko Joy of Katti Roll	27.7032588	85.3182189	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.055+05:45	Adwait Marg	Baghbazar	Kathmandu	Bagmati Province
194426a2-65a0-4e87-8398-8e011dab5b20	3341634378	Marpa Kitchen	27.709512	85.3158724	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.76+05:45	Chitra Marg	Kamalachi	Kathmandu	Bagmati Province
95a37e46-6d0b-4008-b05e-92662a76cb23	3347632389	Coffee and Cupcakes	27.6821723	85.3168394	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.762+05:45	Maitri Marg (Bakhundole)	Bakhundol	Lalitpur	Bagmati Province
551492fc-fe2a-4f7b-b23c-ba007804dabf	3352433891	GG Machan	27.6760452	85.3140056	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.762+05:45	दमकल सुन्दरीघाट मार्ग	Dhobighat	Lalitpur	Bagmati Province
e6d93e41-5596-4ebb-9ff0-5f87c734e814	671207877	Cafe Columbus	27.6770864	85.3095229	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.689+05:45	Damkal-Chakrapath Marg	Dhobighat	Lalitpur	Bagmati Province
1b675267-c968-4ce4-baee-5262dbc79e81	1929168140	Kishore Kumar Sekuwa	27.6957871	85.35496400000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.709+05:45	Kathmandu Ringroad	Sinamangal	Kathmandu	Bagmati Province
c8dfa6e9-ee8a-45d3-bf96-ed38c2d552ac	3337226913	Bishal Cafe	27.646508500000003	85.3698755	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.76+05:45	Gwarko-Lamatar	Mahalaxmi	Lalitpur	Bagmati Province
60e0f078-f1ed-42fa-8759-8e5747229ac9	2071170285	Momo Mania	27.7280659	85.3244796	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.72+05:45	Lazimpat Sadak	Narayan Tole	Kathmandu	Bagmati Province
5587787e-9b2a-49d2-a6a1-100c93f5032a	9974650990	Shyam Dai Ko Haas Ko Chhoila	27.6703104	85.30901300000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.064+05:45	Bhanimandal Sadak	Dhobighat	Lalitpur	Bagmati Province
4ffeb98a-40d2-45fb-b6fc-43cf50a24a33	9979879017	The Grill Park	27.721051300000003	85.35262900000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.064+05:45	Mahankal Road	Pani Tanki	Kathmandu	Bagmati Province
41a4990c-3edd-4f19-8017-eca2b20aa9c1	10006391742	Kuwa junction	27.739778100000002	85.3236036	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.071+05:45	Pragati Marg	Tokha	Kathmandu	Bagmati Province
5a60c268-e131-4664-8622-066b2a019aab	669530248	New Orleans Cafe	27.6760015	85.3142368	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.688+05:45	दमकल सुन्दरीघाट मार्ग	Dhobighat	Lalitpur	Bagmati Province
d349c6ea-cacb-4da3-bfa1-a82d8b5e7d7a	11343098181	Yatri cafe	27.703498500000002	85.3066659	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.146+05:45	Punche Galli	\N	Kathmandu	Bagmati Province
24fdd557-757d-4085-b8cd-6f4e681083cf	1892722387	Annapurna Sweets And Fastfood	27.678009300000003	85.32121690000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.703+05:45	Madan Marga	Pulchowk	Lalitpur	Bagmati Province
89847732-8106-468f-a13a-4ed8bb62f02d	1894153478	Roadhouse Cafe	27.720079600000002	85.3315321	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.703+05:45	Thirbam Sadak	Dhalku Chowk	Kathmandu	Bagmati Province
193c50e8-7ea7-4afe-82f3-b8a32d1c0f8e	4172766876	Pun Resturant	28.2029232	84.0015115	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.799+05:45	Himali Marg	Kalika Chok	Pokhara	Gandaki Province
6b9c8471-941f-4a35-9e88-1169130b7b81	4172769751	Kantipur Office Party Palace	28.2046068	83.9952434	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.799+05:45	Gauri Marga	Buddha Chok	Pokhara	Gandaki Province
c866b75e-f96a-46b0-8ff5-bc0bd2fc95f5	10108155301	white rabbit	27.688473700000003	85.3706628	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.115+05:45	SanoThimi-Bode	Naagdesh (Nagadesh)	Bhaktapur	Bagmati Province
409e5618-b3f8-4559-aaf0-db79a0693d4f	10108155302	Chano	27.6884796	85.3709498	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.115+05:45	SanoThimi-Bode	Naagdesh (Nagadesh)	Bhaktapur	Bagmati Province
023e4eeb-b173-442a-b8c7-d8de610298f3	3151985692	Honeyland hotel and Restaurant	28.2044521	83.96435910000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.752+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
b92cd70c-20d2-4689-b2e3-be559421328d	9914340253	Little panda	27.6761678	85.312534	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.047+05:45	Damkal-Chakrapath Marg	Dhobighat	Lalitpur	Bagmati Province
c3757130-48f9-433c-a375-7a84c1572fc0	11256166163	cafe caffe	28.212317300000002	83.97708460000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.145+05:45	Phewa Marg	Zero Kilometer	Pokhara	Gandaki Province
451e61f7-7e00-4678-8b4f-14d12295e593	11262180949	Apricus cafe	27.7160337	85.3327273	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.145+05:45	Machaga Marg	Mali Gaun	Kathmandu	Bagmati Province
055bec00-49e5-48fc-af40-eb93b3f6b276	11341256075	Spice by Urban press	27.685860700000003	85.31307770000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.146+05:45	Bakhundol	Bakhundol	Lalitpur	Bagmati Province
c9debb25-a454-4e12-a504-15f5ed656a71	9974264437	Jhorle MoMo Center	27.672756600000003	85.35653280000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.064+05:45	Naya Basti Marg	Madhyapur Thimi	Bhaktapur	Bagmati Province
914332b8-45f7-47c0-9654-4f581bf5b286	2027887737	Hukum Party place	27.6911425	85.3294309	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.719+05:45	Bijulibazar Marg	Thapa Gaun	Kathmandu	Bagmati Province
a3109d0f-90bd-4089-8736-bbd52f15aa52	3074585435	Sagar Coke and Coffee Shop	27.7133195	85.34451200000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.75+05:45	Dharma Bhakta Marga	Bulbulley	Kathmandu	Bagmati Province
e9bce706-b807-4d22-8eb0-3fef7937492c	5242305570	Sisa Restaurant and Bar	28.1658094	84.09035010000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.851+05:45	F129	Sangam Chok	Pokhara	Gandaki Province
0d244fd6-a0b7-49a1-a7f2-44dd5e9b4c4b	9791809062	Melbourne The Chhen Koyea Restaurant Cafe and Bar	27.677815300000002	85.2742314	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.974+05:45	Kirtipur Ring Road	Khahsi bazar	Kathmandu	Bagmati Province
7f971b77-4b23-4d32-8285-e08af30fc72b	9791809075	The New Horizon Restaurant and Newari Khaja	27.675923700000002	85.2811271	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.974+05:45	Kirtipur Ring Road	Nayabazar	Kathmandu	Bagmati Province
68094c57-757e-41a8-8276-b30d8e24cefb	9791809077	Friendly Beans	27.6754253	85.28120580000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.974+05:45	Kirtipur Ring Road	Nayabazar	Kathmandu	Bagmati Province
01e6a494-196a-491c-b73a-6ac0ede766db	4040408983	Suraj Nan House And Resturant	28.2452459	83.9892342	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.79+05:45	Bhimkali Patan Marg	Bhimkalipatan Chowk	Pokhara	Gandaki Province
e796cf34-e546-404b-a4d9-fdca22497e79	3352437901	The Burger House and Crunchy Firied Chicken	27.6760708	85.3125658	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.763+05:45	Damkal-Chakrapath Marg	Dhobighat	Lalitpur	Bagmati Province
a12b3a6e-5f3c-4831-a0e3-4abdcd9f4cee	4791109690	Sichuan Cuisine Chinese Restaurant	28.212819200000002	83.9582257	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.826+05:45	Street 17 (Lalupate Marg)	Baidam	Pokhara	Gandaki Province
b1cf8f2e-bf12-4396-aee3-85e86afc8d06	3396502781	Lumanti Newa Restaurant	27.677464	85.28028490000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.771+05:45	Kirtipur Ring Road	Chi-ba-hah	Kathmandu	Bagmati Province
32b8720e-05cc-4bc1-b671-25829963cb14	4061457686	MPM Organic Cafe	28.2058861	83.96123460000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.79+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
e1de8aec-cd13-4a5a-b4c2-973bceb0cdd1	4052345826	Coffee Time	27.707388700000003	85.3274038	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.79+05:45	Niketan Marg	Gyaneshwar	Kathmandu	Bagmati Province
f99081a0-c2f9-4d44-9091-02e48d8a3831	3396502780	Jhigu Namaste Restaurant	27.676848300000003	85.2809759	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.771+05:45	Kirtipur Ring Road	Nayabazar	Kathmandu	Bagmati Province
0005cd23-53b1-47a4-97c8-c3a5cb5d3af2	4062780015	cafe Nirvana	28.206177	83.9678719	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.79+05:45	Shanti Path	Baidam	Pokhara	Gandaki Province
cf2f9497-49cb-4557-a7b4-1e33590ecd10	4062811738	The Coffee	28.206268700000003	83.96104170000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.79+05:45	Gaurighat Marg	Baidam	Pokhara	Gandaki Province
e2b1334c-20f5-48f2-99d6-f8f47e1155b3	4789978222	Bac Art Cafe	27.678969900000002	85.314904	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.826+05:45	Pulchowk Jhamsikhel Marga	Dhobighat	Lalitpur	Bagmati Province
87e75e68-bc79-4a45-b5a3-f00430bfe978	4063252087	rina resturent	28.192988000000003	83.97627290000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.791+05:45	Pardi Bazar	Birauta chowk	Pokhara	Gandaki Province
359b0546-d434-474f-8601-97f6204fa99d	4786027321	Green Hill Resturant and Lodge	28.244827200000003	83.9483706	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.825+05:45	Main Street	Garjati	Pokhara	Gandaki Province
782bb082-bafd-43fc-b6ba-02e94a58ae9d	4790245221	Mamma Mai Restaurant	28.213965100000003	83.9585514	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.826+05:45	Baidam Road	Baidam	Pokhara	Gandaki Province
fce8eeee-1127-4355-863d-8b86a12b974e	5138819138	Bhojan Griha	28.2100502	83.95715290000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.843+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
14fe0c6b-01a8-4d59-95a0-5c9b3bfb8fe5	5144727706	Vakku Pauroti	28.2206036	83.95749500000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.843+05:45	40DR012	\N	Pokhara	Gandaki Province
1b22dcb5-8362-4bd2-af8d-792cad20fc57	4790890621	PhatKat Restaurant	27.713659500000002	85.3113502	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.826+05:45	Thamel Marg	Lut Chok	Kathmandu	Bagmati Province
6096b482-4a32-4094-ad3a-a6f3b9b528ee	5481863445	Samrat Tandoori Restaurant	28.211567700000003	83.95760270000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.868+05:45	Street 16t (Samikopatan)	Baidam	Pokhara	Gandaki Province
9b6d3bc0-4c67-47c1-b30e-f94fcc3758e9	2584735236	AITM Tea Shop	27.6569487	85.3329305	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.737+05:45	Khumaltar Height Marg Uttar	NAST Research Centre	Lalitpur	Bagmati Province
1e2a26ba-ceeb-4ed5-8f99-92f677bb4f99	5491231992	Madhyapur Momo	28.223710500000003	83.9874248	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.87+05:45	Chipledhunga	\N	Pokhara	Gandaki Province
e2b991eb-64f9-4303-adbb-584dcef24c88	5491231993	Kantipur Momo House	28.2237252	83.9873151	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.87+05:45	Chipledhunga	\N	Pokhara	Gandaki Province
fc6bcf72-afca-4bc8-ae2a-6554cbdad361	9916725421	Momo Point	27.7055925	85.32277710000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.048+05:45	Baghbazar Sadak	Baghbazar	Kathmandu	Bagmati Province
8809540e-4646-4fea-b765-bba759420834	9916725426	Rambos Resturant Tandoori And Fast Food	27.705298000000003	85.3227631	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.048+05:45	Putali Sadak	Baghbazar	Kathmandu	Bagmati Province
305915dc-1bfa-4c09-b271-a41d432b6429	9916725445	Chhano Restro	27.704844400000002	85.32270580000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.048+05:45	Putali Sadak	Baghbazar	Kathmandu	Bagmati Province
c68e86d4-83e7-4b12-8bb1-b04b035a5466	9916725446	The Cater Aakhabarey Jhol Momo	27.7047668	85.32269170000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.048+05:45	Putali Sadak	Baghbazar	Kathmandu	Bagmati Province
745705c1-fe8d-4100-a277-df141b4e9a8e	2843350165	Mero Nepali Kitchen	27.711940900000002	85.3094068	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.744+05:45	J.P. Road	Paknajol	Kathmandu	Bagmati Province
b6698f3e-6697-4fde-bc56-16a1c9b739d4	9916725526	Jaiswal Juice Bhandar	27.700080500000002	85.32185940000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.048+05:45	Ram Shah Path	Baghbazar	Kathmandu	Bagmati Province
35bc6d7b-1997-4f0f-8173-2e3e7558c4f8	4791369927	Sanju Restaurant	28.2064513	83.9622454	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.828+05:45	7th Street, Shiva Marga	Baidam	Pokhara	Gandaki Province
dcb61f25-4393-4fb3-ab8e-70c9c8c6055d	2857869821	Chaska Asian Restaurant	27.705006100000002	85.3086234	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.745+05:45	Makhan Galli	Makkhan Tol	Kathmandu	Bagmati Province
59835a95-12bf-4801-ba0b-ea83d68422e1	4791369932	Pandey Restaurant	28.206353800000002	83.96202930000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.828+05:45	7th Street, Shiva Marga	Baidam	Pokhara	Gandaki Province
87300601-a8c9-43e0-93d1-f87cb62d8ed2	9921958163	Beatz and Barz	27.6808073	85.30991080000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.048+05:45	भिउती मार्ग	Arun Thapa Murti Chowk	Lalitpur	Bagmati Province
0cb50c83-f153-4e0a-bd1d-d3be8b54a432	10006354403	Everyday Food	27.738746900000002	85.3237545	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.071+05:45	Rambabu Marg	Tokha	Kathmandu	Bagmati Province
ad2edabe-2578-4ec7-917b-57be8da91e91	9969397546	Gurung Khaja and Sekuwa Corner	27.6730263	85.3624647	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.062+05:45	ananda marg	Sagbari	Bhaktapur	Bagmati Province
9578f94a-1d94-4f3a-83a5-ff63d9ae177c	9969437678	The Burger House And Crunchy Fried Chicken	27.674133500000003	85.3642406	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.062+05:45	Arniko Raj Marga	sachet marga tole	Bhaktapur	Bagmati Province
d9bc3812-8021-4040-9673-b866744f1ec7	4059452833	Namaste Bakery and Sandwich Point	28.213197100000002	83.9573816	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.79+05:45	Lakeside Road	Baidam	Pokhara	Gandaki Province
0010408e-c6aa-450b-98c4-2e845191eba6	3626541689	Laamian	27.722463800000003	85.3632113	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.78+05:45	Phulbari Marg	Bhual Dhanda	Kathmandu	Bagmati Province
afd1ec78-0d1b-4f6e-86c4-7e21ea32d99e	3626541690	Double Dorje	27.722495100000003	85.3630677	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.78+05:45	Phulbari Marg	Bhual Dhanda	Kathmandu	Bagmati Province
f2f275c4-84a8-4366-a023-458a2d8b3363	3626541691	Flavors	27.722274100000003	85.3617966	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.78+05:45	Rokpa GH road	Dhara Tole	Kathmandu	Bagmati Province
daaa4ab8-e4c7-4dab-8ccd-9e88fd819000	3626560513	Happiness Vegetarian Restaurant	27.72144	85.3626565	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.781+05:45	Phulbari street	Dhara Tole	Kathmandu	Bagmati Province
dc521b73-1755-4155-b034-630b17486f9f	4861124321	Yangling Tibetan Restaurant	27.7159164	85.3072515	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.831+05:45	Kushlechaur Marg	Paknajol	Kathmandu	Bagmati Province
98f5237c-0072-43cf-96a9-d0b6448e4384	3626462410	Garden Kitchen	27.722761400000003	85.36261160000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.78+05:45	Phulbari Marg	Bhual Dhanda	Kathmandu	Bagmati Province
53b1ecf4-8987-4d1c-bc25-af07e224b67f	4829882721	Crave	27.679792600000003	85.3191098	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.831+05:45	Krishna galli	Pulchowk	Lalitpur	Bagmati Province
147d7325-e477-4c79-89be-0380ba5f9a57	4830018621	SonLove Pepsi Restaurant	28.206559300000002	83.99405370000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.831+05:45	Prithvi Highway	Buddha Chok	Pokhara	Gandaki Province
e1e2435a-9a19-4aa8-bc40-1a2df998a8f5	4832255422	Himalayan Java Coffee	27.6771935	85.3169467	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.831+05:45	Pulchowk Road	Pulchowk	Lalitpur	Bagmati Province
d5040f9f-30db-465b-afab-b730b09d4b1b	3354025934	Si Taleju	27.672596600000002	85.3248791	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.763+05:45	Mangal Bazar- Lagankhel Road	Itapukhu	Lalitpur	Bagmati Province
f88c2360-1cb0-42c4-9900-db29edf9a939	9655516768	Newari Khaja and Cafe	27.690503500000002	85.2772537	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.955+05:45	Sahid Basu Smriti Marg	\N	Kathmandu	Bagmati Province
1424fbed-648e-45a4-839e-4b126d837572	10121362097	Shikhar Momo Center	27.6798046	85.34926750000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.116+05:45	Ratna Marg	Basuki Nagar	Kathmandu	Bagmati Province
7b447e0f-1f7b-4d88-a4f4-e4e8d0db7622	10121388571	Indreni Stick Food Cafe	27.683640800000003	85.34879520000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.116+05:45	Madan Bhandari Path	Basuki Nagar	Kathmandu	Bagmati Province
33f0be82-b2e8-499b-ad5b-a7b1901734ea	10121388576	Dibya Sekuwa Corner and Momo Center	27.683791300000003	85.3487595	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.116+05:45	Madan Bhandari Path	Basuki Nagar	Kathmandu	Bagmati Province
f228a5ef-2fad-4e8e-a946-bb5c4277c483	10121388586	Lumbini Tandoori Bhojanalaya	27.684024	85.3486202	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.116+05:45	Madan Bhandari Path	Basuki Nagar	Kathmandu	Bagmati Province
d6be2c12-44ae-4fcb-ab12-fcded2bff4b8	10187863217	Begnas View Point Restaurant	28.172015700000003	84.0929165	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.131+05:45	Piple marga	\N	Pokhara	Gandaki Province
950b1a39-af2a-4a4a-9afe-d8dd3029b18e	10188105012	Open Lake Restaurant	28.1728941	84.09342620000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.131+05:45	Piple marga	\N	Pokhara	Gandaki Province
ae5672fd-4336-4947-893d-b13edc4966b9	9899619786	next cafe	27.679453400000003	85.3101079	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.046+05:45	Bakhundol	Arun Thapa Murti Chowk	Lalitpur	Bagmati Province
5fc9c7af-5390-4153-b926-564334b36f83	9906741117	Bubbles and Beans	27.721926600000003	85.36236790000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.047+05:45	Phulbari street	Dhara Tole	Kathmandu	Bagmati Province
a91d6cfc-a336-487a-b8cd-a06d0cc0f538	9655520140	LAYAKU Durbar Restaurant and Heritage Home	27.6792747	85.27517	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.955+05:45	Than-ba-hah Lanh	Than-ba-hah	Kathmandu	Bagmati Province
07aa0c3c-682f-4a6a-bb6c-790b3f656fd8	10147413932	Paleti Resturant	27.6787925	85.341797	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.128+05:45	Seti O.P. Marga; Gyanodaya Galli; Seti O.P. Marga	Seti O.P.	Kathmandu	Bagmati Province
e0ad8e5a-9e69-4952-a52c-970f0b1dc62c	10204324714	fyafulla	27.721409700000002	85.3796805	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.131+05:45	Jorpati Main Sadak	\N	Kathmandu	Bagmati Province
e6cdc6b8-f276-417b-b54f-579c53dc5da4	10195509686	Sandar MoMo	27.7099127	85.32566	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.131+05:45	Pashupati Sadak	Kamalpokhari	Kathmandu	Bagmati Province
9c8597fd-0292-4741-b802-f51ebce83e1d	10203901817	Punda Restaurant	27.7210894	85.363573	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.131+05:45	Chabhil-Baudha-Jorpati Sadak	Sundar Tole	Kathmandu	Bagmati Province
0efff25f-381b-4703-b18c-c9978be8aacf	10216528287	Vista B Coffee	27.710438900000003	85.31854840000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.131+05:45	Bina Marg	Kamalpokhari	Kathmandu	Bagmati Province
063805ed-0998-4c80-bd7d-ca8ae6b65ae3	11869551093	Hotel Durga Darhau Sirubari Lodge and Restaurant	28.207514000000003	83.98382980000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.153+05:45	Siddhartha Highway	Indrapuri Tol	Pokhara	Gandaki Province
f7b6f5f2-45b7-4d43-9741-6f2de4340772	11869551130	China Chwok Restaurant	28.208784400000003	83.98509680000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.153+05:45	Siddhartha Highway	Indrapuri Tol	Pokhara	Gandaki Province
16b87cc1-98aa-4a48-b73b-a4168b8ce218	11869551131	Hotel Nikita	28.2087447	83.98509010000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.153+05:45	Siddhartha Highway	Indrapuri Tol	Pokhara	Gandaki Province
567b64ae-5815-4270-bf5d-97f92968f7f4	11869551135	Nisha Bhojanalaya	28.208956200000003	83.98527990000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.153+05:45	Siddhartha Highway	Indrapuri Tol	Pokhara	Gandaki Province
6a6d5671-b71c-4d9a-86e8-0945fede27c4	11869551143	Budhha Guest House and Bhojanalaya	28.209440700000002	83.9852305	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.153+05:45	Siddhartha Highway	Shiva Tol	Pokhara	Gandaki Province
2d02581f-9962-4218-9929-78ee0ab8f8c7	11869551146	New Simana Restaurant	28.209531700000003	83.9852614	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.153+05:45	Siddhartha Highway	Shiva Tol	Pokhara	Gandaki Province
f8b86b5e-b0e3-4ded-a0f4-28b5256d4cdc	11869572616	Chautari Dohori Sanjh and Cafe	28.209169600000003	83.98567720000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.153+05:45	Prithivi Highway	Shiva Tol	Pokhara	Gandaki Province
6545fc09-c0f4-4b0e-b0d4-e21f7553fc3f	11869572617	Syangja Muna Lodge and Restaurant	28.209097600000003	83.9856436	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.153+05:45	Siddhartha Highway	Shiva Tol	Pokhara	Gandaki Province
6ed91489-e74a-4126-b16c-f4fb18db6aa4	11869572622	New Annapurna Restaurant	28.208961100000003	83.9859055	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.154+05:45	Prithivi Highway	Shiva Tol	Pokhara	Gandaki Province
620a50b5-1711-4c22-ad27-6c00d923e35c	4800643323	Coffee Sane	28.210180100000002	83.9564433	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.829+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
d9727c05-a641-4df0-b5ee-27f84b175d76	4851048821	Deja Vu	28.219706300000002	83.95785690000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.831+05:45	40DR012	\N	Pokhara	Gandaki Province
bf4dbcae-b3d3-4f2c-911a-e62617b5b943	3811339834	Saworiya Sweets	27.721829900000003	85.37258290000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.788+05:45	F27	Bensigaun	Kathmandu	Bagmati Province
9eeb8ffd-8683-4660-b29c-c3baf7058abd	11933304971	Purbeli Momo Center	27.6668175	85.3243297	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.156+05:45	Batukbhairav Marga	\N	Lalitpur	Bagmati Province
258a2b7d-35a4-4e1d-8f09-b2e36bb60add	11933315673	Coffee Break Cafe	27.6667284	85.32448190000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.156+05:45	Batukbhairav Marga	\N	Lalitpur	Bagmati Province
1ba62129-8d7e-4ac3-b70b-bae38eeabe9a	3853951669	Koto Restaurant	27.6794528	85.316747	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.788+05:45	Pulchok Marg	Pulchowk	Lalitpur	Bagmati Province
b2a9b509-e00e-497e-88e9-10affb564491	3856047839	Cookie Walla	27.7161358	85.310248	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.788+05:45	Chaksibari Marg	Lut Chok	Kathmandu	Bagmati Province
7f876423-28ff-481e-94f6-239d7040919d	3981494430	PurnaSekuwa	27.7335044	85.3511768	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.789+05:45	Sir Raj Bahadur Road	Aakashedhara	Kathmandu	Bagmati Province
1421ade1-7ec0-47bc-8b6e-08530ed180c4	11878501351	ONCE UPON A HUT	27.7133907	85.3423223	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.154+05:45	Dharma Bhakta Mar	Panna Hiti	Kathmandu	Bagmati Province
12afc652-b9d6-477d-a8df-aa70565bcc0b	11935118897	Laxmi Dahi Bhandar	27.6752824	85.42954870000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.158+05:45	F28	Itachhen	Bhaktapur	Bagmati Province
c9559ea8-3a48-41bb-a88a-95abffff4222	11935119499	Mamata Hotel	27.675259200000003	85.4293603	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.158+05:45	F28	Itachhen	Bhaktapur	Bagmati Province
43a3ce15-ecf4-4da8-9abb-bf257ff11b1c	11931189274	Taplejung Sekuwa House	27.6861342	85.3654245	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.155+05:45	F86	Madhyapur Thimi	Bhaktapur	Bagmati Province
f3c80281-72ff-4435-84e9-a47bba908f4e	11931251817	The Funky House	27.678542800000002	85.36245860000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.155+05:45	Pepal Bota(SanoThimi) to Lokanthali	sachet marga tole	Bhaktapur	Bagmati Province
b58130a8-22a6-4704-82d4-848911473475	11932783231	The Burger House And Crunchy Fried Chicken	27.668570600000002	85.32334730000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.155+05:45	Lagankhel to Mangal bazar road	Hakha Tol	Lalitpur	Bagmati Province
a7d21e45-290b-4590-b5d9-d59ef9a35093	10011926418	Nepali Bhanchha and Sekuwa Corner	27.7441968	85.32982410000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.085+05:45	Hari Marga Tole	Tokha	Kathmandu	Bagmati Province
78ab288b-abf7-4941-b87d-d3bcd9ff9bfb	11935963835	Kristina cafe and coffee house	27.666052	85.42287	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.158+05:45	Araniko Highway	\N	Bhaktapur	Bagmati Province
059dea93-cde8-4712-8ecb-817e04bc5574	11935968342	Sekuwa Express	27.6662925	85.4213914	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.158+05:45	Araniko Highway	\N	Bhaktapur	Bagmati Province
26f363cf-45e7-4823-9971-6a6e5ccd1c93	11936020657	Robins Coffee and Restro	27.6663727	85.4207497	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.158+05:45	Araniko Highway	\N	Bhaktapur	Bagmati Province
1d2d0ab9-f151-4ab0-9051-183532c9ed0c	11950524216	Paradise Food Land	27.670791100000002	85.4099863	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.16+05:45	Araniko Highway	\N	Bhaktapur	Bagmati Province
820ef3b3-f588-4ecc-9cdc-44c0175f0df4	11964331393	Kaka Bhatija Sekuwa Corner	27.673929	85.4054873	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.16+05:45	Araniko Highway	\N	Bhaktapur	Bagmati Province
1c1d23ec-c912-4aa4-b883-dccb00248aa4	11939798329	Saiju Juju Dhau Bhandar	27.6786767	85.44109490000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.159+05:45	F28	Ratopati	Bhaktapur	Bagmati Province
31ee6bab-68ba-435f-9a44-ce660801b321	4198642245	Swotha Tea and Coffee Shop	27.67488	85.3254496	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.802+05:45	Swotha Narayan Sthan	Swotha	Lalitpur	Bagmati Province
2ee47ba0-3309-4d5f-bfd4-a4272cbdd533	11939991764	Namaste Newa	27.677981900000002	85.43911750000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.159+05:45	F28	Ratopati	Bhaktapur	Bagmati Province
06f5f303-4bc3-4bb2-8f48-b5ac2ac498ff	11940025614	S B U R Cafe	27.678552600000003	85.44169240000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.159+05:45	F28	Ratopati	Bhaktapur	Bagmati Province
dbe87eb6-4350-49cc-b1db-b458a459fa60	9791809088	New Puja Sweets	27.6749727	85.2808871	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.974+05:45	Kirtipur Ring Road	Nayabazar	Kathmandu	Bagmati Province
a05b731a-f7d0-4bb0-9c3e-2540a4c5eb0d	9916636663	Jamkabhet Resturant and Cafe	27.7071812	85.3227889	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.047+05:45	Putalisadak Road	Kamalpokhari	Kathmandu	Bagmati Province
e097326f-355f-4634-91e1-c9d2a3ff463a	3811339839	Cafe	27.721788500000002	85.3738388	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.788+05:45	Jorpati Main Sadak	\N	Kathmandu	Bagmati Province
580dca7c-722d-4d04-9d60-8303a9ee0e6c	3837044716	KAPAN SEKUWA	27.7383658	85.3529963	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.788+05:45	Jyotinagar Pool	Golphutar	Kathmandu	Bagmati Province
e8185d18-9e8b-4f11-8df4-a57ad050e88d	11884055068	Jet Lounge and Restaurant	27.6998125	85.36797920000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.154+05:45	गोठाटार मार्ग	\N	Kathmandu	Bagmati Province
adbd0312-049c-4afa-8cfc-88cbc10ef198	4157092592	Bajeko Sekuwa	27.704347000000002	85.3418201	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.792+05:45	Battisputali Marg	Pipple Bot	Kathmandu	Bagmati Province
27419956-a789-401b-824f-8ae5dd06da6d	4157092593	Yes Dynamic River Side Rest Camp	27.7143972	85.37475640000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.792+05:45	Way To pashupati	Nayabasti	Kathmandu	Bagmati Province
ce1b97c9-ee01-410b-beaf-4fc148dbcf2e	4157093691	PG family restro	27.712034600000003	85.35785820000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.797+05:45	Bagmati Corridor Sadak	Pati Tar	Kathmandu	Bagmati Province
47c622c5-eac2-4af6-acc9-29f69a3ca50a	7168315498	Mitho Momo	28.217547600000003	83.95912030000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.911+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
86599095-efcb-47dd-ab31-6874c0b5a5a9	4157092591	SK cottage restro	27.7117454	85.37032570000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.792+05:45	Bagmati Corridor Sadak	Pati Tar	Kathmandu	Bagmati Province
be8c8744-0a49-407b-8f9d-809f1bc053b5	5436915452	Eliz cafe	27.6770715	85.2807432	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.859+05:45	Kirtipur Ring Road	Chi-ba-hah	Kathmandu	Bagmati Province
a70a1d5f-5811-4fd7-841a-b5076c241bf9	7666750261	KKFC Maitidevi	27.7038705	85.33301	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.913+05:45	Dillibazaar Marg	Ghattekulo	Kathmandu	Bagmati Province
162b6b6a-2607-4153-a8aa-cc59f275c26e	5453807950	Diamond Thakali Kitchen	28.2123758	83.97658770000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.86+05:45	Phewa Marg	Zero Kilometer	Pokhara	Gandaki Province
b5883acb-b5a0-428f-abe8-4fc8d26ff88f	5455952740	Hira Restaurant	28.191626600000003	83.9592281	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.86+05:45	40DR016	Om Shanti Chok	Pokhara	Gandaki Province
067c8a57-a1ed-4af0-bb61-b1bd88b17b6f	8696865580	Shafqat Halal Food Restaurants	27.713505400000003	85.3100608	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.92+05:45	J.P. School Road	Paknajol	Kathmandu	Bagmati Province
d8417f9e-c20d-4f2d-ac13-2ba9fd6f129d	7180938785	Rox Restaurant	27.722270400000003	85.3574947	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.912+05:45	Tusal Marg	Tusal	Kathmandu	Bagmati Province
85f0d433-e15a-4ab5-a9fb-2c2a62d727f5	8696865584	Brezel Cafe And Bar	27.713376	85.3102119	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.92+05:45	J.P. School Road	Paknajol	Kathmandu	Bagmati Province
72a21824-7419-4608-92f6-0c28b443c8f2	7632617385	AB Coffee Point	27.724964900000003	85.341577	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.913+05:45	Baraha Marga	Dhumbarahi Pipal Bot	Kathmandu	Bagmati Province
4e1346ba-67e7-4d32-b7dd-e1a8379d0560	7638507622	Wings Factory	27.6997609	85.3383802	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.913+05:45	Devkota Sadak	Srijana Tole	Kathmandu	Bagmati Province
03869caf-46d7-4475-a83e-b49aba65c170	10108155305	silauti party venuw	27.6889068	85.3715348	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.115+05:45	SanoThimi-Bode	Naagdesh (Nagadesh)	Bhaktapur	Bagmati Province
d7e188b0-e019-44b1-be3d-9cb5681622f8	7666750263	The Pizza Fire	27.7042885	85.3328034	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.913+05:45	Maiti Devi marg	Gyaneshwar	Kathmandu	Bagmati Province
8c1ed590-e608-4ed4-bc91-f10db5a3ac01	8696242395	Chikusa Coffee Shop	27.711820000000003	85.31216640000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.918+05:45	Jyatha Marg	Lut Chok	Kathmandu	Bagmati Province
b9cdec25-cb42-46ab-b350-29ce90465661	8696242410	Beautiful Private Chef	27.7114274	85.31208810000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.918+05:45	Jyatha Marg	Lut Chok	Kathmandu	Bagmati Province
a37566d7-af7f-4195-aa76-57fefa16efe1	8696269324	Taste Of Home	27.7108238	85.31227290000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.918+05:45	Jyatha Marg	Lut Chok	Kathmandu	Bagmati Province
a7cbb2a5-e0f1-4fa1-9079-ee12c91be127	8696390261	Nurbu Restaurant	27.7120931	85.3090349	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.919+05:45	Paknajol	Tahiti	Kathmandu	Bagmati Province
9548edd7-04ae-433f-b205-d61bdb88fdaf	8696390314	Himalayan Restaurant	27.710248	85.3109318	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.919+05:45	Thahity Jyatha Marg	Lut Chok	Kathmandu	Bagmati Province
d396e346-b9da-42f7-a1aa-e379cec5ea9d	9406605889	Rupatal Garden Resturant and Bar	28.150137500000003	84.1166539	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.925+05:45	Rupa Lake Road	Talbesi	Kaski	Gandaki Province
25606e6a-c015-4a13-bc4c-a23f25a47b43	9406605890	Rupatal Jharana Resturant and Lodge	28.1500036	84.1166024	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.925+05:45	Rupa Lake Road	Talbesi	Kaski	Gandaki Province
9d636590-c504-4c10-8084-da5897b092a2	9407484722	Himalayan Java Coffee	27.710216000000003	85.3219827	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.926+05:45	Siddhik Marga	Kamalpokhari	Kathmandu	Bagmati Province
559d0314-73bb-49b5-a56f-15801e0558a7	9407485121	Chiya Junction	27.6866117	85.3351016	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.926+05:45	Sankhamul Marg	Shankhamul Chok	Kathmandu	Bagmati Province
6c35cdfc-2c36-48cd-97ae-16ff78e22b2b	9525156985	Cup of the Day	27.721337000000002	85.3378381	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.935+05:45	Pragati Marga 1	Kirtan Chok	Kathmandu	Bagmati Province
86a18183-83b7-4657-a0b3-275726394a1c	9526032518	Chiya bhatea	27.718078900000002	85.3485083	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.935+05:45	Chabhil-Baudha-Jorpati Road	Chuchepati	Kathmandu	Bagmati Province
efae41de-91bd-4e1f-8446-40c65fab3248	9526050520	First Kitchen	27.741775800000003	85.3317006	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.935+05:45	Kathmandu Ringroad	Narayan Gopal Chowk	Kathmandu	Bagmati Province
078cea1d-1c09-4fa1-a4ad-1f99d1e7c0cd	9526050618	New Lumbini Tandoori and Bhojanalaya	27.741832600000002	85.3319151	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.935+05:45	Kathmandu Ringroad	Narayan Gopal Chowk	Kathmandu	Bagmati Province
a9fa877e-9ea3-4c66-b549-2f0d0281ea3c	5469167410	Nishan Cold Store	28.1469425	84.08378180000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.863+05:45	40DR025	Tagako Mukh Chok	Pokhara	Gandaki Province
b3c8ab7c-c33d-427d-ae0c-f76fc36ed74f	10108212230	burger house and crunchy fried chicken	27.668541500000003	85.3654338	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.115+05:45	Kaushaltar-Balkot	Purbeli Tol	Bhaktapur	Bagmati Province
30b46f95-0607-459e-b511-062c3ce86450	9526051919	Gambesi Thakali kitchen	27.7385243	85.3264151	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.935+05:45	Kathmandu Ringroad	Tokha	Kathmandu	Bagmati Province
23bb560d-d438-40af-b2a4-76195a199139	9526052617	Maya Pub	27.738297000000003	85.3259847	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.935+05:45	Kathmandu Ringroad	Tokha	Kathmandu	Bagmati Province
0dfc6179-7b0b-4d3a-82e6-4a3e520ff9f5	4158677013	cold stores	28.1961793	83.950676	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.797+05:45	Siddhartha Highway	\N	Pokhara	Gandaki Province
4500d05d-91d8-481a-a9e5-cb67bfdf2bf4	5463338426	Mimosa restaurant Bar	28.206953900000002	83.96146780000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.862+05:45	Gaurighat Marg	Baidam	Pokhara	Gandaki Province
f21515ac-29ac-4bd3-b05e-148ca1086fbe	5437917521	Hankook Sarang Korean Garden Restaurant	27.714357900000003	85.3099038	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.86+05:45	J.P. School Road	Paknajol	Kathmandu	Bagmati Province
19fff4f1-fafd-4381-b202-a7111256bf88	4170598689	Festival	27.7119277	85.30953860000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.799+05:45	J.P. Road	Paknajol	Kathmandu	Bagmati Province
4b94ed4f-0917-4320-8597-114686304c2d	4160825748	Kiran Veg Momo	28.238271500000003	83.9893442	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.798+05:45	Gyan Marg	\N	Pokhara	Gandaki Province
3eb4591f-3bab-4dc2-b6a2-00d33cac614f	1904043431	F bar	27.6762659	85.3131402	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.704+05:45	Damkal-Chakrapath Marg	Dhobighat	Lalitpur	Bagmati Province
3ba7141b-5e10-4f7b-a695-9fb74ee87df8	11343179118	Musicology	27.683736000000003	85.31246540000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.146+05:45	Maitri Marg (Bakhundole)	Bakhundol	Lalitpur	Bagmati Province
ecb369b6-991f-4f2a-83f2-08331bfd2a55	5104522283	Welcome Resturant	28.204532200000003	83.96521650000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.841+05:45	4th Street, Ambot	Baidam	Pokhara	Gandaki Province
00e96446-c87d-4497-8ed7-eb0dc7e84fcc	1898624382	Capital Grill	27.719022000000002	85.3309399	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.704+05:45	Thirbam Sadak	Bhrikuti Tole	Kathmandu	Bagmati Province
81902461-f686-475c-a821-c914c86d8104	5104522289	Asain Food	28.2047269	83.9652879	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.841+05:45	4th Street, Ambot	Baidam	Pokhara	Gandaki Province
a251bf22-15bc-4edd-834d-5fc11a175bd7	9956458510	Tandoori Bhojanalaya	27.706075100000003	85.31699490000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.054+05:45	Baghbazaar Road	Baghbazar	Kathmandu	Bagmati Province
0d68a622-73b9-464f-82f9-3f963f2dfd59	9523235420	Flames Restro cafe	27.7334187	85.3456452	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.933+05:45	Golfutar Residential Road	Rudramati Chowk	Kathmandu	Bagmati Province
a0fc331e-36be-408b-89ef-00af81a5dcf0	9528550017	Triveni foodland	27.741622000000003	85.3303963	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.941+05:45	Kathmandu Ringroad	Narayan Gopal Chowk	Kathmandu	Bagmati Province
e6b07c62-9252-4fdd-99e1-3c82b17765fc	9528550019	Thali cafe	27.741528300000002	85.330287	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.941+05:45	Kathmandu Ringroad	Narayan Gopal Chowk	Kathmandu	Bagmati Province
6bb570db-323d-4409-8029-6152006a83ab	9528550020	Organics fresh juice park	27.741580600000002	85.33034830000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.942+05:45	Kathmandu Ringroad	Narayan Gopal Chowk	Kathmandu	Bagmati Province
3abaaba9-6e09-4542-914e-bd2a1c3bc304	9528550417	Gurung solti ko bhajaanalaya	27.7414777	85.33021520000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.942+05:45	Kathmandu Ringroad	Narayan Gopal Chowk	Kathmandu	Bagmati Province
5c992cc2-84e0-4b6f-aabd-931515fb05aa	9528550517	Pratistha cafe	27.7414592	85.330177	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.942+05:45	Kathmandu Ringroad	Narayan Gopal Chowk	Kathmandu	Bagmati Province
03d36af3-c75a-48f4-be67-6e3d1f97abfa	9528550920	Tajmahal Food Cafe	27.7405736	85.3287557	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.942+05:45	Kathmandu Ringroad	Tokha	Kathmandu	Bagmati Province
c816c920-759d-4a0d-9da9-b9e4b553c6ca	9528551017	CFC THE AIRPORT SEKUWA CORNER	27.7413604	85.32999740000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.942+05:45	Kathmandu Ringroad	Narayan Gopal Chowk	Kathmandu	Bagmati Province
17b0d28c-92a7-47c0-aee8-56da21823231	5491531709	Hill Side Guest House and Resturant	28.225373700000002	83.9480272	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.87+05:45	Khapaudi Road	\N	Pokhara	Gandaki Province
9a90ba1e-b8b8-4430-8bfa-b7fe1f4563b1	9528647527	DJ magic Restaurant and Tandoori	27.738605200000002	85.32549900000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.942+05:45	Kathmandu Ringroad	Tokha	Kathmandu	Bagmati Province
132dfb91-c009-48bf-81b8-773dddb9d189	9528648017	EG Burger house	27.739013000000003	85.32554010000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.942+05:45	Kathmandu Ringroad	Tokha	Kathmandu	Bagmati Province
e32cdae4-c43d-4707-b634-d3f73adb9b87	9529597417	On the Grill Korean Barbecue Restaurant	27.7310254	85.3289742	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.945+05:45	Rati Marg	Maharajganj	Kathmandu	Bagmati Province
6d112633-be45-4109-ba6f-958a3557dfac	9528648021	Delicious street food	27.738535600000002	85.3253876	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.942+05:45	Kathmandu Ringroad	Tokha	Kathmandu	Bagmati Province
ffeda2c7-6465-4fc7-aeda-711f19d6d8f3	9528660618	The Radung cafe	27.736467200000003	85.3175866	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.942+05:45	Purna Street	Deepjyoti	Kathmandu	Bagmati Province
f4559106-43b3-405b-aaab-a9792a6e27fe	9528660621	Sky Restro	27.7354203	85.3172072	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.942+05:45	Kathmandu Ringroad	Deepjyoti	Kathmandu	Bagmati Province
e6a8b068-d2fb-4e6d-bc7f-0e36fc08a9c4	9528660724	Royal Himalayan coffee	27.719996000000002	85.34578640000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.943+05:45	Anurag Marg	Gangahiti	Kathmandu	Bagmati Province
8cb101fa-5dab-4d67-b6f9-8ab1d750e5ea	9528660918	Sky cafe	27.7353659	85.31708640000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.944+05:45	Kathmandu Ringroad	Deepjyoti	Kathmandu	Bagmati Province
80bba7dc-d8f7-4260-9f84-851b412a25a0	9528673818	Cafe de passage	27.718335600000003	85.3464888	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.945+05:45	Kathmandu Ringroad	Maiju Bahal	Kathmandu	Bagmati Province
25903224-61f5-4c50-9d3f-b2d1d8f0df53	9529542954	Siddhartha Foodland	27.667861400000003	85.33300360000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.945+05:45	Deko Marga	Bhangini Nani	Lalitpur	Bagmati Province
33347c78-ecc4-454b-bfea-4335874a6f13	9529542956	Hamro Cafe	27.6682191	85.33305370000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.945+05:45	Deko Marga	Bhangini Nani	Lalitpur	Bagmati Province
386b6b05-2ecd-4f96-be8e-bab0c91be5f0	9529542957	Lama Hotel	27.6682522	85.3330152	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.945+05:45	Deko Marga	Bhangini Nani	Lalitpur	Bagmati Province
b96482b6-e1d4-4fb2-9d4b-e33b3bc163d0	9529580406	Chhahari	27.7297569	85.33055710000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.945+05:45	Thirbam Sadak	Kiran Chok	Kathmandu	Bagmati Province
cab01d60-7c7f-48e4-9644-67d00b44f44c	9529645918	Neptune Nepal Foodland	27.722282200000002	85.3311874	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.945+05:45	Thirbam Sadak	Kirtan Chok	Kathmandu	Bagmati Province
6cd9cbbb-3430-4461-be50-60ba203ed5d1	4167607289	Local BBQ	27.7320117	85.30939330000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.798+05:45	Mitranagar Marg	Gongabu	Kathmandu	Bagmati Province
854050f9-15e6-49ba-a6c4-e9dfdf0d8776	4180614014	Neema Food and Restaurant	28.2192624	83.9776449	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.8+05:45	Pokhara Baglung Highway	Dharapani	Pokhara	Gandaki Province
134017b8-9720-445e-ab75-8f845751c3f5	4182894378	Rija Momo Khaja House	28.220018300000003	83.9910799	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.8+05:45	Naya Bazar	Chipledhunga	Pokhara	Gandaki Province
be47b7be-7373-4980-8c40-bf5da3b6b12a	9529707040	Hello Cafe	27.705696900000003	85.3222178	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.945+05:45	Baghbazar Sadak	Baghbazar	Kathmandu	Bagmati Province
2c546cdd-6718-48b0-9844-8b75f25549fb	9529746999	Thay Bha	27.703011900000003	85.31096450000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.946+05:45	Pako Marg	\N	Kathmandu	Bagmati Province
e9b3af7e-6866-40dd-a39a-710dfce7a5b3	9529757240	Kumari Resturant	27.704690600000003	85.3228457	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.946+05:45	Putali Sadak	Bansh Ghari	Kathmandu	Bagmati Province
7bd8a49e-4161-4b09-97ad-39eb76ce7a47	5425988563	Smile Cafe and Restaurant	28.2166989	83.98595630000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.858+05:45	New Road	\N	Pokhara	Gandaki Province
b2d81467-ca2d-4684-a376-23d049fc0b53	5426058455	Ten 11 Restaurant	28.222435700000002	83.98730950000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.858+05:45	New Road	\N	Pokhara	Gandaki Province
13c41bab-e7f8-4f11-8748-f10132ef52f8	9657788315	Dream cafe and restaurant	27.680674000000003	85.2792412	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.956+05:45	Way To Naya Bazaar	Chi-ba-hah	Kathmandu	Bagmati Province
76dabcd6-1710-4f83-9502-3b85af277ff3	9855200821	License To Grill	27.7433373	85.3771476	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.045+05:45	kapan->> jagadol road	\N	Kathmandu	Bagmati Province
371eccaf-f8d7-4f6c-b643-9b34bb3ed7df	9956505718	Namaste Lumbini Bhojanalaya and Fast Food	27.7060655	85.3171806	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.055+05:45	Baghbazaar Road	Baghbazar	Kathmandu	Bagmati Province
c42f1a25-0cb8-49f1-b74b-b81f70daec8f	5466069996	Newa Kathmandu Momo	28.2125486	83.9757512	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.863+05:45	Gahan Marg -1	Sugam Gahan Tol	Pokhara	Gandaki Province
1838e64e-4838-4508-b19f-47872c52db2c	5475068596	Lake City Hotel	28.1640355	84.0565742	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.866+05:45	Prithvi Highway	Bhandardik	Pokhara	Gandaki Province
a6584cd2-1c10-45f5-8bbb-3c6f1e7b265e	5468897660	Bhandari Restaurant	28.147993800000002	84.0810306	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.863+05:45	F164	Dahar Chok	Pokhara	Gandaki Province
603e57ac-e024-4860-8daa-c0a93898186a	3081212890	Majheri Restaurant	27.698885200000003	85.3440254	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.751+05:45	Bhimsen Gola Marg	Naya Baneshwar	Kathmandu	Bagmati Province
1e8924a1-8a0c-4f0c-b25a-a58495db1486	9867934018	Chiya Chuskee	27.730163800000003	85.34808740000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.045+05:45	Sir Raj Bahadur Road	Ananda Nagar	Kathmandu	Bagmati Province
3cabf332-55a1-44f4-ac30-b38e1f285518	9873831518	Maltaa Restaurant	27.6722162	85.28133430000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.045+05:45	Town Planning Road	Bhajangal	Kathmandu	Bagmati Province
e5c759ff-cffc-4b1d-bc4a-3e2bdee57641	9947386219	Creeper World	27.714006100000002	85.3535473	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.052+05:45	Baudhadwar Marg	Kumarigal	Kathmandu	Bagmati Province
334607ec-7eb2-42df-8233-6be9c2fbe5e3	9947386326	Saathi Bhai Momo Center	27.714975900000002	85.3507227	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.052+05:45	Tushal Marg	Maiju Bahal	Kathmandu	Bagmati Province
a0dab561-f981-4df7-b148-7fc6d21ae19b	9950476918	Times Square	27.7226822	85.3313239	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.053+05:45	Thirbam Sadak	Kirtan Chok	Kathmandu	Bagmati Province
9c10bc72-0fd7-4368-96e3-d95e951b636c	9950479917	Capital Food Cafe	27.7181597	85.3190378	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.053+05:45	Uttar Dhoka Road	Kailash Chok	Kathmandu	Bagmati Province
3c36d1e4-897f-432c-95a4-6539b27dfbf3	9950699117	Bills N Spices	27.721196900000002	85.328074	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.053+05:45	Shubarna Shamsher Road	Jor Pipal	Kathmandu	Bagmati Province
80f84527-a9f4-490f-98a2-e884212be90b	9702816493	Bukeba Cafe	27.683493000000002	85.3128823	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.962+05:45	Maitri Marg (Bakhundole)	Bakhundol	Lalitpur	Bagmati Province
b9fe7a4d-ad97-4a59-8cb7-f7be9225d7dc	9702820735	Korean Plaza Family Restaurant	27.680235800000002	85.3100429	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.962+05:45	Bakhundol	Arun Thapa Murti Chowk	Lalitpur	Bagmati Province
f1d92bf4-2b42-49c7-9fc7-c9a6cf24a12a	3521349645	Love Kush	28.2060485	83.960604	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.778+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
648e7796-9d40-4896-aa0c-1e9b6f2df4f0	9708690736	Ours Resturant And Cafe	27.681027200000003	85.2792886	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.963+05:45	Way To Naya Bazaar	Chi-ba-hah	Kathmandu	Bagmati Province
6eed1239-2f01-4d4c-a92f-6b743e795e0e	3521349650	Pokhara Thakali Kitchen	28.205883500000002	83.9616266	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.779+05:45	7th Street,Shiva Marga	Baidam	Pokhara	Gandaki Province
2780895a-d92f-41a8-8e4b-e71dd5e13ea2	9719736184	Lumbini Tandoori Bhojnalaya	27.6749383	85.27694670000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.966+05:45	Kirtipur Ring Road	Khahsi bazar	Kathmandu	Bagmati Province
9f2605b3-c92b-45c1-9b1f-6988763ae545	9719747143	Homasha Dharane Kalo Bungur Seluwa Corner	27.672627300000002	85.2736338	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.966+05:45	Pushpalal Marg	San-la	Kathmandu	Bagmati Province
849d6d7c-b807-4613-8fc0-a228ee2bc127	3508175183	Shreega Cafe	27.7096798	85.3100636	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.778+05:45	Naghala Kyado Galli	Tahiti	Kathmandu	Bagmati Province
13daeba1-a0d6-4774-9a3d-bdf406b88807	9529684923	Yummy Restaurant	27.703475	85.31150000000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.945+05:45	New Road	\N	Kathmandu	Bagmati Province
c428fd2c-d26b-45bf-92dd-fca78224b92f	4180456603	Shanti Restaurant	28.2136056	83.959067	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.8+05:45	Baidam Road	Baidam	Pokhara	Gandaki Province
1c685d92-905d-4d55-b04f-5765c7d0db7f	4198396491	Sabrina	27.7333341	85.33808040000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.801+05:45	Indramaya Marg	Chundevi	Kathmandu	Bagmati Province
16ee368f-3e8c-4a8f-a0a6-36065554607e	3635819238	Once Upon a Time	28.210346	83.9571907	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.782+05:45	Baidam Road	Baidam	Pokhara	Gandaki Province
a5c44d48-17b3-4da3-8ccc-5fd916cbb273	11939975787	Chicken Station	27.678304400000002	85.4407503	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.159+05:45	F28	Ratopati	Bhaktapur	Bagmati Province
36540aef-5e72-444f-b934-1efa12b6ecd7	3560031334	Meeting spot	27.6900693	85.33458180000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.779+05:45	ChhakkuBakku Marg	Bogati Tol	Kathmandu	Bagmati Province
2a2b0790-c7db-400b-9ff5-feea3a064c6e	3637654244	Dragon	28.210125700000003	83.9568127	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.782+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
489ab442-13ff-4568-a565-56ca9d0707a8	3775085169	quality kitchen resturant	27.7039371	85.3329753	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.787+05:45	Dillibazaar Marg	Ghattekulo	Kathmandu	Bagmati Province
63536e5c-15db-4d6b-8fac-7fa7ca55ba7d	9722237633	Sabita kirana tadha chiya pasal	27.6607649	85.2593319	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.968+05:45	Pushpalal Marg	Naya Naikap	Kathmandu	Bagmati Province
8a114abc-f0b9-451a-b959-47b82197a01a	9722253664	Gulmeli khaja and momo house	27.6687304	85.26895130000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.968+05:45	Pushpalal Marg	San-la	Kathmandu	Bagmati Province
33ec210c-d07e-4ff4-ac23-2454cf768278	9722434583	Didi ko Khaja Ghat	27.667353000000002	85.2671351	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.969+05:45	Pushpalal Marg	San-la	Kathmandu	Bagmati Province
ccd0d2b9-0a29-4e90-8c43-57bbf9a80c95	9724496374	RR Taudaha View Point	27.649778700000002	85.28098	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.971+05:45	Dakchhinkali Road	Taudaha	Kathmandu	Bagmati Province
76aa1f48-669d-435e-9f4b-9e61df63ff84	3811339823	Chamunda Sweets	27.7216102	85.3720947	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.788+05:45	Chabhil-Baudha-Jorpati Sadak	Sundar Tole	Kathmandu	Bagmati Province
646828b3-0ee0-4d88-8c11-89ff841ff7c2	4155181491	Green hut	27.7056037	85.34219680000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.792+05:45	Ram Chandra Marg	Pipple Bot	Kathmandu	Bagmati Province
4850803d-67b5-4e8b-85e8-1b66dfe3a439	9724497669	Happy Hot Restaurant	27.659174	85.29305000000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.971+05:45	Manjushree park outside Stairs	Chobhar	Kathmandu	Bagmati Province
af774ee8-01fa-42f3-86d1-6c2f98d2a45a	9724497662	Sumitra Khaja Pasal	27.6629517	85.28833150000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.971+05:45	Ekalpati to Bhajangal Road	Samocha	Kathmandu	Bagmati Province
1255bf93-607f-46d0-a064-d2458f5a941a	9724497663	Boman  Restaurant And Bar	27.6622816	85.2887053	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.971+05:45	Ekalpati to Bhajangal Road	Samocha	Kathmandu	Bagmati Province
69fa9467-3bff-4f31-bd45-d5389a469f9a	9724507893	Taudaha Universal Cafe And Banquet	27.649088600000002	85.2790243	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.971+05:45	Dakchhinkali Road	Taudaha	Kathmandu	Bagmati Province
ceeb8094-dcb9-4507-b703-e75229c53edb	9967127810	Bulbuley Tandhuri Bhojanayala	27.7015558	85.3220745	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.058+05:45	Exhibition Road	Baghbazar	Kathmandu	Bagmati Province
b555e333-8dfd-4603-9c36-6c606c7cc852	10009476891	Gulmi Guest House	27.735281200000003	85.3104783	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.075+05:45	Kathmandu Ringroad	Gongabu	Kathmandu	Bagmati Province
730ea7bf-6dc5-4a66-baf1-80389b9fa824	4361366702	Mandro Dohari Sanjh	28.224215200000003	83.98630530000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.809+05:45	Chipledhunga	\N	Pokhara	Gandaki Province
dbe31054-0e0f-4629-aaea-ce80df24a53a	4387030502	Kathmandu Steak House Restaurant	27.713667	85.3103045	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.811+05:45	J.P. School Road	Paknajol	Kathmandu	Bagmati Province
27aada57-1f89-4dd7-a6e9-19ce37e3999f	4385012426	Momo House	28.223018800000002	83.98875100000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.811+05:45	Deurali Galli	Chipledhunga	Pokhara	Gandaki Province
8ed4a5e7-d9d4-4d6a-95e0-91144a4e46ff	10009601904	Las Kush Newari Restaurant	27.735938100000002	85.3108177	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.076+05:45	Buddha Marga	Deepjyoti	Kathmandu	Bagmati Province
3a3b1049-d413-4ad6-b4dc-f68c56b5b67f	10009601911	Rapti Top Choice Guest House And Restaraunt	27.736173500000003	85.3109503	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.076+05:45	Buddha Marga	Deepjyoti	Kathmandu	Bagmati Province
a7757635-8f27-4643-8ce3-e7300ccf77a0	10009628519	CFC Cafe	27.7362988	85.3111854	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.076+05:45	Buddha Marga	Deepjyoti	Kathmandu	Bagmati Province
781578d5-da05-474b-bd83-9c600f349325	4764302326	Prego Bakery Cafe	27.731642700000002	85.344813	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.823+05:45	Kathmandu Ringroad	Anandanagar	Kathmandu	Bagmati Province
70837f6d-9690-4ec4-a478-60fff75dfd91	4764302327	Cactus Cafe	27.7316772	85.3447795	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.824+05:45	Golfutar Residential Road	Rudramati Chowk	Kathmandu	Bagmati Province
bad16aca-d79a-40c5-bead-4311e9a9d3d5	4198412290	Patan Yala Newa Khaja	27.7512222	85.3605404	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.801+05:45	Shanti Ram Chowk Road	\N	Kathmandu	Bagmati Province
f1ca613f-9da5-4952-8f45-b925775e5c04	4192759890	Gurung Cafe	28.213361300000003	83.9844752	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.801+05:45	Bhakti Marg	\N	Pokhara	Gandaki Province
6ce25ad7-c5ff-4829-b57d-f5eb039352bb	4225192794	Namuna Dohori Sanjh	28.205495300000003	83.99954220000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.804+05:45	Shanti Path	Machhapuchchhre Tol	Pokhara	Gandaki Province
1c8141e5-196f-48d7-81a5-b10b74e7a5ff	4226595889	Fresh Farms	27.7462905	85.35284490000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.804+05:45	Santa Srijana Marga	Baluwakhani Chok	Kathmandu	Bagmati Province
b70f074e-3b18-4151-b949-bc44903097ab	9969484791	K Family And Resturant	27.703210900000002	85.3214591	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.063+05:45	Adwait Marg	Baghbazar	Kathmandu	Bagmati Province
a44e42ef-b6ee-4354-96a0-7b8ef8a327ed	10011219617	Dhaulagiri Lumbini Tandoori Restaurant	27.7369756	85.3084785	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.082+05:45	Kulanta Marga	Deepjyoti	Kathmandu	Bagmati Province
19eb507e-933f-4c8e-bf7f-91e966a7c2a6	10011219639	Daju Bhai Sekuwa Sukuti and Tongba Corner	27.736446	85.30802220000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.082+05:45	Buspark Bisnumati corridor	Deepjyoti	Kathmandu	Bagmati Province
322a84e2-0def-4b7b-bfd9-0cbd269d7f4b	10011219675	Snooker Cafe	27.7354999	85.3076783	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.082+05:45	Buspark Bisnumati corridor	Deepjyoti	Kathmandu	Bagmati Province
ea76eb69-b7aa-4213-be69-dfc6d008f86d	10015272306	DEVIKA CHATPATE AND PANIPURI	27.740704	85.32697900000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.094+05:45	Kathmandu Ringroad	Tokha	Kathmandu	Bagmati Province
d27573b9-0eee-4b1f-a7c5-22f1f873ceff	10015272309	RAPTI BHERI BHOJANAAYA	27.7406703	85.3269142	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.094+05:45	Kathmandu Ringroad	Tokha	Kathmandu	Bagmati Province
07091ce5-a7fb-4e0b-ae63-32421f20ee6c	10015272311	BIMLU SWEET AND CHAT HOUSE	27.740645500000003	85.32688110000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.094+05:45	Kathmandu Ringroad	Tokha	Kathmandu	Bagmati Province
77f8c7cb-ae5e-4fa4-916e-e082e4442104	10015272315	AATITHI DEVO BHAWA	27.740516600000003	85.32668860000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.094+05:45	Kathmandu Ringroad	Tokha	Kathmandu	Bagmati Province
2d57ab0f-c8be-4aec-bf73-85b18ec30158	10015291520	SUJAN FAST FOOD	27.740472	85.3262838	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.094+05:45	Kathmandu Ringroad	Tokha	Kathmandu	Bagmati Province
c23434a4-007a-476c-b2c1-bf058c494e03	10015341375	FRIENDSHIP CAFE	27.7427664	85.3310644	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.094+05:45	Shreetol Marg	Tokha	Kathmandu	Bagmati Province
24bd9a48-e549-4ac2-8f9f-8b26c40aebac	10015341395	TAPARI MOMO STATION	27.7435724	85.3319989	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.094+05:45	Shreetol Marg	Tokha	Kathmandu	Bagmati Province
af6df4a5-7b87-4e6d-9f17-816e9ebc44dc	10015421394	Golden Spoon Restaurant and Sekuwa Corner	27.7525128	85.3267373	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.095+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
30d5186f-f8cf-4744-ba5f-4937e3082d69	10015421401	Green chilly Restaurant and Cafe	27.7523017	85.3265863	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.095+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
676a346e-d11c-44b7-bd0f-bd58c7c9e8b0	10015458554	ZORBAS Bakery and Cafe	27.755845800000003	85.32758390000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.095+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
21afb0af-6781-4f71-9700-6ac7fa3a79ee	10015534513	Nuwakot Bhairabhi Sweet and Chat House	27.750071300000002	85.3162094	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.096+05:45	Indrayani Bridge	Baniyatar	Kathmandu	Bagmati Province
d703f55f-90c2-4b9b-8da3-b111a574e390	10015534543	Indreni fast Food and Sekuwa Corner	27.750691600000003	85.31671490000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.096+05:45	Indrayani Bridge	Baniyatar	Kathmandu	Bagmati Province
87d8e091-f724-4179-b980-c2257adf3387	10015534578	Top Stick Food and Momo Magic	27.747718300000003	85.3155504	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.096+05:45	Sayapatrinagar	Baniyatar	Kathmandu	Bagmati Province
dccde83c-4936-47bd-85f7-fda27b15a305	10015712723	dari Bhai ko Cafe	27.754540600000002	85.3172614	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.097+05:45	Dhaulagiri Tole	Tarakeshwar	Kathmandu	Bagmati Province
c6bd3642-dd1a-4b78-a051-8cbb5580e87e	10015712728	A One Special Tapari Momo	27.751720600000002	85.316748	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.097+05:45	F81	Baluwapati Chowk	Kathmandu	Bagmati Province
56084f95-a5ff-4fb7-be51-842357dca2c4	10015712734	Manakamana Bhojanalaya and Sekuwa Corner	27.754599300000002	85.3196908	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.097+05:45	F81	Baluwapati Chowk	Kathmandu	Bagmati Province
08e8733e-7393-4a8c-a871-3454a2b187aa	10015712752	Red Chilles	27.753662600000002	85.3187073	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.097+05:45	F81	Baluwapati Chowk	Kathmandu	Bagmati Province
2593e886-1b63-4f67-89c3-5340fb8bf97c	4231570889	Himalaya Garden	28.224093800000002	83.98912560000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.804+05:45	Chipledhunga	\N	Pokhara	Gandaki Province
a564f0cc-525e-40b9-88bc-6556a03a467b	4237372093	Europa	28.2204249	83.95770320000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.804+05:45	40DR012	\N	Pokhara	Gandaki Province
71374176-0de5-4268-a11d-fa812f2ff67f	10011219685	Fresh Top Quality Momo	27.735478500000003	85.30788410000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.082+05:45	Kathmandu Ringroad	Gongabu	Kathmandu	Bagmati Province
246b1551-da1a-4a55-9e16-f93170f7870d	4250466798	Bliss Raw cafe	27.722249700000003	85.36237530000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.805+05:45	Phulbari street	Dhara Tole	Kathmandu	Bagmati Province
66d41348-c335-4e25-8f62-b691ec628185	4251906190	Lion Heart Tandoori Kitchen	27.7084723	85.3220184	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.805+05:45	Charbhurja Marg	Kamalpokhari	Kathmandu	Bagmati Province
b35c7980-1a91-4d7f-8082-6fd99e955ee1	5436689021	Sishir Coffee Shop	28.2212955	83.95593840000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.859+05:45	40DR012	\N	Pokhara	Gandaki Province
e5797f3b-e183-4d5d-86c1-8ad94afd1332	4249962896	Avocado restaurant and bar	27.7279692	85.3240863	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.805+05:45	Lazimpat Sadak	Narayan Tole	Kathmandu	Bagmati Province
2bf83871-fcd2-45b3-b368-c03455e96558	10034056074	Hamro Machhapuchhre Guest House	27.7346253	85.311845	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.107+05:45	Birendra Aishwarya Marg	Gongabu	Kathmandu	Bagmati Province
ea646f86-2a28-4c25-a1d0-040776478d93	10016159280	JJ resturant and cafe	27.744571500000003	85.3165678	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.098+05:45	F81	Tokha	Kathmandu	Bagmati Province
d09038ab-9a1b-416f-b6a9-d8ffdbc6dd7e	10016195945	Trishuli Tapari Momo	27.7476047	85.3181905	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.099+05:45	F81	Baluwapati Chowk	Kathmandu	Bagmati Province
1d522255-a4a1-4b09-8666-c93bf83d0cf4	10016234239	The Burger House and Crunchy Fried Chicken	27.756580200000002	85.3170458	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.099+05:45	Dhaulagiri Tole	Tarakeshwar	Kathmandu	Bagmati Province
252a28a5-18ab-4915-9641-4c11c380dac0	10017278849	EG Burger House	27.7388204	85.3258471	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.103+05:45	Kathmandu Ringroad	Tokha	Kathmandu	Bagmati Province
315c52eb-6a38-4b10-a66e-3c93cd6d623f	10017278864	Gurung Solti Ko Bhojanalaya	27.7403067	85.3282672	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.104+05:45	Kathmandu Ringroad	Tokha	Kathmandu	Bagmati Province
16733ebf-bc20-45b9-9d71-a29eb6c70b0a	10034071017	Tenjing Sherpa Restaurant	27.742480500000003	85.33165460000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.107+05:45	Shreetol Marg	Tokha	Kathmandu	Bagmati Province
ba385150-2752-41b6-b8aa-0f1bc75a3a72	10056130441	Mahim Cafe	27.6799843	85.38656900000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.112+05:45	Purano Thimi- Naya Thimi	\N	Bhaktapur	Bagmati Province
d6694b5c-01c3-4018-80d1-523dea315048	10035659746	Hoviz Cafe and Restaurant	27.7445865	85.3332262	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.107+05:45	Dhapasi Marg	Tokha	Kathmandu	Bagmati Province
69b56988-f03b-4c0f-aa9f-5b813591991c	10035659763	TNT cafe and Kitchen	27.742333900000002	85.33381580000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.107+05:45	Dhapasi Marg	Tokha	Kathmandu	Bagmati Province
b4fa4746-eab9-4a12-911d-2dd5b35f53b7	10035798502	Lokpriye Lumbini Tandoori Bhojanalya And Restaurant	27.7384258	85.3250742	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.108+05:45	Kathmandu Ringroad	Tokha	Kathmandu	Bagmati Province
b7904031-9f74-4679-bada-34f180162150	10056130457	New Crystal Street Food	27.680082300000002	85.3861217	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.112+05:45	Purano Thimi- Naya Thimi	\N	Bhaktapur	Bagmati Province
5acafa0d-abac-4dd9-930f-57d1f99de2b1	10055069506	Ujjwal Dairy Shop	27.6755627	85.3609577	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.112+05:45	Lokanthali To Sano Thimi	sachet marga tole	Bhaktapur	Bagmati Province
63a9585d-4ee2-442d-99fc-44f2daed2413	4262060745	Chimeki Garden Resturant and Bar	28.204673200000002	83.9994199	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.806+05:45	Kamana Marg	Kalika Chok	Pokhara	Gandaki Province
0b06c975-3375-4e73-a8f3-d424d959e1f1	7276669086	Rainbow Restaurant and Sekuwa Garden	27.674906500000002	85.3150956	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.913+05:45	Jwalakhel to Pulchowk Road	Dhobighat	Lalitpur	Bagmati Province
493174aa-09ce-43d6-8189-dd7ef28c1b93	9724529517	Bishwa Shanti Varieties And Cold Store	27.662413800000003	85.2878072	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.972+05:45	Ekalpati to Bhajangal Road	Samocha	Kathmandu	Bagmati Province
18aba8bd-0fa0-45ed-968e-520bfc01ff7d	10036515893	Pandey Lumbini tanduri Bhojanalaya	27.7350947	85.31029330000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.109+05:45	Kathmandu Ringroad	Gongabu	Kathmandu	Bagmati Province
3273bf1e-91b9-456f-a809-2fce76c03cbd	9933906817	Red Mud Coffee	27.7166208	85.35450510000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.05+05:45	Tushal Marg	Maiju Bahal	Kathmandu	Bagmati Province
c12accf6-add9-4e32-b80e-e1627525b1e7	10036516735	Shrestha Fast Food	27.7352364	85.3091876	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.109+05:45	Kathmandu Ringroad	Gongabu	Kathmandu	Bagmati Province
bb5f6ee5-8872-4f71-b236-50c831266c29	4251906090	Royal Food Cafe	27.6964469	85.3549651	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.805+05:45	Kathmandu Ringroad	Sinamangal	Kathmandu	Bagmati Province
4e5e20bc-8630-4dcf-a0c6-4c38e89d1e52	10016135262	Tumiro Dharane Sekuwa Corner	27.760553700000003	85.31807810000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.098+05:45	NH38	\N	Kathmandu	Bagmati Province
fca0d6c5-fc30-41cf-9c7a-4c0d70d2a238	4361366710	kailash hotel	28.224029700000003	83.9895716	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.809+05:45	Chipledhunga	\N	Pokhara	Gandaki Province
094dac66-e6cf-4c35-b299-cee2505feca9	4362710095	Boudha Ajima Garden	27.7184294	85.3598692	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.809+05:45	Baudhadwar Marg	Pati Tar	Kathmandu	Bagmati Province
de857de8-4013-4fd9-8576-169c3b9a32bd	4361366713	Marwadi Bhojanalaya	28.2238511	83.9905524	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.809+05:45	Chipledhunga	\N	Pokhara	Gandaki Province
a879077c-8375-4d87-88eb-90660b1bbee0	4582140891	The Lemon Tree	28.211506600000003	83.9572814	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.819+05:45	Lakeside Road	Baidam	Pokhara	Gandaki Province
54374bb3-86cd-430c-a29e-b39f9d780bdb	4585505182	Cross Road Restaurant	27.7175395	85.3055381	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.819+05:45	Pushpalal Path;Swoyanbhu Marg	Sorakhutte	Kathmandu	Bagmati Province
8017e8eb-8456-42b2-a324-c62a0b893d64	4582838789	Gilingche Tibetan Restaurant	27.7153782	85.3114353	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.819+05:45	Thamel Marg	Lut Chok	Kathmandu	Bagmati Province
c9e5a9c8-9458-43d6-b3b7-6e19a3272bcd	4603174748	Gita Hotel	28.2428162	83.9841042	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.819+05:45	Pokhara Baglung Highway	Hari Chok	Pokhara	Gandaki Province
258d4d46-9524-4c06-8cee-821e5efecbe7	4774742129	Chicken Station Kumaripati	27.671335000000003	85.3192009	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.825+05:45	Kumari Marga	Itapukhu	Lalitpur	Bagmati Province
d532f9ac-3142-47e2-8494-b5589dd26407	4782221318	Sweet Memories	28.2147787	83.9582953	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.825+05:45	18th Street	Baidam	Pokhara	Gandaki Province
801ea9ec-4d31-484f-84e7-723457e48690	4784129821	High Tide	28.210582300000002	83.9558506	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.825+05:45	Fewa Walkway	Baidam	Pokhara	Gandaki Province
6b235bc3-8a66-41f9-a5b6-3c5e6c467abd	4766590825	Namaste Lumbini	27.676015600000003	85.3159002	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.824+05:45	Jwalakhel to Pulchowk Road	Dhobighat	Lalitpur	Bagmati Province
86c62f1b-26e4-4ebd-bcae-1800c14a4ca1	4791229866	The China Town	28.2118448	83.9570094	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.827+05:45	Baidam Road	Baidam	Pokhara	Gandaki Province
508f4d29-e7d7-479c-899b-4f6dfc0d216a	4791262039	Marpha Thakali Kitchen	28.211547600000003	83.9572579	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.827+05:45	Lakeside Road	Baidam	Pokhara	Gandaki Province
3381090e-be41-4cc4-bb7c-18ecd5516da6	4791299376	Anisha Resturant	28.206529200000002	83.9621596	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.827+05:45	7th Street, Shiva Marga	Baidam	Pokhara	Gandaki Province
71d390a0-a2dc-469d-8e92-59ac54674db2	4791306597	Emon Cafe	28.2109108	83.9570367	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.827+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
fc879bfb-7c6b-420a-aa07-14fe509f705e	4832255423	Dalle	27.677346600000003	85.31668690000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.831+05:45	Pulchowk Road	Pulchowk	Lalitpur	Bagmati Province
b8f5196f-da1c-4e76-9c6d-3b4f0e177054	4833003722	The Loft Lounge	27.690579600000003	85.3362431	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.831+05:45	Old Baneshwor Road	Bogati Tol	Kathmandu	Bagmati Province
b1655cb2-eb60-44d1-9c3e-7f81d6a9e7f1	5015642503	Shubham Restaurant and Fast Food	27.7390383	85.34904420000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.837+05:45	Golfutar Residential Road	Golphutar	Kathmandu	Bagmati Province
4b653605-a9a9-4c4b-97e2-accf4bd1e15f	5016140921	The Zanzibar Reataurant	27.710492600000002	85.31770510000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.837+05:45	Durbar Marg	Kamalpokhari	Kathmandu	Bagmati Province
cb2801a0-4989-40f4-92fe-960c43dae67b	5024646736	Ventures Cafe	27.726159000000003	85.3310618	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.837+05:45	Embassy Marg	Kiran Chok	Kathmandu	Bagmati Province
891cb7c8-a515-463a-b23e-dba0785a7606	5094291071	doban resturants	27.727996700000002	85.31499550000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.839+05:45	Rom Marg	Gongabu	Kathmandu	Bagmati Province
81df2574-aecd-4854-b8c8-0e6692493968	5094291072	Samrat garden restaurant	27.728161	85.3148891	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.839+05:45	Ranibari Marg	Gongabu	Kathmandu	Bagmati Province
806ab53e-5533-4ad6-a692-683a67bfcd7a	5103596989	Malla Brothers Naan House and Restuarant	28.207407500000002	83.96575630000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.84+05:45	Thadopasal path	Baidam	Pokhara	Gandaki Province
1d8b4095-f534-41f2-a16b-bb4ef431287f	5103624554	Tibetan Restaurant	28.208287600000002	83.96628770000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.841+05:45	Gauri Khet marg	Baidam	Pokhara	Gandaki Province
7247c256-4543-4e4b-ac4d-124fb6988e52	5103631607	Mongolian China	28.2074192	83.9682289	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.841+05:45	Street 46 (Dristi marg)	Baidam	Pokhara	Gandaki Province
111026ab-7ab5-4ce8-8078-a8468b2fcfbb	5147935512	Donpo restaurant	27.7235833	85.3083039	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.843+05:45	Nirmal Lama Marg	Balaju	Kathmandu	Bagmati Province
418c69c0-63d1-44e8-9dd8-9ea0cd87c96e	5171143921	Palpasa Coffee	27.711991400000002	85.30966790000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.845+05:45	J.P. Road	Paknajol	Kathmandu	Bagmati Province
1856e924-fa17-49a8-bf74-8b8c6134efac	5144727967	Pho 99	27.7209882	85.36165720000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.843+05:45	Chabhil-Baudha-Jorpati Sadak	Tusal	Kathmandu	Bagmati Province
54468e9b-76b8-444c-bfce-90296fae4496	5165068225	Bajeko Machha Mahal	28.2129234	83.97370210000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.844+05:45	Bishal Marg	Zero Kilometer	Pokhara	Gandaki Province
1b06943b-e7b4-4de0-80cb-e0a792aa0932	5175879624	Cafe Pashupati	27.710055800000003	85.34940560000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.846+05:45	Pashupati Sadak	Kumarigal	Kathmandu	Bagmati Province
0fc4802f-4d92-46a6-b4c7-3e5e748f4e54	5331658970	Nepabeanz	27.6870772	85.3115872	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.855+05:45	Sanepa marg	Bakhundol	Lalitpur	Bagmati Province
0b424abd-8f02-4656-902d-8c21aa530b18	5367652206	Amigo cafe	27.688661300000003	85.33539710000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.855+05:45	Naya Baneshwar Sadak	Bogati Tol	Kathmandu	Bagmati Province
7413d435-3f90-423e-8015-e9ce46dc7fb2	5371707222	Gangnam Galbi Barbeque	27.7131468	85.321201	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.856+05:45	Lal Colony Marga	Kamalpokhari	Kathmandu	Bagmati Province
55e6c9a2-68bc-45c1-98bf-619fe146e82e	5459366047	Anushka Sapkota Fast Food and Restaurant	28.189662100000003	83.97368920000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.862+05:45	Shishuniketan Marg	Birauta chowk	Pokhara	Gandaki Province
fa4b25e8-519e-4149-801d-89911a2ece10	5459366079	Momo Restaurant	28.1884316	83.97571160000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.862+05:45	Shishuniketan Marg	Birauta chowk	Pokhara	Gandaki Province
3484f802-6f3e-43ac-95be-fb51d290b4cc	5461845322	Prem Cold Shop	28.191334700000002	83.9529189	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.862+05:45	Siddhartha Highway	Tashiling Tibetan Refugee Camp	Pokhara	Gandaki Province
eebee8ef-11e5-4a12-b70b-4454b6a698d7	5462090243	Dragon Tibetan Momo	28.1893129	83.95738490000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.862+05:45	40DR016	Belghari	Pokhara	Gandaki Province
f13ebfc0-9164-4520-9e88-c918e1d18525	5472153415	Momo Restaurant	28.177391900000003	83.9905483	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.865+05:45	Bagmara Road	\N	Pokhara	Gandaki Province
6fa71dfa-cde7-451c-b35a-17b552e7ccf0	5472159277	Asko Cold Stores	28.189401500000002	83.96123770000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.865+05:45	Siddhartha Highway	Om Shanti Chok	Pokhara	Gandaki Province
b1d9b7ba-e170-4740-9b2f-15c051f5acf6	5474526726	Sunrise and Mountain View Point	28.2435268	83.9575021	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.866+05:45	Thapa Marg	\N	Pokhara	Gandaki Province
9c5861f8-52ad-4242-8938-873be665b4e0	5474526729	Sarangkot Fordays Restaurant	28.2440727	83.9569348	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.866+05:45	Thapa Marg	\N	Pokhara	Gandaki Province
571d3fb3-8b7f-4581-9f01-188a14d4b51d	5474526730	Base Top Lodge and Resturent	28.2440207	83.9565244	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.866+05:45	Thapa Marg	\N	Pokhara	Gandaki Province
dddd4cbe-60a8-4f0e-998c-0f78efd7aa25	5474497987	Himalaya View Guest House and Restaurant	28.2449119	83.95073980000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.866+05:45	Take Off Road	Garjati	Pokhara	Gandaki Province
d8b6b74f-43fc-453d-8fbd-c4578e4b4df2	5477836368	Chitiz Resturent	28.242356200000003	83.9791319	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.867+05:45	Thapa Marg	\N	Pokhara	Gandaki Province
84a6526b-f0ae-4656-9349-5142afda635a	5477468115	Crony Cottage Lodge and Resturent	28.2451259	83.947761	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.867+05:45	Main Street	Garjati	Pokhara	Gandaki Province
60758334-850e-4941-ae7b-0bc5d78c4625	5477470323	Triple View Lodge and Resturent	28.246332700000004	83.9468068	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.867+05:45	Main Street	Garjati	Pokhara	Gandaki Province
8a2e8a80-c5e5-4720-9e21-380072ba9c57	5477729141	Aarati Cold Store	28.2511504	83.9424133	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.867+05:45	Thapa Street	Garjati	Pokhara	Gandaki Province
33316ba7-e384-4d42-b2c7-5e3b8d6d88de	5481883904	Han Kook Sarang restaurant	28.211130400000002	83.9573586	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.868+05:45	Lakeside Road	Baidam	Pokhara	Gandaki Province
6372e69b-ee93-4b49-9f5b-cf01d5917499	5482683037	Sedi View Restaurant	28.223379	83.9525534	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.868+05:45	40DR012	\N	Pokhara	Gandaki Province
d585cbca-d373-450a-9723-45eb817e0271	5484691456	Paradise Lake Resturent	28.2231746	83.9528458	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.868+05:45	40DR012	\N	Pokhara	Gandaki Province
6f47755a-6055-43ee-9554-860a81c33607	5488344446	Memorial Lake View Resturent and Lodge	28.2328614	83.9225931	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.869+05:45	40DR012	Bhakunde	Pokhara	Gandaki Province
b9a28dcb-0ae5-433d-b711-e9cdb3c01470	5490625872	Bhakunde Lodge and Resturent	28.2334144	83.92984050000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.869+05:45	40DR012	Bhakunde	Pokhara	Gandaki Province
e1c43d4f-3f60-41e0-a808-9d0621f6ff4d	10007391241	Center Point Restraunt Baglung	27.7550738	85.3233421	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.073+05:45	Grande Road	\N	Kathmandu	Bagmati Province
275e0a51-3a58-4e29-ac3f-5e82c876d547	5507669676	local Mo Mo	28.2141865	83.9568624	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.871+05:45	Camping Chok Road	Baidam	Pokhara	Gandaki Province
41cece6b-336d-44a7-800f-0f7a69ca88dd	5508748322	Newari Bhoj	28.2124293	83.9842789	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.871+05:45	Lekhnath Marg	\N	Pokhara	Gandaki Province
e0cabb53-7958-4ceb-9d1a-a3b60145feac	5508748345	Delight Restaurant	28.2145733	83.9855538	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.871+05:45	New Road	\N	Pokhara	Gandaki Province
26f45a31-0e5b-4a19-8e6d-8c75ffc19978	5511933099	Sainbu Green Village Restro	27.650386800000003	85.2992663	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.872+05:45	Jal Binayak Marg	Sainbu	Lalitpur	Bagmati Province
f15e8ca8-2ff0-4afd-b133-100f9e4d7711	5513635485	Buddhi Home Holiday Cafe	28.214486700000002	83.95786550000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.872+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
d773593f-96bf-4b72-a3a6-65124e7ebf9e	5515336793	Desire Menu and Restaurant	28.164494800000003	84.0693123	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.872+05:45	Dadakonaak Sisuwa Sadak	\N	Pokhara	Gandaki Province
47558fee-a561-4c7b-b5ac-dd2bcacd1d2f	10121424411	Blessing Food Center and Staff Bhojanalaya	27.6768888	85.34415750000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.122+05:45	SOS Marga	Seti O.P.	Kathmandu	Bagmati Province
a4405e3f-ea84-41e7-bf3e-935b3849722c	9969484820	Tuki Jhol Resturant	27.703221900000003	85.32006460000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.063+05:45	Adwait Marg	Baghbazar	Kathmandu	Bagmati Province
2a71061c-3ef1-46bf-89c2-6593447c07f6	5521786639	Sano Chautarii Hotel And Restaurant	28.1942719	83.99042220000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.874+05:45	Annapurna Marg	Hariyali Marga	Pokhara	Gandaki Province
45c6d235-04c1-4eb0-a011-6edc2394ba2b	5521786644	Gaun Sahar Restaurant	28.196322100000003	83.99106060000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.874+05:45	Annapurna Marg	St. Mary Chowk	Pokhara	Gandaki Province
c7e09a4c-fccd-4b70-81d0-0ff547d7fd6e	5525019671	Parbat Sagar Bhojanalaya	28.2340814	83.99812150000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.874+05:45	40DR014	\N	Pokhara	Gandaki Province
352be132-c135-4c11-9700-b3732bbde000	10121388733	Hardik Restaurant and Sekuwa Corner	27.6789825	85.3356665	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.117+05:45	Janata Marg	Sahayogi Nagar	Kathmandu	Bagmati Province
40c9829c-f19a-47b0-b90c-3c4cbe4dc25e	10121388737	Dakshinkali Stick Food	27.6789878	85.33526690000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.117+05:45	Janata Marg	Thulodhara	Kathmandu	Bagmati Province
d09b7c4f-b940-4350-9c66-585a0ae52b87	10121388741	Pork Station	27.6781191	85.33537390000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.117+05:45	Janata Marg	Thulodhara	Kathmandu	Bagmati Province
ecebc15b-471f-4bc8-a09a-627016d08e2b	10121424463	Corner Food Cafe	27.680924100000002	85.3400783	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.122+05:45	Sahayogi Nagar Marg	Thulodhara	Kathmandu	Bagmati Province
9a897397-9093-41d0-be8f-ecad940a4015	9642767690	Aarohi Fast Food And Cafe	27.661499000000003	85.2782202	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.953+05:45	Charghare road	Da-na	Kathmandu	Bagmati Province
51c9f8f0-5436-46f0-9e25-847a3b23b1ae	9644725870	Momo pasal	27.6552624	85.2794202	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.953+05:45	Charghare road	Da-na	Kathmandu	Bagmati Province
d30b279e-d4d6-4a2f-b176-2baab0ccce23	10121542504	Mr Bhakka	27.6856806	85.3453554	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.126+05:45	Munibhairab Marg	Basuki Nagar	Kathmandu	Bagmati Province
19c1c9c2-5691-4a31-93ae-6737ffa23d35	10121542505	New Bhairav Lumbini Tandoori Fast Food And Bhojanalaya	27.6857043	85.345357	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.126+05:45	Munibhairab Marg	Basuki Nagar	Kathmandu	Bagmati Province
b1fede54-a5bb-4121-9320-6101f8f1399e	10121566039	New Everest Momo Center	27.678781400000002	85.33923100000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.126+05:45	Sahayogi Nagar Marg	Thulodhara	Kathmandu	Bagmati Province
ccd169ea-c547-4e72-ad2d-2ca190be4b88	10121566070	Doko Station	27.678890900000003	85.3353167	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.126+05:45	Buddha Galli	Thulodhara	Kathmandu	Bagmati Province
bac3f24f-3ddb-42a5-a213-d0a936e13826	10148712869	The Burger House and Crunchy Fried Chicken	27.6828143	85.38591050000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.129+05:45	F86	\N	Bhaktapur	Bagmati Province
315792c7-991a-4e60-a9b2-eaef41e5525b	10148831458	Madhyapur Dairy and Coffee Shop	27.6809112	85.38606940000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.129+05:45	Purano Thimi- Naya Thimi	\N	Bhaktapur	Bagmati Province
5490f533-e48d-49a8-9d03-df4aaf5720d1	10148831463	Vintage Tea House	27.6815175	85.3862733	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.13+05:45	Purano Thimi- Naya Thimi	\N	Bhaktapur	Bagmati Province
875f54f9-c528-4c1e-8804-4ac1e17cc35a	10591494760	jj	27.723760000000002	85.3755369	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.136+05:45	Shankarchowk Marg	Bensigaun	Kathmandu	Bagmati Province
51e8512b-764a-4d47-9fc4-3a7851fea668	10859818159	Lisawaa	27.674860300000002	85.3188574	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.142+05:45	Na Tole Marg Purba	\N	Lalitpur	Bagmati Province
51c2c64c-9827-47d2-989a-b244da2be6e4	10895308279	River View Restaurant	28.246750100000003	83.9699748	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.142+05:45	Thapa Marg	\N	Pokhara	Gandaki Province
705cae43-232f-4418-b5be-67bdccefb1d3	10845714905	Shine Cafe and Restro	28.219580500000003	83.9771881	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.142+05:45	Pokhara Baglung Highway	Dharapani	Pokhara	Gandaki Province
e8350760-8e04-4932-aba5-7b2bc8e51698	10959494676	Ajima Restro	27.7154737	85.2902815	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.142+05:45	bato	Dallu	Kathmandu	Bagmati Province
60eee170-1656-4989-b0fd-6b0bd8cebc84	11814760206	Naina Restaurant	28.192346200000003	83.97203850000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.152+05:45	Pardi Bazar	Birauta chowk	Pokhara	Gandaki Province
08d1e16e-48cc-4772-9568-d739a3239d5c	11834312097	Super teasty Mo Mo	27.7180849	85.3602003	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.152+05:45	Dibya Marga	Tusal	Kathmandu	Bagmati Province
4b94e03d-4bc1-46b2-b75b-e5da866442d1	11934456918	Peaceful Restaurant	27.6733827	85.43504920000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.157+05:45	Thalachhen	\N	Bhaktapur	Bagmati Province
6e992edd-4ee0-41c0-917e-0cc3f862032b	11934496385	Lovely Milk Bar	27.673385600000003	85.434889	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.158+05:45	Thalachhen	\N	Bhaktapur	Bagmati Province
e3782a1c-9629-422b-b412-2acefe7ce261	11934511682	Typical Coffee Shop	27.673562	85.43624650000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.158+05:45	Thalachhen	\N	Bhaktapur	Bagmati Province
57873d70-d01f-400e-828b-31258678f037	11934402383	Coffee Point	27.6720833	85.4303654	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.157+05:45	sukuldhoka	Aadarsha	Bhaktapur	Bagmati Province
f538bb14-0657-4b21-a564-a03e650d13b6	11934468114	Three Stones Restaurant	27.672499900000002	85.4339331	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.158+05:45	golmadhi	Aadarsha	Bhaktapur	Bagmati Province
73f528bc-40d7-4fa7-a074-0286839376ea	3634990902	Fewa Crossroads	28.2114265	83.95727930000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.781+05:45	Baidam Road	Baidam	Pokhara	Gandaki Province
dd0ebab5-d51a-4aa2-932c-006a2cac8432	5242320449	Kasturi Restaurant and Sausage House	28.163523100000003	84.0714276	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.851+05:45	Lake Road	Ekata Tol	Pokhara	Gandaki Province
477b794b-8a35-4410-bb54-1ad5c4acd2d2	4223362659	Bar Pipal restaurent	28.227071000000002	83.9412066	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.804+05:45	40DR012	Bhakunde	Pokhara	Gandaki Province
a5883d45-ba5e-4e7d-8b9c-f4006383236d	2638075950	Lila Cold Store	27.671542300000002	85.2764525	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.738+05:45	Nagaon road	Be-kwah-tan	Kathmandu	Bagmati Province
6d4267be-cf59-434a-99f2-e0492b807eda	5325170321	Manang Momo	27.7141051	85.3124593	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.854+05:45	Jyatha Marg	Lut Chok	Kathmandu	Bagmati Province
adaa023c-ea28-4a23-85dc-b4d6cd4924e7	2978585626	Khawa Karpo Tasty Noodle Factory	27.7248538	85.36449640000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.747+05:45	to norbu guesthouse	Sundar Tole	Kathmandu	Bagmati Province
7d550302-0001-4f55-88fa-769bc08d836b	2922943980	Aalishan Restaurant	27.6765569	85.31088960000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.746+05:45	Damkal-Chakrapath Marg	Dhobighat	Lalitpur	Bagmati Province
49c79f94-eab7-4513-979a-965b9d517cac	7826663702	Bhakundo Cafe	27.691917800000002	85.34793900000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.914+05:45	Kumud Devkota Marg	\N	Kathmandu	Bagmati Province
715d2618-5a4d-4414-aa66-e0c86f957a0f	5325444221	Be Happy Restaurant	28.2146848	83.95818820000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.854+05:45	18th Street	Baidam	Pokhara	Gandaki Province
b18a4440-61df-461b-9842-f9631a4cefba	5316044022	3C Restro Cafe	27.6793906	85.3200235	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.854+05:45	Krishna galli	Pulchowk	Lalitpur	Bagmati Province
b6b932f6-5f53-4dcc-814a-679681cc6357	5319848923	Kavreli Bhojanalaya	27.676945500000002	85.32025820000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.854+05:45	Madan Marga	Pulchowk	Lalitpur	Bagmati Province
58098416-5b33-4d95-a8b1-2ba6d1dd631b	5319931824	The Kathmandu cafe	27.6839356	85.33488150000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.854+05:45	Om Krishna Marg	Shri Nagar	Kathmandu	Bagmati Province
1e48ea78-5866-4813-bbaf-fb5de78ee91d	5323738221	Belbot Kitchen	28.222205000000002	83.9898938	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.854+05:45	Bastolathar Road	Chipledhunga	Pokhara	Gandaki Province
f4545566-1919-4dd2-a189-20420b77ee46	7184121531	Kohinoor Food Cafe	27.669139700000002	85.3235942	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.912+05:45	Prayag Pokhari to Kumaripati Road	Hakha Tol	Lalitpur	Bagmati Province
87124ef9-c44f-42f9-8c28-4d85ed4e0baf	4786021523	Blue Planet Anex Lodge and Resturant	28.244335900000003	83.94837240000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.825+05:45	Main Street	Garjati	Pokhara	Gandaki Province
c95077fe-7434-4414-8026-9fb4b90e8393	4786021524	Roof Top Restaurant	28.2444108	83.94845910000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.825+05:45	Main Street	Garjati	Pokhara	Gandaki Province
d4598347-e820-47af-9310-19cc844e8863	7187348419	Gurung MoMo House	28.1468266	84.08385120000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.912+05:45	40DR025	Tagako Mukh Chok	Pokhara	Gandaki Province
9d28ad46-2581-406c-9cbd-4307362bc09c	8333100819	Shrestha Sekuwa Corner	27.7112102	85.3376104	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.916+05:45	Paneku Marg	Paneku Tol	Kathmandu	Bagmati Province
9f34119e-8542-4b16-b185-d16c87c8d2ca	8333139514	Haasaa	27.7119275	85.3385353	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.916+05:45	Dharma Bhakta Marga	Panna Hiti	Kathmandu	Bagmati Province
14aa8e77-cf1e-4c93-bfc2-82d610dcc0df	8410926817	Cafe Daily Dose	28.238758100000002	83.98922040000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.916+05:45	Bhim Kali Patan	Taxi Chowk	Pokhara	Gandaki Province
899b6274-2445-4f1e-b4fe-570148fb43a7	8699927549	Little Buddha Restaurant And Bar	27.714122800000002	85.3116181	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.921+05:45	Thabahi Sadak	Lut Chok	Kathmandu	Bagmati Province
e36a5ad8-d6b3-4ca0-8618-aad0603acaff	8699927562	Tribal Cafe	27.714473700000003	85.3106975	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.921+05:45	Paryatan Marg	Lut Chok	Kathmandu	Bagmati Province
8cf3bb0c-8b66-4634-9a73-643f009a8a9b	8699927565	Dhuri Gallery Live Cafe	27.7139811	85.31118090000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.921+05:45	Narsingh Chowk	Lut Chok	Kathmandu	Bagmati Province
6f1a9f84-cb11-4f46-b02f-0582a9d6d1c8	8699927581	Thamel Sekuwa Corner And Bar	27.714181800000002	85.3109039	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.921+05:45	Narsingh Chowk	Lut Chok	Kathmandu	Bagmati Province
a7b61414-7907-452e-90c7-16cf95416fcf	9447489219	Tangalwood	27.717065400000003	85.33095660000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.93+05:45	Gahana Pokhari Marg	Kotal Tol 	Kathmandu	Bagmati Province
dc68b636-e8a3-474f-bb41-805bef8ac74f	9447489317	Dates	27.71677	85.33117460000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.93+05:45	Tangal Marga	Kotal Tol 	Kathmandu	Bagmati Province
8e8f1ba5-eb7f-4564-bd85-1a21ba29b070	9450088717	Ghalcha Restro	27.714140200000003	85.3427588	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.93+05:45	Chandra Binayak Marg	Bulbulley	Kathmandu	Bagmati Province
3bb072aa-f09c-4fc6-b0ed-a3b168914b02	9450093018	Beijing Garden	27.709131000000003	85.325958	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.93+05:45	Kamal Marg	Kamalpokhari	Kathmandu	Bagmati Province
9504a40a-2b2c-4379-8ce5-5c7eac704c8c	9450093118	Royal Bhatti	27.7085478	85.3318886	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.93+05:45	Pashupati Marga	Gyaneshwar	Kathmandu	Bagmati Province
c6a3851a-9309-4c6a-8bff-7118fd6b89d4	9526082017	The Burger House and Crunchy Fried Chicken	27.736964500000003	85.32398760000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.935+05:45	Kathmandu Ringroad	Tokha	Kathmandu	Bagmati Province
b94361e0-578c-4e58-98c9-2faadb7f5586	9526100217	Everest Foodland	27.734906300000002	85.31905760000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.935+05:45	Kathmandu Ringroad	Deepjyoti	Kathmandu	Bagmati Province
7d23fecf-79dc-4921-b09c-425a15e52aff	9526100817	Rato Bhale Tandoori Restaurant	27.7348667	85.31842970000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.935+05:45	Kathmandu Ringroad	Deepjyoti	Kathmandu	Bagmati Province
7c56fdaa-3279-4594-90bd-9502225eb41b	9526101817	Chef Choice cafe and restaurant	27.741842300000002	85.3318296	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.936+05:45	Kathmandu Ringroad	Narayan Gopal Chowk	Kathmandu	Bagmati Province
42d58ad7-aa55-465d-aa95-dccdc7994fa4	9527281340	Dear Dad Fast Food Restro	27.739049	85.33953100000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.938+05:45	Milijuli Marg	Narayan Gopal Chowk	Kathmandu	Bagmati Province
d529dc26-2fdb-4de4-8cc1-0d88d3668125	9527281342	Bodhi Garden Vegetarian Restaurant	27.737941600000003	85.34003390000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.938+05:45	Kathmandu Ringroad	Ganesh Basti	Kathmandu	Bagmati Province
7df57508-665e-4dc8-a845-41a4481b4791	9527281343	Golden Food Cafe	27.7392748	85.33895840000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.938+05:45	Milijuli Marg	Narayan Gopal Chowk	Kathmandu	Bagmati Province
9fa7e340-d4ff-48d6-859a-fbd0e45a4d43	9527281344	Tip Top New Gautam Sweets	27.7395263	85.33820920000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.938+05:45	Kathmandu Ringroad	Narayan Gopal Chowk	Kathmandu	Bagmati Province
d15d81cd-2c9f-4d9d-9977-fb07207b358b	9527281347	Nimto Restro And Bar	27.7389793	85.33827310000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.939+05:45	Lamtangin Marg	Chundevi	Kathmandu	Bagmati Province
8222b32a-b432-44e6-9526-d339d3d0553b	9527316360	Nova Brew And Restro	27.741697400000003	85.3344414	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.941+05:45	Samanantar Marg	Narayan Gopal Chowk	Kathmandu	Bagmati Province
c8de51a8-cf21-4768-b9b5-17a1afa721cb	9527316361	Daunne Kohinoor Restaurant	27.741706100000002	85.3375961	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.941+05:45	Bansbari Sadak	Narayan Gopal Chowk	Kathmandu	Bagmati Province
a85b360e-6023-4e26-90d8-cbdbc695d5a0	9527316363	Safa Chulo Cafe And Sekuwa Corner	27.7419069	85.3339328	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.941+05:45	Samanantar Marg	Narayan Gopal Chowk	Kathmandu	Bagmati Province
8e11fcca-446d-4c23-a363-63335f13737a	9527316364	King Momo	27.7422295	85.3332713	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.941+05:45	Samanantar Marg	Narayan Gopal Chowk	Kathmandu	Bagmati Province
0eb54394-550b-4673-8966-ff009d5ca623	9528662118	Lumbini Tandoori	27.718891600000003	85.34635580000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.944+05:45	Hospital Marg-1	Bulbulley	Kathmandu	Bagmati Province
2df9d4ad-9ced-40b9-8ce8-63fe011ccf5c	9528663318	Chitwan ko karma taas	27.717447800000002	85.3463435	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.944+05:45	Kathmandu Ringroad	Maiju Bahal	Kathmandu	Bagmati Province
77db8887-1df6-4d34-81dd-83b2727065c7	9528663417	Khotanghalesi restaurant	27.7172564	85.34628790000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.945+05:45	Kathmandu Ringroad	Maiju Bahal	Kathmandu	Bagmati Province
45d76c6c-0b12-48a5-bb32-7d2c4fc3d188	9580064045	Stick food  cafe	27.672146700000003	85.2797922	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.948+05:45	Town Planning Road	Pa-chhin-Dwopa	Kathmandu	Bagmati Province
ba6fc8cf-9f9e-4c5a-83ce-63155a7cdddb	9582390190	Quality  veg and bakery cafe	27.669888	85.2819644	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.948+05:45	Shahid Path	Shalik	Kathmandu	Bagmati Province
b97de97e-c808-458c-874c-f8221536db1b	9582461935	Quick bites cafe	27.669105400000003	85.28250270000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.948+05:45	Dhwang la:	Shalik	Kathmandu	Bagmati Province
aeda9fc2-5dda-4085-9031-fde46617faa5	9635024427	Rooftop restaurant	27.6664697	85.2898186	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.952+05:45	F22	Chobhar	Kathmandu	Bagmati Province
4711b610-1fcc-47c8-9f1b-31ca7497ae92	9635024428	Miss you Pani puri	27.665912900000002	85.2921106	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.952+05:45	F22	Chobhar	Kathmandu	Bagmati Province
ea3ea5ce-fc5b-4c97-b1f5-082562a11b49	10011109438	Brotherhood	27.7367583	85.3221046	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.082+05:45	Pragati Marg	Tokha	Kathmandu	Bagmati Province
5ac15319-4e11-4321-8ca2-02249b7d367e	9956505847	Kavre Veg Mo Mo	27.703194300000003	85.3197871	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.055+05:45	Adwait Marg	Baghbazar	Kathmandu	Bagmati Province
cd7734eb-7fce-4652-b448-456b2a7a0dab	9993356532	Yusup Fast Food	27.6731939	85.3597507	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.065+05:45	Tikathali-Lokanthali Road	Madhyapur Thimi	Bhaktapur	Bagmati Province
2b258bd2-1977-4eac-82af-cb0edcc991a8	1937710587	New Tasty Bite Restaurant and Bar	27.675176800000003	85.30655320000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.712+05:45	दमकल सुन्दरीघाट मार्ग	Dhobighat	Lalitpur	Bagmati Province
1da9cb12-1478-4daa-9970-66cbabb9bad7	9719793233	Laxmi Bahadur Tea Shop	27.679197600000002	85.27660630000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.967+05:45	Kirtipur Ring Road	Chi-ba-hah	Kathmandu	Bagmati Province
9211e4d9-b8b5-46cc-b416-27ac537f2310	9720286808	Chuka Restaurant	27.678920700000003	85.27608550000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.967+05:45	Than-ba-hah Lanh	Than-ba-hah	Kathmandu	Bagmati Province
17c31822-4dec-42cc-ba85-5f99f8eb885f	9720286810	Bikash Khaja Pasal	27.670937600000002	85.27136440000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.967+05:45	Pushpalal Marg	San-la	Kathmandu	Bagmati Province
533dc366-afe1-43ea-83de-bdd597a40d51	9720295958	Goma Fast Food	27.6768991	85.27978490000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.967+05:45	Kirtipur Ring Road	Chi-ba-hah	Kathmandu	Bagmati Province
335dfa48-488a-4e4b-9d28-be54991c789c	9722237631	Falguni momo house	27.6669519	85.26664570000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.967+05:45	Pushpalal Marg	San-la	Kathmandu	Bagmati Province
841a790c-b64d-45ed-bed2-5f9505a32302	10009676233	Food forest Restro	27.7588349	85.3280488	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.076+05:45	NH40	\N	Kathmandu	Bagmati Province
a811bd97-fc34-4d87-853e-59ec8805ba07	9724495243	Bikram Daiko Newari Khaja And Sekuwa	27.657566900000003	85.2912628	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.97+05:45	F22	Chobhar	Kathmandu	Bagmati Province
01dc012d-684b-4ccb-a488-0df0e0777966	10009601884	Kumari Guest House	27.7353078	85.31057700000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.075+05:45	Kathmandu Ringroad	Gongabu	Kathmandu	Bagmati Province
4f44c12d-b7f6-4436-ae0d-bcafc81ca588	10009601885	Harry Portter Guest House	27.7353367	85.3105833	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.075+05:45	Kathmandu Ringroad	Gongabu	Kathmandu	Bagmati Province
53b2bc3e-9436-410d-880b-0bd746b663be	10009601889	Siddhartha Restaraunt	27.7354947	85.31061770000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.075+05:45	Kathmandu Ringroad	Gongabu	Kathmandu	Bagmati Province
4f7d5ada-bd9e-441a-92bf-95b9f6fdad5f	10009601894	Puthan Phopli Guest House	27.735625600000002	85.310691	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.075+05:45	Buddha Marga	Deepjyoti	Kathmandu	Bagmati Province
4763e4c3-9f47-4803-a4d4-6b6001ce8191	10011073603	Laphing Center	27.7393424	85.3206232	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.081+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
760e254b-2171-4993-b54a-29cf587bc6dd	10011084723	Champa Restaurant and Sekuwa Corner	27.740665000000003	85.3212517	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.081+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
2d442a01-74bb-42fb-8704-009dff4a6d32	10011109433	Suddhha Sakahari Bhojanalaya	27.736712800000003	85.3220052	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.082+05:45	Pragati Marg	Tokha	Kathmandu	Bagmati Province
cbceed45-2caa-4911-a8d3-9c8df9a2885b	10013765034	Santosh Sweets	27.754129600000002	85.3278133	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.091+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
b8781837-b1bc-4c20-8e1c-7c86558c5ba4	10013765036	Nimesh Sekuwa Corner	27.7539741	85.3277451	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.091+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
8f4116d8-856c-4357-ac1b-cb5581d91507	10013765045	Chirayo Restaurant	27.7532174	85.3273351	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.091+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
74c873b5-ebbc-427d-aa8a-b0891875e663	10013765053	Pabitra Lumbini Bhojanalaya	27.752921200000003	85.32719060000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.091+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
f71cd218-0f5e-446b-b17f-31c0e768d719	5009206299	Ramsterdam Cafe	27.7268544	85.3645336	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.836+05:45	Mahankal Marg	Bhual Dhanda	Kathmandu	Bagmati Province
5bddea6b-c9f1-4474-92ce-3df659cd9979	10015238405	Chicken Station	27.7385939	85.31410790000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.094+05:45	F81	Deepjyoti	Kathmandu	Bagmati Province
150fb677-dc37-4ec2-9f98-8ffd9109fcd7	10015534522	Momo Center	27.749255700000003	85.3156962	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.096+05:45	Srijansheel Marga	Baniyatar	Kathmandu	Bagmati Province
87b452c4-9515-47af-9d86-c452c353bce6	10015534537	U and Me Cafe	27.7476121	85.31522910000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.096+05:45	Sayapatrinagar	Baniyatar	Kathmandu	Bagmati Province
9da4a21b-5ff9-4cb7-9fc0-acd28a925265	10015534541	taremam Restaurant	27.747222200000003	85.3152172	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.096+05:45	Sayapatrinagar	Baniyatar	Kathmandu	Bagmati Province
bb46d0a0-087a-42a5-83c7-db7fcb5da8aa	1989508623	Bharyang Cafe	27.6856732	85.34535070000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.715+05:45	Munibhairab Marg	Basuki Nagar	Kathmandu	Bagmati Province
bd2895a6-3c9b-4ff2-9e9d-ba3f2fd70f59	10053465370	15 Hours Cafe and Food Land	27.6804112	85.36563840000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.112+05:45	Pepal Bota(SanoThimi) to Lokanthali	sachet marga tole	Bhaktapur	Bagmati Province
825649c1-1023-4de5-9ac8-21fac48256d3	10049098944	Balkot Station	27.672189600000003	85.36497990000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.11+05:45	Kausaltar-Balkot	Purbeli Tol	Bhaktapur	Bagmati Province
40d4ae14-b87b-4b80-a4cc-a743e95ee758	5603560006	Hotel	28.197660600000003	83.99564240000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.883+05:45	Machhapuchre Marg	Phalepatan Chok	Pokhara	Gandaki Province
b0f58ae4-8e62-49da-860c-d39bacf23c5d	2027866686	Anmol Catering Service	27.690627900000003	85.33488770000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.719+05:45	Bhaktithapa Road	Bogati Tol	Kathmandu	Bagmati Province
8bb6c212-4069-4fb4-8b32-5f1635fc07bd	2074213091	Bhumi Restaurant	27.7244011	85.32244610000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.721+05:45	Lazimpat Sadak	Narayan Tole	Kathmandu	Bagmati Province
c5826002-894d-4d23-85cf-15090b997846	2074213097	New Tushita Restaurant	27.723730900000003	85.32195920000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.721+05:45	Lazimpat Sadak	Narayan Tole	Kathmandu	Bagmati Province
d3bfaba6-9679-4e04-a48a-4d8d90904e16	10121388701	Hipat Food Point	27.6819087	85.3417713	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.117+05:45	Sat Marg	Sahayogi Nagar	Kathmandu	Bagmati Province
3333d759-97e4-470a-a56a-048e8420d127	10121388702	Sasha Cafe Restaurant and Bar	27.6816482	85.3413007	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.117+05:45	Subidha Margaa	Sahayogi Nagar	Kathmandu	Bagmati Province
4a66d284-f51b-43ab-8955-10f7c65b453b	6380093486	Himalayan Java Coffee	28.2108765	83.9572593	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.9+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
bdb1b044-080f-4c46-a2d5-3168d5f63c35	9988720045	The Cutting Tea	28.233188400000003	83.98955690000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.064+05:45	Damal Marg	\N	Pokhara	Gandaki Province
39e1785e-a609-4066-97aa-bb53cb440bb2	10012154583	Myagdi Sada Khana	27.735952800000003	85.31211110000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.086+05:45	Kathmandu Ringroad	Gongabu	Kathmandu	Bagmati Province
9fdbaf78-70bf-4ac1-90b9-b05ac6f1bf2e	7041591602	Chwochhen D Newa Restaurant	27.6800035	85.2748335	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.91+05:45	Than-ba-hah Lanh	Than-ba-hah	Kathmandu	Bagmati Province
aa2d18db-145f-437d-b144-29be7bc903a7	10121412611	Shandhar Momo	27.6786114	85.34471980000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.12+05:45	Seti O.P. Marga; Gyanodaya Galli; Seti O.P. Marga	Seti O.P.	Kathmandu	Bagmati Province
e2bf7c46-7e71-4d93-92af-aad2b9653416	10121417217	Bakery and Coffee Shop	27.6831947	85.3479121	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.12+05:45	Subidha Marg	Basuki Nagar	Kathmandu	Bagmati Province
ba881ab9-b820-443d-90fd-4222939cf55c	10121417222	Manna Cafteria	27.683213300000002	85.3477323	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.12+05:45	Subidha Marg	Basuki Nagar	Kathmandu	Bagmati Province
991b68b8-3135-4aa8-945b-015fa31d24b4	10121417233	Kantipur Cafe	27.6829973	85.34700720000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.12+05:45	Subidha Marg	Basuki Nagar	Kathmandu	Bagmati Province
3864c428-05a1-47da-88d4-072ec8cbf057	9404115380	JG Burger House	27.7386482	85.31021030000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.925+05:45	Basantanagr Marga	Tarakeshwar	Kathmandu	Bagmati Province
3387976f-11b1-4681-9b9b-904f40d3bf22	10121523091	S Cafe	27.683090200000002	85.34776760000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.124+05:45	Subidha Marg	Basuki Nagar	Kathmandu	Bagmati Province
11968955-bfa4-41e1-abfc-11ed7d5e9045	10121523092	New Everest Momo Center	27.683076900000003	85.34765680000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.124+05:45	Subidha Marga	Sahayogi Nagar	Kathmandu	Bagmati Province
888a579f-7626-4421-933c-0b3cbc79fc8c	10121523099	Magar Dai Ko Cafe	27.6829058	85.34709550000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.125+05:45	Subidha Marg	Basuki Nagar	Kathmandu	Bagmati Province
df1abd1b-4a55-4970-81f7-6c6cadfd6436	10121542421	The Cosy Cafe	27.685403400000002	85.3456723	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.125+05:45	Munibhairab Marg	Basuki Nagar	Kathmandu	Bagmati Province
25e0cbce-0803-4736-a7eb-272602fcad20	9528534818	Tawa	27.709955100000002	85.3279905	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.941+05:45	Thirbam Sadak 3	Kamalpokhari	Kathmandu	Bagmati Province
b12eee82-6d41-4d59-9128-f72a4f7582dc	3488413713	Aamako Kitchen	27.710227900000003	85.31320960000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.775+05:45	Jyatha Marg	Kamalachi	Kathmandu	Bagmati Province
7fb85319-4ead-46ea-af04-f8920270764e	9528648020	Kaffi and bites	27.7393894	85.32568810000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.942+05:45	Kathmandu Ringroad	Tokha	Kathmandu	Bagmati Province
1a33ffe1-6da7-47f6-8c85-3474501ca33b	4296155921	Shree Nagar Family Restaurant	28.2119405	83.9806839	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.807+05:45	Phewa Marg	\N	Pokhara	Gandaki Province
fd038c18-b715-4071-a9ae-c974696bde0a	9626250287	Green house cafeteria	27.6657684	85.27358290000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.951+05:45	Jakha Road	Da-thal	Kathmandu	Bagmati Province
177d9ab7-de25-4661-9545-17073494bf93	3056783005	Chakra Sweets	27.7001977	85.3432435	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.747+05:45	Ghumti Kumari Marg	Naya Baneshwar	Kathmandu	Bagmati Province
efdda209-5c7e-405b-aa1b-59f8e7c20677	3056783006	Chakra sweets	27.699202800000002	85.3456244	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.747+05:45	Sinamangal Marg	Naya Baneshwar	Kathmandu	Bagmati Province
81ede9b9-dfd1-4e97-8577-a67dca574a48	9655536140	Pahan Chenn	27.6819789	85.27247630000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.955+05:45	Kirtipur Ring Road	Khahsi bazar	Kathmandu	Bagmati Province
5586c745-f3a5-4280-b674-87c9aa2e67d4	3069572514	Wifi Food Cafe	27.7071454	85.32298150000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.747+05:45	Dhobidhara Marg	Kamalpokhari	Kathmandu	Bagmati Province
24a3ba89-2fa2-4086-bc04-2ee7e42c787b	3361837951	Newari Khaja Point	27.7107533	85.31219	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.764+05:45	Jyatha Marg	Lut Chok	Kathmandu	Bagmati Province
60d184b0-10ea-4e39-92af-4b5d5b1530fe	1349680730	Momo	27.7113583	85.30874890000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.693+05:45	J.P. Road	Paknajol	Kathmandu	Bagmati Province
322c83c6-2218-4f48-b2ba-34d3a6d1ef86	10007375315	Coffee Shop	27.7560125	85.3218617	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.072+05:45	Grande Road	\N	Kathmandu	Bagmati Province
991f2ec8-6c2d-4438-90e0-1b0918d4e5bf	9928566174	Sunita Chamena House	27.693681	85.319124	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.049+05:45	Thapathali Road	Thapathali	Kathmandu	Bagmati Province
2d0a9621-98d7-42e6-b9fc-adee18fc5d88	9928566192	Bluebird Cafe	27.6913179	85.3163433	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.049+05:45	Tripureshwar Marg	Tripureshwar	Kathmandu	Bagmati Province
071dcffd-22f9-4f20-bf1a-db2cce2eeb6d	3480361309	Bandipur Spring	28.214053600000003	83.9585148	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.775+05:45	Baidam Road	Baidam	Pokhara	Gandaki Province
7b84a5da-4a98-492e-8821-3a3be9816ff7	10015229645	Chiya Coffee Cafe	27.7373331	85.3117172	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.093+05:45	Parajuli Niwas marga	Deepjyoti	Kathmandu	Bagmati Province
be0894ec-0fc4-44ac-9f4d-d0d7fcbdb0b5	3477018029	Shree Lumbini Tandori Dhaba	27.711425300000002	85.31231720000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.774+05:45	Jyatha Marg	Lut Chok	Kathmandu	Bagmati Province
d740ebc8-e168-4ec6-af8a-da0ab1ef7974	4160825730	Dhaulagiri	28.2391252	83.9887588	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.798+05:45	Bhim Kali Patan	Taxi Chowk	Pokhara	Gandaki Province
961be462-3c6f-4b94-8b18-10ad9bb8bff5	9999414282	The Woodys Cafe	27.669688	85.3547362	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.069+05:45	Manohara Corridor	Thulodhara	Kathmandu	Bagmati Province
61bca7f9-97de-4ee2-88fd-26cbd5d08461	9999414295	Staff Bhojanayala	27.670200100000002	85.3548655	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.069+05:45	Naulo Marg	Kot Devi	Kathmandu	Bagmati Province
f252896d-4adc-4fa2-bca0-b89c5c19cce4	9956485582	David Restaurant	27.6744838	85.3614802	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.054+05:45	Arniko Raj Marga	sachet marga tole	Bhaktapur	Bagmati Province
f7862b03-3aea-4b99-b18e-b0c79349ef50	4363030844	Bamboo Club	27.7167585	85.3102604	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.809+05:45	Chaksibari Marg	Sorakhutte	Kathmandu	Bagmati Province
5c2184a1-d73f-452d-b59e-20f2554c5ee8	10050868004	Jugal Cafe	27.689588200000003	85.3890561	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.111+05:45	SanoThimi-Bode	Naagdesh (Nagadesh)	Bhaktapur	Bagmati Province
697f55ba-78eb-4623-92a9-c2b89caea088	3307488697	Kirtipur View Point Restaurant	27.679971600000002	85.27487280000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.758+05:45	Than-ba-hah Lanh	Than-ba-hah	Kathmandu	Bagmati Province
d85e889b-5d9b-488b-9000-ebbe88d7d666	3316989679	French Bakery	27.712787400000003	85.30868570000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.758+05:45	Paknajol	Tahiti	Kathmandu	Bagmati Province
3a48b1d0-8703-4eac-ad0c-39df6382f9ce	3328205239	Lete Thakali Kitchen	27.7172915	85.330336	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.759+05:45	Thirbam Sadak	Bhrikuti Tole	Kathmandu	Bagmati Province
9a3ce79c-d4ac-4266-aac1-a59c9a9be97f	10121388656	Inderni De Cafe	27.6859223	85.3449714	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.116+05:45	Madan Bhandari Path	Basuki Nagar	Kathmandu	Bagmati Province
451b4598-73a3-4972-b2cf-1bb439fa089a	9929272081	Mag Cafe	27.678871500000003	85.3099	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.049+05:45	Pulchowk Jhamsikhel Marga	Dhobighat	Lalitpur	Bagmati Province
c02a4daa-04b8-440e-ad3a-155962729360	10121566034	Kingstar Food Cafe	27.679051800000003	85.3394111	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.126+05:45	Sahayogi Nagar Marg	Thulodhara	Kathmandu	Bagmati Province
32e9033c-ac25-417a-8989-6b287a8c8e98	9929296679	Chimes Noodles Shop	27.684638500000002	85.3074867	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.049+05:45	Siddhi Binayak Marg	Arun Thapa Murti Chowk	Lalitpur	Bagmati Province
33c431ff-cbb4-43c7-b918-7072357a0ba9	9929337128	The Workshop Eatery	27.683267200000003	85.3115628	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.049+05:45	Bakhundol	Arun Thapa Murti Chowk	Lalitpur	Bagmati Province
7db2da06-f541-411c-b930-6f3556863fe9	9916636671	Best Food Cafe	27.706665200000003	85.3229644	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.047+05:45	Putali Sadak	Dillibazar	Kathmandu	Bagmati Province
4dcee1ac-f6c0-4323-9c53-82e2d8fa3a0f	5464212916	BJ Bee Fast Food and Resturent	28.1949007	83.97885050000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.863+05:45	Pardi Bazar	Birauta chowk	Pokhara	Gandaki Province
24629b92-2a23-4059-8043-ecd0b0de3e4c	2029468551	Nepali Chulo	27.7231981	85.3204894	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.719+05:45	Nursery Marg	Kharel Tol	Kathmandu	Bagmati Province
c9327acd-2f1e-4dd6-b6ee-d8ac105c2919	9993276381	Himalayan Sekuwa Corner	27.6691387	85.35489310000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.065+05:45	Balkumari-Balkot road	Phaudegau	Lalitpur	Bagmati Province
1f932dd3-2863-4f80-b66c-f8934296f859	1989508684	Purano Lumbini Tandoori Bhojanalaya	27.6833932	85.34880480000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.715+05:45	Subidha Marg	Basuki Nagar	Kathmandu	Bagmati Province
8a39f1af-736c-49b5-b23d-bc5e0b287daa	2166426559	Friends Party Centre	27.697922700000003	85.2984376	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.731+05:45	Ganeshman Singh Road	Kalimati	Kathmandu	Bagmati Province
cbe6ccc8-bf28-4948-86ea-f78566b699e1	2166592516	The Coffee Shop	27.7113258	85.3173738	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.731+05:45	Darbar Marg	Kamalpokhari	Kathmandu	Bagmati Province
bcbb0c7a-9340-40aa-99e5-3c54a25f93e2	5472541748	Amenty	28.151136200000003	84.06474220000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.865+05:45	Prithvi Highway	Bhandardik	Pokhara	Gandaki Province
b856f977-18f2-41c2-a140-2b9d98a5eb93	1905376363	Name Cafe and Restaurant	27.703953300000002	85.32274740000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.707+05:45	Hiuwa Galli	Bansh Ghari	Kathmandu	Bagmati Province
107769ad-d884-4432-afb3-b425c752d646	1905389010	Sheetal garden restaurant and bar	27.705076700000003	85.3236943	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.707+05:45	Dillibazar Sadak	Ghattekulo	Kathmandu	Bagmati Province
74cc2e01-e066-4b34-854f-6533f722952f	5481817806	View Land Guest House and Rooftop Resturant	28.224110500000002	83.9500134	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.868+05:45	Khapaudi Road	\N	Pokhara	Gandaki Province
a46324fe-a3ff-42d6-ab20-ab5d5bd79ff1	10011753420	Kitli Chiya	27.7462637	85.3271158	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.082+05:45	Bhandari Street	Tokha	Kathmandu	Bagmati Province
eecc5be5-537c-4e97-8f79-baa39677c74e	10011753423	Pizza Station	27.7462148	85.32720610000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.082+05:45	Bhandari Street	Tokha	Kathmandu	Bagmati Province
7c5a2ba7-fd83-46f0-8700-cfc7dfe7b444	3069572521	Gabahal Cafe	27.674120600000002	85.3216033	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.748+05:45	Gabahal Marg	Patan	Lalitpur	Bagmati Province
6ea8dac6-3fa1-430c-b658-60989ebcbe42	3439270857	Black Olives	27.7172002	85.3101943	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.772+05:45	Chaksibari Marg	Sorakhutte	Kathmandu	Bagmati Province
e06b9d76-8a73-4e7c-9b27-93a2fba03ba4	2166597514	Himalayan Java	27.703746000000002	85.30764810000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.731+05:45	Ganga Path	Makkhan Tol	Kathmandu	Bagmati Province
b6d0e0fa-710c-493c-a8a2-24e8258d66f5	3069606858	hukka temple	27.6736448	85.3247219	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.748+05:45	Mha Maru Galli	Mangal Bazar	Lalitpur	Bagmati Province
14b9d052-7698-4ae7-ac2b-05e6e8d2629b	2091834010	Tama	27.7175532	85.32814520000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.727+05:45	Gairidhara Road	Narayan Chaur	Kathmandu	Bagmati Province
a1b1f230-cce2-44c0-a525-7dbd60bc2191	2166417323	Baithak Events Venue	27.6954768	85.3103347	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.731+05:45	Tripureshwar Marg	Tripureshwar	Kathmandu	Bagmati Province
3d50e1be-7a01-42f0-be88-45a959d2ccc3	2166417329	Panas Restaurant	27.701203000000003	85.31131930000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.731+05:45	Bhulaa marg	\N	Kathmandu	Bagmati Province
6e370274-3ecb-4855-9290-812976984dd6	10147752668	UTC	27.6714853	85.40832370000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.129+05:45	Araniko Highway	Suryabinayak	Bhaktapur	Bagmati Province
e284df4f-9603-4b1d-8d98-d5510d722600	1338303817	View Top Lodge and Restaurant	28.243297000000002	83.94818240000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.692+05:45	Twins Road	Garjati	Pokhara	Gandaki Province
45117b25-db96-49c0-b6ab-491fcf87ab81	1349658493	Annapurna	27.7153399	85.31163620000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.693+05:45	Thamel Marg	Lut Chok	Kathmandu	Bagmati Province
472498bf-94f5-4cda-b4da-ac9ac1f3d024	1858151615	Nava Durga Bhojanalaya	27.6786989	85.3211747	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.702+05:45	Madan Marga	Pulchowk	Lalitpur	Bagmati Province
899aae7d-13c8-40aa-9c52-4b6d91f5712c	1880051587	Cafe Hessed	27.6759765	85.3143833	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.702+05:45	दमकल सुन्दरीघाट मार्ग	Dhobighat	Lalitpur	Bagmati Province
b7bcce39-a7a1-4597-a3ef-b9d0153d6a3e	1883860524	New Drop Restaurant	27.669461300000002	85.3099426	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.702+05:45	Radha Krishna Marg	Dhobighat	Lalitpur	Bagmati Province
e7fcd5f1-cb03-4cac-b0d4-85a747cf4379	1904093833	Yala Layeku kitchen	27.672791200000002	85.3246996	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.704+05:45	Mangalbazar Marg	Mangal Bazar	Lalitpur	Bagmati Province
6b4de911-9048-4307-8799-f3ff1b09b2bf	1399507907	Cuppas Cafe	27.7231911	85.2939657	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.696+05:45	Kathmandu Ringroad	Dhungedhara	Kathmandu	Bagmati Province
b554268b-be4f-4949-9934-db114daaaf8d	1937710496	Albino Cafe	27.678536800000003	85.3053952	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.712+05:45	दमकल चक्रपथ मार्ग	Dhobighat	Lalitpur	Bagmati Province
3567feea-a072-45c0-bb1f-a08ac839ed92	1993440455	Mega Indian Muglai Restaurant	27.7373736	85.3231466	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.716+05:45	Kathmandu Ringroad	Tokha	Kathmandu	Bagmati Province
7dbfed08-5d4b-4a7b-8538-f2ef7e02d5d5	1996638818	Hearten Cafe	27.6972659	85.3379163	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.716+05:45	Devkota Sadak	Srijana Tole	Kathmandu	Bagmati Province
f650db0d-d62e-427a-8bd7-70b632093bfe	2001289200	Trendy Cafe	27.7257736	85.3309047	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.717+05:45	Thirbam Sadak	Kirtan Chok	Kathmandu	Bagmati Province
a3bf1a2f-277d-430a-aa11-16dbdcd2eda8	2002501577	Silo Family Restaurant	27.7346475	85.31529710000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.717+05:45	Kathmandu Ringroad	Deepjyoti	Kathmandu	Bagmati Province
b07365e6-4f17-4308-812a-681b41ad1b9e	9956153346	The Funky House	27.675001400000003	85.3608777	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.053+05:45	Lokanthali To Sano Thimi	sachet marga tole	Bhaktapur	Bagmati Province
be75c417-0b13-4ba0-b0c8-79aa68513521	9956153350	Kavreli Bhojanayala Tatha Momo Center	27.6750256	85.3606815	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.053+05:45	Arniko Raj Marga	sachet marga tole	Bhaktapur	Bagmati Province
bbdd95fb-96ee-4717-a517-c1cd7318c95a	9956153352	Thakali Flavor	27.675023200000002	85.360585	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.053+05:45	Arniko Raj Marga	sachet marga tole	Bhaktapur	Bagmati Province
fca4bab4-a81f-45b9-a53c-c04a7a23f812	9969216601	CBC Cafe	27.6729063	85.3597245	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.061+05:45	Tikathali-Lokanthali Road	Madhyapur Thimi	Bhaktapur	Bagmati Province
e190a63c-35c5-4091-b7cb-071f3ebdb5b0	3365537204	Mahaaja	27.710493500000002	85.31134490000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.765+05:45	Jyatha Marg	Kamalachi	Kathmandu	Bagmati Province
8e0f0272-c616-44a5-821c-55c2f77f8c78	2077238425	New Horizon cafe	27.738571800000003	85.3252583	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.723+05:45	Kathmandu Ringroad	Tokha	Kathmandu	Bagmati Province
8ed00f24-bf0c-4704-b826-47fc0599bbf5	2079502752	Green Belt Momo centre	27.742330600000003	85.3332257	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.723+05:45	Samanantar Marg	Narayan Gopal Chowk	Kathmandu	Bagmati Province
81e92d5a-0a6e-476a-8caa-ec29e0923829	2079502754	KFC Fast Food	27.742377700000002	85.33305130000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.723+05:45	Samanantar Marg	Narayan Gopal Chowk	Kathmandu	Bagmati Province
ef75dfc6-bcc5-47c5-8b62-22172b4c1ad5	10007254874	Ramechhap Bhojanalaya	27.756190500000002	85.3211723	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.072+05:45	Grande Road	\N	Kathmandu	Bagmati Province
c1eeef40-8fde-40b4-9d59-ce232f6e47c0	10007254887	Ramechhap Manthali Bhojanalaya	27.7563463	85.3216955	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.072+05:45	Grande Road	\N	Kathmandu	Bagmati Province
455c4a96-f75b-4c3f-a3c2-f8a9b4197c4d	10007391220	Gorkhali Kenzo Foodland	27.755433200000002	85.32242550000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.072+05:45	Grande Road	\N	Kathmandu	Bagmati Province
aa5d7abd-cf5f-4b62-b0a8-103655d6938c	2166593033	Red Carpet	27.710604	85.31800150000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.731+05:45	Saraswati Mata Marg	Kamalpokhari	Kathmandu	Bagmati Province
b9c8bf08-4e71-4061-8dff-eddeb609463e	5509844257	Tree House Restro	28.2226381	83.9885656	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.872+05:45	Niva Galli	Chipledhunga	Pokhara	Gandaki Province
06857a07-0aca-4f4c-9eba-bffacbf18e23	5949201592	Alfa House	27.688987	85.33129480000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.891+05:45	Shram Marg	Thapa Gaun	Kathmandu	Bagmati Province
a0466d8e-55b1-4ba2-9900-d90b44a01511	5963271185	Melrose restaurant	27.7133614	85.3127178	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.891+05:45	Bharma Kumari Marga	Kamalachi	Kathmandu	Bagmati Province
bf12fd6b-a6db-4ec9-8148-b9ee8e2330d3	4336796994	Ready to Fry	27.6814196	85.3202246	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.808+05:45	Chakupat Marga	Kupondole	Lalitpur	Bagmati Province
e580ca23-1e21-4321-8e5a-ca0ab24ac494	9956485537	New Lumbini Tandoori Bhojanalaya	27.6742403	85.3646204	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.054+05:45	Arniko Raj Marga	sachet marga tole	Bhaktapur	Bagmati Province
a853979a-b612-4fd0-b5cf-3b7a44de364e	3361837950	Sherpa Restaurant	27.710857	85.3123935	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.764+05:45	Jyatha Marg	Lut Chok	Kathmandu	Bagmati Province
be594c8b-8fc5-49f4-b2af-55851a0909c2	4343916493	Seti Opi Fast Food and Restuarant	27.678864500000003	85.3443792	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.809+05:45	Seti O.P. Marga; Gyanodaya Galli; Seti O.P. Marga	Seti O.P.	Kathmandu	Bagmati Province
68d5a77c-4703-491f-a631-59599334b5f8	3637654274	20 Fourteen	28.210085000000003	83.9568689	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.783+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
08257797-73d8-4092-bd70-180d01a6c85f	4341053702	eastern village de resort	27.744228500000002	85.3793299	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.808+05:45	jagadol vanjayang road	\N	Kathmandu	Bagmati Province
de4c4541-abac-4184-a5f5-84fc9632de9b	10678289306	Urban De Cafe	27.6705404	85.27995890000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.137+05:45	Shahid Path	Dhwa-Kha-Shi	Kathmandu	Bagmati Province
937dd95a-c1e1-4625-bc35-a83c7f630f28	10680582106	Nepal Tea	27.7178125	85.3448012	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.137+05:45	Gangahiti Marg	Gangahiti	Kathmandu	Bagmati Province
c16d795c-ba20-4a61-a1a5-4ca5ba65707e	10683118805	Yak Garden	27.7214744	85.3582564	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.137+05:45	Tusal Marg	Tusal	Kathmandu	Bagmati Province
8617e511-0559-41c9-bcf3-87410b0d7052	10683118905	Bazra Bal	27.723121000000003	85.3591408	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.137+05:45	Hyatt - Boudha Marg	Dhara Tole	Kathmandu	Bagmati Province
8bdc397e-eba6-4adc-a40b-1073920aeab3	8696349264	Hotel Orchid	27.694801100000003	85.31027130000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.919+05:45	Tripureshwar Marg	Tripureshwar	Kathmandu	Bagmati Province
8885b5d7-d030-4d1f-bad2-4499a8387f48	8696390254	Cafe Cacao	27.7174604	85.31181500000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.919+05:45	Thamel Marg	Lut Chok	Kathmandu	Bagmati Province
4c24fbd1-305b-4ded-895b-5e3baef48886	8696390256	Thamel House Restaurant	27.717040500000003	85.3117206	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.919+05:45	Thamel Marg	Lut Chok	Kathmandu	Bagmati Province
4f196cee-7548-4b09-b184-7f7a0a5cca38	4936705622	Himalayan Kitchen	28.212245300000003	83.96061440000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.834+05:45	Street 17 (Lalupate Marg)	Baidam	Pokhara	Gandaki Province
14ae00dd-ec0b-45a0-8939-4feb89eaf421	11078021514	The Burger House And Crunchy Fried Chicken	27.739119000000002	85.33942780000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.144+05:45	Milijuli Marg	Narayan Gopal Chowk	Kathmandu	Bagmati Province
6ce45e86-c750-442b-a2e5-278b58c8b5a2	11116182551	Aniyor vegetarian and vegan restaurant	27.717763700000003	85.31197470000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.144+05:45	Thamel Marg	Lut Chok	Kathmandu	Bagmati Province
b09e2d31-8592-4679-a012-06098f6a4f85	11118833318	Newa Cafe And Bar	27.707742500000002	85.28391620000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.144+05:45	Museum Marg	Dallu	Kathmandu	Bagmati Province
0bbca189-f399-4453-8069-4a223dd4fee7	4791369933	Cheap and Best Restaurant and Bar	28.206225500000002	83.9620787	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.828+05:45	7th Street, Shiva Marga	Baidam	Pokhara	Gandaki Province
3dfd4a1f-0d3e-44df-b881-9830c7ebfad1	4791369986	Great Wall Chinese Restaurant	28.204370200000003	83.9631418	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.828+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
56579bfb-f58d-4e22-bf95-49916ece3f22	4791369987	The Boatyard Cafe	28.204307800000002	83.96327240000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.828+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
e8a2fa7b-4eec-4293-b8e2-4a958b82ac3c	4791410143	Meet Point Resturant	28.2112623	83.9588849	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.828+05:45	Street 16t (Samikopatan)	Baidam	Pokhara	Gandaki Province
bfff38b2-144d-483e-b934-cf0044ef0fc7	9527281366	Cafe Corner	27.739257300000002	85.3395476	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.939+05:45	Milijuli Marg	Narayan Gopal Chowk	Kathmandu	Bagmati Province
e9bcdbe4-530e-4b3e-af4a-4d7827457399	2684756249	Tibetan Restaurant	27.670432100000003	85.31007770000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.74+05:45	Jawalakhel Yekantakuna Sadak	Dhobighat	Lalitpur	Bagmati Province
9c7145e5-60f2-4757-b10e-4626ecd445d4	2684756431	Newari Fast Food	27.668831200000003	85.3098016	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.74+05:45	Jawalakhel Yekantakuna Sadak	Dhobighat	Lalitpur	Bagmati Province
97e60563-ac09-408b-99a4-39017783a460	5917453286	Fudo Cafe	27.7295623	85.3308368	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.891+05:45	Thirbam Sadak	Kiran Chok	Kathmandu	Bagmati Province
10193ebf-0467-48e8-880a-72fb25ad903b	6073580685	Mytho	27.711419900000003	85.30886550000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.896+05:45	J.P. Road	Paknajol	Kathmandu	Bagmati Province
0ddb2203-dcba-42bd-9a95-7aa882fc4a82	9635018081	Chovar height 3s restaurant	27.664237900000003	85.2938884	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.952+05:45	F22	Chobhar	Kathmandu	Bagmati Province
cb499dcb-08b8-4801-b5f8-467e25356841	9635023598	Chovar height 3s restaurant and bar	27.664119900000003	85.29399380000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.952+05:45	F22	Chobhar	Kathmandu	Bagmati Province
87f6de17-28bc-4778-bb5f-e339fd687588	5456009338	cafe itliano	28.2043609	83.965306	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.861+05:45	4th Street, Ambot	Baidam	Pokhara	Gandaki Province
5a7839ce-d4fe-4be1-8921-0da46c1e218e	5455952748	Subishan Momo Restaurant	28.193040300000003	83.9609246	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.861+05:45	Shital Marg	Om Shanti Chok	Pokhara	Gandaki Province
1ee78b05-5716-4cda-b3d6-1b893100599e	5456032836	Malla Restaurant And Lodge	28.2001072	83.98633050000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.861+05:45	Rishi Marg	St. Mary Chowk	Pokhara	Gandaki Province
23a6003e-3581-4c60-a7c2-81b71711bf6a	9708697776	Dreams Cafe And Restaurant	27.6805191	85.2792726	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.964+05:45	Way To Naya Bazaar	Chi-ba-hah	Kathmandu	Bagmati Province
c1a6ee07-0b63-4e29-a702-68d65b44390d	9527281371	Rfc	27.739358300000003	85.33931550000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.94+05:45	Milijuli Marg	Narayan Gopal Chowk	Kathmandu	Bagmati Province
d19967f1-5778-49d5-a1ac-426ff1b4df31	10016176877	Batuk cafe	27.747732300000003	85.3180545	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.099+05:45	F81	Baluwapati Chowk	Kathmandu	Bagmati Province
4920ce87-fed7-4bcb-8931-b8280a21fece	5426666111	Gandaki Food Cafe	28.240331100000002	83.9881514	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.858+05:45	Bhim Kali Patan	Taxi Chowk	Pokhara	Gandaki Province
c9b85ef8-d1e1-4fb9-9218-db53509fe50c	9529746967	Dalle	27.7021644	85.31076370000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.946+05:45	Khichapukhu Sadak	\N	Kathmandu	Bagmati Province
e87d74f9-429d-4131-b59a-5d6a21fd7d15	5531419888	New Kalika Restaurant and Guest House	28.214168500000003	84.074487	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.875+05:45	Rakhi Mijure Highway	\N	Pokhara	Gandaki Province
1c513e32-d03e-4d20-b631-ad82f71f6201	5525019693	New Sausage Corner And Jhir House	28.231097400000003	83.9983119	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.874+05:45	40DR015	Ghimire Chok	Pokhara	Gandaki Province
c66b09d6-88c6-4efb-96e6-98ff36b715c3	5530458646	Aaparna Famiily Restaurant	28.232546600000003	83.9985164	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.875+05:45	40DR015	Ghimire Chok	Pokhara	Gandaki Province
028d75e3-3727-41c7-8ff9-8233e3aae6a7	3461260782	Bricks Cafe	27.685487600000002	85.31763500000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.773+05:45	Kupondol Marg	Kupondole	Lalitpur	Bagmati Province
1ac4093d-0c2c-4494-adb3-0d32ac62c9c2	3469211654	Lanhua	28.206399400000002	83.9600844	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.774+05:45	10th Street, Bharat Bhattarai Marga	Baidam	Pokhara	Gandaki Province
43aa92fd-e30f-47ee-8c8d-81a232e61f36	3464574293	Delicious Cafe	27.710355500000002	85.3109833	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.773+05:45	Thahity Jyatha Marg	Tahiti	Kathmandu	Bagmati Province
f0965160-38e6-4fb6-ae7a-4b670a6e72e7	3477018008	Atithi Satkar	27.7116149	85.31238110000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.774+05:45	Amrit marg	Lut Chok	Kathmandu	Bagmati Province
5268ad5d-bbb0-46c6-bcfe-d75c0e81d8d1	3477018016	Karuwa	27.711109	85.31305920000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.774+05:45	Byathit Marg	Kamalachi	Kathmandu	Bagmati Province
810af150-4029-4d4b-af20-08c77876bdf6	9642585502	Sanjib hotel	27.655306300000003	85.2794818	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.953+05:45	Charghare road	Da-na	Kathmandu	Bagmati Province
c219c306-3785-4e4f-92bc-cb1dfe8de337	11869527768	Hotel Sidhhartha and Thakali Kitchen	28.2049157	83.9827667	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.153+05:45	Siddhartha Highway	Indrapuri Tol	Pokhara	Gandaki Province
53263215-2265-459e-863c-6efba3c51850	11869551078	Syangja Hotel and Staff Bhojanalaya	28.206598300000003	83.98334630000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.153+05:45	Siddhartha Highway	Indrapuri Tol	Pokhara	Gandaki Province
ed593430-eb37-43dd-85fe-137dfc31c302	11869551082	Aadhi Khola Guest House and Restaurant	28.206777300000002	83.98347980000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.153+05:45	Siddhartha Highway	Indrapuri Tol	Pokhara	Gandaki Province
959049c3-5cf0-46ab-be32-638690774f63	2091833637	Sushant Bakery Cafe	27.719776000000003	85.33735610000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.727+05:45	Hadigaun Marg	Dathu Tol	Kathmandu	Bagmati Province
bc78bb56-8baf-4fe4-832d-5610f05c0633	11933697443	Ajima Cafe	27.670617200000002	85.4261637	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.157+05:45	Mangalache	\N	Bhaktapur	Bagmati Province
6f0bc5a7-6c23-4194-acc3-d7e41783954d	11933707734	Khapey Newa Restro	27.6710241	85.42548980000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.157+05:45	bharwacho	\N	Bhaktapur	Bagmati Province
0943235b-b101-49aa-98d1-3cb1550cde5f	11933719421	Bhaktapur JuJu Dhau	27.671131600000002	85.42528510000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.157+05:45	bharwacho	\N	Bhaktapur	Bagmati Province
59f82191-1ede-4627-a287-94eec1d347c5	11933740579	Red Cherry	27.671221900000003	85.42142790000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.157+05:45	bharwacho	\N	Bhaktapur	Bagmati Province
77c5dd5a-7ea9-4e56-be99-671cd58e8a10	11933663369	Yummy Square	27.670928200000002	85.4291139	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.157+05:45	kwachhen	Aadarsha	Bhaktapur	Bagmati Province
1e2f9e38-f495-44f8-a9bb-8d7e86978eac	11934405097	Newa Lahana	27.6723345	85.43067860000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.157+05:45	sukuldhoka	Aadarsha	Bhaktapur	Bagmati Province
37ef44a9-b9af-47a4-983b-d52ae9952098	10007166521	Central kitchen and Restaurant	27.737698100000003	85.31913610000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.072+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
03e78f83-5dc2-44c7-a182-2b16febf6d35	5581858129	Hill Top Restaurent And Bar	28.1721642	84.0919109	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.881+05:45	Piple marga	\N	Pokhara	Gandaki Province
62f6d8da-a217-41d9-b288-3d7d251b2aff	5581858134	Lake Touch Restaurent And Bar	28.1731619	84.0937274	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.881+05:45	Piple marga	\N	Pokhara	Gandaki Province
d0d030fc-09ff-451c-8c0f-f6caa0871b87	5581858135	Open Lake Restaurent	28.1727305	84.0932246	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.881+05:45	Piple marga	\N	Pokhara	Gandaki Province
899ca7e1-b81a-4244-9af7-63c95d422e8b	5581858137	Red Ross Restaurent	28.171179400000003	84.0910587	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.881+05:45	Piple marga	\N	Pokhara	Gandaki Province
fa8fd269-fcb5-413b-8376-0c642eb2deb3	1096317916	Korean Taste Restaurant	27.674317900000002	85.3182364	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.691+05:45	Na Tole Marg Dakshin	\N	Lalitpur	Bagmati Province
8480335d-85b0-4e82-aa08-99d042b13676	5571113312	Kathmandu Momo and Aloo Housw	28.2343295	83.9833284	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.879+05:45	Pokhara Baglung Highway	\N	Pokhara	Gandaki Province
624ba25c-35b4-46c1-861b-00ee22b12e85	5598345171	Bhadrakali Restaurant	28.212816200000002	84.0100405	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.883+05:45	Street No 8, B.P Marga	\N	Pokhara	Gandaki Province
6eb24d9b-7746-40d9-877f-5d8118845b88	10017313506	KWALITY CAFE	27.7424171	85.33291720000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.105+05:45	Samanantar Marg	Narayan Gopal Chowk	Kathmandu	Bagmati Province
219b615e-57c8-4bfe-ad51-f6ec5de8c381	5598608593	Adarsha Foods	28.211765000000003	84.0089884	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.883+05:45	Bhadrakali Marg	Maula Marga Tol	Pokhara	Gandaki Province
94666fa1-134e-4af2-9880-bc4a6db9a9d7	5618740228	Saurya Majhthana Staff Hotel	28.222313500000002	83.9925113	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.885+05:45	Tulasi Marg	\N	Pokhara	Gandaki Province
e7c50b5e-ba27-4ae4-b0f2-3daeb2487d6f	5619650422	Sunflower joshi cafe	27.7115931	85.30989620000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.885+05:45	J.P. Road	Paknajol	Kathmandu	Bagmati Province
e1e8655b-b197-4f54-935a-5707589e5e74	6235703085	Laughing Bird Cafe and Restaurant	27.7116076	85.30915440000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.898+05:45	J.P. Road	Paknajol	Kathmandu	Bagmati Province
e85ebc60-81de-447b-a94c-172e9fb56c68	10035659751	Yeti Food Junction	27.7448452	85.3333363	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.107+05:45	Dhapasi Marg	Tokha	Kathmandu	Bagmati Province
b1846a5a-1b8e-43ee-afff-860a00f57433	5617018324	Luwangsha Cafe	27.713554100000003	85.3115946	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.885+05:45	Narsingh Chowk	Lut Chok	Kathmandu	Bagmati Province
916abfb9-f0e6-4bcf-8e3c-5dc75cc27344	5619650421	Sunflower joshi cafe	27.711495900000003	85.3099988	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.885+05:45	Shanti Shikshya Marg	Tahiti	Kathmandu	Bagmati Province
02bd58da-96fe-4984-8ae8-94bf25cceb4d	6091032686	Grill Me	27.6808252	85.31045490000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.896+05:45	Bakhundol	Arun Thapa Murti Chowk	Lalitpur	Bagmati Province
af7f389d-d374-4b1e-ade0-01539c6b8b14	6249947816	Hankook Sarang Korean Restaurant	27.716719800000003	85.3319587	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.898+05:45	Gahana Pokhari Marga	Kotal Tol 	Kathmandu	Bagmati Province
d3d433f6-51f5-4d71-824c-53c5c8a25ac0	1280030926	Unique Restaurant	28.1722383	84.09216880000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.692+05:45	Piple marga	\N	Pokhara	Gandaki Province
45b48a90-99c9-4557-9a9f-bf5696e99df4	1292131580	Blue Lake	28.2163366	83.9587527	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.692+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
bc7839dd-b5b4-4a1d-85a9-cab28343cb3b	1322169366	Elite Cafe	28.200276100000004	83.9468765	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.692+05:45	Peace Pagoda Road	\N	Pokhara	Gandaki Province
c1bff2b7-8950-41f3-a656-be4adfb3210c	1551745110	Revolving Restaurant	27.703202100000002	85.3092843	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.698+05:45	Dharma Path	\N	Kathmandu	Bagmati Province
29615b1d-88da-48de-85a6-7138f9546d6d	1534450706	Pyongyang Okryu Gwan Restaurant	27.711052900000002	85.3196628	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.697+05:45	Parya Tak Marga	Kamalpokhari	Kathmandu	Bagmati Province
5b3c3d25-c895-4931-b934-acac0cb01f23	1551745102	Cosmo De Cafe	27.704721000000003	85.3061516	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.698+05:45	Yatkha Road	Pyaphal	Kathmandu	Bagmati Province
b3008f55-f7e9-4465-b7af-90088052d3fc	6161418285	Anatolia	27.711942500000003	85.30967410000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.897+05:45	J.P. Road	Paknajol	Kathmandu	Bagmati Province
4edf77a0-e160-4759-ad52-892395e47d6d	6098563295	Shyam Dai Ko Haasko Choila	27.675733700000002	85.308217	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.896+05:45	Bakhundol	Dhobighat	Lalitpur	Bagmati Province
44efe4e3-0d52-4c99-b224-4db9f8977fd3	6109447888	Chicken Station	27.752830600000003	85.3270068	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.897+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
54be707c-e030-40fa-b77d-32f3cc1bf307	6150660789	Thamel cave kitchen	27.714108600000003	85.3118649	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.897+05:45	Thabahi Sadak	Lut Chok	Kathmandu	Bagmati Province
139e4dbd-5237-4fdc-a265-1b53602fc98e	9969484753	Bajrayogini Bhojanayala And Fast Food Resturant	27.7055243	85.3219055	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.062+05:45	Baghbazar Sadak	Baghbazar	Kathmandu	Bagmati Province
3e2b8e97-7287-4d88-9811-122b5f2efb83	3375011136	Red Parrot Resort	27.648957600000003	85.2802942	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.766+05:45	Dakchhinkali Road	Taudaha	Kathmandu	Bagmati Province
a8839935-2d74-4d52-b5f0-1a228ae30f9e	11933327883	Siwakoti Chiya Pasal	27.6654486	85.32428270000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.156+05:45	Batukbhairav Marga	\N	Lalitpur	Bagmati Province
1a00b266-eecd-4260-a6bf-51b05cb2437a	11933416865	Juju Dhau King Curd	27.6715567	85.42291700000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.156+05:45	bharwacho	\N	Bhaktapur	Bagmati Province
e7577eac-f769-41e9-a574-4ab4d0b23c94	2463737039	Mechung	27.7205826	85.3639704	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.736+05:45	Chabhil-Baudha-Jorpati Sadak	Sundar Tole	Kathmandu	Bagmati Province
1ce1002d-d61a-4e38-9c3a-c01d49642ecc	10591479683	ss	27.723724100000002	85.37474610000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.136+05:45	F27	Bensigaun	Kathmandu	Bagmati Province
f1c7892a-390f-41d6-bcad-546ae68dd519	10104876567	Moonlight Restro Cafe	27.674370200000002	85.3887516	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.114+05:45	Araniko Highway	\N	Bhaktapur	Bagmati Province
063d2836-a56d-4461-b2f1-fef563af2540	2072662340	New Purbeli Momo	27.730300300000003	85.32518490000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.721+05:45	Krishna Dhara Marg	Panipokhari	Kathmandu	Bagmati Province
49c76993-f569-4171-99c7-6f2a0d2cb627	10845712461	Bhakari Organic Restro	28.2246357	83.9765012	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.142+05:45	Dharapani Marg	Dharapani	Pokhara	Gandaki Province
b1634b8a-fa51-4523-b717-f81d936a203b	1937702064	The Dream Cafe	27.6705475	85.31960020000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.711+05:45	Kumaripati Jagganath Marga	Kumaripati	Lalitpur	Bagmati Province
2fb61683-854f-4f23-bd2c-d853307e0979	1937703863	The Green Cafe	27.6759908	85.3158284	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.711+05:45	Jwalakhel to Pulchowk Road	Dhobighat	Lalitpur	Bagmati Province
10a3dea0-5dba-4a66-83fb-4b9f7e0f2682	7797050370	Jhir House and Restaurant	28.2129793	83.98158570000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.914+05:45	Simalchaur	\N	Pokhara	Gandaki Province
766abbdb-7e4e-4584-b9bb-6074a9ff7f49	7797050372	Parbat Tandoori	28.212467800000002	83.9814142	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.914+05:45	Simalchaur	\N	Pokhara	Gandaki Province
1acf9620-dd90-4863-b749-37c6e8841265	2684766528	Chiya Pasal	27.669759900000003	85.31251560000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.741+05:45	Damodar Marga	Nakhu Bajar	Lalitpur	Bagmati Province
dc650d18-a92c-4a5f-8ece-c46eada18de9	7797021961	Funky Beans	28.210720900000002	83.98081850000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.914+05:45	Rastra Bank Road	Indrapuri Tol	Pokhara	Gandaki Province
3f7e954c-1666-40ca-8247-e1cb69944078	11936508833	Lumanti Cafe	27.6768898	85.4355098	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.158+05:45	F28	Kamal Binayak	Bhaktapur	Bagmati Province
1d46693c-4a41-4d9e-b92d-17b8a2c9a9c0	5530434849	On The Way Restaurant	28.2347496	83.99767820000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.875+05:45	40DR014	\N	Pokhara	Gandaki Province
bf91903e-3eaa-458a-88b5-7c61c5455cd7	5530434851	Kowloon Chinese Restaurant	28.2347147	83.99659460000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.875+05:45	40DR014	\N	Pokhara	Gandaki Province
fedaabdd-debc-4e01-981a-735a1c615e96	5530434852	The Glory Cafe	28.234751900000003	83.99659460000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.875+05:45	40DR014	\N	Pokhara	Gandaki Province
cd0dee48-05db-4394-b354-a4ff80172b72	5528570641	Syangja Restaurant	28.2013837	83.9937749	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.875+05:45	Ram Bazaar	Milan Tol	Pokhara	Gandaki Province
7d08d83b-1165-423f-9aa6-d808d30efa23	4370515013	Patio 747	27.720366100000003	85.36371580000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.81+05:45	Boudha Main Road	\N	Kathmandu	Bagmati Province
03ea06a6-5ce0-4aab-a88d-08057222bf45	4535630291	Ace	27.714373400000003	85.30855840000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.817+05:45	Paknajol	Tahiti	Kathmandu	Bagmati Province
86cdcd79-855d-49e7-8f06-db6c4be61cb3	4370510395	Serene	27.698899400000002	85.33834200000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.81+05:45	Devkota Sadak	Srijana Tole	Kathmandu	Bagmati Province
5340cb6b-b563-4a3d-8a9b-24d3f1f7b230	4370511146	Tibet Kitchen	27.722037500000003	85.36250460000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.81+05:45	Phulbari street	Dhara Tole	Kathmandu	Bagmati Province
91eeec09-bfa9-4602-8d83-8e54fa0ba0db	8699927593	Thamel Momo Hut	27.714231100000003	85.3116176	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.922+05:45	Thabahi Sadak	Lut Chok	Kathmandu	Bagmati Province
907e0834-efaf-40d6-be47-e2718ac48f4b	4800800626	Utopia	28.210860200000003	83.9560821	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.829+05:45	Bhalchoppa Galli	Baidam	Pokhara	Gandaki Province
557d7555-a775-4333-81ed-0976a3bdefae	9914356109	Pork Hub	27.6759042	85.3131187	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.047+05:45	Damkal-Chakrapath Marg	Dhobighat	Lalitpur	Bagmati Province
e571e7c4-adf7-4984-8775-a9a39a7c84b4	9914381746	Ghaite Tea and Cafe	27.6698348	85.31000130000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.047+05:45	Bhanimandal Sadak	Dhobighat	Lalitpur	Bagmati Province
313e7812-7eb9-405d-9953-93e2f476fd7a	9914381749	Food Fun Friends	27.669425800000003	85.3098035	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.047+05:45	Radha Krishna Marg	Dhobighat	Lalitpur	Bagmati Province
a53f9ebc-315b-45a7-a1f1-1b6faf59bfe9	9520892133	KTM Hunger Station	27.7296279	85.34668900000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.932+05:45	Sir Raj Bahadur Road	Ananda Nagar	Kathmandu	Bagmati Province
9aa34dc4-60f3-4eb7-9a21-79d50fdeda6a	10011753560	Selroti Pasal	27.7464112	85.33040000000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.083+05:45	Hari Marga Tole	Tokha	Kathmandu	Bagmati Province
31c0a30a-d6cf-4e4f-aa24-9461d009d434	4384731621	Sinche	27.6985132	85.338226	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.811+05:45	Devkota Sadak	Srijana Tole	Kathmandu	Bagmati Province
61d7d6f8-a6d5-444e-85e4-a19d950b61f3	2069367165	Namaste Newari Restaurant	27.674101800000003	85.2802006	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.72+05:45	Panga Road	Nayabazar	Kathmandu	Bagmati Province
b3863ea2-70da-4260-a852-f337ac542e5f	4922051724	New Thakali Chulo and Restaurant	27.738281200000003	85.339567	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.833+05:45	Kathmandu Ringroad	Ganesh Basti	Kathmandu	Bagmati Province
67c4b01e-999b-4e3e-9404-a8d7eff56f36	432195178	Mustang Thakali Kitchen	27.6782359	85.3129059	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.68+05:45	Pulchowk Jhamsikhel Marga	Dhobighat	Lalitpur	Bagmati Province
73d0b784-1e22-4816-9900-decd7d243e0a	432195183	Hermann Helmers Bakery	27.678330300000002	85.312612	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.682+05:45	Pulchowk Jhamsikhel Marga	Dhobighat	Lalitpur	Bagmati Province
b9a3bea5-8416-4eef-8b6b-408274a57850	313140391	Wunjala	27.7143297	85.32845560000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.673+05:45	Sama Marg	Kamalpokhari	Kathmandu	Bagmati Province
645ee956-8fbe-4a0d-b99e-a04570721d9a	9527226614	Chakrapath Thakali Chulo And Resturant	27.7394058	85.3387094	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.937+05:45	Milijuli Marg	Narayan Gopal Chowk	Kathmandu	Bagmati Province
f712761a-9393-448d-9b08-b2a276585f3a	9527226615	Syanko Katti Roll	27.739178900000002	85.3393319	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.937+05:45	Milijuli Marg	Narayan Gopal Chowk	Kathmandu	Bagmati Province
a7926538-de4c-4a7c-a613-36e13a4d68f6	3072783382	CS sekuwa	27.7313219	85.34916150000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.749+05:45	Sir Raj Bahadur Road	Ananda Nagar	Kathmandu	Bagmati Province
cbac4fe7-656a-4443-b8fa-de145ad52c72	5581858130	Bee And Cafe	28.1721819	84.0920229	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.881+05:45	Piple marga	\N	Pokhara	Gandaki Province
b28a0bed-335d-458f-b924-f23ec3fdea5a	9527316367	The Steaming Pitcher	27.7454432	85.3414295	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.941+05:45	Dhapasi Marg	Shrijanshil Tol	Kathmandu	Bagmati Province
3ff17edb-bb78-4bfb-a50e-eed3b876bea8	5559145631	Pho 99	27.712227000000002	85.3103646	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.879+05:45	Chhetrapati	Lut Chok	Kathmandu	Bagmati Province
81a64f41-b3d6-46b3-8a85-c9c43ca647b1	5565464974	Talpari Homestay and Resturent	28.219122600000002	83.9223276	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.879+05:45	40DR012	Bhakunde	Pokhara	Gandaki Province
23cd3fb5-df80-4b21-8f68-992291e881f2	5568430540	Momo Hut	27.7142507	85.31123090000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.879+05:45	Narsingh Chowk	Lut Chok	Kathmandu	Bagmati Province
d9421789-c944-4412-879c-af803cba6351	5589588695	Pani Puri Pasal	28.200184	83.9446992	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.882+05:45	Peace Pagoda Road	\N	Pokhara	Gandaki Province
b35ade8a-865b-4efd-a8f6-e1568a57e1b1	5589588715	Swikriti And Sweaker Restaurant	28.200378500000003	83.94438740000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.882+05:45	Peace Pagoda Road	\N	Pokhara	Gandaki Province
44a6f704-fef8-4a7d-8b10-c659ba30f77e	5589588936	Krishna Restaurant	28.200223	83.9443566	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.882+05:45	Peace Pagoda Road	\N	Pokhara	Gandaki Province
6bae026c-df72-4e2c-93cb-7817c9cdfdc1	5589588937	A And A Restaurant	28.200171	83.9443861	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.882+05:45	Peace Pagoda Road	\N	Pokhara	Gandaki Province
b48e0b0a-36b6-4f6a-8cf1-83feffaa05cd	7230882985	Silver Spoon	28.2158693	83.95862910000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.912+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
4541956b-b1ee-4de2-bafe-3de3bd99c7ab	10011854447	Mithai Pasal	27.754140900000003	85.3183128	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.084+05:45	F81	Baluwapati Chowk	Kathmandu	Bagmati Province
d4b3819a-70de-4dfa-8642-95f3e73efec7	1957221816	Taas Mahal	27.7159316	85.3245943	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.714+05:45	Nag Pokhari Sadak	Kamalpokhari	Kathmandu	Bagmati Province
d024c7cc-787b-4732-8641-9dd03cd880c5	10011854452	Miracle resturant	27.753923500000003	85.3184502	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.084+05:45	F81	Baluwapati Chowk	Kathmandu	Bagmati Province
80f25887-b3ad-408a-b4d4-422c64e0346d	10011873428	Bhumika Guest House	27.736203200000002	85.31206750000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.084+05:45	Buddha Marga	Deepjyoti	Kathmandu	Bagmati Province
ab171c76-f957-4e7c-8807-9bc3907a1e74	9969478208	Super Lumbini Fast Food And Tandoori Bhojanayala	27.7059105	85.31752870000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.062+05:45	Baghbazar Sadak	Baghbazar	Kathmandu	Bagmati Province
5879570a-74bd-46db-a158-22204fb0d2de	8699943041	Legendary Fresh Food Kitchen	27.715075700000003	85.31152390000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.922+05:45	Dabali Marga	Lut Chok	Kathmandu	Bagmati Province
623c1d4a-4d00-4158-851f-7a6169190569	8699943045	Daami	27.715039100000002	85.31169700000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.922+05:45	Korja Galli	Lut Chok	Kathmandu	Bagmati Province
d509dbcf-53a7-4427-adac-3df59f49fba0	8699944169	The Kathmandu Kitchen	27.7156872	85.3114998	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.922+05:45	Thamel Marg	Lut Chok	Kathmandu	Bagmati Province
78a772ac-a95f-47c0-ae30-7fbfde988564	9967127800	Pasang Hotel	27.7017427	85.3207587	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.058+05:45	Exhibition Road	Baghbazar	Kathmandu	Bagmati Province
15ad2093-8327-4f8a-896d-9e2da59dc03b	5508848781	The Grand Food Land	28.215045200000002	83.9860305	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.871+05:45	New Road	\N	Pokhara	Gandaki Province
d9ad109a-9610-431a-bdb1-1c1712c551b0	9967127806	Jayswal Fastfood	27.701569600000003	85.3219481	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.058+05:45	Exhibition Road	Baghbazar	Kathmandu	Bagmati Province
89494bb8-ba14-4a84-82e9-384c5f9aa47a	10024851026	MoMo Center	27.682993200000002	85.34442700000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.106+05:45	Subidha Marg	Basuki Nagar	Kathmandu	Bagmati Province
f23a27a1-eac9-497c-8dd6-aaf17a178c4a	12027497455	Watering Hole	27.6787862	85.3110092	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.164+05:45	Pulchowk Jhamsikhel Marga	Dhobighat	Lalitpur	Bagmati Province
1483ba07-380c-4712-b4d6-c7e2a1663d9c	10121417309	Cafe Aalya	27.684800900000003	85.3455217	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.121+05:45	Sudidhanagar Marg	Basuki Nagar	Kathmandu	Bagmati Province
9300f5d5-b46e-4a15-95b5-9c9c785d5e31	10017342644	Khadadevi food cafe	27.742630100000003	85.3335581	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.105+05:45	Dhapasi Marg	Tokha	Kathmandu	Bagmati Province
71bd8285-526c-421c-94c7-b169baad195d	10017464346	Sukundri Sekuwa corner	27.7450374	85.3331847	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.105+05:45	Dhapasi Marg	Tokha	Kathmandu	Bagmati Province
1ae5999c-1bb6-416c-8a03-61bdaea6cbdd	10034071024	Momo Center	27.742341600000003	85.3318462	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.107+05:45	Samanantar Marg	Narayan Gopal Chowk	Kathmandu	Bagmati Province
13c4da4c-98ac-4496-9f02-1a082c685438	10110783807	Thakali Kitchen	27.676998	85.3982332	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.115+05:45	RadheRadhe Road	Madhyapur Thimi	Bhaktapur	Bagmati Province
977c07c3-9280-4d39-b138-1f2f968d05e3	10121542436	Special MoMO	27.6848704	85.34661750000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.126+05:45	Munibhairab Marg	Basuki Nagar	Kathmandu	Bagmati Province
eb2d3d17-67eb-4726-ab11-0785ead4700a	10121542486	Bhattarai Khaja And Cafe House	27.684822200000003	85.3456551	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.126+05:45	Sudidhanagar Marg	Basuki Nagar	Kathmandu	Bagmati Province
6cb9b6ec-9658-4adc-b94c-a3795ab763ce	1858151612	Lalit Bhojanalaya	27.678669000000003	85.3211318	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.701+05:45	Madan Marga	Pulchowk	Lalitpur	Bagmati Province
8265a6f5-02a7-4604-acd4-6c6292cb8165	1894339214	7th heaven	27.690593200000002	85.33902520000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.703+05:45	Minbhawan Marg	Suruchi Tol	Kathmandu	Bagmati Province
d456d1af-4d7c-4c11-98c0-d71f80eb13c0	2212605788	Graveaty	27.7123375	85.313179	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.733+05:45	Bharma Kuamri Margh	Kamalachi	Kathmandu	Bagmati Province
82d462a1-caa7-4c06-b75e-bd544389265d	2212767321	Bharyang Muni Ko Momo Pasal	27.7227728	85.363138	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.733+05:45	Phulbari Marg	Bhual Dhanda	Kathmandu	Bagmati Province
6f75f509-bc1f-4234-897b-ea80c594212f	1894295856	Samurai restaurant	27.6817722	85.3199252	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.703+05:45	Yella Dhwakha Marg	Kupondole	Lalitpur	Bagmati Province
5804a62c-711d-4929-8ea9-b82046a5368d	1555308323	Tequila Dance and Restaurant Bar	28.2111115	83.9570628	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.698+05:45	Lakeside Road	Baidam	Pokhara	Gandaki Province
745874b7-782f-42ec-9190-79fa7552446d	1555308328	Freedom Cafe	28.220979300000003	83.9559105	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.698+05:45	40DR012	\N	Pokhara	Gandaki Province
5ab9b713-5e77-4db0-9633-1210611ce4d9	1905315994	Ice cafe	27.700099100000003	85.3218351	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.707+05:45	Ram Shah Path	Baghbazar	Kathmandu	Bagmati Province
15b27723-6aee-4ae3-9ff7-0299c4886ada	1905351047	New Plaza Kitchen	27.703035900000003	85.32278930000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.707+05:45	New Plaza Marg	Bansh Ghari	Kathmandu	Bagmati Province
034b4b42-874f-48e1-bfd6-7c69a85e2582	1937710492	A Cafe and Lounge	27.675015400000003	85.3023732	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.712+05:45	Eku Hiti Marga	Dhobighat	Lalitpur	Bagmati Province
1cc3f0bd-56df-4460-967f-d6dc402fecc8	2805500021	Everest Steak House	28.2140141	83.9586182	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.744+05:45	Baidam Road	Baidam	Pokhara	Gandaki Province
b2611752-698b-4372-8c11-75bac2461264	5508848776	Facebook Friends Cafe	28.2144964	83.9859148	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.871+05:45	New Road	\N	Pokhara	Gandaki Province
12e2b052-b7df-48e8-b066-17db9fd10d9a	1815689369	Transit Cafe	27.6737995	85.3119374	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.7+05:45	Chidiyaghar Marga	Dhobighat	Lalitpur	Bagmati Province
d305a79c-2755-451b-bcf0-ce7d7890f2bc	4395558015	Little Kathmandu	27.6985306	85.3380281	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.811+05:45	Devkota Sadak	Srijana Tole	Kathmandu	Bagmati Province
10d3d3fa-a046-4389-beea-754db7d82c71	10011926467	Hamro Fast Food Cafe	27.743177900000003	85.330087	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.085+05:45	Hari Marga Tole	Tokha	Kathmandu	Bagmati Province
d58b7e27-c2c2-4b57-b565-2c938a10cf8b	2017932099	Season Restaurant and Bar	27.7189383	85.3323924	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.718+05:45	Bishalnagar Marg	Dhalku Chowk	Kathmandu	Bagmati Province
c35a3087-2aeb-42c1-ad9f-40065c0fed41	2018043131	Bhojan Griha	27.706552600000002	85.32534890000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.718+05:45	Gurju Marg	Gyaneshwar	Kathmandu	Bagmati Province
2ff1c9f4-7362-4a4c-b1fa-63826662095f	1960049080	Shreya Cafe	27.724384200000003	85.3399976	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.714+05:45	Baraha Marga	Dhumbarahi Pipal Bot	Kathmandu	Bagmati Province
7ae4ce0b-3fb8-41ee-9669-5f04985af82d	1964034150	Mela Restaurant and Bar	27.717584700000003	85.3164029	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.714+05:45	Narayan Gopal Road	Lut Chok	Kathmandu	Bagmati Province
50c4a33e-b43b-40e7-9636-a7308aaeac57	5509844243	Brown Eyes Restro	28.222167300000002	83.99009500000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.871+05:45	Bastolathar Road	Chipledhunga	Pokhara	Gandaki Province
ba28e1de-e7d8-491a-9998-fe3e1fcb8af2	5069224721	Cafe Aamu	27.679686800000002	85.318403	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.837+05:45	Krishna galli	Pulchowk	Lalitpur	Bagmati Province
242b370e-45dc-4d30-adea-4854b36e59b5	3337226912	Fork	27.6852802	85.34558240000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.76+05:45	Sudidhanagar Marg	Basuki Nagar	Kathmandu	Bagmati Province
c9c0f32b-98f3-45e3-a565-dcc558af9147	3375011139	Left Bank Resort	27.6496464	85.2828406	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.766+05:45	Dakchhinkali Road	Taudaha	Kathmandu	Bagmati Province
73798569-aee7-4d08-a5b5-b4a13c542cc8	3375011140	Lasun Cafe	27.649679300000003	85.2811925	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.766+05:45	Dakchhinkali Road	Taudaha	Kathmandu	Bagmati Province
ab5e93dd-91fd-4ec7-91ea-35d41959611a	1930532956	OR2K	27.7148007	85.3110168	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.709+05:45	Mandala Street	Lut Chok	Kathmandu	Bagmati Province
2a6e3a6a-1fef-49ce-b561-b94028f5fd9e	10121424337	Happy Momo Center	27.6788953	85.34217240000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.121+05:45	Seti O.P. Marga; Gyanodaya Galli; Seti O.P. Marga	Seti O.P.	Kathmandu	Bagmati Province
2de395df-3e01-4992-9140-bf54fd77d173	10121424361	Metro City Cafe	27.6762787	85.3387221	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.121+05:45	Amaravati Marg	Thulodhara	Kathmandu	Bagmati Province
9d79e9a5-d886-40e1-bb6e-90e11bdc741d	5094087622	Sathi Food Cafe	27.705663700000002	85.32507000000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.838+05:45	Dillibazar Sadak	Ghattekulo	Kathmandu	Bagmati Province
665f8212-bfab-4eda-ab49-4a2e6cf92663	5093636698	Chautari Roti Pasal	28.2446814	83.9892095	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.838+05:45	Bhimkali Patan Marg	Bhimkalipatan Chowk	Pokhara	Gandaki Province
f2cb8c8a-c028-4cbe-890a-75fd79fb9737	1898540389	Noyoz Eatery	27.721855700000003	85.33132090000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.704+05:45	Thirbam Sadak	Dhalku Chowk	Kathmandu	Bagmati Province
48dcfd75-e164-45ef-8508-489f8b068439	4340739490	OR2K	28.2134749	83.9569981	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.808+05:45	Lakeside Road	Baidam	Pokhara	Gandaki Province
6fec838c-2045-46d4-ae60-b336d299dee3	5491531720	Samaya By The Lake	28.225610000000003	83.9448354	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.871+05:45	40DR012	Bhakunde	Pokhara	Gandaki Province
60b9b661-39b2-45d5-a577-593e71286933	9899587711	Pizzahood	27.680215200000003	85.3101273	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.046+05:45	Bakhundol	Arun Thapa Murti Chowk	Lalitpur	Bagmati Province
c3d2f1cb-e0a0-422d-b6d4-60d0b2d359bd	9899587712	Korean Peace Family Restaurant	27.680321000000003	85.3101642	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.046+05:45	Bakhundol	Arun Thapa Murti Chowk	Lalitpur	Bagmati Province
c418ae5d-9c95-4680-bb7f-2e73b53166a8	4942542721	Rest Point	28.219852500000002	83.95775710000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.835+05:45	40DR012	\N	Pokhara	Gandaki Province
750827ba-1568-4349-854e-ba0496381481	4957716421	Lake Mandala Lounge	28.214213500000003	83.9577422	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.836+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
07385c6a-b77b-4195-8305-7aae948fae40	4956103026	Gopal Hotel	27.7267559	85.4053196	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.835+05:45	Puspalal Marg	Thali	Kathmandu	Bagmati Province
b23ee408-13e6-4655-9744-d1cdffb7e596	4956103088	Sindhu Cottage	27.7278272	85.4045693	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.836+05:45	Puspalal Marg	Thali	Kathmandu	Bagmati Province
c3dcf513-83a9-4879-8fda-a4989243fabf	5581858132	Shanti Lake Restaurent	28.173040800000003	84.093411	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.881+05:45	Piple marga	\N	Pokhara	Gandaki Province
1bfbfcc0-19ad-4086-bac6-ab29eccf95bb	5437769475	Tamu restaurant	28.2071678	83.96353040000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.859+05:45	6th Street,Peaceful Road	Baidam	Pokhara	Gandaki Province
f62cb365-da0c-4e26-9a7f-3a6c799df743	5443291921	cafe bliss	27.713903700000003	85.31128410000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.86+05:45	Narsingh Chowk	Lut Chok	Kathmandu	Bagmati Province
0984a735-a5e6-457b-a1fd-a047737da85d	5520239929	You and I	28.218636900000003	83.95863800000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.873+05:45	40DR012	\N	Pokhara	Gandaki Province
93ec3dcb-04c0-4529-9c8f-d181c8ba45d8	5521528094	PFC Restaurant	28.211069400000003	83.9865176	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.873+05:45	Naya Bazar	Chipledhunga	Pokhara	Gandaki Province
3639a8af-4d14-4203-8440-993fba273a05	5521528103	HK Restaurant	28.2114526	83.9868204	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.873+05:45	Naya Bazar	Chipledhunga	Pokhara	Gandaki Province
c34cf814-e93f-4eb7-8503-c921149a122d	5521528105	Family Restaurant	28.2115149	83.98680630000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.874+05:45	Naya Bazar	Chipledhunga	Pokhara	Gandaki Province
259c0c7e-c8dc-431e-accb-5b3c79c7bae0	7174016666	Namaste Kitchen and Banquet	27.719784500000003	85.32820360000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.912+05:45	Shubarna Shamsher Road	Jor Pipal	Kathmandu	Bagmati Province
f3d82e5b-80db-4939-b8b7-04a04ded9929	6046032271	Green Cafe	27.696748000000003	85.35093880000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.894+05:45	Sinamangal Marg	Bhimsen Gola	Kathmandu	Bagmati Province
0b5b3203-0b17-48dc-966b-fb3690b66d25	6046631088	Thamel cave kitchen	27.7140209	85.3118517	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.894+05:45	Thabahi Sadak	Lut Chok	Kathmandu	Bagmati Province
2ead6373-4b13-4e55-bc86-2c5ebdd65c88	6041868688	Dalai la	27.716414	85.3099104	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.894+05:45	Chaksibari Marg	Sorakhutte	Kathmandu	Bagmati Province
27804c25-60a8-4dbe-aeae-66a14d6f3002	6047608809	Hotel Point	28.208355800000003	83.9590237	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.894+05:45	13th Street (Barahi Path)	Baidam	Pokhara	Gandaki Province
31d00ba0-97ce-4e3c-9c14-d677c1b3b767	8696865575	Qi Lu Ju Xin Yuan Restaurant	27.7134959	85.30968700000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.92+05:45	Kunphen Marg	Paknajol	Kathmandu	Bagmati Province
ecdcb19b-9b8c-438a-9b91-7d98bf2c0bef	7187648185	Ramailo Chautari Cafe	27.7225539	85.33594330000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.912+05:45	Banshidhar Marga	Sungava Chok	Kathmandu	Bagmati Province
d3d7e029-3207-47c6-a30b-ba3638cfb25e	7190349785	Chhapro Foodland	27.7249337	85.3415717	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.912+05:45	Baraha Marga	Dhumbarahi Pipal Bot	Kathmandu	Bagmati Province
3ffcb402-e614-4d56-92c3-a3a78e4df0fb	7248166085	Yala Durbar	27.679193700000003	85.3294479	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.912+05:45	Sankhamul Marga	Chobu Nani	Lalitpur	Bagmati Province
c1ff4b57-2d3c-4fff-a9b0-f7a6197c6cbb	8569232736	Kankali View Point Restaurant	27.7052431	85.2564814	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.917+05:45	Miteri Marga	\N	Kathmandu	Bagmati Province
34ef1473-41d7-4467-b2f9-864961aa5a4c	8569256562	Chule Nimto Restaurant	27.7031071	85.2556594	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.917+05:45	Miteri Marga	\N	Kathmandu	Bagmati Province
ce3b363b-0b70-4358-be55-effdbd973851	8588652584	Alev Kebab Sultanate	27.7170634	85.33135770000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.917+05:45	Gahana Pokhari Marg	Kotal Tol 	Kathmandu	Bagmati Province
820dffb0-1af2-4f72-abe2-ee248ea006ce	8695693493	Pizzon The Italian Food	27.7146951	85.3125883	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.917+05:45	Amrit Marg	Lut Chok	Kathmandu	Bagmati Province
a1d7470b-689b-4682-a761-df1a38ed7fc3	9574690216	Pabitra and pratik panipuri	27.6699799	85.2793505	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.948+05:45	Karki gaun marga	Karki Gaon	Kathmandu	Bagmati Province
688758e0-6174-48a0-981b-8ce6de878d56	9528648219	Palpali Bhojanalaya	27.7385641	85.3254611	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.942+05:45	Kathmandu Ringroad	Tokha	Kathmandu	Bagmati Province
82748bdc-4bdd-40bd-bb22-5ba548d49161	9528648517	Budda subba momo	27.738509800000003	85.325343	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.942+05:45	Kathmandu Ringroad	Tokha	Kathmandu	Bagmati Province
345acd2f-8e9e-42a3-a4e2-4d9c5166f40b	9528648817	Ramechhap Everest momo	27.7383214	85.3249555	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.942+05:45	Rambabu Marg	Tokha	Kathmandu	Bagmati Province
49cc2cc6-607f-4265-91c3-f4f0f726497e	7180984286	chill out	27.7104207	85.3125253	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.912+05:45	Jyatha Marg	Kamalachi	Kathmandu	Bagmati Province
2ec320dd-5976-4487-baea-06cd9116af0a	9525343713	Lil Bites	27.7241795	85.3398409	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.935+05:45	Baraha Marga	Dhumbarahi Pipal Bot	Kathmandu	Bagmati Province
c784bebe-b829-49cd-945b-7482eebfd4b3	5484691457	August Lake Resturent	28.223138000000002	83.9525802	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.868+05:45	40DR012	\N	Pokhara	Gandaki Province
833e09a5-6f0d-417d-8684-1bedf809157b	9719766410	Rashna Store	27.678367400000003	85.27536640000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.966+05:45	Than-ba-hah Lanh	Than-ba-hah	Kathmandu	Bagmati Province
1035162e-79f3-4831-bd4d-c3e980032bdf	10015268731	FAMILY ZONE RESTURANT	27.739769000000003	85.31402440000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.094+05:45	F81	Tokha	Kathmandu	Bagmati Province
ac3eba6e-82c6-427b-9ac9-f818eae30601	10014715764	B And H Resturant	27.7371246	85.31793830000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.092+05:45	Pragati Sadak	Nav Milan Bastii	Kathmandu	Bagmati Province
5c3467b6-cfcd-4a7c-a49b-2d20a0ecf63f	9657788316	Rashika kitchen	27.6812587	85.28020330000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.956+05:45	Way to TU	Chi thu Dhokha	Kathmandu	Bagmati Province
1145881c-091d-4e9d-9565-3d471245986d	10015378646	Meet and Eat Cafe	27.7547767	85.3290645	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.095+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
7af21212-69e8-462d-ae45-1cf1b0e7e56e	10015413990	MANAKAMANA HOTEL AND RESTURANT	27.750683400000003	85.32875460000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.095+05:45	Deep Marg Contd.	Tokha	Kathmandu	Bagmati Province
7ad67125-b81e-4390-ab0e-d4a29f23ebdd	10015421391	New Gandaki and Butwal Guest House	27.7526484	85.3268341	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.095+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
f760e554-3a51-480a-8544-cc4c85aaa0de	10015421392	Khuraki Cafe	27.752612900000003	85.3268202	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.095+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
04aa3f6b-b070-4a0c-9f7f-3c48d5cc15a5	9657791019	China Chautari Cafe	27.6758606	85.2811568	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.956+05:45	Kirtipur Ring Road	Nayabazar	Kathmandu	Bagmati Province
81e8c6a5-ed09-44e3-a0c1-69f35971a2dc	10015719040	Food Station	27.753387	85.31815730000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.097+05:45	F81	Baluwapati Chowk	Kathmandu	Bagmati Province
eef31805-d936-4d4d-a93d-9f6ffdea8302	10017313464	Triveni Foodland	27.741953600000002	85.3309677	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.104+05:45	Kathmandu Ringroad	Narayan Gopal Chowk	Kathmandu	Bagmati Province
0b09f495-235c-472b-be0a-74f9631ff5fd	10017313469	The Burger House And Crunchy Fried Chicken	27.7420477	85.3311286	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.104+05:45	Kathmandu Ringroad	Narayan Gopal Chowk	Kathmandu	Bagmati Province
9d74c574-b6f6-4628-8a51-521e095d2da6	10017313473	Sandaar momo and stick food	27.742289300000003	85.3317049	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.104+05:45	Samanantar Marg	Narayan Gopal Chowk	Kathmandu	Bagmati Province
6e18da63-989b-48f1-b36e-e16587d8ca8a	10102562317	A One cafe	27.699602700000003	85.32868930000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.114+05:45	Tanka Prasad Ghumti Sadak	Ghattekulo	Kathmandu	Bagmati Province
2322204d-a14e-40d5-8691-e0eb289908f8	9657792043	Mai mai cafe and fastfood	27.679676800000003	85.2814767	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.956+05:45	Kirtipur Sadak	Chi thu Dhokha	Kathmandu	Bagmati Province
ee551ca0-df7e-47fb-a71a-74cdcfd0e7b8	9657792984	Lumbini palpa bhojanalaya	27.677344400000003	85.28073350000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.956+05:45	Kirtipur Ring Road	Chi-ba-hah	Kathmandu	Bagmati Province
588a905f-8d5c-4479-b5a5-a48f1910dbfd	9657794471	Lumbini tandoori and fast fod	27.680945700000002	85.27929420000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.957+05:45	Way To Naya Bazaar	Chi-ba-hah	Kathmandu	Bagmati Province
5a50935e-4aa8-445c-ae8b-d8ca14459db5	9657798143	BP store	27.681042	85.2814202	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.957+05:45	Way to TU	Chi thu Dhokha	Kathmandu	Bagmati Province
f45bc9f8-9d99-4d05-a838-340744f871e2	10110407247	Ramesh Cafe	27.6853498	85.38778070000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.115+05:45	Bode to Purano Thimi	Naagdesh (Nagadesh)	Bhaktapur	Bagmati Province
7e81810a-6833-468d-a58b-7dbb3f8771cc	10110630364	Madhyapur Banquet	27.682949100000002	85.3886497	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.115+05:45	F86	\N	Bhaktapur	Bagmati Province
24316fdd-3be6-4203-a1e9-9031c2726ca6	9657804785	Jatra restaurant	27.678552000000003	85.27792000000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.957+05:45	Kirtipur Ring Road	Chi-ba-hah	Kathmandu	Bagmati Province
2f1890f3-87c6-4192-a547-09d703753e29	10108212240	Red Apron plus	27.6673538	85.3657544	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.115+05:45	Kaushaltar-Balkot	Purbeli Tol	Bhaktapur	Bagmati Province
a665661e-362f-42d4-92d7-04d9bac05328	10110364489	Thimi Banquet Pvt Ltd	27.6732051	85.3813434	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.115+05:45	Araniko Highway	Araniko Basti	Bhaktapur	Bagmati Province
195091fa-5ac5-45cc-9ee8-b95dedcf8bd3	10121403408	Aaha Lumbini Cafe	27.683329500000003	85.3484231	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.119+05:45	Subidha Marg	Basuki Nagar	Kathmandu	Bagmati Province
3689f789-7608-43fa-bf93-215f550704db	10121397655	Junction Cafe	27.684532100000002	85.3444826	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.118+05:45	Mitra Marga	Basuki Nagar	Kathmandu	Bagmati Province
c2386e32-bea0-4d16-803b-991acc45a51d	10121397660	Traditional Nepali Food Center	27.684733100000003	85.34448880000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.118+05:45	Shri Ganesh Marg	Mahadevasthan	Kathmandu	Bagmati Province
394dc4e7-0bac-4453-8278-caff7d786ad0	10036366822	Masala Free Boso Rahit Momo Restaurant	27.742833500000003	85.3336464	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.108+05:45	Dhapasi Marg	Tokha	Kathmandu	Bagmati Province
9b752253-34d9-4c00-b4a5-24595e261500	9662467560	Education canteen	27.6828569	85.2835373	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.957+05:45	Way to TU	Chi thu Dhokha	Kathmandu	Bagmati Province
2e35baa5-670b-4137-8f8a-7c380a76af44	9662468504	Aries canteen	27.681354300000002	85.28523530000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.958+05:45	Golden Jubilee Garden path	Nayabazar	Kathmandu	Bagmati Province
7f8be770-2f68-4c66-804a-9ea91bc312e9	10137592127	Lotus Cafe	27.674324700000003	85.3720818	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.127+05:45	कुशल‌ भैरव मार्ग	Araniko Basti	Bhaktapur	Bagmati Province
8fcecfc8-dacd-4c3e-9efa-0c9ee024e659	10121424439	C Sekuwa and Fast Food	27.678862400000003	85.34436260000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.122+05:45	Shri Shanta Marg	Seti O.P.	Kathmandu	Bagmati Province
a29f95e6-6d71-4470-8264-0a74c77639a3	5470221968	Heavenly Garden Resturant	28.218297800000002	83.9838991	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.863+05:45	Simalchaur	\N	Pokhara	Gandaki Province
3580cf9c-e133-40ba-9f41-ef739c2db8da	5470221969	New Thakali Bhancha	28.2199959	83.98363280000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.863+05:45	Bagale Tol	\N	Pokhara	Gandaki Province
1934d427-2192-4196-bba6-1280f8e35dc2	1898521001	Espression the cafe	27.7150782	85.32650140000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.704+05:45	Sama Marg	Kamalpokhari	Kathmandu	Bagmati Province
3a35f8ab-78db-4cd4-b6c5-533214fb7dce	2083743541	De Kumari Restaurant	27.7044779	85.306195	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.724+05:45	Yatkha Road	Pyaphal	Kathmandu	Bagmati Province
d2736d69-ad3c-4b90-85ee-4b50f04deba9	5470393633	Kalpana Sukuti House	28.1918989	83.97695300000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.863+05:45	Museum Marg	RatoPairo	Pokhara	Gandaki Province
344349be-3f39-44bf-9305-af59fd74f4ac	11438657134	Mayur Restaurant	27.673400500000003	85.4349593	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.15+05:45	Thalachhen	\N	Bhaktapur	Bagmati Province
63a25f4e-2b62-4f0e-a4e0-66b6044126c8	11505176620	Mayalu Cafe	27.7352527	85.3054086	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.15+05:45	Balaju Machha Pokhari - Bypass	Machhapokhari	Kathmandu	Bagmati Province
79a76a06-1749-43b2-83aa-fe8a83a174be	11412794970	Le petit bistro	27.7154957	85.2884439	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.149+05:45	Manjushri Marg	Dallu	Kathmandu	Bagmati Province
46cf4553-cf72-48d4-9676-73b7f344a0ee	11434374068	See first cafe	28.2566141	83.9778539	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.15+05:45	Lamachaur Marg	Tallo Dip	Pokhara	Gandaki Province
e401f57e-7874-4cb8-b890-de954068693c	9655490932	Danu Tapari Momo	27.688630200000002	85.27792860000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.954+05:45	Sahid Basu Smriti Marg	\N	Kathmandu	Bagmati Province
ed993877-1af6-46cf-b850-a41970bf51a2	9655508588	Temple View Restro and BBQ	27.6801728	85.27468560000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.955+05:45	Than-ba-hah Lanh	Than-ba-hah	Kathmandu	Bagmati Province
5a9140c9-05c4-4bd7-a024-890a757f56fd	4266642364	The Last Friday Bar and Grill	27.723184000000003	85.32152570000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.806+05:45	Lazimpat Sadak	Narayan Tole	Kathmandu	Bagmati Province
5d45cfc4-ee36-42e1-a2b0-ef562383de4e	4269544989	madhyapur unique restaurant	27.6903834	85.39417470000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.806+05:45	SanoThimi-Bode	dhungedhara	Bhaktapur	Bagmati Province
9a16788e-ff8e-46d7-93e3-a8c4a727a28a	12039494711	Shiwani Restaurant Fewa Fish	28.214324400000002	83.95654760000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.164+05:45	Camping Chok Road	Baidam	Pokhara	Gandaki Province
85cf74f0-4eef-4557-b386-90d6b5aae854	5425866923	Lake Lovers Cafe	28.2197867	83.9577816	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.858+05:45	40DR012	\N	Pokhara	Gandaki Province
74941ba4-bdf7-4779-9dae-245cc8b8a6da	5412418168	Charlotte Cafe	27.6703332	85.3201528	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.858+05:45	Yala Sadak	Dhobighat	Lalitpur	Bagmati Province
cc1ec3b9-b9f4-4442-bfb1-35a193df571a	5416199061	Kukurika	27.7232123	85.35978580000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.858+05:45	Hyatt - Boudha Marg	Dhara Tole	Kathmandu	Bagmati Province
3a7ea9db-170a-4f6f-8383-2d893c894596	4707636096	Roadhouse Cafe	28.2137402	83.95745240000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.822+05:45	Lakeside Road	Baidam	Pokhara	Gandaki Province
078316a3-f1e3-4cb3-be17-218f72b0d8eb	4707636097	Sagar Momo	28.214136900000003	83.9569542	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.822+05:45	Camping Chok Road	Baidam	Pokhara	Gandaki Province
3865b0fb-ac98-4ea8-89cf-e80e5a5e0d2d	4720197691	The Pizza Cutter	27.701494800000003	85.3076635	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.822+05:45	Jor Ganesh Galli	\N	Kathmandu	Bagmati Province
69329177-962b-462f-a503-59d01196e1d2	4721722990	Boomerang Restaurant	28.209781900000003	83.9568864	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.822+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
e0891e68-acb5-4f03-96d4-69ff635f8b70	3067780669	Central Cafe	27.7016515	85.3106108	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.747+05:45	Pukhudha Marg	\N	Kathmandu	Bagmati Province
61937356-5ea4-45cc-8dc5-b579dcb4da25	5472241531	Gurung Cafe	28.190040300000003	83.9760174	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.865+05:45	Annapurna Marg	Birauta chowk	Pokhara	Gandaki Province
b6f196a9-9d1d-4b91-a38f-dd859a93371a	9523235718	New Sagarmatha Bhojaanalaya	27.7334162	85.3457142	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.933+05:45	Golfutar Residential Road	Rudramati Chowk	Kathmandu	Bagmati Province
29ca7ddc-8153-41c5-8a62-c98945187693	2039623011	Green Cafe	27.675344300000003	85.34476020000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.719+05:45	Devasthal Marg	Seti O.P.	Kathmandu	Bagmati Province
714a4e68-0e75-4b4c-bf0a-a88f9f4f0689	5543097155	Tiwari Restaurant	28.212501000000003	83.9874947	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.875+05:45	Naya Bazar	Chipledhunga	Pokhara	Gandaki Province
b619919c-d36c-4709-967a-c2f6cadc2629	5543097170	Blues Restro	28.213648300000003	83.9884047	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.875+05:45	Naya Bazar	Chipledhunga	Pokhara	Gandaki Province
8b4cb80f-d749-462f-a95a-2dc074b43471	5543181013	Majeeri Restaurant	28.2099453	83.9855546	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.876+05:45	Naya Bazar	Shiva Tol	Pokhara	Gandaki Province
a03808bd-3108-40fe-90e7-62b43943f122	5104482234	Deepsika Resturant	28.2065461	83.9651223	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.841+05:45	5th Street	Baidam	Pokhara	Gandaki Province
f7b85432-a30a-448b-843d-497a7e67563c	5603560325	Hotel Laligurans	28.200431100000003	83.99616950000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.884+05:45	Machhapuchre Marg	Phalepatan Chok	Pokhara	Gandaki Province
013a7932-e66b-4810-bcee-d208a10347ce	11375066469	Lake Touch Restaurant	28.1692654	84.1129841	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.149+05:45	F162	Sundarindanda	Pokhara	Gandaki Province
4a7cbfc1-698d-4aaf-95e2-4461f9fca240	11391709036	Kwality cafe	27.726386	85.32335810000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.149+05:45	Lazimpat Sadak	Narayan Tole	Kathmandu	Bagmati Province
53667feb-f6d9-4cb2-8f09-09ec0edf12bc	9555718817	Miss U Panipuri	27.6700069	85.28193730000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.947+05:45	Shahid Path	Shalik	Kathmandu	Bagmati Province
c056735a-5e8d-4865-910f-e0215a0eab35	9407299917	Copacabana	27.7172418	85.32649400000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.925+05:45	Gairidhara Road	Bhrikuti Tole	Kathmandu	Bagmati Province
6946514b-0f8c-4108-b956-1383a95d9bfa	10013827871	Forever Quality Foodland	27.7424435	85.315156	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.092+05:45	F81	Tokha	Kathmandu	Bagmati Province
040ec0b3-b3df-4ecd-8942-e30ee37e8ddb	10013827878	Tiktok Restaurant and Cafe	27.7426837	85.3153357	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.092+05:45	F81	Tokha	Kathmandu	Bagmati Province
991f0d70-2d8b-4866-8ece-ea5d622789c1	10014438044	IOF Canteen	28.1885043	83.9919919	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.092+05:45	Foresty Street	Dhunga Sau	Pokhara	Gandaki Province
5508bda4-9fe6-4207-a9de-32292a2a5711	10014614137	Laphing Center	27.737493100000002	85.31808500000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.092+05:45	Pragati Sadak	Nav Milan Bastii	Kathmandu	Bagmati Province
4f27cbce-d61e-45a4-a5a9-5d1928cfa03a	5474987534	Manisha Restaurant	28.2108071	83.9602923	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.866+05:45	Street 15 (Pahari Marg)	Baidam	Pokhara	Gandaki Province
15ec264f-1ac6-4be2-a46c-355192e5dad5	7451273855	Bhulan The Newari Cafe	27.7010171	85.3099895	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.913+05:45	Patanginin Marg	\N	Kathmandu	Bagmati Province
c4ba1bc5-6813-4ae1-a95f-010d78af5e1a	5490625873	Public Choice Guest House and Restaurant	28.2332147	83.92966480000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.869+05:45	40DR012	Bhakunde	Pokhara	Gandaki Province
5657d79c-295b-4001-b3bf-5dca7d1baafe	7345509062	Kupondol Banquet	27.685243000000003	85.3169101	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.913+05:45	Kupandole Height Marga	Bakhundol	Lalitpur	Bagmati Province
162019b8-9adf-4f18-8549-68cfb9bc9515	10017309950	Click Cafe	27.7448462	85.3154963	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.104+05:45	DEAD END	Baniyatar	Kathmandu	Bagmati Province
cadfa67c-b2ff-4ac2-a06f-25de03275046	9529707042	A Multi Cusine Restaurant	27.705700200000003	85.3222557	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.945+05:45	Baghbazar Sadak	Baghbazar	Kathmandu	Bagmati Province
639d2cde-7463-4d78-a934-2a7df674b0b4	9529707044	Tuki Resturant and Coffee Corner	27.7057073	85.32228930000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.945+05:45	Baghbazar Sadak	Baghbazar	Kathmandu	Bagmati Province
6023abf2-3577-4036-af7b-75a2ed05e178	9529722284	KKFC	27.701813	85.310635	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.945+05:45	Khichapukhu Sadak	\N	Kathmandu	Bagmati Province
dc39b912-9aa0-46f2-b402-d8b7c1e60a0e	9529746960	Supreme Cafe	27.702059400000003	85.31075840000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.945+05:45	Khichapukhu Sadak	\N	Kathmandu	Bagmati Province
0f74d28b-ef94-457b-ae5c-0bdd6cf418bc	9529746998	Sashurali Shekuwa	27.7029867	85.31095420000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.946+05:45	Pako Marg	\N	Kathmandu	Bagmati Province
125826bf-52ad-484a-a88f-d413f5883a16	3506712489	Utse	27.712199700000003	85.3123157	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.778+05:45	Jyatha Marg	Lut Chok	Kathmandu	Bagmati Province
6fb92293-9862-4411-aa4d-8d611d1c49e1	9928590060	Pepe Pizza	27.694056900000003	85.3137895	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.049+05:45	Tripureshwar Marg	Tripureshwar	Kathmandu	Bagmati Province
984b9f5b-3116-4fc5-863f-38f152d2d18e	9999145669	Dolakhali Hotel and Restaurant	27.674200000000003	85.35558230000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.067+05:45	Araniko Highway	\N	Bhaktapur	Bagmati Province
d1737bb2-a8fb-4b12-b14b-83d593b0d36a	2165495763	Sidhartha Cottage Resturant	27.675331900000003	85.3027813	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.73+05:45	न्यु कोलोनी मार्ग	Dhobighat	Lalitpur	Bagmati Province
7c7271fd-3096-4414-8609-65864e46f30f	4515113164	G7 Cafe	27.744632600000003	85.34152870000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.816+05:45	Bansbari Sadak	Narayan Gopal Chowk	Kathmandu	Bagmati Province
342e0b9a-7bf2-4530-af49-5c82cdada4ba	10035781455	Black Olive	27.7359019	85.3205289	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.108+05:45	Kathmandu Ringroad	Deepjyoti	Kathmandu	Bagmati Province
533810ab-f5c2-4540-9ffd-e69016ae86a6	11933184166	Saandar Momo House	27.6677065	85.32284770000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.155+05:45	Lagankhel to Mangal bazar road	Hakha Tol	Lalitpur	Bagmati Province
1434e9d2-3d26-4280-88e9-b535e5c1597f	11933235817	Lagankhel Momo House	27.667240900000003	85.3226211	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.156+05:45	Lagankhel to Mangal bazar road	Hakha Tol	Lalitpur	Bagmati Province
e12b1113-6995-4d75-8008-313a5ad5af7b	10011817563	Bhojpuri Shel Roti	27.746747900000003	85.33314820000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.084+05:45	Sangam Marg	Tokha	Kathmandu	Bagmati Province
594d3696-9c66-47b0-ba60-84bccd360e2b	11869572618	Sunu Momo	28.2090718	83.98570000000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.153+05:45	Prithivi Highway	Shiva Tol	Pokhara	Gandaki Province
c49c5837-f2aa-4b16-a041-12f5bdb8ab22	9999295220	Thuldaii Khaja and Bhojanalaya	27.6688386	85.3532029	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.068+05:45	Manohara Corridor	Thulodhara	Kathmandu	Bagmati Province
d4de99bf-140b-461b-873f-b2d947f11c6d	9999375403	Jhakkas Momo and Khaja Center	27.674689700000002	85.351735	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.069+05:45	Kot Devi Marg	Kot Devi	Kathmandu	Bagmati Province
f8d2a426-2bce-4ba7-96c7-248b8ddf14e4	8697027805	La Dolace Vita	27.715053500000003	85.3102734	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.92+05:45	Chaksibari Marg	Lut Chok	Kathmandu	Bagmati Province
87661f6a-80e5-4d3a-afa6-e74fdbcc56ae	11341059021	Mustang coffee	27.685934800000002	85.31620480000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.146+05:45	Kupandole Height Marga	Bakhundol	Lalitpur	Bagmati Province
acee320a-24ad-4778-ba1e-0b953a5f81ae	11341068130	PD Coffee Lab	27.686017600000003	85.31562550000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.146+05:45	Upendra Marg	Bakhundol	Lalitpur	Bagmati Province
5cecf73b-e9bf-449b-aa67-a4f58c2c64d0	11341072814	The chubby chickenz	27.686306300000002	85.3157322	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.146+05:45	Upendra Marg	Bakhundol	Lalitpur	Bagmati Province
e32a9d99-3aa4-4591-aa6b-35b0f05c5e67	10011926531	Tapari Momo	27.7426804	85.32952420000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.085+05:45	Hari Marga Tole	Tokha	Kathmandu	Bagmati Province
294409dd-648a-49ea-ae33-46e72167be24	9999145634	Suddha Sahakari Khaja Pasal	27.6706499	85.35481130000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.066+05:45	Naulo Marg	Kot Devi	Kathmandu	Bagmati Province
a9ac9bbd-ad00-423f-b59a-827db812cb30	9999145641	Purbeli Hotel	27.671891900000002	85.3550776	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.066+05:45	Gandnayak Marg	Kot Devi	Kathmandu	Bagmati Province
a7ab25dd-2588-4e48-88cd-d7be8e7a470d	4757495325	Coffee Break	28.218830500000003	83.95846060000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.823+05:45	40DR012	\N	Pokhara	Gandaki Province
0d51f834-4217-48b9-a86f-f993b0463a55	4757529223	Landing Zone	28.217246300000003	83.9587497	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.823+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
f3abebd8-9912-42b3-aeb9-c40c591f4be1	4763717122	Marwadi Restaurant	28.214647000000003	83.958167	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.823+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
54a4b6be-d040-45f9-819a-e3b9f256b117	10009628528	HD Holiday Guest House And Restaurnt	27.7362077	85.31173340000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.076+05:45	Buddha Marga	Deepjyoti	Kathmandu	Bagmati Province
ccb05cd4-eaad-46bd-ae5f-98aa56210832	10013827866	Bhimsen Momo Center	27.742296800000002	85.31506060000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.092+05:45	F81	Tokha	Kathmandu	Bagmati Province
ba887a82-def4-486d-9d9c-284088c94c98	1937718371	Bagaicha	27.6730714	85.3154121	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.712+05:45	Machhindra Marg	\N	Lalitpur	Bagmati Province
b6064577-efa2-4c4b-8908-628481f0bb7c	4388876489	Dreams cafe	28.2521942	83.98595080000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.811+05:45	Mahendra Gupha Marg	Tallo Dip	Pokhara	Gandaki Province
6bcc037b-b2a3-4802-870f-1cbaec3fa5e5	9662481634	Arnee cafe	27.680577000000003	85.2792905	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.958+05:45	Way To Naya Bazaar	Chi-ba-hah	Kathmandu	Bagmati Province
28fd0aed-c68a-46fb-a6a4-87631099f209	10549101613	Pine Cafe	27.717752	85.36157180000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.135+05:45	Dibya Marg	Tusal	Kathmandu	Bagmati Province
dca61606-70ee-4734-8cfb-113ebd325bab	4873577004	Citiy Tandoori Fast Food	27.666634000000002	85.3138694	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.832+05:45	Shanti chowk Marga	Tikhidol	Lalitpur	Bagmati Province
65c3a2fb-2f5a-44fb-bf8b-3b036a7ebcbe	4873927781	Newang chhungi Restaurant	27.6682361	85.3094738	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.832+05:45	Jawalakhel Yekantakuna Sadak	Dhobighat	Lalitpur	Bagmati Province
76c37956-9698-44eb-8146-b067cd143228	4873927782	Moms Kitchen and Living Imports	27.6686264	85.3095591	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.832+05:45	Jawalakhel Yekantakuna Sadak	Dhobighat	Lalitpur	Bagmati Province
fa76297d-4eff-433e-805e-452bd06e2210	1849461233	Chiya Pasal	27.678156100000002	85.3214047	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.701+05:45	Madan Marga	Pulchowk	Lalitpur	Bagmati Province
a5f9cec4-47a5-4cdf-a179-2726f79e9a1d	1849461260	Chiya Pasal	27.6784874	85.3211957	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.701+05:45	Madan Marga	Pulchowk	Lalitpur	Bagmati Province
edd974c9-0bd4-4514-99c3-5dc847e053a4	1858151599	Adhikary Bhojanalaya	27.6788017	85.3212907	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.701+05:45	Madan Marga	Pulchowk	Lalitpur	Bagmati Province
65406944-7c2e-4d84-8912-d0fa7a2f16dc	1858151606	Jhapali Chiya Pasal	27.6787655	85.32124680000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.701+05:45	Madan Marga	Pulchowk	Lalitpur	Bagmati Province
10b025de-cbf3-4c00-88eb-f4c70fbc33a7	2212475436	Maya Didi Momo Pasal	27.720434700000002	85.3603152	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.733+05:45	Chabhil-Baudha-Jorpati Sadak	Tusal	Kathmandu	Bagmati Province
b088c0f3-e6b2-4502-8453-1937fdf291b9	2212480950	Mongolian Chinese Kitchen	27.720282	85.3629698	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.733+05:45	Chabhil-Baudha-Jorpati Sadak	Sundar Tole	Kathmandu	Bagmati Province
1c5f4c18-8699-4fbc-9784-0ca0a3526484	3074585433	Purbeli Hotel	27.7133195	85.3447275	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.75+05:45	Dharma Bhakta Marga	Bulbulley	Kathmandu	Bagmati Province
5aed2ed0-3545-4e7f-b220-49e9cebe4ec5	5242305571	Suna Restaurant	28.164550900000002	84.0905365	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.851+05:45	F162	Sundarindanda	Pokhara	Gandaki Province
52d48197-01fe-4f34-a73b-565c1436f052	9527281325	Kfc	27.7394558	85.33935140000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.937+05:45	Milijuli Marg	Narayan Gopal Chowk	Kathmandu	Bagmati Province
07eff3ca-cc19-4762-8b45-228737935175	3074563847	Cross Road Cafe	27.708089100000002	85.3395574	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.749+05:45	Pashupati Sadak	Paneku Tol	Kathmandu	Bagmati Province
74233714-2a36-460d-a7a2-0ed551e819de	2019637556	Seperate Choice Kitchen	27.7250449	85.3226983	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.718+05:45	Lazimpat Road	Narayan Tole	Kathmandu	Bagmati Province
82896a7f-b931-49da-979a-90ce520ef401	10970893064	Akarshan Cafe	27.6643651	85.4248893	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.142+05:45	F99	Suryabinayak	Bhaktapur	Bagmati Province
c35fa3b9-247d-464d-9c76-06318daa6893	10973660606	Pachali Bhairav Restura	27.697268700000002	85.30496910000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.142+05:45	Ganeshman Singh Path	Teku	Kathmandu	Bagmati Province
59be7cd0-cd24-4c34-acd8-0ef4ee0ddcec	5179251523	Friends The Cafe	27.6891843	85.36012670000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.846+05:45	F87	Koteshwar	Kathmandu	Bagmati Province
3a5b2cfe-8067-4c5b-9403-827ce83f13c6	4284141385	TFC Momo House	27.723669800000003	85.3067724	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.806+05:45	Balaju Sohrakhutte Sadak	Balaju	Kathmandu	Bagmati Province
a37f6345-f777-4ade-a075-c747da33c3c9	5103596983	Thakali Restaurant	28.208129800000002	83.96626520000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.84+05:45	Thadopasal path	Baidam	Pokhara	Gandaki Province
e0a67841-a216-41bd-a3e2-742ec4c5613f	4958521824	Tawa	27.710146100000003	85.3281656	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.836+05:45	Thirbam Sadak 3	Kamalpokhari	Kathmandu	Bagmati Province
580d3030-9c44-49aa-8e25-112a6ac4476b	6548976939	Simply Bota Momo	27.6825131	85.318099	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.902+05:45	Pulchok Marg	Pulchowk	Lalitpur	Bagmati Province
8f42288e-0aa2-4298-9a53-5537ba875f00	6562217255	Your Koseli	27.7179861	85.3248612	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.902+05:45	Bhitri Kholagaul Marga	Kholagaal	Kathmandu	Bagmati Province
8b26e0e1-e3fb-452e-8a10-d074a7193b2b	6592915582	Sarita restaurant	28.256469900000003	83.97794250000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.902+05:45	Lamachaur Marg	Tallo Dip	Pokhara	Gandaki Province
1152ef64-03ad-451d-bcf4-bc2dc03f6d56	6621185445	Chatterbox Laphing	27.7245956	85.3642361	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.902+05:45	Phulbari Marg	Bhual Dhanda	Kathmandu	Bagmati Province
aafc401a-8ecc-4481-b768-be4ac247f67b	6645362885	Hotel Little Buddha Inn	27.7214747	85.36276790000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.903+05:45	Phulbari street	Dhara Tole	Kathmandu	Bagmati Province
9fe8b7e0-9daf-46dd-ab41-002ee1f6e884	7168231753	Varanda Cafe	28.2126622	83.95701340000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.911+05:45	Lakeside Road	Baidam	Pokhara	Gandaki Province
b93f8563-fb39-4fbd-b391-aaea09d88839	10011926546	Anil Sweet and Chat House	27.7434531	85.32996700000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.086+05:45	Hari Marga Tole	Tokha	Kathmandu	Bagmati Province
0b7f0f37-8882-4c67-a858-d2dd58ee6234	4976683821	Temptino	27.6760108	85.314125	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.836+05:45	दमकल सुन्दरीघाट मार्ग	Dhobighat	Lalitpur	Bagmati Province
ce9bd220-cd1b-42cd-8fb3-ecd5e42336ce	4987784722	Level 3	27.6771849	85.3169112	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.836+05:45	Pulchowk Road	Pulchowk	Lalitpur	Bagmati Province
20bb003c-eb4f-463f-ab49-71c9e5049714	11353733470	Edo	27.681497200000003	85.3106477	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.147+05:45	Bakhundol	Arun Thapa Murti Chowk	Lalitpur	Bagmati Province
e5b70692-8b70-4f46-8ea3-b98f9660009d	8696330978	Jialinge Shandong Dumpling House	27.713339400000002	85.3122999	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.918+05:45	Jyatha Marg	Lut Chok	Kathmandu	Bagmati Province
c59dc5d4-6f43-4f85-a347-25ab0bf19527	8696330979	Cha Cha Cafe	27.7132641	85.3122829	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.918+05:45	Bharma Kumari Marga	Kamalachi	Kathmandu	Bagmati Province
b15f263b-9a30-4a1f-937a-fe1a30719adb	8696330980	Himalayan Organic Tea Traders	27.7133165	85.3123035	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.918+05:45	Bharma Kumari Marga	Kamalachi	Kathmandu	Bagmati Province
9f2edadc-f261-4a57-a648-e1f042bd8344	8696338122	Jiu Ding Yuan Hotel And Restaurant	27.7124166	85.3121897	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.918+05:45	Jyatha Marg	Lut Chok	Kathmandu	Bagmati Province
2c7e4660-c12a-4f62-8941-0eae3201c767	9527281351	Penang Momos	27.7362374	85.33801940000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.939+05:45	Chहadke Galli	Chundevi	Kathmandu	Bagmati Province
59f5cfb4-2fca-4232-9f77-70740d938280	9527281352	Eat N Smile Cafe	27.7394591	85.33647970000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.939+05:45	Maharajganj Sadak	Narayan Gopal Chowk	Kathmandu	Bagmati Province
277abe86-dad8-4024-851f-b5e304eda276	9527281353	Lumbini Khaja Ghr	27.741128300000003	85.3447862	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.939+05:45	Jan Marg	Milijuli Tol	Kathmandu	Bagmati Province
01074a88-d94b-4d7c-aeb7-60ce197211bc	9527281372	By The Way Organic Garden	27.741375400000003	85.3413824	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.94+05:45	Kapan Marg	Narayan Gopal Chowk	Kathmandu	Bagmati Province
fd260a5b-c19b-4194-9657-624c46752ac6	9708736818	Newari Khaja And Cafe	27.6905551	85.2774243	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.965+05:45	Sahid Basu Smriti Marg	\N	Kathmandu	Bagmati Province
82a688a2-2af9-43c1-a8e0-124d4c2826eb	10015712799	Famous Tapari Momo Restaurant	27.7516962	85.3175585	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.097+05:45	F81	Baluwapati Chowk	Kathmandu	Bagmati Province
4ed5ec53-27de-405f-b25b-953bf1eb4ee4	1937710545	Pho 99	27.677987400000003	85.3074162	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.712+05:45	युलाखेल ठाडोढुंगा मार्ग	Dhobighat	Lalitpur	Bagmati Province
8c520fa0-3c84-4cdb-bd73-89498b46f92a	2065022110	Le Trio	27.677155000000003	85.313754	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.72+05:45	सीताकवो मार्ग	Pulchowk	Lalitpur	Bagmati Province
9f5918c9-d61e-4056-beb3-ba96f7562d94	2066081758	Yak	27.7118107	85.3111411	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.72+05:45	Thahity Jyatha Marg	Tahiti	Kathmandu	Bagmati Province
e447a3b1-ff6e-4845-8828-83c9f5c7fd10	1045848953	Everest Steak House	27.711758500000002	85.3093039	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.691+05:45	J.P. Road	Paknajol	Kathmandu	Bagmati Province
9c2680d7-7c91-47f2-9e26-a29855f708f1	5571115921	Munchis And More Cafe	28.233627700000003	83.9826183	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.879+05:45	Pokhara Baglung Highway	\N	Pokhara	Gandaki Province
829973eb-9576-4e38-a4bd-eb5a8523460b	10015764421	Sayapatri Nagar	27.746752400000002	85.31544450000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.098+05:45	Sayapatrinagar	Baniyatar	Kathmandu	Bagmati Province
c371c989-1e46-4a89-a436-dd1cbe0a8ca5	1044375800	Cafe Du Temple	27.721733200000003	85.3614154	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.691+05:45	Chabhil-Baudha-Jorpati Sadak	Tusal	Kathmandu	Bagmati Province
22557e33-806c-4e8e-ac3d-e71c094ac147	9564676017	Himalayan Crown Lodge	28.2443406	83.9486031	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.947+05:45	Main Street	Garjati	Pokhara	Gandaki Province
051709de-64f2-437b-a787-dba896b21dc6	2684763711	Kathmandu Tea Room	27.670217	85.3123899	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.74+05:45	Damodar Marga	Nakhu Bajar	Lalitpur	Bagmati Province
bf59f5c6-cdc7-4756-b54f-e5d0153d9a90	10017182652	Beans and Barrels	27.7452277	85.3168081	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.103+05:45	F81	Baniyatar	Kathmandu	Bagmati Province
fc49d870-283b-461c-b790-2ede7ffb3e69	10017182663	Momo and Sekuwa	27.745455000000003	85.3170757	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.103+05:45	F81	Baniyatar	Kathmandu	Bagmati Province
3b4d8982-4df0-4ded-b480-d97e7b04300d	10017252936	Raj Chinese Fastfood	27.740542700000002	85.31210460000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.103+05:45	Ram Marga	Tarakeshwar	Kathmandu	Bagmati Province
f8b3a287-20ae-440f-be14-9dd65982cd6f	9944708195	Korean Peace Family Resturant	27.6803251	85.3101508	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.052+05:45	Bakhundol	Arun Thapa Murti Chowk	Lalitpur	Bagmati Province
9e61c724-5fd4-4f33-a15e-bf03f691628e	9657740507	Barkhahiti restaurant	27.677390900000002	85.2804005	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.956+05:45	Kirtipur Ring Road	Chi-ba-hah	Kathmandu	Bagmati Province
646d675a-342a-4c1f-b088-8b11fe9bdf52	3700711874	Mid Town	28.223307400000003	83.9899072	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.784+05:45	Bastolathar Road	Chipledhunga	Pokhara	Gandaki Province
4fe030ee-e25e-4260-8a01-83b459a95742	10023970887	Hasana Stick Food and Crispy Chicken	27.674151700000003	85.3742835	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.106+05:45	Araniko Highway	Araniko Basti	Bhaktapur	Bagmati Province
f99d4a4a-5f00-4a61-a4a7-6a6a4b82ee65	10023970889	The Burger House and Crunchy Fried Chicken	27.674137400000003	85.3745748	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.106+05:45	Araniko Highway	Araniko Basti	Bhaktapur	Bagmati Province
9c05b8ef-31a4-4081-adc9-1d33885a84cc	8696865586	Phoenix Restaurant	27.7131559	85.31027590000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.92+05:45	J.P. School Road	Paknajol	Kathmandu	Bagmati Province
f86f4da5-7394-4586-b192-baeaa201f2eb	5589803123	Rhino Cafe	27.7105782	85.3111406	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.882+05:45	Jyatha Marg	Kamalachi	Kathmandu	Bagmati Province
26a37515-a63f-4c9d-a720-fc579fad6079	11359716166	Irish pub	27.7184929	85.3176234	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.148+05:45	Narayan Gopal Road	Lut Chok	Kathmandu	Bagmati Province
8b0709b9-bcd2-478f-a266-a1b5c2814c2e	11359724668	Bahavana coffee	27.721230400000003	85.3210548	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.148+05:45	Kumari Mai Marga	Kailash Chok	Kathmandu	Bagmati Province
9a69a59e-b1b9-4435-bd34-a79fe491aca1	11359766597	Coffee Escape	27.7185096	85.3176548	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.148+05:45	Narayan Gopal Road	Lut Chok	Kathmandu	Bagmati Province
91dc69f8-52ef-44f0-a604-e37f3d140709	11361300096	China restaurant	27.7136463	85.312684	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.148+05:45	Jyatha Marg	Lut Chok	Kathmandu	Bagmati Province
ea9df9b2-057d-4fd2-b03d-786eb4970fe4	11361309756	Breakfast house thamel	27.711553300000002	85.31059950000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.148+05:45	Shanti Shikshya Marg	Tahiti	Kathmandu	Bagmati Province
da66f619-8275-4096-9fc0-cc9b5596f787	9770300792	Pokhara Typical Restaurant	28.2348658	83.98977380000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.972+05:45	Gyan Marg	\N	Pokhara	Gandaki Province
817d225c-6075-4b44-9b14-a991315f8dba	2684629133	galkot restaurant	27.683184200000003	85.33144890000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.739+05:45	Samyukti Marg	Shankhamul Chok	Kathmandu	Bagmati Province
6f7871fa-8c56-4d0d-a805-2ac6a3518f81	2684756028	Goel Bakery	27.668990500000003	85.31008170000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.74+05:45	Jawalakhel Yekantakuna Sadak	Dhobighat	Lalitpur	Bagmati Province
62b02de7-bfb9-4a1c-ae14-0906b8122881	9791788113	Hajurko Bhojanalaya	27.674565100000002	85.2796971	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.974+05:45	Kirtipur Ring Road	Amalsi	Kathmandu	Bagmati Province
72738a43-5e1c-498c-8acf-22d8be9da160	9791788114	Everest Momo Nan House	27.674555400000003	85.27956680000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.974+05:45	Kirtipur Ring Road	Amalsi	Kathmandu	Bagmati Province
bfa2f3b7-8d70-4018-b1c5-a63c395771c0	9791809061	Sulav Hotel	27.677337100000003	85.27483190000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.974+05:45	Kirtipur Ring Road	Khahsi bazar	Kathmandu	Bagmati Province
6a74e4af-d718-4ef0-a645-caacd80aef14	10009137481	Syabhale	27.7470591	85.32421070000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.074+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
ca1e0b78-9d26-4c35-a4dd-6cf3a2f87366	10139104823	Lemon tree bakery cafe	27.6537027	85.3036805	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.127+05:45	Ekantakuna - Tikabhairab Road	Bhaisepati	Lalitpur	Bagmati Province
38362bd6-46d0-4525-98c1-ec393a9b78a9	10147376660	Betali Ramey Bojanalaya And Sekuwa Corner	27.677854300000003	85.3473343	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.127+05:45	Saraswati Mata Marg	Seti O.P.	Kathmandu	Bagmati Province
999dc9e8-7b7f-4427-8a08-fe471fe7368c	9724453890	Miss you panipuri	27.6495825	85.2805474	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.969+05:45	Dakchhinkali Road	Taudaha	Kathmandu	Bagmati Province
33c50d8b-947a-460f-bcd7-07f6d114fff9	10010524531	New Sanjit Sweet House	27.746485900000003	85.324073	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.08+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
8ffa3964-05fd-48fd-b6de-9a335f83197a	10010524547	Quality Bakery and Cafe	27.748065	85.32497550000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.08+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
abf3ec95-3f57-483a-a2ef-1eb89654e45a	10010524551	Rich Beggar Fast Food Center	27.74773	85.32485550000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.08+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
0414287e-c9a4-4ccb-9af2-1f8e81830ab1	4800813805	Stupa View Resturant	28.212239	83.96000880000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.829+05:45	Street 17 (Lalupate Marg)	Baidam	Pokhara	Gandaki Province
4a1fdaa4-e134-46b7-82f6-aad9211a5f24	5525019666	Thakali Restaurant	28.2339987	83.9980618	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.874+05:45	40DR014	\N	Pokhara	Gandaki Province
39af2313-a1d1-4530-9251-3fd9151551c6	5525019667	Baglung And Parbat Lafa Restaurant	28.234650900000002	83.9977916	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.874+05:45	40DR014	\N	Pokhara	Gandaki Province
08fa55a4-fc0e-41cf-af59-baf1098bd771	10108155281	bambauze corner	27.6901344	85.3739633	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.115+05:45	SanoThimi-Bode	Naagdesh (Nagadesh)	Bhaktapur	Bagmati Province
39176fb3-bc6e-4c74-a5fc-f7d043500208	10108155282	sasurali	27.6904657	85.3739606	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.115+05:45	SanoThimi-Bode	Naagdesh (Nagadesh)	Bhaktapur	Bagmati Province
9cef41bf-e6aa-4fc6-a6d1-c0e9f9cf8fd1	10121417305	Lumbini Khaja and Bhojanalaya	27.6844116	85.345596	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.121+05:45	Sudidhanagar Marg	Basuki Nagar	Kathmandu	Bagmati Province
0167a2ad-0a8e-40bd-8cac-49922da2b196	10148684179	Bisauni Restaurant	27.676658900000003	85.3751428	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.129+05:45	Araniko Highway	Araniko Basti	Bhaktapur	Bagmati Province
69346303-6b65-4ba3-a547-861fe8a406ac	10009137471	Sayabung Restaurant	27.7462662	85.32379470000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.074+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
9776db0b-0e60-40f8-9a5b-9bdf9d8a2780	9724524975	Park View The Restro	27.6633028	85.2882228	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.972+05:45	Ekalpati to Bhajangal Road	Samocha	Kathmandu	Bagmati Province
ff52a805-eff4-4bbc-b8a2-1419b41cef5d	9969484792	Durbar And ARB Bhojanayala	27.7032187	85.3213595	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.063+05:45	Adwait Marg	Baghbazar	Kathmandu	Bagmati Province
ef7a03e6-ddca-4d92-b373-f7e0dc542c63	9724523067	Enjoy Today Restaurant	27.649645300000003	85.2809919	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.971+05:45	Dakchhinkali Road	Taudaha	Kathmandu	Bagmati Province
e4c3d3cf-d291-4a06-8a13-df6e24899870	9724524144	Tea and coffee	27.6496934	85.2792318	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.972+05:45	Dakchhinkali Road	Taudaha	Kathmandu	Bagmati Province
eeeeb031-c7f7-497d-9b70-0e00868a10b9	5524199803	Manakamana	28.221442300000003	83.95454360000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.874+05:45	40DR012	\N	Pokhara	Gandaki Province
204b7585-23ac-4c6f-9829-3718124eae55	10013326061	Aryan Sweets and chat center	27.737530000000003	85.31186310000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.089+05:45	Parajuli Niwas marga	Deepjyoti	Kathmandu	Bagmati Province
ebb12e9d-75be-448a-9b36-e1b4bcc6ecf5	3634990923	Zorba	28.2124543	83.95721900000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.782+05:45	Lakeside Road	Baidam	Pokhara	Gandaki Province
827210e7-e3cc-43aa-8bed-f0ca3b01a83d	10121424500	Dajuvaii Fast Food and Sekuwa Corner	27.681668600000002	85.3405025	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.123+05:45	Samparka Marg	Sahayogi Nagar	Kathmandu	Bagmati Province
1fcabc09-158b-45f6-a197-6814c967611d	9417826417	House of Eggs	27.717034700000003	85.3327503	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.926+05:45	Kotal Marg	Kotal Tol 	Kathmandu	Bagmati Province
88e26739-0c35-4a57-927d-ba570e2fd887	9422552317	Nepa Tea	27.7180871	85.3402779	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.929+05:45	Chabahil Ganesh Marg	Binayak Tol	Kathmandu	Bagmati Province
04537880-9f59-47eb-95d3-3096b760f192	9527316349	City Coffee House	27.744471	85.3412117	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.94+05:45	Bansbari Sadak	Narayan Gopal Chowk	Kathmandu	Bagmati Province
0d3a9a72-cc2a-4401-bbb7-f829615166b3	11695906767	Big Belly	27.713454400000003	85.31153350000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.151+05:45	Narsingh Chowk	Lut Chok	Kathmandu	Bagmati Province
b3e4fcaf-5a77-4a09-acca-5a4cbf865941	7677211986	Vita	28.215433700000002	83.9582939	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.913+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
25dae437-582c-4f2b-aad7-8165b4231661	9724480588	Gaule restaurant and newari fastfood	27.6510509	85.2857613	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.97+05:45	Dakchhinkali Road	Taudaha	Kathmandu	Bagmati Province
1b53cef7-3dc3-4429-8ff8-86b0725c0451	2077238426	Oasis Cafe	27.739635300000003	85.3269549	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.723+05:45	Kathmandu Ringroad	Tokha	Kathmandu	Bagmati Province
55ccd9d2-4446-43fe-aba5-db949684c31f	3038281087	Royal Food Cafe	27.664128100000003	85.3153017	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.747+05:45	Kathmandu Ringroad	Tikhidol	Lalitpur	Bagmati Province
08f30089-3f99-4dc1-9696-6a2c688b0033	10015458603	JNS Fast Food and Restaurant	27.753137900000002	85.3270547	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.095+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
686fa360-5e08-4ea4-aac9-2b76ea6df5c3	5245962322	Newari Khaja	28.1986196	83.9697477	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.852+05:45	Dam Side Marg	Birauta chowk	Pokhara	Gandaki Province
de55efe3-bad0-4e8b-9c79-976eae56f82e	10016159287	Dharma a sekuwa and bhojanalaya	27.7445993	85.3168139	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.099+05:45	F81	Tokha	Kathmandu	Bagmati Province
9cd460dd-8af3-4b41-a104-6565ceae332c	10016176845	The Burger House and Crunchy Fried Chicken	27.747106000000002	85.31752320000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.099+05:45	F81	Baniyatar	Kathmandu	Bagmati Province
3fcf7bbd-7173-483e-a537-1156caf2a0a4	10016176862	Jalpa Fast Food	27.7477638	85.317907	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.099+05:45	F81	Baluwapati Chowk	Kathmandu	Bagmati Province
1c296855-314a-425f-9217-a1492158a445	9612867301	Gamcha village inn	27.6694944	85.2626448	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.95+05:45	Pushpalal Marg	San-la	Kathmandu	Bagmati Province
371a3511-6639-4dd1-b5df-4f169a51f7a5	1810054567	Olive Tree Restaurant and Bar	27.7119289	85.3098332	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.7+05:45	J.P. Road	Paknajol	Kathmandu	Bagmati Province
df21691c-9774-44ce-a56c-47e13468d412	2805465034	Asian Tea House	28.211133200000003	83.9573924	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.744+05:45	Baidam Road	Baidam	Pokhara	Gandaki Province
6a77a43b-7a5a-4521-b3e9-72c3b01588d0	2684764543	UK Restaurant	27.670014600000002	85.309151	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.741+05:45	Bhanimandal Sadak	Dhobighat	Lalitpur	Bagmati Province
dd80fa21-8f57-4654-a367-f8004552e545	9969484782	32 Cafe	27.703202100000002	85.3221724	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.063+05:45	Adwait Marg	Baghbazar	Kathmandu	Bagmati Province
d068f70b-ade6-4014-999d-198f106d495e	10121388637	The Burger House and Crunchy Fried Chicken	27.685795700000003	85.3454415	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.116+05:45	Munibhairab Marg	Basuki Nagar	Kathmandu	Bagmati Province
922d966f-1cb6-4ca8-a37c-fac135bb77cf	10121424545	Barbeque Chulo	27.679332000000002	85.3469003	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.123+05:45	Himali Marg	Basuki Nagar	Kathmandu	Bagmati Province
f285cb54-4e3e-4474-baae-eabf8864d5a8	10121388639	New Bhairab Lumbini Tandoori Fast Food and Bhojanalaya	27.685810500000002	85.34539880000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.116+05:45	Munibhairab Marg	Basuki Nagar	Kathmandu	Bagmati Province
b108a476-9a15-495e-98b1-e5310b46198e	10121388664	Heaven Food	27.685946400000002	85.3448036	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.116+05:45	Shri Ganesh Marg	Mahadevasthan	Kathmandu	Bagmati Province
e0cd5168-2c7b-44e3-b93b-ce6802d995d6	10121388668	New Lumbini Supadeurali Prautha and MoMo House	27.6861663	85.34410770000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.116+05:45	Sat Marg	Basuki Nagar	Kathmandu	Bagmati Province
4f499e7b-624c-4dfc-b30e-b56722073ec5	3634990912	Punjabi Restaurant	28.2117876	83.9570209	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.782+05:45	Rolling Stone Rock Bar way	Baidam	Pokhara	Gandaki Province
c9bcdae9-1d56-46a7-baa1-1c671d715ec3	3634990917	Thakali Kitchen	28.212917400000002	83.9574005	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.782+05:45	Lakeside Road	Baidam	Pokhara	Gandaki Province
a770bec5-57a3-4d23-ac7a-76322bb54628	10015458608	Hotel De Grande	27.7529381	85.32699450000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.095+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
c6b55d84-cd7d-4bbf-a178-c06e7ee5088d	10121424559	Cake Express Restro	27.6802652	85.3468814	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.123+05:45	Himali Marg	Basuki Nagar	Kathmandu	Bagmati Province
13eda37f-28d5-4a28-9096-11426fa12c1b	10121424615	R and R Restaurant	27.6804993	85.34893100000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.123+05:45	Mahadevasthan Marg	Basuki Nagar	Kathmandu	Bagmati Province
7d2c71a5-2cd7-4b75-b137-a4b3b6c3113b	1496652901	Aagan Sweet shop	27.6915839	85.31660090000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.697+05:45	Tripureshwar Marg	Tripureshwar	Kathmandu	Bagmati Province
5ca6e1e0-cf48-41b2-8ac3-5d359f4ab93d	1497531288	Alinas Bakery Cafe	27.6725083	85.31522170000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.697+05:45	Machhindra Marg	\N	Lalitpur	Bagmati Province
af9f27bc-8f1d-4c7a-b703-73f9de76b8c0	1498876026	Bakery Cafe Teku	27.696140900000003	85.30809380000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.697+05:45	Suna Gava Marg	\N	Kathmandu	Bagmati Province
f13c903b-103c-4f5d-92f8-1926e9236a8c	2584754046	Moon light	27.7169615	85.308037	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.738+05:45	Pipalbote Marg	Sorakhutte	Kathmandu	Bagmati Province
95326a01-0c43-4bea-83d2-bb7427aaf4bc	1390372808	Namaste Pub and Lounge	27.7141705	85.3114087	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.695+05:45	Narsingh Chowk	Lut Chok	Kathmandu	Bagmati Province
12a9eb6e-6348-4658-89a2-40b254b51706	1497531274	The bakery cafe	27.6727379	85.3139678	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.697+05:45	Yala Sadak	Dhobighat	Lalitpur	Bagmati Province
d8b5a93c-8da0-455a-8398-607ef8f40c74	4905142923	Cafeteria	28.253672400000003	83.9776612	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.833+05:45	Dip Housing	\N	Pokhara	Gandaki Province
41b25f74-743c-49d3-945c-7074206e1afe	1937673109	Sa Rang Chae	27.670883900000003	85.31612480000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.711+05:45	Man bhawan Marga	Pulchowk	Lalitpur	Bagmati Province
80ae1132-35c7-4e5a-8e34-4d824f2d57d3	5517954433	On the Way Restaurant	28.135730900000002	84.0837087	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.873+05:45	F164	Rambazar Chok	Pokhara	Gandaki Province
2754cfb4-6d3d-44a9-bb33-0e5554164e6d	10013301549	Sherpa Hotel	27.7487108	85.3314069	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.089+05:45	Sangam Marg	Tokha	Kathmandu	Bagmati Province
5c3907e6-06e9-4dad-bb3f-7ccc0a151629	10016442167	Sayapatri Sweet and chat house	27.745451900000003	85.3167724	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.102+05:45	F81	Baniyatar	Kathmandu	Bagmati Province
d3d6bfc1-7e8d-43b9-b110-9f1570769934	10015127316	Triple MEat Grilled House	27.739161000000003	85.3137683	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.092+05:45	F81	Tokha	Kathmandu	Bagmati Province
252a784d-d87e-4abd-8b9f-673dbd6060c9	4349394390	Tuki	27.7190607	85.3287691	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.809+05:45	Shantiniketan Marg	Bhrikuti Tole	Kathmandu	Bagmati Province
5f9f0a18-d0ca-4590-b4dd-d803c0485f8a	10032699717	Bella Vista	27.7034638	85.3075898	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.107+05:45	Jhochhen Tol	\N	Kathmandu	Bagmati Province
5aea8079-0a2c-44c7-8968-b533b0acde21	10015764429	Station Burger House	27.7475971	85.315458	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.098+05:45	Sayapatrinagar	Baniyatar	Kathmandu	Bagmati Province
c5f137bd-2b53-42f8-a756-6fe1ac241f97	5520135113	Evergreen Restro	28.226642700000003	83.99558950000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.873+05:45	40DR015	Ghimire Chok	Pokhara	Gandaki Province
8d7ed5c0-0607-47f8-a655-96c5ab9da0b0	5520184530	SRB Restaurant	28.144160600000003	84.0447852	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.873+05:45	Torichaur Pragati Marg	Bagmara	Pokhara	Gandaki Province
a5bc1c39-2430-41c9-93a2-1b478e92c6d2	5520184539	Sadikshya Chamena Griha	28.144721800000003	84.0450507	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.873+05:45	Torichaur Pragati Marg	Bagmara	Pokhara	Gandaki Province
886fdf33-4586-42d1-8d82-f7762197e47b	5100226177	Resham Family Resturant	28.1633728	84.05725410000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.84+05:45	Prithvi Highway	Bhandardik	Pokhara	Gandaki Province
009148a7-bb36-4152-81e5-b47293168f27	9967126935	MoMo Man	27.6786323	85.3485852	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.057+05:45	Shri Shanta Marg	Basuki Nagar	Kathmandu	Bagmati Province
c5b117ba-4b25-4408-8584-d83a992c7b89	10742958105	Alupalu Restaurant	27.7012591	85.30819070000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.139+05:45	Na Bahi Marg	\N	Kathmandu	Bagmati Province
004ac902-139b-4b25-81bf-9d4088a1bcaf	10121388638	Syanko Katti Roll	27.6858001	85.3454244	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.116+05:45	Munibhairab Marg	Basuki Nagar	Kathmandu	Bagmati Province
b4245c5a-6a32-4407-8549-56b99a419cb3	10753011550	Griham Restaurant	27.716862900000002	85.3954478	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.14+05:45	Way to Jorpati	Kageshwori Manohara	Kathmandu	Bagmati Province
0a1adf14-b052-41bb-9f05-52d972e3fbc6	10831419705	Bucket Biryani	27.6875296	85.32661800000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.141+05:45	Rudramati Marg	Thapa Gaun	Kathmandu	Bagmati Province
c67ab941-97b7-4a3e-a677-670b49d4142c	10121417277	The Grill	27.685115800000002	85.34633720000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.121+05:45	Munibhairab Marg	Basuki Nagar	Kathmandu	Bagmati Province
376941cc-7d0b-41de-ad9f-63d6dccb7baa	10049362169	Satkar Food Land	27.676174300000003	85.3979181	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.11+05:45	RadheRadhe Road	Madhyapur Thimi	Bhaktapur	Bagmati Province
ada5349d-e1d3-45d1-9754-6e7527f4d164	9524303517	Craft Inn Food	27.728459100000002	85.3278343	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.934+05:45	Buddhi Sagar Marg	Panipokhari	Kathmandu	Bagmati Province
fa6810eb-0dd9-41c3-ad68-839780f6c75b	10050667513	Kalash Food Cafe	27.672918900000003	85.3876965	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.11+05:45	Araniko Highway	\N	Bhaktapur	Bagmati Province
5bc53e99-5db2-4b2a-973a-1a09d3a1c162	10050668217	The Burger Land	27.672589900000002	85.38775120000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.11+05:45	Araniko Highway	\N	Bhaktapur	Bagmati Province
4264fe81-fac6-425e-a843-6f1422b88bab	10017309958	Tapari Momo	27.746050200000003	85.3154009	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.104+05:45	DEAD END	Baniyatar	Kathmandu	Bagmati Province
1d79a9f3-89c4-489e-b86d-06344ac7c2fc	4172777617	Buddha Communication	28.2063594	83.9948291	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.799+05:45	Prithvi Rajmarga	Shiva Tol	Pokhara	Gandaki Province
6029a9fa-4b31-44e5-a027-7d1e3efd8f5b	11933423082	Cafe Fresco	27.6714869	85.4220074	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.156+05:45	bharwacho	\N	Bhaktapur	Bagmati Province
92cb504f-c278-4ec8-9ccb-6fccaafaaa6a	11933509658	Hotel Heritage Malla	27.6704869	85.4268674	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.156+05:45	Mangalache	\N	Bhaktapur	Bagmati Province
3b21efd9-d51c-48c5-8ed4-225eb0d32481	11933567748	Lahaping House Rooms And Restaurent	27.6704152	85.4284274	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.156+05:45	kwachhen	Aadarsha	Bhaktapur	Bagmati Province
aa49b1b5-1a41-425a-bcc2-6a16db18a1c0	11933580976	Namaste Restaurant	27.6712972	85.4295072	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.156+05:45	kwachhen	Aadarsha	Bhaktapur	Bagmati Province
62adb722-3ab8-4ba4-9e8c-c90cd3a366ed	9956485546	Live Burger and Pizza Point	27.674280200000002	85.364106	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.054+05:45	Arniko Raj Marga	sachet marga tole	Bhaktapur	Bagmati Province
280e1bee-112f-4b83-9746-232768a2f528	3374963735	Chiya Chautari Restaurant	27.6657216	85.29495030000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.766+05:45	F22	Chobhar	Kathmandu	Bagmati Province
8c495b48-a953-4151-b362-b1a1a109ef18	3375011135	Green View Roof Top Restaurant	27.650674300000002	85.28419020000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.766+05:45	Dakchhinkali Road	Taudaha	Kathmandu	Bagmati Province
5b7e6e37-4360-424b-a86e-bca3a70be3c3	9914337854	Kalimpong Kitchen	27.67828	85.30974180000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.047+05:45	Bakhundol	Dhobighat	Lalitpur	Bagmati Province
38a88237-c8f0-4cb4-8210-eeb950b28952	3367301893	Namlo Garden Cafe	27.682259400000003	85.31507330000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.765+05:45	Maitri Marg (Bakhundole)	Bakhundol	Lalitpur	Bagmati Province
d9aac7e5-689c-495d-9b0f-99a5efc80725	9527281338	De Lamar Cafe	27.7363609	85.34177820000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.938+05:45	Kathmandu Ringroad	Ganesh Basti	Kathmandu	Bagmati Province
6018b1f6-ba97-4224-a5e0-0d79d428760e	10698637825	Firewood sekuwa	27.6698887	85.3852578	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.137+05:45	26DR002	Joshigau	Bhaktapur	Bagmati Province
ee90d92f-510f-43f9-ac86-818c34e2bed7	10698637826	Samsara Restaurant	27.669317900000003	85.3862342	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.137+05:45	26DR002	Joshigau	Bhaktapur	Bagmati Province
b79d5394-07a1-419d-ae50-daaac27a9293	6784849335	Star coffee center	28.2180803	83.9866939	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.903+05:45	Anupam Marg	\N	Pokhara	Gandaki Province
27860dd9-8c5c-4459-80ff-9c6a7593ed3f	6822906885	Furusato	27.713865700000003	85.3101544	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.903+05:45	J.P. School Road	Paknajol	Kathmandu	Bagmati Province
7d4f95d9-e97b-4386-8deb-ed1b393e0912	6833896710	Guchha	27.715433200000003	85.30355700000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.904+05:45	Pushpalal Path;Swoyanbhu Marg	Sorakhutte	Kathmandu	Bagmati Province
a4aeb41a-a51d-4630-98b6-4f646d87c555	7183898894	Taja Bakery Cafe	28.211263900000002	83.9822578	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.912+05:45	Jalpa Road	\N	Pokhara	Gandaki Province
aace0401-964e-4606-81df-d84e4bb1869a	6385168419	The Bakery Cafe	27.719045100000002	85.35131030000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.9+05:45	Chabhil-Baudha-Jorpati Road	Chuchepati	Kathmandu	Bagmati Province
fff9c74b-78cd-4824-a1c3-26e37617cf99	9529837583	Kesha Pizza	27.703607100000003	85.31056290000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.946+05:45	New Road	\N	Kathmandu	Bagmati Province
381a009a-817e-4257-b073-55be02527ce0	2006144726	Sayame Tiffin Home	27.7175747	85.3289115	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.717+05:45	Gairidhara Road	Narayan Chaur	Kathmandu	Bagmati Province
42d79c5a-2258-4c83-8bfc-104b1677be0b	5613946505	Tiffin Time Cafe And Restaurant	28.221356	83.9957021	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.884+05:45	Rani Pauwa	\N	Pokhara	Gandaki Province
076a8331-eeff-45d8-a4f8-f1c16345799e	2006144707	Bhatbhateni Cafe	27.720021300000003	85.33063700000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.717+05:45	Ajima Galli	Dhalku Chowk	Kathmandu	Bagmati Province
b0006a5b-1daf-401a-bca9-75e56abfe9de	2990731066	New Chatterbox Cafe	27.7246276	85.3645888	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.747+05:45	Phulbari Marg	Bhual Dhanda	Kathmandu	Bagmati Province
5f7a02e8-fee5-4531-935c-d9cb519f8eb4	2090626818	Falcha cafe	27.717935	85.3307553	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.726+05:45	Banijya Marg	Kotal Tol 	Kathmandu	Bagmati Province
bacd9eb6-72db-4224-b5d7-0ced0e988391	3477018027	Places	27.715731700000003	85.30924010000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.774+05:45	Saat Ghumti Marg	Paknajol	Kathmandu	Bagmati Province
2d19c5cd-bc35-4ac4-8eab-b739aa89aff8	4264046054	Cafe Bonache	27.650514	85.3216022	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.806+05:45	Shital Marg	Bishal Chowk	Lalitpur	Bagmati Province
1f634c9b-fcd7-4944-b416-70f154bc8f74	9584999041	Dharane Sekuwa	27.6689444	85.26907270000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.949+05:45	Pushpalal Marg	San-la	Kathmandu	Bagmati Province
5c1d66c4-8381-47db-b692-4a8c2c05d4f1	9610450911	Chri resturant	27.668816900000003	85.2715807	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.949+05:45	Jakha Road	Da-thal	Kathmandu	Bagmati Province
366600e7-f11f-4a58-bda7-e47fd3f1e5ae	2476639972	Apple Cafe	28.246033800000003	83.9889263	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.736+05:45	Sundar Phid Marg	Tallo Dip	Pokhara	Gandaki Province
620a8400-3947-4579-a6b6-542eb27d6059	5965688287	Bloicha Momo	27.713568300000002	85.3115161	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.892+05:45	Narsingh Chowk	Lut Chok	Kathmandu	Bagmati Province
16c28059-1b6a-4c33-a0e8-9e36c3b21d57	10036515871	Thakali Taash	27.735059900000003	85.3111523	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.109+05:45	Kathmandu Ringroad	Gongabu	Kathmandu	Bagmati Province
6dedac1a-605e-4d2b-abe9-8cfc9bc20f8b	10036515873	Swadilo Cafe	27.735063	85.3111191	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.109+05:45	Kathmandu Ringroad	Gongabu	Kathmandu	Bagmati Province
e902b684-be67-44ef-8de0-a5aea1b22167	10036515874	Siddhartha lumbini tanduri resturant	27.7350619	85.3110846	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.109+05:45	Kathmandu Ringroad	Gongabu	Kathmandu	Bagmati Province
ac0989e5-bbb1-4dad-ba22-87a806c1bcaf	9969478193	Harati Momo And Fast Food	27.7059682	85.31697750000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.062+05:45	Baghbazaar Road	Baghbazar	Kathmandu	Bagmati Province
6b210a71-ea3c-463b-bbda-dc58e08cff93	10036366893	Garden View	27.7477231	85.3357744	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.108+05:45	Dhapasi Marg	Tokha	Kathmandu	Bagmati Province
43152d9d-8a5a-4a06-a9b1-3894c9bbd40f	2036065345	LaSoon Resturant	27.6785418	85.3137112	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.719+05:45	Pulchowk Jhamsikhel Marga	Dhobighat	Lalitpur	Bagmati Province
bc0a83b9-8908-4a24-976e-78a988ca35f7	3289615220	Lumanti Restaurant	27.669971500000003	85.2800354	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.757+05:45	Pragati path	Karki Gaon	Kathmandu	Bagmati Province
f65c0b3b-26d8-46ac-92c3-ce027b9e51bd	2075959193	Casa de Cass	27.6800035	85.3159514	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.722+05:45	Krishna galli	Pulchowk	Lalitpur	Bagmati Province
cd2598af-b09f-4e58-8159-ea628c3d223d	2077086064	Tashidelek	27.725186	85.3609636	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.722+05:45	Bodhi Guest house	Dhara Tole	Kathmandu	Bagmati Province
da8e0fe4-3ba6-4cd4-816e-d5c56877ffa4	2077086077	Best Pizza	27.725345	85.3610355	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.722+05:45	Bodhi Guest house	Dhara Tole	Kathmandu	Bagmati Province
001fa65f-4f94-46c7-96b0-db224e597419	3485754212	Asbin	28.219299600000003	83.95814220000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.775+05:45	40DR012	\N	Pokhara	Gandaki Province
025ec638-f653-4833-845a-581f98d45942	3488089622	Akatsuki Japanese Restaurant	28.2067242	83.96255740000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.775+05:45	7th Street, Shiva Marga	Baidam	Pokhara	Gandaki Province
51c2f38a-03db-40dd-ba0f-fc4c66c5fdde	10050716182	Ba Ko Chiya Pasal	27.665070500000002	85.3685561	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.111+05:45	Kaushaltar-Balkot	Purbeli Tol	Bhaktapur	Bagmati Province
5dd5a460-0f75-4b6a-98c3-4f0f08271293	2684818420	Work N Roll	27.6715851	85.3159634	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.742+05:45	Man bhawan Marga	Pulchowk	Lalitpur	Bagmati Province
484245cd-cdfd-4a39-a058-e9f0a73e638b	3486241998	Kunga Restaurant	27.7234127	85.3629641	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.775+05:45	Phulbari Marg	Bhual Dhanda	Kathmandu	Bagmati Province
5ff1d787-cc87-4c66-b32f-79a8d30f1eb3	3487462891	Buddhawraps	27.714571300000003	85.3105422	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.775+05:45	Paryatan Marg	Lut Chok	Kathmandu	Bagmati Province
6279c37a-5831-4335-ac7a-524da6bc1ef9	4786254923	Dining Park	27.699974500000003	85.338485	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.825+05:45	Devkota Sadak	Pushpa Nagar	Kathmandu	Bagmati Province
644ab9e2-fd9c-4c8c-b160-7c45a9a34909	3706491687	Dhaulagiri Resturent	28.239293600000003	83.98860690000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.785+05:45	Bhim Kali Patan	Taxi Chowk	Pokhara	Gandaki Province
6a604f5e-e7aa-4518-bb81-26e40ff8fdb8	3706499848	Dami momo Harami soup	28.247075700000003	83.9883377	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.785+05:45	Sundar Phid Marg	Tallo Dip	Pokhara	Gandaki Province
a9a70fd2-9e08-41bb-9422-8d6fc217abb1	3706504045	See First Cafe	28.25662	83.977851	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.785+05:45	Lamachaur Marg	Tallo Dip	Pokhara	Gandaki Province
1ddcc544-d3a4-4faa-a783-bcd2b65540cb	3706505099	Friendly Restaurant	28.256335800000002	83.977548	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.785+05:45	Lamachaur Marg	Tallo Dip	Pokhara	Gandaki Province
e59542ba-2590-47cd-9800-b1793864dffe	4361366694	Dautari Dohari Sanjh	28.2242311	83.98622490000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.809+05:45	Chipledhunga	\N	Pokhara	Gandaki Province
8badb317-dcbd-48db-899b-5bd9120c6939	4432077239	Blue Berry Kitchen and Coffee Shop	27.712681500000002	85.30904340000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.814+05:45	Kunphen Marg	Paknajol	Kathmandu	Bagmati Province
953966ff-b3ca-4d02-8813-df0ef19ed61c	4446267189	Golden Eyes	27.720956500000003	85.3616947	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.814+05:45	Chabhil-Baudha-Jorpati Sadak	Tusal	Kathmandu	Bagmati Province
288f991b-e8c7-4ada-bcb7-5c57823330c5	10229642690	jojo	27.722117	85.37713090000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.134+05:45	Club Mosses Marg	\N	Kathmandu	Bagmati Province
9ead277f-6d1c-447b-a75e-cc9e9e00ee44	10567757709	Entrance Cafe	27.6807757	85.3211399	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.135+05:45	Chakupat Marga	Kupondole	Lalitpur	Bagmati Province
25ef1927-ad66-4062-8d38-d6352554e172	10548850242	Kesariya Sweets and Snacks	27.7295364	85.33076460000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.135+05:45	Thirbam Sadak	Kiran Chok	Kathmandu	Bagmati Province
c67b6a1a-3d90-4672-b810-e48a51b3cb8f	10556402909	KTM Hunger Station	27.744067400000002	85.30962810000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.135+05:45	Lamichhane Tol	Shivanagar Tole	Kathmandu	Bagmati Province
5251ad9f-9636-46f4-96ff-7c33b350aa63	10576602041	Glassy Junction	27.674627800000003	85.28036420000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.135+05:45	Panga Road	Nayabazar	Kathmandu	Bagmati Province
84931977-e95e-45a4-a8d4-4fea479b52e7	11869572619	Hotel Mesokantu	28.2090023	83.98581970000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.154+05:45	Prithivi Highway	Shiva Tol	Pokhara	Gandaki Province
34591d9a-24fd-4c63-8f43-012847f7159b	4189725967	Atithi Cafe	28.2244242	83.98754790000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.8+05:45	Chipledhunga	\N	Pokhara	Gandaki Province
ecd3dce8-d20d-4ea9-b815-8dca978ee3e9	9724408514	Namaste Taudaha View Point	27.649563200000003	85.2805608	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.969+05:45	Dakchhinkali Road	Taudaha	Kathmandu	Bagmati Province
bf6e5542-6289-4b22-8eb4-bdd2fae557e1	9724448607	Subbu Restaurant	27.6505252	85.2821289	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.969+05:45	Dakchhinkali Road	Taudaha	Kathmandu	Bagmati Province
40cb62de-51cd-46f5-9af7-3ddef7073ae1	9724452085	Taudaha Banquet And Restaurant	27.650319900000003	85.2836293	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.969+05:45	Dakchhinkali Road	Taudaha	Kathmandu	Bagmati Province
cc9f9d0d-438e-490c-b794-23c68014e429	9942586817	Jyapu Aila	27.674866100000003	85.3226494	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.051+05:45	Pimbaha Dhauga Galli	Dhaugal	Lalitpur	Bagmati Province
402bf796-0103-4f36-9695-187a19b6fe05	9933907021	Stupa Tea	27.717834000000003	85.3616274	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.05+05:45	Dibya Marg	Tusal	Kathmandu	Bagmati Province
c55c7e99-579d-411e-9a61-e941de261ce8	9933907123	Dumree Kitchen	27.718571	85.36143530000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.05+05:45	Baudhadwar Marg	Pati Tar	Kathmandu	Bagmati Province
9ec30481-910e-4bfd-a05f-f2c254dea672	2632354512	Lotus Corner	28.2214548	83.955771	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.738+05:45	40DR012	\N	Pokhara	Gandaki Province
57121e97-6c49-4fc9-8536-87841a4ef908	11869551096	Hotel Deep Mala	28.207629700000002	83.98390040000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.153+05:45	Siddhartha Highway	Indrapuri Tol	Pokhara	Gandaki Province
27820d01-d1d7-4b5b-a7f2-739a48ecc201	2006419428	Aabhusan Cafe	27.712805000000003	85.32775000000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.718+05:45	Bhagwati marg	Kamalpokhari	Kathmandu	Bagmati Province
c8ef6b5c-4add-41a9-ac2f-25ada4da9a41	9944647776	Happy Panda Tea and Snacks	27.6730507	85.3078213	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.052+05:45	Machindranath Sadak Marga	Dhobighat	Lalitpur	Bagmati Province
ead9f1e6-6188-4cfe-9870-eb611a6dcf5a	3254971961	Maharjan Sekuwa Corner	27.670528200000003	85.2797661	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.757+05:45	Shahid Path	Dhwa-Kha-Shi	Kathmandu	Bagmati Province
e4cc100c-353b-49e4-a40c-0f64b2082dbe	9999145653	Silauto Sekuwa Station	27.673361200000002	85.3554142	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.066+05:45	Gandnayak Marg	Kot Devi	Kathmandu	Bagmati Province
c9cad233-ad19-49a0-af24-780adbdc5b05	9999145658	Yawachi Sekuwa Corner and Restaurant	27.6735611	85.3554519	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.066+05:45	Gandnayak Marg	Kot Devi	Kathmandu	Bagmati Province
1cb8e182-ba8a-4eca-988b-f87170ed01de	5067983823	Shrestha Bhojanalaya	27.678905	85.3204989	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.837+05:45	Yella Dhwakha Marg	Pulchowk	Lalitpur	Bagmati Province
e343b466-7e5d-44d4-b658-4207c36f194d	5072480722	Kung Fu Noodles	27.7122512	85.310219	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.837+05:45	J.P. Road	Paknajol	Kathmandu	Bagmati Province
dc6c2d79-1712-4863-9b9e-b25ebe20479e	5075029392	Twin Banquet	27.683056200000003	85.29617420000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.838+05:45	Kumari Club Marga	Balkhu	Kathmandu	Bagmati Province
b562974f-624f-42cd-8b44-50370fb0f632	5589588660	Life is Beautiful Cafe	28.199957700000002	83.94622070000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.882+05:45	Peace Pagoda Road	\N	Pokhara	Gandaki Province
08fa8084-b7c5-467c-8e43-7c16782884ba	10789652320	Ravi Cafe	27.6675478	85.34480500000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.141+05:45	Balkumari-Balkot road	Phaudegau	Lalitpur	Bagmati Province
b27e0eb4-7dff-43d3-82a7-1c2305eca10d	4155180091	Kavreli cafe	27.711837900000003	85.3541503	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.792+05:45	Guheswori Bridge	Kumarigal	Kathmandu	Bagmati Province
3db7b0c2-10c0-4bd8-b304-e7429840de23	5075026794	Himalayan Java Coffee	27.7219078	85.3616193	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.837+05:45	Phulbari street	Dhara Tole	Kathmandu	Bagmati Province
4e2bcd7d-17c0-42fe-ae0d-a2b41b92a528	5909455366	Pizza Zone	27.7087171	85.3274442	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.89+05:45	Thirbam Sadak 3	Gyaneshwar	Kathmandu	Bagmati Province
b60255e3-d196-491a-91fd-ae84e9f6fcd1	4620660402	Jyapu Aaila	27.674716500000002	85.3230278	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.819+05:45	Pimbaha Dhauga Galli	Dhaugal	Lalitpur	Bagmati Province
d7380931-abb3-449c-bb14-91181e714cca	5963272209	Green Chilli Restaurant	27.752986600000003	85.3267531	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.891+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
b4183d58-d55a-4471-873a-d4a2332a5845	5964083685	Mukthinath Thakali Kitchen	27.712712300000003	85.3086516	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.892+05:45	Paknajol	Tahiti	Kathmandu	Bagmati Province
e57988cc-b976-44bd-bd92-c406b9944ebc	9999145632	Terai Sekuwa Corner and Katiya House	27.6705487	85.35478400000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.066+05:45	Naulo Marg	Kot Devi	Kathmandu	Bagmati Province
bf95d252-c615-43ff-b583-6dd33e3835fc	8696860205	Silauta	27.714221400000003	85.3098949	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.92+05:45	J.P. School Road	Paknajol	Kathmandu	Bagmati Province
839a931e-4a3b-4c13-8539-511f1ebbb11e	9969478190	Pk Fast Food And Cafe	27.705963	85.3169391	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.062+05:45	Baghbazaar Road	Baghbazar	Kathmandu	Bagmati Province
62501027-7557-4ebb-9612-0d5da45308be	5225729521	Cha Cha cafe	27.712690000000002	85.3118379	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.847+05:45	Amrit marg	Lut Chok	Kathmandu	Bagmati Province
693f4b6c-90cb-4cdf-9b25-e9cef032b7ac	10004786585	Newa Cuisine	27.6735249	85.351797	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.07+05:45	Gandnayak Marg	Kot Devi	Kathmandu	Bagmati Province
8536940a-89d1-41ef-b91c-dff4156c4ae3	11247610334	Tenjing restaurant	27.710757	85.4155863	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.145+05:45	F95	\N	Bhaktapur	Bagmati Province
d761a181-fc12-42a2-8ef1-03b50d49675d	5581858116	Prashan Restaurant	28.1795434	84.08486280000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.88+05:45	urban road	Lamaswara	Pokhara	Gandaki Province
80045a84-748d-41be-b8a1-ca7955977b76	5581858126	Riyale Hight Cottage Restaurant	28.173363000000002	84.083055	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.881+05:45	Thul Dhunga Marg	Mohoriya Chowk	Pokhara	Gandaki Province
a1fafcba-f491-4e5b-b438-ec95da80175e	2006116226	Tifin Home	27.7175696	85.3289324	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.717+05:45	Gairidhara Road	Narayan Chaur	Kathmandu	Bagmati Province
edebd731-92c0-4889-a37a-0d4c00674a6f	2858843075	S Cafe and Coffee Shop	27.686644500000003	85.30940980000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.745+05:45	तन्गिन मार्ग	Arun Thapa Murti Chowk	Lalitpur	Bagmati Province
e0b35ab0-e0fd-4d24-98ec-e9f81eab9be5	2875931753	Jaggu Mud House	27.725188600000003	85.3312472	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.745+05:45	Embassy Marg	Kiran Chok	Kathmandu	Bagmati Province
64daabc7-6b28-40d9-a775-a5652ab269f3	10011753520	CCM Foods	27.743326500000002	85.3255962	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.083+05:45	Rambabu Marg	Tokha	Kathmandu	Bagmati Province
5ee72053-142e-4d81-848b-62be60737255	10011926423	Samjhana Momo Center	27.744048300000003	85.33000100000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.085+05:45	Hari Marga Tole	Tokha	Kathmandu	Bagmati Province
b8382086-3dce-437a-8e41-67e9b43eab4a	10121388727	Food Mantra Restro and Bar	27.6794358	85.33674540000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.117+05:45	Janata Marg	Sahayogi Nagar	Kathmandu	Bagmati Province
b4eb9872-8065-4817-8ecc-cdc253af8a3b	10121388730	Nepali Thali	27.6790705	85.3363384	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.117+05:45	Janata Marg	Sahayogi Nagar	Kathmandu	Bagmati Province
a92f86e5-8107-4fb8-aa4b-71d8b39e9c44	10121388731	River Side	27.6790205	85.3359775	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.117+05:45	Janata Marg	Sahayogi Nagar	Kathmandu	Bagmati Province
70636eec-23e9-424a-bc23-0c6584bc5edc	4172777601	New Buddha Restaurant	28.206574600000003	83.9946415	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.799+05:45	Gautam Buddha Marga	Buddha Chok	Pokhara	Gandaki Province
2248de43-a43b-467e-adf6-1d69be8ddd5f	10016176887	Jalpa Special Momo Center	27.747669400000003	85.31806920000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.099+05:45	F81	Baluwapati Chowk	Kathmandu	Bagmati Province
1b800dee-0de6-4d32-b0dc-13492fa861a7	1937710614	Rosewood Restaurant	27.677324900000002	85.3089262	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.712+05:45	दमकल चक्रपथ मार्ग	Dhobighat	Lalitpur	Bagmati Province
967b3a03-910f-4d5b-9d0a-547a46ca48a2	8699927586	Happy Hotel And Restaurant	27.7144851	85.31069980000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.921+05:45	Paryatan Marg	Lut Chok	Kathmandu	Bagmati Province
02657316-d95f-436e-958d-476294ed37a2	8699927587	Thamel Burger	27.7142966	85.31071100000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.921+05:45	Paryatan Marg	Lut Chok	Kathmandu	Bagmati Province
2161f9c9-186b-46f3-a5a5-be6f7f57906e	1937710615	Sandwich Sunday	27.674624400000003	85.3081801	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.712+05:45	Dhobighat Ganesh Marga	Dhobighat	Lalitpur	Bagmati Province
36495bee-3acf-479f-9379-de1bdfa6d0c9	5516693175	Momo House	28.2227904	83.9886125	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.872+05:45	Deurali Galli	Chipledhunga	Pokhara	Gandaki Province
36d0c529-7914-42bf-83e9-6768c0bba5e3	3304340676	Apples Cafe	27.673661600000003	85.2806487	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.758+05:45	Town Planning Road	Hanuman Ghat	Kathmandu	Bagmati Province
2b3d63d1-7bf0-4351-ae33-40b5dc3a34ae	4041350346	Aaron Cafe	28.257494500000004	83.9770168	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.79+05:45	Lamachaur Marg	Amala Bisaune	Pokhara	Gandaki Province
6a562b8e-dd55-49b0-8197-8d28502cc3b5	4364127053	Thamel Restaurant	27.7178776	85.31009080000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.81+05:45	Chaksibari Marg	Sorakhutte	Kathmandu	Bagmati Province
2bd73649-fede-4f31-985b-11c71934bf77	10253632939	ku	27.7233313	85.3780739	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.134+05:45	Club Mosses Marg	\N	Kathmandu	Bagmati Province
8d089fa1-0503-4bf6-96cf-ea101b1ce0d5	10121408429	New Famous Argakhachi Chiya Nasta Pasal	27.6803147	85.34204600000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.119+05:45	Dharmasthal Marg	Seti O.P.	Kathmandu	Bagmati Province
60894bbd-e217-4ffd-87ec-2144bb788dfd	10121408433	Hotel Band D Cafe	27.6804203	85.34169150000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.119+05:45	Dharmasthal Marg	Seti O.P.	Kathmandu	Bagmati Province
076fb9c2-4fa0-4003-9b1d-5360b83b6fe1	10121408479	Mahadevsthan Donut Pasal	27.6801211	85.3421363	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.119+05:45	Dharmasthal Marg	Seti O.P.	Kathmandu	Bagmati Province
22234b89-a5a4-4a6e-a416-2c2a3a969312	5028164639	Shivala Restaurant	28.158546400000002	83.98194910000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.837+05:45	40DR016	\N	Pokhara	Gandaki Province
da439df3-ef9e-4d4f-b6ea-5276a67e58ad	9555543075	Prashanna cafe	27.6706626	85.2790145	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.947+05:45	Panga Road	Dhwa-Kha-Shi	Kathmandu	Bagmati Province
1509a0ae-c33e-4459-a5c8-f9314bf4c32f	3506388087	RatoValle	27.691622600000002	85.32646720000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.777+05:45	Madan Bhandari Path	\N	Kathmandu	Bagmati Province
110f09d8-6ef4-4166-912a-5fef7bda9640	3507082049	Aurora Borealis	28.218853600000003	83.95834930000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.778+05:45	40DR012	\N	Pokhara	Gandaki Province
99d009fe-e9f4-41ae-ae97-c67cf4bb6144	5459168687	Sabita Momo Restaurant	28.1902413	83.97280810000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.862+05:45	Shishuniketan Marg	Birauta chowk	Pokhara	Gandaki Province
e0032525-0961-4d89-89ef-078f7734a478	2684758536	catalyst cafe	27.6696226	85.30964990000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.74+05:45	Bhanimandal Sadak	Dhobighat	Lalitpur	Bagmati Province
3f5f0696-0f0d-49bc-9030-fdad96f733c4	9942584622	Paal	27.676060200000002	85.32002750000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.05+05:45	Chha Baha Jagmadu Pukhu Marg	\N	Lalitpur	Bagmati Province
d40ed666-ffd0-4a52-b15f-44793d144e12	8120320827	Nature View Cottage	28.177627200000003	83.9701907	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.915+05:45	Rameshwar Marg	\N	Pokhara	Gandaki Province
5c9abae1-e0b8-4974-bd57-fa0df04441fa	8239184604	Dulcify Cottage and organic farm house	28.250267700000002	83.9424189	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.915+05:45	Thapa Street	Garjati	Pokhara	Gandaki Province
209f0bd6-3105-47fd-b7fc-6b70cf217439	8276947165	Dream Junction Cafe and Restaurant	27.7133243	85.3435663	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.915+05:45	Dharma Bhakta Mar	Panna Hiti	Kathmandu	Bagmati Province
820f0ebb-4123-4a44-8a72-81466e3579ad	8280289990	Tuppi Dai ko Sekuwa Corner	27.713328200000003	85.3435465	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.915+05:45	Dharma Bhakta Mar	Panna Hiti	Kathmandu	Bagmati Province
7a241d3e-f4fe-4250-83a2-f3ca9bfb2b3b	10060007987	Burger House and Crunchy Fried Chicken	27.671873700000003	85.38559670000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.114+05:45	26DR002	Gatthaghar	Bhaktapur	Bagmati Province
4a0a46b3-d79d-446f-9a0a-df52a34787de	2006144732	Utam Restaurant and Bar	27.7177772	85.3282623	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.718+05:45	Gairidhara Road	Narayan Chaur	Kathmandu	Bagmati Province
f7e3bf2e-7dc4-4f77-bd75-ed8ebe1996f9	5491232009	Thakali Chulo	28.223948600000003	83.986017	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.87+05:45	Chipledhunga	\N	Pokhara	Gandaki Province
97e1eb72-0252-4fa9-9d52-470578a65f98	5491329790	Suraj Restaurant	28.221590300000003	83.9870865	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.87+05:45	New Road	\N	Pokhara	Gandaki Province
543164bb-3075-4a0a-a510-b7f73164e5f4	5491329802	Nandan Madwari Bhojanalaya	28.222456100000002	83.98733150000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.87+05:45	New Road	\N	Pokhara	Gandaki Province
362575a4-8c1b-4061-8f68-c92aa464c2e5	10049098936	Jhol Momo	27.6734967	85.36471230000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.11+05:45	Kausaltar-Balkot	Sagbari	Bhaktapur	Bagmati Province
478caece-c81e-4afc-9062-9ba874a34a0a	5491405998	Sweet Spot Restaurant	28.227947200000003	83.93769	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.87+05:45	40DR012	Bhakunde	Pokhara	Gandaki Province
52c31319-ec9b-4656-a476-b34dad928f00	10011219704	Parbat Samjhana Sekuwa and Momo House	27.735337800000003	85.3086653	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.082+05:45	Kathmandu Ringroad	Gongabu	Kathmandu	Bagmati Province
c015f018-dde0-45dc-8366-e2ce6228f82d	10013196138	Hot Spicy food Station	27.7507637	85.3329739	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.088+05:45	Sangam Marg	Tokha	Kathmandu	Bagmati Province
f07acb9a-936f-481f-b327-943f70283408	10013281665	Durga Food land	27.752474900000003	85.33379520000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.088+05:45	Chyasundol Highway	Budhanilkantha	Kathmandu	Bagmati Province
aea0e4d3-7a11-454f-b609-b7b45f0df289	5587849053	Margherita	28.220671300000003	83.95744280000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.881+05:45	40DR012	\N	Pokhara	Gandaki Province
cd0e9fe1-6e3b-4901-acff-c2761304dd36	10016234243	Dhadinge Restaurant and Fast Food	27.761124300000002	85.31905420000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.099+05:45	NH38	\N	Kathmandu	Bagmati Province
0bc78def-e34a-4186-8a2e-c40810eeba27	10016234259	Himalaya Cafe and Snooker House	27.7571413	85.31975750000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.099+05:45	Grande Road	\N	Kathmandu	Bagmati Province
8de84da7-3eb5-4823-a28f-fa0836b5b6e7	10016366525	Hamro resturant and cafe	27.745048200000003	85.3184038	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.1+05:45	F81	Baniyatar	Kathmandu	Bagmati Province
0548882c-48d6-4621-9e30-5594a46b242e	10016366542	Ruwivalley ghaley hotel	27.7449994	85.3195178	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.1+05:45	F81	Baniyatar	Kathmandu	Bagmati Province
05e57793-cfa0-4819-a81a-94c35b167bc7	10121388738	Dovan Garden Restaurant Lounge and Bar	27.678887300000003	85.335047	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.117+05:45	Janata Marg	Thulodhara	Kathmandu	Bagmati Province
835e625a-d6a9-4e2b-9ca2-b18360a5cd9a	5458862996	Pandey Restaurant	28.206163200000002	83.96216910000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.862+05:45	7th Street, Shiva Marga	Baidam	Pokhara	Gandaki Province
cb34e61d-af3e-4d82-b751-d5a035fbc639	4361274085	Le Cafe	28.2238359	83.9906679	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.809+05:45	Chipledhunga	\N	Pokhara	Gandaki Province
5cc09b6a-8616-4179-9e8c-8473f7c52502	10011926540	Yellow Cafe	27.7433556	85.32992250000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.085+05:45	Hari Marga Tole	Tokha	Kathmandu	Bagmati Province
3c4232c1-b24e-46e7-b095-b73a23bf02f0	9648156186	Classic sports and bar	27.6741837	85.28029140000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.954+05:45	Panga Road	Nayabazar	Kathmandu	Bagmati Province
82695a91-535f-48f2-9580-f16fc0ce3044	9655395844	Nakha restaurant	27.6792532	85.2756985	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.954+05:45	Than-ba-hah Lanh	Than-ba-hah	Kathmandu	Bagmati Province
dc38eb92-9a65-4959-8da4-688dd93d00b7	9655414182	Ghigu sekuwa chey	27.6814828	85.27884080000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.954+05:45	Way To Ring Road	Sa-lin-chhn	Kathmandu	Bagmati Province
6d9f6fe1-284a-4059-9725-604ddbb6ad7a	9655462617	Aroma fast food	27.6816087	85.2792328	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.954+05:45	Way To Ring Road	Sa-lin-chhn	Kathmandu	Bagmati Province
024afe54-bedb-4ce0-83c8-600aac83a132	10121566074	Khaja And Momo Stations	27.6788239	85.3353415	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.127+05:45	Buddha Galli	Thulodhara	Kathmandu	Bagmati Province
23e02dc2-4f63-4283-8200-343be4f452f6	9926729655	Shandar Momo	27.691007600000002	85.3175006	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.048+05:45	Thapathali Road	Thapathali	Kathmandu	Bagmati Province
46e26abd-d69d-4538-954a-bcb95f4dcc94	10013326044	Mongolian Resturant	27.739573800000002	85.31332490000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.089+05:45	F81	Tokha	Kathmandu	Bagmati Province
2bf530f6-dbd8-4607-ac3b-26448fbbdc52	10013326082	Top stick food and momo magic	27.7386473	85.3121694	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.09+05:45	Ram Marga	Tarakeshwar	Kathmandu	Bagmati Province
b1078764-cf84-4f3a-a625-f032cf479361	10007887775	Chhahari Panipuri and laphing Center	27.736459900000003	85.31764000000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.073+05:45	Purna Street	Deepjyoti	Kathmandu	Bagmati Province
dedc89aa-8288-46fd-b394-9e894f1d381c	4287869895	Javista Cafe	28.2065789	83.959879	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.806+05:45	10th Street, Bharat Bhattarai Marga	Baidam	Pokhara	Gandaki Province
edce7564-5f70-4345-9559-2d0c90a1c32c	9999145667	The BBQ Station	27.674086300000003	85.35558180000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.066+05:45	Araniko Highway	\N	Bhaktapur	Bagmati Province
4d03ab92-1327-40a8-aa4b-1707213acee2	5515371671	Sundhar Rupa Begnas Restaurant	28.164113500000003	84.07539320000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.872+05:45	Lake Road	Ekata Tol	Pokhara	Gandaki Province
b6055ad3-867a-40fb-a17f-05ed944953ef	10009137502	Regal Cafe and Fast Food	27.746605600000002	85.3226418	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.074+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
3328827d-b53c-4919-b04f-9ab93f7e0854	10121523062	Karkayo	27.682780800000003	85.3484528	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.123+05:45	Basuki Nagar Marg	Basuki Nagar	Kathmandu	Bagmati Province
e18f0d85-68d6-4a8a-a97b-10cfaf0447ff	9645212013	Bake 8	27.6766095	85.2760662	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.954+05:45	Kirtipur Ring Road	Khahsi bazar	Kathmandu	Bagmati Province
027dbae2-1595-43b9-96d5-cb6cd6aaf42e	9645212950	Chaitya restaurant	27.6790428	85.2725575	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.954+05:45	Kirtipur Ring Road	Khahsi bazar	Kathmandu	Bagmati Province
34545bba-78a0-4ae0-bbce-b28a13377fa2	1183926048	Wooden Coffee House	28.2057156	83.9624812	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.692+05:45	6th Street,Peaceful Road	Baidam	Pokhara	Gandaki Province
bf4b3fad-441b-4b6f-9bb3-46f2653b21e9	11341043746	Sami croissantery	27.683946600000002	85.31224680000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.146+05:45	Maitri Marg (Bakhundole)	Bakhundol	Lalitpur	Bagmati Province
160e264c-49e8-4079-a377-06ee2bb56205	11949861712	Sangyapsal live kareoke music	27.6736131	85.373638	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.16+05:45	Araniko Highway	Araniko Basti	Bhaktapur	Bagmati Province
9ea85b84-7573-4889-b2a1-366748fb3d32	9527281324	Indreni Food Land	27.7381373	85.33985630000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.937+05:45	Kathmandu Ringroad	Ganesh Basti	Kathmandu	Bagmati Province
5c834f27-1710-41a3-923c-c07058376565	4921602765	Kwality Cafe	27.7347207	85.3173512	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.833+05:45	Kathmandu Ringroad	Deepjyoti	Kathmandu	Bagmati Province
88087113-c18b-4913-8d94-8278df2bcfd1	3439142083	Phat Khat	27.7138998	85.31053820000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.772+05:45	J.P. School Road	Paknajol	Kathmandu	Bagmati Province
beaed47d-13db-4fc5-b1b1-568d97f9cd1d	3155909220	Birgunj Parsa Sekuwa corner	27.6929705	85.2794094	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.753+05:45	Tribhuvan Rajpath	Nagarjun	Kathmandu	Bagmati Province
66d6b483-5746-4410-b53e-9814ad7800aa	2079675421	Road Side Kitchen	27.7429291	85.33374620000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.724+05:45	Dhapasi Marg	Tokha	Kathmandu	Bagmati Province
9c2d55e5-241f-4dfa-aae2-ffda2a45976b	2684757122	Tandoori fast food	27.671919000000003	85.3129037	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.74+05:45	Utter Bagaicha Marga	Dhobighat	Lalitpur	Bagmati Province
acdade41-ef2f-4052-a14e-973a681c63e4	2684757427	momomiya darjeeling restaurant	27.668743900000003	85.3097523	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.74+05:45	Jawalakhel Yekantakuna Sadak	Dhobighat	Lalitpur	Bagmati Province
7bf45a44-c92c-41e2-91d3-36f617dc5014	9527226610	Darjelling Flavour Momo	27.739854	85.3374931	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.937+05:45	Kathmandu Ringroad	Narayan Gopal Chowk	Kathmandu	Bagmati Province
67d5e213-b982-4305-9191-f41041474594	2083743586	The Bajra Cafe	27.7044882	85.3062093	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.724+05:45	Yatkha Road	Pyaphal	Kathmandu	Bagmati Province
43787706-a993-470a-ba5e-649af9adf457	9527281364	Newari Fast Food Manshagaliko Purano Famos Sandaar Momo Center	27.734379200000003	85.34299320000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.939+05:45	Kathmandu Ringroad	Milijuli Tol	Kathmandu	Bagmati Province
f76e1904-ac3e-4d4f-a7e7-9f8432d863c6	4692286790	Wheel Grill	27.714698100000003	85.3098538	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.821+05:45	Center Mart Galli	Paknajol	Kathmandu	Bagmati Province
bb4997d3-8469-4f35-9a54-d6408021ae99	5532451321	Cheap Food	27.7133848	85.3116796	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.875+05:45	Narsingh Chowk	Lut Chok	Kathmandu	Bagmati Province
4167ab9e-60e5-48ba-9320-5fb3563110e5	5589588661	Sudhir Cold Stores	28.199955300000003	83.94593780000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.882+05:45	Peace Pagoda Road	\N	Pokhara	Gandaki Province
81a49962-3d51-4482-960d-a558bb085026	5589588662	Chatpat Pasal	28.199988100000002	83.9458048	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.882+05:45	Peace Pagoda Road	\N	Pokhara	Gandaki Province
79e888ed-e0ce-4a70-9abe-7cc7901bafdf	1350468491	Red Dingo	27.6721502	85.31509170000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.694+05:45	Yala Sadak	Dhobighat	Lalitpur	Bagmati Province
849edc61-3c5d-4cb2-9514-4fdb5cebff74	3074577225	Muskan Resturant Bar	27.7117079	85.3380403	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.75+05:45	Rudra Mati Marg-2	Paneku Tol	Kathmandu	Bagmati Province
8070c010-fe8f-4fb9-979f-4e7d89d326fa	9626272931	Sawaa chenn	27.667254200000002	85.279464	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.951+05:45	Ajaya marga	Samocha	Kathmandu	Bagmati Province
8ca3b68c-bbf4-4e30-bec9-94380e5270d4	10011873431	Myagdi Baglung Purano Cutting Tatha Sekwa Corner	27.7362071	85.312414	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.084+05:45	Kathmandu Ringroad	Gongabu	Kathmandu	Bagmati Province
23d26961-a192-451c-af5e-86167c824442	6499238728	Changu Resturant	27.7161809	85.43076040000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.901+05:45	Bhaktapur- Changunanrayan Road	\N	Bhaktapur	Bagmati Province
da0bd8a8-59c3-4605-b7b2-eef8d0ab3681	5544172867	All Time Restaurant	28.218431000000002	83.9902969	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.876+05:45	Naya Bazar	Chipledhunga	Pokhara	Gandaki Province
14676902-614f-4da6-9453-5e64f774fdfa	9530448526	KKFC	27.7020932	85.30987520000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.947+05:45	Pako Sadak	\N	Kathmandu	Bagmati Province
383ccc48-3e69-46ee-980e-018edbbab33f	3637654265	Trisara	28.2105013	83.9560934	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.783+05:45	Fewa Walkway	Baidam	Pokhara	Gandaki Province
0bdb49ce-eade-4420-bfb4-902eee8fa7a5	3680170442	Ambience 365	27.675776600000003	85.31833610000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.784+05:45	Ambience Path	\N	Lalitpur	Bagmati Province
7821e50a-e9f3-4a9d-89e6-a60d0de38b24	3700718891	Thakali Kitchen	28.2234695	83.987571	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.785+05:45	New Road	\N	Pokhara	Gandaki Province
ddfc5d6b-00b5-4149-90a5-5f2e0f5c4401	3699591164	Deurali Bhojanalaya	28.2238642	83.98897190000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.784+05:45	Deurali Galli	Chipledhunga	Pokhara	Gandaki Province
78119a9a-c9d4-4023-9401-15fe17e004ce	3700728374	Station Resturant	28.223292100000002	83.9885907	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.785+05:45	Niva Galli	Chipledhunga	Pokhara	Gandaki Province
18cb0f98-652e-4892-8289-4234d02fd11e	11932964969	Funko Food Cafe	27.6683853	85.32296910000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.155+05:45	Lagankhel to Mangal bazar road	Hakha Tol	Lalitpur	Bagmati Province
61ff0adb-710b-4f93-afb8-945b532e64a6	4800970677	Pokhara Chinese Restaurant	28.210041200000003	83.95689320000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.829+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
5dc929cd-5c5d-45cf-9e7b-90d85dff3e3b	3637654245	Fewa Fusion	28.2105068	83.9568271	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.783+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
543871c0-45e6-461f-ad0d-6482b539686b	4804949523	The Embers Restaurant	27.679815700000002	85.3190189	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.83+05:45	Krishna galli	Pulchowk	Lalitpur	Bagmati Province
28c78fd9-dc03-43d6-bdaf-eb1f9034e372	10991410805	N2 Coffee Shop	28.241596100000002	83.9865436	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.143+05:45	Purano Tundikhel Road	Hari Chok	Pokhara	Gandaki Province
9679cb17-0867-4841-835f-6587185e467f	11019621907	Shenature Cafe	27.716157000000003	85.3130675	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.143+05:45	Bhagwan Bahal Marg	Lut Chok	Kathmandu	Bagmati Province
fd7d8cdd-c9d2-40a4-943f-0207a5a6d48f	4401895789	San Chon	28.210992500000003	83.9589888	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.811+05:45	Street 16t (Samikopatan)	Baidam	Pokhara	Gandaki Province
63b1ca80-7925-4618-aaaf-5881480e505a	4409617194	Yeti Restaurant	28.217123800000003	83.9584021	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.812+05:45	Gantavya Marg	Baidam	Pokhara	Gandaki Province
330efa40-a6f3-4f7a-827c-f9c3c0aee70c	10121403413	Coctail Cafe and Restro	27.6832792	85.3482417	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.119+05:45	Subidha Marg	Basuki Nagar	Kathmandu	Bagmati Province
7fa0655f-be62-40b9-8917-abee9aa9b179	8696410306	Rhino Cafe And Restaurant	27.7104834	85.3112517	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.919+05:45	Jyatha Marg	Kamalachi	Kathmandu	Bagmati Province
1ee218a9-6458-4a97-b056-46f4260098ac	4405236590	No Name Restaurant	27.674231900000002	85.2769043	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.812+05:45	Pushpalal Marg	San-la	Kathmandu	Bagmati Province
159a602c-f796-4c03-82c8-fdeb3d1107d6	11869551087	Syangja Hotel	28.2072362	83.98369740000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.153+05:45	Siddhartha Highway	Indrapuri Tol	Pokhara	Gandaki Province
6d8aec57-c862-496c-b8a4-bdcb4ea3196e	9999295240	Spicy Momo and Stick Food House	27.669323300000002	85.3528873	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.068+05:45	Manohara Corridor	Thulodhara	Kathmandu	Bagmati Province
23c16044-c8ce-44fd-a976-627d69c15412	10013666887	Fud Cafe	27.753041900000003	85.32670560000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.091+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
0b5812dc-eaaf-488f-b94f-2b20c3d42ff4	9648125149	Pipal Cafe	27.675149700000002	85.2769344	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.954+05:45	Kirtipur Ring Road	Khahsi bazar	Kathmandu	Bagmati Province
89775664-30b3-4040-91b1-3cfd55919bc6	5472541749	Sansil Hotel	28.150712300000002	84.0645296	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.865+05:45	Prithvi Highway	Bhandardik	Pokhara	Gandaki Province
d60b13a6-f30f-439e-81b3-cc7ffa45f249	10698637831	Four 7 Restro	27.6730641	85.3856014	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.137+05:45	26DR002	Gatthaghar	Bhaktapur	Bagmati Province
6f4096a2-a3ef-4669-abe5-45272e54501d	5921949708	Joshi Food Cafe	27.7087867	85.33177260000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.891+05:45	Pashupati Marga	Gyaneshwar	Kathmandu	Bagmati Province
69cf3a58-6624-4431-947c-22733f7702c4	4929912122	Blue Note Cafe	27.684787200000002	85.3076084	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.833+05:45	Siddhi Binayak Marg	Arun Thapa Murti Chowk	Lalitpur	Bagmati Province
e2be5e6d-5cd0-4df6-9a5d-1a24295d95bd	4931713731	TipTop	27.7395639	85.3382524	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.834+05:45	Kathmandu Ringroad	Narayan Gopal Chowk	Kathmandu	Bagmati Province
2505e9ef-8900-45af-93b6-eb614e2f7899	2668883270	La dolce vita italian restaurant	27.714979000000003	85.31037690000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.739+05:45	Chaksibari Marg	Lut Chok	Kathmandu	Bagmati Province
1e094176-572e-4c05-ac86-2263a169350d	2684630120	hangout	27.6850859	85.3346508	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.739+05:45	Sankhamul Marg	Shankhamul Chok	Kathmandu	Bagmati Province
6be1aa29-7f5a-4639-86bb-4135f149660b	11306546069	Duwakot	27.696972600000002	85.4117566	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.145+05:45	Rudraksha Road	anjaan	Bhaktapur	Bagmati Province
9d0705c0-0b20-46f2-8481-6672ba153fb3	10701109883	Harati Newari Kitchen	27.758529000000003	85.3097554	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.137+05:45	Ratna Park - Phutung Sadak	Loktantrik Chowk	Kathmandu	Bagmati Province
0fd13a4b-1ca5-408e-8311-899f0034a14d	10701172477	Kafe Codes	27.688771000000003	85.3278975	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.137+05:45	Rudramati Marg	Thapa Gaun	Kathmandu	Bagmati Province
ae54abd2-c419-4640-bb5f-eeadafb20e31	10698637832	A2 Matka chiya and Fastfood	27.671532600000003	85.38605120000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.137+05:45	26DR002	Gatthaghar	Bhaktapur	Bagmati Province
3ded3dfc-9c4b-4919-9d42-45e82c476edb	10698637833	Saleri Restro and sekuwa hub	27.6707964	85.3852573	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.137+05:45	26DR002	Joshigau	Bhaktapur	Bagmati Province
b06ebd96-8ec0-4b8b-a1af-2ecc93418694	4269633190	Marwadi Sewa	28.2239483	83.9901559	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.806+05:45	Mahendrapool	Chipledhunga	Pokhara	Gandaki Province
ed8e1f66-1084-4322-90c2-bea83a572def	8696410316	Aambo Momo	27.710590200000002	85.3108615	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.919+05:45	Thahity Jyatha Marg	Tahiti	Kathmandu	Bagmati Province
6dc56a0d-bc44-4141-8650-659e82f3b6c5	8696832028	Markham Bistro	27.7122466	85.3107287	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.919+05:45	Chhetrapati	Lut Chok	Kathmandu	Bagmati Province
807fcae3-f529-4cd5-8a4a-eedd61c359cc	10108155295	fish house	27.6882118	85.3696979	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.115+05:45	SanoThimi-Bode	Naagdesh (Nagadesh)	Bhaktapur	Bagmati Province
d023c266-9fbd-4017-a1fa-d9da2ebf4a69	5242388570	Crunchy Launch House	28.164208700000003	84.0949142	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.851+05:45	F162	Sundarindanda	Pokhara	Gandaki Province
9fc9dcac-afcc-4c6e-a052-bd45af30a3e8	10048925650	Biryani Adda	27.6846177	85.3671793	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.11+05:45	F86	Madhyapur Thimi	Bhaktapur	Bagmati Province
cd5d06f0-981b-46ec-b5ed-df9f71d7c97d	9529773233	Kwality food Cafe	27.702829400000002	85.3111305	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.946+05:45	Khichapukhu Sadak	\N	Kathmandu	Bagmati Province
d4ad6aa6-87c4-4bd8-abde-e7ac8347cbc1	9529903895	Yelo Cafe	27.7031713	85.3100234	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.946+05:45	Pako Sadak	\N	Kathmandu	Bagmati Province
9e4af9d1-cb3c-4d19-8ab9-f44e878a5874	9530348742	The Green Food Land	27.7020136	85.3098417	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.947+05:45	Pako Sadak	\N	Kathmandu	Bagmati Province
1b4a50fe-11bd-4c91-927e-afe692d2cef1	11414443771	VELLA BIN CAFE	27.6936013	85.2812899	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.149+05:45	Ring Road	Kalanki	Kathmandu	Bagmati Province
3052fc45-db31-42ce-8a3a-9c339cd97707	10050668226	Lama Bhojanalaya	27.6721086	85.38785730000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.111+05:45	Araniko Highway	\N	Bhaktapur	Bagmati Province
bdfffbde-366c-426d-81ac-13c08e4b3668	10015144352	Lucky Restaurant	27.738808700000003	85.3171124	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.092+05:45	Shanti Milan Marg	Tokha	Kathmandu	Bagmati Province
c781f155-71a4-4090-8060-f4853486750e	10015148706	Bhimsen Momo	27.7417595	85.31465080000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.092+05:45	F81	Tokha	Kathmandu	Bagmati Province
0e47cfce-2d44-4ac4-aba9-97056efce852	10015228513	Shyapten Resturant	27.738647200000003	85.31241680000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.093+05:45	F81	Tokha	Kathmandu	Bagmati Province
10677f56-be4f-4f9c-831e-3d4e89d0f0c1	10015229627	Purba Paschim Khana Pasal	27.738130400000003	85.31276340000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.093+05:45	F81	Deepjyoti	Kathmandu	Bagmati Province
43e271c9-77a4-4689-8231-6b1ff4a13517	7183426485	traditional food cafe	27.710136900000002	85.3136156	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.912+05:45	Jyatha Marg	Kamalachi	Kathmandu	Bagmati Province
daaa9494-fae8-47f5-ad71-f487a88ffa4a	9527281373	Corner Fast Food And Hotel	27.740933000000002	85.3394277	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.94+05:45	Kapan Marg	Narayan Gopal Chowk	Kathmandu	Bagmati Province
f17f6194-7402-4285-b252-cc9be262ef5c	9527281374	Nima Momo Center	27.7408986	85.338227	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.94+05:45	Kapan Marg	Narayan Gopal Chowk	Kathmandu	Bagmati Province
5516fcb9-8f1c-480f-8643-708e633f9356	9724474465	Hidden Paradise Restaurant	27.662936000000002	85.2880954	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.969+05:45	Ekalpati to Bhajangal Road	Samocha	Kathmandu	Bagmati Province
5dfbcadd-cd1a-43ff-a2c0-949e36023295	9724474758	Lyaku Garden And Restro	27.6623619	85.2885845	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.969+05:45	Ekalpati to Bhajangal Road	Samocha	Kathmandu	Bagmati Province
4808b858-c82f-441a-9a2e-d43b98091e80	10012154605	New Gulmi resung Guest House	27.7360769	85.3127595	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.086+05:45	Kathmandu Ringroad	Gongabu	Kathmandu	Bagmati Province
3bff3ed7-82c3-4ba0-a20f-a285d1b6faec	10012154606	Rolpa Brah Guest House	27.7360711	85.3128231	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.086+05:45	Kathmandu Ringroad	Gongabu	Kathmandu	Bagmati Province
cda9506e-8aca-493b-ba6d-68b0ccee4e3d	9655538225	Sanjhya Nasha Chenn	27.679885700000003	85.2750908	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.955+05:45	Than-ba-hah Lanh	Than-ba-hah	Kathmandu	Bagmati Province
60f30458-dbc6-46f8-afec-3f787084c194	1906555316	Indreni Foodland	27.7381418	85.33970810000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.708+05:45	Kathmandu Ringroad	Ganesh Basti	Kathmandu	Bagmati Province
2fa41994-0fc4-4a58-88d9-52ba63e40649	1917103306	3D Cafe and Bar	27.7388507	85.33569080000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.708+05:45	Maharajganj Sadak	Narayan Gopal Chowk	Kathmandu	Bagmati Province
bd7dafdb-af24-432a-a443-7399754a6c9a	10050668230	Coffee Station	27.6718882	85.3879077	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.111+05:45	Araniko Highway	\N	Bhaktapur	Bagmati Province
2b8218b6-9e5a-4dd0-82ff-d821e1417e9f	10013765064	Jay Maa Bhawani Sweet and Chat House	27.752592800000002	85.3269992	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.092+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
4d69183b-8327-4a44-a544-d66b2b241fa6	10013814189	The Royal Lounge	27.742132400000003	85.3145003	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.092+05:45	Manamaiju Nayapul	Shivanagar Tole	Kathmandu	Bagmati Province
2b377f1f-9da3-496d-8d7a-ee48e835b15c	11814398442	RAJMAHAL	28.1898124	83.9614449	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.152+05:45	Siddhartha Highway	Om Shanti Chok	Pokhara	Gandaki Province
c34800d7-8855-4e28-9d1c-76c0378c2e40	3508175157	Hot Pot	27.7092396	85.3103229	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.778+05:45	Chandraman Maskey Marg	Thyaemaru	Kathmandu	Bagmati Province
bacd8bbe-53bb-40a2-af95-0b24342ae7c8	3508175173	Norling Tibetean	27.7102217	85.310854	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.778+05:45	Thahity Jyatha Marg	Tahiti	Kathmandu	Bagmati Province
c0ef6c5d-2a6d-4b75-8f57-5b7468c562d8	10010591834	Hygienic Fast Food Restaurant	27.7464388	85.3249787	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.08+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
e785f8d0-6688-42f1-b208-3479b781aa7e	10010591841	New resunga Tanduri Restaurant	27.7463467	85.32461430000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.081+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
f3c2914c-2102-4d21-8dfd-8aa5fa38d70b	3637654257	Paradise	28.2102578	83.95689060000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.783+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
5143cb59-c64c-4249-894f-d1b3935694d4	5589588629	Himalyan View Point Camping And Ressort	28.205255500000003	83.9371696	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.882+05:45	Peace Pagoda Road	\N	Pokhara	Gandaki Province
c3017e71-4e68-4808-830b-32ef2a22be11	5589588633	Hotel Siddartha	28.2010173	83.9406927	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.882+05:45	Peace Pagoda Road	\N	Pokhara	Gandaki Province
7d45d9d0-a2d3-4e70-8e9d-51ee6dcd1ff9	5589588658	Sameer Cold Stores	28.200334700000003	83.9465627	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.882+05:45	Peace Pagoda Road	\N	Pokhara	Gandaki Province
e5e9846e-4f3b-4468-9abc-93f6d501a7a9	10050716135	Puspanjali Top Momo Centre	27.665179600000002	85.36672	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.111+05:45	Kaushaltar-Balkot	Purbeli Tol	Bhaktapur	Bagmati Province
c6cff646-0818-4838-8c89-09b40ee5c570	5973756578	Kainbar Sekuwa Restaurant	27.7503154	85.3452542	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.892+05:45	Golfutar Sadak	Shrijanshil Tol	Kathmandu	Bagmati Province
789c6706-b21c-4033-a1eb-eb7f36816527	5973756579	Down Town Cafe	27.745593500000002	85.3420463	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.892+05:45	Bansbari Sadak	Narayan Gopal Chowk	Kathmandu	Bagmati Province
460e6f9a-f5d0-4057-accc-1c96bcec90cb	5331658619	Cafe Chheli	27.676381300000003	85.31205220000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.855+05:45	Damkal-Chakrapath Marg	Dhobighat	Lalitpur	Bagmati Province
66bc503e-6669-452f-aaa7-e93c460ece37	873531754	Cafe 16	27.676051800000003	85.3126299	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.689+05:45	Damkal-Chakrapath Marg	Dhobighat	Lalitpur	Bagmati Province
8a16c71c-7b4a-4218-bb5f-1c6e07437ea0	6290785385	kizuna japanese restaurant	27.7140339	85.31051400000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.898+05:45	J.P. School Road	Paknajol	Kathmandu	Bagmati Province
c8e44472-5d21-4554-970f-2398bfaa0361	943246325	Kasthamandap Restaurant	27.703931200000003	85.30603880000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.69+05:45	Yogbir Singh Marg	Pyaphal	Kathmandu	Bagmati Province
62dedb87-cb54-4866-a158-f16f55c3a109	6280119124	Red Cafe	27.735334400000003	85.3376844	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.898+05:45	Chundevi Marga	Chundevi	Kathmandu	Bagmati Province
37299dad-2eb0-4fd1-9230-42a054334878	4791063664	Sharmila Restaurant	28.202762600000003	83.9668881	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.826+05:45	2nd Street	Baidam	Pokhara	Gandaki Province
61c3e318-0f35-4bbc-8715-cb637b1eded3	5466665260	Paila hostel	28.208516200000002	83.9575222	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.863+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
a3832def-45f4-4f22-a980-ee9d11540c8f	6068365812	Dumpling Restaurant	27.694723900000003	85.3371492	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.895+05:45	Devkota Sadak	Srijana Tole	Kathmandu	Bagmati Province
667d2b0e-35c8-4995-a386-1882158a2f1d	6068365815	Chicken Station	27.695193300000003	85.33722680000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.896+05:45	Devkota Sadak	Srijana Tole	Kathmandu	Bagmati Province
df92fc52-c1e8-4ec5-9ec0-a73983e38d9e	6085430985	Tokyo Izakaya	27.7157212	85.3112756	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.896+05:45	Thamel Marg	Lut Chok	Kathmandu	Bagmati Province
4164d341-1de0-40ee-b054-72e59c3cbd1a	6085679632	Susmi Momo Resturant	28.255622300000002	83.97846750000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.896+05:45	Lamachaur Marg	Tallo Dip	Pokhara	Gandaki Province
c09f66f2-c5b6-48bc-b6e3-653826677fa4	4791063680	Family Kitchen	28.2028816	83.967121	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.826+05:45	2nd Street	Baidam	Pokhara	Gandaki Province
6f27e618-27f3-4ba3-94e6-f9450c157bc6	9526078417	Albaik Nepal	27.737301400000003	85.3244579	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.935+05:45	Kathmandu Ringroad	Tokha	Kathmandu	Bagmati Province
f769b197-9573-4c49-811d-e025c313cd0c	9526081918	Royal Cafe Station	27.7367555	85.32363360000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.935+05:45	Kathmandu Ringroad	Tokha	Kathmandu	Bagmati Province
86c84a84-d738-424f-a3de-f4f01df147ce	10011753552	The Burger House and Crunchy Fried Chicken	27.7467626	85.33049530000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.083+05:45	Sangam Marg	Tokha	Kathmandu	Bagmati Province
f74b7747-63d1-4260-9265-93aea0d217c1	9527226612	China Valley Restaurant And Bar	27.739561700000003	85.3381322	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.937+05:45	Kathmandu Ringroad	Narayan Gopal Chowk	Kathmandu	Bagmati Province
fe87b299-c98f-4541-a3b5-5b2046047776	9527226613	Vida Cafe And Grill	27.738451100000002	85.3393872	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.937+05:45	Kathmandu Ringroad	Ganesh Basti	Kathmandu	Bagmati Province
a082f0a6-2c93-4af0-acea-537faa921cfd	2122384471	Sathi Bhai Restaurant	27.699078900000004	85.2824446	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.728+05:45	Garg Marg	Kohinoor Hills Housing	Kathmandu	Bagmati Province
edadebb1-2728-4c78-a43d-dd927c361686	1990685701	Jiwan Dairy and Coffee Shop	27.6744616	85.3802794	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.715+05:45	Araniko Highway	Araniko Basti	Bhaktapur	Bagmati Province
2c77c7b5-8650-43fd-9221-31516b710963	4786011722	Himalayan Crown Lodge and Resturant	28.244175900000002	83.9484786	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.825+05:45	Main Street	Garjati	Pokhara	Gandaki Province
e97ec893-67e5-4a93-96a7-c2005b020951	10121388715	Suppo Chiya Chautari	27.6818169	85.33817830000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.117+05:45	Janata Marg	Sahayogi Nagar	Kathmandu	Bagmati Province
b19cd333-5369-482c-87eb-72ad6e80283b	10121388717	Cafe60Five	27.6817074	85.3380879	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.117+05:45	Janata Marg	Sahayogi Nagar	Kathmandu	Bagmati Province
114c29c8-9e8e-4dfe-ac6c-e9fcf31125a5	9956485612	Shree Lumbini Tandoori Bhojanalaya and MoMo Fastfood	27.674507100000003	85.3600018	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.054+05:45	Tikathali-Lokanthali Road	Madhyapur Thimi	Bhaktapur	Bagmati Province
cc828cfc-dc32-47ab-b2e5-6cdd744bc0d5	9956485622	SatraThok Chautari Family and Restaurant and Lodge	27.674753300000003	85.3570782	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.054+05:45	Araniko Highway	Madhyapur Thimi	Bhaktapur	Bagmati Province
81ab0709-8bcd-428b-8b11-06c75bf32177	9655535678	Dawn To Dusk Fast Food and bakery	27.686306300000002	85.27731080000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.955+05:45	Sahid Basu Smriti Marg	\N	Kathmandu	Bagmati Province
4472a070-3596-43ac-aee4-dd37d0ab9761	4705119589	Cafe Lake Yard	28.2108567	83.95589120000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.821+05:45	Bhalchoppa Galli	Baidam	Pokhara	Gandaki Province
777b97b9-28bb-412c-955d-5792b97d2144	10009476886	The Station Cafe	27.7355787	85.3105111	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.075+05:45	Kathmandu Ringroad	Gongabu	Kathmandu	Bagmati Province
f186d43c-a960-4a77-8c0f-a82045a52c35	9450093517	Fresh Bite Cafe	27.7092816	85.3248981	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.93+05:45	Dhobidhara Marg	Kamalpokhari	Kathmandu	Bagmati Province
2f13a147-1336-4ca1-bf44-1942d6654922	4731782221	Friends	27.7152992	85.3108179	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.822+05:45	Mandala Street	Lut Chok	Kathmandu	Bagmati Province
3b95b443-9df1-463b-8059-580be64ef754	10010591822	Nawalparasi Tanduri Bhojanalaya	27.7453256	85.3199926	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.08+05:45	F81	Baniyatar	Kathmandu	Bagmati Province
abd68b6c-2d32-4af8-a006-5f08eff67a3d	10015229653	Super Fast food	27.737036600000003	85.31136880000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.093+05:45	Parajuli Niwas marga	Deepjyoti	Kathmandu	Bagmati Province
2d65b809-5489-4ba7-8a46-62cc62c8ee1b	10011753436	Bubble Tea	27.7452831	85.32905930000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.083+05:45	Hari Marga Tole	Tokha	Kathmandu	Bagmati Province
c5258b03-d8d4-4be8-abeb-7b66cace7f62	9922234273	Top Of The World Coffee	27.6806784	85.3104452	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.048+05:45	Bakhundol	Arun Thapa Murti Chowk	Lalitpur	Bagmati Province
570d3168-8226-43b9-a39a-b63a49d65520	4040398778	Meomory fast food corner	28.2382676	83.98354110000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.789+05:45	Pokhara Baglung Highway	\N	Pokhara	Gandaki Province
4bae2e25-bbb3-4059-bed3-b0645938ae80	11363990194	Filli cafe	27.721161000000002	85.3201245	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.148+05:45	Narayan Gopal Road	Lazimpat	Kathmandu	Bagmati Province
36994b41-d583-490b-a9a8-f79917ecc9cb	4791314050	Mongolian Restaurant	28.207214800000003	83.96257510000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.827+05:45	7th Street, Shiva Marga	Baidam	Pokhara	Gandaki Province
1f30b950-2421-45f7-86ff-c777d0a085b7	4934513526	The Juicery Cafe	28.2207337	83.9569934	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.834+05:45	40DR012	\N	Pokhara	Gandaki Province
e0f30df6-49a0-4307-81e1-bdf66a33f66f	8296199093	Ajju Cafe	27.7082024	85.33821370000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.915+05:45	Galli	Paneku Tol	Kathmandu	Bagmati Province
cc70f2fd-ec4b-4c99-8b27-be67f2327c2b	2071332684	NAXA Canteen	27.730784800000002	85.3295597	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.721+05:45	Do-Cha Marg	Panipokhari	Kathmandu	Bagmati Province
b6a4e710-3707-4bff-9044-bd2141d5fa48	4791109835	Pokhara Tea House	28.212829000000003	83.9572497	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.826+05:45	Lakeside Road	Baidam	Pokhara	Gandaki Province
68b88bcc-8af2-4594-9cc2-d9b4ab997b4d	4791119640	Double View Restaurant and Bar	28.2126018	83.95699210000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.826+05:45	Lakeside Road	Baidam	Pokhara	Gandaki Province
81e6d7fa-6f68-45a5-acae-987d4b852825	5491473589	Country Cafe	28.227884600000003	83.9392155	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.87+05:45	40DR012	Bhakunde	Pokhara	Gandaki Province
6194bb6b-b7df-4fdc-b8a6-bbb9058ce7f5	10017276534	Cups	27.7405887	85.3262692	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.103+05:45	Kathmandu Ringroad	Tokha	Kathmandu	Bagmati Province
fe430621-5c79-44c5-94d1-981666bc85c7	5080740221	Main Tandoori	27.673188500000002	85.3141456	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.838+05:45	Jawalakhel	Dhobighat	Lalitpur	Bagmati Province
ec28d802-a9a0-4195-8270-b560750d0b1b	4791064221	Lakeside Sukuti House	28.210530000000002	83.9590866	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.826+05:45	Street 15 (Pahari Marg)	Baidam	Pokhara	Gandaki Province
d5af9f0e-2ff5-41f7-bbfb-a4c69865bd62	4791074002	The Downtown Restro and Dance Bar	28.213239400000003	83.95738990000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.826+05:45	Lakeside Road	Baidam	Pokhara	Gandaki Province
0994c0f0-258c-4a8d-ba1b-0c2b9abf5847	4893725424	Pizza King	27.714561600000003	85.3104481	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.833+05:45	J.P. School Road	Paknajol	Kathmandu	Bagmati Province
9961ec8a-0515-41ef-942a-65788ff34aad	2166593496	Magic Beans	27.7105055	85.31775780000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.731+05:45	Darbar Marg	Kamalpokhari	Kathmandu	Bagmati Province
91320b2c-1312-4d6a-a9b9-eb99cb8f085c	4861789822	Bajeko Sekuwa	27.6773862	85.3166638	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.831+05:45	Pulchowk Road	Pulchowk	Lalitpur	Bagmati Province
6b05642b-e19f-4151-843f-b19943f5f8df	4890884826	Coffee Pasal	27.7126275	85.3174486	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.832+05:45	Durbar Marg	Kamalpokhari	Kathmandu	Bagmati Province
1ed0d3f3-91c8-4fc5-a2c5-d089cb89c6c0	4896895785	Global Cafe	27.7347472	85.3171964	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.833+05:45	Kathmandu Ringroad	Deepjyoti	Kathmandu	Bagmati Province
9f8f8474-4c2b-4ec4-a883-05a5b71094a7	4933498722	New Fewa Restaurant	28.2190759	83.95792420000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.834+05:45	40DR012	\N	Pokhara	Gandaki Province
c66a058e-81e6-4357-8291-bbe896fe55ce	6651598834	Sushi Time	27.7010274	85.3415425	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.903+05:45	Sinamangal Road	Bhimsen Gola	Kathmandu	Bagmati Province
bad0fbf1-f954-4b7f-886e-918cbdbfe0fe	4934513522	Sabina Mo Mo House	28.2207176	83.95766130000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.834+05:45	40DR012	\N	Pokhara	Gandaki Province
908863ed-e383-41a2-a63d-7a28f6284c6e	10016442117	Dhading resturant and tandooori	27.7459671	85.3170054	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.102+05:45	Sayapatrinagar	Baniyatar	Kathmandu	Bagmati Province
68e65227-9a1a-42e4-b5a8-1ebd14301303	9521563719	Jhol MOMO	27.708246300000003	85.33483220000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.932+05:45	Pashupati Sadak	Gyaneshwar	Kathmandu	Bagmati Province
936dc00a-b385-437d-8ec9-0c92a6d1f17d	3774437964	burger king	27.701208700000002	85.34002620000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.787+05:45	Devkota Sadak	Baneshwar	Kathmandu	Bagmati Province
d0c44ef7-3256-4bcf-b89d-e19404e90a35	3774437965	Lhasso Restaurant	27.7011481	85.33975170000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.787+05:45	Devkota Sadak	Baneshwar	Kathmandu	Bagmati Province
9e358282-5ca6-46b6-80ba-952e6573f602	9942585520	Pukucha Cafe	27.675483600000003	85.32101180000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.051+05:45	Chha Baha Jagmadu Pukhu Marg	\N	Lalitpur	Bagmati Province
4e099269-1b3e-475b-b897-8b1aba43ebcc	9655429438	The Bamboo cafe	27.683122800000003	85.28022100000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.954+05:45	Way To Ring Road	Sa-lin-chhn	Kathmandu	Bagmati Province
081ae41d-77e8-4b2c-ae5f-e6d152a9c544	9962157014	Shakira Hotel and lodge	27.6688137	85.3564932	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.056+05:45	Tikathali-Lokanthali Road	Madhyapur Thimi	Bhaktapur	Bagmati Province
a270d413-8aa6-4fce-9c90-a0c7b442ec47	10121417320	Rabeans Coffee and Pizza Hut	27.6858758	85.3452591	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.121+05:45	Munibhairab Marg	Basuki Nagar	Kathmandu	Bagmati Province
cc87c40a-4e15-4834-8d4c-e2888cfc054b	10148831434	Khimu Store	27.6767064	85.38557320000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.129+05:45	Purano Thimi- Naya Thimi	\N	Bhaktapur	Bagmati Province
d21d8a8c-da8c-4c86-be1e-193430a271a7	10012154573	Gulmi Kali Gandaki Guest House	27.735353500000002	85.31216210000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.086+05:45	Kathmandu Ringroad	Gongabu	Kathmandu	Bagmati Province
699885a0-8abb-4043-a72e-85ee110ca3ae	11841899017	Momo House	28.193242	83.9753385	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.152+05:45	Pardi Bazar	Birauta chowk	Pokhara	Gandaki Province
9ee62c23-fe8f-4e54-9ea9-11cb98f5785e	9626329694	Tiktok Garden	27.661697800000002	85.2661144	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.951+05:45	Sanjay Sing Marga	Yaw-cho	Kathmandu	Bagmati Province
57bf98e7-4422-4814-aa2a-4a7bdfc9b330	9628523604	Binda cold store	27.658972900000002	85.2926486	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.952+05:45	Manjushree park outside Stairs	Chobhar	Kathmandu	Bagmati Province
66f15bd8-fc39-4d43-bff6-6d810e559c94	9628531538	Binda cold store	27.6590151	85.2927578	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.952+05:45	Manjushree park outside Stairs	Chobhar	Kathmandu	Bagmati Province
45e7ca83-efe2-472c-8a7a-a4ccc70228ce	9628538623	Galchedo Resturant	27.6584891	85.2943772	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.952+05:45	Bagmati Bridge	Tallogau	Lalitpur	Bagmati Province
0696c528-4c76-4ad0-b98a-ddfd21002904	10009676239	Lumanti Newari Restaurant	27.759460400000002	85.3288703	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.076+05:45	NH40	\N	Kathmandu	Bagmati Province
8212ae30-707f-42ff-8878-2bff9060da28	10009676251	Flavour D Newari Cuisine	27.7612571	85.33014940000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.076+05:45	NH40	\N	Kathmandu	Bagmati Province
20e7f3ea-e786-4e90-a30f-1aedc3fc1373	10009868003	Lumanti Newari Restaurant	27.759632000000003	85.3290216	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.077+05:45	NH40	\N	Kathmandu	Bagmati Province
d901a67c-0c42-460d-855f-87f839da2a1c	9216608180	La Plaza	27.677022200000003	85.3170343	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.924+05:45	Satyamohan Joshi Marga	Pulchowk	Lalitpur	Bagmati Province
89a491bd-ade8-48eb-b3e2-602d821925b3	4800681197	Neptalia restaurant	28.215385700000002	83.9582919	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.829+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
2f504d55-9660-45a1-882f-c78d134be01d	4800681200	Welcome Sun Set View Restaurant and Bar	28.215099600000002	83.9581417	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.829+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
7d2f0af0-cf5d-4442-83d9-457893c69b08	4800701091	Namaste Air Nandoj	28.2175343	83.95827580000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.829+05:45	Gantavya Marg	Baidam	Pokhara	Gandaki Province
c3f351e6-222c-483f-a843-a5a7e3d47ae6	4800708998	Third Eye Restaurant and Thakali	28.2163174	83.9585345	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.829+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
49b44223-4954-4274-b672-e12b4625c492	8697036342	Cafe De Fire	27.714776	85.3103717	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.921+05:45	Paryatan Marg	Lut Chok	Kathmandu	Bagmati Province
bae8a701-797f-41e8-a580-051ddd1cdb2b	9708707184	Suwash Khaja Ghat	27.6903004	85.28031750000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.964+05:45	Purano Bagar Marg	\N	Kathmandu	Bagmati Province
ba2d46f1-6a23-4b89-9f0f-0448ca045a5c	9708715243	Dhuna Tapari momo	27.688599200000002	85.2777468	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.964+05:45	Sahid Basu Smriti Marg	\N	Kathmandu	Bagmati Province
2ce5ecea-9a0e-45d8-996b-94b906f8b16a	10013189912	Dhapashi	27.7526833	85.3348668	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.088+05:45	Chyasundol Highway	Budhanilkantha	Kathmandu	Bagmati Province
f6bd9e8e-4382-403f-9d23-6263cc38931c	11361362994	Himalayan Java Coffee	27.7153016	85.31331630000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.148+05:45	Amrit Marg	Lut Chok	Kathmandu	Bagmati Province
ba9c4f98-1967-497b-b5ec-a3e476a28e33	9523254811	Praising And Evan Restaurant	28.2563305	83.9775556	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.933+05:45	Lamachaur Marg	Tallo Dip	Pokhara	Gandaki Province
9a129b45-50de-4fdc-a756-86b7387a90bb	9523303866	14 Tables	27.724528300000003	85.33976580000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.933+05:45	Dhumbharai Marg	Dhumbarahi Pipal Bot	Kathmandu	Bagmati Province
e4692b70-5ef0-445e-8576-69c6d8d5f44e	10017464366	Arpan laphing	27.744292400000003	85.3320556	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.105+05:45	Shreetol Marg	Tokha	Kathmandu	Bagmati Province
eb4a0dad-7da9-4aa4-86d1-6b407badeb0f	9913978529	The Yellow House	27.682335100000003	85.3061369	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.047+05:45	Shanti Bhawan Marga	Arun Thapa Murti Chowk	Lalitpur	Bagmati Province
e913e3d8-9930-4556-9ae3-5b2609d79703	8696338131	Ruyi Jiari Hotel	27.7119846	85.3120136	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.919+05:45	Jyatha Marg	Lut Chok	Kathmandu	Bagmati Province
cb99425a-fe12-455a-a3c9-e1ea2e19b17a	10108212239	Balkot Highway Food Cafe	27.6670996	85.36590190000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.115+05:45	Kaushaltar-Balkot	Purbeli Tol	Bhaktapur	Bagmati Province
4d9bb4e8-7682-47a2-9b6c-a013ec290491	9956153319	Wave Sekuwa Corner	27.674797700000003	85.3643706	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.053+05:45	Araniko Highway	Tersatar	Bhaktapur	Bagmati Province
6f60af05-9e0a-40d8-94c3-a02147adda0b	9969484848	Thakali Bhojanalaya And Resturant	27.703283000000003	85.3193339	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.063+05:45	Adwait Marg	Baghbazar	Kathmandu	Bagmati Province
d5a74644-18d5-4f73-9be5-5c119a962f00	10058752057	Cafe Sayto Kalo	27.6831774	85.38641340000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.113+05:45	F86	\N	Bhaktapur	Bagmati Province
435111cb-d53f-45ae-b8c9-eba6f0c951ae	9724478396	Ruby Red Restro And Bar	27.6498361	85.2813223	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.969+05:45	Dakchhinkali Road	Taudaha	Kathmandu	Bagmati Province
bc958cb9-9f71-4e02-b33b-dfe5d76b2ca6	9724479555	Ruby Red Restro And Bar	27.653683100000002	85.28720270000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.97+05:45	Dakchhinkali Road	Taudaha	Kathmandu	Bagmati Province
45abe53e-64d7-4455-a069-90b8ca5d2327	9724479556	New Paleti Restro	27.6497564	85.27798650000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.97+05:45	Dakchhinkali Road	Taudaha	Kathmandu	Bagmati Province
2e265738-91a2-471a-9fdf-890047033269	10010845105	MIG Burger and Crunchy Fried Chicken	27.741137400000003	85.3216232	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.081+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
3b83af35-14ff-4dbf-8518-4ec8be075670	9527281318	Daju Vai Sekuwa Corner	27.7363669	85.3410236	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.937+05:45	Gyanjyoti Marg	Chundevi	Kathmandu	Bagmati Province
0d1f9363-dbf6-4771-acac-f17cda1e076d	9527281320	Universal Cafe	27.7393828	85.3387471	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.937+05:45	Milijuli Marg	Narayan Gopal Chowk	Kathmandu	Bagmati Province
fb980376-e187-4b19-a389-a23cca1dab41	9527281322	New Thakai Chulo And Restaurant	27.738414700000003	85.3395242	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.937+05:45	Kathmandu Ringroad	Ganesh Basti	Kathmandu	Bagmati Province
22c8cadb-780f-4903-aa6b-f724ac627101	9527281323	Fuzone Fast Food	27.7392779	85.3388851	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.937+05:45	Milijuli Marg	Narayan Gopal Chowk	Kathmandu	Bagmati Province
f3516bd0-cc9a-4d34-a344-786fc7a123a3	9527281326	Richmond Food Cafe	27.7392088	85.33929540000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.937+05:45	Milijuli Marg	Narayan Gopal Chowk	Kathmandu	Bagmati Province
8c6715e2-c27a-4629-b48c-7735efe4b7fd	9527281328	Walk And Fire	27.7384512	85.3402719	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.937+05:45	Aakriti Marg	Milijuli Tol	Kathmandu	Bagmati Province
88f20a9f-8c72-4ec4-b7c8-1b08b348df91	9527281329	Oddan	27.7420195	85.3389191	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.937+05:45	Bansbari Sadak	Narayan Gopal Chowk	Kathmandu	Bagmati Province
42d45e05-e94b-45a3-b67b-9a72a6188a63	9527281331	President Sekuwa	27.736204500000003	85.34108300000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.938+05:45	Gyanjyoti Marg	Chundevi	Kathmandu	Bagmati Province
178c6e69-c5a3-411d-862a-73c4e316462e	9527281332	Pvine Restro And Bar	27.7364253	85.3416899	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.938+05:45	Kathmandu Ringroad	Ganesh Basti	Kathmandu	Bagmati Province
0d03d3dc-b527-496d-a9ec-19e6501949e5	5477151755	Paramount View Inn	28.2438682	83.9482378	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.867+05:45	Main Street	Garjati	Pokhara	Gandaki Province
407e0d44-c5bc-4768-a4d3-8c4913269cf6	9527281365	Galaxy Foodland And Coffee House	27.734625100000002	85.3428035	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.939+05:45	Kathmandu Ringroad	Milijuli Tol	Kathmandu	Bagmati Province
7588761e-40b1-4397-b087-698c74a43b96	10015911109	costa coffee	27.6882997	85.3684728	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.098+05:45	F89	\N	Kathmandu	Bagmati Province
e8563f7b-2faf-49d0-b176-c83575edc2ae	10050668222	Grace Hot and Cold Center	27.672309300000002	85.3878189	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.11+05:45	Araniko Highway	\N	Bhaktapur	Bagmati Province
60ad41f4-bcb5-4010-914e-dbd2b8595a94	9610482335	Nehemiya Khaja Pasal	27.669778700000002	85.2713068	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.949+05:45	Jakha Road	Da-thal	Kathmandu	Bagmati Province
b0f0a7c0-5785-4186-b2ea-9d5b215fc99e	9612803391	SM Fast food and sekuwa corner	27.666761800000003	85.2603766	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.95+05:45	Pushpalal Marg	San-la	Kathmandu	Bagmati Province
1b034215-0631-46cd-a2e1-518a52fb20c4	9626257774	Lama hotel	27.6697543	85.2814804	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.951+05:45	Shahid Path	Shalik	Kathmandu	Bagmati Province
3948bad7-d248-4680-88c0-568d6b5245d5	10059957269	Micheal Momo	27.6823827	85.3830834	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.113+05:45	F86	Naagdesh (Nagadesh)	Bhaktapur	Bagmati Province
39abb230-9041-4c38-89aa-61d4bab33be4	4890863507	Angan	27.691898000000002	85.31614400000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.832+05:45	Tripureshwar Marg	Tripureshwar	Kathmandu	Bagmati Province
16ffaad7-c4d6-4456-91aa-aa69f41043a8	6902237086	Chayia Chautari	28.220965600000003	83.95651310000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.904+05:45	40DR012	\N	Pokhara	Gandaki Province
4e0b8e76-3457-4e4f-9448-9d4e38f95195	6205326098	Kipu Vutu Newari Food Court	27.670711200000003	85.2714243	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.898+05:45	Pushpalal Marg	San-la	Kathmandu	Bagmati Province
46f74125-aa55-4ad8-9806-ec0ce532a50e	6210495269	Thakali Chulo restaurant	27.714102500000003	85.31120560000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.898+05:45	Narsingh Chowk	Lut Chok	Kathmandu	Bagmati Province
03405262-c0ca-498b-9625-165a83541f16	3493200396	Embassy Restaurant	27.727301200000003	85.3244308	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.777+05:45	Bhanu Memorial Marg	Panipokhari	Kathmandu	Bagmati Province
e338710f-9570-48cd-a5d1-dcd3ddb2bed6	4456060691	Chamena Griha	27.6951667	85.32388230000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.814+05:45	Tanka Prasad Ghumti Sadak	\N	Kathmandu	Bagmati Province
f5090ace-6b8a-40d0-87b5-2b2a5bccf050	10011753512	Lama Hotel	27.743241800000003	85.3266952	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.083+05:45	Rambabu Marg	Tokha	Kathmandu	Bagmati Province
ca4b9287-5dca-4374-9844-aa18b128e329	3488413724	Lan Zhou Noodle	27.711406800000002	85.3120808	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.775+05:45	Jyatha Marg	Lut Chok	Kathmandu	Bagmati Province
919fac7d-925d-4caa-b40d-26e3dc470f47	3488413735	Royal Tandoori Kabab	27.7104818	85.312824	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.775+05:45	Jyatha Marg	Kamalachi	Kathmandu	Bagmati Province
8a436906-29ae-4d4d-9855-3940356bc13d	3488413741	The Corner Room	27.7102368	85.3144029	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.775+05:45	Jyatha Marg	Kamalachi	Kathmandu	Bagmati Province
ec2ed427-afe3-4cb2-b645-69f9b0780a4a	3488413745	Yangzee	27.710863600000003	85.3121442	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.775+05:45	Jyatha Marg	Lut Chok	Kathmandu	Bagmati Province
ece48b07-e724-4cd1-86a8-5c2acfa20aca	2122383300	ROSE GARDEN RESTURENT	27.6809669	85.27889880000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.728+05:45	Way To Naya Bazaar	Chi-ba-hah	Kathmandu	Bagmati Province
2ee4fb89-a51a-4fff-b635-f250e9035354	3488601016	Capital MoMo King	27.708679800000002	85.3142895	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.776+05:45	Kanti Path	Bhotahity	Kathmandu	Bagmati Province
98b672d0-f03a-4bd9-90c6-c871e560c5c7	3502028799	ABC Sekuwa Corner Resyaurant	27.659214400000003	85.3114211	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.777+05:45	Kusunti Kumar Pith Marg	Nakhu Bajar	Lalitpur	Bagmati Province
f3134a03-15ee-4c37-a40d-8d5479da83a3	10012154571	Myagdi Hotel Radhunga	27.735439600000003	85.3121144	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.086+05:45	Kathmandu Ringroad	Gongabu	Kathmandu	Bagmati Province
14f40e26-9250-46ca-b26c-2fa79cc43418	5103596988	Hungry Bite Corner Burger and Cafe	28.207369300000003	83.9657385	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.84+05:45	Thadopasal path	Baidam	Pokhara	Gandaki Province
3faedc3c-2935-44b4-87b6-0d88a6ab18ac	5242388577	Little Pokhara Restaurant and Lodge	28.1646517	84.08794590000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.851+05:45	F129	\N	Pokhara	Gandaki Province
8ee473b2-6f3f-456a-b7f0-bf15b3125a46	1937692244	Jars of Clay Cafe	27.6774038	85.30872380000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.711+05:45	दमकल चक्रपथ मार्ग	Dhobighat	Lalitpur	Bagmati Province
d0576705-c0bf-4e88-bd66-4c700252f882	2073153212	Niyalo Cafe	27.7309421	85.3298884	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.721+05:45	Thirbam Sadak	Kiran Chok	Kathmandu	Bagmati Province
35c6b0ce-556d-4268-91d5-6b531096a062	10011950819	Gorkha Garden Guest House	27.735962200000003	85.31192390000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.086+05:45	Buddha Marga	Deepjyoti	Kathmandu	Bagmati Province
38d7d5c1-e0e1-4fd6-9b59-3e8e2def0920	5477151757	New Tourist Lodge and Resturent	28.244625600000003	83.9478716	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.867+05:45	Main Street	Garjati	Pokhara	Gandaki Province
acddae9e-08e4-4af8-8b35-0daffc5952fd	5477468100	Blue Planet Lodge and Resturant	28.244479600000002	83.9484973	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.867+05:45	Main Street	Garjati	Pokhara	Gandaki Province
722170f8-da9f-4373-8859-1080fb3b0077	5477468102	Super View Resturent	28.2445866	83.9485361	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.867+05:45	Main Street	Garjati	Pokhara	Gandaki Province
24f75051-921d-49cd-96ff-bbe5931352e1	5477468106	Green Hill Resturant	28.245093400000002	83.94850930000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.867+05:45	Main Street	Garjati	Pokhara	Gandaki Province
b547fcb1-aed6-47c5-85d7-5ac1b4ebc0e5	5477468107	Durga Tea House	28.2451277	83.9484228	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.867+05:45	veiw point road	Thapa Gaun	Pokhara	Gandaki Province
28496d9a-837e-480c-ae09-f79b694ef3aa	10175166617	En Space	27.733513300000002	85.3358051	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.13+05:45	बक्ररेखा गल्ली	Tusal	Kathmandu	Bagmati Province
53c4cce0-da9f-48f9-8166-222fbd8e903b	10017278890	Pratishtha Cafe	27.741599400000002	85.33040820000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.104+05:45	Kathmandu Ringroad	Narayan Gopal Chowk	Kathmandu	Bagmati Province
b94b9301-bd3b-47fe-a08e-caed255da0b9	10017278893	Lhasa tanahun bhojanalaya	27.741683100000003	85.33051660000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.104+05:45	Kathmandu Ringroad	Narayan Gopal Chowk	Kathmandu	Bagmati Province
00f7755b-f37a-4323-b1f1-7d456f41ee44	10017280906	Mountainbrew Coffee Academy	27.737243600000003	85.31628950000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.104+05:45	Purna Street	Deepjyoti	Kathmandu	Bagmati Province
92d4bf51-2436-4f28-a796-2e4e8b186d76	10017291926	Baglung Newari restaurant	27.741428000000003	85.315004	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.104+05:45	F81	Tokha	Kathmandu	Bagmati Province
1db65b9c-374c-4dea-9cf5-f800cbb48823	4358612491	SA Falcha	27.6903085	85.3239138	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.809+05:45	Surya Marg	\N	Kathmandu	Bagmati Province
6bb9b74f-75dd-4d25-b16d-b637bef5955c	11950508185	Mahima Hotel	27.670748900000003	85.4100363	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.16+05:45	Araniko Highway	\N	Bhaktapur	Bagmati Province
55a5433e-2f08-48f1-81d8-b5ae286b34d7	6499238729	Salina Tea and Coffee shop	27.7161714	85.4308355	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.901+05:45	Bhaktapur- Changunanrayan Road	\N	Bhaktapur	Bagmati Province
f8058bf2-82f7-4520-8a4e-097083598ae2	2470934301	Cafe Concerto	28.2059913	83.9605246	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.736+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
7d7121c7-5838-4d52-bb3f-57e3024ca862	3152413638	Mitho Mitho	27.6503514	85.30564620000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.753+05:45	Ekantakuna - Tikabhairab Road	Sainbu	Lalitpur	Bagmati Province
948f5ca5-2014-42ab-8752-78583078dfb0	10121397631	Rollins Pizza Shop	27.683209	85.34337950000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.117+05:45	Subidha Marg	Basuki Nagar	Kathmandu	Bagmati Province
82e20774-f3a2-45fb-bc91-643175748a31	10011753418	Try Again Momo Center	27.746530200000002	85.3269429	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.082+05:45	Bhandari Street	Tokha	Kathmandu	Bagmati Province
ac70f051-7e62-4c66-8d6e-507504a4cc4e	9527281339	The Refresh Point	27.738831100000002	85.3397022	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.938+05:45	Kathmandu Ringroad	Ganesh Basti	Kathmandu	Bagmati Province
c83eccdd-1138-43fb-bff3-37bce88ff1b0	3072788246	Trisara Garden Restaurant	27.7195354	85.31864850000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.749+05:45	Narayan Gopal Road	Kailash Chok	Kathmandu	Bagmati Province
c17aea30-9898-4fdd-b9d6-739eb4c1ad63	9527281348	Lumbini Tanduri Bhojanalaya	27.7389577	85.3378878	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.939+05:45	Lamtangin Marg	Chundevi	Kathmandu	Bagmati Province
36b4e2b1-8eb4-4423-9eed-9b24515ce3eb	9527316350	Gandaki Hotel And Restaurant	27.744545100000003	85.3415442	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.94+05:45	Bansbari Sadak	Narayan Gopal Chowk	Kathmandu	Bagmati Province
a2108727-c3ce-4806-84c5-ee6c034d1b6a	9527316351	Muslim Lamian Restaurant Pvt Ltd	27.7441989	85.34188920000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.94+05:45	Bansbari Sadak	Narayan Gopal Chowk	Kathmandu	Bagmati Province
7c6bf11f-0634-4a0a-a735-2734a8895ad4	1904118759	Casa Pagoda	27.673770500000003	85.32570630000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.704+05:45	Shahid Shukra Raj Sadak Paschim	Mangal Bazar	Lalitpur	Bagmati Province
b82eb61b-063d-4ca4-b268-1b00df1e11af	9527316354	Dream Garden Cafe And Banquet	27.7449443	85.34171450000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.94+05:45	Bansbari Sadak	Narayan Gopal Chowk	Kathmandu	Bagmati Province
a51bf7e2-d56e-413c-8503-a7bf9fd026a2	9527316355	Dalo Bistro	27.7416389	85.3342856	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.94+05:45	Samanantar Marg	Narayan Gopal Chowk	Kathmandu	Bagmati Province
ec1729ea-c901-465f-8d76-260f9ce5095a	9527316356	Sajha Chulo	27.741022800000003	85.33444630000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.94+05:45	Kathmandu Ringroad	Narayan Gopal Chowk	Kathmandu	Bagmati Province
9ca02fb7-1a0a-41fa-bef2-bccbc32a8eca	9527316357	Mountain House Family Restaurant And Home Stay	27.7396117	85.3297802	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.94+05:45	Kathmandu Ringroad	Tokha	Kathmandu	Bagmati Province
596ca293-3b2b-42cc-a166-ea17345e1b78	8696860197	Third Eye Resturant	27.714255100000003	85.31016430000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.92+05:45	J.P. School Road	Paknajol	Kathmandu	Bagmati Province
1c1156b8-e454-4e91-8316-33bb99641988	10121362086	Airport View Restaurant	27.679524100000002	85.3492434	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.116+05:45	Ratna Marg	Basuki Nagar	Kathmandu	Bagmati Province
dc4201dd-68c9-4be2-abe2-e12b2dec42e6	9944842977	Devalaya	27.6792373	85.3083752	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.052+05:45	शान्त भवन मार्ग	Dhobighat	Lalitpur	Bagmati Province
c619cda4-dcaf-4919-a1e0-bd2e60faa012	5550675436	Shivalaya Restaurant	28.1586126	83.9815749	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.876+05:45	40DR016	\N	Pokhara	Gandaki Province
b6823744-fbbe-413d-8843-98d1434db097	10015176144	Cup o joy	27.7405022	85.3141619	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.093+05:45	F81	Tokha	Kathmandu	Bagmati Province
0162258c-4108-49a8-beea-348d0963805c	10015228493	mazzako Pizza	27.73874	85.3134339	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.093+05:45	F81	Deepjyoti	Kathmandu	Bagmati Province
00785377-163a-4229-969e-ff1689194782	10015228510	Hardik Swagt Resturant	27.738699	85.31283970000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.093+05:45	F81	Tokha	Kathmandu	Bagmati Province
3e07b29e-e94d-49f5-9705-66ea8c53aba7	10036366868	Everest Diamond Fast Food and Restaurant	27.7451386	85.33458630000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.108+05:45	Dhapasi Marg	Tokha	Kathmandu	Bagmati Province
2c578c0c-ea73-4f6a-a9f5-9adc03e42499	9662474447	Dreams Cafe and Restaurant	27.680416700000002	85.2792119	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.958+05:45	Way To Naya Bazaar	Chi-ba-hah	Kathmandu	Bagmati Province
fb1c5c7f-dd28-4f56-ba41-1d9dda7f39e6	10121424415	Devkota Khaja Time	27.6764024	85.34464870000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.122+05:45	SOS Marg	Seti O.P.	Kathmandu	Bagmati Province
447e9f26-f3f6-4a21-8631-3c980673c972	10121424334	Pizza Spot	27.6788953	85.3424284	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.121+05:45	Seti O.P. Marga; Gyanodaya Galli; Seti O.P. Marga	Seti O.P.	Kathmandu	Bagmati Province
2fbc7a5e-a7e2-43ce-88a4-9f91a10ae627	8832175851	Tea shop	27.682494000000002	85.2870233	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.922+05:45	Golden Jubilee Garden path	Nayabazar	Kathmandu	Bagmati Province
feb8ea60-ae4a-4f37-8848-b61abbae405e	9956153379	Tikan Momo And Cafe Center	27.675615500000003	85.3519291	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.054+05:45	Araniko Highway	Kot Devi	Kathmandu	Bagmati Province
fefdfd06-4d68-4f54-8db2-53c2fcdd5e30	5472541760	Janaparkash Restaurant	28.150088200000003	84.0650131	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.865+05:45	Prithvi Highway	Bhandardik	Pokhara	Gandaki Province
aba5eaed-655b-4c7f-ab69-d730e10b9045	5472544162	Saugat Restaurant	28.1494411	84.0646718	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.865+05:45	Prithvi Highway	Bhandardik	Pokhara	Gandaki Province
450a82f0-ca60-4dcb-85c2-a7cdfb259630	9944842958	Sawadee Cafe Thai Restaurant	27.679071	85.3077382	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.052+05:45	युलाखेल मार्ग	Dhobighat	Lalitpur	Bagmati Province
4fccada0-aed7-49e7-803a-76a2f6446a36	5437320573	Hotel Nana Pokhara	28.2108598	83.96646870000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.859+05:45	Baidam Road	Baidam	Pokhara	Gandaki Province
e0a632e2-819b-49f6-83ca-218d5ecb743f	4931756051	Lumbini Tanduri Dhawa and Bhojanalaya	27.735927	85.30514880000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.834+05:45	Balaju Machha Pokhari - Bypass	Machhapokhari	Kathmandu	Bagmati Province
01f37444-1514-44a0-aa45-1b8391b87d5a	4931756052	Namaste Lumbini Momo palace	27.7379235	85.3064822	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.834+05:45	METRO MARGA	Machhapokhari	Kathmandu	Bagmati Province
284fee28-f150-4e45-805f-66f8b713bcbb	4932164921	Bamboo Paradise	28.216217800000003	83.9572081	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.834+05:45	Gantavya Marg	Baidam	Pokhara	Gandaki Province
608c152f-63da-4876-90b2-5fcad973b009	5613946506	Parbat Jhir House	28.222100500000003	83.99912330000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.884+05:45	Shivashakti Marg	Ghimire Chok	Pokhara	Gandaki Province
0886013e-0497-410f-ab48-7e9ed6c53744	4931988229	Delice Crips Spicy	27.7353859	85.33199470000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.834+05:45	Maharajganj Sadak	Narayan Gopal Chowk	Kathmandu	Bagmati Province
292c4af2-9ac9-4a98-a17d-1b8b9d10d5e0	11634106324	Cafe with English	28.1925874	83.96617970000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.15+05:45	Siddhartha Highway	Om Shanti Chok	Pokhara	Gandaki Province
6197ade2-d45f-4c91-b880-493724b2fdc4	4690227189	La Bella Cafe	27.7153905	85.3103301	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.821+05:45	Chaksibari Marg	Lut Chok	Kathmandu	Bagmati Province
26058bd0-e14f-49e9-b255-9c310c2a6a67	10121388612	Siddhartha Cottege Restaurant	27.6851306	85.3475083	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.116+05:45	Madan Bhandari Path	Basuki Nagar	Kathmandu	Bagmati Province
61683bde-c74d-4c6c-8aae-911c61a7af0f	10121388629	Naya Everest Momo Center	27.6857359	85.34563080000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.116+05:45	Sudidhanagar Marg	Basuki Nagar	Kathmandu	Bagmati Province
340af7d1-d1eb-4e8f-80ca-0e05a6c52264	10121401001	90s Cafe	27.678857	85.3354621	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.118+05:45	Buddha Galli	Thulodhara	Kathmandu	Bagmati Province
d239d125-9cef-4b7f-9ec0-adb9aa9efa15	10121401002	Oats Cafe	27.678767800000003	85.3355234	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.118+05:45	Buddha Galli	Thulodhara	Kathmandu	Bagmati Province
bc361d76-81e0-410d-afcb-2303fd8d2732	10121401003	Spice 6 Tandoori and Family Restaurant	27.6785609	85.3355758	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.118+05:45	Buddha Galli	Thulodhara	Kathmandu	Bagmati Province
04358e1c-328f-48d7-88fb-c41e0e4717ba	9642676515	Jalpa Devi Bhojanalaya	27.6613575	85.2792175	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.953+05:45	Charghare road	Da-na	Kathmandu	Bagmati Province
85bc5696-b049-4e86-bb78-79f0cc5c8243	9642764297	Jalpa Devi MOMO And Tandoori	27.661100700000002	85.2797876	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.953+05:45	Charghare road	Da-na	Kathmandu	Bagmati Province
48946972-3b12-4e0e-a28c-b303c0fa0864	9916644004	Salincha Restaurant	27.681090500000003	85.3100982	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.047+05:45	अरुणा थापा मार्ग	Arun Thapa Murti Chowk	Lalitpur	Bagmati Province
473c22ce-6fd6-46b5-a8a4-a26e4402adf8	9655516062	Soma d cuisine	27.6792969	85.2767647	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.955+05:45	Kirtipur Ring Road	Chi-ba-hah	Kathmandu	Bagmati Province
b7b0fbd6-e742-4e3f-b417-cf23929b32bb	10154654599	Sweet treat	28.2172622	83.9573879	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.13+05:45	Gantavya Marg	Baidam	Pokhara	Gandaki Province
93187fc6-3c2e-4264-b5cd-128400020c15	9642638385	RR Taudahaview point	27.6497229	85.2809555	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.953+05:45	Dakchhinkali Road	Taudaha	Kathmandu	Bagmati Province
8b677709-3b12-412c-bf0a-13c2271d8684	9642676514	Ruby Red Restro and Bar	27.649873900000003	85.2784501	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.953+05:45	Dakchhinkali Road	Taudaha	Kathmandu	Bagmati Province
49006bec-3ab6-42f0-ae35-2c50e42eea3e	3375011138	U and Me Lakeside Restaurant	27.648765500000003	85.2833239	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.766+05:45	Dakchhinkali Road	Taudaha	Kathmandu	Bagmati Province
02c6eb44-c58f-44f6-83d9-8e22269eb911	3722266451	Chez Caroline	27.694344400000002	85.3227971	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.786+05:45	Tanka Prasad Ghumti Sadak	Bansh Ghari	Kathmandu	Bagmati Province
c290bf82-dda7-4741-ad42-ba604211d392	3722266472	Shogun	27.694594900000002	85.3228589	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.786+05:45	Tanka Prasad Ghumti Sadak	Bansh Ghari	Kathmandu	Bagmati Province
0cc84f17-1ddb-44da-af28-4a314c659879	3753930765	Mocha Pot	27.678438800000002	85.3142984	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.787+05:45	Pulchowk Jhamsikhel Marga	Dhobighat	Lalitpur	Bagmati Province
938bb3e6-eb35-4c94-b494-6234317c45d9	10121417249	Ramechhap Tapari Momo and Stick Food	27.684312600000002	85.3481806	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.12+05:45	Munibhairab Marg	Basuki Nagar	Kathmandu	Bagmati Province
ee413f3b-eb9a-4153-ac72-36ca69183806	4040391328	New Rainbow Resturant	28.2421569	83.98690380000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.789+05:45	Simpani Marg	Bhimkalipatan Chowk	Pokhara	Gandaki Province
a48a3fd5-89f0-4e8b-bc4c-d68c12b8e420	3706552395	Laxmi Marwadi Bhojanalaya	28.210002900000003	83.98565330000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.786+05:45	Naya Bazar	Chipledhunga	Pokhara	Gandaki Province
86adb552-5ac6-4d60-b481-ca5a8eadd988	3706601225	Samsung cafe	28.2237875	83.9912601	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.786+05:45	Mahendrapool	Chipledhunga	Pokhara	Gandaki Province
24167acb-77d2-4a9d-80dd-be3a0deafb88	3753927670	Cibo Bistro	27.678573800000002	85.3159706	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.787+05:45	Pulchok Marg	Pulchowk	Lalitpur	Bagmati Province
767eaa8a-cb58-4355-813d-454686d8b23a	10011926501	Face Food	27.742937	85.3303197	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.085+05:45	Hari Marga Tole	Tokha	Kathmandu	Bagmati Province
d4a7f60b-2576-4c3b-a921-0c483f4297de	10007821194	Spicy Laphing Station	27.7358274	85.3175913	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.073+05:45	Purna Street	Deepjyoti	Kathmandu	Bagmati Province
fca9ff21-08e8-4c80-acbb-a2258ed39d28	10007887765	Blue Heaven Restaurant and Sekuwa Corner	27.736960200000002	85.31719410000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.073+05:45	Pragati Sadak	Nav Milan Bastii	Kathmandu	Bagmati Province
5f1180cf-16f7-4de8-afc6-8a8bc964b219	5456766181	Priti Bhojanalaya	28.1920439	83.9706329	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.861+05:45	Sidhartha Highway	Birauta chowk	Pokhara	Gandaki Province
41e6545f-9a67-4d30-9ff3-439998f8e2a3	5516693179	Coffee Temple	28.223381500000002	83.9885758	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.873+05:45	Niva Galli	Chipledhunga	Pokhara	Gandaki Province
18f68189-557d-4260-a44c-39e87cde891b	10973663606	Ghyampo Restaurant	27.7216419	85.34821070000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.143+05:45	Shanti Goreto	Gopi Krishna Nagar	Kathmandu	Bagmati Province
3d29a8a0-a07a-4910-a5e3-a77c8da6777f	10973663905	Himalayan Beans Java	27.7225505	85.3489534	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.143+05:45	Saraswati Nagar Marga	Saraswati Nagar	Kathmandu	Bagmati Province
349a4440-c73c-4e86-aeeb-eb89c3e87ba5	10023970890	New Tandoori Cafe	27.6741452	85.3746868	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.106+05:45	Araniko Highway	Araniko Basti	Bhaktapur	Bagmati Province
d91aa459-2714-47b8-bd8a-bf0af533eba3	4693199191	momo restaurant	27.7102901	85.3078947	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.821+05:45	Ganesh Galli	Naghal	Kathmandu	Bagmati Province
de1ed26c-bbff-4753-9d45-9a1db27ffd02	4693199193	Hotel Orchind	28.2063789	83.96014500000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.821+05:45	10th Street, Bharat Bhattarai Marga	Baidam	Pokhara	Gandaki Province
1c90a251-b1c6-4e4e-ba67-90a33d546710	11949406659	Saandar Momo Center	27.678693900000003	85.4422771	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.159+05:45	26DR005	\N	Bhaktapur	Bagmati Province
26cef412-305d-46a5-b86c-e3dfaa74f229	5458854439	Cristal Cafe and Lounge Bar	28.232480600000002	83.98314760000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.862+05:45	Pokhara Baglung Highway	\N	Pokhara	Gandaki Province
23ffec1a-9e5b-4e46-a604-ec75a8c0faa1	9969484659	Second Home Fast Food	27.7057533	85.3188717	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.062+05:45	Baghbazar Sadak	Baghbazar	Kathmandu	Bagmati Province
01db5bff-6857-4cb2-abdf-a9fc94e9f1dc	4076231684	Coffee Culture	28.2209669	83.98735280000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.791+05:45	New Road	\N	Pokhara	Gandaki Province
c7de19ca-aa7a-40b6-a32b-45a268ea46af	9969484702	Lumbini Majheri Tandoori And Resturant	27.705614500000003	85.32021710000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.062+05:45	Baghbazar Sadak	Baghbazar	Kathmandu	Bagmati Province
c1d6f0e3-7a5b-467d-b9bb-8fc5cec4f822	4109648192	Kwality Food Cafe	27.6860205	85.3467327	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.791+05:45	Ring Road	Gairi Gaun	Kathmandu	Bagmati Province
a8c54512-4953-4a1d-928c-d5139d7e21f5	4119126090	Angan	28.221366500000002	83.9870794	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.792+05:45	New Road	\N	Pokhara	Gandaki Province
27c87308-9a0c-4af2-8f1b-a6476bd69d04	9969484708	Lilys Katti Roll And Fast Food	27.7056037	85.3203204	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.062+05:45	Baghbazar Sadak	Baghbazar	Kathmandu	Bagmati Province
0b7c5a5f-57fd-4a3e-894f-9daad18099d3	4693187292	Natssul Korea	28.2043895	83.963514	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.821+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
28d39865-f694-4c82-bca9-d99125144c98	3307465007	Chat Pate Pasal	27.676753	85.2787785	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.758+05:45	Manatwa	Yan-gah-cha	Kathmandu	Bagmati Province
14748afd-1cc8-4324-bb3f-4a9d19399258	2085375288	Paras Catering	27.7125787	85.35274030000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.725+05:45	Guru Marga	Kumarigal	Kathmandu	Bagmati Province
379d087e-e788-4c73-90f1-14c2c7a369ab	3396502778	Cozy Restaurnat	27.677086600000003	85.28141810000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.771+05:45	Kirtipur Road	Nayabazar	Kathmandu	Bagmati Province
2b2147bc-cd4b-4313-a8d4-b44b9876949a	3396502779	Dim Light Restaurant	27.676388000000003	85.2810386	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.771+05:45	Kirtipur Ring Road	Nayabazar	Kathmandu	Bagmati Province
354f8c22-c288-477e-a895-b60b6f5f1498	11361310282	Maya the coffee room	27.713614500000002	85.3125052	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.148+05:45	Jyatha Marg	Lut Chok	Kathmandu	Bagmati Province
715db36e-96df-40db-bc5f-821044ebcf05	4121533893	The Life Story Restaurant	27.674643800000002	85.3211823	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.792+05:45	Bubahal Road	Dhaugal	Lalitpur	Bagmati Province
0077d610-05b1-40bf-8c4d-672838d9b8de	10108155304	Madrix	27.688672	85.37111010000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.115+05:45	SanoThimi-Bode	Naagdesh (Nagadesh)	Bhaktapur	Bagmati Province
e14f13cd-6432-4dfe-a6cc-94b428c3edd9	3521349636	Buddha Tours	28.2058909	83.9611885	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.778+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
3909b672-10f0-400e-92d7-db0f81cc726d	9999286850	Jirey Khursani Restro	27.669845400000003	85.3527318	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.067+05:45	Manohara Corridor	Thulodhara	Kathmandu	Bagmati Province
a761b715-2fed-45cc-bde2-be29cad962b4	10654338852	Tonys	27.6776468	85.3111471	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.136+05:45	Pulchowk Jhamsikhel Marga	Dhobighat	Lalitpur	Bagmati Province
135154de-71b8-4557-aea9-fc11bb4fb728	4707636093	Doko Resturant and Bar	28.2118292	83.95700070000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.822+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
31ef644a-3a14-44fc-826a-64e9c3f70c04	9447489218	Tukche Thakali Kitchen	27.7175	85.3292929	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.929+05:45	Gairidhara Road	Narayan Chaur	Kathmandu	Bagmati Province
7dd7756f-fda8-4584-8311-bdb420e0b172	9956505911	Padini Chamena Ghirha	27.701995800000002	85.32027330000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.056+05:45	Exhibition Road	Baghbazar	Kathmandu	Bagmati Province
77a9028d-e3a0-4327-b56d-30512ffb399e	9956505916	Aarambha Newari Restro and Cafe	27.7018571	85.3212317	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.056+05:45	Sankar Dev Marga	Baghbazar	Kathmandu	Bagmati Province
89657cfa-17b6-4fc2-86dd-8af9db94b48d	9956505921	Phileo Cafe	27.7018005	85.3217316	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.056+05:45	Exhibition Road	Baghbazar	Kathmandu	Bagmati Province
25286714-7c27-4cbc-86ac-5f41d1435f39	7816583387	Laffing Center	27.6974148	85.2809448	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.914+05:45	Yagyashwar Marg	Kalanki	Kathmandu	Bagmati Province
96f53a9f-c3e8-416f-9aa5-084f04f2aeb0	7826537882	Rishab Bhanjako Sekuwa Gar	27.691755200000003	85.346984	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.914+05:45	Kareshwor Marga	\N	Kathmandu	Bagmati Province
ee124474-7b4c-4330-bb0f-b583a7d39036	9425131318	Sichuwan Chinese Restaurant	27.723176400000003	85.36047470000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.929+05:45	Hyatt - Boudha Marg	Dhara Tole	Kathmandu	Bagmati Province
633f82da-588a-497c-940c-03bd4f5b511a	9447487817	Hamro Numbur Sekuwa Corner	27.717311700000003	85.3421088	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.929+05:45	Chabahil Ganesh Marg	Binayak Tol	Kathmandu	Bagmati Province
da03edc6-7b05-429a-b6e2-f5a6d2de73bb	9958455120	Hot Pot Restaurant	27.6835898	85.3127982	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.056+05:45	Maitri Marg (Bakhundole)	Bakhundol	Lalitpur	Bagmati Province
1a440fb2-196b-425d-a0c4-48917c52b83f	9962156984	Mutton Station	27.6694189	85.3526631	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.056+05:45	Manohara Corridor	Thulodhara	Kathmandu	Bagmati Province
1de7a888-4b2b-483d-9cb4-656384e1989f	11933629087	Nyatapola Kitchen	27.6713412	85.4297478	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.157+05:45	kwachhen	Aadarsha	Bhaktapur	Bagmati Province
6d32644a-e96b-455d-ba2d-3e4605ce7cd8	10011892546	Chhimeki Coffee Shop	27.751375300000003	85.32243580000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.085+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
f64ab9f0-a235-421f-9568-5c6b7f3c8bc4	7799185191	Hot and Spicy Kitchen Cafe and Bakery	28.2200491	83.97786880000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.914+05:45	Pokhara Baglung Highway	Dharapani	Pokhara	Gandaki Province
974793ee-ec4f-45a0-8279-caed24f1d192	7816973945	HImalayan Java Baluwatar	27.7267411	85.33080170000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.914+05:45	Embassy Marg	Kiran Chok	Kathmandu	Bagmati Province
7a518599-9bfb-4bd4-ad0d-758cb19c0b63	7826375291	Kwality Momo	27.677815000000002	85.39789090000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.914+05:45	RadheRadhe Road	Madhyapur Thimi	Bhaktapur	Bagmati Province
c5c2c44e-d876-4358-9182-bb408788f4d2	2584801135	AEPC Tea Shop	27.6552261	85.3314591	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.738+05:45	Khumaltar Height Marg Uttar	NAST Research Centre	Lalitpur	Bagmati Province
aedaa4f2-aaac-49c6-85ca-c20a1fc9a080	3363046525	S2 bakery and momo	27.7118262	85.3417089	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.764+05:45	Jaya Bagheshwori Marga	\N	Kathmandu	Bagmati Province
85cc4951-961e-4d0f-915e-0b40d051ee04	10009346098	Rolpali	27.736510600000003	85.31035370000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.074+05:45	Parajuli Niwas marga	Deepjyoti	Kathmandu	Bagmati Province
de9b6f4f-0406-4beb-9223-2a245cdffdeb	10009346099	Pachthar Syarumba Gest House	27.736492300000002	85.3104146	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.074+05:45	Parajuli Niwas marga	Deepjyoti	Kathmandu	Bagmati Province
1ed50aac-d5a1-42d0-99e0-0c42298ac8ae	10009346240	Kathmandu Foods cafe	27.7516938	85.325979	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.074+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
c4807bce-1ee8-452e-b725-fce6dad4607a	5598609628	Rest And Taste Restro And Bar	28.216168300000003	84.0191849	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.883+05:45	Street No 24, Sundanda Ratan Pandey Marga	Sigdel Tol	Pokhara	Gandaki Province
2aa77b4b-8159-4d9d-b759-9a8ecbb7351b	11247656042	Friends Hub	27.710137300000003	85.41532980000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.145+05:45	F95	\N	Bhaktapur	Bagmati Province
d757e2c1-cf7f-4a1c-a703-87174a7f05d8	5469168223	Biplove Restaurant	28.143821300000003	84.0867631	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.863+05:45	40DR025	Tagako Mukh Chok	Pokhara	Gandaki Province
3530661a-f076-4506-bedf-9584fd9919bc	2166426553	Viva Banquet	27.698011200000003	85.3037582	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.731+05:45	Buddhabari marg	Teku	Kathmandu	Bagmati Province
76b1d760-eb04-48f0-a18d-a1a7ea56c514	9526101917	Mandro cafe and restaurant	27.741851200000003	85.33181590000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.936+05:45	Kathmandu Ringroad	Narayan Gopal Chowk	Kathmandu	Bagmati Province
0a3a52eb-df00-4da3-b46f-1bad1a8b05b7	9526102717	Raj Bhojanalaya and momo	27.734826100000003	85.31794740000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.936+05:45	Kathmandu Ringroad	Deepjyoti	Kathmandu	Bagmati Province
79faf4d1-8826-4991-b388-0fdef651dc90	10016176867	Pipalbot New Restaurant	27.7495222	85.3196922	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.099+05:45	F81	Baluwapati Chowk	Kathmandu	Bagmati Province
8ca7b6b2-bdbd-4844-9823-fb55de323820	10016176868	Old Town Road Restaurant	27.748679000000003	85.31921050000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.099+05:45	F81	Baluwapati Chowk	Kathmandu	Bagmati Province
81d26d1a-0fcb-4adf-b24a-c5568565b83f	10016176870	Small Steps Stick Food	27.748338800000003	85.31866140000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.099+05:45	F81	Baluwapati Chowk	Kathmandu	Bagmati Province
ca9e8c2e-dc61-4232-b050-1ee6d3250a6a	10016176871	Laphing and Noodles Station	27.7482274	85.31858790000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.099+05:45	F81	Baluwapati Chowk	Kathmandu	Bagmati Province
89647a6e-8e23-4917-9275-c3e77d4aacac	10121388673	Classic MoMo House	27.6859357	85.3438124	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.116+05:45	Sat Marg	Sahayogi Nagar	Kathmandu	Bagmati Province
622106e9-2c2e-45ac-a7a5-99ca667e6d2c	8696860188	Dancing Yak Restaurant	27.714342600000002	85.31028570000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.919+05:45	J.P. School Road	Paknajol	Kathmandu	Bagmati Province
2cffbe74-7457-47f5-a277-df0d9d047070	9969484871	Everest Momo	27.703395200000003	85.3185845	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.064+05:45	Adwait Marg	Baghbazar	Kathmandu	Bagmati Province
c258976a-cea3-4feb-b2ae-a30f57554368	5553818229	Panas	28.2218482	83.9546395	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.877+05:45	40DR012	\N	Pokhara	Gandaki Province
e05485ce-f13a-4ce0-a9d2-22ceb64c3b18	9804018804	Jimbu	27.6770673	85.3098125	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.025+05:45	Damkal-Chakrapath Marg	Dhobighat	Lalitpur	Bagmati Province
e4e0ad1b-aa3e-4ab7-abbe-afa6880d375a	5104554481	Piya Restaurant	28.210920400000003	83.9619613	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.841+05:45	Street 41 (School Patan Marg)	Baidam	Pokhara	Gandaki Province
ea2d86c7-c1f3-4792-8b55-ad26223f7ecb	9527958354	burger house	27.695663300000003	85.3758086	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.941+05:45	F89	\N	Kathmandu	Bagmati Province
c1d98f32-b3dc-45a1-b103-5e9867b8c2fd	9528547918	Indreni food court	27.7022227	85.3096917	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.941+05:45	Pako Sadak	\N	Kathmandu	Bagmati Province
dc1c2db5-f566-4c63-86af-f700e6f76287	9527281333	Prr Ring Road Restro	27.7348646	85.3420124	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.938+05:45	Banshidhar Marg	Laligurans Chok	Kathmandu	Bagmati Province
90073de8-6ded-42c5-a85c-b128c41ba71a	9527281335	Moonlight Cafe And Banquet	27.7322445	85.34379170000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.938+05:45	Kathmandu Ringroad	Milijuli Tol	Kathmandu	Bagmati Province
aebc3226-6ccf-4113-99fc-378d02355418	9527281336	Lete Thakali Kitchen	27.732364500000003	85.34366030000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.938+05:45	Kathmandu Ringroad	Milijuli Tol	Kathmandu	Bagmati Province
cfad3a8a-a139-4d2c-98c3-704df03ac31c	9528549817	80s cafe	27.741971200000002	85.33100200000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.941+05:45	Kathmandu Ringroad	Narayan Gopal Chowk	Kathmandu	Bagmati Province
0d90e742-9d87-4b92-8799-66b0a39d8080	3166136485	Aankhi Jhyal Restaurant and Bar	28.205708100000003	83.9614439	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.754+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
bf76eef2-bd5e-4407-8551-4d5588645477	3166814589	Cafeteria	27.7424134	85.36482000000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.754+05:45	kapan jagadol gokarna road	\N	Kathmandu	Bagmati Province
a8c54cc4-f427-449b-9271-10c0dfdb93b2	3155930667	Pappu Paratha Pasal	27.692768	85.2787744	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.753+05:45	Tribhuvan Rajpath	Nagarjun	Kathmandu	Bagmati Province
c915277d-8fc8-40b3-9f7f-8d6dafc29b59	3164871676	Coffee Club	27.703579	85.30834270000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.753+05:45	Ganga Path	Makkhan Tol	Kathmandu	Bagmati Province
b8181065-7fbb-443e-adae-1378f48da91a	10973663505	Lasa Kusa	27.7085653	85.32585560000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.143+05:45	Kamal Marg	Kamalpokhari	Kathmandu	Bagmati Province
ec6c5679-1b99-4f85-af1d-b1403037bfc7	10973663506	Devdarshan Sekuwa Corner	27.723395200000002	85.349332	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.143+05:45	Saraswati Nagar Marga	Saraswati Nagar	Kathmandu	Bagmati Province
313c43d4-97a5-4c10-8106-3d83978bfb31	5525019674	Syanga Adhikhola Hotel	28.233890600000002	83.9980403	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.874+05:45	40DR014	\N	Pokhara	Gandaki Province
939f1e8d-3f84-4103-97c7-35b86bed5972	5525019683	B 9 Restaurant	28.2335308	83.9985345	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.874+05:45	40DR014	\N	Pokhara	Gandaki Province
68df07dc-b9a5-40cd-8b05-98c0de10f41b	10017278898	Thali Cafe	27.7418112	85.3307291	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.104+05:45	Kathmandu Ringroad	Narayan Gopal Chowk	Kathmandu	Bagmati Province
6a8c2ec6-136f-44f6-b522-c20e0ebab5aa	5470406229	Sunsari Annapurna Cafe	28.197018800000002	83.9699878	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.864+05:45	Dam Side Marg	Birauta chowk	Pokhara	Gandaki Province
9c04efd7-8228-4525-914c-7d018d3b43d2	5470481246	Prem Khaja Gar	28.154136100000002	84.064993	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.864+05:45	Shisuwa Bhandardhik Marga	Bhandardik	Pokhara	Gandaki Province
d47952a2-297e-4a26-88c3-276499ce243b	5470481253	7Woder Water Park Resturant	28.1612529	84.0569799	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.864+05:45	Prithvi Highway	Bhandardik	Pokhara	Gandaki Province
f5f3e6d1-4a6d-42e1-b1b7-9ad4021c26b4	5470524961	Pushpa Naan House and Tandoori Food Cafe	28.1961383	83.9743256	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.864+05:45	Siddhartha Highway	Birauta chowk	Pokhara	Gandaki Province
e662d93d-a173-443e-a98a-4a169756e48d	5470588703	The Soltee Restaurant	28.198652300000003	83.9749391	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.864+05:45	Rotary Miteri Marg	Milijuli Tole	Pokhara	Gandaki Province
9d22216e-9c20-48bb-a02b-b83168002d65	9913978537	Three by Four Cafe and Bar	27.6830964	85.3067438	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.047+05:45	Shanti Bhawan Marga	Arun Thapa Murti Chowk	Lalitpur	Bagmati Province
3dd6248a-d04b-4fa1-b6b2-efde204d8aeb	9914324037	Ghangri Cafe	27.6759844	85.3141528	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.047+05:45	दमकल सुन्दरीघाट मार्ग	Dhobighat	Lalitpur	Bagmati Province
e9efdb19-6556-4db8-bf96-df50efad636f	9914334742	Food Truck	27.675861100000002	85.31426490000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.047+05:45	दमकल सुन्दरीघाट मार्ग	Dhobighat	Lalitpur	Bagmati Province
b69858cc-d4a8-4e02-a73d-48c2a8c0b630	4186801309	New Era Restaurant	28.2127623	83.9764641	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.8+05:45	Phewa Marg	Zero Kilometer	Pokhara	Gandaki Province
ba1fe7dd-2fbb-4603-a81f-b5621fe2f125	9572463902	Dharane sekuwa house	27.668888000000003	85.269118	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.948+05:45	Pushpalal Marg	San-la	Kathmandu	Bagmati Province
71080fdf-716d-44e1-a269-a222a34fb3c6	9574658405	Lumanti	27.669933	85.280108	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.948+05:45	Pragati path	Karki Gaon	Kathmandu	Bagmati Province
3b73f3cc-b72b-4d7d-abfb-e7c85f4b2bdc	9956153373	The Burger House And Crunchy Fried Chicken	27.675508500000003	85.3525383	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.053+05:45	Araniko Highway	Kot Devi	Kathmandu	Bagmati Province
1a736b49-73e4-4e91-9dc6-acd386f5ec96	10121417256	Dlight Cafe and Fast Food	27.6845515	85.34786460000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.12+05:45	Munibhairab Marg	Basuki Nagar	Kathmandu	Bagmati Province
7f5b40d4-e721-4400-bf12-0cf6a62f5a89	9524307718	Yun Restaurant	27.7292975	85.32675130000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.934+05:45	Buddhi Sagar Marg	Panipokhari	Kathmandu	Bagmati Province
2f22234d-76f2-41c9-85ee-d8a449716cdf	9969193296	Hotel 3D Restaurant and Bar	27.677167200000003	85.3475202	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.059+05:45	Devasthal Marga	Kot Devi	Kathmandu	Bagmati Province
c4047f33-9373-4926-873d-a563b3d78c12	10016425416	Raizone Cafe	27.747446900000003	85.3353491	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.1+05:45	Dhapasi Marg	Tokha	Kathmandu	Bagmati Province
7096be22-b148-4a4c-9c7c-480cca59d61c	5094087721	Aroma Himalayan Coffee	27.6676055	85.3218404	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.839+05:45	Mahalaxmisthan Road	Kumaripati	Lalitpur	Bagmati Province
e33041af-cdbf-4adc-9c32-60adc5c3a4c8	5472241532	Panchase Cold Stores	28.190288600000002	83.9752208	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.865+05:45	Annapurna Marg	Birauta chowk	Pokhara	Gandaki Province
1355d9ba-7144-43e4-8bdd-d6d162c19dc7	5112275029	Ginger Garden	28.218122	83.986331	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.842+05:45	New Road	\N	Pokhara	Gandaki Province
252a26f1-e8bc-4cea-add2-7f9c86cc0c1b	5137072922	Yin Yang Restaurant	27.714550300000003	85.3101589	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.843+05:45	J.P. School Road	Paknajol	Kathmandu	Bagmati Province
ca78e738-d5f5-49cb-8f13-19e15959ece8	10108155279	paanas restaurant	27.689501500000002	85.37185910000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.114+05:45	SanoThimi-Bode	Naagdesh (Nagadesh)	Bhaktapur	Bagmati Province
c4b932b6-b4e8-4608-b2b3-888eed8c1df5	10108155280	chakati restaurant	27.6895549	85.37241970000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.115+05:45	SanoThimi-Bode	Naagdesh (Nagadesh)	Bhaktapur	Bagmati Province
2f91cc39-1d24-40c6-b6d6-1357123244c3	1918582153	Coffe Talk	27.7389267	85.33570420000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.708+05:45	Maharajganj Sadak	Narayan Gopal Chowk	Kathmandu	Bagmati Province
64fa7d62-de67-4420-9787-199c00c6d706	10110783801	Durbar Thakali Grill	27.6766797	85.3981662	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.115+05:45	RadheRadhe Road	Madhyapur Thimi	Bhaktapur	Bagmati Province
340049f8-c8ff-46af-b741-bdb19c23eb12	10110783804	Freshco cafe	27.676891100000002	85.39821450000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.115+05:45	RadheRadhe Road	Madhyapur Thimi	Bhaktapur	Bagmati Province
6fd878af-bb5a-4f7e-b182-603a3455062e	9642627382	Centerpoint	27.650048100000003	85.2812923	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.953+05:45	Dakchhinkali Road	Taudaha	Kathmandu	Bagmati Province
eefeb1b0-0e4f-4b76-88a1-b7f44d3da3c5	5520135107	Saypatri Restaurant Bar And Jhir	28.2230239	83.99683800000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.873+05:45	Rani Pauwa	\N	Pokhara	Gandaki Province
67af3bfd-eb6c-4251-8d33-ba427af2a03d	9928590040	Lokpriya Lumbini Tandoori Bhojanalaya	27.693451900000003	85.31429560000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.049+05:45	Tripureshwar Marg	Tripureshwar	Kathmandu	Bagmati Province
6bd6e88a-cf9e-4f39-831a-bf55091ac970	8697027799	Ambassador Garden Home	27.714902100000003	85.3102666	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.92+05:45	J.P. School Road	Paknajol	Kathmandu	Bagmati Province
c1126fc2-7bb5-418f-aa1b-b4754d1da083	9530396601	Sandar Momo	27.7026076	85.3100184	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.947+05:45	Pako Sadak	\N	Kathmandu	Bagmati Province
3448a147-56ef-434c-9aec-b8b6e3a94dc8	1936280985	Five Monkeys Restaurant	27.683215800000003	85.33436300000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.709+05:45	Shri Nagar Marg	Shri Nagar	Kathmandu	Bagmati Province
38a1e3df-d875-4f8b-80d5-36c6ffcd5559	9926729661	Kantipur Fast Food And Bhojanayaley	27.6913139	85.31658390000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.048+05:45	Tripureshwar Marg	Tripureshwar	Kathmandu	Bagmati Province
dd28aeb5-a936-47cb-b3d5-7be2df527f46	9926729665	Pavilion Resturant	27.6913039	85.3167619	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.048+05:45	Tripureshwar Marg	Tripureshwar	Kathmandu	Bagmati Province
feed096b-d9e3-49a9-b296-3bd3ea65f832	9926729709	The Kwality Food Cafe	27.6931611	85.31495910000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.048+05:45	Tripureshwar Marg	Tripureshwar	Kathmandu	Bagmati Province
aebf88fc-450f-4542-b8f5-ff0b6a4eb344	1937647443	Angel Restaurant and Bar	27.6716552	85.3126428	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.71+05:45	Jawalakhel Yekantakuna Sadak	Dhobighat	Lalitpur	Bagmati Province
9327036d-e883-45b5-b670-4b4fe1d55d39	9927072518	Mirror Restaurant	27.713725200000003	85.35072980000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.049+05:45	Baudhadwar Marg	Kumarigal	Kathmandu	Bagmati Province
45f2b461-8706-44c8-bbde-e43027f543e9	9523224717	Gaga Restaurant	27.725095600000003	85.34212720000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.933+05:45	Anandamaya Marg	Anandanagar	Kathmandu	Bagmati Province
857eceba-efd9-42c8-ace2-1a6aaba4ca50	5571115957	Satkar Restaurent	28.237106400000002	83.98439730000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.879+05:45	Mitra Marg	\N	Pokhara	Gandaki Province
c4d803bc-650a-44d3-8424-87d8654effd2	9969484835	JF Fast Food And Resturant	27.703275400000003	85.3196089	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.063+05:45	Adwait Marg	Baghbazar	Kathmandu	Bagmati Province
2f734a5e-c313-4685-8275-006f13234354	10015534469	Top Stick Food and Momo Magic	27.749724200000003	85.318098	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.096+05:45	F81	Baluwapati Chowk	Kathmandu	Bagmati Province
020c6534-c9af-4309-baf8-b388a3b3578f	9969193314	Mechi Crown and Roll Center	27.6767432	85.3468734	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.059+05:45	Devasthal Marga	Kot Devi	Kathmandu	Bagmati Province
663e2744-fe74-4e08-89b5-c89921603635	9969194225	Diamond Cafe	27.6765791	85.34660600000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.059+05:45	Devasthal Marg	Seti O.P.	Kathmandu	Bagmati Province
d9c6c49b-f8c7-4e88-b4db-fa33d1f544f9	9969194259	Cafe D TAJ	27.676014700000003	85.3457035	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.06+05:45	Devasthal Marg	Seti O.P.	Kathmandu	Bagmati Province
130ea5bd-7d3c-4ae9-83f5-df37939fd938	9657770374	Tea and hub	27.681416700000003	85.2794291	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.956+05:45	Way to TU	Chi thu Dhokha	Kathmandu	Bagmati Province
ec2a9ffa-8700-41b4-a978-2eac64dd04ec	9529597419	Royal Himalayan Cofee	27.7310392	85.3289403	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.945+05:45	Rati Marg	Maharajganj	Kathmandu	Bagmati Province
f44822ef-9e3a-42ce-b810-45323f70f3a7	1937657343	Sekuwa and Tass House	27.671976500000003	85.3152757	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.71+05:45	Utter Bagaicha Marga	Dhobighat	Lalitpur	Bagmati Province
91412174-a30e-443e-99ec-4baaaedbc755	10147414098	Paris Foodland And Cafe	27.6828095	85.3462384	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.129+05:45	Samudayik Marga	Mahadevasthan	Kathmandu	Bagmati Province
6c30bf8e-6f0c-4346-9440-127ac5b117b0	10147414122	Jhilko Fast Food Cafe	27.679786600000003	85.3471148	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.129+05:45	Himali Marg	Basuki Nagar	Kathmandu	Bagmati Province
85bcd5c8-c085-4b98-bb53-33da05a52865	10147414129	Rajani Food Store	27.680067200000003	85.3470822	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.129+05:45	Himali Marg	Basuki Nagar	Kathmandu	Bagmati Province
93ab5940-da47-46e8-b1cb-ff4bd202e837	10154643349	Green Leaf	28.215883700000003	83.9570657	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.13+05:45	Gantavya Marg	Baidam	Pokhara	Gandaki Province
d7eb8ece-61a7-437c-903b-13ca9413d7cb	10147752653	Meals Station	27.672426	85.4052418	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.129+05:45	Araniko Highway	Suryabinayak	Bhaktapur	Bagmati Province
1388206a-ca6c-4f88-9e18-9ae1a4ca2b13	10147752673	Burger House and Crunchy Fried Chicken	27.670481700000003	85.4096729	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.129+05:45	F100	Suryabinayak	Bhaktapur	Bagmati Province
ab27915c-e230-4dfb-8100-2009b2f6ac5e	1990674404	Vetghat Restaurant	27.6737588	85.37373240000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.715+05:45	Araniko Highway	Araniko Basti	Bhaktapur	Bagmati Province
f7441450-c34e-4cf3-b13c-e3d429ec4b6a	5485594825	Manakamana Restaurant	28.222693800000002	83.95281200000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.868+05:45	40DR012	\N	Pokhara	Gandaki Province
a5875365-0cac-42de-8b1b-45bb25f48091	5485600641	Fewa Beach Hotel	28.221505200000003	83.9524099	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.868+05:45	40DR012	\N	Pokhara	Gandaki Province
e5936eba-9cbd-4736-9d39-7e992970c0a4	5486125298	Star Coffee Center	28.211609000000003	83.9574766	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.868+05:45	Street 16t (Samikopatan)	Baidam	Pokhara	Gandaki Province
2716a150-d3c1-4e21-94a7-470848e04a8f	5479218519	New Sarangkot Resturent	28.2449504	83.97220730000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.867+05:45	Thapa Marg	\N	Pokhara	Gandaki Province
0043b095-ce78-4c35-9c05-54bcf536f680	2214390815	Kyapchakii Restaurant	27.725193500000003	85.330922	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.733+05:45	Thirbam Sadak	Kirtan Chok	Kathmandu	Bagmati Province
941235e9-14cc-4bdd-a69b-8e4eb586ef43	5479338252	Up Town Food Corner	28.243955000000003	83.9580681	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.867+05:45	Thapa Marg	\N	Pokhara	Gandaki Province
8ca64ad5-471f-45c2-b283-461c498f34b7	10698637827	Unique bakery	27.6667704	85.3842144	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.137+05:45	26DR002	Joshigau	Bhaktapur	Bagmati Province
b546803f-0d7c-40db-8d29-d9c5a822d6eb	10012154584	Kamana Hodel And Lodge	27.7359173	85.312122	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.086+05:45	Kathmandu Ringroad	Gongabu	Kathmandu	Bagmati Province
cc88a903-e396-4c53-b4e7-920c2287836b	3072758224	sekuwa corner	27.7491863	85.3470394	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.748+05:45	Golfutar Residential Road	Golphutar	Kathmandu	Bagmati Province
09244fec-7507-410f-a8f9-d56c62ae1434	10668681905	Hao Pin	27.715927100000002	85.3254077	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.137+05:45	Sama Marga	Kamalpokhari	Kathmandu	Bagmati Province
e5c89903-495d-4aff-b1e4-562cc49420b0	10668684905	Deja Vu	27.716180100000003	85.32551120000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.137+05:45	Sama Marga	Kamalpokhari	Kathmandu	Bagmati Province
4e423612-f7f8-4f9c-ad54-6410ea2971ee	10668684906	The Urban Eatery	27.716093800000003	85.3254861	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.137+05:45	Sama Marga	Kamalpokhari	Kathmandu	Bagmati Province
8900eb93-de92-43bb-9bc3-d10775204ab3	5516070827	Secret Garden Cafe	27.713759200000002	85.311701	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.872+05:45	Narsingh Chowk	Lut Chok	Kathmandu	Bagmati Province
c8740e64-704c-4ff2-b655-0bbb7aaf860d	4985309194	Universal Cafe	27.7393436	85.3389259	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.836+05:45	Milijuli Marg	Narayan Gopal Chowk	Kathmandu	Bagmati Province
1bf93358-c23c-4780-88e7-df8a600666c5	4994207639	The Inn Restaurant	27.674331000000002	85.32593630000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.836+05:45	Tunbahal Marg	Belache	Lalitpur	Bagmati Province
1579775c-21ce-4574-984d-16656a5127f7	4994207661	Yala Mandala Restaurant	27.674449600000003	85.3247559	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.836+05:45	Bagalamukhi Marg	Jhātāpol	Lalitpur	Bagmati Province
dffc9c6a-52ea-4c29-9fc7-9ffe10ba4dc1	9944752623	XI THANG MART	27.680418900000003	85.310179	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.052+05:45	Bakhundol	Arun Thapa Murti Chowk	Lalitpur	Bagmati Province
d4b9ea1e-6fb6-4c26-8254-e15c8fe3ef51	1905155383	The Airport Sekuwa	27.7391015	85.3394561	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.706+05:45	Milijuli Marg	Narayan Gopal Chowk	Kathmandu	Bagmati Province
e36936e5-d732-4f2a-b704-868ff70f8c4a	4934160723	Blue Note Cafe	27.6850485	85.307131	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.834+05:45	Shanti Bhawan Marga	Arun Thapa Murti Chowk	Lalitpur	Bagmati Province
4135ec71-3c44-41ae-a203-1d61302b7adf	10009628529	Lumbini Dhaulagiri Kalinchok Guest House	27.736196800000002	85.3118019	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.076+05:45	Buddha Marga	Deepjyoti	Kathmandu	Bagmati Province
0c1193a3-1066-4023-a28f-5c9bb40280f9	2236942184	Meet Point Cafe	27.6953955	85.34089780000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.733+05:45	Surya Bikram Marga	Naya Baneshwar	Kathmandu	Bagmati Province
fedc5f7d-2772-4fc4-b81e-ea9313556678	2087062785	Parikar	28.2085444	83.9580377	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.725+05:45	13th Street (Barahi Path)	Baidam	Pokhara	Gandaki Province
eea9f114-b167-4b89-b6a8-1b0d20d94e78	9899557698	Momotarou Restaurant	27.6858058	85.30695770000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.046+05:45	Sanepa marg	Bakhundol	Lalitpur	Bagmati Province
331b49e0-a72a-4746-b191-3aeccdca8dd6	2088458832	Radhe Radhe Bakery Cafe	27.7213424	85.337798	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.726+05:45	Pragati Marga 1	Kirtan Chok	Kathmandu	Bagmati Province
5e3ad4cb-7a78-4685-9189-57a199ec4de9	2090601780	Barista Lavazza	27.718423	85.31893240000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.726+05:45	Uttar Dhoka Road	Kailash Chok	Kathmandu	Bagmati Province
5f811ee2-ba9d-42cf-9533-f415e4799fcf	2090613253	Tej Bhawan Restaurant and Bar	27.7188291	85.3204039	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.726+05:45	Uttar Dhoka Road	Kholagaal	Kathmandu	Bagmati Province
c2e6926f-5526-4602-abae-d25fc8fb3410	2166417287	The Bakery Cafe	27.7012362	85.3110726	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.73+05:45	Bhulaa marg	\N	Kathmandu	Bagmati Province
d57a7bb0-876c-4c07-a37a-179aeed1ffab	2249145058	Tapari Restaurant	27.675970200000002	85.358818	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.733+05:45	Araniko Highway	Madhyapur Thimi	Bhaktapur	Bagmati Province
a949a8aa-a6b1-4123-bb10-dcb6df1629ac	11353483095	Keroneva Cafe	27.687296600000003	85.31417060000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.147+05:45	Teen Khamba Marga	Bakhundol	Lalitpur	Bagmati Province
d6b4cbae-5a18-474b-88df-912b60dd863b	11353483279	Sesame bakery and coffee	27.684909400000002	85.31259490000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.147+05:45	Bakhundol	Bakhundol	Lalitpur	Bagmati Province
8ba3c20e-e064-4ff8-99c6-aa80e5772998	11353487808	Cuts and coffee	27.685216	85.3129742	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.147+05:45	Bakhundol	Bakhundol	Lalitpur	Bagmati Province
7f6baa00-d6c1-49cc-99c1-ca154395812c	11353732141	Himalayan Java cafe	27.682341500000003	85.3112206	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.147+05:45	Bakhundol	Arun Thapa Murti Chowk	Lalitpur	Bagmati Province
f063f422-8130-4abf-845f-dbe021dceed6	11357787082	Nutopia cafe	27.674955	85.3254824	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.147+05:45	Swotha Narayan Sthan	Swotha	Lalitpur	Bagmati Province
3728eb4c-1196-493d-ac0c-f5e42bb5537b	11029627205	Cafe kunz	27.725609400000003	85.3241388	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.143+05:45	Lazimpat Sadak	Narayan Tole	Kathmandu	Bagmati Province
77e9930c-9769-4246-b741-a4bea8e505e3	4201550389	Organic Java Coffee House	28.213711200000002	83.95858080000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.803+05:45	Baidam Road	Baidam	Pokhara	Gandaki Province
5460360f-6b87-4ea5-995a-eacd19536213	9724495031	Rose Garden restro	27.654889700000002	85.2881318	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.97+05:45	Dakchhinkali Road	Taudaha	Kathmandu	Bagmati Province
d632bce4-9680-4640-ba8d-18ed5fff44b6	2684764972	Kasthmandap Wine Gallery	27.6700282	85.3091215	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.741+05:45	Bhanimandal Sadak	Dhobighat	Lalitpur	Bagmati Province
eaaf6774-6041-4f2a-9b0a-edd29b90b465	2684765220	Kancha ko bhancha	27.670345700000002	85.3089552	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.741+05:45	Bhanimandal Sadak	Dhobighat	Lalitpur	Bagmati Province
8250048d-e4f6-4237-8a6b-4536410fed68	4634351629	Ruslan Nepali Kitchen	28.206263500000002	83.9627854	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.82+05:45	6th Street,Peaceful Road	Baidam	Pokhara	Gandaki Province
66a5c257-4054-4df3-86fc-d986b42b60a9	4664767490	Redmud Coffee	27.693177900000002	85.3190344	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.82+05:45	Trade Tower Road	Thapathali	Kathmandu	Bagmati Province
fb8012b3-3eba-478b-beae-be2ee4f92098	4690074089	Rosemary Kitchen Pokhara	28.2130748	83.95781140000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.821+05:45	Street 17 (Lalupate Marg)	Baidam	Pokhara	Gandaki Province
fe3ab9eb-ba14-4e57-ac28-e558cc49a72e	4202044888	Cozy Resturant	28.2234063	83.9885053	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.803+05:45	Niva Galli	Chipledhunga	Pokhara	Gandaki Province
8a99f758-fc9d-4d9d-a155-d162e9201138	7184061452	Rhytham Laphing House	27.6685942	85.32447210000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.912+05:45	Prayag Pokhari to Kumaripati Road	Hakha Tol	Lalitpur	Bagmati Province
d33aa5f0-88d3-435e-984d-b5123c3b5c4d	9626265959	Motay ko momo pasal	27.669302000000002	85.27767750000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.951+05:45	Pukhusi Road	Lachhi	Kathmandu	Bagmati Province
46be141b-c05a-4524-acc3-9c9aced9c1fb	9926729630	Lumbini Momo And Fastfood	27.694559100000003	85.3196659	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.048+05:45	Bhadrakali Marg	Thapathali	Kathmandu	Bagmati Province
eef1ed0c-9c25-4cb4-af13-1cf82aae15c1	9579981720	D Aroma Fast Food	27.671398000000003	85.27644860000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.948+05:45	Nagaon road	Be-kwah-tan	Kathmandu	Bagmati Province
d7e65f43-dfe5-4c20-b03c-cbf00f2ba075	9579983642	Mahalaxmi Cafe	27.671251400000003	85.2773099	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.948+05:45	Chikhu road	Pa-chhin-Dwopa	Kathmandu	Bagmati Province
8c8b95b5-3b3f-4c4f-bf4a-5ecadda808f8	9924350317	Hookah Bar Sekuwa House	27.7164864	85.34650350000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.048+05:45	Kathmandu Ringroad	Maiju Bahal	Kathmandu	Bagmati Province
767666ff-45a6-4c3d-bb48-e324b333bc84	9450093119	Bambooze	27.713252100000002	85.34874520000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.93+05:45	Umakunda Marga	Maiju Bahal	Kathmandu	Bagmati Province
55d7b7af-a0dc-4d40-969f-2b3edb35e2c0	7834239684	Kaldaiko Chiya Pasal	27.723910800000002	85.45471470000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.914+05:45	Hospital Road	Shankharapur	Kathmandu	Bagmati Province
ab87c29a-a5e1-4702-9603-74f4dde6a6d7	9528661121	Crown cafe	27.7187863	85.3464301	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.944+05:45	Kathmandu Ringroad	Gopi Krishna Nagar	Kathmandu	Bagmati Province
39dd3a2c-0305-4422-8948-d202a81fb00b	9528661717	Zoom cafe	27.719725500000003	85.34606210000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.944+05:45	Hospital Marg-1	Bulbulley	Kathmandu	Bagmati Province
cd983c8b-2f39-46b8-bbea-c4798207db55	9528661721	Medicare restaurant	27.7183832	85.3465312	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.944+05:45	Kathmandu Ringroad	Maiju Bahal	Kathmandu	Bagmati Province
6c14301b-7148-426a-a594-9ab10984b4d6	5491473577	Krishna Kitchen and Cottage	28.2269736	83.9434306	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.87+05:45	40DR012	Bhakunde	Pokhara	Gandaki Province
1cb2fa30-6e7a-45d2-9e75-6af5d0548536	5491473579	Gurung Kitchen and Resturent	28.2273913	83.9427835	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.87+05:45	40DR012	Bhakunde	Pokhara	Gandaki Province
5830ebae-c5c7-4ae8-b381-e6b6b6e70a24	5491473585	Duna Tapari	28.2274451	83.94220410000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.87+05:45	40DR012	Bhakunde	Pokhara	Gandaki Province
e058bc49-e0e8-4bbd-a4c4-551b4f1ca363	9899554351	Katiya and Sekuwa Hub	27.678195700000003	85.31538520000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.046+05:45	Pulchowk Jhamsikhel Marga	Dhobighat	Lalitpur	Bagmati Province
14d6329e-10c9-4b1a-8ade-47f8763056b2	9899554352	6th Avenue Restaurant	27.678263400000002	85.315589	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.046+05:45	Pulchowk Jhamsikhel Marga	Dhobighat	Lalitpur	Bagmati Province
43bf3a17-9da8-45be-94a9-052d7d7f06c6	11021430905	Cafe Central	27.7278492	85.3342873	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.143+05:45	Lamtangin Marg	Laligurans Chok	Kathmandu	Bagmati Province
9c454023-0287-46d2-8ad2-2d091865a971	4172699693	Evergreen Garden Reatsurant	27.733186800000002	85.28382300000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.799+05:45	Jamacho Marg	Buddha Chowk	Kathmandu	Bagmati Province
6572b0cd-8e68-4869-83ed-1bf892fa1029	11250412736	Green Chilly Resturant	27.708688300000002	85.4142549	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.145+05:45	F93	sarki tol	Bhaktapur	Bagmati Province
be59f1ce-32c5-446f-aa24-b5beb605a46b	9899532304	Korean BBQ	27.6697048	85.3094342	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.045+05:45	Bhanimandal Sadak	Dhobighat	Lalitpur	Bagmati Province
ec3d8885-8851-4dbc-b659-9f477691e328	9899532305	Nelpa Restaurant	27.669878100000002	85.3092184	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.045+05:45	Bhanimandal Sadak	Dhobighat	Lalitpur	Bagmati Province
af49f97b-91cb-4e26-8d12-92bfb3ce57c4	8333100818	Gautam Restaurant	27.7115347	85.3378579	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.916+05:45	Paneku Marg	Paneku Tol	Kathmandu	Bagmati Province
ee82016c-a150-4da9-9868-eb5c0b7760c9	5100053195	WEB school Canteen	27.716297100000002	85.3816752	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.839+05:45	Ramjanaki Marg	Kageshwori Manohara	Kathmandu	Bagmati Province
315645c0-b530-4c1f-aa92-e4a0a31fed0f	10147414124	Momo King	27.679904500000003	85.3471177	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.129+05:45	Himali Marg	Basuki Nagar	Kathmandu	Bagmati Province
f9e85caf-2a23-4693-9471-4eafed8d4d1a	4814824509	Himalayan Resturant	28.166254300000002	84.11605390000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.83+05:45	F162	Sundarindanda	Pokhara	Gandaki Province
7b70db90-84c9-4e13-bdb0-b8556d92c1f1	5981559530	Woodland Cafe	27.729428700000003	85.36038590000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.892+05:45	F84	Tenzing Chok	Kathmandu	Bagmati Province
d1bf84c5-04e9-476f-8e14-822d4746ff14	3375011137	Mid Point View Resort	27.647813300000003	85.2828561	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.766+05:45	Dakchhinkali Road	Taudaha	Kathmandu	Bagmati Province
b6bc4135-62f3-4ede-9eda-92b687eb30ea	9724477007	Center Point Food Drinks And Music	27.6500011	85.281153	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.969+05:45	Dakchhinkali Road	Taudaha	Kathmandu	Bagmati Province
f6be8863-f0a8-44fb-a9e3-85b47650293a	11701253229	Miraz	27.719391400000003	85.36128430000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.151+05:45	Baudhadwar Marg	Pati Tar	Kathmandu	Bagmati Province
e96a03ca-da83-49d2-8bb1-02dde0ae787b	10058752058	Naya Everest Momo Centre	27.683204800000002	85.3864872	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.113+05:45	F86	\N	Bhaktapur	Bagmati Province
5e1d4cb4-1ef7-4c7d-91e2-ccc943fe48cc	1904166494	Melting pot	27.6745695	85.3256173	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.705+05:45	Swotha Road	Swotha	Lalitpur	Bagmati Province
1f6c79e7-9088-448f-9d7c-54ba2bd5a37a	10006391719	Habibi Restaurant and BBQ	27.7383074	85.3248339	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.071+05:45	Rambabu Marg	Tokha	Kathmandu	Bagmati Province
7a086ff5-26e0-4f5d-b08c-7fefce1809c8	10017182690	Famous Laphing and Keema Noodles Center	27.745931300000002	85.31713590000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.103+05:45	F81	Baniyatar	Kathmandu	Bagmati Province
b91cf71b-360d-4a55-8b94-a5c6855dd7b2	10017252927	The Burger House and Crunchy Fried Chicken	27.7390697	85.3141083	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.103+05:45	F81	Deepjyoti	Kathmandu	Bagmati Province
5d28b129-1736-4fde-b585-93b742e1ce2d	10058752061	New Shandar Momo Centre	27.6832092	85.38654480000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.113+05:45	F86	\N	Bhaktapur	Bagmati Province
ee2376a3-e5e0-4262-ad39-4399c66ca0ea	10058752070	Bhimsen Momo Centre	27.6832591	85.38696800000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.113+05:45	F86	\N	Bhaktapur	Bagmati Province
5516c00d-589c-4fcf-9807-e15a0145a1b9	10010983354	Black Eyes Cafe and Restaurant	27.7397841	85.32344780000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.081+05:45	Pragati Marg	Tokha	Kathmandu	Bagmati Province
8567c500-fd93-45b4-9652-5d2cceaabfa2	10701237339	Kaffee Codes	27.688903800000002	85.3278908	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.137+05:45	Ram Marg	\N	Kathmandu	Bagmati Province
2150acc9-0a05-4762-badb-63eea016dc37	675712062	Manna Cafe	27.678298	85.31229610000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.689+05:45	Pulchowk Jhamsikhel Marga	Dhobighat	Lalitpur	Bagmati Province
11592666-4fe6-4058-baae-93cc7d7bf014	708987886	Delima Garden	27.7153737	85.3097712	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.689+05:45	Saat Ghumti Marg	Paknajol	Kathmandu	Bagmati Province
9fe325e7-ba14-4049-ae2d-347e8d1dd4ca	2086875765	Tea Time Bamboostan	28.211984700000002	83.9572861	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.725+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
e1c3d0c8-a826-405b-b40e-e86556239f20	2086912233	Bamboo Kitchen	28.2114417	83.9557649	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.725+05:45	Fewa Walkway	Baidam	Pokhara	Gandaki Province
54b2eccc-5e05-4782-b40f-ec68239ec2f4	2087062615	KTM Thakali	28.208196100000002	83.9591156	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.725+05:45	13th Street (Barahi Path)	Baidam	Pokhara	Gandaki Province
2ec0b88d-4846-4f53-86f4-c0aa9820183e	2087062716	Bakery Shop	28.2083544	83.9586036	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.725+05:45	13th Street (Barahi Path)	Baidam	Pokhara	Gandaki Province
3cb425a9-5b47-4d80-b7e8-77ec0ff4da8b	10171520926	Wow Popcorn	27.703038900000003	85.30752770000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.13+05:45	Jhochhen Tol	\N	Kathmandu	Bagmati Province
ddd041c0-96b2-4ec5-8c64-8da568786961	10186037317	Selfie Food Cafe	27.7469311	85.347852	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.13+05:45	Golfutar Residential Road	Golphutar	Kathmandu	Bagmati Province
bdfc3670-e514-474d-81ec-f0be63ec73d0	9422552917	Hamro Numbur Sekuwa Corner	27.717344100000002	85.3421527	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.929+05:45	Chabahil Ganesh Marg	Binayak Tol	Kathmandu	Bagmati Province
5fa21c2d-b0f0-49b8-916e-6a686525234a	10701256279	Cake station	27.688673	85.3282727	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.137+05:45	Ganga Devi Marg	Thapa Gaun	Kathmandu	Bagmati Province
6c8bb908-aec7-42d3-8949-e9980e03ad20	10110783808	Tandoori and Bhojanalaya	27.677223	85.39830500000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.115+05:45	RadheRadhe Road	Madhyapur Thimi	Bhaktapur	Bagmati Province
bbfe2059-d67e-4b5b-b64e-c16293511f3f	10110783814	Urmi Coffee and Food Land	27.677525900000003	85.3984478	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.116+05:45	RadheRadhe Road	Madhyapur Thimi	Bhaktapur	Bagmati Province
023e9650-35bd-4c5f-85cf-e39dced1bea5	10110783816	The WIngs Factory	27.6778157	85.3985377	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.116+05:45	RadheRadhe Road	Madhyapur Thimi	Bhaktapur	Bagmati Province
eb787e45-c4bb-4cd1-ae80-fec67e08cc99	10121417263	Hamro Piro Momo Center and Fast Food	27.6847256	85.3474405	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.12+05:45	Munibhairab Marg	Basuki Nagar	Kathmandu	Bagmati Province
8f18e751-6bce-4ddf-b137-8bb26b6761c5	9574695712	Junge Daiko Khaja Pasal	27.6703787	85.2792981	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.948+05:45	Karki Gaun Marga	Yaka-Chhen	Kathmandu	Bagmati Province
ad2adde2-e0ef-4ab7-b8d4-2d3a06ac12e9	3092671527	Besmullah	27.717439600000002	85.3122819	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.752+05:45	Thamel Marg	Lut Chok	Kathmandu	Bagmati Province
676220a4-7b34-4688-9520-311587394710	4994207640	Swotha Cafe	27.6743349	85.3258481	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.836+05:45	Swotha Road	Swotha	Lalitpur	Bagmati Province
ad488cd5-238c-40f6-84f1-806333cf5c30	4754408623	Busy Bean	27.6772801	85.3091608	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.823+05:45	Bakhundol	Dhobighat	Lalitpur	Bagmati Province
646d517f-aeb4-45f7-9783-23c62c7e9138	4800813796	All in One Cafe	28.212965	83.9577654	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.829+05:45	Street 17 (Lalupate Marg)	Baidam	Pokhara	Gandaki Province
ab99aa91-f823-4feb-aa84-72141b37f86d	4800813797	Beautiful View Inn	28.212232200000003	83.95957170000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.829+05:45	Street 17 (Lalupate Marg)	Baidam	Pokhara	Gandaki Province
4681becc-e2da-4da7-99b5-725b4a6983c1	10015534439	Gurung Momo Center and Restaurant	27.7477465	85.3177034	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.096+05:45	F81	Baluwapati Chowk	Kathmandu	Bagmati Province
222b6731-ea50-4290-9486-4953b6a7000f	10010845110	Nepal Sweets And Chat House	27.7409196	85.3214686	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.081+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
c5372f48-c456-467c-a68d-34fc4fdb818c	8832648317	Cafe MAA	27.6889867	85.28658890000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.923+05:45	Sunar Gau Marg	Kalanki	Kathmandu	Bagmati Province
023873f0-de93-4fdb-a2db-746c7fee7d53	11192795811	Chiba Cafe	27.6587548	85.34595610000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.145+05:45	Gwarko-Lamatar	Mahalaxmi	Lalitpur	Bagmati Province
f686d291-0068-4d50-bc08-3de0d4be0779	4172777600	Namaste Restaurant	28.206318500000002	83.99529290000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.799+05:45	Prithvi Rajmarga	Shiva Tol	Pokhara	Gandaki Province
6dcb2c44-0136-4a96-becc-1d24b7b34bb5	1280030194	Alex Restaurant	28.168975500000002	84.1123292	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.692+05:45	F162	Sundarindanda	Pokhara	Gandaki Province
65d14395-7dab-4df0-8979-5515bff1a35c	4240722996	Bajeko Sekuwa	27.6976507	85.3285431	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.805+05:45	Tanka Prasad Ghumti Sadak	Ghattekulo	Kathmandu	Bagmati Province
16151850-9601-4bff-a7f9-a7b66b428313	4785999327	Hill Top Lodge and Resturant	28.2451957	83.9485033	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.825+05:45	Main Street	Garjati	Pokhara	Gandaki Province
c008b90b-8902-4298-8e68-dee0fd3c8018	8697036336	Bon Appetit Cafe And Restaurant	27.714987200000003	85.31021960000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.921+05:45	Chaksibari Marg	Lut Chok	Kathmandu	Bagmati Province
b35ceecd-fda8-44ee-bff5-79230028cc05	8699925696	Timur Thakali	27.7146048	85.31068280000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.921+05:45	Paryatan Marg	Lut Chok	Kathmandu	Bagmati Province
a5b3a4f1-113d-44bd-992d-0cd7ccdad166	5481817813	Sedi Cafe and Restaurant	28.224598500000003	83.9508153	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.868+05:45	40DR012	\N	Pokhara	Gandaki Province
96f6f1fb-64d7-4872-9501-1bb71bf81fc1	5481817814	Sarose Resturant	28.224871500000003	83.9503581	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.868+05:45	Sedi Bagar	\N	Pokhara	Gandaki Province
e40b15b1-e76e-46e9-88cc-5372353b576e	5481706662	Delight Restaurant	28.2106463	83.9622884	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.868+05:45	Street 41 (School Patan Marg)	Baidam	Pokhara	Gandaki Province
67195f63-d3f0-465a-aefa-e60752299b4a	5481817808	Tara Fast Food and Resturant	28.224730800000003	83.9494602	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.868+05:45	Khapaudi Road	\N	Pokhara	Gandaki Province
2c8287ee-abdc-4f0e-89f4-81dac138c611	10029807836	Food Avenue Restaurant and Cafe	27.6890481	85.36926530000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.107+05:45	F89	\N	Kathmandu	Bagmati Province
10a445b1-c28f-4fc2-97ed-4ca52fce91bb	10108155298	burger house and crunchy fried chicken	27.6885063	85.37023570000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.115+05:45	SanoThimi-Bode	Naagdesh (Nagadesh)	Bhaktapur	Bagmati Province
c4b0521c-5e6d-40b1-b769-36652c08c06a	10053049223	Parisama Bhojanalaya	27.674232500000002	85.388238	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.111+05:45	Araniko Highway	\N	Bhaktapur	Bagmati Province
d707e7d1-2336-4c17-ab5e-86d85b4f703b	10053049231	Malta Newari Khaja And Special Jhol Momo	27.674552000000002	85.3873643	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.111+05:45	Araniko Highway	\N	Bhaktapur	Bagmati Province
094f7cd6-6e37-4711-bfad-d75fa8494b60	8696338123	Lanzhou Lamian	27.712296900000002	85.31218360000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.918+05:45	Jyatha Marg	Lut Chok	Kathmandu	Bagmati Province
d1929f98-dcf9-4524-b8b0-8cae48e1b82c	10009137479	The Burger House and Crunchy Fried Chicken	27.746975600000003	85.32412120000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.074+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
50c83e8a-93df-41ae-931c-17bece519500	2005876038	Imago Dei	27.716353	85.3250673	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.717+05:45	Nag Pokhari Sadak	Kamalpokhari	Kathmandu	Bagmati Province
20e49adb-3a2b-42ae-922b-f1a07e99805a	5457975861	Lahure Restaurant	28.1896136	83.95857500000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.861+05:45	Siddhartha Highway	Belghari	Pokhara	Gandaki Province
2b567418-2628-4862-ad8f-9f7659bdb332	10027754859	The Burger House And Crunchy Fried Chicken	27.658324500000003	85.3463167	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.107+05:45	Gwarko-Lamatar	Mahalaxmi	Lalitpur	Bagmati Province
9d180d59-e29d-4583-abb8-518246867fc8	9722257763	NIS Cafe	27.666944	85.2664196	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.968+05:45	Pushpalal Marg	San-la	Kathmandu	Bagmati Province
9dc40ee1-1ee9-4359-84e2-b8e9036731f0	10050868005	Burger King And Crunchy Fried Chicken	27.689422500000003	85.3896247	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.111+05:45	Bode to Purano Thimi	Naagdesh (Nagadesh)	Bhaktapur	Bagmati Province
938a282c-362b-4946-8388-994e4f224df2	10052922351	Araniko Staff Bhojanalaya	27.674369000000002	85.38877310000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.111+05:45	Araniko Highway	\N	Bhaktapur	Bagmati Province
ca357fd3-50d0-45a2-88bd-58451f94a24f	10050956440	Dharaney Numbari Sekuwa Corner	27.6791565	85.3981018	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.111+05:45	RadheRadhe Road	Madhyapur Thimi	Bhaktapur	Bagmati Province
d7c77aaa-c964-4c82-9f65-49e3b5fca91a	9899557704	Gaule Chulo	27.6856152	85.3071474	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.046+05:45	Sanepa marg	Bakhundol	Lalitpur	Bagmati Province
d3595dca-6841-4597-a671-0d76223035ba	3700722704	Daalchini Food Juction	28.2235465	83.98888740000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.785+05:45	Deurali Galli	Chipledhunga	Pokhara	Gandaki Province
3b8dfbdd-1b75-40a9-b1fb-cdfb3ed5936f	4922436094	Nepal GO	27.711718400000002	85.3119867	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.833+05:45	Jyatha Marg	Lut Chok	Kathmandu	Bagmati Province
8e9b957b-2f81-4309-b300-b57fdb8d4ee3	10121424452	New Cafe	27.680794900000002	85.3449721	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.122+05:45	Mahadevasthan Marg	Basuki Nagar	Kathmandu	Bagmati Province
860265d8-38ea-44d8-adbf-e85d87df33c1	10804288847	Natraj Hotel	27.7263109	85.32334970000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.141+05:45	Lazimpat Sadak	Narayan Tole	Kathmandu	Bagmati Province
a356f6d1-31fd-4496-b076-0831d1395bd8	5469375647	Lumle Kande Restaurant	28.2249221	83.9812225	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.863+05:45	Parsyang-Chipledhunga Road	\N	Pokhara	Gandaki Province
e70b31f9-8ba3-47a0-82ee-23d1c5579674	5469375659	Nisa Restaurant	28.229428900000002	83.9877	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.863+05:45	Tersapatti Road	\N	Pokhara	Gandaki Province
deb64a17-3715-41ab-889f-19f94f91dcf1	11933627866	Special Dahi Bhandar	27.6703535	85.42859130000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.157+05:45	kwachhen	Aadarsha	Bhaktapur	Bagmati Province
c5d6566c-e620-47cf-b9cc-c0b1dd9ee792	4160825734	fastfood	28.238062900000003	83.98424650000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.798+05:45	bindawasini temple steps	\N	Pokhara	Gandaki Province
76ac2a29-bd2c-41ff-8757-7866763c2ee5	3365537206	The Ship	27.717212200000002	85.3129873	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.765+05:45	Amrit Marg	Lut Chok	Kathmandu	Bagmati Province
256eb3f6-f21e-446f-9dd9-24d4ea51f205	3366665677	Corner Cafe	27.715040000000002	85.3298055	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.765+05:45	Tangal Marg	Mali Gaun	Kathmandu	Bagmati Province
ffc87810-b988-4120-ba87-1bfc648d1716	1894281692	Firewood Pizza and Thakali Restaurant	27.681488100000003	85.31754910000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.703+05:45	Pulchok Marg	Pulchowk	Lalitpur	Bagmati Province
59aeb3f5-f321-4532-835b-a8ccae2c79be	4160825733	Early Bird Momo House	28.241694300000002	83.9864756	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.798+05:45	Tundikhel Stairs	Bhimkalipatan Chowk	Pokhara	Gandaki Province
e637d714-ebef-47b8-a62e-066a2fa6779b	9969484655	Syanko Katti Roll	27.705740700000003	85.3188001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.062+05:45	Baghbazar Sadak	Baghbazar	Kathmandu	Bagmati Province
d0c684db-4c54-45e0-bc9a-cf28ac3b097c	10058752027	Madhyapur Tiffin House	27.6829083	85.3882801	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.113+05:45	F86	\N	Bhaktapur	Bagmati Province
de315846-e4e9-4c0b-b8af-c924b3480874	9612717726	Gamcha Village Inn	27.670657000000002	85.26152710000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.95+05:45	Pushpalal Marg	San-la	Kathmandu	Bagmati Province
7b47ae73-6d4f-4106-a4db-8cb5230e5b73	3144951827	Royal Penguin	27.711857400000003	85.30914990000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.752+05:45	J.P. Road	Paknajol	Kathmandu	Bagmati Province
f35970bf-fb4d-4238-9641-a9ca857a1d0c	3151971232	Prem Sekuwa Center and Bhojanalya Center	27.704800100000003	85.3225955	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.752+05:45	Putali Sadak	Baghbazar	Kathmandu	Bagmati Province
f962cb5f-1bc2-4465-93d0-be2fbb547e76	10050668223	Madhyapur Hospital Canteen	27.672264000000002	85.3878248	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.11+05:45	Araniko Highway	\N	Bhaktapur	Bagmati Province
edaa5d16-53ae-4cd3-aa5e-a4f24aee0517	10050668225	Jamghat Momo and Khana Center	27.672166500000003	85.387782	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.11+05:45	Araniko Highway	\N	Bhaktapur	Bagmati Province
bac59fbb-7ab4-4d2a-ba79-15f5e9b2235d	11343073468	Falcha cafe	27.7029497	85.3075171	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.146+05:45	Jhochhen Tol	\N	Kathmandu	Bagmati Province
3bb1442d-33ae-4062-a69f-01cdde67b7d2	4791139134	Tabemonoya	28.2043293	83.96580630000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.826+05:45	3rd Street	Baidam	Pokhara	Gandaki Province
8a89e4eb-8f71-47a8-8f45-c9657e26f322	4791199891	Fewa Lake Restaurant and Bar	28.204311	83.9648466	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.826+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
a4e47685-0278-44ae-985b-4a83845ddcb2	4791368712	Harbor Restaurant	28.205907300000003	83.9611689	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.828+05:45	Lakeside Marg	Baidam	Pokhara	Gandaki Province
604c5760-2f7f-4297-a764-58c4cecb49f9	9527281355	Harati Momo	27.736189900000003	85.34753660000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.939+05:45	Golfutar Residential Road	Rudramati Chowk	Kathmandu	Bagmati Province
441c43b2-03bf-4832-bb84-71707de8de4b	10121542428	Brunch Cafe	27.685152000000002	85.34601500000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.126+05:45	Munibhairab Marg	Basuki Nagar	Kathmandu	Bagmati Province
bc9c9bf3-0a5f-47a8-a8b1-4505420b9244	10121542434	Palpali Fast Food	27.6849823	85.3464529	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.126+05:45	Munibhairab Marg	Basuki Nagar	Kathmandu	Bagmati Province
afc22724-0b2b-4057-80f1-6b6842458ee8	9999376982	TikTok Resturant	27.6702775	85.35516890000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.069+05:45	Naya Basti Marg	Madhyapur Thimi	Bhaktapur	Bagmati Province
a8cbb901-0a92-4307-a164-50acec0a4e76	3280226571	MM Cyber	27.673482500000002	85.2799798	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.757+05:45	Panga Road	Hanuman Ghat	Kathmandu	Bagmati Province
06cccd67-b246-4226-855a-214a950b11ff	1349680676	Omei	27.7133125	85.31219300000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.693+05:45	Jyatha Marg	Lut Chok	Kathmandu	Bagmati Province
dd15c268-df02-4239-b682-74d196f9b4a9	9655500800	Flame cafe	27.6825547	85.27885300000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.954+05:45	Tyangla Chok Marg	Dwa-pah-cha	Kathmandu	Bagmati Province
d64586c8-af08-45d4-bafa-88c10ec08c79	3634031290	Attic	27.7172024	85.33125310000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.781+05:45	Gahana Pokhari Marga	Kotal Tol 	Kathmandu	Bagmati Province
543679b7-c99b-45c3-ad73-87f8ad2b49dc	5426070121	Food Bank	28.218775200000003	83.98690450000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.858+05:45	New Road	\N	Pokhara	Gandaki Province
6c8e3c14-3c36-4381-b528-f43e2c9ce46a	9708687131	Crossway	27.673409900000003	85.2647137	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.963+05:45	Salyanthan road	Salyansthan	Kathmandu	Bagmati Province
dc2aca0a-4ab8-410b-bc8a-b146d5663137	5603560332	Hotel	28.200541	83.99662880000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.884+05:45	Ram Bazaar	Milan Tol	Pokhara	Gandaki Province
29e07f1c-236d-4ffa-8de1-018d71d4220f	10024794502	Karuna Momo Center	27.683009900000002	85.34343890000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.106+05:45	Subidha Marg	Mahadevasthan	Kathmandu	Bagmati Province
4f197e42-f008-45b7-9bbc-0e02c455cd2a	10032699718	Durbar View Restaurant	27.703655	85.30762320000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.107+05:45	Ganga Path	Makkhan Tol	Kathmandu	Bagmati Province
6c3e74c7-a05e-4660-a7d6-231a98b8e340	10033159308	New Lama Restuarant	27.746183700000003	85.3239521	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.107+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
a68e2ef1-4628-4ff3-8618-1d1e028574c3	10011926516	Cafe Mirmire	27.7421854	85.3292435	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.085+05:45	Kathmandu Ringroad	Narayan Gopal Chowk	Kathmandu	Bagmati Province
6ecf96d2-8586-4a12-b137-2d174d1eecc6	10011817577	Mayaz Kitchen Stall	27.7453219	85.33302160000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.084+05:45	Dhapasi Marg	Tokha	Kathmandu	Bagmati Province
18926a66-b962-42d1-96e3-d2ee845f4da0	6234086140	Coffee Nepal	27.714720300000003	85.31071010000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.898+05:45	Paryatan Marg	Lut Chok	Kathmandu	Bagmati Province
48df7daa-bac0-4c43-b87c-496719b14470	2152934763	Coffee shop	27.711000900000002	85.41579490000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.73+05:45	F95	\N	Bhaktapur	Bagmati Province
fd31b189-fe1d-421b-8347-a534cc33dad7	10048565004	5 Flavours Puchka House and Cafe	27.687048800000003	85.3660511	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.109+05:45	F86	Madhyapur Thimi	Bhaktapur	Bagmati Province
701c0762-3ed2-4538-b2ad-b043d3898b92	10048819942	Michael Grills	27.6851355	85.36642690000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.11+05:45	F86	Madhyapur Thimi	Bhaktapur	Bagmati Province
a9e8705e-065c-4a26-9059-fdad88b348a9	9928590084	Fast Food Restaurant	27.6983427	85.3132128	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.049+05:45	Kanti Path	\N	Kathmandu	Bagmati Province
792ce457-2659-4157-8a15-0e9ae14c9152	9999145672	Saru Shrestha Ramechaap Bhojanalaya	27.6743798	85.35562750000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.067+05:45	Araniko Highway	\N	Bhaktapur	Bagmati Province
4bb8dcff-2dfe-4246-8f9f-b3a4875b39e5	9756341809	Newa Lahana	27.678992100000002	85.27445850000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.972+05:45	Than-ba-hah Lanh	Than-ba-hah	Kathmandu	Bagmati Province
f1d5ab6b-9732-498d-afbe-3c057210abc6	4791411510	BB Resturant	28.206279400000003	83.9648363	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.828+05:45	5th Street	Baidam	Pokhara	Gandaki Province
dd60b1a4-b3a3-4c4f-9821-6f13a54ecd36	11343087078	Freak Street Kaffe	27.7030841	85.30760860000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.146+05:45	Jhochhen Tol	\N	Kathmandu	Bagmati Province
0d68570a-36e1-41b3-96d3-dd9ee85457da	1964972218	Bajeko Sekuwa	27.719562900000003	85.3090686	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.714+05:45	Balaju-Sourkhutte Sadak	Sorakhutte	Kathmandu	Bagmati Province
54dbeca8-465d-4b03-9ef7-6669e76bbffb	5645140802	The Lantern cottage and Restaurant	28.2057298	84.0026244	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.885+05:45	Upakar Marg	Singapure Tol	Pokhara	Gandaki Province
ddcdfca9-4369-4d92-8bfc-eb6615a2fe8c	10048500923	Four Seasons Restaurant	27.6885663	85.3684614	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.109+05:45	F89	\N	Kathmandu	Bagmati Province
5d8c90b4-c6b4-4827-9059-3a1953fe6a22	10048564982	Taplejung Sekuwa Corner	27.686120600000002	85.3653048	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.109+05:45	F86	Madhyapur Thimi	Bhaktapur	Bagmati Province
ed329ee2-9406-4b0e-928a-8640270851de	10048564995	King and Queen Burger	27.6867972	85.36586870000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.109+05:45	F86	Madhyapur Thimi	Bhaktapur	Bagmati Province
a14f561d-9995-413e-bae4-a434fbeb3bf9	4141167689	Cafe	27.701695800000003	85.32686550000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.792+05:45	Goshwara Marg	Bansh Ghari	Kathmandu	Bagmati Province
5c6be88e-cb32-47a0-809f-dad8535f21cb	5520022749	Ruzila Cafe	28.217168100000002	83.9574077	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.873+05:45	Gantavya Marg	Baidam	Pokhara	Gandaki Province
5586e792-aad2-4c03-9559-eb098a968acf	9791809085	Kashi Cafe and Bar	27.6748949	85.2805491	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.974+05:45	Kirtipur Ring Road	Nayabazar	Kathmandu	Bagmati Province
ecfc63ee-3643-435a-b188-b0628930bce3	3506712466	Cinderella	27.7116192	85.312301	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.777+05:45	Amrit marg	Lut Chok	Kathmandu	Bagmati Province
35d85162-9dfa-4b6a-b1ac-040cb2c06f35	1833792724	Nice Momo	27.6767757	85.31724650000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.701+05:45	Labim Mall Marga	Pulchowk	Lalitpur	Bagmati Province
de06e288-086a-4287-a679-c1191534271a	10016136072	Foood Point	27.743858600000003	85.32246500000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.098+05:45	Tokha Sadak	Tokha	Kathmandu	Bagmati Province
0463003d-caee-4021-aaf5-d980f5791a6f	10010983353	GRG Cafe and Restro	27.739689100000003	85.32360080000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.081+05:45	Pragati Marg	Tokha	Kathmandu	Bagmati Province
4f1b9a24-271d-438d-96d6-86c1deb1e608	5470481278	Dikxya Cafe	28.150515400000003	84.07041500000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.864+05:45	Bhandardik Marg	Bhandardik	Pokhara	Gandaki Province
b53cbec0-507e-4a2d-bbf8-153e5d526215	6269230673	merina	27.6959453	85.437869	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:30.898+05:45	Changu Narayan Road	Changunarayan	Bhaktapur	Bagmati Province
072ee98e-1ce9-4e3d-a19a-19223a429187	10017342626	Lokpriya Lumbini Resturant	27.742238200000003	85.33346390000001	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.105+05:45	Samanantar Marg	Narayan Gopal Chowk	Kathmandu	Bagmati Province
847b19df-c31c-442c-b024-01de62720a6d	10017342642	Purbeli Hotel	27.742539700000002	85.333582	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.105+05:45	Dhapasi Marg	Tokha	Kathmandu	Bagmati Province
2ed30fff-bb8b-494f-ae4f-5eee32aaa1e4	10017464364	Aleena Keema Noodles	27.7443762	85.3320781	\N	\N	\N	\N	\N	\N	2024-08-06 16:06:31.105+05:45	Shreetol Marg	Tokha	Kathmandu	Bagmati Province
\.


--
-- Data for Name: placeImage; Type: TABLE DATA; Schema: public; Owner: raspace
--

COPY public."placeImage" (id, "imageUrl", "placeId", "addedBy", description, "createdAt", "cloudinaryId", "isMenu") FROM stdin;
4	https://res.cloudinary.com/dqiqiczlk/image/upload/v1727516618/oeof7vxaddueu3p2azel.png	0d063452-f834-48d4-b926-fc5283e86452	43b3d77e-44e5-4395-a2cd-9d64f48d7262	Chicken	2024-09-28 15:28:38.484+05:45	oeof7vxaddueu3p2azel	f
12	https://res.cloudinary.com/dqiqiczlk/image/upload/v1727853046/w4fzsn4tlegruhyy48fo.jpg	0d063452-f834-48d4-b926-fc5283e86452	43b3d77e-44e5-4395-a2cd-9d64f48d7262	From the ctfs	2024-10-02 12:55:47.018+05:45	w4fzsn4tlegruhyy48fo	f
13	https://res.cloudinary.com/dqiqiczlk/image/upload/v1727853047/yinzflvf3ppigs78sk77.png	0d063452-f834-48d4-b926-fc5283e86452	43b3d77e-44e5-4395-a2cd-9d64f48d7262	From the ctfs	2024-10-02 12:55:47.665+05:45	yinzflvf3ppigs78sk77	f
14	https://res.cloudinary.com/dqiqiczlk/image/upload/v1727853047/fqgneyqhqdlz83dsqlnc.jpg	0d063452-f834-48d4-b926-fc5283e86452	43b3d77e-44e5-4395-a2cd-9d64f48d7262	From the ctfs	2024-10-02 12:55:47.938+05:45	fqgneyqhqdlz83dsqlnc	f
15	https://res.cloudinary.com/dqiqiczlk/image/upload/v1727853047/bihqrx0ydb3hcbwcbuah.jpg	0d063452-f834-48d4-b926-fc5283e86452	43b3d77e-44e5-4395-a2cd-9d64f48d7262	From the ctfs	2024-10-02 12:55:47.94+05:45	bihqrx0ydb3hcbwcbuah	f
16	https://res.cloudinary.com/dqiqiczlk/image/upload/v1727853050/abzoqybtftl6qqccop8p.png	0d063452-f834-48d4-b926-fc5283e86452	43b3d77e-44e5-4395-a2cd-9d64f48d7262	From the ctfs	2024-10-02 12:55:51.012+05:45	abzoqybtftl6qqccop8p	f
17	https://res.cloudinary.com/dqiqiczlk/image/upload/v1728280855/skrsusivp61fgg0xyqy4.webp	0d063452-f834-48d4-b926-fc5283e86452	43b3d77e-44e5-4395-a2cd-9d64f48d7262	MENU	2024-10-07 11:45:56.206+05:45	skrsusivp61fgg0xyqy4	t
18	https://res.cloudinary.com/dqiqiczlk/image/upload/v1728280900/gez2lhlsdsa8vm59c5yg.jpg	0d063452-f834-48d4-b926-fc5283e86452	43b3d77e-44e5-4395-a2cd-9d64f48d7262	MENU	2024-10-07 11:46:40.942+05:45	gez2lhlsdsa8vm59c5yg	t
19	https://res.cloudinary.com/dqiqiczlk/image/upload/v1728280900/wg5ltx76yoqcoco6wru6.jpg	0d063452-f834-48d4-b926-fc5283e86452	43b3d77e-44e5-4395-a2cd-9d64f48d7262	MENU	2024-10-07 11:46:41.013+05:45	wg5ltx76yoqcoco6wru6	t
20	https://res.cloudinary.com/dqiqiczlk/image/upload/v1728280901/kumeb5glm2m9mxmgzdtu.webp	0d063452-f834-48d4-b926-fc5283e86452	43b3d77e-44e5-4395-a2cd-9d64f48d7262	MENU	2024-10-07 11:46:41.665+05:45	kumeb5glm2m9mxmgzdtu	t
21	https://res.cloudinary.com/dqiqiczlk/image/upload/v1728283735/rhtox55lus8grjo9ygom.jpg	0d063452-f834-48d4-b926-fc5283e86452	43b3d77e-44e5-4395-a2cd-9d64f48d7262	MENU	2024-10-07 12:33:56.28+05:45	rhtox55lus8grjo9ygom	t
22	https://res.cloudinary.com/dqiqiczlk/image/upload/v1728283736/qst82lymlprbxgodrclb.webp	0d063452-f834-48d4-b926-fc5283e86452	43b3d77e-44e5-4395-a2cd-9d64f48d7262	MENU	2024-10-07 12:33:57.132+05:45	qst82lymlprbxgodrclb	t
23	https://res.cloudinary.com/dqiqiczlk/image/upload/v1728283736/uzlgvboew4tgbikkvnzs.jpg	0d063452-f834-48d4-b926-fc5283e86452	43b3d77e-44e5-4395-a2cd-9d64f48d7262	MENU	2024-10-07 12:33:57.133+05:45	uzlgvboew4tgbikkvnzs	t
25	https://res.cloudinary.com/dqiqiczlk/image/upload/v1728284822/c4nlapj2rrnedr1quo1o.png	0d063452-f834-48d4-b926-fc5283e86452	43b3d77e-44e5-4395-a2cd-9d64f48d7262	MENU	2024-10-07 12:52:03.312+05:45	c4nlapj2rrnedr1quo1o	t
\.


--
-- Data for Name: post; Type: TABLE DATA; Schema: public; Owner: raspace
--

COPY public.post (id, "authorId", body, "imageUrl", "likeCount", "placeId", "createdAt", rating) FROM stdin;
c3bafcc7-646c-4ea0-9583-3aae312cc39d	9664807e-ac7e-48c3-b5cb-c201a8cd73b0	I rate the pizza 3 stars only as it was below average in taste	https://res.cloudinary.com/dqiqiczlk/image/upload/v1724070036/z4yxcplfquf52bkfduga.jpg	1	0d063452-f834-48d4-b926-fc5283e86452	2024-08-19 18:05:37.427+05:45	3
a76d5f09-2736-4640-88e0-ad19618e5fac	9664807e-ac7e-48c3-b5cb-c201a8cd73b0	Excellent in taste. The price was too high tho	https://res.cloudinary.com/dqiqiczlk/image/upload/v1723994945/w2dquf2ztbn2vhkuw6fs.jpg	1	f0257f12-87e6-4218-914b-33862fc50e7f	2024-08-18 21:14:06.342+05:45	4
\.


--
-- Data for Name: postBookmark; Type: TABLE DATA; Schema: public; Owner: raspace
--

COPY public."postBookmark" (id, "userId", "postId", "createdAt") FROM stdin;
\.


--
-- Data for Name: postLike; Type: TABLE DATA; Schema: public; Owner: raspace
--

COPY public."postLike" ("likerId", "postId") FROM stdin;
9664807e-ac7e-48c3-b5cb-c201a8cd73b0	c3bafcc7-646c-4ea0-9583-3aae312cc39d
9664807e-ac7e-48c3-b5cb-c201a8cd73b0	a76d5f09-2736-4640-88e0-ad19618e5fac
\.


--
-- Data for Name: search; Type: TABLE DATA; Schema: public; Owner: raspace
--

COPY public.search (id, user_id, created_at, query) FROM stdin;
1	9664807e-ac7e-48c3-b5cb-c201a8cd73b0	2024-07-30 19:03:17.07+05:45	taj
\.


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: raspace
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- Data for Name: user_; Type: TABLE DATA; Schema: public; Owner: raspace
--

COPY public.user_ (id, "firstName", "lastName", password, email, "createdAt", "profilePictureUrl", "moderationLvl", bio, "isOAuth2Account") FROM stdin;
9664807e-ac7e-48c3-b5cb-c201a8cd73b0	Russ	Hanneman	$2a$10$wkw3/8X4AA9IRwAEcd/5j.pO0yY.tiqk2BHfm1jQJK8xzDjCkr7L6	khapungbj84@gmail.com	2024-08-07 17:24:24.83+05:45	https://res.cloudinary.com/dqiqiczlk/image/upload/v1723816217/h6grwkmwkdvp1vpmjth2.jpg	2	hola	f
8e404c7f-e7b1-42b7-b90c-e5d3fe11ba14	Bijay	Khapung	OAUTH2_NULL	bijaykhapung39@gmail.com	2024-08-23 16:38:46.03+05:45	https://lh3.googleusercontent.com/a/ACg8ocKp9aIYBR7CTC-AQ0pw6v4C-ArlURAPMT1i53NO6k2qJP0vuQ=s96-c	0	\N	t
16878827-83f8-4032-ae19-97e23da0bd40	volatile	colors	OAUTH2_NULL	volatilecolors@gmail.com	2024-08-23 16:40:17.246+05:45	https://lh3.googleusercontent.com/a/ACg8ocIgQPFI2ldBcmE3N3F1qdMz4CFPJoMop-0Rkvex97ujR07bqQ=s96-c	0	\N	t
1cbe8398-8bbd-4a87-b58b-88332aad780b	bagaicha		OAUTH2_NULL	frombagaicha@gmail.com	2024-08-29 19:32:28.116+05:45	https://lh3.googleusercontent.com/a/ACg8ocKA0_0Yxg-JyEAJe3Yov3PvlAdr20KwEb8GeS7A0oh4pN0VdA=s96-c	0	\N	t
43b3d77e-44e5-4395-a2cd-9d64f48d7262	bijay	khapung	$2a$10$t36PlQHwynIMxQSeMj3a6u79yqafmQkdn/nZIzmxt32Xi99xC6Deq	bijay@gmail.com	2024-08-07 17:24:24.83+05:45	https://t3.ftcdn.net/jpg/02/10/49/86/360_F_210498655_ywivjjUe6cgyt52n4BxktRgDCfFg8lKx.jpg	2	\N	f
\.


--
-- Name: operatingHour_id_seq; Type: SEQUENCE SET; Schema: public; Owner: raspace
--

SELECT pg_catalog.setval('public."operatingHour_id_seq"', 28, true);


--
-- Name: placeImage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: raspace
--

SELECT pg_catalog.setval('public."placeImage_id_seq"', 25, true);


--
-- Name: search_id_seq; Type: SEQUENCE SET; Schema: public; Owner: raspace
--

SELECT pg_catalog.setval('public.search_id_seq', 1, true);


--
-- Name: comment comment_pkey; Type: CONSTRAINT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_pkey PRIMARY KEY (id);


--
-- Name: haversineCache haversineCache_lat1_lon1_lat2_lon2_key; Type: CONSTRAINT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public."haversineCache"
    ADD CONSTRAINT "haversineCache_lat1_lon1_lat2_lon2_key" UNIQUE (lat1, lon1, lat2, lon2);


--
-- Name: notification notification_pkey; Type: CONSTRAINT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_pkey PRIMARY KEY (id);


--
-- Name: operatingHour operatingHour_pkey; Type: CONSTRAINT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public."operatingHour"
    ADD CONSTRAINT "operatingHour_pkey" PRIMARY KEY (id);


--
-- Name: ownershipRequest ownershipRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public."ownershipRequest"
    ADD CONSTRAINT "ownershipRequest_pkey" PRIMARY KEY (id);


--
-- Name: placeImage placeImage_pkey; Type: CONSTRAINT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public."placeImage"
    ADD CONSTRAINT "placeImage_pkey" PRIMARY KEY (id);


--
-- Name: place place_pkey; Type: CONSTRAINT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public.place
    ADD CONSTRAINT place_pkey PRIMARY KEY (id);


--
-- Name: post post_pkey; Type: CONSTRAINT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT post_pkey PRIMARY KEY (id);


--
-- Name: search search_pkey; Type: CONSTRAINT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public.search
    ADD CONSTRAINT search_pkey PRIMARY KEY (id);


--
-- Name: commentLike uniqueLikerComment; Type: CONSTRAINT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public."commentLike"
    ADD CONSTRAINT "uniqueLikerComment" UNIQUE ("likerId", "commentId");


--
-- Name: postLike uniqueLikerPost; Type: CONSTRAINT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public."postLike"
    ADD CONSTRAINT "uniqueLikerPost" UNIQUE ("likerId", "postId");


--
-- Name: operatingHour uniqueOperatingHour; Type: CONSTRAINT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public."operatingHour"
    ADD CONSTRAINT "uniqueOperatingHour" UNIQUE (day, "placeId");


--
-- Name: postBookmark uniquePostBookmark; Type: CONSTRAINT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public."postBookmark"
    ADD CONSTRAINT "uniquePostBookmark" UNIQUE ("userId", "postId");


--
-- Name: user_ user__email_key; Type: CONSTRAINT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public.user_
    ADD CONSTRAINT user__email_key UNIQUE (email);


--
-- Name: user_ user__pkey; Type: CONSTRAINT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public.user_
    ADD CONSTRAINT user__pkey PRIMARY KEY (id);


--
-- Name: idxPlaceId; Type: INDEX; Schema: public; Owner: raspace
--

CREATE INDEX "idxPlaceId" ON public.place USING btree (id);


--
-- Name: placeImage fkAddedBy; Type: FK CONSTRAINT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public."placeImage"
    ADD CONSTRAINT "fkAddedBy" FOREIGN KEY ("addedBy") REFERENCES public.user_(id);


--
-- Name: post fkAuthor; Type: FK CONSTRAINT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT "fkAuthor" FOREIGN KEY ("authorId") REFERENCES public.user_(id);


--
-- Name: comment fkAuthor; Type: FK CONSTRAINT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT "fkAuthor" FOREIGN KEY ("authorId") REFERENCES public.user_(id);


--
-- Name: commentLike fkComment; Type: FK CONSTRAINT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public."commentLike"
    ADD CONSTRAINT "fkComment" FOREIGN KEY ("commentId") REFERENCES public.comment(id);


--
-- Name: notification fkComment; Type: FK CONSTRAINT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "fkComment" FOREIGN KEY ("commentId") REFERENCES public.comment(id) ON DELETE CASCADE;


--
-- Name: postLike fkLiker; Type: FK CONSTRAINT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public."postLike"
    ADD CONSTRAINT "fkLiker" FOREIGN KEY ("likerId") REFERENCES public.user_(id);


--
-- Name: commentLike fkLiker; Type: FK CONSTRAINT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public."commentLike"
    ADD CONSTRAINT "fkLiker" FOREIGN KEY ("likerId") REFERENCES public.user_(id);


--
-- Name: place fkOwnedBy; Type: FK CONSTRAINT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public.place
    ADD CONSTRAINT "fkOwnedBy" FOREIGN KEY ("ownedBy") REFERENCES public.user_(id);


--
-- Name: post fkPlace; Type: FK CONSTRAINT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT "fkPlace" FOREIGN KEY ("placeId") REFERENCES public.place(id) ON DELETE CASCADE;


--
-- Name: ownershipRequest fkPlace; Type: FK CONSTRAINT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public."ownershipRequest"
    ADD CONSTRAINT "fkPlace" FOREIGN KEY ("placeId") REFERENCES public.place(id) ON DELETE CASCADE;


--
-- Name: placeImage fkPlace; Type: FK CONSTRAINT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public."placeImage"
    ADD CONSTRAINT "fkPlace" FOREIGN KEY ("placeId") REFERENCES public.place(id);


--
-- Name: operatingHour fkPlace; Type: FK CONSTRAINT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public."operatingHour"
    ADD CONSTRAINT "fkPlace" FOREIGN KEY ("placeId") REFERENCES public.place(id);


--
-- Name: postLike fkPost; Type: FK CONSTRAINT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public."postLike"
    ADD CONSTRAINT "fkPost" FOREIGN KEY ("postId") REFERENCES public.post(id) ON DELETE CASCADE;


--
-- Name: postBookmark fkPost; Type: FK CONSTRAINT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public."postBookmark"
    ADD CONSTRAINT "fkPost" FOREIGN KEY ("postId") REFERENCES public.post(id) ON DELETE CASCADE;


--
-- Name: comment fkPost; Type: FK CONSTRAINT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT "fkPost" FOREIGN KEY ("postId") REFERENCES public.post(id) ON DELETE CASCADE;


--
-- Name: notification fkPost; Type: FK CONSTRAINT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "fkPost" FOREIGN KEY ("postId") REFERENCES public.post(id) ON DELETE CASCADE;


--
-- Name: notification fkRecipient; Type: FK CONSTRAINT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "fkRecipient" FOREIGN KEY ("recipientId") REFERENCES public.user_(id);


--
-- Name: ownershipRequest fkRequestedBy; Type: FK CONSTRAINT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public."ownershipRequest"
    ADD CONSTRAINT "fkRequestedBy" FOREIGN KEY ("requestedBy") REFERENCES public.user_(id);


--
-- Name: notification fkSender; Type: FK CONSTRAINT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "fkSender" FOREIGN KEY ("senderId") REFERENCES public.user_(id);


--
-- Name: postBookmark fkUser; Type: FK CONSTRAINT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public."postBookmark"
    ADD CONSTRAINT "fkUser" FOREIGN KEY ("userId") REFERENCES public.user_(id);


--
-- Name: search fk_user; Type: FK CONSTRAINT; Schema: public; Owner: raspace
--

ALTER TABLE ONLY public.search
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.user_(id);


--
-- PostgreSQL database dump complete
--

