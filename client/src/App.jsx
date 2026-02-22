import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LandingPage from './components/LandingPage'
import LoginView from './components/LoginView'
import Header from './components/Header'
import SummaryCard from './components/SummaryCard'
import ParticipantList from './components/ParticipantList'
import HomeView from './components/HomeView'
import PaymentModal from './components/PaymentModal'
import ReceiptCard from './components/ReceiptCard'
import CreateBolsoModal from './components/CreateBolsoModal'
import ParticipantDetailsModal from './components/ParticipantDetailsModal'
import PayoutReceiptCard from './components/PayoutReceiptCard'
import PayoutModal from './components/PayoutModal'
import LiquidityIndicator from './components/LiquidityIndicator'
import BolsoReport from './components/BolsoReport'
import ParticipantReport from './components/ParticipantReport'
import PublicParticipantView from './components/PublicParticipantView'
import { generateWhatsAppMessage, openWhatsApp } from './utils/whatsapp'
import { bolsoService } from './services/api'
import { formatDate } from './utils/formatters'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/public/participant/:token" element={<PublicParticipantView />} />
      <Route path="/*" element={<PrivateApp />} />
    </Routes>
  );
}

function PrivateApp() {
  const { user, loading: authLoading } = useAuth();
  const [bolsos, setBolsos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeBolsoId, setActiveBolsoId] = useState(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [paymentModalState, setPaymentModalState] = useState(null); // { participantId, date (scheduled) }
  const [lastPayment, setLastPayment] = useState(null);
  const [payoutReceiptParticipant, setPayoutReceiptParticipant] = useState(null);
  const [detailsParticipantId, setDetailsParticipantId] = useState(null);
  const [payoutModalState, setPayoutModalState] = useState(null); // { participantId }
  const [showReport, setShowReport] = useState(false);
  const [showParticipantReportId, setShowParticipantReportId] = useState(null);

  // Fetch Bolsos on Mount
  useEffect(() => {
    // Check for token in URL (Google Auth redirect)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      try {
        // Decode JWT payload to get user info
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const userPayload = JSON.parse(jsonPayload);

        // Save token and user
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({
          id: userPayload.id,
          email: userPayload.email,
          role: userPayload.role,
          // Use real name if token has it, else email prefix
          name: userPayload.name || userPayload.email.split('@')[0],
          canEdit: userPayload.role === 'superadmin' || userPayload.isAdmin,
          isAdmin: userPayload.isAdmin
        }));
      } catch (e) {
        console.error("Token parsing error:", e);
      }

      // Clear URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Reload to let AuthContext pick it up
      window.location.reload();
      return;
    }

    if (user) {
      fetchBolsos();
    }
  }, [user]);

  const fetchBolsos = async () => {
    try {
      setIsLoading(true);
      const data = await bolsoService.getAll();
      // Normalize data (Sequelize might return Participants capitalized)
      const normalized = data.map(b => ({
        ...b,
        participants: b.Participants || b.participants || [],
        payments: (b.Payments || b.payments || []).map(p => ({
          ...p,
          date: p.scheduledDate // Ensure date property exists for frontend logic
        }))
      }));
      setBolsos(normalized);
    } catch (error) {
      console.error("Failed to fetch bolsos:", error);
      alert("Error: " + (error.message || "Error al cargar los datos"));
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
        payments: (newBolso.Payments || newBolso.payments || []).map(p => ({
          ...p,
          date: p.scheduledDate
        }))
      };

      setBolsos([...bolsos, normalized]);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating bolso:", error);
      alert("Error al crear el bolso.");
    }
  };

  const handleResetApp = async () => {
    if (window.confirm('⚠️ ¿Estás seguro de BORRAR TODO? Esta acción no se puede deshacer.')) {
      try {
        await bolsoService.resetApp();
        alert("Aplicación reiniciada. Se recargará la página.");
        window.location.reload();
      } catch (e) {
        console.error(e);
        alert("Error al reiniciar la app.");
      }
    }
  };

  const handleArchiveBolso = async (id) => {
    if (window.confirm('¿Quieres mover este bolso a la papelera?')) {
      try {
        await bolsoService.update(id, { archived: true });
        // Remove from view if we don't have a "Trash" view. 
        // For now, reload or filter out locally.
        setBolsos(bolsos.map(b => b.id === id ? { ...b, archived: true } : b));
        if (activeBolsoId === id) setActiveBolsoId(null);
      } catch (e) {
        console.error(e);
        alert("Error al archivar.");
      }
    }
  };

  const handleRestoreBolso = async (id) => {
    try {
      await bolsoService.update(id, { archived: false });
      setBolsos(bolsos.map(b => b.id === id ? { ...b, archived: false } : b));
    } catch (e) {
      console.error(e);
      alert("Error al restaurar.");
    }
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
    // Check if already paid logic using normalized date
    if (activeBolso) {
      const existingPayment = activeBolso.payments.find(p =>
        p.participantId === participantId && p.date === date
      );

      if (existingPayment) {
        const participant = activeBolso.participants.find(p => p.id === participantId);
        setLastPayment({ ...existingPayment, participant });
        setDetailsParticipantId(null);
        return;
      }
    }

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
        const normalizedResult = { ...result, date: scheduledDate };

        if (existingIdx >= 0) {
          newPayments[existingIdx] = normalizedResult;
        } else {
          newPayments.push(normalizedResult);
        }

        return { ...b, payments: newPayments };
      });

      setBolsos(updatedBolsos);
      setPaymentModalState(null);

      const participant = activeBolso.participants.find(p => String(p.id) === String(participantId));
      if (participant) {
        if (participant) {
          setLastPayment({
            ...result,
            amount: parseFloat(result.amountPaid),
            date: scheduledDate, // Explicitly pass the scheduled date
            participant
          });
        }
      }

    } catch (error) {
      console.error("Payment Error:", error);
      const msg = error.response?.data?.error || error.message || "Ocurrió un error al procesar el pago.";
      alert("Error: " + msg);
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

  const handleRegisterPayout = async (participantId) => {
    if (!activeBolso) return;

    // Open Modal instead of direct confirm
    setPayoutModalState({ participantId });
    // setDetailsParticipantId(null); // Keep details open? No, close to focus on payout
    // actually, let's keep details open underneath or close it? 
    // Usually modals stack or swap. Let's swap.
    setDetailsParticipantId(null);
  };

  const confirmPayout = async (payoutData) => {
    if (!activeBolso || !payoutModalState) return;

    const { participantId } = payoutModalState;

    try {
      const updatedParticipant = await bolsoService.updateParticipant(participantId, payoutData);

      // Update Local State
      const updatedBolsos = bolsos.map(b => {
        if (b.id !== activeBolso.id) return b;
        return {
          ...b,
          participants: b.participants.map(p => p.id === participantId ? { ...p, ...updatedParticipant, ...payoutData } : p)
        };
      });
      setBolsos(updatedBolsos);

      // Show Receipt with Optimistic Data (merge local input to guarantee immediate feedback)
      // This fixes the issue where backend response might be partial or slow
      const receiptData = {
        ...updatedParticipant,
        payoutAmount: payoutData.payoutAmount,
        payoutDate: payoutData.payoutDate,
        payoutReference: payoutData.payoutReference
      };

      setPayoutReceiptParticipant(receiptData);
      setPayoutModalState(null);

    } catch (e) {
      console.error(e);
      alert("Error al registrar la entrega.");
    }
  };

  const handleSharePayout = () => {
    if (!payoutReceiptParticipant || !activeBolso) return;
    const text = `*ENTREGA DE BOLSO - ${activeBolso.name}*\n\n` +
      `🎉 *Felicidades:* ${payoutReceiptParticipant.name}\n` +
      `📅 *Fecha:* ${formatDate(payoutReceiptParticipant.payoutDate)}\n` +
      `💰 *Monto Entregado:* $${payoutReceiptParticipant.payoutAmount}` +
      (payoutReceiptParticipant.payoutCurrency === 'BS' ? ` (Bs. ${payoutReceiptParticipant.payoutAmountBs})` : '');
    openWhatsApp(text);
  };

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

    // Build details string
    let amountDetails = `$${lastPayment.amountPaid}`;
    if (lastPayment.currency === 'BS' && lastPayment.amountBs) {
      amountDetails += ` (Bs.${lastPayment.amountBs} @ ${lastPayment.exchangeRate})`;
    }

    let text = `*COMPROBANTE DE PAGO - ${activeBolso.name}*\n\n` +
      `👤 *Participante:* ${lastPayment.participant.name}\n` +
      `📅 *Fecha:* ${formatDate(lastPayment.date)}\n` +
      `💰 *Monto:* ${amountDetails}\n` +
      (lastPayment.reference ? `#️⃣ *Ref:* ${lastPayment.reference}` : '');

    openWhatsApp(text);
  };

  if (authLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--ios-blue)' }}>Cargando sesión...</div>;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginView />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>Cargando datos...</div>;
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

  const globalTotalExpected = activeBolso.participants.length * activeBolso.schedule.length * parseFloat(activeBolso.amount);
  const globalTotalCollected = activeBolso.payments.reduce((acc, curr) => acc + parseFloat(curr.amountPaid), 0);
  const globalTotalPaidOut = activeBolso.participants.reduce((acc, curr) => acc + (parseFloat(curr.payoutAmount) || 0), 0);

  // Standard Payout (Pot Size)
  const standardPayout = parseFloat(activeBolso.amount) * activeBolso.participants.length;

  return (
    <div className="app-container">
      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
        <button
          onClick={() => setActiveBolsoId(null)}
          style={{ color: 'var(--ios-blue)', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}
        >
          ← Volver
        </button>
        <button
          onClick={() => setShowReport(true)}
          style={{ color: 'var(--ios-blue)', fontSize: '0.9rem', fontWeight: 600, border: 'none', background: 'none' }}
        >
          Imprimir Reporte
        </button>
      </div>

      <Header onShare={handleShareBolso} />

      <h2 style={{ fontSize: '1.2rem', marginBottom: '4px', color: 'var(--ios-text-secondary)', fontWeight: 500 }}>
        {activeBolso.name}
      </h2>

      <div style={{ fontSize: '0.9rem', color: 'var(--ios-text-secondary)', marginBottom: '16px' }}>
        Inicio: {formatDate(activeBolso.startDate)} • {activeBolso.participants.length} Personas • ${activeBolso.amount}/cuota
      </div>

      <SummaryCard
        totalCollected={globalTotalCollected}
        totalExpected={globalTotalExpected}
        label="Progreso Total"
      />

      <LiquidityIndicator
        totalCollected={globalTotalCollected}
        totalPaidOut={globalTotalPaidOut}
        payoutAmount={standardPayout}
      />

      <ParticipantList
        participants={[...activeBolso.participants].sort((a, b) => {
          if (a.turn && b.turn) return a.turn - b.turn;
          if (a.turn) return -1;
          if (b.turn) return 1;
          return 0;
        })}
        payments={activeBolso.payments}
        bolsoSchedule={activeBolso.schedule}
        currentDate={today}
        onTogglePayment={handleParticipantClick}
        readOnly={activeBolso.userId && activeBolso.userId !== user.id}
      />

      {/* MODALS */}

      {detailsParticipantId && (
        <ParticipantDetailsModal
          participant={activeBolso.participants.find(p => p.id === detailsParticipantId)}
          bolso={activeBolso}
          onClose={(action) => {
            if (action === 'print') {
              setShowParticipantReportId(detailsParticipantId);
              setDetailsParticipantId(null);
            } else {
              setDetailsParticipantId(null);
            }
          }}
          onUpdateName={handleUpdateName}
          onUpdateTurn={handleUpdateTurn}
          onPayDate={(date) => handleRequestPayment(detailsParticipantId, date)}
          onViewReceipt={(payment) => {
            const participant = activeBolso.participants.find(p => p.id === detailsParticipantId);
            setLastPayment({ ...payment, participant });
            setDetailsParticipantId(null);
          }}
          onRegisterPayout={() => handleRegisterPayout(detailsParticipantId)}
          onViewPayoutReceipt={() => {
            const p = activeBolso.participants.find(x => x.id === detailsParticipantId);
            setPayoutReceiptParticipant(p);
            setDetailsParticipantId(null);
          }}
          readOnly={activeBolso.userId && activeBolso.userId !== user.id}
        />
      )}

      {payoutReceiptParticipant && (
        <PayoutReceiptCard
          participant={payoutReceiptParticipant}
          bolso={activeBolso}
          onClose={() => setPayoutReceiptParticipant(null)}
          onShare={handleSharePayout}
        />
      )}

      {payoutModalState && (
        <PayoutModal
          participant={activeBolso.participants.find(p => p.id === payoutModalState.participantId)}
          totalCollected={globalTotalCollected} // Pass collected to help defaults? Or just pass calculated standard
          onClose={() => setPayoutModalState(null)}
          onConfirm={confirmPayout}
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
      {showReport && (
        <BolsoReport
          bolso={activeBolso}
          onClose={() => setShowReport(false)}
        />
      )}
      {showParticipantReportId && (
        <ParticipantReport
          participant={activeBolso.participants.find(p => p.id === showParticipantReportId)}
          bolso={activeBolso}
          onClose={() => setShowParticipantReportId(null)}
        />
      )}
    </div>
  )
}

export default App
