--
-- PostgreSQL database dump
--

\restrict BiBXDly0W6JrWace4zjmndLOtZweEufpNB9O5frD0OdETdjqPV8VCOntSeNYoa0

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: areas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.areas (id, name, city, boundary_lat_min, boundary_lat_max, boundary_lng_min, boundary_lng_max, center_lat, center_lng, created_at) FROM stdin;
1	Shivajinagar	Nanded	\N	\N	\N	\N	19.155	77.307	2026-04-09 19:31:30.801997
2	CIDCO Colony	Nanded	\N	\N	\N	\N	19.145	77.325	2026-04-09 19:31:30.801997
3	Vazirabad	Nanded	\N	\N	\N	\N	19.165	77.335	2026-04-09 19:31:30.801997
4	Asarjan	Nanded	\N	\N	\N	\N	19.14	77.295	2026-04-09 19:31:30.801997
5	Vishnupuri	Nanded	\N	\N	\N	\N	19.17	77.355	2026-04-09 19:31:30.801997
6	Naganpura	Nanded	\N	\N	\N	\N	19.132	77.312	2026-04-09 19:31:30.801997
7	New Nanded	Nanded	\N	\N	\N	\N	19.185	77.31	2026-04-09 19:31:30.801997
8	Degloor Naka	Nanded	\N	\N	\N	\N	19.15	77.37	2026-04-09 19:31:30.801997
9	Kasba	Nanded	\N	\N	\N	\N	19.16	77.297	2026-04-09 19:31:30.801997
10	Huzur	Nanded	\N	\N	\N	\N	19.175	77.325	2026-04-09 19:31:30.801997
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password_hash, phone, role, trust_level, status, strike_count, area_id, city, state_code, rto_code, created_at, updated_at) FROM stdin;
MH01C0000006	test_user	test_ce4cd641@test.com	$2a$10$VsdzlcxyezmxksBrokEtCOtThvTRA2w24eWjwuNcYZf3iHxjqwD1y	\N	CITIZEN	NORMAL	ACTIVE	0	\N	Mumbai	MH	01	2026-04-10 09:25:07.229642	2026-04-10 09:25:07.229642
MH16A0000001	admin	admin@citywatch.in	$2a$10$6SIsUbUJbL.5ZG.uZdyEK.gLXSpgtc9dVqteNRDQBv2vufMTi8yL2	\N	ADMIN	NORMAL	ACTIVE	0	\N	Nanded	MH	16	2026-04-09 19:31:30.804565	2026-04-10 10:35:03.145692
MH16M0000001	ravi_p	ravi@citywatch.in	$2a$10$6SIsUbUJbL.5ZG.uZdyEK.gLXSpgtc9dVqteNRDQBv2vufMTi8yL2	\N	COORDINATOR	NORMAL	ACTIVE	0	1	Nanded	MH	16	2026-04-09 19:31:30.808811	2026-04-10 10:35:03.154425
MH16M0000002	sunita_d	sunita@citywatch.in	$2a$10$6SIsUbUJbL.5ZG.uZdyEK.gLXSpgtc9dVqteNRDQBv2vufMTi8yL2	\N	COORDINATOR	NORMAL	ACTIVE	0	2	Nanded	MH	16	2026-04-09 19:31:30.808811	2026-04-10 10:35:03.162742
MH16M0000003	vazir_coord	vazir@citywatch.in	$2a$10$6SIsUbUJbL.5ZG.uZdyEK.gLXSpgtc9dVqteNRDQBv2vufMTi8yL2	\N	COORDINATOR	NORMAL	ACTIVE	0	3	Nanded	MH	16	2026-04-10 09:59:35.040954	2026-04-10 10:35:03.167785
MH16C0000001	citizen1	c1@gmail.com	$2a$10$6SIsUbUJbL.5ZG.uZdyEK.gLXSpgtc9dVqteNRDQBv2vufMTi8yL2	\N	CITIZEN	NORMAL	ACTIVE	0	\N	Nanded	MH	16	2026-04-09 19:31:30.809341	2026-04-10 10:35:03.170861
MH16C0000002	citizen2	c2@gmail.com	$2a$10$6SIsUbUJbL.5ZG.uZdyEK.gLXSpgtc9dVqteNRDQBv2vufMTi8yL2	\N	CITIZEN	NORMAL	ACTIVE	0	\N	Nanded	MH	16	2026-04-09 19:31:30.809341	2026-04-10 10:35:03.174468
MH16C0000003	citizen3	c3@gmail.com	$2a$10$6SIsUbUJbL.5ZG.uZdyEK.gLXSpgtc9dVqteNRDQBv2vufMTi8yL2	\N	CITIZEN	NORMAL	ACTIVE	0	\N	Nanded	MH	16	2026-04-09 19:31:30.809341	2026-04-10 10:35:03.174468
MH16C0000004	citizen4	c4@gmail.com	$2a$10$6SIsUbUJbL.5ZG.uZdyEK.gLXSpgtc9dVqteNRDQBv2vufMTi8yL2	\N	CITIZEN	NORMAL	ACTIVE	0	\N	Nanded	MH	16	2026-04-09 19:31:30.809341	2026-04-10 10:35:03.178717
MH16C0000005	citizen5	c5@gmail.com	$2a$10$6SIsUbUJbL.5ZG.uZdyEK.gLXSpgtc9dVqteNRDQBv2vufMTi8yL2	\N	CITIZEN	NORMAL	ACTIVE	0	\N	Nanded	MH	16	2026-04-09 19:31:30.809341	2026-04-10 10:35:03.178717
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, user_id, action, entity_type, entity_id, old_value, new_value, ip_address, "timestamp") FROM stdin;
\.


--
-- Data for Name: complaints; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.complaints (id, citizen_id, area_id, category, description, latitude, longitude, status, intensity_score, priority, assigned_coordinator_id, sla_deadline, escalation_level, reopen_count, created_at, updated_at, closed_at) FROM stdin;
CMP-100426-000006	MH16C0000001	3	POTHOLE	Series of small potholes making the commute very bumpy near Vazirabad Naka.	19.1565	77.317	PENDING_REVIEW	0	MEDIUM	\N	\N	0	0	2026-04-08 19:31:30.81	2026-04-10 10:28:28.302757	\N
CMP-100426-000007	MH16C0000002	3	STREETLIGHT	Blinking streetlight at the intersection is very distracting at night.	19.1548	77.3132	PENDING_REVIEW	0	LOW	\N	\N	0	0	2026-04-08 07:31:30.81	2026-04-10 10:28:28.302757	\N
CMP-100426-000008	MH16C0000003	3	DRAINAGE	Foul smell coming from the open drain near the residential colony.	19.1502	77.312	PENDING_REVIEW	0	MEDIUM	\N	\N	0	0	2026-04-07 19:31:30.81	2026-04-10 10:28:28.302757	\N
CMP-100426-000009	MH16C0000004	3	POTHOLE	Deep crater formed after recent heavy pipeline work.	19.1558	77.3152	PENDING_REVIEW	0	CRITICAL	\N	\N	0	0	2026-04-06 19:31:30.81	2026-04-10 10:28:28.305096	\N
CMP-100426-000010	MH16C0000005	3	OTHER	Unauthorised parking blocking the main entry gate of the area.	19.1538	77.313	PENDING_REVIEW	0	LOW	\N	\N	0	0	2026-04-05 19:31:30.81	2026-04-10 10:28:28.306105	\N
CMP-100426-000001	MH16C0000001	3	POTHOLE	Large pothole near Vazirabad main market has caused two motorcycle accidents this week. Road is broken near the junction.	19.1535	77.3128	PENDING_REVIEW	2.302585092994046	HIGH	\N	\N	0	0	2026-04-09 18:31:30.81	2026-04-10 10:28:28.297795	\N
CMP-100426-000002	MH16C0000002	3	GARBAGE	Garbage pile-up near Vazirabad Square main gate — bins not cleared for 6 days. Foul smell affecting the entire market block.	19.1542	77.314	PENDING_REVIEW	2.302585092994046	HIGH	\N	\N	0	0	2026-04-09 16:31:30.81	2026-04-10 10:28:28.300124	\N
CMP-100426-000003	MH16C0000003	3	STREETLIGHT	Entire lane behind the main complex has no working streetlights.	19.1528	77.3145	PENDING_REVIEW	0	HIGH	\N	\N	0	0	2026-04-09 14:31:30.81	2026-04-10 10:28:28.300656	\N
CMP-100426-000004	MH16C0000004	3	DRAINAGE	Blocked storm drain near Vazirabad Post Office — stagnant water overflowing. Residents are worried about health hazards.	19.155	77.3115	PENDING_REVIEW	0	CRITICAL	\N	\N	0	0	2026-04-09 11:31:30.81	2026-04-10 10:28:28.300656	\N
CMP-100426-000005	MH16C0000005	3	GARBAGE	Illegal dumping of construction waste on the sidewalk.	19.1515	77.3105	PENDING_REVIEW	0	LOW	\N	\N	0	0	2026-04-09 07:31:30.81	2026-04-10 10:28:28.30176	\N
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comments (id, complaint_id, user_id, content, parent_id, is_moderated, created_at) FROM stdin;
CMT-100426-000001	CMP-100426-000001	MH16M0000001	Team dispatched to assess road damage. Repair work begins tomorrow morning.	\N	\N	2026-04-10 10:12:30.58228
CMT-100426-000002	CMP-100426-000001	MH16C0000001	Thank you! The pothole is very dangerous at night, especially for two-wheelers.	\N	\N	2026-04-10 10:12:30.588607
\.


--
-- Data for Name: complaint_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.complaint_images (complaint_id, image_url) FROM stdin;
CMP-100426-000001	https://images.unsplash.com/photo-1549413215-673e4b097205?q=80&w=800
CMP-100426-000002	https://images.unsplash.com/photo-1605600659908-0ef719419d41?q=80&w=800
CMP-100426-000004	https://images.unsplash.com/photo-1546198632-9ef6368bef12?q=80&w=800
CMP-100426-000006	https://images.unsplash.com/photo-1667317980667-9d5ed99f829e?q=80&w=800
CMP-100426-000009	https://images.unsplash.com/photo-1515162816999-a0ca6751f2a3?q=80&w=800
\.


--
-- Data for Name: complaint_upvotes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.complaint_upvotes (complaint_id, citizen_id) FROM stdin;
CMP-100426-000001	MH16A0000001
CMP-100426-000002	MH16A0000001
\.


--
-- Data for Name: escalations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.escalations (id, complaint_id, level, reason, notes, is_resolved, triggered_at, resolved_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, title, message, type, reference_id, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: proofs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proofs (id, complaint_id, coordinator_id, image_url, latitude, longitude, distance_from_complaint, is_location_valid, submitted_at) FROM stdin;
\.


--
-- Data for Name: sla_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sla_config (id, category, sla_hours, created_by, updated_at) FROM stdin;
1	GARBAGE	72	MH16A0000001	2026-04-09 19:31:30.806617
2	POTHOLE	168	MH16A0000001	2026-04-09 19:31:30.806617
3	STREETLIGHT	96	MH16A0000001	2026-04-09 19:31:30.806617
4	DRAINAGE	96	MH16A0000001	2026-04-09 19:31:30.806617
5	OTHER	168	MH16A0000001	2026-04-09 19:31:30.806617
\.


--
-- Data for Name: votes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.votes (id, complaint_id, coordinator_id, decision, comment, voted_at) FROM stdin;
\.


--
-- Name: areas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.areas_id_seq', 10, true);


--
-- Name: cw_audit_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cw_audit_seq', 1, false);


--
-- Name: cw_comment_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cw_comment_seq', 1, false);


--
-- Name: cw_complaint_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cw_complaint_seq', 10, true);


--
-- Name: cw_escalation_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cw_escalation_seq', 1, false);


--
-- Name: cw_notification_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cw_notification_seq', 1, false);


--
-- Name: cw_proof_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cw_proof_seq', 1, false);


--
-- Name: cw_user_a_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cw_user_a_seq', 1, true);


--
-- Name: cw_user_c_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cw_user_c_seq', 6, true);


--
-- Name: cw_user_m_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cw_user_m_seq', 2, true);


--
-- Name: cw_vote_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cw_vote_seq', 1, false);


--
-- Name: sla_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sla_config_id_seq', 5, true);


--
-- PostgreSQL database dump complete
--

\unrestrict BiBXDly0W6JrWace4zjmndLOtZweEufpNB9O5frD0OdETdjqPV8VCOntSeNYoa0

