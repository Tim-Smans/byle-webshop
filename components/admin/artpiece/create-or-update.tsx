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
import { useFeedback } from "@/lib/context/feedback-context";
import { useRouter } from "next/navigation";

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

const AdminCreateArtPiecePage: FC<Props> = ({ id, isEditMode }) => {
    const [loading, setLoading] = useState(false);

    const [labels, setLabels] = useState<LabelType[]>([]);
    const [collections, setCollections] = useState<CollectionType[]>([]);

    const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
    const [newLabel, setNewLabel] = useState("");

    const [collectionId, setCollectionId] = useState<string | null>(null);
    const [newCollectionTitle, setNewCollectionTitle] = useState("");
    const [newCollectionDescription, setNewCollectionDescription] = useState("");

    const [images, setImages] = useState<File[]>([]);

    const [form, setForm] = useState({
        title: "",
        artist: "",
        dimensions: "",
        price: 0,
        description: "",
        frame: "",
        structure: "",
        presentation: "",
        edition: "",
        finish: "",
    });

    const { showSuccess, showError } = useFeedback();
    const router = useRouter();

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
        setImages(Array.from(e.target.files));
    }

    async function uploadImages(): Promise<string[]> {
        const urls: string[] = [];

        for (const file of images) {
            const fileName = `${uuidv4()}-${file.name}`;

            const { error } = await supabase.storage
                .from("images")
                .upload(fileName, file);

            if (error) throw error;

            const { data } = supabase.storage
                .from("images")
                .getPublicUrl(fileName);

            urls.push(data.publicUrl);
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
                if (imageUrls.length == 0) {
                    imageUrls = null;
                }

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

                    p_images: imageUrls,
                    p_label_ids: labelIds,

                    p_collection_id: finalCollectionId,

                    p_collection_title: null,
                    p_collection_description: null,
                    p_collection_thumbnail_url: null,
                    p_etsy_url: null,
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

                    p_images: imageUrls,
                    p_label_ids: labelIds,

                    p_collection_id: finalCollectionId,

                    p_collection_title: null,
                    p_collection_description: null,
                    p_collection_thumbnail_url: null,
                    p_etsy_url: null,
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
        });

        setCollectionId(data.collectionId);
        console.log(data)

        // labels
        setSelectedLabelIds(
            data.PieceLabel.map((l: any) => l.labelId)
        );

        // images (optioneel: URLs opslaan)
    }

    return (
        <div className="w-full px-6 py-8 pt-30">
            <Card>
                <CardContent className="p-6 space-y-6">
                    <h1 className="text-2xl font-semibold">Add ArtPiece</h1>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
                                        setForm({ ...form, dimensions: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <LabelComponent>Frame</LabelComponent>
                                <Input
                                    value={form.frame}
                                    onChange={(e) =>
                                        setForm({ ...form, frame: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <LabelComponent>Structure</LabelComponent>
                                <Input
                                    value={form.structure}
                                    onChange={(e) =>
                                        setForm({ ...form, structure: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <LabelComponent>Presentation</LabelComponent>
                                <Input
                                    value={form.presentation}
                                    onChange={(e) =>
                                        setForm({ ...form, presentation: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <LabelComponent>Edition</LabelComponent>
                                <Input
                                    value={form.edition}
                                    onChange={(e) =>
                                        setForm({ ...form, edition: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <LabelComponent>Finish</LabelComponent>
                                <Input
                                    value={form.finish}
                                    onChange={(e) =>
                                        setForm({ ...form, finish: e.target.value })
                                    }

                                />
                            </div>
                        </div>

                        <div>
                            <LabelComponent>Description</LabelComponent>
                            <Textarea
                                rows={4}
                                value={form.description}
                                onChange={(e) =>
                                    setForm({ ...form, description: e.target.value })
                                }
                            />
                        </div>

                        <div>
                            <LabelComponent>Images</LabelComponent>
                            <Input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                            />

                            <p className="text-sm mt-2">
                                {images.length} file(s) selected
                            </p>
                        </div>

                        <div>
                            <LabelComponent>Labels</LabelComponent>

                            <div className="flex flex-wrap gap-2 mt-2">
                                {labels.map((label) => (
                                    <button
                                        type="button"
                                        key={label.id}
                                        className={`px-3 py-1 border rounded ${selectedLabelIds.includes(label.id)
                                            ? "font-bold"
                                            : ""
                                            }`}
                                        onClick={() => {
                                            setSelectedLabelIds((prev) =>
                                                prev.includes(label.id)
                                                    ? prev.filter((x) => x !== label.id)
                                                    : [...prev, label.id]
                                            );
                                        }}
                                    >
                                        {label.title}
                                    </button>
                                ))}
                            </div>

                            <Input
                                placeholder="Create new label"
                                value={newLabel}
                                onChange={(e) => setNewLabel(e.target.value)}
                                className="mt-3"
                            />
                        </div>

                        <div>
                            <LabelComponent>Collection</LabelComponent>

                            <Select
                                key={collectionId}
                                value={collectionId ?? undefined}
                                onValueChange={(value) => setCollectionId(value)}
                            >
                                <SelectTrigger>
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
                                className="mt-3"
                            />
                            <Input
                                placeholder="Or create new collection: Description"
                                value={newCollectionDescription}
                                onChange={(e) =>
                                    setNewCollectionDescription(e.target.value)
                                }
                                className="mt-3"
                            />
                        </div>

                        <Button type="submit" disabled={loading}>
                            {loading ? "Opslaan..." :  
                                isEditMode ?  "Update kunstwerk" : "Maak kunstwerk aan"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default AdminCreateArtPiecePage