import React, { useState, useEffect } from 'react';
import '../styles/booking.css';

// Dynamically determine API URL based on current host
const getApiUrl = () => {
    if (typeof window === 'undefined') return 'http://localhost:5000/api';
    return `http://${window.location.hostname}:5000/api`;
};

const API_URL = getApiUrl();

export default function AppointmentBooking() {
    const [step, setStep] = useState(1);
    const [servicios, setServicios] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState({ name: '', phone: '', email: '', notas: '' });
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Track auth state
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchServicios();
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch(`${API_URL}/auth/me`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setIsLoggedIn(true);
                setUserData(prev => ({
                    ...prev,
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || ''
                }));
            } else {
                setIsLoggedIn(false);
            }
        } catch (err) {
            console.error("Auth check failed", err);
            setIsLoggedIn(false);
        }
    };

    const fetchServicios = async () => {
        try {
            const res = await fetch(`${API_URL}/servicios`);
            const data = await res.json();
            setServicios(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSlots = async (date, serviceId) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/citas/disponibilidad?fecha=${date}&servicio_id=${serviceId}`);
            const data = await res.json();
            setAvailableSlots(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleServiceSelect = (service) => {
        setSelectedService(service);
        setStep(2);
    };

    const handleDateChange = (e) => {
        const date = e.target.value;
        setSelectedDate(date);
        if (selectedService) {
            fetchSlots(date, selectedService.id);
        }
    };

    const handleSlotSelect = (slot) => {
        setSelectedSlot(slot);
        setStep(3);
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/citas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    servicio_id: selectedService.id,
                    fecha_cita: selectedDate,
                    hora_inicio: selectedSlot,
                    cliente_nombre: userData.name,
                    cliente_telefono: userData.phone,
                    cliente_email: userData.email,
                    notas: userData.notas
                }),
                credentials: 'include'
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.msg || 'Error booking appointment');
            }

            setSuccess(true);
            setStep(4);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const today = new Date().toISOString().split('T')[0];

    if (success) {
        return (
            <div className="booking-container" style={{ textAlign: 'center' }}>
                <h2 className="section-title" style={{ color: '#22c55e' }}>¡Cita Confirmada!</h2>
                <p style={{ marginBottom: '1rem' }}>Tu cita ha sido reservada con éxito.</p>
                <div className="summary-box" style={{ textAlign: 'left' }}>
                    <p><strong>Servicio:</strong> {selectedService.nombre_servicio}</p>
                    <p><strong>Fecha:</strong> {selectedDate}</p>
                    <p><strong>Hora:</strong> {selectedSlot}</p>
                </div>
                <a href="/mis-citas" className="confirm-btn" style={{ display: 'inline-block', padding: '0.5rem 1.5rem', textDecoration: 'none', width: 'auto' }}>Ver mis citas</a>
            </div>
        );
    }

    return (
        <div className="booking-container">
            {/* Steps Indicator */}
            <div className="steps-indicator">
                <span className={`step-label ${step >= 1 ? 'active' : ''}`}>1. Servicio</span>
                <span className={`step-label ${step >= 2 ? 'active' : ''}`}>2. Fecha y Hora</span>
                <span className={`step-label ${step >= 3 ? 'active' : ''}`}>3. Confirmar</span>
            </div>

            {error && <div className="error-msg">{error}</div>}

            {step === 1 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '2rem'
                }}>
                    {servicios.map(s => (
                        <div
                            key={s.id}
                            className="card"
                            style={{
                                textAlign: 'center',
                                transition: 'transform 0.3s',
                                padding: '1.5rem',
                                borderRadius: '15px',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                                background: 'white',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                            }}
                        >
                            <div>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💅</div>
                                <h3 style={{ color: 'var(--color-text)', marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}>{s.nombre_servicio}</h3>
                                <p style={{ color: '#888', marginBottom: '1rem', fontSize: '0.95rem' }}>{s.descripcion || 'Sin descripción'}</p>
                                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Duración: {s.duracion_minutos} min</p>
                                <p style={{ fontSize: '1.5rem', color: 'var(--color-primary)', fontWeight: '700', marginBottom: '1.5rem' }}>${s.precio}</p>
                            </div>
                            <button
                                onClick={() => handleServiceSelect(s)}
                                className="btn btn-primary"
                                style={{
                                    width: '100%',
                                    backgroundColor: '#FFB7B2',
                                    color: 'white',
                                    padding: '0.75rem',
                                    borderRadius: '50px',
                                    border: 'none',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 6px rgba(255, 183, 178, 0.4)'
                                }}
                            >
                                Reservar Ahora
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {step === 2 && (
                <div>
                    <button onClick={() => setStep(1)} className="back-btn">← Volver a servicios</button>
                    <h2 className="section-title">Selecciona Fecha y Hora</h2>

                    <div className="input-group">
                        <label className="input-label">Fecha</label>
                        <input
                            type="date"
                            min={today}
                            value={selectedDate}
                            onChange={handleDateChange}
                            className="input-field"
                        />
                    </div>

                    {selectedDate && (
                        <div>
                            <h3 style={{ fontWeight: 500, marginBottom: '0.5rem' }}>Horarios Disponibles</h3>
                            {loading ? <p>Cargando horarios...</p> : (
                                availableSlots.length > 0 ? (
                                    <div className="slots-grid">
                                        {availableSlots.map(slot => (
                                            <button
                                                key={slot}
                                                onClick={() => handleSlotSelect(slot)}
                                                className={`slot-btn ${selectedSlot === slot ? 'selected' : ''}`}
                                            >
                                                {slot.slice(0, 5)}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No hay horarios disponibles para esta fecha.</p>
                                )
                            )}
                        </div>
                    )}
                </div>
            )}

            {step === 3 && (
                <div>
                    <button onClick={() => setStep(2)} className="back-btn">← Volver a hora</button>
                    <h2 className="section-title">Confirmar Reserva</h2>

                    <div className="summary-box">
                        <p><strong>Servicio:</strong> {selectedService?.nombre_servicio}</p>
                        <p><strong>Costo:</strong> ${selectedService?.precio}</p>
                        <p><strong>Fecha:</strong> {selectedDate}</p>
                        <p><strong>Hora:</strong> {selectedSlot?.slice(0, 5)}</p>
                    </div>

                    {!isLoggedIn ? (
                        <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#fff5f7', borderRadius: '0.5rem' }}>
                            <p style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Debes iniciar sesión para confirmar tu cita.</p>
                            <a href="/login" className="confirm-btn" style={{ display: 'inline-block', textDecoration: 'none', width: 'auto', padding: '0.75rem 2rem' }}>
                                Iniciar Sesión
                            </a>
                            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#6b7280' }}>
                                ¿No tienes cuenta? <a href="/register" style={{ color: '#FFB7B2', fontWeight: 600 }}>Regístrate</a>
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleBooking}>
                            <div className="input-group">
                                <label className="input-label">Nombre</label>
                                <input
                                    type="text"
                                    required
                                    value={userData.name}
                                    onChange={e => setUserData({ ...userData, name: e.target.value })}
                                    className="input-field"
                                    placeholder="Tu nombre"
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Teléfono</label>
                                <input
                                    type="tel"
                                    required
                                    value={userData.phone}
                                    onChange={e => setUserData({ ...userData, phone: e.target.value })}
                                    className="input-field"
                                    placeholder="Tu teléfono"
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Email (Opcional)</label>
                                <input
                                    type="email"
                                    value={userData.email}
                                    onChange={e => setUserData({ ...userData, email: e.target.value })}
                                    className="input-field"
                                    placeholder="Tu email"
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Notas (Opcional)</label>
                                <textarea
                                    value={userData.notas}
                                    onChange={e => setUserData({ ...userData, notas: e.target.value })}
                                    className="input-field"
                                    placeholder="¿Algún detalle especial?"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="confirm-btn"
                            >
                                {loading ? 'Procesando...' : 'Confirmar Cita'}
                            </button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}
