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

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Дата не вказана";

  return parsed.toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function firstOrderItem(order) {
  const items = order?.orderItems;
  return Array.isArray(items) && items.length > 0 ? items[0] : null;
}

export function normalizeClientOrder(order) {
  if (!order) return order;

  const item = firstOrderItem(order);
  const cake = item?.cake || order.cake || null;
  const total = Number(order.total ?? order.totalPrice ?? item?.itemPrice ?? 0);
  const date = order.date ?? order.createdAt ?? order.deliveryDate ?? null;

  return {
    ...order,
    total,
    totalPrice: Number(order.totalPrice ?? total),
    date,
    createdAt: order.createdAt ?? date,
    cakeName: order.cakeName || cake?.name || "Замовлення",
    cakeImage:
      order.cakeImage ||
      cake?.photoUrl ||
      cake?.image ||
      "/images/your-custom-cake.jpg",
    quantity: order.quantity ?? item?.quantity ?? 1,
    biscuitName: order.biscuitName || item?.biscuit?.name || "",
    creamName: order.creamName || item?.cream?.name || "",
    note: order.note || "",
  };
}

export function getSavedCakeData(saved, fallbackCake = null) {
  const cake = saved.cake || saved;
  const resolved = fallbackCake || null;
  const cakeId = Number(saved.cakeId ?? cake?.id ?? resolved?.id ?? 0) || null;
  const price = Number(
    saved.customization?.totalPrice ??
      cake.basePrice ??
      cake.price ??
      saved.totalPrice ??
      resolved?.basePrice ??
      resolved?.price ??
      0
  );

  return {
    id: saved.id ?? cakeId,
    cakeId,
    name: cake.name || saved.cakeName || resolved?.name || "Торт без назви",
    image:
      cake.photoUrl ||
      cake.image ||
      cake.imageUrl ||
      saved.cakeImage ||
      resolved?.photoUrl ||
      resolved?.image ||
      "/images/your-custom-cake.jpg",
    price,
    customization: saved.customization,
  };
}
