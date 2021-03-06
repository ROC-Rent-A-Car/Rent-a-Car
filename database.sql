--
-- PostgreSQL database dump
--

-- Dumped from database version 14.1
-- Dumped by pg_dump version 14.1

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
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cars; Type: TABLE; Schema: public; Owner: SMJS
--

CREATE TABLE public.cars (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    license character varying(64) NOT NULL,
    brand character varying(255) NOT NULL,
    model character varying(255) NOT NULL,
    price numeric(5,2) NOT NULL,
    image text DEFAULT './resources/cars/placeholder.png'::text NOT NULL,
    description text
    disabled boolean DEFAULT false NOT NULL
);


ALTER TABLE public.cars OWNER TO "SMJS";

--
-- Name: rent_items; Type: TABLE; Schema: public; Owner: SMJS
--

CREATE TABLE public.rent_items (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    rent uuid NOT NULL,
    car uuid NOT NULL,
    days integer NOT NULL,
    rent_from timestamp without time zone NOT NULL,
    setup boolean DEFAULT false NOT NULL,
    price numeric(5,2) NOT NULL,
    returned boolean DEFAULT false
);


ALTER TABLE public.rent_items OWNER TO "SMJS";

--
-- Name: rents; Type: TABLE; Schema: public; Owner: SMJS
--

CREATE TABLE public.rents (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "user" uuid NOT NULL,
    pending boolean DEFAULT true NOT NULL,
    pending_since timestamp without time zone DEFAULT now()
);


ALTER TABLE public.rents OWNER TO "SMJS";

--
-- Name: users; Type: TABLE; Schema: public; Owner: SMJS
--

CREATE TABLE public.users (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    username character varying(64) NOT NULL,
    password_hash character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(64) NOT NULL,
    postal_code character varying(64) NOT NULL,
    perm_level smallint DEFAULT 0 NOT NULL,
    token character varying(255) NOT NULL,
    token_expiration timestamp without time zone NOT NULL,
    house_number character varying(64) NOT NULL,
);


ALTER TABLE public.users OWNER TO "SMJS";

--
-- Name: cars cars_license_key; Type: CONSTRAINT; Schema: public; Owner: SMJS
--

ALTER TABLE ONLY public.cars
    ADD CONSTRAINT cars_license_key UNIQUE (license);


--
-- Name: cars cars_pkey; Type: CONSTRAINT; Schema: public; Owner: SMJS
--

ALTER TABLE ONLY public.cars
    ADD CONSTRAINT cars_pkey PRIMARY KEY (uuid);


--
-- Name: rent_items rentItem_pkey; Type: CONSTRAINT; Schema: public; Owner: SMJS
--

ALTER TABLE ONLY public.rent_items
    ADD CONSTRAINT "rentItem_pkey" PRIMARY KEY (uuid);


--
-- Name: rents rents_pkey; Type: CONSTRAINT; Schema: public; Owner: SMJS
--

ALTER TABLE ONLY public.rents
    ADD CONSTRAINT rents_pkey PRIMARY KEY (uuid);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: SMJS
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: SMJS
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (uuid);


--
-- Name: users users_token_key; Type: CONSTRAINT; Schema: public; Owner: SMJS
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_token_key UNIQUE (token);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: SMJS
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: fki_rentItem_car_fkey; Type: INDEX; Schema: public; Owner: SMJS
--

CREATE INDEX "fki_rentItem_car_fkey" ON public.rent_items USING btree (car);


--
-- Name: fki_rents_user_fkey; Type: INDEX; Schema: public; Owner: SMJS
--

CREATE INDEX fki_rents_user_fkey ON public.rents USING btree ("user");


--
-- Name: rent_items rentItem_car_fkey; Type: FK CONSTRAINT; Schema: public; Owner: SMJS
--

ALTER TABLE ONLY public.rent_items
    ADD CONSTRAINT "rentItem_car_fkey" FOREIGN KEY (car) REFERENCES public.cars(uuid) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: rent_items rentItem_rent_fkey; Type: FK CONSTRAINT; Schema: public; Owner: SMJS
--

ALTER TABLE ONLY public.rent_items
    ADD CONSTRAINT "rentItem_rent_fkey" FOREIGN KEY (rent) REFERENCES public.rents(uuid) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: rents rents_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: SMJS
--

ALTER TABLE ONLY public.rents
    ADD CONSTRAINT rents_user_fkey FOREIGN KEY ("user") REFERENCES public.users(uuid) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: SMJS
--

REVOKE ALL ON SCHEMA public FROM postgres;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO "SMJS";
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

