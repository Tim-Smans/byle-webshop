-- Removes the Etsy URL column. IRREVERSIBLE: the stored Etsy links are lost.
--
-- Run only after 005 (the functions no longer use the column). The code
-- that is live today keeps working: it treats a missing etsyUrl as "no
-- Etsy link".

alter table public."ArtPiece" drop column if exists "etsyUrl";
