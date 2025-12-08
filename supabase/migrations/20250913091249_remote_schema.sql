

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


CREATE SCHEMA IF NOT EXISTS "drizzle";

ALTER SCHEMA "drizzle" OWNER TO "postgres";

COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

-- Function to broadcast changes to realtime
CREATE OR REPLACE FUNCTION "public"."broadcast_user_generation_changes"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  PERFORM realtime.broadcast_changes(
    'user_:' || COALESCE(NEW.user_id, OLD.user_id)::TEXT,
    TG_OP,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    OLD
  );
  RETURN NULL;
END;
$$;

ALTER FUNCTION "public"."broadcast_user_generation_changes"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
    "id" integer NOT NULL,
    "hash" "text" NOT NULL,
    "created_at" bigint
);


ALTER TABLE "drizzle"."__drizzle_migrations" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "drizzle"."__drizzle_migrations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "drizzle"."__drizzle_migrations_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "drizzle"."__drizzle_migrations_id_seq" OWNED BY "drizzle"."__drizzle_migrations"."id";

CREATE TABLE IF NOT EXISTS "public"."users_table" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text",
    "name" "text",
    "avatar_url" "text",
    "plan" "text",
    "stripe_id" "text" NOT NULL,
    "credits" integer DEFAULT 5 NOT NULL,
    "isCanceled" boolean DEFAULT false,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."user_generations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "original_image_path" "text",
    "text_prompt" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."generated_images" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "generation_id" "uuid" NOT NULL,
    "image_path" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);

CREATE TABLE IF NOT EXISTS "public"."reference_images" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "generation_id" "uuid" NOT NULL,
    "image_path" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "drizzle"."__drizzle_migrations" OWNER TO "postgres";

ALTER TABLE "public"."users_table" OWNER TO "postgres";

ALTER TABLE "public"."user_generations" OWNER TO "postgres";

ALTER TABLE "public"."generated_images" OWNER TO "postgres";

ALTER TABLE "public"."reference_images" OWNER TO "postgres";

ALTER TABLE ONLY "drizzle"."__drizzle_migrations" ALTER COLUMN "id" SET DEFAULT "nextval"('"drizzle"."__drizzle_migrations_id_seq"'::"regclass");

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = '__drizzle_migrations_pkey'
    ) THEN
        ALTER TABLE ONLY "drizzle"."__drizzle_migrations"
            ADD CONSTRAINT "__drizzle_migrations_pkey" PRIMARY KEY ("id");
    END IF;
END $$;

ALTER TABLE ONLY "public"."users_table"
    ADD CONSTRAINT "users_table_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_generations"
    ADD CONSTRAINT "user_generations_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."generated_images"
    ADD CONSTRAINT "generated_images_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."reference_images"
    ADD CONSTRAINT "reference_images_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_generations"
    ADD CONSTRAINT "user_generations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users_table"("id");

ALTER TABLE ONLY "public"."generated_images"
    ADD CONSTRAINT "generated_images_generation_id_fkey" FOREIGN KEY ("generation_id") REFERENCES "public"."user_generations"("id");

ALTER TABLE ONLY "public"."reference_images"
    ADD CONSTRAINT "reference_images_generation_id_fkey" FOREIGN KEY ("generation_id") REFERENCES "public"."user_generations"("id");

-- Set ON DELETE CASCADE on user_generations.user_id
ALTER TABLE "public"."user_generations"
DROP CONSTRAINT IF EXISTS user_generations_user_id_fkey,
ADD CONSTRAINT user_generations_user_id_fkey
FOREIGN KEY (user_id) REFERENCES "public"."users_table"(id) ON DELETE CASCADE;

-- Set ON DELETE CASCADE on reference_images.generation_id
ALTER TABLE "public"."reference_images"
DROP CONSTRAINT IF EXISTS reference_images_generation_id_fkey,
ADD CONSTRAINT reference_images_generation_id_fkey
FOREIGN KEY (generation_id) REFERENCES "public"."user_generations"(id) ON DELETE CASCADE;

-- Set ON DELETE CASCADE on generated_images.generation_id
ALTER TABLE "public"."generated_images"
DROP CONSTRAINT IF EXISTS generated_images_generation_id_fkey,
ADD CONSTRAINT generated_images_generation_id_fkey
FOREIGN KEY (generation_id) REFERENCES "public"."user_generations"(id) ON DELETE CASCADE;


CREATE OR REPLACE TRIGGER "update_user_generations_updated_at" 
BEFORE UPDATE ON "public"."user_generations" 
FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE OR REPLACE TRIGGER "broadcast_user_generation_insert" 
AFTER INSERT ON "public"."user_generations" 
FOR EACH ROW EXECUTE FUNCTION "public"."broadcast_user_generation_changes"();

CREATE OR REPLACE TRIGGER "broadcast_user_generation_update" 
AFTER UPDATE ON "public"."user_generations" 
FOR EACH ROW EXECUTE FUNCTION "public"."broadcast_user_generation_changes"();

CREATE OR REPLACE TRIGGER "broadcast_user_generation_delete" 
AFTER DELETE ON "public"."user_generations" 
FOR EACH ROW EXECUTE FUNCTION "public"."broadcast_user_generation_changes"();


CREATE POLICY "Enable delete for users based on user_id" ON "public"."user_generations" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable delete for users based on user_id" ON "public"."users_table" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id"));

CREATE POLICY "Enable insert for users based on user_id" ON "public"."user_generations" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable insert for users based on user_id" ON "public"."users_table" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));

CREATE POLICY "Enable users to view their own data only" ON "public"."user_generations" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable users to view their own data only" ON "public"."users_table" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id"));

CREATE POLICY "Users can update their own generations" ON "public"."user_generations" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

ALTER TABLE "public"."user_generations" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."users_table" ENABLE ROW LEVEL SECURITY;

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";

GRANT ALL ON FUNCTION "public"."broadcast_user_generation_changes"() TO "anon";
GRANT ALL ON FUNCTION "public"."broadcast_user_generation_changes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."broadcast_user_generation_changes"() TO "service_role";

GRANT ALL ON TABLE "public"."users_table" TO "anon";
GRANT ALL ON TABLE "public"."users_table" TO "authenticated";
GRANT ALL ON TABLE "public"."users_table" TO "service_role";

GRANT ALL ON TABLE "public"."user_generations" TO "anon";
GRANT ALL ON TABLE "public"."user_generations" TO "authenticated";
GRANT ALL ON TABLE "public"."user_generations" TO "service_role";

GRANT ALL ON TABLE "public"."generated_images" TO "anon";
GRANT ALL ON TABLE "public"."generated_images" TO "authenticated";
GRANT ALL ON TABLE "public"."generated_images" TO "service_role";

GRANT ALL ON TABLE "public"."reference_images" TO "anon";
GRANT ALL ON TABLE "public"."reference_images" TO "authenticated";
GRANT ALL ON TABLE "public"."reference_images" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";

RESET ALL;
