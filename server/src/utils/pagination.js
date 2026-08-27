const parsePagination = (query) => ({
  page: Number(query.page || 1),
  limit: Number(query.limit || 25),
  search: typeof query.search === "string" ? query.search.trim() : "",
});

const paginationMeta = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});

module.exports = { parsePagination, paginationMeta };
