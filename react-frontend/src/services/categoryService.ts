import { http } from './http';
import type { Category, CategoryFormData, ApiResponse } from '../types';

export const categoryService = {
  getAll: () =>
    http.get<ApiResponse<Category[]>>('/categories'),

  create: (data: CategoryFormData) =>
    http.post<ApiResponse<Category>>('/categories', data),

  update: (id: number, data: CategoryFormData) =>
    http.put<ApiResponse<Category>>(`/categories/${id}`, data),

  delete: (id: number) =>
    http.delete<ApiResponse<null>>(`/categories/${id}`),
};
