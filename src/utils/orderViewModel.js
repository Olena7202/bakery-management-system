export const CLIENT_ORDERS_KEY = "bakery_client_orders";

export const statusMeta = {
  Pending: {
    label: "Pending",
    className: "client-status-pending",
    color: "#9b620f",
  },
  InProgress: {
    label: "In Progress",
    className: "client-status-progress",
    color: "#403393",
  },
  Delivered: {
    label: "Delivered",
    className: "client-status-delivered",
    color: "#5a9f21",
  },
};

export function readClientOrders(clientId) {
  if (!clientId) return [];

  try {
    const parsed = JSON.parse(localStorage.getItem(CLIENT_ORDERS_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((order) => Number(order.clientId) === Number(clientId))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch {
    return [];
  }
}

export function normalizeStatus(status) {
  if (status === "In Progress" || status === "InProgress") return "InProgress";
  if (status === "Delivered" || status === "Ready") return "Delivered";
  return "Pending";
}

export function formatDate(value) {
  if (!value) return "Дата не вказана";

  return new Date(value).toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getSavedCakeData(saved) {
  const cake = saved.cake || saved;
  const price =
    saved.customization?.totalPrice ??
    cake.basePrice ??
    cake.price ??
    saved.totalPrice ??
    0;

  return {
    id: cake.id ?? saved.cakeId ?? saved.id,
    name: cake.name || "Торт без назви",
    image: cake.photoUrl || cake.image || "/images/your-custom-cake.jpg",
    price,
    customization: saved.customization,
  };
}
