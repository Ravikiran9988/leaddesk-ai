import { useState, useEffect } from 'react';
import { Plus, Trash2, UserCog } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../components/AdminLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { userService } from '../services/leadService';
import { USER_ROLES, ROLE_COLORS, getErrorMessage } from '../utils/constants';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'sales_executive' });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await userService.getAll();
      setUsers(data.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreate = () => {
    setEditingUser(null);
    setForm({ name: '', email: '', password: '', role: 'sales_executive' });
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingUser) {
        const payload = { name: form.name, email: form.email, role: form.role };
        if (form.password) payload.password = form.password;
        await userService.update(editingUser._id, payload);
        toast.success('User updated');
      } else {
        await userService.create(form);
        toast.success('User created');
      }
      setModalOpen(false);
      await fetchUsers();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await userService.delete(id);
      toast.success('User deleted');
      await fetchUsers();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <AdminLayout title="User Management" subtitle="Manage admin, manager, and sales executive accounts">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-brand-600" />
            <h2 className="text-lg font-semibold text-slate-900">Team Members</h2>
          </div>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading users...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 font-medium text-slate-900">{user.name}</td>
                    <td className="px-4 py-4 text-slate-600">{user.email}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[user.role]}`}>
                        {USER_ROLES[user.role]}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(user)}>
                          Edit
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(user._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? 'Edit User' : 'Create User'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label={editingUser ? 'New Password (optional)' : 'Password'}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required={!editingUser}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Role</label>
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              required
            >
              {Object.entries(USER_ROLES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingUser ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
};

export default UsersPage;
