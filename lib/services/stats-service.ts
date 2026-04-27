'use server'

import { Statistic } from "@/components/dialogs/edit-statistics";
import { supabase } from "../supabase/client"
import { isAdmin } from "../auth/admin-auth";

export const getStats = async (): Promise<Statistic[] | undefined> => {
    if (!isAdmin) {
        return undefined;
    }

    const { data: stats } = await supabase.from('Stats').select();

    console.log(stats)
    if (!stats) {
        return undefined
    }

    return [...stats]
}

export const saveStatistics = async (stats: Statistic[]) => {
    if (!isAdmin) {
        return;
    }

    const { error } = await supabase
        .from('Stats')
        .upsert(stats)
    if (error) {
        throw error
    }
}