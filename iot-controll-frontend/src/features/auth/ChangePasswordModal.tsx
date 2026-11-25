import { useState } from "react";
import { Alert, App, Form, Input, Modal } from "antd";
import { getErrorMessage } from "../../api/axiosClient";
import { changeMyPassword, MIN_PASSWORD } from "../users/usersApi";

interface Values {
  current: string;
  next: string;
  confirm: string;
}

/** Lets any signed-in user change their own password. */
const ChangePasswordModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { message } = App.useApp();
  const [form] = Form.useForm<Values>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (v: Values) => {
    setSaving(true);
    setError(null);
    try {
      await changeMyPassword(v.current, v.next);
      message.success("Password changed.");
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't change your password."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Change password"
      okText="Change password"
      onOk={() => form.submit()}
      confirmLoading={saving}
      onCancel={onClose}
      destroyOnHidden
      afterOpenChange={(o) => {
        if (o) {
          setError(null);
          form.resetFields();
        }
      }}
    >
      <Form form={form} layout="vertical" requiredMark={false} onFinish={submit}>
        {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}
        <Form.Item name="current" label="Current password" rules={[{ required: true, message: "Enter your current password." }]}>
          <Input.Password autoComplete="current-password" autoFocus />
        </Form.Item>
        <Form.Item
          name="next"
          label="New password"
          rules={[
            { required: true, message: "Enter a new password." },
            { min: MIN_PASSWORD, message: `At least ${MIN_PASSWORD} characters.` },
          ]}
          hasFeedback
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>
        <Form.Item
          name="confirm"
          label="Confirm new password"
          dependencies={["next"]}
          hasFeedback
          rules={[
            { required: true, message: "Type the new password again." },
            ({ getFieldValue }) => ({
              validator: (_, v) =>
                !v || v === getFieldValue("next") ? Promise.resolve() : Promise.reject(new Error("Passwords don't match.")),
            }),
          ]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;
