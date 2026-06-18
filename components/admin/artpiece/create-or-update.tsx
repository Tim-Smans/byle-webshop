'use client'

import { FC, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label as LabelComponent } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { v4 as uuidv4 } from "uuid";
import { resizeToWebP } from "@/lib/client/resize-image";
import { Trash2 } from "lucide-react";
import { useFeedback } from "@/lib/context/feedback-context";
import { normalizeLabel } from "@/lib/utils";
import { useRouter } from "next/navigation";
import MDEditor from "@uiw/react-md-editor";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    rectSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface LabelType {
    id: string;
    title: string;
}

interface CollectionType {
    id: string;
    title: string;
    description: string;
}

interface Props {
    isEditMode: boolean
    id: string
}

interface ImageItem {
    id: string;
    type: "existing" | "new";
    url?: string;    // voor bestaande
    file?: File;     // voor nieuwe
}

const AdminCreateArtPiecePage: FC<Props> = ({ id, isEditMode }) => {
    const [loading, setLoading] = useState(false);

    const [labels, setLabels] = useState<LabelType[]>([]);
    const [collections, setCollections] = useState<CollectionType[]>([]);

    const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
    const [newLabel, setNewLabel] = useState("");

    const [collectionId, setCollectionId] = useState<string | null>(null);
    const [newCollectionTitle, setNewCollectionTitle] = useState("");
    const [newCollectionDescription, setNewCollectionDescription] = useState("");

    const [images, setImages] = useState<ImageItem[]>([]);

    const [form, setForm] = useState({
        title: "",
        artist: "Lé",
        dimensions: "",
        price: 0,
        description: "",
        frame: "",
        structure: "",
        presentation: "",
        edition: "",
        finish: "",
        etsyUrl: "",
        shippingInfo: ""
    });

    const { showSuccess, showError } = useFeedback();
    const router = useRouter();

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    useEffect(() => {
        fetchLabels();
        fetchCollections();
    }, []);

    async function fetchLabels() {
        const { data } = await supabase.from("Label").select("*");
        setLabels(data || []);
    }

    async function fetchCollections() {
        const { data } = await supabase.from("Collection").select("*");
        setCollections(data || []);
    }

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files) return;
        const newItems: ImageItem[] = Array.from(e.target.files).map((file) => ({
            id: uuidv4(),
            type: "new" as const,
            file,
        }));
        setImages((prev) => [...prev, ...newItems]);
    }

    async function uploadImages(): Promise<string[]> {
        const urls: string[] = [];
        for (const item of images) {
            if (item.type === "existing" && item.url) {
                urls.push(item.url);
            } else if (item.type === "new" && item.file) {
                const uuid = uuidv4();

                // Generate display (1600px) and thumb (200px) variants client-side via Canvas API
                const [displayBlob, thumbBlob] = await Promise.all([
                    resizeToWebP(item.file, 1600, 0.85),
                    resizeToWebP(item.file, 200, 0.75),
                ]);

                // Upload display version — this URL becomes image.url in the database
                const displayName = `${uuid}.webp`;
                const { error } = await supabase.storage
                    .from("images")
                    .upload(displayName, displayBlob, { contentType: "image/webp" });
                if (error) throw error;

                // Upload thumb — non-critical, ignore failures
                await supabase.storage
                    .from("images")
                    .upload(`${uuid}-t.webp`, thumbBlob, { contentType: "image/webp" })
                    .catch(() => { });

                const { data } = supabase.storage.from("images").getPublicUrl(displayName);
                urls.push(data.publicUrl);
            }
        }
        return urls;
    }

    async function createLabelIfNeeded(): Promise<string[]> {
        let ids = [...selectedLabelIds];

        if (newLabel.trim()) {
            const id = uuidv4();

            const { error } = await supabase.from("Label").insert({
                id,
                title: newLabel
            });

            if (error) throw error;

            ids.push(id);
        }

        return ids;
    }

    async function createCollectionIfNeeded(): Promise<string | null> {
        if (collectionId) return collectionId;

        if (newCollectionTitle.trim()) {
            const id = uuidv4();

            const { error } = await supabase.from("Collection").insert({
                id,
                title: newCollectionTitle,
                description: newCollectionDescription
            });

            if (error) throw error;

            return id;
        }

        return null;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrls: string[] | null = await uploadImages();

            const labelIds = await createLabelIfNeeded();

            const finalCollectionId = await createCollectionIfNeeded();


            if (isEditMode) {
                const { error } = await supabase.rpc("update_art_piece", {
                    p_id: id,
                    p_title: form.title,
                    p_artist: form.artist,
                    p_dimensions: form.dimensions,
                    p_price: form.price,
                    p_description: form.description,
                    p_frame: form.frame,
                    p_structure: form.structure,
                    p_presentation: form.presentation,
                    p_edition: form.edition,
                    p_finish: form.finish,
                    p_etsy_url: form.etsyUrl,
                    p_shipping_info: form.shippingInfo,


                    p_images: imageUrls,
                    p_label_ids: labelIds,

                    p_collection_id: finalCollectionId,

                    p_collection_title: null,
                    p_collection_description: null,
                    p_collection_thumbnail_url: null,
                    p_is_featured: false
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.rpc("create_art_piece", {
                    p_title: form.title,
                    p_artist: form.artist,
                    p_dimensions: form.dimensions,
                    p_price: form.price,
                    p_description: form.description,
                    p_frame: form.frame,
                    p_structure: form.structure,
                    p_presentation: form.presentation,
                    p_edition: form.edition,
                    p_finish: form.finish,
                    p_etsy_url: form.etsyUrl,
                    p_shipping_info: form.shippingInfo,

                    p_images: imageUrls,
                    p_label_ids: labelIds,

                    p_collection_id: finalCollectionId,

                    p_collection_title: null,
                    p_collection_description: null,
                    p_collection_thumbnail_url: null,
                    p_is_featured: false
                });
                if (error) throw error;
            }

            router.push("/");
            showSuccess("Je aanpassingen zijn opgeslagen!")
        } catch (err) {
            console.error(err);
            showError(`Er ging iets mis bij het ${isEditMode ? 'aanpassen' : 'toevoegen'} van een kunstwerk! Contacteer Tim voor meer info :)`)
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (isEditMode) {
            fetchArtPiece();
        }
    }, [id]);

    async function fetchArtPiece() {
        const { data, error } = await supabase
            .from("ArtPiece")
            .select(`
            *,
            PieceLabel(labelId),
            Image(url)
        `)
            .eq("id", id)
            .single();

        if (error) {
            console.error(error);
            return;
        }

        // 🔥 form vullen
        setForm({
            title: data.title,
            artist: data.artist,
            dimensions: data.dimensions,
            price: data.price,
            description: data.description,
            frame: data.frame,
            structure: data.structure,
            presentation: data.presentation,
            edition: data.edition,
            finish: data.finish,
            etsyUrl: data.etsyUrl ?? "",
            shippingInfo: data.shippingInfo ?? ""
        });

        setCollectionId(data.collectionId);
        console.log(data)

        // labels
        setSelectedLabelIds(
            data.PieceLabel.map((l: any) => l.labelId)
        );

        setImages(
            (data.Image || []).map((img: { url: string }) => ({
                id: uuidv4(),
                type: "existing" as const,
                url: img.url,
            }))
        );
    }

    return (
        <div className="w-full px-6 py-8 pt-30">
            <Card className="overflow-hidden">
                <CardContent className="p-8">
                    <h1 className="text-3xl font-semibold mb-10">
                        {isEditMode ? "Update ArtPiece" : "Add ArtPiece"}
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-10">

                        {/* TOP SECTION */}
                        <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.4fr] gap-10 items-start">

                            {/* LEFT SIDE */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                <div>
                                    <LabelComponent>Title</LabelComponent>
                                    <Input
                                        value={form.title}
                                        onChange={(e) =>
                                            setForm({ ...form, title: e.target.value })
                                        }
                                    />
                                </div>

                                <div>
                                    <LabelComponent>Artist</LabelComponent>
                                    <Input
                                        value={form.artist}
                                        onChange={(e) =>
                                            setForm({ ...form, artist: e.target.value })
                                        }
                                    />
                                </div>

                                <div>
                                    <LabelComponent>Price</LabelComponent>
                                    <Input
                                        type="number"
                                        value={form.price}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                price: Number(e.target.value),
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <LabelComponent>Dimensions</LabelComponent>
                                    <Input
                                        value={form.dimensions}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                dimensions: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <LabelComponent>Frame</LabelComponent>
                                    <Input
                                        value={form.frame}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                frame: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <LabelComponent>Structure</LabelComponent>
                                    <Input
                                        value={form.structure}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                structure: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <LabelComponent>Presentation</LabelComponent>
                                    <Input
                                        value={form.presentation}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                presentation: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <LabelComponent>Edition</LabelComponent>
                                    <Input
                                        value={form.edition}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                edition: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <LabelComponent>Finish</LabelComponent>
                                    <Input
                                        value={form.finish}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                finish: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <LabelComponent>Etsy Url</LabelComponent>
                                    <Input
                                        value={form.etsyUrl}
                                        onChange={(e) =>
                                            setForm({ ...form, etsyUrl: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <LabelComponent>Verzendinformatie</LabelComponent>
                                    <Textarea
                                        value={form.shippingInfo}
                                        onChange={(e) =>
                                            setForm({ ...form, shippingInfo: e.target.value })
                                        }
                                        rows={3}
                                        placeholder="bv. Gratis verzending binnen België · €15 naar Nederland"
                                    />
                                </div>

                            </div>

                            {/* RIGHT SIDE */}
                            <div className="min-w-0">
                                <LabelComponent>Description</LabelComponent>

                                <div
                                    data-color-mode="light"
                                    className="mt-2 overflow-hidden rounded-md border"
                                >
                                    <MDEditor
                                        value={form.description}
                                        height={420}
                                        onChange={(value) =>
                                            setForm({
                                                ...form,
                                                description: value || "",
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        {/* BOTTOM SECTION */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">

                            {/* IMAGES */}
                            <div className="space-y-4">
                                <div>
                                    <LabelComponent>Images</LabelComponent>
                                    <Input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="mt-2"
                                    />
                                    <p className="text-sm text-muted-foreground mt-2">
                                        {images.length} file(s) selected
                                    </p>

                                    <DndContext
                                        sensors={useSensors(
                                            useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
                                        )}
                                        collisionDetection={closestCenter}
                                        onDragEnd={({ active, over }) => {
                                            if (over && active.id !== over.id) {
                                                setImages((prev) => {
                                                    const oldIndex = prev.findIndex((i) => i.id === active.id);
                                                    const newIndex = prev.findIndex((i) => i.id === over.id);
                                                    return arrayMove(prev, oldIndex, newIndex);
                                                });
                                            }
                                        }}
                                    >
                                        <SortableContext items={images.map((i) => i.id)} strategy={rectSortingStrategy}>
                                            <div className="grid grid-cols-5 gap-2 mt-3">
                                                {images.map((item, index) => (
                                                    <SortableThumbnail
                                                        key={item.id}
                                                        item={item}
                                                        index={index}
                                                        onRemove={() =>
                                                            setImages((prev) => prev.filter((i) => i.id !== item.id))
                                                        }
                                                    />
                                                ))}
                                            </div>
                                        </SortableContext>
                                    </DndContext>
                                </div>
                            </div>

                            {/* LABELS */}
                            <div className="space-y-4 xl:col-span-1">
                                <div>
                                    <LabelComponent>Labels</LabelComponent>

                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {labels.map((label) => (
                                            <button
                                                type="button"
                                                key={label.id}
                                                className={`
                                                px-3 py-2 rounded-md border text-sm transition
                                                ${selectedLabelIds.includes(label.id)
                                                        ? "font-semibold border-primary"
                                                        : "hover:bg-muted"
                                                    }
                                            `}
                                                onClick={() => {
                                                    setSelectedLabelIds((prev) =>
                                                        prev.includes(label.id)
                                                            ? prev.filter((x) => x !== label.id)
                                                            : [...prev, label.id]
                                                    );
                                                }}
                                            >
                                                {normalizeLabel(label.title)}
                                            </button>
                                        ))}
                                    </div>

                                    <Input
                                        placeholder="Create new label"
                                        value={newLabel}
                                        onChange={(e) =>
                                            setNewLabel(e.target.value)
                                        }
                                        className="mt-4"
                                    />
                                </div>
                            </div>

                            {/* COLLECTION */}
                            <div className="space-y-4">
                                <div>
                                    <LabelComponent>Collection</LabelComponent>

                                    <Select
                                        key={collectionId}
                                        value={collectionId ?? undefined}
                                        onValueChange={(value) =>
                                            setCollectionId(value)
                                        }
                                    >
                                        <SelectTrigger className="mt-2">
                                            <SelectValue placeholder="Select collection" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            {collections.map((c) => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Input
                                        placeholder="Or create new collection: Title"
                                        value={newCollectionTitle}
                                        onChange={(e) =>
                                            setNewCollectionTitle(e.target.value)
                                        }
                                        className="mt-4"
                                    />

                                    <Input
                                        placeholder="Or create new collection: Description"
                                        value={newCollectionDescription}
                                        onChange={(e) =>
                                            setNewCollectionDescription(
                                                e.target.value
                                            )
                                        }
                                        className="mt-4"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SUBMIT */}
                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="min-w-[260px]"
                            >
                                {loading
                                    ? "Opslaan..."
                                    : isEditMode
                                        ? "Update kunstwerk"
                                        : "Maak kunstwerk aan"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

function SortableThumbnail({ item, index, onRemove }: { item: ImageItem; index: number; onRemove: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    const previewUrl =
        item.type === "existing"
            ? item.url!
            : URL.createObjectURL(item.file!);

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="relative cursor-grab active:cursor-grabbing rounded overflow-hidden border border-border aspect-square w-full"
        >
            <img
                src={previewUrl}
                alt=""
                className="w-full h-full object-cover"
                draggable={false}
            />
            <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                }}
                className="absolute top-0.5 right-0.5 bg-black/60 hover:bg-red-600 text-white rounded p-0.5 transition-colors"
            >
                <Trash2 size={10} />
            </button>
            <span className="absolute bottom-0 right-0 bg-black/60 text-white text-[10px] px-1 py-0.5 leading-none rounded-tl">
                {index}
            </span>
        </div>
    );
}
export default AdminCreateArtPiecePage