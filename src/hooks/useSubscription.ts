import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Subscription {
    status: string | null;
    diasRestantes: number | null;
    dataVencimento: Date | null;
    isAtivo: boolean;
    isBloqueado: boolean;
    isPendente: boolean;
    isVencido: boolean;
    notificacoes: Notification[];
}

interface Notification {
    id: string;
    tipo: string;
    titulo: string;
    mensagem: string;
    visualizado: boolean;
    created_at: string;
}

export function useSubscription() {
    const [subscription, setSubscription] = useState<Subscription>({
        status: null,
        diasRestantes: null,
        dataVencimento: null,
        isAtivo: false,
        isBloqueado: false,
        isPendente: false,
        isVencido: false,
        notificacoes: [],
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadSubscription();

        // Atualizar a cada 5 minutos
        const interval = setInterval(loadSubscription, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    const loadSubscription = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setIsLoading(false);
                return;
            }

            // Verificar acesso ao sistema
            const { data: accessData } = await supabase.rpc('can_access_system');

            if (accessData && accessData.length > 0) {
                const access = accessData[0];

                setSubscription(prev => ({
                    ...prev,
                    status: access.status_licenca,
                    diasRestantes: access.dias_restantes,
                    isAtivo: access.can_access && access.status_licenca === 'ATIVO',
                    isBloqueado: !access.can_access || access.status_licenca === 'BLOQUEADO',
                    isPendente: access.status_licenca === 'PENDENTE_DE_VALIDACAO',
                    isVencido: access.status_licenca === 'VENCIDO',
                }));
            }

            // Carregar notificações não visualizadas
            const { data: notificationsData } = await supabase
                .from('notifications')
                .select('*')
                .eq('visualizado', false)
                .or(`user_id.eq.${user.id},church_id.in.(select church_id from user_roles where user_id='${user.id}')`)
                .order('created_at', { ascending: false })
                .limit(10);

            if (notificationsData) {
                setSubscription(prev => ({
                    ...prev,
                    notificacoes: notificationsData,
                }));
            }
        } catch (error) {
            console.error('Error loading subscription:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const marcarComoVisualizada = async (notificationId: string) => {
        try {
            await supabase
                .from('notifications')
                .update({ visualizado: true, data_visualizacao: new Date().toISOString() })
                .eq('id', notificationId);

            loadSubscription();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    return {
        ...subscription,
        isLoading,
        reload: loadSubscription,
        marcarComoVisualizada,
    };
}
