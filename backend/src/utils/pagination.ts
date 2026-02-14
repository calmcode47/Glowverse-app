export interface CursorPaginationParams {
    cursor?: string;
    take?: number;
}

export interface CursorPaginationResult<T> {
    items: T[];
    nextCursor?: string;
    hasMore: boolean;
}

/**
 * Generic cursor-based pagination helper
 */
export async function cursorPaginate<T extends { id: string }>(
    model: any,
    params: CursorPaginationParams,
    query: any = {}
): Promise<CursorPaginationResult<T>> {
    const take = params.take || 20;
    const cursor = params.cursor ? { id: params.cursor } : undefined;

    // Fetch one extra to check if there's more
    const items = await model.findMany({
        ...query,
        take: take + 1,
        cursor,
        skip: cursor ? 1 : 0, // Skip the cursor itself
    });

    const hasMore = items.length > take;
    const results = hasMore ? items.slice(0, -1) : items;
    const nextCursor = hasMore ? results[results.length - 1].id : undefined;

    return {
        items: results,
        nextCursor,
        hasMore,
    };
}
