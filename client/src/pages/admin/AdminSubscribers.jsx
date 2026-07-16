import { useState, useEffect } from 'react';
import { getSubscribers } from '../../api/newsletter';

export default function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSubscribers = async () => {
      try {
        const data = await getSubscribers();
        setSubscribers(data);
      } catch (err) {
        setError('Failed to load subscribers.');
      } finally {
        setLoading(false);
      }
    };

    loadSubscribers();
  }, []);

  if (loading) {
    return <p className="text-buyko-text-dim text-center py-10">Loading subscribers...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-buyko-text">Newsletter Subscribers</h1>
        <span className="text-sm text-buyko-text-dim">{subscribers.length} total</span>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-950/30 border border-red-900 rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {subscribers.length === 0 ? (
        <p className="text-buyko-text-dim text-center py-10">No subscribers yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-buyko-text-dim border-b border-white/10">
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Subscribed on</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((subscriber) => (
                <tr key={subscriber._id} className="border-b border-white/5">
                  <td className="px-4 py-3 text-buyko-text">{subscriber.email}</td>
                  <td className="px-4 py-3 text-buyko-text-dim">
                    {new Date(subscriber.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}