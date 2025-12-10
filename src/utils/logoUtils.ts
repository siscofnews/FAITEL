import { supabase } from "@/integrations/supabase/client";

/**
 * Busca recursivamente o logo da matriz ancestor de uma igreja
 * @param churchId ID da igreja para buscar o logo da matriz
 * @returns URL do logo da matriz ou null se não encontrado
 */
export async function getMatrixLogo(churchId: string): Promise<string | null> {
    try {
        // Usar função SQL que faz busca recursiva
        const { data, error } = await supabase.rpc('get_matrix_logo', {
            p_church_id: churchId
        });

        if (error) {
            console.error("Error getting matrix logo:", error);
            return null;
        }

        return data || null;
    } catch (error) {
        console.error("Error in getMatrixLogo:", error);
        return null;
    }
}

/**
 * Busca informações completas da igreja incluindo logo da matriz
 * @param churchId ID da igreja
 * @returns Objeto com dados da igreja e logo da matriz
 */
export async function getChurchWithMatrixLogo(churchId: string) {
    try {
        // Buscar dados da igreja
        const { data: church, error: churchError } = await supabase
            .from('churches')
            .select('*')
            .eq('id', churchId)
            .single();

        if (churchError) throw churchError;

        // Buscar logo da matriz
        const matrixLogoUrl = await getMatrixLogo(churchId);

        return {
            ...church,
            matrix_logo_url: matrixLogoUrl
        };
    } catch (error) {
        console.error("Error in getChurchWithMatrixLogo:", error);
        return null;
    }
}

/**
 * Formata a URL do logo do Supabase Storage
 * @param url URL possivelmente incompleta
 * @returns URL completa e válida
 */
export function formatLogoUrl(url: string | null | undefined): string | null {
    if (!url) return null;

    // Se já é URL completa, retorna
    if (url.startsWith('http')) return url;

    // Se é path relativo do Storage, constrói URL completa
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (url.startsWith('church-logos/')) {
        return `${supabaseUrl}/storage/v1/object/public/${url}`;
    }

    return url;
}
