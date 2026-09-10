"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    query,
    orderBy,
    limit
} from "firebase/firestore";
import { signOut, User } from "firebase/auth";
import {
    Users,
    Activity,
    LogOut,
    Plus,
    RefreshCw,
    Trash2,
    CheckCircle2,
    AlertTriangle,
    Terminal,
    Radio
} from "lucide-react";

interface Pilot {
    id: string;
    callsign?: string;
    role?: string;
    status?: string;
    createdAt?: unknown;
}

export default function Dashboard({ user }: { user: User }) {
    const [pilots, setPilots] = useState<Pilot[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPilots = async () => {
        setLoading(true);
        setError(null);
        try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, limit(25));
            const snapshot = await getDocs(q);

            const fetched: Pilot[] = [];
            snapshot.forEach((docSnap) => {
                fetched.push({
                    id: docSnap.id,
                    ...docSnap.data(),
                });
            });
            setPilots(fetched);
        } catch (err: unknown) {
            console.error("Firestore error:", err);
            const fireErr = err as { message?: string };
            setError(fireErr.message || "Error al consultar Firestore");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPilots();
    }, []);

    const handleCreatePilot = async () => {
        setActionLoading(true);
        try {
            const callsigns = ["Viper", "Ghost", "Falcon", "Nova", "Spectre", "Shadow", "Maverick"];
            const roles = ["Capitán de Flota", "Especialista Táctico", "Navegante", "Operador de Drones"];
            const randomCallsign = callsigns[Math.floor(Math.random() * callsigns.length)] + "-" + Math.floor(100 + Math.random() * 900);
            const randomRole = roles[Math.floor(Math.random() * roles.length)];

            await addDoc(collection(db, "users"), {
                callsign: randomCallsign,
                role: randomRole,
                status: "En Misión",
                registeredBy: user.email || user.uid,
                createdAt: serverTimestamp(),
            });

            await fetchPilots();
        } catch (err: unknown) {
            console.error("Error creating pilot:", err);
            const fireErr = err as { message?: string };
            setError("Error al escribir en Firestore: " + (fireErr.message || "Permisos denegados"));
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeletePilot = async (pilotId: string) => {
        try {
            await deleteDoc(doc(db, "users", pilotId));
            setPilots((prev) => prev.filter((p) => p.id !== pilotId));
        } catch (err: unknown) {
            console.error("Error deleting pilot:", err);
            const fireErr = err as { message?: string };
            setError("Error al eliminar documento: " + (fireErr.message || "Permiso denegado"));
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (err) {
            console.error("Error signing out:", err);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6">
            {/* Top Navigation Bar */}
            <header className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#161B26]/90 border border-cyan-500/20 backdrop-blur-md shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8A2BE2] to-[#00FFFF] p-[2px] shadow-[0_0_15px_rgba(0,255,255,0.3)]">
                        <div className="w-full h-full bg-[#10141E] rounded-xl flex items-center justify-center">
                            <Radio className="w-5 h-5 text-[#00FFFF] animate-pulse" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white tracking-wider flex items-center gap-2">
                            CO-PILOTO <span className="text-[#00FFFF] text-xs font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">ONLINE</span>
                        </h1>
                        <p className="text-xs text-gray-400 font-mono">Telemetría de escuadrones & Base de Datos</p>
                    </div>
                </div>

                {/* User Status & Logout */}
                <div className="flex items-center gap-3">
                    <div className="text-right font-mono text-xs hidden sm:block">
                        <p className="text-white font-semibold truncate max-w-[200px]">
                            {user.isAnonymous ? "Piloto Anónimo" : user.email || user.displayName || "Piloto Autenticado"}
                        </p>
                        <p className="text-[#00FFFF] text-[10px] flex items-center justify-end gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00FFFF] inline-block animate-ping" />
                            Sesión Activa: Token Verificado
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        title="Cerrar Sesión"
                        className="px-3 py-2 rounded-xl bg-[#0D111A] border border-gray-700 hover:border-red-500/60 hover:bg-red-950/30 text-gray-300 hover:text-red-400 text-xs font-semibold transition flex items-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden md:inline">Cerrar Sesión</span>
                    </button>
                </div>
            </header>

            {/* Error Banner */}
            {error && (
                <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-sm flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                        <span>{error}</span>
                    </div>
                    <button
                        onClick={() => setError(null)}
                        className="text-xs underline hover:text-white"
                    >
                        Descartar
                    </button>
                </div>
            )}

            {/* Telemetry Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Stat 1: Count */}
                <div className="p-5 rounded-2xl bg-[#161B26] border border-gray-800 relative overflow-hidden group hover:border-[#00FFFF]/50 transition">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition" />
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                            Pilotos en Firestore
                        </span>
                        <Users className="w-5 h-5 text-[#00FFFF]" />
                    </div>
                    <div className="text-3xl font-black text-white font-mono flex items-baseline gap-2">
                        {loading ? (
                            <span className="text-gray-500 animate-pulse text-xl">Cargando...</span>
                        ) : (
                            <>
                                <span className="text-[#00FFFF]">{pilots.length}</span>
                                <span className="text-xs text-gray-500 font-normal">registrados</span>
                            </>
                        )}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-2 font-mono">Colección /users leída con éxito</p>
                </div>

                {/* Stat 2: Security & Rules */}
                <div className="p-5 rounded-2xl bg-[#161B26] border border-gray-800 relative overflow-hidden group hover:border-[#8A2BE2]/50 transition">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition" />
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                            Regla de Seguridad
                        </span>
                        <CheckCircle2 className="w-5 h-5 text-[#8A2BE2]" />
                    </div>
                    <div className="text-lg font-bold text-white font-mono flex items-center gap-2">
                        <span className="text-[#8A2BE2]">request.auth != null</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2 font-mono">
                        Estado: <span className="text-emerald-400 font-semibold">CUMPLIDA</span> (Permisos concedidos)
                    </p>
                </div>

                {/* Stat 3: Telemetry Status */}
                <div className="p-5 rounded-2xl bg-[#161B26] border border-gray-800 relative overflow-hidden group hover:border-emerald-500/50 transition">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition" />
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                            Conexión Firestore
                        </span>
                        <Activity className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="text-lg font-bold text-emerald-400 font-mono flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        ACTIVA & ENLACE OK
                    </div>
                    <p className="text-[11px] text-gray-500 mt-2 font-mono">
                        UID: <span className="text-gray-300">{user.uid.slice(0, 12)}...</span>
                    </p>
                </div>
            </div>

            {/* Main Action Bar & Documents Panel */}
            <div className="p-6 rounded-2xl bg-[#161B26]/90 border border-gray-800 shadow-xl space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Terminal className="w-5 h-5 text-[#00FFFF]" />
                            Escuadrón de Pilotos en Base de Datos
                        </h2>
                        <p className="text-xs text-gray-400 font-mono">
                            Prueba la lectura y escritura directa sobre la colección <code className="text-[#00FFFF]">users</code>
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={fetchPilots}
                            disabled={loading}
                            title="Recargar datos"
                            className="p-2.5 rounded-xl bg-[#0D111A] border border-gray-700 hover:border-[#00FFFF] text-gray-300 hover:text-white transition disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#00FFFF]" : ""}`} />
                        </button>

                        <button
                            onClick={handleCreatePilot}
                            disabled={actionLoading}
                            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00FFFF] to-[#8A2BE2] text-[#0A0D14] font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,255,255,0.25)] hover:shadow-[0_0_22px_rgba(0,255,255,0.4)] active:scale-95 transition flex items-center gap-2 disabled:opacity-50"
                        >
                            {actionLoading ? (
                                <div className="w-4 h-4 border-2 border-[#0A0D14] border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    <span>Registrar Nuevo Piloto</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Pilots Table / List */}
                {loading ? (
                    <div className="py-16 text-center text-gray-400 font-mono space-y-3">
                        <div className="w-8 h-8 border-2 border-[#00FFFF] border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-xs">Sincronizando con Cloud Firestore...</p>
                    </div>
                ) : pilots.length === 0 ? (
                    <div className="py-12 px-6 rounded-xl border border-dashed border-gray-800 text-center space-y-3">
                        <Users className="w-10 h-10 text-gray-600 mx-auto" />
                        <h3 className="text-sm font-semibold text-gray-300 font-mono">No hay pilotos en la colección &quot;users&quot;</h3>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto font-mono">
                            Tu regla de seguridad te permite escribir. Haz clic en el botón superior para registrar el primer piloto de prueba.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-mono text-xs">
                            <thead>
                                <tr className="border-b border-gray-800 text-gray-400 uppercase tracking-wider">
                                    <th className="pb-3 font-semibold">Identificador / Callsign</th>
                                    <th className="pb-3 font-semibold">Rol</th>
                                    <th className="pb-3 font-semibold">Estado</th>
                                    <th className="pb-3 font-semibold">ID de Documento</th>
                                    <th className="pb-3 font-semibold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/60">
                                {pilots.map((pilot) => (
                                    <tr key={pilot.id} className="hover:bg-cyan-500/5 transition">
                                        <td className="py-3.5 font-bold text-[#00FFFF]">
                                            {pilot.callsign || "Piloto Sin Nombre"}
                                        </td>
                                        <td className="py-3.5 text-gray-300">
                                            {pilot.role || "General"}
                                        </td>
                                        <td className="py-3.5">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                                                {pilot.status || "Activo"}
                                            </span>
                                        </td>
                                        <td className="py-3.5 text-gray-500 font-mono text-[11px]">
                                            {pilot.id}
                                        </td>
                                        <td className="py-3.5 text-right">
                                            <button
                                                onClick={() => handleDeletePilot(pilot.id)}
                                                title="Eliminar de Firestore"
                                                className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-950/30 transition"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
