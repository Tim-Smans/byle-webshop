-- Rewrites create_art_piece / update_art_piece for the webshop
--
-- - sizeClass (small/large, for shipping) is set in the same transaction
-- - the Etsy URL is no longer stored; p_etsy_url stays as an optional,
--   ignored parameter so the code that is still live keeps working until
--   the new code is deployed
-- - update_art_piece no longer resets "isFeatured" when p_is_featured is
--   null (editing a work used to un-feature it)
-- - the broken older overload of create_art_piece (without
--   p_shipping_info) is removed
--
-- Behaviour is otherwise unchanged. Safe to run multiple times.

begin;

-- Remove every existing overload, so exactly one version of each remains
do $$
declare
  f record;
begin
  for f in
    select p.oid::regprocedure as sig
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname in ('create_art_piece', 'update_art_piece')
  loop
    execute format('drop function %s', f.sig);
  end loop;
end $$;

create function public.create_art_piece(
  p_title                    text,
  p_artist                   text,
  p_dimensions               text,
  p_price                    numeric,
  p_description              text,
  p_frame                    text,
  p_structure                text,
  p_presentation             text,
  p_edition                  text,
  p_finish                   text,
  p_is_featured              boolean,
  p_images                   text[],
  p_label_ids                text[],
  p_collection_id            text,
  p_collection_title         text,
  p_collection_thumbnail_url text,
  p_collection_description   text,
  p_shipping_info            text default null,
  p_size_class               text default 'small',
  p_etsy_url                 text default null  -- ignored, kept for compatibility
)
returns text
language plpgsql
as $$
declare
  v_piece_id      text := gen_random_uuid()::text;
  v_collection_id text;
  v_image         text;
  v_label_id      text;
begin
  if p_collection_id is not null then
    v_collection_id := p_collection_id;
  elsif p_collection_title is not null then
    v_collection_id := gen_random_uuid()::text;
    insert into public."Collection" (id, title, "thumbnailUrl", description)
    values (v_collection_id, p_collection_title, p_collection_thumbnail_url, p_collection_description);
  else
    v_collection_id := null;
  end if;

  insert into public."ArtPiece" (
    id, title, artist, dimensions, price, description, frame, structure,
    presentation, edition, finish, "isFeatured", "isSold", "collectionId",
    "shippingInfo", "sizeClass"
  ) values (
    v_piece_id, p_title, p_artist, p_dimensions, p_price, p_description, p_frame, p_structure,
    p_presentation, p_edition, p_finish, coalesce(p_is_featured, false), false, v_collection_id,
    p_shipping_info, case when p_size_class = 'large' then 'large' else 'small' end
  );

  foreach v_image in array coalesce(p_images, '{}')
  loop
    insert into public."Image" (id, "pieceId", url)
    values (gen_random_uuid()::text, v_piece_id, v_image);
  end loop;

  foreach v_label_id in array coalesce(p_label_ids, '{}')
  loop
    insert into public."PieceLabel" (id, "pieceId", "labelId")
    values (gen_random_uuid()::text, v_piece_id, v_label_id);
  end loop;

  return v_piece_id;
end $$;

create function public.update_art_piece(
  p_id                       text,
  p_title                    text,
  p_artist                   text,
  p_dimensions               text,
  p_price                    numeric,
  p_description              text,
  p_frame                    text,
  p_structure                text,
  p_presentation             text,
  p_edition                  text,
  p_finish                   text,
  p_is_featured              boolean,
  p_images                   text[],
  p_label_ids                text[],
  p_collection_id            text,
  p_collection_title         text,
  p_collection_thumbnail_url text,
  p_collection_description   text,
  p_shipping_info            text default null,
  p_size_class               text default null,
  p_etsy_url                 text default null  -- ignored, kept for compatibility
)
returns void
language plpgsql
as $$
begin
  update public."ArtPiece"
  set
    title = p_title,
    artist = p_artist,
    dimensions = p_dimensions,
    price = p_price,
    description = p_description,
    frame = p_frame,
    structure = p_structure,
    presentation = p_presentation,
    edition = p_edition,
    finish = p_finish,
    -- null keeps the current value (editing must not un-feature a work)
    "isFeatured" = coalesce(p_is_featured, "isFeatured"),
    "collectionId" = p_collection_id,
    "shippingInfo" = p_shipping_info,
    "sizeClass" = case
      when p_size_class in ('small', 'large') then p_size_class
      else "sizeClass"
    end
  where id = p_id;

  -- Labels are only reset when given
  if p_label_ids is not null then
    delete from public."PieceLabel" where "pieceId" = p_id;
    insert into public."PieceLabel" ("pieceId", "labelId")
    select p_id, unnest(p_label_ids);
  end if;

  -- Images are only reset when given
  if p_images is not null then
    delete from public."Image" where "pieceId" = p_id;
    insert into public."Image" ("pieceId", url)
    select p_id, unnest(p_images);
  end if;
end $$;

-- No revoke here on purpose: the admin that is still live calls these
-- functions from the browser. rls-policies.sql locks them to the service
-- role, and is run after the new code (server actions) is deployed.

commit;
