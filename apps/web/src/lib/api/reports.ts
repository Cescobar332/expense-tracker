import { api } from './client';
import { ReportData } from '../../types';

export const reportsApi = {
  getSummary: (params?: { startDate?: string; endDate?: string; period?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    if (params?.period) searchParams.set('period', params.period);
    const qs = searchParams.toString();
    return api.get<ReportData>(`/reports${qs ? `?${qs}` : ''}`);
  },
};
