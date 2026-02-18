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
                <div className="flex items-center gap-3">
                    <img src="/logo.svg?v=4" alt="Ahorro Fácil Logo" className="w-12 h-12 shadow-lg rounded-full" />
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
                        className="px-5 py-2.5 bg-white text-black rounded-full text-sm font-bold hover:bg-gray-100 transition shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] transform hover:-translate-y-0.5 active:translate-y-0"
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
                {/* CSS Realistic Phone Mockup */}
                {/* CSS Realistic Phone Mockup */}
                {/* CSS Realistic Phone Mockup */}
                <div className="mt-16 relative w-[300px] h-[600px] bg-gray-700 rounded-[3rem] border-[8px] border-gray-500 shadow-2xl animate-enter ring-1 ring-white/20" style={{ animationDelay: '0.2s', boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.7), 0 30px 60px -30px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.05)' }}>
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-black rounded-b-xl z-20"></div>

                    {/* Screen Content */}
                    {/* Screen Content */}
                    <div className="w-full h-full bg-surface rounded-[2.5rem] overflow-hidden relative flex flex-col font-sans">
                        {/* Status Bar */}
                        <div className="h-8 w-full flex justify-between items-center px-6 pt-2">
                            <span className="text-[10px] font-bold text-text-primary">9:41</span>
                            <div className="flex gap-1.5">
                                <div className="w-4 h-2.5 bg-text-primary rounded-[2px]" />
                                <div className="w-4 h-2.5 bg-text-primary rounded-[2px]" />
                                <div className="w-4 h-2.5 bg-text-primary rounded-[2px] opacity-30" />
                            </div>
                        </div>

                        {/* App Header */}
                        <div className="px-6 py-4 flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-10">
                            <div className="flex items-center gap-1 text-blue-500 text-sm font-medium">
                                <ArrowRight className="rotate-180 w-4 h-4" /> Volver
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shadow-sm">
                                <img src={`https://ui-avatars.com/api/?name=Jorge&background=0D8ABC&color=fff`} alt="Profile" />
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto px-5 pb-20 no-scrollbar">
                            {/* Bolso Title */}
                            <h2 className="text-2xl font-bold text-text-primary mb-1 mt-2">Viaje Europa 2026</h2>
                            <div className="text-xs text-text-secondary font-medium mb-6 flex gap-2 items-center">
                                <span>Inicio: 15 Ago</span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <span>10 Personas</span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <span>$150/cuota</span>
                            </div>

                            {/* Progress Card */}
                            <div className="p-5 rounded-3xl bg-white shadow-lg shadow-black/5 mb-6 border border-white/60">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[11px] font-bold text-gray-400 tracking-wider">PROGRESO TOTAL</span>
                                    <span className="text-sm font-bold text-blue-500">32%</span>
                                </div>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-3xl font-extrabold text-text-primary">$4,800</span>
                                    <span className="text-sm font-medium text-text-tertiary">/ $15,000</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[32%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                </div>
                            </div>

                            {/* Participants List */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center px-1">
                                    <h3 className="text-sm font-semibold text-text-secondary">Participantes</h3>
                                    <span className="text-xs text-blue-500 font-medium">Ver todos</span>
                                </div>

                                {/* Row 1: Paid */}
                                <div className="p-3 bg-white/60 rounded-2xl flex items-center justify-between border border-white/50 shadow-sm backdrop-blur-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs ring-2 ring-white shadow-sm">
                                            JS
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-text-primary">Juan Soto</span>
                                            <span className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Pagado hoy
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-text-primary">$150</span>
                                </div>

                                {/* Row 2: Pending */}
                                <div className="p-3 bg-white/40 rounded-2xl flex items-center justify-between border border-white/30 shadow-sm opacity-70">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-xs ring-2 ring-white shadow-sm">
                                            MR
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-800">Maria Ruiz</span>
                                            <span className="text-[10px] text-orange-500 font-medium">Pendiente</span>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-gray-400">$150</span>
                                </div>

                                {/* Row 3: Paid */}
                                <div className="p-3 bg-white/60 rounded-2xl flex items-center justify-between border border-white/50 shadow-sm backdrop-blur-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs ring-2 ring-white shadow-sm">
                                            CL
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-text-primary">Carlos Lopez</span>
                                            <span className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Pagado ayer
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-text-primary">$150</span>
                                </div>
                            </div>
                        </div>

                        {/* Floating Action Button */}
                        <div className="absolute bottom-6 right-6 z-20">
                            <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40 text-white shadow-xl">
                                <Users size={24} />
                            </div>
                        </div>

                        {/* Bottom Blur Overlay for depth */}
                        <div className="absolute bottom-0 w-full h-16 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />
                    </div>
                </div>
            </main>

            {/* Features Section */}
            <section id="features" className="py-24 px-6 relative z-10 bg-black/20 backdrop-blur-lg">
                <div className="max-w-7xl mx-auto">
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
            <footer className="py-8 text-center text-gray-400 text-sm border-t border-white/5 bg-[#000000]">
                © 2026 Grupo Aludra. Todos los derechos reservados.
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="p-8 rounded-3xl bg-white/10 border border-white/10 hover:border-white/20 hover:bg-white/15 transition duration-300 backdrop-blur-md shadow-lg hover:shadow-xl group">
        <div className="mb-6 p-4 bg-white/10 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
        <p className="text-gray-300 leading-relaxed">{desc}</p>
    </div>
);

export default LandingPage;
