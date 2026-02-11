--
-- PostgreSQL database dump
--

\restrict G3sgNFeuWF58ga4jTrhq5OkeBQQ1tnDToWsoqn7wd6hypn3ArqDcup5ce2v45C9

-- Dumped from database version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)

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
-- Name: enum_Bolsos_frequency; Type: TYPE; Schema: public; Owner: ahorro_user
--

CREATE TYPE public."enum_Bolsos_frequency" AS ENUM (
    'weekly',
    'biweekly',
    'monthly'
);


ALTER TYPE public."enum_Bolsos_frequency" OWNER TO ahorro_user;

--
-- Name: enum_Payments_status; Type: TYPE; Schema: public; Owner: ahorro_user
--

CREATE TYPE public."enum_Payments_status" AS ENUM (
    'partial',
    'paid'
);


ALTER TYPE public."enum_Payments_status" OWNER TO ahorro_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Bolsos; Type: TABLE; Schema: public; Owner: ahorro_user
--

CREATE TABLE public."Bolsos" (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    frequency public."enum_Bolsos_frequency" DEFAULT 'weekly'::public."enum_Bolsos_frequency",
    "startDate" date NOT NULL,
    duration integer DEFAULT 10,
    amount numeric(10,2) DEFAULT 30,
    schedule jsonb DEFAULT '[]'::jsonb,
    archived boolean DEFAULT false,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Bolsos" OWNER TO ahorro_user;

--
-- Name: Participants; Type: TABLE; Schema: public; Owner: ahorro_user
--

CREATE TABLE public."Participants" (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    turn integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "bolsoId" uuid,
    "payoutDate" date,
    "payoutAmount" numeric(10,2),
    "payoutReference" character varying(255),
    "payoutCurrency" character varying(255) DEFAULT 'USD'::character varying,
    "payoutExchangeRate" numeric(10,2),
    "payoutAmountBs" numeric(20,2)
);


ALTER TABLE public."Participants" OWNER TO ahorro_user;

--
-- Name: Payments; Type: TABLE; Schema: public; Owner: ahorro_user
--

CREATE TABLE public."Payments" (
    id uuid NOT NULL,
    "scheduledDate" date NOT NULL,
    "paidAt" timestamp with time zone,
    "amountPaid" numeric(10,2) DEFAULT 0,
    status public."enum_Payments_status" DEFAULT 'partial'::public."enum_Payments_status",
    reference character varying(255),
    currency character varying(255) DEFAULT 'USD'::character varying,
    "exchangeRate" numeric(10,2),
    "amountBs" numeric(10,2),
    "receiptStatus" character varying(255) DEFAULT 'generated'::character varying,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "bolsoId" uuid,
    "participantId" uuid
);


ALTER TABLE public."Payments" OWNER TO ahorro_user;

--
-- Data for Name: Bolsos; Type: TABLE DATA; Schema: public; Owner: ahorro_user
--

COPY public."Bolsos" (id, name, frequency, "startDate", duration, amount, schedule, archived, "createdAt", "updatedAt") FROM stdin;
00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	Bolso de ahorro en €	weekly	2026-01-17	10	30.00	["2026-01-17", "2026-01-24", "2026-01-31", "2026-02-07", "2026-02-14", "2026-02-21", "2026-02-28", "2026-03-07", "2026-03-14", "2026-03-21"]	f	2026-02-02 13:36:52.369+01	2026-02-02 13:36:52.369+01
\.


--
-- Data for Name: Participants; Type: TABLE DATA; Schema: public; Owner: ahorro_user
--

COPY public."Participants" (id, name, turn, "createdAt", "updatedAt", "bolsoId", "payoutDate", "payoutAmount", "payoutReference", "payoutCurrency", "payoutExchangeRate", "payoutAmountBs") FROM stdin;
5df1e817-a04d-46eb-9826-ff30a7502876	1) Riveyes 	1	2026-02-02 13:36:52.391+01	2026-02-02 13:45:54.448+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	2026-01-18	300.00	2245567	BS	396.48	118944.00
a2a71c09-8b96-47f0-bb57-7fde40e7bd73	2) Yesenia	2	2026-02-02 13:36:52.391+01	2026-02-02 13:53:02.317+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	2026-02-02	300.00	223456	BS	413.39	124017.00
52f1f82a-fce0-4712-b804-c3b7d59fe8d3	3) Riveyes/Yesenia 	3	2026-02-02 13:36:52.391+01	2026-02-02 13:59:37.169+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	2026-02-02	300.00	34665477	BS	440.48	132144.00
2dc1a82a-9afd-4757-8fb5-060d06e94521	5) Jesus	5	2026-02-02 13:36:52.391+01	2026-02-02 14:00:31.33+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	\N	\N	\N	USD	\N	\N
fc93bc8e-590a-4f4c-8a7b-97b9bc07360f	6) Emy	6	2026-02-02 13:36:52.391+01	2026-02-02 14:00:40.884+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	\N	\N	\N	USD	\N	\N
d8aeaebd-64ad-4634-b901-d74e53a6fe67	7) Mirian	7	2026-02-02 13:36:52.391+01	2026-02-02 14:00:50.481+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	\N	\N	\N	USD	\N	\N
10e89b36-dacf-4af2-b3ad-e3ba4b1adb18	8) Migdalys	8	2026-02-02 13:36:52.391+01	2026-02-02 14:01:07.073+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	\N	\N	\N	USD	\N	\N
502f03c3-4b5e-459f-9914-4ec8e15edc21	10) Nathalie 	10	2026-02-02 13:36:52.391+01	2026-02-02 14:01:30.532+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	\N	\N	\N	USD	\N	\N
07805fe2-a652-4a07-b861-641cd2ec8cf2	9) Yoisi	9	2026-02-02 13:36:52.391+01	2026-02-02 14:01:50.011+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	\N	\N	\N	USD	\N	\N
438a6f51-66bf-45ef-9c62-23489a5f2d88	4) Jorge 	4	2026-02-02 13:36:52.391+01	2026-02-09 17:01:25.193+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	2026-02-09	1200.00		BS	451.88	542256.00
\.


--
-- Data for Name: Payments; Type: TABLE DATA; Schema: public; Owner: ahorro_user
--

COPY public."Payments" (id, "scheduledDate", "paidAt", "amountPaid", status, reference, currency, "exchangeRate", "amountBs", "receiptStatus", "createdAt", "updatedAt", "bolsoId", "participantId") FROM stdin;
961e600c-9ee7-44a9-8b5b-127fb3c9be87	2026-01-17	2026-01-17 01:00:00+01	30.00	paid	23456700	BS	396.48	11894.40	generated	2026-02-02 13:37:42.173+01	2026-02-02 13:37:42.173+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	5df1e817-a04d-46eb-9826-ff30a7502876
2930459d-65cc-4e39-9c86-aba65c5f6a41	2026-01-17	2026-01-17 01:00:00+01	30.00	paid	45679011	BS	396.48	11894.40	generated	2026-02-02 13:38:24.294+01	2026-02-02 13:38:24.294+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	a2a71c09-8b96-47f0-bb57-7fde40e7bd73
e4683ae2-ac33-41f2-a8e1-18a6b4d979e9	2026-01-17	2026-01-17 01:00:00+01	30.00	paid	33546710	BS	396.48	11894.40	generated	2026-02-02 13:39:08.263+01	2026-02-02 13:39:08.263+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	52f1f82a-fce0-4712-b804-c3b7d59fe8d3
480ffb3f-ecf6-4a78-9bc0-32fc504dc323	2026-01-17	2026-01-17 01:00:00+01	30.00	paid	2256600	BS	396.48	11894.40	generated	2026-02-02 13:39:51.045+01	2026-02-02 13:39:51.045+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	438a6f51-66bf-45ef-9c62-23489a5f2d88
7ca8e3d6-d8cd-4add-9252-2712bc755077	2026-01-17	2026-01-17 01:00:00+01	30.00	paid	14234577	BS	396.48	11894.40	generated	2026-02-02 13:40:36.145+01	2026-02-02 13:40:36.145+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	2dc1a82a-9afd-4757-8fb5-060d06e94521
9367e087-e081-4abc-8744-5b6dc534a38a	2026-01-17	2026-01-17 01:00:00+01	30.00	paid	22489901	BS	396.48	11894.40	generated	2026-02-02 13:41:11.828+01	2026-02-02 13:41:11.828+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	fc93bc8e-590a-4f4c-8a7b-97b9bc07360f
a6a6c6f1-272f-448b-8640-78dbcf188f33	2026-01-17	2026-01-17 01:00:00+01	30.00	paid	23458801	BS	396.48	11894.40	generated	2026-02-02 13:41:46.752+01	2026-02-02 13:41:46.752+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	d8aeaebd-64ad-4634-b901-d74e53a6fe67
d5ffc2e7-53a9-4778-aa6f-1db9204bdc65	2026-01-17	2026-01-17 01:00:00+01	30.00	paid	34568812	BS	396.48	11894.40	generated	2026-02-02 13:42:24.229+01	2026-02-02 13:42:24.229+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	10e89b36-dacf-4af2-b3ad-e3ba4b1adb18
1d80cb3d-43a7-48c5-bf44-972685924e02	2026-01-17	2026-01-17 01:00:00+01	30.00	paid	00045671	BS	396.48	11894.40	generated	2026-02-02 13:42:56.196+01	2026-02-02 13:42:56.196+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	07805fe2-a652-4a07-b861-641cd2ec8cf2
472e10e9-d7d3-41b0-b577-af34f80a51a4	2026-01-17	2026-01-17 01:00:00+01	30.00	paid	00001234	BS	396.48	11894.40	generated	2026-02-02 13:43:32.142+01	2026-02-02 13:43:32.142+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	502f03c3-4b5e-459f-9914-4ec8e15edc21
17d7b5a2-c20e-4492-a16d-b67953c73bd2	2026-01-24	2026-01-24 01:00:00+01	30.00	paid	234557	BS	413.39	12401.70	generated	2026-02-02 13:47:10.92+01	2026-02-02 13:47:10.92+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	a2a71c09-8b96-47f0-bb57-7fde40e7bd73
ad8dcb2f-ab0a-4191-a71b-3fb7d3c6c403	2026-01-24	2026-01-24 01:00:00+01	30.00	paid	334567	BS	413.39	12401.70	generated	2026-02-02 13:47:55.031+01	2026-02-02 13:47:55.031+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	52f1f82a-fce0-4712-b804-c3b7d59fe8d3
b3037f58-7c88-4c41-96ae-9765a773180a	2026-01-24	2026-01-24 01:00:00+01	30.00	paid	0076548	BS	413.39	12401.70	generated	2026-02-02 13:48:32.454+01	2026-02-02 13:48:32.454+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	438a6f51-66bf-45ef-9c62-23489a5f2d88
02601728-dab2-4912-a616-a5665cdd8530	2026-01-24	2026-01-24 01:00:00+01	30.00	paid	234578	BS	413.39	12401.70	generated	2026-02-02 13:48:52.626+01	2026-02-02 13:48:52.626+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	2dc1a82a-9afd-4757-8fb5-060d06e94521
c4bb8893-17d8-4673-8eb3-68654d2c0d7a	2026-01-24	2026-01-24 01:00:00+01	30.00	paid	345678	BS	413.39	12401.70	generated	2026-02-02 13:49:16.326+01	2026-02-02 13:49:16.326+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	fc93bc8e-590a-4f4c-8a7b-97b9bc07360f
6c8bd674-7fbb-4eda-9e4e-9e646f2b2f07	2026-01-24	2026-01-24 01:00:00+01	30.00	paid	3446700	BS	413.39	12401.70	generated	2026-02-02 13:49:37.604+01	2026-02-02 13:49:37.604+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	d8aeaebd-64ad-4634-b901-d74e53a6fe67
af9103a0-1c3c-4572-8bc2-8b14cf3450a1	2026-01-24	2026-01-24 01:00:00+01	30.00	paid	2345677	BS	413.39	12401.70	generated	2026-02-02 13:50:05.24+01	2026-02-02 13:50:05.24+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	10e89b36-dacf-4af2-b3ad-e3ba4b1adb18
44b67662-bb05-40b6-b2d7-53504fa26994	2026-01-24	2026-01-24 01:00:00+01	30.00	paid	345678	BS	413.39	12401.70	generated	2026-02-02 13:50:31.123+01	2026-02-02 13:50:31.123+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	07805fe2-a652-4a07-b861-641cd2ec8cf2
f9023333-f6cb-42a4-ae29-5f1906e619c5	2026-01-24	2026-01-24 01:00:00+01	30.00	paid	345678	BS	413.39	12401.70	generated	2026-02-02 13:50:54.928+01	2026-02-02 13:50:54.928+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	5df1e817-a04d-46eb-9826-ff30a7502876
53a7de76-b96e-4e58-a453-54eda10e6642	2026-01-24	2026-01-24 01:00:00+01	30.00	paid	345000	BS	413.39	12401.70	generated	2026-02-02 13:51:19.347+01	2026-02-02 13:51:19.347+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	502f03c3-4b5e-459f-9914-4ec8e15edc21
fb6c6fe3-135e-404e-8dc5-a82105cee0d8	2026-01-31	2026-01-31 01:00:00+01	30.00	paid	2345880	BS	440.48	13214.40	generated	2026-02-02 13:54:42.821+01	2026-02-02 13:54:42.821+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	5df1e817-a04d-46eb-9826-ff30a7502876
3c54fbee-2f33-4641-b764-046de929d1c1	2026-01-31	2026-01-31 01:00:00+01	30.00	paid	00768456	BS	440.48	13214.40	generated	2026-02-02 13:55:24.168+01	2026-02-02 13:55:24.168+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	a2a71c09-8b96-47f0-bb57-7fde40e7bd73
5c687f9a-a66a-4c5b-bd46-84e2b50f7171	2026-01-31	2026-01-31 01:00:00+01	30.00	paid	3456780	BS	440.48	13214.40	generated	2026-02-02 13:55:57.639+01	2026-02-02 13:55:57.639+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	52f1f82a-fce0-4712-b804-c3b7d59fe8d3
747264e1-966d-4c87-9913-f007b21e966b	2026-01-31	2026-01-31 01:00:00+01	30.00	paid	234557	BS	440.48	13214.40	generated	2026-02-02 13:56:46.742+01	2026-02-02 13:56:46.742+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	438a6f51-66bf-45ef-9c62-23489a5f2d88
d04f5ecf-17f0-4622-9084-2e2ddb22c719	2026-01-31	2026-01-31 01:00:00+01	30.00	paid	098645	BS	440.48	13214.40	generated	2026-02-02 13:57:18.566+01	2026-02-02 13:57:18.566+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	fc93bc8e-590a-4f4c-8a7b-97b9bc07360f
3b826128-ca34-4976-bd7b-116b8eda9d11	2026-01-31	2026-01-31 01:00:00+01	30.00	paid	34567899	BS	440.48	13214.40	generated	2026-02-02 13:57:37.823+01	2026-02-02 13:57:37.823+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	d8aeaebd-64ad-4634-b901-d74e53a6fe67
91034846-8d4f-4efb-96cb-8eed31f55c16	2026-01-31	2026-01-31 01:00:00+01	30.00	paid	33455677	BS	440.48	13214.40	generated	2026-02-02 13:57:57.19+01	2026-02-02 13:57:57.19+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	10e89b36-dacf-4af2-b3ad-e3ba4b1adb18
2e8277cd-035c-4515-afe8-f7f0a26aeb46	2026-01-31	2026-01-31 01:00:00+01	30.00	paid	34557800	BS	440.48	13214.40	generated	2026-02-02 13:58:19.082+01	2026-02-02 13:58:19.082+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	07805fe2-a652-4a07-b861-641cd2ec8cf2
b692c30c-b259-46e9-9cf1-6170b83dc4de	2026-01-31	2026-01-31 01:00:00+01	30.00	paid	00876654	BS	440.48	13214.40	generated	2026-02-02 13:58:37.313+01	2026-02-02 13:58:37.313+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	502f03c3-4b5e-459f-9914-4ec8e15edc21
517096f3-e325-468b-80b1-f6478ce8efe5	2026-01-31	2026-02-02 01:00:00+01	30.00	paid	6088048	BS	440.48	13214.40	generated	2026-02-02 23:54:06.759+01	2026-02-02 23:54:06.759+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	2dc1a82a-9afd-4757-8fb5-060d06e94521
e6fb1932-c663-4e33-a053-e1fb7634c843	2026-02-07	2026-02-07 01:00:00+01	30.00	paid	8116233	BS	451.88	13556.40	generated	2026-02-07 13:03:06.128+01	2026-02-07 13:03:06.128+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	502f03c3-4b5e-459f-9914-4ec8e15edc21
0c6ecac4-1568-4c8c-b792-dda6a98c6196	2026-02-07	2026-02-07 01:00:00+01	30.00	paid	1131622	BS	451.88	13556.40	generated	2026-02-07 21:43:07.167+01	2026-02-07 21:43:07.167+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	fc93bc8e-590a-4f4c-8a7b-97b9bc07360f
f40d5220-2a63-4b23-a630-57e59072a3c7	2026-02-07	2026-02-07 01:00:00+01	30.00	paid	00014567	BS	451.88	13556.40	generated	2026-02-07 21:57:46.911+01	2026-02-07 21:57:46.911+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	5df1e817-a04d-46eb-9826-ff30a7502876
80c1c8e4-56fb-4142-a7be-749659878c17	2026-02-07	2026-02-07 01:00:00+01	30.00	paid	895260	BS	451.88	13556.40	generated	2026-02-07 23:56:51.031+01	2026-02-07 23:56:51.031+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	d8aeaebd-64ad-4634-b901-d74e53a6fe67
c52a7a50-5371-4279-8e54-08222dc0ba22	2026-02-07	2026-02-08 01:00:00+01	30.00	paid	157863	BS	451.88	13556.40	generated	2026-02-08 15:09:00.219+01	2026-02-08 15:09:00.219+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	438a6f51-66bf-45ef-9c62-23489a5f2d88
272ff77a-abfb-4baa-b42e-e3be85fed7b4	2026-02-07	2026-02-08 01:00:00+01	30.00	paid	526215	BS	451.88	13556.40	generated	2026-02-08 15:09:58.856+01	2026-02-08 15:09:58.856+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	10e89b36-dacf-4af2-b3ad-e3ba4b1adb18
9c2363ce-e111-4691-b834-02804166e63f	2026-02-07	2026-02-08 01:00:00+01	30.00	paid	313446	BS	451.88	13556.40	generated	2026-02-08 20:35:29.546+01	2026-02-08 20:35:29.546+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	07805fe2-a652-4a07-b861-641cd2ec8cf2
f48ee471-4ff8-4944-be93-934002655ef1	2026-02-07	2026-02-08 01:00:00+01	30.00	paid	645627	BS	451.88	13556.40	generated	2026-02-08 22:11:41.89+01	2026-02-08 22:11:41.89+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	a2a71c09-8b96-47f0-bb57-7fde40e7bd73
6a44de92-835f-4f28-8f77-a73d7b4760ce	2026-02-07	2026-02-08 01:00:00+01	30.00	paid	2235679	BS	451.88	13556.40	generated	2026-02-08 22:13:40.198+01	2026-02-08 22:13:40.198+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	52f1f82a-fce0-4712-b804-c3b7d59fe8d3
484ae154-6954-418d-abc1-594572de2b1f	2026-02-07	2026-02-09 01:00:00+01	30.00	paid	923017	BS	451.88	13556.40	generated	2026-02-09 14:31:50.998+01	2026-02-09 14:31:50.998+01	00840bbb-f4b6-4b7d-8f31-33dfd0e4cbc3	2dc1a82a-9afd-4757-8fb5-060d06e94521
\.


--
-- Name: Bolsos Bolsos_pkey; Type: CONSTRAINT; Schema: public; Owner: ahorro_user
--

ALTER TABLE ONLY public."Bolsos"
    ADD CONSTRAINT "Bolsos_pkey" PRIMARY KEY (id);


--
-- Name: Participants Participants_pkey; Type: CONSTRAINT; Schema: public; Owner: ahorro_user
--

ALTER TABLE ONLY public."Participants"
    ADD CONSTRAINT "Participants_pkey" PRIMARY KEY (id);


--
-- Name: Payments Payments_pkey; Type: CONSTRAINT; Schema: public; Owner: ahorro_user
--

ALTER TABLE ONLY public."Payments"
    ADD CONSTRAINT "Payments_pkey" PRIMARY KEY (id);


--
-- Name: Participants Participants_bolsoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ahorro_user
--

ALTER TABLE ONLY public."Participants"
    ADD CONSTRAINT "Participants_bolsoId_fkey" FOREIGN KEY ("bolsoId") REFERENCES public."Bolsos"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payments Payments_bolsoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ahorro_user
--

ALTER TABLE ONLY public."Payments"
    ADD CONSTRAINT "Payments_bolsoId_fkey" FOREIGN KEY ("bolsoId") REFERENCES public."Bolsos"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payments Payments_participantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ahorro_user
--

ALTER TABLE ONLY public."Payments"
    ADD CONSTRAINT "Payments_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES public."Participants"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict G3sgNFeuWF58ga4jTrhq5OkeBQQ1tnDToWsoqn7wd6hypn3ArqDcup5ce2v45C9

