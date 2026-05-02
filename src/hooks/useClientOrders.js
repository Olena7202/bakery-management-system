import { getFavoriteCakesByClient } from "../services/cakeService";
import { readClientOrders, getSavedCakeData } from "../utils/orderViewModel";

export function useClientOrdersData(clientId, savedListVersion = 0) {
  if (!clientId) return { orders: [], savedCakes: [] };
  void savedListVersion;
  return {
    orders: readClientOrders(clientId),
    savedCakes: getFavoriteCakesByClient(clientId).map(getSavedCakeData),
  };
}
