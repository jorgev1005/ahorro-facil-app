import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Wallet, Users, BarChart3, ShieldCheck } from 'lucide-react';
import '../index.css';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col font-sans text-text-primary">
            {/* Background Elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-sky-500/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />

            {/* Navbar */}
            <nav className="w-full p-6 flex justify-between items-center z-10 glass-card bg-opacity-30 border-b border-white/5 rounded-none fixed top-0 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                        <Wallet size={18} className="text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Ahorro Fácil</span>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/login')}
                        className="text-sm font-medium text-text-secondary hover:text-text-primary transition"
                    >
                        Ingresar
                    </button>
                    <button
                        onClick={() => navigate('/login?register=true')}
                        className="px-4 py-2 bg-text-primary text-black rounded-full text-sm font-bold hover:bg-white/90 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        Registrarse
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col justify-center items-center text-center px-4 pt-24 pb-12 z-10">
                <div className="animate-enter">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-blue-300 mb-6 backdrop-blur-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        Ahora disponible en Móvil
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
                        Tu dinero,<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                            organizado y seguro.
                        </span>
                    </h1>

                    <p className="text-lg text-text-secondary max-w-2xl mb-10 leading-relaxed">
                        Administra bolsos de ahorro, gestiona paquetería y controla tus entregas con una experiencia visual premium y transparente.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={() => navigate('/login')}
                            className="group px-8 py-4 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl font-bold text-white text-lg shadow-lg hover:shadow-blue-500/25 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                            Comenzar Gratis
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={() => {
                                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-semibold text-text-secondary hover:bg-white/10 transition backdrop-blur-sm"
                        >
                            Ver más
                        </button>
                    </div>
                </div>

                {/* Mockup / Visual */}
                <div className="mt-16 w-full max-w-4xl glass-card p-4 rounded-3xl border border-white/10 shadow-2xl relative animate-enter" style={{ animationDelay: '0.2s' }}>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 rounded-3xl pointer-events-none" />
                    {/* Simulated Interface */}
                    <div className="bg-surface rounded-2xl p-6 md:p-10 text-left relative overflow-hidden">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <div className="h-2 w-20 bg-text-tertiary/20 rounded mb-2"></div>
                                <div className="h-6 w-40 bg-text-secondary/20 rounded"></div>
                            </div>
                            <div className="h-10 w-10 bg-blue-500/20 rounded-full"></div>
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-16 w-full bg-white/5 rounded-xl flex items-center px-4 gap-4">
                                    <div className="h-8 w-8 bg-white/10 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="h-3 w-24 bg-white/10 rounded mb-2"></div>
                                        <div className="h-2 w-16 bg-white/5 rounded"></div>
                                    </div>
                                    <div className="h-3 w-12 bg-green-400/20 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Features Section */}
            <section id="features" className="py-24 px-6 relative z-10 bg-black/20 backdrop-blur-lg">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Todo lo que necesitas</h2>
                        <p className="text-text-secondary">Diseñado para ser simple, potente y hermoso.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Users className="text-blue-400" size={32} />}
                            title="Gestión de Participantes"
                            desc="Controla quién ha pagado, quién debe y envía recordatorios automáticos por WhatsApp."
                        />
                        <FeatureCard
                            icon={<BarChart3 className="text-purple-400" size={32} />}
                            title="Reportes Financieros"
                            desc="Visualiza la liquidez del bolso y genera reportes PDF profesionales al instante."
                        />
                        <FeatureCard
                            icon={<ShieldCheck className="text-emerald-400" size={32} />}
                            title="Seguridad Total"
                            desc="Suscripciones gestionadas, roles de administrador y copias de seguridad automáticas."
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 text-center text-text-tertiary text-sm border-t border-white/5 bg-[#000000]">
                © 2026 Grupo Aludra. Todos los derechos reservados.
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/[0.07] transition duration-300">
        <div className="mb-6 p-4 bg-white/5 rounded-2xl w-fit">{icon}</div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-text-secondary leading-relaxed">{desc}</p>
    </div>
);

export default LandingPage;
