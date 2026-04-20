import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import ItemFilter from "../../components/ItemFilter/ItemFilter";
import ItemList from "../../components/ItemList/ItemList";

const API_URL = import.meta.env.VITE_UNIFOUND_BACKEND_URL;

const MyReport = () => {
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    search: searchParams.get("search") ?? "",
    status: "all",
    category: "all",
    sort: "newest",
  });

  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Keep the search filter in sync when Topbar updates the URL param
  useEffect(() => {
    const urlSearch = searchParams.get("search") ?? "";
    setFilters((prev) =>
      prev.search === urlSearch ? prev : { ...prev, search: urlSearch },
    );
  }, [searchParams]);

  const fetchMyReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/items/my-reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Error ${res.status}`);
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
        reporterId: item.reporter_id ?? null,
        reporterName:
          item.reporter_first_name && item.reporter_last_name
            ? `${item.reporter_first_name} ${item.reporter_last_name}`
            : "Me",
        reporterEmail: item.reporter_email ?? null,
        contactEmail: item.contact_email ?? "",
        description: item.description ?? "",
        referenceNumber: item.reference_number ?? "—",
        image: raw.image ?? null,
      }));

      setAllItems(normalized);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyReports();
  }, [fetchMyReports]);

  // Client-side filtering & sorting (all items already belong to the user)
  const filtered = allItems
    .filter((item) => {
      if (filters.status !== "all" && item.status !== filters.status)
        return false;
      if (filters.category !== "all" && item.category !== filters.category)
        return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (filters.sort === "name_asc") return a.name.localeCompare(b.name);
      if (filters.sort === "name_desc") return b.name.localeCompare(a.name);
      if (filters.sort === "oldest")
        return new Date(a.dateReported) - new Date(b.dateReported);
      return new Date(b.dateReported) - new Date(a.dateReported);
    });

  return (
    <>
      <ItemFilter filters={filters} onChange={setFilters} />
      <ItemList
        items={filtered}
        loading={loading}
        error={error}
        onRetry={fetchMyReports}
        onItemsChanged={fetchMyReports}
      />
    </>
  );
};

export default MyReport;
