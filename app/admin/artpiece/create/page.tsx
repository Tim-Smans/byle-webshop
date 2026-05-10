import CreateArtPiece from "@/components/admin/artpiece/create-or-update"
import { isAdmin } from "@/lib/auth/admin-auth"

const CreateArtPiecePage = async () => {
    const admin = await isAdmin();

    if (!admin) {
        return (
            <h1 className="text-5xl sm:text-3xl lg:text-5xl font-light tracking-tight text-oker p-50 text-balance">
                This Page is only accesible in ADMIN mode!
            </h1>
        )
    }

    return (
        <>
            <CreateArtPiece id={''} isEditMode={false}/>
        </>
    )
}

export default CreateArtPiecePage