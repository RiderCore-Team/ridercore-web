"use client";

import { useCallback, useEffect, useState, FormEvent } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { signOut, User } from "firebase/auth";
import {
  LogOut,
  RefreshCw,
  AlertTriangle,
  Radio,
  UserCheck,
  Save,
  ShieldAlert,
  Heart,
  Bike
} from "lucide-react";

interface UserProfile {
  displayName: string;
  emergencyPhone: string;
  bloodType: string;
  bikeModel: string;
}

export default function Dashboard({ user }: { user: User }) {
  const [formData, setFormData] = useState<UserProfile>({
    displayName: "",
    emergencyPhone: "",
    bloodType: "",
    bikeModel: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
          displayName: data.displayName || "",
          emergencyPhone: data.emergencyPhone || "",
          bloodType: data.bloodType || "",
          bikeModel: data.bikeModel || "",
        });
      }
    } catch (err: unknown) {
      console.error("Error de perfil", err);
      const fireErr = err as { message?: string };
      setError("No se pudieron cargar los datos del perfil: " + (fireErr.message || "Permiso rechazado"));
    } finally {
      setLoading(false);
    }
  }, [user.uid]);

  useEffect(() => {
    const loadProfile = async () => {
      await fetchUserProfile();
    };

    void loadProfile();
  }, [fetchUserProfile]);

  // Aqui se guarda o actualiza la información del usuario en Firestore 
  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedSuccess(false);

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          displayName: formData.displayName,
          emergencyPhone: formData.emergencyPhone,
          bloodType: formData.bloodType,
          bikeModel: formData.bikeModel,
          userId: user.uid,
          email: user.email || "Anónimo",
          updatedAt: new Date(),
        },
        { merge: true }
      );

        setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error 404 al guardar los .");
    } finally {
      setSaving(false);
    }
  };


  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 text-white font-sans">
      {/* Barra Superior */}
      <header className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#161B26]/90 border border-cyan-500/20 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8A2BE2] to-[#00FFFF] p-[2px] shadow-[0_0_15px_rgba(0,255,255,0.3)]">
            <div className="w-full h-full bg-[#10141E] rounded-xl flex items-center justify-center">
              <Radio className="w-5 h-5 text-[#00FFFF] animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wider flex items-center gap-2">
              CO-PILOTO <span className="text-[#00FFFF] text-xs font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">ONLINE</span>
            </h1>
            <p className="text-xs text-gray-400 font-mono">Registro de Telemetría & Perfil</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right font-mono text-xs hidden sm:block">
            <p className="font-semibold truncate max-w-[200px]">
              {user.isAnonymous ? "Piloto Anónimo" : user.email || "Piloto Autenticado"}
            </p>
            <p className="text-[#00FFFF] text-[10px] flex items-center justify-end gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FFFF] inline-block animate-ping" />
              Sesión Activa
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="px-3 py-2 rounded-xl bg-[#0D111A] border border-gray-700 hover:border-red-500/60 hover:bg-red-950/30 text-gray-300 hover:text-red-400 text-xs font-semibold transition flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Cerrar Sesión</span>
          </button>
        </div>
      </header>

      {/* Alerta de Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-sm flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-xs underline hover:text-white">
            Descartar
          </button>
        </div>
      )}

      {/* Alerta Éxito */}
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-[#00FFFF] text-sm flex items-center gap-2 font-mono shadow-[0_0_15px_rgba(0,255,255,0.2)]">
          <UserCheck className="w-5 h-5 text-[#00FFFF]" />
          <span>¡Datos de piloto actualizados correctamente en la colección &apos;users&apos;!</span>
        </div>
      )}

      {/* Formulario que es principal*/}
      <div className="p-6 rounded-2xl bg-[#161B26]/90 border border-gray-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#00FFFF]" />
              Perfil del Piloto
            </h2>
            <p className="text-xs text-gray-400 font-mono">
              Captura la información personal relevante asociada a tu cuenta.
            </p>
          </div>
          <button
            onClick={fetchUserProfile}
            disabled={loading}
            className="p-2 rounded-xl bg-[#0D111A] border border-gray-700 hover:border-[#00FFFF] text-gray-300 transition disabled:opacity-50"
            title="Recargar datos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#00FFFF]" : ""}`} />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400 font-mono space-y-3">
            <div className="w-8 h-8 border-2 border-[#00FFFF] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Cargando datos del piloto...</p>
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Nombre / Apodo */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-gray-300 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-[#00FFFF]" /> Nombre o Apodo
                </label>
                <input
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="Ej. Maverick / Carlos R."
                  className="w-full p-3 rounded-xl bg-[#0D111A] border border-gray-700 text-white text-sm focus:border-[#00FFFF] focus:outline-none transition font-mono"
                />
              </div>

              {/* Teléfonos de emergencias */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-gray-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-400" /> Teléfono de Emergencia
                </label>
                <input
                  type="tel"
                  required
                  value={formData.emergencyPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                  placeholder="+52 555 000 0000"
                  className="w-full p-3 rounded-xl bg-[#0D111A] border border-gray-700 text-white text-sm focus:border-[#00FFFF] focus:outline-none transition font-mono"
                />
              </div>

              {/* Tipo de Sangre */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-gray-300 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-500" /> Tipo de Sangre
                </label>
                <input
                  type="text"
                  required
                  value={formData.bloodType}
                  onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                  placeholder="O+, A+, AB-, etc."
                  className="w-full p-3 rounded-xl bg-[#0D111A] border border-gray-700 text-white text-sm focus:border-[#00FFFF] focus:outline-none transition font-mono"
                />
              </div>

              {/* Modelo de Moto */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-gray-300 flex items-center gap-1.5">
                  <Bike className="w-4 h-4 text-purple-400" /> Modelo de Moto
                </label>
                <input
                  type="text"
                  required
                  value={formData.bikeModel}
                  onChange={(e) => setFormData({ ...formData, bikeModel: e.target.value })}
                  placeholder="Ej. Italika VX250 / Yamaha MT-07"
                  className="w-full p-3 rounded-xl bg-[#0D111A] border border-gray-700 text-white text-sm focus:border-[#00FFFF] focus:outline-none transition font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-[#00FFFF] to-[#8A2BE2] text-[#0A0D14] font-bold text-sm uppercase tracking-wider shadow-[0_0_15px_rgba(0,255,255,0.25)] hover:shadow-[0_0_22px_rgba(0,255,255,0.4)] active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-[#0A0D14] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Información del Piloto</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}