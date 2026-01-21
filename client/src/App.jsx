import { useState, useEffect } from 'react'
import Header from './components/Header'
import SummaryCard from './components/SummaryCard'
import ParticipantList from './components/ParticipantList'
import HomeView from './components/HomeView'
import PaymentModal from './components/PaymentModal'
import ReceiptCard from './components/ReceiptCard'
import CreateBolsoModal from './components/CreateBolsoModal'
import ParticipantDetailsModal from './components/ParticipantDetailsModal'
import { generateWhatsAppMessage, openWhatsApp } from './utils/whatsapp'
import { bolsoService } from './services/api'
import './App.css'

function App() {
  const [bolsos, setBolsos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeBolsoId, setActiveBolsoId] = useState(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [paymentModalState, setPaymentModalState] = useState(null); // { participantId, date (scheduled) }
  const [lastPayment, setLastPayment] = useState(null);
  const [detailsParticipantId, setDetailsParticipantId] = useState(null);

  // Fetch Bolsos on Mount
  useEffect(() => {
    fetchBolsos();
  }, []);

  const fetchBolsos = async () => {
    try {
      setIsLoading(true);
      const data = await bolsoService.getAll();
      // Normalize data (Sequelize might return Participants capitalized)
      const normalized = data.map(b => ({
        ...b,
        participants: b.Participants || b.participants || [],
        payments: b.Payments || b.payments || []
      }));
      setBolsos(normalized);
    } catch (error) {
      console.error("Failed to fetch bolsos:", error);
      alert("Error al cargar los datos del servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  const activeBolso = bolsos.find(b => b.id === activeBolsoId);
  const today = new Date().toLocaleDateString('es-VE');

  const handleCreateBolso = async (config) => {
    try {
      const newBolso = await bolsoService.create(config);
      // Backend returns structure with Participants included (check endpoint)
      // If endpoint returns just created object without includes populated, we might need to refresh or manual construct
      // The implemented endpoint does a findByPk with includes, so it should be good.

      const normalized = {
        ...newBolso,
        participants: newBolso.Participants || newBolso.participants || [],
        payments: newBolso.Payments || newBolso.payments || []
      };

      setBolsos([...bolsos, normalized]);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating bolso:", error);
      alert("Error al crear el bolso.");
    }
  };

  const handleResetApp = async () => {
    if (window.confirm('⚠️ ¿Estás seguro de borrar este bolso? (Solo local en esta demo, en prod borraría todo)')) {
      // Not implemented global delete in API for safety yet
      alert("Función deshabilitada en modo servidor por seguridad.");
    }
  };

  const handleArchiveBolso = async (id) => {
    if (window.confirm('¿Quieres mover este bolso a la papelera?')) {
      // API TODO: Add archive endpoint or general update
      // For now, implementing client side Optimistic UI + nothing on backend? 
      // Need to add update endpoint or soft delete.
      // Re-map to local update for now, ideally backend has 'archived' field update.
      // Note: Implementation plan didn't explicitly add archive route, but model has field.
      // Using generic update if available or skip. 
      // Let's assume we skip persistence of archive for this specific step or do nothing.
      alert("Archivar no implementado en backend aún.");
    }
  };

  const handleRestoreBolso = (id) => {
    alert("Restaurar no implementado en backend aún.");
  };

  const handleDeleteBolso = async (id) => {
    if (window.confirm('❌ ¿Estás seguro de eliminar este bolso PERMANENTEMENTE?')) {
      try {
        await bolsoService.delete(id);
        const filtered = bolsos.filter(b => b.id !== id);
        setBolsos(filtered);
        if (activeBolsoId === id) setActiveBolsoId(null);
      } catch (error) {
        console.error(error);
        alert("Error al eliminar.");
      }
    }
  };

  const handleParticipantClick = (participantId) => {
    setDetailsParticipantId(participantId);
  };

  const handleRequestPayment = (participantId, date) => {
    setPaymentModalState({ participantId, date });
    setDetailsParticipantId(null);
  };

  const confirmPayment = async (paymentData) => {
    if (!activeBolso || !paymentModalState) return;

    try {
      const { participantId } = paymentModalState;
      const scheduledDate = paymentModalState.date;

      const payload = {
        bolsoId: activeBolso.id,
        participantId: participantId,
        scheduledDate: scheduledDate,
        amountToPay: paymentData.paidAmount,
        paymentDetails: {
          date: paymentData.date, // paidAt
          reference: paymentData.reference,
          currency: paymentData.currency,
          exchangeRate: paymentData.exchangeRate,
          amountBs: paymentData.amountBs
        }
      };

      const result = await bolsoService.registerPayment(payload);

      // Refresh data to ensure sync (or manual update state)
      // Manual update allows smooth UI
      // We need to construct the payment object to match UI expectations
      const updatedBolsos = bolsos.map(b => {
        if (b.id !== activeBolso.id) return b;

        // Update payments list
        const currentPayments = b.payments || [];
        const existingIdx = currentPayments.findIndex(p => p.id === result.id); // result is the Payment record

        let newPayments = [...currentPayments];
        if (existingIdx >= 0) {
          newPayments[existingIdx] = result;
        } else {
          newPayments.push(result);
        }

        return { ...b, payments: newPayments };
      });

      setBolsos(updatedBolsos);
      setPaymentModalState(null);

      const participant = activeBolso.participants.find(p => String(p.id) === String(participantId));
      if (participant) {
        setLastPayment({
          ...result,
          amount: parseFloat(result.amountPaid), // UI uses 'amount' property sometimes for generic receipt? Check ReceiptCard
          // ReceiptCard uses: payment.amount (which in code was 'totalAmount'? No, in original confirmPayment:
          // finalPaymentRecord.amount = totalAmount (Debt)
          // finalPaymentRecord.amountPaid = paid
          // We need to align with PaymentModel which has amountPaid.
          // Let's check ReceiptCard usage.

          // Original:
          // amount: totalAmount (Quota size)
          // amountPaid: ...

          participant
        });
      }

    } catch (error) {
      console.error("Payment Error:", error);
      alert("Ocurrió un error al procesar el pago.");
    }
  };

  const handleUpdateName = async (id, newName) => {
    try {
      await bolsoService.updateParticipant(id, { name: newName });
      // Local update
      const updatedBolsos = bolsos.map(b => {
        if (b.id !== activeBolso.id) return b;
        return {
          ...b,
          participants: b.participants.map(p => p.id === id ? { ...p, name: newName } : p)
        };
      });
      setBolsos(updatedBolsos);
    } catch (error) {
      console.error(error);
      alert("Error actualizando nombre.");
    }
  };

  const handleUpdateTurn = async (id, newTurn) => {
    try {
      await bolsoService.updateParticipant(id, { turn: parseInt(newTurn) });
      // Refresh to handle sort or manual update
      fetchBolsos(); // Easier for sort logic
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Error actualizando turno.");
    }
  };

  const handleUpdateReference = (payment, newReference) => {
    // Not implemented in API yet (Generic PUT payment?)
    alert("Editar referencia no implementado en API.");
  }

  const handleDeletePayment = async (payment) => {
    if (!window.confirm("¿Eliminar pago?")) return;
    try {
      await bolsoService.deletePayment(payment.id);

      const updatedBolsos = bolsos.map(b => {
        if (b.id !== activeBolso.id) return b;
        return {
          ...b,
          payments: b.payments.filter(p => p.id !== payment.id)
        };
      });
      setBolsos(updatedBolsos);
      setLastPayment(null);
    } catch (error) {
      console.error(error);
      alert("Error eliminando pago.");
    }
  };

  const handleShareBolso = () => {
    if (!activeBolso) return;
    const message = generateWhatsAppMessage(activeBolso.participants, activeBolso.payments, today);
    openWhatsApp(message);
  };

  const handleShareReceipt = () => {
    if (!lastPayment || !activeBolso) return;
    // Receipt logic... simplified for now
    let text = `*COMPROBANTE DE PAGO - ${activeBolso.name}*\n\nParticipante: ${lastPayment.participant.name}\nMonto Pagado: $${lastPayment.amountPaid}`;
    openWhatsApp(text);
  };

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>Cargando...</div>;
  }

  if (!activeBolsoId) {
    return (
      <>
        <HomeView
          bolsos={bolsos}
          onSelectBolso={setActiveBolsoId}
          onRequestCreate={() => setShowCreateModal(true)}
          onResetApp={handleResetApp}
          onArchiveBolso={handleArchiveBolso}
          onRestoreBolso={handleRestoreBolso}
          onDeleteBolso={handleDeleteBolso}
        />
        {showCreateModal && (
          <CreateBolsoModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateBolso}
          />
        )}
      </>
    );
  }

  // Derived calcs
  const globalTotalExpected = activeBolso.participants.length * activeBolso.schedule.length * parseFloat(activeBolso.amount);
  const globalTotalCollected = activeBolso.payments.reduce((acc, curr) => acc + parseFloat(curr.amountPaid), 0);

  return (
    <div className="app-container">
      <div style={{ marginBottom: '10px' }}>
        <button
          onClick={() => setActiveBolsoId(null)}
          style={{ color: 'var(--ios-blue)', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}
        >
          ← Volver
        </button>
      </div>

      <Header onShare={handleShareBolso} />

      <h2 style={{ fontSize: '1.2rem', marginBottom: '4px', color: 'var(--ios-text-secondary)', fontWeight: 500 }}>
        {activeBolso.name}
      </h2>

      <div style={{ fontSize: '0.9rem', color: 'var(--ios-text-secondary)', marginBottom: '16px' }}>
        Inicio: {new Date(activeBolso.startDate).toLocaleDateString('es-VE')} • {activeBolso.participants.length} Personas • ${activeBolso.amount}/cuota
      </div>

      <SummaryCard
        totalCollected={globalTotalCollected}
        totalExpected={globalTotalExpected}
        label="Progreso Total"
      />

      <ParticipantList
        participants={activeBolso.participants}
        payments={activeBolso.payments}
        bolsoSchedule={activeBolso.schedule}
        currentDate={today}
        onTogglePayment={handleParticipantClick}
      />

      {/* MODALS */}

      {detailsParticipantId && (
        <ParticipantDetailsModal
          participant={activeBolso.participants.find(p => p.id === detailsParticipantId)}
          bolso={activeBolso}
          onClose={() => setDetailsParticipantId(null)}
          onUpdateName={handleUpdateName}
          onUpdateTurn={handleUpdateTurn}
          onPayDate={(date) => handleRequestPayment(detailsParticipantId, date)}
          onViewReceipt={(payment) => {
            const participant = activeBolso.participants.find(p => p.id === detailsParticipantId);
            setLastPayment({ ...payment, participant });
            setDetailsParticipantId(null);
          }}
        />
      )}

      {paymentModalState && (
        <PaymentModal
          participant={activeBolso.participants.find(p => p.id === paymentModalState.participantId)}
          scheduledDate={paymentModalState.date}
          payment={activeBolso.payments.find(p => p.participantId === paymentModalState.participantId && p.date === paymentModalState.date)}
          totalAmount={activeBolso.amount}
          onClose={() => setPaymentModalState(null)}
          onConfirm={confirmPayment}
        />
      )}

      {lastPayment && (
        <ReceiptCard
          payment={lastPayment}
          participant={lastPayment.participant}
          onClose={() => setLastPayment(null)}
          onShare={handleShareReceipt}
          onUpdateReference={handleUpdateReference}
          onDelete={handleDeletePayment}
        />
      )}
    </div>
  )
}

export default App
