import { useState } from "react";
import { Alert, Form, Input, Modal, Radio } from "antd";
import { getErrorMessage } from "../../api/axiosClient";
import { createUser, MIN_PASSWORD, ROLE_INFO, updateUser, type Role, type User } from "./usersApi";

export type UserFormMode = { kind: "add" } | { kind: "edit"; user: User } | { kind: "password"; user: User };

interface Props {
  mode: UserFormMode | null;
  /** Editing your own account: role can't be changed here */
  selfEmail?: string;
  onClose: () => void;
  onSaved: (user: User, message: string) => void;
}

interface Values {
  email: string;
  name: string;
  role: Role;
  password: string;
  confirm: string;
}

const passwordRules = [
  { required: true, message: "Enter a password." },
  { min: MIN_PASSWORD, message: `At least ${MIN_PASSWORD} characters.` },
];

const confirmRule = ({ getFieldValue }: { getFieldValue: (n: string) => unknown }) => ({
  validator: (_: unknown, v: string) =>
    !v || v === getFieldValue("password") ? Promise.resolve() : Promise.reject(new Error("Passwords don't match.")),
});

/** One modal for: add user, edit name/role, and set a new password. */
const UserFormModal = ({ mode, selfEmail, onClose, onSaved }: Props) => {
  const [form] = Form.useForm<Values>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdd = mode?.kind === "add";
  const isPassword = mode?.kind === "password";
  const user = mode && mode.kind !== "add" ? mode.user : null;
  const isSelf = !!user && user.email === selfEmail;

  const title = isAdd ? "Add user" : isPassword ? `Set new password for ${user?.name}` : `Edit ${user?.name}`;
  const okText = isAdd ? "Add user" : isPassword ? "Set password" : "Save changes";

  const submit = async (v: Values) => {
    setSaving(true);
    setError(null);
    try {
      if (isAdd) {
        const u = await createUser({ email: v.email.trim(), name: v.name.trim(), role: v.role, password: v.password });
        onSaved(u, `Added ${u.name}. Share the password with them securely.`);
      } else if (isPassword && user) {
        const u = await updateUser(user.email, { password: v.password });
        onSaved(u, `New password set for ${u.name}.`);
      } else if (user) {
        const u = await updateUser(user.email, { name: v.name.trim(), ...(isSelf ? {} : { role: v.role }) });
        onSaved(u, `Saved ${u.name}.`);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't save. Try again."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={!!mode}
      title={title}
      okText={okText}
      onOk={() => form.submit()}
      confirmLoading={saving}
      onCancel={onClose}
      destroyOnHidden
      afterOpenChange={(open) => {
        if (!open) return;
        setError(null);
        form.resetFields();
        if (user) form.setFieldsValue({ name: user.name, role: user.role });
      }}
    >
      <Form form={form} layout="vertical" requiredMark={false} onFinish={submit} initialValues={{ role: "operator" }}>
        {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}

        {isAdd && (
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Enter an email." },
              { type: "email", message: "Enter a valid email." },
            ]}
          >
            <Input autoComplete="off" placeholder="name@example.com" autoFocus />
          </Form.Item>
        )}

        {!isPassword && (
          <>
            <Form.Item name="name" label="Name" rules={[{ required: true, whitespace: true, message: "Enter a name." }]}>
              <Input autoComplete="off" autoFocus={!isAdd} />
            </Form.Item>
            <Form.Item
              name="role"
              label="Role"
              extra={isSelf ? "You can't change your own role." : undefined}
            >
              <Radio.Group disabled={isSelf} className="role-pick">
                {(Object.keys(ROLE_INFO) as Role[]).map((r) => (
                  <Radio key={r} value={r}>
                    <strong>{ROLE_INFO[r].label}</strong>
                    <span>{ROLE_INFO[r].hint}</span>
                  </Radio>
                ))}
              </Radio.Group>
            </Form.Item>
          </>
        )}

        {(isAdd || isPassword) && (
          <>
            <Form.Item name="password" label={isAdd ? "Password" : "New password"} rules={passwordRules} hasFeedback>
              <Input.Password autoComplete="new-password" autoFocus={isPassword} />
            </Form.Item>
            <Form.Item
              name="confirm"
              label="Confirm password"
              dependencies={["password"]}
              rules={[{ required: true, message: "Type the password again." }, confirmRule]}
              hasFeedback
            >
              <Input.Password autoComplete="new-password" />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default UserFormModal;
