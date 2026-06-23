import PropTypes from "prop-types";
import { MapPin, UserPlus } from "lucide-react";
import Avatar from "../dashboard/Avatar";
import Pagination from "../ui/Pagination";
import Skeleton from "../ui/Skeleton";
import { usePagination } from "../../lib/usePagination";

// "Recent Clients" list. The selected client is highlighted.
function ClientList({ clients, selectedId, onSelect, loading, onAdd }) {
  const pager = usePagination(clients, 6);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-quicksand font-bold text-2xl text-brand-dark">Recent Clients</h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 rounded-full bg-brand-dark px-4 py-2 font-quicksand font-semibold text-sm text-white shadow-sm transition hover:brightness-110"
        >
          <UserPlus className="size-4" strokeWidth={2.5} />
          Add Client
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-3xl" />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <p className="font-nunito text-sm text-subtle">No clients yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {pager.pageItems.map((client) => {
            const active = client.id === selectedId;
            return (
              <li key={client.id}>
                <button
                  onClick={() => onSelect(client.id)}
                  className={`flex w-full items-center gap-4 rounded-3xl border p-4 text-left transition ${
                    active
                      ? "border-brand-dark bg-brand text-white shadow-md"
                      : "border-transparent bg-card hover:bg-surface"
                  }`}
                >
                  <Avatar
                    name={client.full_name}
                    src={client.avatar_url}
                    className="size-12 shrink-0 rounded-2xl bg-input"
                    textClassName="text-sm"
                  />
                  <div className="min-w-0">
                    <p className={`truncate font-quicksand font-bold text-base ${active ? "text-white" : "text-ink"}`}>
                      {client.full_name}
                    </p>
                    <p className={`flex items-center gap-1 truncate font-nunito text-xs ${active ? "text-white/80" : "text-subtle"}`}>
                      <MapPin className="size-3 shrink-0" strokeWidth={2} />
                      {client.location || "No location"}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {!loading && clients.length > 0 && pager.totalPages > 1 && (
        <Pagination {...pager} />
      )}
    </div>
  );
}

ClientList.propTypes = {
  clients: PropTypes.array.isRequired,
  selectedId: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  onAdd: PropTypes.func,
};

export default ClientList;
