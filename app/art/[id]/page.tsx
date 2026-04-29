import ArtDetailContent from "@/components/art-piece-details/art-details-content";

export default async function Page({
  params,
}: {
  params: { id: string }
}) {
    const {id} = await params;

    return (
    <ArtDetailContent id={id} />
  );
}