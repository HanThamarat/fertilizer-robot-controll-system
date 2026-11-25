import { useEffect, useMemo, useState } from "react";
import { Alert, App, Button, Dropdown, Input, Table, Tag, type TableColumnsType } from "antd";
import { MoreOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { getErrorMessage } from "../../api/axiosClient";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { refreshMe } from "../auth/authSlice";
import UserFormModal, { type UserFormMode } from "./UserFormModal";
import { deleteUser, fetchUsers, ROLE_INFO, type User } from "./usersApi";
import "./users.css";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });

const UsersPage = () => {
  const { message, modal } = App.useApp();
  const dispatch = useAppDispatch();
  const me = useAppSelector((s) => s.auth.user);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<UserFormMode | null>(null);

  /** Bumped by Retry to fetch the list again. */
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    document.title = "Users · Fertilizer Robot Control";
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchUsers()
      .then((list) => {
        if (cancelled) return;
        setUsers(list);
        setLoadError(null);
      })
      .catch((err) => !cancelled && setLoadError(getErrorMessage(err, "Couldn't load users.")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = () => {
    setLoading(true);
    setLoadError(null);
    setAttempt((n) => n + 1);
  };

  const adminCount = users.filter((u) => u.role === "admin").length;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? users.filter((u) => u.name.toLowerCase().includes(q) || u.email.includes(q)) : users;
  }, [users, query]);

  const onSaved = (u: User, text: string) => {
    setUsers((list) => (list.some((x) => x.email === u.email) ? list.map((x) => (x.email === u.email ? u : x)) : [...list, u]));
    setForm(null);
    message.success(text);
    if (u.email === me?.email) dispatch(refreshMe());
  };

  const confirmDelete = (u: User) => {
    modal.confirm({
      title: `Delete ${u.name}?`,
      content: `${u.email} will be signed out and can't sign in again. This can't be undone.`,
      okText: "Delete user",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteUser(u.email);
          setUsers((list) => list.filter((x) => x.email !== u.email));
          message.success(`Deleted ${u.name}.`);
        } catch (err) {
          message.error(getErrorMessage(err, "Couldn't delete the user."));
        }
      },
    });
  };

  const columns: TableColumnsType<User> = [
    {
      title: "User",
      key: "user",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (_, u) => (
        <div className="user-cell">
          <span className="user-cell__avatar" aria-hidden>
            {u.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <div className="user-cell__name">
              {u.name}
              {u.email === me?.email && <span className="user-cell__you">You</span>}
            </div>
            <div className="user-cell__email">{u.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      width: 140,
      filters: [
        { text: "Admin", value: "admin" },
        { text: "Operator", value: "operator" },
      ],
      onFilter: (v, u) => u.role === v,
      render: (r: User["role"]) => <Tag color={r === "admin" ? "blue" : undefined}>{ROLE_INFO[r].label}</Tag>,
    },
    {
      title: "Added",
      dataIndex: "createdAt",
      width: 150,
      responsive: ["md"],
      sorter: (a, b) => a.createdAt.localeCompare(b.createdAt),
      render: (d: string) => <span className="tabular">{formatDate(d)}</span>,
    },
    {
      key: "actions",
      width: 56,
      align: "right",
      render: (_, u) => {
        const isSelf = u.email === me?.email;
        const lastAdmin = u.role === "admin" && adminCount <= 1;
        return (
          <Dropdown
            trigger={["click"]}
            placement="bottomRight"
            menu={{
              items: [
                { key: "edit", label: "Edit name and role" },
                { key: "password", label: "Set new password" },
                { type: "divider" },
                {
                  key: "delete",
                  label: isSelf ? "Delete (can't delete yourself)" : lastAdmin ? "Delete (only admin)" : "Delete user",
                  danger: true,
                  disabled: isSelf || lastAdmin,
                },
              ],
              onClick: ({ key }) => {
                if (key === "edit") setForm({ kind: "edit", user: u });
                if (key === "password") setForm({ kind: "password", user: u });
                if (key === "delete") confirmDelete(u);
              },
            }}
          >
            <Button type="text" icon={<MoreOutlined />} aria-label={`Actions for ${u.name}`} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="page">
      <header className="page__head">
        <div>
          <h1>Users</h1>
          <p>Who can sign in to this dashboard and what they can do.</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setForm({ kind: "add" })}>
          Add user
        </Button>
      </header>

      {loadError ? (
        <Alert
          type="error"
          showIcon
          title={loadError}
          action={
            <Button size="small" onClick={retry}>
              Retry
            </Button>
          }
        />
      ) : (
        <>
          <div className="users__toolbar">
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Find by name or email"
              aria-label="Find users"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <span className="users__count tabular">
              {users.length} {users.length === 1 ? "user" : "users"} · {adminCount} {adminCount === 1 ? "admin" : "admins"}
            </span>
          </div>
          <Table
            className="users__table"
            rowKey="email"
            columns={columns}
            dataSource={visible}
            loading={loading}
            pagination={visible.length > 20 ? { pageSize: 20 } : false}
            locale={{ emptyText: query ? `No users match "${query}".` : "No users yet." }}
          />
        </>
      )}

      <UserFormModal mode={form} selfEmail={me?.email} onClose={() => setForm(null)} onSaved={onSaved} />
    </div>
  );
};

export default UsersPage;
