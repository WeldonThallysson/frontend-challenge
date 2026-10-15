import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Trash2,
  Wallet,
  XCircle,
} from "lucide-react";
import {
  api,
  http,
  invalidateCommerce,
  message,
  queryClient,
  useCart,
  useSession,
} from "../api";
import { eth, type CartLine, type Order, type Quote } from "../domain";
import { useToast } from "../shell";
import { Button } from "../components/ui/button";
import { Dialog } from "../components/ui/dialog";
import {
  Empty,
  ErrorState,
  Field,
  PageTitle,
  Skeleton,
} from "../components/shared";
import { Related } from "./catalog";
function useCoupon() {
  const [coupon, setCouponState] = useState(
    () => localStorage.getItem("kurio:coupon") ?? "",
  );
  const setCoupon = (value: string) => {
    setCouponState(value);
    localStorage.setItem("kurio:coupon", value);
  };
  return [coupon, setCoupon] as const;
}
function useQuote(coupon: string) {
  const { data: user } = useSession();
  const cart = useCart(user);
  return useQuery({
    queryKey: ["quote", user?.id ?? "guest", cart.data, coupon],
    queryFn: ({ signal }) => api.quote(coupon, signal),
    enabled: !!cart.data?.length,
    staleTime: 0,
  });
}
export function Summary({
  quote,
  children,
}: {
  quote: Quote;
  children?: React.ReactNode;
}) {
  return (
    <aside className="summary">
      <h2>Resumo do pedido</h2>
      <div className="summary-items">
        {quote.items.map((l) => (
          <div key={`${l.nftId}:${l.edition}`}>
            <img src={l.nft.image} alt="" width="44" height="44" />
            <span>
              {l.nft.name}
              <small>
                {l.quantity} × {eth(l.nft.price)}
              </small>
            </span>
          </div>
        ))}
      </div>
      <dl>
        <div>
          <dt>Subtotal</dt>
          <dd>{eth(quote.subtotal)}</dd>
        </div>
        <div>
          <dt>Desconto {quote.coupon && `(${quote.coupon})`}</dt>
          <dd>− {eth(quote.discount)}</dd>
        </div>
        <div>
          <dt>Taxa de rede</dt>
          <dd>{eth(quote.fee)}</dd>
        </div>
        <div className="summary-total">
          <dt>Total</dt>
          <dd>{eth(quote.total)}</dd>
        </div>
      </dl>
      {children}
      <p className="simulation-note">
        <ShieldCheck size={13} /> Ambiente de simulação. Sem cobrança.
      </p>
    </aside>
  );
}
function CartItem({ line }: { line: CartLine }) {
  const toast = useToast();
  const nft = useQuery({
    queryKey: ["nft", line.nftId],
    queryFn: ({ signal }) => api.nft(line.nftId, signal),
  });
  const change = useMutation({
    mutationFn: async (quantity: number) => {
      if (quantity === 0) await http.delete("/cart", { data: line });
      else await http.patch("/cart", { ...line, quantity });
    },
    onSuccess: () => void invalidateCommerce(),
    onError: (e) => toast(message(e)),
  });
  if (!nft.data) return <div className="skeleton h-24" />;
  const n = nft.data;
  const stock = Math.min(
    n.stock,
    n.editions.find((e) => e.id === line.edition)?.stock ?? 0,
  );
  return (
    <article className="cart-item">
      <Link to="/nft/$id" params={{ id: n.id }}>
        <img src={n.image} alt={n.name} width="84" height="84" />
      </Link>
      <div className="cart-item-name">
        <Link to="/nft/$id" params={{ id: n.id }}>
          {n.name}
        </Link>
        <small>
          {n.editions.find((e) => e.id === line.edition)?.label} · {n.network}
        </small>
        {stock < line.quantity && (
          <small className="field-error">
            Disponibilidade alterada: {stock} unidade(s).
          </small>
        )}
      </div>
      <span className="price">{eth(n.price)}</span>
      <label className="quantity-control">
        <span className="sr-only">Quantidade de {n.name}</span>
        <select
          disabled={change.isPending}
          aria-label={`Quantidade de ${n.name}`}
          value={line.quantity}
          onChange={(e) => change.mutate(Number(e.target.value))}
        >
          {Array.from({ length: Math.max(stock, line.quantity) }, (_, i) => (
            <option value={i + 1} key={i}>
              {i + 1}
            </option>
          ))}
        </select>
      </label>
      <Button
        aria-label={`Remover ${n.name}`}
        size="icon"
        variant="ghost"
        disabled={change.isPending}
        onClick={() => change.mutate(0)}
      >
        <Trash2 size={16} />
      </Button>
    </article>
  );
}
export function CartPage() {
  const { data: user } = useSession();
  const cart = useCart(user);
  const [coupon, setCoupon] = useCoupon();
  const [code, setCode] = useState(coupon);
  const [couponError, setCouponError] = useState("");
  const quote = useQuote(coupon);
  const apply = useMutation({
    mutationFn: async () => api.quote(code.trim().toUpperCase()),
    onSuccess: () => {
      setCoupon(code.trim().toUpperCase());
      setCouponError("");
    },
    onError: (e) => setCouponError(message(e)),
  });
  return (
    <>
      <PageTitle
        eyebrow="SUA PRÓXIMA COLEÇÃO"
        title="Carrinho de NFTs"
        description="Peças únicas. Uma coleção que é só sua."
      />
      {cart.isPending ? (
        <Skeleton cards={2} />
      ) : cart.isError ? (
        <ErrorState error={cart.error} retry={() => void cart.refetch()} />
      ) : !cart.data.length ? (
        <Empty
          title="Seu carrinho está esperando por arte"
          description="Explore o mercado e encontre algo que combine com você."
        />
      ) : (
        <div className="commerce-layout">
          <section>
            <div className="cart-table-heading">
              <span>NFT / Edição</span>
              <span>Preço</span>
              <span>Qtd.</span>
            </div>
            <div className="cart-items">
              {cart.data.map((l) => (
                <CartItem key={`${l.nftId}:${l.edition}`} line={l} />
              ))}
            </div>
            <form
              className="coupon-form"
              onSubmit={(e) => {
                e.preventDefault();
                apply.mutate();
              }}
            >
              <Field label="Tem um cupom?">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Código do cupom"
                  aria-describedby={couponError ? "coupon-error" : undefined}
                  aria-invalid={!!couponError}
                />
              </Field>
              <Button variant="outline" disabled={apply.isPending}>
                Aplicar
              </Button>
              {coupon && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setCoupon("");
                    setCode("");
                    setCouponError("");
                  }}
                >
                  Remover cupom
                </Button>
              )}
              {couponError && (
                <p
                  className="field-error full-width"
                  id="coupon-error"
                  role="alert"
                >
                  {couponError}
                </p>
              )}
            </form>
            <Link to="/" hash="mercado" className="back-link">
              <ArrowLeft size={14} />
              Continuar explorando
            </Link>
          </section>
          {quote.isPending ? (
            <Skeleton cards={1} />
          ) : quote.isError ? (
            <ErrorState
              error={quote.error}
              retry={() => void quote.refetch()}
            />
          ) : (
            quote.data && (
              <Summary quote={quote.data}>
                <Button asChild className="w-full">
                  <Link to="/pagamento">
                    Continuar para pagamento <ArrowRight size={15} />
                  </Link>
                </Button>
              </Summary>
            )
          )}
        </div>
      )}
      <Related />
    </>
  );
}
type Attempt = {
  userId: string;
  key: string;
  body: {
    quoteId: string;
    walletId: string;
    network: string;
    name: string;
    email: string;
  };
};
function readAttempt(userId: string): Attempt | null {
  try {
    const value = JSON.parse(localStorage.getItem("kurio:attempt") ?? "null");
    return value?.userId === userId ? value : null;
  } catch {
    return null;
  }
}
export function Checkout() {
  const { data: user } = useSession();
  const navigate = useNavigate();
  const toast = useToast();
  const [coupon] = useCoupon();
  const quote = useQuote(coupon);
  const cart = useCart(user);
  const wallets = useQuery({
    queryKey: ["private", user?.id, "wallets"],
    queryFn: ({ signal }) => api.wallets(signal),
    enabled: !!user,
  });
  const [walletId, setWalletId] = useState("");
  const [network, setNetwork] = useState("Ethereum");
  const [connection, setConnection] = useState<
    "idle" | "connected" | "declined"
  >("idle");
  const [review, setReview] = useState<Quote | null>(null);
  const [form, setForm] = useState({ name: "", email: "" });
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState<Attempt | null>(() =>
    user ? readAttempt(user.id) : null,
  );
  useEffect(() => {
    if (user) {
      setForm({ name: user.name, email: user.email });
      setAttempt(readAttempt(user.id));
    }
  }, [user]);
  useEffect(() => {
    if (wallets.data?.length && !walletId) {
      const primary = wallets.data.find((w) => w.primary) ?? wallets.data[0];
      setWalletId(primary.id);
      setNetwork(primary.network);
    }
  }, [wallets.data, walletId]);
  const place = useMutation({
    mutationFn: async () => {
      if (!review || !user) throw new Error("Revise seu pedido.");
      await api.session();
      const fresh = await api.quote(coupon);
      if (fresh.fingerprint !== review.fingerprint) {
        queryClient.setQueryData(["quote", user.id, cart.data, coupon], fresh);
        setReview(null);
        throw new Error(
          "A cotação mudou. Confira o novo total e revise novamente.",
        );
      }
      const pending = attempt ?? {
        userId: user.id,
        key: crypto.randomUUID(),
        body: { quoteId: review.id, walletId, network, ...form },
      };
      setAttempt(pending);
      localStorage.setItem("kurio:attempt", JSON.stringify(pending));
      return (
        await http.post<Order>("/orders", pending.body, {
          headers: { "Idempotency-Key": pending.key },
        })
      ).data;
    },
    onSuccess: (order) => {
      localStorage.removeItem("kurio:attempt");
      setAttempt(null);
      setReview(null);
      void navigate({ to: "/pedido/$id", params: { id: order.id } });
    },
    onError: (e) => {
      if (
        axios.isAxiosError(e) &&
        e.response &&
        [409, 422].includes(e.response.status)
      ) {
        localStorage.removeItem("kurio:attempt");
        setAttempt(null);
        setReview(null);
        void invalidateCommerce();
      }
      setError(message(e));
    },
  });
  const recover = useMutation({
    mutationFn: async () => {
      if (!attempt) throw new Error("Nenhuma tentativa pendente.");
      return (
        await http.post<Order>("/orders", attempt.body, {
          headers: { "Idempotency-Key": attempt.key },
          timeout: 7000,
        })
      ).data;
    },
    onSuccess: (order) => {
      localStorage.removeItem("kurio:attempt");
      setAttempt(null);
      void navigate({ to: "/pedido/$id", params: { id: order.id } });
    },
    onError: (e) => setError(message(e)),
  });
  const stale = !!review && quote.data?.fingerprint !== review.fingerprint;
  if (cart.isPending || !user) return <Skeleton cards={2} />;
  if (!cart.data?.length && !attempt)
    return (
      <Empty
        title="Seu carrinho está vazio"
        description="Adicione uma peça antes de continuar para o pagamento."
      />
    );
  return (
    <>
      <PageTitle
        eyebrow="ÚLTIMO PASSO PARA SUA COLEÇÃO"
        title="Pagamento"
        description="Confira seus dados e finalize sua compra demonstrativa."
      />
      {attempt && (
        <div className="recovery-banner" role="status">
          <Clock3 size={22} />
          <div>
            <h2>Existe uma tentativa de compra em andamento</h2>
            <p>Recupere o resultado antes de iniciar outra compra.</p>
          </div>
          <Button onClick={() => recover.mutate()} disabled={recover.isPending}>
            Recuperar pedido
          </Button>
        </div>
      )}
      <div className="commerce-layout">
        <form
          className="checkout-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            try {
              const fresh = await api.quote(coupon);
              setReview(fresh);
            } catch (e) {
              setError(message(e));
            }
          }}
        >
          <section>
            <h2>
              <span className="step">1</span>Dados do colecionador
            </h2>
            <div className="form-grid">
              <Field label="Nome completo *">
                <input
                  required
                  value={form.name}
                  autoComplete="name"
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Field>
              <Field label="E-mail *">
                <input
                  type="email"
                  required
                  value={form.email}
                  autoComplete="email"
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Field>
            </div>
          </section>
          <section>
            <h2>
              <span className="step">2</span>Carteira e rede
            </h2>
            {wallets.isPending ? (
              <Skeleton cards={1} />
            ) : wallets.isError ? (
              <ErrorState
                error={wallets.error}
                retry={() => void wallets.refetch()}
              />
            ) : !wallets.data.length ? (
              <p>
                Você ainda não tem uma carteira.{" "}
                <Link to="/carteiras" className="text-link">
                  Cadastrar carteira
                </Link>
              </p>
            ) : (
              <>
                <div className="form-grid">
                  <Field label="Carteira">
                    <select
                      value={walletId}
                      onChange={(e) => {
                        const w = wallets.data.find(
                          (w) => w.id === e.target.value,
                        )!;
                        setWalletId(w.id);
                        setNetwork(w.network);
                        setConnection("idle");
                      }}
                    >
                      {wallets.data.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Rede">
                    <select
                      value={network}
                      onChange={(e) => {
                        setNetwork(e.target.value);
                        setConnection("idle");
                      }}
                    >
                      {["Ethereum", "Polygon", "Solana"].map((n) => (
                        <option key={n}>{n}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div className="wallet-connect">
                  <Wallet size={24} />
                  <div>
                    <strong>
                      {connection === "connected"
                        ? "Carteira conectada"
                        : connection === "declined"
                          ? "Conexão recusada"
                          : "Conecte sua carteira"}
                    </strong>
                    <p className="muted">
                      {wallets.data
                        .find((w) => w.id === walletId)
                        ?.address.slice(0, 14)}
                      … · simulação
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (
                        wallets.data.find((w) => w.id === walletId)?.network !==
                        network
                      ) {
                        setError(
                          "A rede selecionada deve corresponder à rede da carteira.",
                        );
                        return;
                      }
                      setConnection(
                        connection === "connected" ? "idle" : "connected",
                      );
                      setError("");
                      toast(
                        connection === "connected"
                          ? "Carteira desconectada."
                          : "Carteira conectada na simulação.",
                      );
                    }}
                  >
                    {connection === "connected"
                      ? "Desconectar"
                      : "Conectar carteira"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setConnection("declined");
                      toast("Você recusou a conexão simulada.");
                    }}
                  >
                    Simular recusa
                  </Button>
                </div>
              </>
            )}
          </section>
          <section>
            <h2>
              <span className="step">3</span>Revise e confirme
            </h2>
            <p className="muted mb-5">
              Os valores e a disponibilidade serão consultados novamente antes
              da compra.
            </p>
            <label className="check-label mb-5">
              <input type="checkbox" required />
              Entendo que esta é uma compra simulada, sem valor financeiro.
            </label>
            {error && (
              <p className="form-error mb-4" role="alert">
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={
                connection !== "connected" ||
                !quote.data ||
                !!attempt ||
                quote.isFetching
              }
            >
              Revisar pedido <ArrowRight size={15} />
            </Button>
          </section>
        </form>
        <div>
          {quote.isPending ? (
            <Skeleton cards={1} />
          ) : quote.isError ? (
            <ErrorState
              error={quote.error}
              retry={() => void quote.refetch()}
            />
          ) : (
            quote.data && <Summary quote={quote.data} />
          )}
          <p className="simulation-note mt-4">
            Cupom demonstrativo disponível: KURIO10
          </p>
        </div>
      </div>
      <Dialog
        open={!!review}
        onOpenChange={(open) => {
          if (!place.isPending && !open) setReview(null);
        }}
        title="Tudo pronto para sua coleção?"
        description="Revise os itens e o total. A compra será confirmada apenas após a resposta do pagamento simulado."
      >
        {review && (
          <>
            <dl className="review-lines">
              {review.items.map((l) => (
                <div key={`${l.nftId}:${l.edition}`}>
                  <dt>
                    {l.quantity} × {l.nft.name}
                  </dt>
                  <dd>{eth(l.lineTotal)}</dd>
                </div>
              ))}
              <div className="summary-total">
                <dt>Total com taxas</dt>
                <dd>{eth(review.total)}</dd>
              </div>
            </dl>
            {stale && (
              <p className="form-error" role="alert">
                A cotação foi atualizada. Feche e revise novamente.
              </p>
            )}
            {error && (
              <p role="alert" className="form-error mb-4">
                {error}
              </p>
            )}
            <Button
              className="w-full"
              disabled={stale || place.isPending || !!attempt}
              onClick={() => place.mutate()}
            >
              {place.isPending
                ? "Enviando pedido…"
                : "Confirmar compra simulada"}
            </Button>
            {attempt && (
              <Button
                className="w-full mt-3"
                variant="outline"
                onClick={() => recover.mutate()}
                disabled={recover.isPending}
              >
                Recuperar a mesma tentativa
              </Button>
            )}
          </>
        )}
      </Dialog>
    </>
  );
}
export function OrderPage() {
  const { id } = useParams({ strict: false });
  const { data: user } = useSession();
  const order = useQuery({
    queryKey: ["private", user?.id, "order", id],
    queryFn: ({ signal }) => api.order(id!, signal),
    enabled: !!user,
    refetchInterval: (query) =>
      query.state.data?.status === "pending" ? 1500 : false,
  });
  const products = useQueries({
    queries: (order.data?.quote.items ?? []).map((l) => ({
      queryKey: ["nft", l.nftId],
      queryFn: () => api.nft(l.nftId),
    })),
  });
  void products;
  useEffect(() => {
    if (order.data?.status === "confirmed") void invalidateCommerce();
  }, [order.data?.status]);
  if (order.isPending) return <Skeleton cards={1} />;
  if (order.isError)
    return (
      <ErrorState error={order.error} retry={() => void order.refetch()} />
    );
  const o = order.data;
  return (
    <section className="receipt">
      <div className={`receipt-icon ${o.status}`}>
        {o.status === "confirmed" ? (
          <CheckCircle2 size={44} />
        ) : o.status === "declined" ? (
          <XCircle size={44} />
        ) : (
          <Clock3 size={44} />
        )}
      </div>
      <p className="eyebrow">KURIO COLLECTORS CLUB</p>
      <h1>
        {o.status === "confirmed"
          ? "Sua coleção ganhou uma nova história."
          : o.status === "declined"
            ? "Não foi possível concluir o pagamento."
            : "Seu pedido está sendo processado."}
      </h1>
      <p className="muted">
        {o.status === "confirmed"
          ? "Pedido confirmado. As peças abaixo agora fazem parte da sua coleção simulada."
          : o.status === "declined"
            ? o.reason
            : "Você pode recarregar esta página. O pedido será recuperado sem criar outra compra."}
      </p>
      <div className="receipt-meta">
        <span>Pedido #{o.id.slice(0, 8)}</span>
        <span>{new Date(o.createdAt).toLocaleDateString("pt-BR")}</span>
      </div>
      <Summary quote={o.quote} />
      {o.status === "confirmed" && (
        <div className="transaction">
          <Check size={16} />
          <div>
            Identificação da transação<code>{o.transaction}</code>
            <small>Referência simulada · sem registro em blockchain</small>
          </div>
        </div>
      )}
      <div className="flex justify-center gap-3 flex-wrap mt-7">
        <Button asChild>
          <Link to="/">
            Continuar explorando <ArrowRight size={15} />
          </Link>
        </Button>
        {o.status === "declined" && (
          <Button asChild variant="outline">
            <Link to="/carrinho">Voltar ao carrinho</Link>
          </Button>
        )}
        <Button asChild variant="outline">
          <Link to="/pedidos">Meus pedidos</Link>
        </Button>
      </div>
    </section>
  );
}
