import PropTypes from "prop-types";
import { Phone, Mail, Pencil } from "lucide-react";
import Avatar from "../dashboard/Avatar";

// Top detail card: client identity + contact + edit action.
function ClientHeader({ client, onEdit }) {
  if (!client) return null;

  return (
    <div className="flex flex-col gap-6 rounded-[32px] bg-card p-6 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-5">
        <Avatar
          name={client.full_name}
          src={client.avatar_url}
          className="size-24 shrink-0 rounded-3xl bg-input shadow-sm"
          textClassName="text-2xl"
        />
        <div>
          <h1 className="font-quicksand font-bold text-3xl text-ink">{client.full_name}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            {client.phone && (
              <span className="flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 font-nunito font-bold text-xs text-brand-dark">
                <Phone className="size-3.5" strokeWidth={2.5} />
                {client.phone}
              </span>
            )}
            {client.email && (
              <span className="flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 font-nunito font-bold text-xs text-brand-dark">
                <Mail className="size-3.5" strokeWidth={2.5} />
                {client.email}
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={onEdit}
        className="flex shrink-0 items-center gap-2 self-start rounded-full border-2 border-brand-dark px-5 py-2.5 font-quicksand font-semibold text-sm text-brand-dark transition hover:bg-brand/10 sm:self-auto"
      >
        <Pencil className="size-4" strokeWidth={2} />
        Edit Profile
      </button>
    </div>
  );
}

ClientHeader.propTypes = {
  client: PropTypes.object,
  onEdit: PropTypes.func,
};

export default ClientHeader;
