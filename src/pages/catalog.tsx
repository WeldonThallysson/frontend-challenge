import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearch,
} from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  SlidersHorizontal,
  Search,
  ShoppingBag,
  Check,
  ArrowUpRight,
} from "lucide-react";
import {
  api,
  http,
  invalidateCommerce,
  message,
  queryClient,
  useSession,
} from "../api";
import {
  categories,
  defaultSearch,
  eth,
  networks,
  type CatalogSearch,
  type NFT,
} from "../domain";
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
export function NFTCard({
  nft,
  priority = false,
}: {
  nft: NFT;
  priority?: boolean;
}) {
  return (
    <article className="nft-card">
      <Link to="/nft/$id" params={{ id: nft.id }} className="nft-art">
        <img
          src={nft.image}
          width="640"
          height="640"
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          alt={nft.name}
        />
        <span className="art-arrow">
          <ArrowUpRight size={18} />
        </span>
        {nft.stock === 0 && <span className="sold-out">Esgotado</span>}
      </Link>
      <div className="nft-caption">
        <Link to="/nft/$id" params={{ id: nft.id }}>
          {nft.name}
        </Link>
        <div className="price">
          {eth(nft.price)}{" "}
          {nft.previousPrice && <del>{eth(nft.previousPrice)}</del>}
        </div>
      </div>
    </article>
  );
}
export function Home() {
  const search = useSearch({ from: "/" });
  const navigate = useNavigate();
  const { data: user } = useSession();
  const [q, setQ] = useState(search.q);
  const [filters, setFilters] = useState(false);
  const [max, setMax] = useState(search.max || "3");
  useEffect(() => setQ(search.q), [search.q]);
  const update = (patch: Partial<CatalogSearch>) => {
    void navigate({
      to: "/",
      search: (prev) => ({ ...prev, ...patch, page: patch.page ?? 1 }),
      hash: "mercado",
    });
  };
  const catalog = useQuery({
    queryKey: ["catalog", search, search.favorites ? user?.id : undefined],
    queryFn: ({ signal }) => api.catalog(search, signal),
  });
  const featured = useQuery({
    queryKey: ["nft", "nft-1"],
    queryFn: ({ signal }) => api.nft("nft-1", signal),
  });
  const filterContent = (
    <>
      <h2>Coleções</h2>
      <button
        className={!search.category ? "filter-active" : ""}
        onClick={() => update({ category: "" })}
      >
        Todas as coleções <span>18</span>
      </button>
      {categories.map((c) => (
        <button
          className={search.category === c ? "filter-active" : ""}
          onClick={() => update({ category: c })}
          key={c}
        >
          {c}
          <span>(2)</span>
        </button>
      ))}
      <h2 className="mt-7">Faixa de preço</h2>
      <label className="range-label">
        Até {max.replace(".", ",")} ETH
        <input
          aria-label="Preço máximo em ETH"
          type="range"
          min="0"
          max="3"
          step="0.1"
          value={max}
          onChange={(e) => setMax(e.target.value)}
        />
      </label>
      <Button size="sm" onClick={() => update({ max })}>
        Aplicar
      </Button>
      <h2 className="mt-7">Rede</h2>
      <button
        className={!search.network ? "filter-active" : ""}
        onClick={() => update({ network: "" })}
      >
        Todas as redes
      </button>
      {networks.map((n) => (
        <button
          className={search.network === n ? "filter-active" : ""}
          key={n}
          onClick={() => update({ network: n })}
        >
          {n}
        </button>
      ))}
      <Button
        className="mt-5"
        variant="outline"
        size="sm"
        onClick={() => {
          setMax("3");
          void navigate({ to: "/", search: defaultSearch, hash: "mercado" });
        }}
      >
        Limpar filtros
      </Button>
    </>
  );
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Bem-vindo à Kurio</p>
          <h1>
            SEJA DONO DO FUTURO
            <br />
            DA ARTE DIGITAL
          </h1>
          <p className="muted">
            Descubra NFTs selecionados de criadores emergentes e consagrados.
            Colecione arte digital rara, apoie artistas e tenha uma parte da
            cultura de amanhã.
          </p>
          <Button asChild>
            <a href="#mercado">
              EXPLORAR <ArrowRight size={16} />
            </a>
          </Button>
          <div className="hero-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
        </div>
        <Link to="/nft/$id" params={{ id: "nft-1" }} className="hero-art">
          <img
            src="/assets/ape-1.webp"
            width="640"
            height="640"
            fetchPriority="high"
            alt="Emerald Ape, primata de jaqueta verde e óculos de sol"
          />
        </Link>
      </section>
      <section className="catalog-layout" id="mercado">
        <aside className="sidebar">
          <div className="filter-panel">{filterContent}</div>
          <div className="featured-panel">
            <p>
              NFT EM DESTAQUE
              <br />
              <span>OFERTA LIMITADA</span>
            </p>
            <Link to="/nft/$id" params={{ id: "nft-2" }}>
              <img
                src="/assets/ape-2.webp"
                alt="Sage Nomad em destaque"
                width="640"
                height="640"
                loading="lazy"
              />
            </Link>
          </div>
        </aside>
        <div className="catalog-main">
          <div className="catalog-toolbar">
            <div className="catalog-tabs">
              <button
                className={
                  !search.favorites && search.sort === "recent" ? "active" : ""
                }
                onClick={() => update({ favorites: false, sort: "recent" })}
              >
                Todos os NFTs
              </button>
              <button onClick={() => update({ sort: "name" })}>
                Novos lançamentos
              </button>
              <button
                className={search.favorites ? "active" : ""}
                onClick={() =>
                  user
                    ? update({ favorites: !search.favorites })
                    : void navigate({
                        to: "/login",
                        search: { returnTo: "/?favorites=true" },
                      })
                }
              >
                Lista de interesse
              </button>
            </div>
            <label className="sort-label">
              <span className="sr-only">Ordenar NFTs</span>
              <select
                aria-label="Ordenar NFTs"
                value={search.sort}
                onChange={(e) => update({ sort: e.target.value })}
              >
                <option value="recent">Listados recentemente</option>
                <option value="price-asc">Menor preço</option>
                <option value="price-desc">Maior preço</option>
                <option value="name">Nome A–Z</option>
              </select>
            </label>
          </div>
          <div className="catalog-search-row">
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                update({ q });
              }}
            >
              <Search size={17} />
              <input
                id="catalog-search"
                aria-label="Buscar NFTs"
                placeholder="Encontre sua próxima coleção"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <Button size="sm" variant="ghost" type="submit">
                Buscar
              </Button>
            </form>
            <Button
              className="filter-toggle"
              variant="outline"
              onClick={() => setFilters(true)}
            >
              <SlidersHorizontal size={15} />
              Filtros
            </Button>
          </div>
          {(search.q ||
            search.category ||
            search.network ||
            search.max ||
            search.favorites) && (
            <p className="results-line">
              {catalog.data?.total ?? "…"} resultado(s)
              {search.category && ` · ${search.category}`}
              {search.network && ` · ${search.network}`}
            </p>
          )}
          {catalog.isPending ? (
            <Skeleton cards={9} />
          ) : catalog.isError ? (
            <ErrorState
              error={catalog.error}
              retry={() => void catalog.refetch()}
            />
          ) : catalog.data.items.length ? (
            <>
              <div className="nft-grid" aria-busy={catalog.isFetching}>
                {catalog.data.items.map((n, i) => (
                  <NFTCard nft={n} key={n.id} priority={i < 3} />
                ))}
              </div>
              <nav aria-label="Paginação do catálogo" className="pagination">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Página anterior"
                  disabled={search.page <= 1}
                  onClick={() => update({ page: search.page - 1 })}
                >
                  <ChevronLeft size={16} />
                </Button>
                {Array.from({ length: catalog.data.pages }, (_, i) => (
                  <Button
                    size="sm"
                    variant={search.page === i + 1 ? "default" : "ghost"}
                    aria-current={search.page === i + 1 ? "page" : undefined}
                    onClick={() => update({ page: i + 1 })}
                    key={i}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Próxima página"
                  disabled={search.page >= catalog.data.pages}
                  onClick={() => update({ page: search.page + 1 })}
                >
                  <ChevronRight size={16} />
                </Button>
              </nav>
            </>
          ) : (
            <Empty
              title="Nenhuma peça por aqui"
              description="Experimente outra busca ou combine novos filtros."
            >
              <Button
                onClick={() =>
                  void navigate({
                    to: "/",
                    search: defaultSearch,
                    hash: "mercado",
                  })
                }
              >
                Limpar busca
              </Button>
            </Empty>
          )}
        </div>
      </section>
      <section className="promos" id="criadores">
        <article>
          <img
            src="/assets/ape-1.webp"
            width="640"
            height="640"
            loading="lazy"
            alt="Coleção Emerald Ape"
          />
          <div>
            <h2>
              Lançamentos mensais
              <br />
              de edição limitada
            </h2>
            <p>
              Colecione edições exclusivas diretamente dos criadores e faça
              parte da próxima coleção.
            </p>
            <Button size="sm" asChild>
              <Link to="/nft/$id" params={{ id: featured.data?.id ?? "nft-1" }}>
                Explorar <ArrowRight size={13} />
              </Link>
            </Button>
          </div>
        </article>
        <article>
          <img
            src="/assets/ape-3.webp"
            width="640"
            height="640"
            loading="lazy"
            alt="Coleção Noir Versal"
          />
          <div>
            <h2>
              Arte digital selecionada
              <br />e muito mais
            </h2>
            <p>
              Explore novos artistas, coleções verificadas e obras digitais que
              inspiram.
            </p>
            <Button size="sm" asChild>
              <a href="#mercado">
                Explorar <ArrowRight size={13} />
              </a>
            </Button>
          </div>
        </article>
      </section>
      <section className="journal">
        <header>
          <h2>Diário da Cunhagem</h2>
          <p>
            Histórias, guias e insights para colecionadores sobre o universo da
            propriedade digital.
          </p>
        </header>
        <div className="journal-grid">
          {[
            [
              "Como funciona a propriedade de NFTs",
              "Aprenda a colecionar, negociar e verificar ativos digitais.",
            ],
            [
              "10 artistas digitais para acompanhar",
              "Conheça criadores que moldam a cultura digital.",
            ],
            [
              "Raridade, atributos e procedência",
              "Entenda raridade, procedência e detalhes únicos.",
            ],
            [
              "Como proteger sua carteira",
              "Proteção do patrimônio, boas práticas e uso consciente.",
            ],
          ].map(([title, description], i) => (
            <article key={title}>
              <img
                src={`/assets/ape-${[3, 1, 2, 4][i]}.webp`}
                alt=""
                width="640"
                height="640"
                loading="lazy"
              />
              <div>
                <small>15 de outubro · Leitura de 3 min</small>
                <h3>{title}</h3>
                <p>{description}</p>
                <span className="editorial-note">
                  Conteúdo editorial · em breve
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
      <Dialog
        open={filters}
        onOpenChange={setFilters}
        title="Filtrar coleções"
        description="Combine categoria, preço e rede."
      >
        <div className="filter-panel mobile-filter-panel">{filterContent}</div>
        <Button className="mt-5 w-full" onClick={() => setFilters(false)}>
          Ver resultados
        </Button>
      </Dialog>
    </>
  );
}
export function Detail() {
  const { id } = useParams({ strict: false });
  const navigate = useNavigate();
  const toast = useToast();
  const { data: user, isPending: sessionPending } = useSession();
  const [quantity, setQuantity] = useState(1);
  const [edition, setEdition] = useState("original");
  const [gallery, setGallery] = useState(0);
  const query = useQuery({
    queryKey: ["nft", id],
    queryFn: ({ signal }) => api.nft(id!, signal),
  });
  const favorites = useQuery({
    queryKey: ["private", user?.id, "favorites"],
    queryFn: async () => (await http.get<string[]>("/favorites")).data,
    enabled: !!user,
  });
  const favorite = favorites.data?.includes(id!) ?? false;
  const toggle = useMutation({
    mutationFn: async (desired: boolean) => {
      if (!user) {
        void navigate({ to: "/login", search: { returnTo: `/nft/${id}` } });
        return;
      }
      await http[desired ? "post" : "delete"](`/favorites/${id}`);
    },
    onMutate: async (desired: boolean) => {
      if (!user) return;
      const key = ["private", user.id, "favorites"];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<string[]>(key);
      queryClient.setQueryData(
        key,
        desired
          ? [...(previous ?? []), id!]
          : previous?.filter((x) => x !== id),
      );
      return { previous, key };
    },
    onError: (e, _v, context) => {
      if (context) queryClient.setQueryData(context.key, context.previous);
      toast(message(e));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: ["private", user?.id, "favorites"],
      });
    },
  });
  const add = useMutation({
    mutationFn: async () => {
      await http.post("/cart", { nftId: id, edition, quantity });
    },
    onSuccess: () => {
      void invalidateCommerce();
      toast("NFT adicionado ao carrinho.");
    },
    onError: (e) => toast(message(e)),
  });
  if (query.isPending)
    return (
      <div
        className="detail-loading"
        role="status"
        aria-label="Carregando conteúdo"
      >
        <div className="breadcrumbs">
          <div className="skeleton h-4 w-64" />
        </div>
        <div className="detail-layout">
          <div className="gallery">
            <div className="thumbnails">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="skeleton aspect-square w-full" />
              ))}
            </div>
            <div className="detail-art skeleton" />
          </div>
          <div className="detail-info">
            <div className="skeleton h-4 w-2/3 mb-5" />
            <div className="skeleton h-10 mb-7" />
            <div className="skeleton h-24 mb-7" />
            <div className="skeleton h-12 w-1/2 mb-7" />
            <div className="skeleton h-12 mb-7" />
            <div className="skeleton h-12 mb-7" />
          </div>
        </div>
        <div className="skeleton h-40 mb-10" />
        <div className="skeleton h-60" />
      </div>
    );
  if (query.isError)
    return (
      <ErrorState error={query.error} retry={() => void query.refetch()} />
    );
  const nft = query.data;
  const selected = nft.editions.find((e) => e.id === edition)!;
  return (
    <>
      <div className="breadcrumbs">
        <Link to="/">Início</Link>
        <span>/</span>
        <Link to="/" hash="mercado">
          Mercado
        </Link>
        <span>/</span>
        <span>{nft.name}</span>
      </div>
      <section className="detail-layout">
        <div className="gallery">
          <div className="thumbnails">
            {[0, 1, 2, 3].map((i) => (
              <button
                className={i === gallery ? "selected" : ""}
                key={i}
                aria-label={`Vista ${i + 1} de ${nft.name}`}
                onClick={() => setGallery(i)}
              >
                <img src={nft.image} alt="" />
              </button>
            ))}
          </div>
          <img
            className={`detail-art view-${gallery}`}
            src={nft.image}
            width="640"
            height="640"
            alt={nft.name}
          />
        </div>
        <div className="detail-info">
          <p className="eyebrow">
            {nft.category} · {nft.network}
          </p>
          <div className="flex justify-between items-start gap-4">
            <h1>{nft.name}</h1>
            <Button
              variant="outline"
              size="icon"
              aria-label={
                favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"
              }
              aria-pressed={favorite}
              onClick={() => toggle.mutate(!favorite)}
              disabled={
                toggle.isPending ||
                sessionPending ||
                (!!user && favorites.isPending)
              }
            >
              <Heart size={18} fill={favorite ? "currentColor" : "none"} />
            </Button>
          </div>
          <p className="creator">
            Criado por{" "}
            <span>
              {nft.creator} <Check size={13} />
            </span>
          </p>
          <p className="detail-description">
            Uma expressão única da cultura digital. Traços marcantes,
            personalidade e detalhes que fazem desta peça uma parte especial da
            sua coleção.
          </p>
          <div className="detail-price">
            <span>Preço atual</span>
            <strong>{eth(nft.price)}</strong>
            {nft.previousPrice && <del>{eth(nft.previousPrice)}</del>}
          </div>
          <Field label="Edição">
            <select
              value={edition}
              onChange={(e) => {
                setEdition(e.target.value);
                setQuantity(1);
              }}
            >
              {nft.editions.map((e) => (
                <option key={e.id} value={e.id} disabled={!e.stock}>
                  {e.label}
                </option>
              ))}
            </select>
          </Field>
          <div className="quantity-line">
            <Field label="Quantidade">
              <input
                aria-label="Quantidade"
                type="number"
                min="1"
                max={Math.min(selected.stock, nft.stock)}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </Field>
            <span className="muted">
              {Math.min(selected.stock, nft.stock)} disponíveis
            </span>
          </div>
          <div className="detail-buy">
            <Button
              disabled={
                add.isPending ||
                quantity < 1 ||
                quantity > selected.stock ||
                !nft.stock
              }
              onClick={() => add.mutate()}
            >
              <ShoppingBag size={16} />
              {add.isPending ? "Adicionando…" : "Adicionar ao carrinho"}
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await add.mutateAsync();
                  void navigate({ to: "/pagamento" });
                } catch {
                  /* feedback mutation */
                }
              }}
              disabled={
                add.isPending ||
                !nft.stock ||
                quantity < 1 ||
                quantity > selected.stock
              }
            >
              Comprar agora <ArrowRight size={15} />
            </Button>
          </div>
          <p className="simulation-note">
            Compra demonstrativa · sem cobrança real
          </p>
        </div>
      </section>
      <section className="nft-description">
        <PageTitle title="Detalhes do NFT" />
        <p>
          {nft.name} é uma peça da coleção {nft.creator}. Cada edição carrega
          identidade própria e uma conexão com o universo criativo da arte
          digital.
        </p>
        <dl>
          <div>
            <dt>Rede</dt>
            <dd>{nft.network}</dd>
          </div>
          <div>
            <dt>Contrato</dt>
            <dd>
              0x42…{nft.id.replace("nft-", "").padStart(4, "0")} · simulado
            </dd>
          </div>
          <div>
            <dt>Direitos autorais</dt>
            <dd>A compra não transfere direitos autorais.</dd>
          </div>
        </dl>
      </section>
      <Related />
    </>
  );
}
export function Related() {
  const { data } = useQuery({
    queryKey: ["catalog", "related"],
    queryFn: ({ signal }) => api.catalog(defaultSearch, signal),
  });
  return (
    <section className="related">
      <div className="section-heading">
        <h2>Mais desta coleção</h2>
        <Link to="/" hash="mercado">
          Explorar mercado <ArrowRight size={14} />
        </Link>
      </div>
      <div className="related-grid">
        {data?.items.slice(1, 6).map((n) => (
          <NFTCard key={n.id} nft={n} />
        ))}
      </div>
    </section>
  );
}
