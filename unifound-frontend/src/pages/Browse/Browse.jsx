import { useState } from "react";
import ItemFilter from "../../components/ItemFilter/ItemFilter";
import ItemList from "../../components/ItemList/ItemList";
import Logg from "../../assets/bryan.jpg";

const MOCK_ITEMS = [
  {
    id: "1",
    name: "Black Umbrella",
    status: "lost",
    category: "Accessories",
    location: "Library, 2nd Floor",
    dateReported: "Mar 25, 2026",
    reporterName: "Juan Dela Cruz",
    image: Logg,
  },
  {
    id: "2",
    name: "Student ID Card",
    status: "found",
    category: "Identification",
    location: "Canteen Area",
    dateReported: "Mar 24, 2026",
    reporterName: "Maria Santos",
    image: null,
  },
  {
    id: "3",
    name: "Apple AirPods Pro",
    status: "claimed",
    category: "Electronics",
    location: "Room 301, Engineering Bldg",
    dateReported: "Mar 22, 2026",
    reporterName: "Carlo Reyes",
    image: null,
  },
  {
    id: "4",
    name: "Blue Water Bottle",
    status: "lost",
    category: "Personal Items",
    location: "Gymnasium",
    dateReported: "Mar 21, 2026",
    reporterName: "Ana Lim",
    image: null,
  },
  {
    id: "5",
    name: "Calculus Textbook",
    status: "found",
    category: "Books",
    location: "Study Hall, 1st Floor",
    dateReported: "Mar 20, 2026",
    reporterName: "Paolo Mendoza",
    image: null,
  },
  {
    id: "6",
    name: "Brown Leather Wallet",
    status: "resolved",
    category: "Accessories",
    location: "Main Entrance",
    dateReported: "Mar 19, 2026",
    reporterName: "Lea Torres",
    image: null,
  },
  {
    id: "7",
    name: "Scientific Calculator",
    status: "lost",
    category: "Electronics",
    location: "Room 205, Science Bldg",
    dateReported: "Mar 18, 2026",
    reporterName: "Marco Bautista",
    image: null,
  },
  {
    id: "8",
    name: "Gray Hoodie",
    status: "found",
    category: "Clothing",
    location: "PE Locker Room",
    dateReported: "Mar 17, 2026",
    reporterName: "Nina Cruz",
    image: null,
  },
];

const Browse = () => {
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    category: "all",
    sort: "newest",
  });

  const filtered = MOCK_ITEMS.filter((item) => {
    if (filters.status !== "all" && item.status !== filters.status)
      return false;
    if (filters.category !== "all" && item.category !== filters.category)
      return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.reporterName.toLowerCase().includes(q)
      );
    }
    return true;
  }).sort((a, b) => {
    if (filters.sort === "name_asc") return a.name.localeCompare(b.name);
    if (filters.sort === "name_desc") return b.name.localeCompare(a.name);
    if (filters.sort === "oldest")
      return new Date(a.dateReported) - new Date(b.dateReported);
    return new Date(b.dateReported) - new Date(a.dateReported);
  });

  return (
    <>
      <ItemFilter filters={filters} onChange={setFilters} />
      <ItemList items={filtered} />
    </>
  );
};

export default Browse;
