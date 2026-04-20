import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import ItemFilter from "../../components/ItemFilter/ItemFilter";
import ItemList from "../../components/ItemList/ItemList";

const API_URL = import.meta.env.VITE_UNIFOUND_BACKEND_URL;

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    status: "all",
    category: "all",
    sort: "newest",
  });

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // When the URL ?search= param changes (e.g. navigated here from another page),
  // update the search filter to reflect it
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    setFilters((prev) => {
      if (prev.search === urlSearch) return prev;
      return { ...prev, search: urlSearch };
    });
  }, [searchParams]);

  const fetchItems = useCallback(async (currentFilters, page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({ page, limit: 12 });

      if (currentFilters.status && currentFilters.status !== "all") {
        params.set("status", currentFilters.status);
      }
      if (currentFilters.category && currentFilters.category !== "all") {
        params.set("category", currentFilters.category);
      }
      if (currentFilters.search?.trim()) {
        params.set("search", currentFilters.search.trim());
      }
      if (currentFilters.sort) {
        params.set("sort", currentFilters.sort);
      }

      const res = await fetch(`${API_URL}/api/items?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to load items.");
      }

      const data = await res.json();

      const normalized = (data.data?.items ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        status: item.status,
        status_label: item.status_label,
        category: item.category,
        location: item.location,
        dateReported: item.date_reported
          ? new Date(item.date_reported).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "—",
        timeReported: item.time_reported ?? null,
        reporterId: item.reporter_id ?? null,
        reporterName:
          item.reporter_first_name && item.reporter_last_name
            ? `${item.reporter_first_name} ${item.reporter_last_name}`
            : "Unknown",
        reporterEmail: item.reporter_email ?? null,
        image: item.image?.startsWith("http") ? item.image : null,
        description: item.description ?? null,
        contactEmail: item.contact_email ?? null,
        referenceNumber: item.reference_number ?? null,
      }));

      // In Browse, hide claimed/resolved when viewing "all" so only active items show
      const visible =
        currentFilters.status === "all"
          ? normalized.filter(
              (i) => i.status !== "claimed" && i.status !== "resolved",
            )
          : normalized;
      setItems(visible);
      setPagination(
        data.data?.pagination ?? {
          total: 0,
          page: 1,
          limit: 12,
          totalPages: 1,
        },
      );
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search, immediate for other filter changes
  useEffect(() => {
    const timer = setTimeout(
      () => {
        fetchItems(filters, 1);
      },
      filters.search ? 400 : 0,
    );
    return () => clearTimeout(timer);
  }, [filters, fetchItems]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    // Keep URL in sync with the search field; clear param if empty
    if (newFilters.search?.trim()) {
      setSearchParams({ search: newFilters.search.trim() }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    fetchItems(filters, newPage);
  };

  return (
    <>
      <ItemFilter
        filters={filters}
        onChange={handleFiltersChange}
        showClaimed={false}
      />
      <ItemList
        items={items}
        loading={loading}
        error={error}
        pagination={pagination}
        onPageChange={handlePageChange}
        onRetry={() => fetchItems(filters, pagination.page)}
        onItemsChanged={() => fetchItems(filters, pagination.page)}
      />
    </>
  );
};

export default Browse;
