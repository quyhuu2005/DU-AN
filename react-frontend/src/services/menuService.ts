import { http } from './http';
import type { MenuItem, MenuItemFormData, ApiResponse, PaginatedResponse } from '../types';

export const menuService = {
  getAll: (page = 0, size = 10, search = '', categoryId = '') =>
    http.get<PaginatedResponse<MenuItem>>(
      `/menu-items?page=${page}&size=${size}&search=${search}&categoryId=${categoryId}`
    ),

  create: (data: MenuItemFormData) =>
    http.post<ApiResponse<MenuItem>>('/menu-items', {
      name:        data.name,
      categoryId:  data.categoryId,
      basePrice:   data.basePrice,
      description: data.description,
      imageUrl:    data.imageUrl ?? '',
    }),

  update: (id: number, data: Partial<MenuItemFormData>) =>
    http.put<ApiResponse<MenuItem>>(`/menu-items/${id}`, data),

  delete: (id: number) =>
    http.delete<ApiResponse<null>>(`/menu-items/${id}`),
};
