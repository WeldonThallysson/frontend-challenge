import {
  categories,
  fromWei,
  toWei,
  type CartLine,
  type NFT,
  type Order,
  type Quote,
  type User,
} from "../domain";
export const scenarios = [
  "standard",
  "empty",
  "slow",
  "out-of-order",
  "offline",
  "server-error",
  "expired",
  "favorite-error",
  "price-change",
  "sold-out",
  "order-timeout",
  "payment-declined",
  "pending-disconnect",
] as const;
export type Scenario = (typeof scenarios)[number];
type Account = User & {
  passwordHash: string;
  favorites: string[];
  cart: CartLine[];
};
type DB = {
  nfts: NFT[];
  users: Account[];
  guest: CartLine[];
  session: { userId: string; expiresAt: number } | null;
  quotes: Record<string, Quote>;
  orders: Order[];
  attempts: Record<string, { body: string; orderId: string }>;
  scenario: Scenario;
  revision: number;
};
const names = [
  "Emerald Ape #042",
  "Sage Nomad #009",
  "Neon Vessel #552",
  "Cosmic Bloom #113",
  "Violet Nomad #314",
  "Ivory Baron #065",
  "Golden Beat #207",
  "Forest Signal #168",
  "Amber Soul #091",
  "Midnight Muse #028",
  "Urban Echo #176",
  "Velvet Dawn #039",
  "Sage Horizon #112",
  "Green Odyssey #221",
  "Quiet Rhythm #068",
  "Wild Canvas #301",
  "Digital Dream #014",
  "Golden Signal #100",
];
export async function hashPassword(password: string) {
  const b = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`kurio-demo:${password}`),
  );
  return [...new Uint8Array(b)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}
export async function seed(): Promise<DB> {
  const hash = await hashPassword("Kurio123!");
  return {
    nfts: names.map((name, i) => ({
      id: `nft-${i + 1}`,
      name,
      image: `/assets/ape-${[1, 2, 3, 2, 2, 3, 4, 4, 4, 3, 1, 2, 2, 1, 4, 3, 2, 4][i]}.webp`,
      category: categories[i % categories.length],
      network: ["Ethereum", "Polygon", "Solana"][i % 3],
      price: [
        "1.19",
        "1.69",
        "1.99",
        "1.29",
        "1.39",
        "1.79",
        "0.99",
        "0.39",
        "0.89",
      ][i % 9],
      previousPrice: i === 2 ? "2.29" : undefined,
      stock: 12,
      version: 1,
      creator: ["Studio Kurio", "Nomad Collective", "Noir Atelier"][i % 3],
      editions: [
        { id: "original", label: "Edição original", stock: 8 },
        { id: "limited", label: "Edição limitada", stock: 4 },
        { id: "archive", label: "Edição de arquivo · esgotada", stock: 0 },
      ],
    })),
    users: ["ana", "leo"].map((id, i) => ({
      id,
      name: i ? "Leo Santos" : "Ana Oliveira",
      username: id,
      email: `${id}@kurio.demo`,
      ens: `${id}.eth`,
      walletAlias: "Minha carteira",
      avatar: "/assets/ape-1.webp",
      passwordHash: hash,
      favorites: [],
      cart: [],
      wallets: [
        {
          id: `wallet-${id}`,
          label: "Carteira principal",
          address: `0x${String(i + 1).repeat(40)}`,
          network: "Ethereum",
          primary: true,
        },
      ],
    })),
    guest: [],
    session: null,
    quotes: {},
    orders: [],
    attempts: {},
    scenario: "standard",
    revision: 1,
  };
}
let db: DB;
export async function initDB() {
  try {
    const raw = localStorage.getItem("kurio:db:v1");
    db = raw ? JSON.parse(raw) : await seed();
  } catch {
    db = await seed();
  }
  save();
}
export function getDB() {
  return db;
}
export function save() {
  localStorage.setItem("kurio:db:v1", JSON.stringify(db));
}
export async function reset(scenario: Scenario = "standard") {
  db = await seed();
  db.scenario = scenario;
  save();
}
export function currentUser() {
  return db.session && db.session.expiresAt > Date.now()
    ? db.users.find((x) => x.id === db.session?.userId)
    : undefined;
}
export function publicUser(user: Account): User {
  const { passwordHash, favorites, cart, ...safe } = user;
  void passwordHash;
  void favorites;
  void cart;
  return safe;
}
export function cart() {
  return currentUser()?.cart ?? db.guest;
}
export function setCart(lines: CartLine[]) {
  const user = currentUser();
  if (user) user.cart = lines;
  else db.guest = lines;
  db.revision++;
  save();
}
export function quote(coupon = ""): Quote {
  const items = cart().map((line) => {
    const nft = db.nfts.find((n) => n.id === line.nftId)!;
    const edition = nft?.editions.find((e) => e.id === line.edition);
    if (
      !nft ||
      !edition ||
      line.quantity > edition.stock ||
      line.quantity > nft.stock
    )
      throw new Error(
        "Um item esgotou ou não possui essa quantidade. Atualize o carrinho.",
      );
    return {
      ...line,
      nft: structuredClone(nft),
      lineTotal: fromWei(toWei(nft.price) * BigInt(line.quantity)),
    };
  });
  const subtotal = items.reduce((a, x) => a + toWei(x.lineTotal), 0n);
  const discount = coupon === "KURIO10" ? subtotal / 10n : 0n;
  const fee = items.length ? toWei("0.005") : 0n;
  const fingerprint = JSON.stringify({
    items: items.map((x) => [
      x.nftId,
      x.edition,
      x.quantity,
      x.nft.version,
      x.nft.price,
    ]),
    coupon,
  });
  const q = {
    id: crypto.randomUUID(),
    items,
    subtotal: fromWei(subtotal),
    discount: fromWei(discount),
    fee: fromWei(fee),
    total: fromWei(subtotal - discount + fee),
    coupon,
    fingerprint,
    expiresAt: Date.now() + 120000,
  };
  db.quotes[q.id] = q;
  save();
  return q;
}
export function finishOrder(order: Order) {
  if (order.status !== "pending" || !db.orders.includes(order)) return;
  const decline =
    db.scenario === "payment-declined" ||
    order.quote.items.some((line) => {
      const nft = db.nfts.find((n) => n.id === line.nftId)!;
      return (
        nft.stock < line.quantity ||
        nft.editions.find((e) => e.id === line.edition)!.stock < line.quantity
      );
    });
  order.status = decline ? "declined" : "confirmed";
  order.reason = decline
    ? "Pagamento recusado ou disponibilidade alterada. Seus itens foram preservados."
    : undefined;
  order.version++;
  if (!decline) {
    const user = db.users.find((u) => u.id === order.userId)!;
    for (const line of order.quote.items) {
      const nft = db.nfts.find((n) => n.id === line.nftId)!;
      nft.stock -= line.quantity;
      nft.editions.find((e) => e.id === line.edition)!.stock -= line.quantity;
      nft.version++;
      const entry = user.cart.find(
        (x) => x.nftId === line.nftId && x.edition === line.edition,
      );
      if (entry) entry.quantity = Math.max(0, entry.quantity - line.quantity);
    }
    user.cart = user.cart.filter((x) => x.quantity > 0);
    db.revision++;
  }
  save();
}
