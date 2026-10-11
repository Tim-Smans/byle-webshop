'use server'

import { Statistic } from "@/components/dialogs/edit-statistics";
import { supabase } from "../supabase/client"
import { isAdmin } from "../auth/admin-auth";
import { createAdminClient } from "../supabase/admin";

const STATS_TABLE = 'Stats'

export const getStats = async (): Promise<Statistic[] | undefined> => {
    const { data: stats } = await supabase.from(STATS_TABLE).select();

    console.log(stats)
    if (!stats) {
        return undefined
    }

    return [...stats]
}

export const saveStatistics = async (stats: Statistic[]) => {
    const authorized = await isAdmin()
    if (!authorized) {
        throw new Error("Unauthorized")
    }

    const supabase = createAdminClient()

    const { data: existing } = await supabase
        .from(STATS_TABLE)
        .select('id')

    const existingIds = existing?.map(x => x.id) ?? []

    const newIds = stats.map(x => x.id)

    const idsToDelete =
        existingIds.filter(
            id => !newIds.includes(id)
        )

    if (idsToDelete.length > 0) {
        await supabase
            .from(STATS_TABLE)
            .delete()
            .in('id', idsToDelete)
    }

    const { error } = await supabase
        .from(STATS_TABLE)
        .upsert(stats)
    if (error) {
        throw error
    }
}