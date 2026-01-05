export interface IAutoTestRequest {
    /**
     * Полный путь для запроса (уже с подставленными параметрами)
     * Пример: "/api/users/123"
     */
    path: string;

    /**
     * Необязательные query-параметры
     */
    query?: Record<string, string | number | boolean>;

    /**
     * Необязательные заголовки
     */
    headers?: Record<string, string>;
}
