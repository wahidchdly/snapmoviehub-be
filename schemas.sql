CREATE TABLE casts (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name character varying(50) NOT NULL,
    image_id integer REFERENCES images(id) ON DELETE SET NULL,
    created_at timestamp without time zone NOT NULL
);
CREATE UNIQUE INDEX casts_pkey ON casts(id int4_ops);


CREATE VIEW casts_v AS  SELECT ch.name AS "character",
    ch.movie_id,
    ch.main_role,
    ca.name,
    i.image
   FROM characters ch
     LEFT JOIN casts ca ON ch.cast_id = ca.id
     LEFT JOIN images i ON ca.image_id = i.id;


CREATE TABLE categories (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name character varying(50) NOT NULL UNIQUE,
    created_at timestamp without time zone NOT NULL
);
CREATE UNIQUE INDEX categories_pkey ON categories(id int4_ops);
CREATE UNIQUE INDEX categories_title_key ON categories(name text_ops);


CREATE VIEW categories_v AS  SELECT m.id AS movie_id,
    c.name AS category_name
   FROM movie_categories mc
     LEFT JOIN movies m ON mc.movie_id = m.id
     LEFT JOIN categories c ON mc.category_id = c.id;


CREATE TABLE characters (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name character varying(50) NOT NULL,
    movie_id integer REFERENCES movies(id) ON DELETE CASCADE,
    cast_id integer REFERENCES casts(id) ON DELETE CASCADE,
    main_role boolean NOT NULL,
    created_at timestamp without time zone NOT NULL
);
CREATE UNIQUE INDEX characters_pkey ON characters(id int4_ops);


CREATE TABLE images (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name character varying(50) NOT NULL,
    image text NOT NULL UNIQUE,
    created_at timestamp without time zone NOT NULL
);
CREATE UNIQUE INDEX images_pkey ON images(id int4_ops);
CREATE UNIQUE INDEX images_link_key ON images(image text_ops);


CREATE TABLE movie_categories (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    movie_id integer NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    category_id integer NOT NULL REFERENCES categories(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX movie_categories_pkey ON movie_categories(id int4_ops);


CREATE TABLE movies (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name character varying(50) NOT NULL,
    description text NOT NULL,
    featured boolean NOT NULL,
    image_id integer REFERENCES images(id) ON DELETE SET NULL,
    created_at timestamp without time zone NOT NULL
);
CREATE UNIQUE INDEX movies_pkey ON movies(id int4_ops);


CREATE VIEW movies_v AS  SELECT m.id,
    m.name,
    m.description,
    m.created_at,
    ( SELECT i.image
           FROM images i
          WHERE i.id = m.image_id) AS image,
    m.featured,
    COALESCE(casts_v.casts_v, '[]'::json) AS casts_v,
    COALESCE(categories_v.categories_v, '[]'::json) AS categories_v
   FROM movies m
     LEFT JOIN LATERAL ( SELECT json_agg(json_build_object('character', casts_v_1."character", 'main_role', casts_v_1.main_role, 'name', casts_v_1.name, 'image', casts_v_1.image) ORDER BY casts_v_1.main_role) AS casts_v
           FROM casts_v casts_v_1
          WHERE m.id = casts_v_1.movie_id) casts_v ON true
     LEFT JOIN LATERAL ( SELECT json_agg(json_build_object('name', categories_v_1.category_name) ORDER BY categories_v_1.category_name) AS categories_v
           FROM categories_v categories_v_1
          WHERE m.id = categories_v_1.movie_id) categories_v ON true;