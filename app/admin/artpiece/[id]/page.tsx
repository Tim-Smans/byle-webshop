import CreateArtPiece from "@/components/admin/artpiece/create-or-update"
import { isAdmin } from "@/lib/auth/admin-auth"

const UpdateArtPiecePage = async ({
  params,
}: {
  params: { id: string }
}) => {
    const admin = await isAdmin();

    const {id} = await params;

    const artPieceId = id as string | undefined;

    const isEditMode = !!artPieceId;

    if (!admin) {
        return (
            <h1 className="text-5xl sm:text-3xl lg:text-5xl font-light tracking-tight text-oker p-50 text-balance">
                This Page is only accesible in ADMIN mode!
            </h1>
        )
    }

    return (
        <>
            <CreateArtPiece id={artPieceId ?? ''} isEditMode={isEditMode}/>
        </>
    )
}

export default UpdateArtPiecePage