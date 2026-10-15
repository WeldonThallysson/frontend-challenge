import {
  useCallback,
  useEffect,
  useState,
  createContext,
  useContext,
} from "react";
import {
  Link,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import {
  Menu,
  Search,
  ShoppingCart,
  LogIn,
  UserRound,
  ArrowUpRight,
  ShieldCheck,
  Wallet,
  Globe2,
  Radio,
  FlaskConical,
} from "lucide-react";
import { http, queryClient, useCart, useSession } from "./api";
import { useRealtime } from "./realtime";
import { Button } from "./components/ui/button";
import { Dialog } from "./components/ui/dialog";
const ToastContext = createContext<(text: string) => void>(() => {});
export const useToast = () => useContext(ToastContext);
export function AppShell() {
  const { data: user } = useSession();
  const { data: cart } = useCart(user);
  const [toast, setToast] = useState("");
  const notify = useCallback((text: string) => setToast(text), []);
  const connected = useRealtime(user?.id, notify);
  const [menu, setMenu] = useState(false);
  const [demo, setDemo] = useState(false);
  const [scenario, setScenario] = useState("standard");
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 6500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const listener = () => {
      if (
        ["/pagamento", "/perfil", "/carteiras", "/pedidos"].includes(
          location.pathname,
        ) ||
        location.pathname.startsWith("/pedido/")
      )
        void navigate({
          to: "/login",
          search: { returnTo: location.pathname },
        });
    };
    window.addEventListener("kurio:session-expired", listener);
    return () => window.removeEventListener("kurio:session-expired", listener);
  }, [navigate]);
  useEffect(() => {
    setMenu(false);
  }, [pathname]);
  return (
    <ToastContext.Provider value={notify}>
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" to="/" aria-label="KURIO início">
            KURIO<span>®</span>
          </Link>
          <nav className="desktop-nav" aria-label="Principal">
            <Link to="/" className={pathname === "/" ? "active" : ""}>
              Início
            </Link>
            <Link to="/" hash="mercado">
              Mercado
            </Link>
            <a href="#criadores">Criadores</a>
            <a href="#sobre">Aprenda</a>
          </nav>
          <div className="header-actions">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Buscar NFTs"
              onClick={() => {
                void navigate({ to: "/", hash: "mercado" });
                setTimeout(
                  () => document.getElementById("catalog-search")?.focus(),
                  100,
                );
              }}
            >
              <Search size={19} />
            </Button>
            <Link
              to="/carrinho"
              className="cart-link"
              aria-label={`Carrinho, ${cart?.reduce((a, x) => a + x.quantity, 0) ?? 0} itens`}
            >
              <ShoppingCart size={20} />
              {!!cart?.length && (
                <span>{cart.reduce((a, x) => a + x.quantity, 0)}</span>
              )}
            </Link>
            <Button size="sm" asChild>
              {user ? (
                <Link to="/perfil" aria-label="Meu perfil">
                  <UserRound size={15} />
                  <span className="login-label">{user.name.split(" ")[0]}</span>
                </Link>
              ) : (
                <Link to="/login" aria-label="Entrar na conta">
                  <LogIn size={15} />
                  <span className="login-label">Entrar</span>
                </Link>
              )}
            </Button>
            <Button
              className="mobile-menu"
              variant="ghost"
              size="icon"
              aria-label="Abrir navegação"
              onClick={() => setMenu(true)}
            >
              <Menu size={20} />
            </Button>
          </div>
        </div>
      </header>
      <main id="conteudo" tabIndex={-1} className="site-main">
        <Outlet />
      </main>
      <section className="trust-strip" id="sobre">
        <div>
          <ShieldCheck />
          <h3>Segurança em cada coleção</h3>
          <p>Uma experiência transparente, do primeiro olhar à sua coleção.</p>
        </div>
        <div>
          <Wallet />
          <h3>Sua arte, sua identidade</h3>
          <p>Descubra peças e artistas que combinam com o seu universo.</p>
        </div>
        <div>
          <Globe2 />
          <h3>Um novo mundo criativo</h3>
          <p>Conecte-se à arte digital, onde quer que você esteja.</p>
        </div>
        <div>
          <Radio />
          <h3>Sempre em movimento</h3>
          <p>Preços e disponibilidade atualizados em tempo real.</p>
        </div>
      </section>
      <footer className="site-footer">
        <div className="footer-top">
          <div>
            <Link to="/" className="brand">
              KURIO<span>®</span>
            </Link>
            <p>
              Arte digital real.
              <br />
              Um universo de possibilidades.
            </p>
          </div>
          <div>
            <h3>Explore</h3>
            <Link to="/" hash="mercado">
              Mercado <ArrowUpRight size={12} />
            </Link>
            <Link to="/carrinho">Meu carrinho</Link>
            <Link to="/pedidos">Meus pedidos</Link>
          </div>
          <div>
            <h3>Meu perfil</h3>
            <Link to="/perfil">Dados do perfil</Link>
            <Link to="/carteiras">Carteiras</Link>
            <Link to="/" search={(s) => ({ ...s, favorites: true })}>
              Lista de interesse
            </Link>
          </div>
          <div>
            <h3>Experimente o KURIO</h3>
            <p>
              Projeto demonstrativo.
              <br />
              Nenhuma compra ou moeda real.
            </p>
            <Button variant="outline" size="sm" onClick={() => setDemo(true)}>
              <FlaskConical size={14} />
              Cenários de demonstração
            </Button>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 KURIO. Feito para colecionar.</span>
          <span className="connection">
            <i className={connected ? "online" : ""} />
            {connected ? "Atualizações ao vivo" : "Reconectando atualizações…"}
          </span>
        </div>
      </footer>
      <div className="toast" role="status" aria-live="polite">
        {toast && (
          <div>
            {toast}
            <button
              onClick={() => setToast("")}
              aria-label="Dispensar mensagem"
            >
              ×
            </button>
          </div>
        )}
      </div>
      <Dialog
        open={menu}
        onOpenChange={setMenu}
        title="Explore o KURIO"
        description="Sua próxima coleção começa aqui."
      >
        <nav className="mobile-links">
          <Link to="/">Início</Link>
          <Link to="/" hash="mercado">
            Mercado
          </Link>
          <Link to="/perfil">Meu perfil</Link>
          <Link to="/carteiras">Carteiras</Link>
          <Link to="/pedidos">Pedidos</Link>
        </nav>
      </Dialog>
      <Dialog
        open={demo}
        onOpenChange={setDemo}
        title="Laboratório de cenários"
        description="Controle a API simulada e os eventos reais do cliente Socket.IO."
      >
        <label className="field">
          Cenário
          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
          >
            {[
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
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap gap-3 my-5">
          <Button
            onClick={async () => {
              await http.post("/demo/scenario", { scenario });
              await queryClient.invalidateQueries();
              notify("Cenário atualizado.");
              setDemo(false);
            }}
          >
            Aplicar cenário
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              await http.post("/demo/reset", { scenario });
              localStorage.removeItem("kurio:attempt");
              localStorage.removeItem("kurio:coupon");
              location.href = "/";
            }}
          >
            Reset completo
          </Button>
        </div>
        <p className="muted mb-3">Eventos sobre Emerald Ape #042:</p>
        <div className="flex gap-2 flex-wrap">
          {[
            ["price", "Alterar preço"],
            ["stock", "Esgotar edição"],
            ["duplicate", "Evento duplicado"],
            ["old", "Evento antigo"],
            ["disconnect", "Interromper conexão"],
            ["expire", "Expirar sessão"],
          ].map(([type, label]) => (
            <Button
              key={type}
              variant="outline"
              size="sm"
              onClick={async () => {
                await http.post("/demo/event", { type });
                notify(`Evento enviado: ${label}`);
              }}
            >
              {label}
            </Button>
          ))}
        </div>
        <p className="muted mt-5 text-xs">
          Contas: ana@kurio.demo e leo@kurio.demo
          <br />
          Senha fictícia: Kurio123!
        </p>
      </Dialog>
    </ToastContext.Provider>
  );
}
