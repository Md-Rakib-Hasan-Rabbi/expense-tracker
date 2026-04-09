import { apiClient } from './apiClient';

export const transactionsApi = {
  list: (params) => apiClient.get('/transactions', { params }).then((res) => res.data),
  create: (payload) => apiClient.post('/transactions', payload).then((res) => res.data),
  update: (id, payload) => apiClient.patch(`/transactions/${id}`, payload).then((res) => res.data),
  remove: (id) => apiClient.delete(`/transactions/${id}`).then((res) => res.data),
};

export const categoriesApi = {
  list: () => apiClient.get('/categories').then((res) => res.data),
  create: (payload) => apiClient.post('/categories', payload).then((res) => res.data),
  update: (id, payload) => apiClient.patch(`/categories/${id}`, payload).then((res) => res.data),
  remove: (id) => apiClient.delete(`/categories/${id}`).then((res) => res.data),
};

export const accountsApi = {
  list: () => apiClient.get('/accounts').then((res) => res.data),
  create: (payload) => apiClient.post('/accounts', payload).then((res) => res.data),
  update: (id, payload) => apiClient.patch(`/accounts/${id}`, payload).then((res) => res.data),
  remove: (id) => apiClient.delete(`/accounts/${id}`).then((res) => res.data),
};

export const budgetsApi = {
  list: (month) => apiClient.get('/budgets', { params: { month } }).then((res) => res.data),
  upsert: (categoryId, month, payload) =>
    apiClient.put(`/budgets/${categoryId}`, payload, { params: { month } }).then((res) => res.data),
  remove: (id) => apiClient.delete(`/budgets/${id}`).then((res) => res.data),
};

export const reportsApi = {
  summary: (params) => apiClient.get('/reports/summary', { params }).then((res) => res.data),
  categoryBreakdown: (params) => apiClient.get('/reports/category-breakdown', { params }).then((res) => res.data),
  monthlyTrend: (params) => apiClient.get('/reports/monthly-trend', { params }).then((res) => res.data),
};

export const exportsApi = {
  transactionsCsv: (params) =>
    apiClient
      .get('/exports/transactions/csv', {
        params,
        responseType: 'blob',
      })
      .then((res) => res.data),
};

export const recurringApi = {
  list: () => apiClient.get('/recurring-rules').then((res) => res.data),
  create: (payload) => apiClient.post('/recurring-rules', payload).then((res) => res.data),
  update: (id, payload) => apiClient.patch(`/recurring-rules/${id}`, payload).then((res) => res.data),
  remove: (id) => apiClient.delete(`/recurring-rules/${id}`).then((res) => res.data),
};

export const userApi = {
  updateProfile: (payload) => apiClient.patch('/users/me', payload).then((res) => res.data),
  changePassword: (payload) => apiClient.patch('/users/me/password', payload).then((res) => res.data),
};
