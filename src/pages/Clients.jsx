import { useEffect, useState } from "react";
import { useSearchParams, useOutletContext } from "react-router-dom";
import { Database } from "lucide-react";
import { useClients, useClientDetail } from "../hooks/useClients";
import ClientList from "../components/clients/ClientList";
import ClientHeader from "../components/clients/ClientHeader";
import RegisteredPets from "../components/clients/RegisteredPets";
import MedicalHistory from "../components/clients/MedicalHistory";
import BookFollowupCard from "../components/clients/BookFollowupCard";
import ClientModal from "../components/clients/ClientModal";
import PetModal from "../components/clients/PetModal";
import MedicalRecordModal from "../components/clients/MedicalRecordModal";
import PetHistoryModal from "../components/clients/PetHistoryModal";

function Clients() {
  const { profile, openNewAppointment } = useOutletContext();
  const actorName = profile?.full_name;
  const { loading, error, needsSetup, clients } = useClients();
  const [selectedId, setSelectedId] = useState(null);
  const [clientModal, setClientModal] = useState({ open: false, client: null });
  const [petModal, setPetModal] = useState({ open: false, pet: null });
  const [recordModal, setRecordModal] = useState({ open: false, petId: null });
  const [historyModal, setHistoryModal] = useState({ open: false, pet: null });
  const [searchParams] = useSearchParams();
  const clientParam = searchParams.get("client");

  // Select the client passed via ?client= (from the top-bar search).
  useEffect(() => {
    if (clientParam) setSelectedId(clientParam);
  }, [clientParam]);

  // Default to the first client once the list loads.
  useEffect(() => {
    if (!selectedId && clients.length) setSelectedId(clients[0].id);
  }, [clients, selectedId]);

  const selectedClient = clients.find((c) => c.id === selectedId) ?? null;
  const { loading: detailLoading, pets, records, nextVisit } = useClientDetail(selectedId);

  if (needsSetup) {
    return (
      <main className="p-6 sm:p-8">
        <div className="flex items-start gap-3 rounded-2xl border border-card-border bg-surface p-4">
          <Database className="size-5 shrink-0 text-brand-dark" strokeWidth={2} />
          <p className="font-nunito text-sm text-ink">
            Client tables are not set up yet. Run{" "}
            <code className="rounded bg-card px-1.5 py-0.5 text-brand-dark">
              supabase/0005_clients.sql
            </code>{" "}
            in the Supabase SQL Editor.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="grid grid-cols-1 gap-8 p-6 sm:p-8 xl:grid-cols-12">
      {/* Recent clients */}
      <div className="xl:col-span-4">
        <ClientList
          clients={clients}
          selectedId={selectedId}
          onSelect={setSelectedId}
          loading={loading}
          onAdd={() => setClientModal({ open: true, client: null })}
        />
        {error && (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 font-nunito text-sm text-red-700">
            {error}
          </p>
        )}
      </div>

      {/* Client detail */}
      <div className="flex flex-col gap-8 xl:col-span-8">
        <ClientHeader
          client={selectedClient}
          onEdit={() => selectedClient && setClientModal({ open: true, client: selectedClient })}
        />
        <RegisteredPets
          pets={pets}
          loading={detailLoading}
          onAddPet={() => setPetModal({ open: true, pet: null })}
          onEditPet={(pet) => setPetModal({ open: true, pet })}
          onRecords={(pet) => setRecordModal({ open: true, petId: pet.id })}
          onHistory={(pet) => setHistoryModal({ open: true, pet })}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <MedicalHistory
              records={records}
              loading={detailLoading}
              onAdd={() => pets.length && setRecordModal({ open: true, petId: null })}
            />
          </div>
          <div className="lg:col-span-1">
            <BookFollowupCard nextVisit={nextVisit} onSchedule={openNewAppointment} />
          </div>
        </div>
      </div>

      <ClientModal
        open={clientModal.open}
        client={clientModal.client}
        actorName={actorName}
        onClose={() => setClientModal({ open: false, client: null })}
        onCreated={(id) => setSelectedId(id)}
      />
      <PetModal
        open={petModal.open}
        pet={petModal.pet}
        ownerId={selectedId}
        actorName={actorName}
        onClose={() => setPetModal({ open: false, pet: null })}
      />
      <MedicalRecordModal
        open={recordModal.open}
        pets={pets}
        presetPetId={recordModal.petId}
        actorName={actorName}
        onClose={() => setRecordModal({ open: false, petId: null })}
      />
      <PetHistoryModal
        open={historyModal.open}
        pet={historyModal.pet}
        onClose={() => setHistoryModal({ open: false, pet: null })}
      />
    </main>
  );
}

export default Clients;
