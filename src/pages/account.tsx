import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  LogOut,
  UserRound,
  Wallet as WalletIcon,
  Heart,
  Package,
  Check,
  Plus,
} from "lucide-react";
import { api, http, message, queryClient, useSession } from "../api";
import { eth, networks, type Order, type User, type Wallet } from "../domain";
import { useToast } from "../shell";
import { Button } from "../components/ui/button";
import {
  Empty,
  ErrorState,
  Field,
  PageTitle,
  Skeleton,
} from "../components/shared";
export function AuthPage({ register = false }: { register?: boolean }) {
  const search = useSearch({ strict: false }) as { returnTo?: string };
  const navigate = useNavigate();
  const toast = useToast();
  const [error, setError] = useState("");
  const mutation = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      if (register) await http.post("/register", data);
      return (await http.post<User>("/login", data)).data;
    },
    onSuccess: async (user) => {
      queryClient.clear();
      queryClient.setQueryData(["session"], user);
      await navigate({ to: search.returnTo || "/perfil" });
      toast(
        register
          ? "Sua conta foi criada. Bem-vindo à Kurio!"
          : "Bom ter você de volta.",
      );
    },
    onError: (e) => setError(message(e)),
  });
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const values = Object.fromEntries(new FormData(e.currentTarget)) as Record<
      string,
      string
    >;
    if (register && values.password !== values.confirmPassword) {
      setError("As senhas precisam ser iguais.");
      return;
    }
    mutation.mutate(values);
  };
  return (
    <section className="auth-layout">
      <div className="auth-story">
        <p className="eyebrow">Seu próximo capítulo começa aqui</p>
        <h1>
          SEJA DONO DO
          <br />
          SEU UNIVERSO
          <br />
          <span>DIGITAL.</span>
        </h1>
        <p className="muted">
          Colecione o extraordinário.
          <br />
          Faça parte de uma nova cultura.
        </p>
        <img
          src="/assets/ape-1.webp"
          alt="Emerald Ape da coleção Kurio"
          width="640"
          height="640"
        />
      </div>
      <div className="auth-form-panel">
        <p className="eyebrow">KURIO COLLECTORS CLUB</p>
        <h2>{register ? "Crie sua conta" : "Bem-vindo de volta"}</h2>
        <p className="muted">
          {register
            ? "Seu primeiro passo para uma coleção única."
            : "Entre para continuar sua jornada de colecionador."}
        </p>
        <form onSubmit={submit} className="form-stack">
          {register && (
            <Field label="Nome completo">
              <input name="name" autoComplete="name" required minLength={2} />
            </Field>
          )}
          <Field label="E-mail">
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="voce@exemplo.com"
            />
          </Field>
          <Field label="Senha">
            <input
              name="password"
              type="password"
              autoComplete={register ? "new-password" : "current-password"}
              required
              minLength={8}
              pattern={register ? "(?=.*[A-Z])(?=.*[0-9]).{8,}" : undefined}
              aria-describedby={register ? "password-help" : undefined}
            />
          </Field>
          {register && (
            <>
              <small id="password-help" className="muted">
                Use 8 caracteres ou mais, com maiúscula e número.
              </small>
              <Field label="Confirmar senha">
                <input
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </Field>
            </>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending
              ? "Aguarde…"
              : register
                ? "Criar conta"
                : "Entrar"}
            <ArrowRight size={16} />
          </Button>
        </form>
        <p className="auth-switch">
          {register ? "Já tem uma conta?" : "Ainda não tem uma conta?"}{" "}
          <Link to={register ? "/login" : "/cadastro"}>
            {register ? "Entre aqui" : "Cadastre-se"}
          </Link>
        </p>
        <div className="demo-credentials">
          <span>EXPERIMENTE A DEMONSTRAÇÃO</span>
          <p>ana@kurio.demo · Kurio123!</p>
          <small>Use apenas dados fictícios nesta aplicação.</small>
        </div>
      </div>
    </section>
  );
}
export function AccountLayout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const toast = useToast();
  return (
    <div className="account-layout">
      <aside className="account-nav">
        <h2>Meu perfil</h2>
        <Link to="/perfil" activeProps={{ className: "active" }}>
          <UserRound size={15} />
          Dados do perfil
        </Link>
        <Link to="/carteiras" activeProps={{ className: "active" }}>
          <WalletIcon size={15} />
          Carteiras
        </Link>
        <Link to="/pedidos" activeProps={{ className: "active" }}>
          <Package size={15} />
          Meus pedidos
        </Link>
        <Link to="/" search={(s) => ({ ...s, favorites: true })}>
          <Heart size={15} />
          Lista de interesse
        </Link>
        <button
          onClick={async () => {
            await http.post("/logout");
            queryClient.clear();
            localStorage.removeItem("kurio:attempt");
            void navigate({ to: "/" });
            toast("Você saiu da sua conta.");
          }}
        >
          <LogOut size={15} />
          Sair
        </button>
      </aside>
      <section className="account-content">
        <PageTitle title={title} />
        {children}
      </section>
    </div>
  );
}
export function Profile() {
  const { data: user, isPending } = useSession();
  if (isPending || !user) return <Skeleton cards={2} />;
  return (
    <AccountLayout title="Perfil do colecionador">
      <ProfileForm key={user.id} user={user} />
    </AccountLayout>
  );
}
function ProfileForm({ user }: { user: User }) {
  const toast = useToast();
  const [avatar, setAvatar] = useState(user.avatar);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const save = useMutation({
    mutationFn: async (data: Record<string, string>) =>
      (await http.patch<User>("/profile", { ...data, avatar })).data,
    onSuccess: (u) => {
      queryClient.setQueryData(["session"], u);
      toast("Perfil atualizado com sucesso.");
    },
    onError: (e) => setError(message(e)),
  });
  const password = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      if (data.password !== data.confirmPassword)
        throw new Error("As senhas precisam ser iguais.");
      await http.post("/password", data);
    },
    onSuccess: () => toast("Senha alterada com sucesso."),
    onError: (e) => setPasswordError(message(e)),
  });
  return (
    <>
      <form
        className="form-grid"
        onSubmit={(e) => {
          e.preventDefault();
          setError("");
          save.mutate(
            Object.fromEntries(new FormData(e.currentTarget)) as Record<
              string,
              string
            >,
          );
        }}
      >
        <Field label="Nome de exibição *">
          <input
            name="name"
            defaultValue={user.name}
            required
            autoComplete="name"
          />
        </Field>
        <Field label="Nome de usuário *">
          <input
            name="username"
            defaultValue={user.username}
            required
            pattern="[a-zA-Z0-9_-]{2,30}"
          />
        </Field>
        <Field label="E-mail *">
          <input
            name="email"
            defaultValue={user.email}
            required
            type="email"
            autoComplete="email"
          />
        </Field>
        <Field label="Nome ENS">
          <input name="ens" defaultValue={user.ens} placeholder="seunome.eth" />
        </Field>
        <Field label="Apelido da carteira">
          <input name="walletAlias" defaultValue={user.walletAlias} />
        </Field>
        <div className="avatar-field">
          <span>Avatar</span>
          <div>
            <img src={avatar} width="56" height="56" alt="Seu avatar" />
            <label className="upload-button">
              Alterar
              <input
                aria-label="Alterar avatar"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (
                    file.size > 1000000 ||
                    !["image/png", "image/jpeg", "image/webp"].includes(
                      file.type,
                    )
                  ) {
                    setError("Selecione PNG, JPEG ou WebP de até 1 MB.");
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = () => setAvatar(String(reader.result));
                  reader.readAsDataURL(file);
                }}
              />
            </label>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => setAvatar("/assets/ape-1.webp")}
            >
              Remover
            </Button>
          </div>
        </div>
        {error && (
          <p className="form-error full-width" role="alert">
            {error}
          </p>
        )}
        <div className="full-width">
          <Button disabled={save.isPending}>
            {save.isPending ? "Salvando…" : "Salvar alterações"}
          </Button>
        </div>
      </form>
      <section className="password-section">
        <h2>Alterar senha</h2>
        <p className="muted">
          Use uma senha exclusiva para sua conta de demonstração.
        </p>
        <form
          className="form-grid mt-5"
          onSubmit={(e) => {
            e.preventDefault();
            setPasswordError("");
            password.mutate(
              Object.fromEntries(new FormData(e.currentTarget)) as Record<
                string,
                string
              >,
            );
          }}
        >
          <Field label="Senha atual">
            <input
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
            />
          </Field>
          <div />
          <Field label="Nova senha">
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              pattern="(?=.*[A-Z])(?=.*[0-9]).{8,}"
            />
          </Field>
          <Field label="Confirmar nova senha">
            <input
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </Field>
          {passwordError && (
            <p className="form-error full-width" role="alert">
              {passwordError}
            </p>
          )}
          <Button className="justify-self-start" disabled={password.isPending}>
            Atualizar senha
          </Button>
        </form>
      </section>
    </>
  );
}
export function Wallets() {
  const { data: user } = useSession();
  const query = useQuery({
    queryKey: ["private", user?.id, "wallets"],
    queryFn: ({ signal }) => api.wallets(signal),
    enabled: !!user,
  });
  const [editing, setEditing] = useState<Wallet | null>(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();
  const mutation = useMutation({
    mutationFn: async (data: Record<string, string>) =>
      (
        await http.post<Wallet[]>("/wallets", {
          ...data,
          id: editing?.id,
          primary: data.primary === "on",
        })
      ).data,
    onSuccess: (wallets) => {
      queryClient.setQueryData(["private", user?.id, "wallets"], wallets);
      void queryClient.invalidateQueries({ queryKey: ["session"] });
      setAdding(false);
      setEditing(null);
      toast("Carteira salva com sucesso.");
    },
    onError: (e) => setError(message(e)),
  });
  return (
    <AccountLayout title="Suas carteiras">
      <p className="muted mb-6">
        Gerencie suas carteiras para colecionar com tranquilidade.
      </p>
      {query.isPending ? (
        <Skeleton cards={1} />
      ) : query.isError ? (
        <ErrorState error={query.error} retry={() => void query.refetch()} />
      ) : (
        <div className="wallet-list">
          {query.data.map((w) => (
            <article className="wallet-card" key={w.id}>
              <WalletIcon size={25} />
              <div>
                <h2>
                  {w.label}{" "}
                  {w.primary && <span className="badge">Principal</span>}
                </h2>
                <p>{w.network}</p>
                <code>{w.address}</code>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditing(w);
                  setAdding(true);
                  setError("");
                }}
              >
                Editar
              </Button>
            </article>
          ))}
        </div>
      )}
      {!adding ? (
        <Button
          className="mt-6"
          onClick={() => {
            setEditing(null);
            setAdding(true);
            setError("");
          }}
        >
          <Plus size={15} />
          Adicionar carteira
        </Button>
      ) : (
        <form
          key={editing?.id ?? "new"}
          className="form-grid mt-8"
          onSubmit={(e) => {
            e.preventDefault();
            setError("");
            mutation.mutate(
              Object.fromEntries(new FormData(e.currentTarget)) as Record<
                string,
                string
              >,
            );
          }}
        >
          <Field label="Apelido da carteira">
            <input name="label" required defaultValue={editing?.label} />
          </Field>
          <Field label="Rede">
            <select
              name="network"
              defaultValue={editing?.network ?? "Ethereum"}
            >
              {networks.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </Field>
          <div className="full-width">
            <Field label="Endereço simulado">
              <input
                name="address"
                required
                defaultValue={editing?.address}
                pattern="0x[a-fA-F0-9]{40}"
                placeholder="0x + 40 caracteres hexadecimais"
              />
            </Field>
          </div>
          <label className="check-label full-width">
            <input
              type="checkbox"
              name="primary"
              defaultChecked={editing?.primary}
            />
            Definir como principal
          </label>
          {error && (
            <p role="alert" className="form-error full-width">
              {error}
            </p>
          )}
          <div className="flex gap-3 full-width">
            <Button disabled={mutation.isPending}>
              <Check size={15} />
              Salvar carteira
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setAdding(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}
      <p className="simulation-note mt-8">
        Carteiras e conexões são simuladas. Não use endereços ou credenciais
        reais.
      </p>
    </AccountLayout>
  );
}
export function Orders() {
  const { data: user } = useSession();
  const query = useQuery({
    queryKey: ["private", user?.id, "orders"],
    queryFn: async () => (await http.get<Order[]>("/orders")).data,
    enabled: !!user,
  });
  return (
    <AccountLayout title="Meus pedidos">
      {query.isPending ? (
        <Skeleton cards={1} />
      ) : query.isError ? (
        <ErrorState error={query.error} retry={() => void query.refetch()} />
      ) : query.data.length ? (
        <div className="order-list">
          {query.data.map((o) => (
            <Link key={o.id} to="/pedido/$id" params={{ id: o.id }}>
              <div>
                <span>Pedido #{o.id.slice(0, 8)}</span>
                <small>
                  {new Date(o.createdAt).toLocaleDateString("pt-BR")}
                </small>
              </div>
              <span className={`order-status ${o.status}`}>
                {o.status === "confirmed"
                  ? "Confirmado"
                  : o.status === "declined"
                    ? "Recusado"
                    : "Pendente"}
              </span>
              <strong>{eth(o.quote.total)}</strong>
              <ArrowRight size={16} />
            </Link>
          ))}
        </div>
      ) : (
        <Empty
          title="Sua coleção começa aqui"
          description="Quando você fizer uma compra, seu pedido aparecerá aqui."
        />
      )}
    </AccountLayout>
  );
}
