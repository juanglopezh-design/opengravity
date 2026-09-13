import React, { useState } from 'react';
import type { UserAstralProfile } from '../types/lottery';
import { calculateLifePathNumber } from '../services/numerologyEngine';
import { getZodiacSign } from '../services/astrologyEngine';
import { X, Sparkles, Sliders, User, Calendar, Heart, Compass, Check } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserAstralProfile;
  onSave: (newProfile: UserAstralProfile) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [formData, setFormData] = useState<UserAstralProfile>(profile);
  const [newFavInput, setNewFavInput] = useState<string>('');

  if (!isOpen) return null;

  const currentLifePath = calculateLifePathNumber(formData.birthDate);
  const zodiac = getZodiacSign(formData.birthDate);

  const handleAddFavorite = () => {
    const val = parseInt(newFavInput.trim(), 10);
    if (!isNaN(val) && val >= 0 && val <= 99 && !formData.favoriteNumbers.includes(val)) {
      setFormData({
        ...formData,
        favoriteNumbers: [...formData.favoriteNumbers, val].sort((a, b) => a - b),
      });
      setNewFavInput('');
    }
  };

  const handleRemoveFavorite = (num: number) => {
    setFormData({
      ...formData,
      favoriteNumbers: formData.favoriteNumbers.filter((n) => n !== num),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      lifePathNumber: currentLifePath,
      zodiacSign: zodiac.sign,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-cosmos-900 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-astral-violet to-amber-400 p-[1px]">
            <div className="w-full h-full bg-cosmos-950 rounded-[15px] flex items-center justify-center">
              <Compass className="w-6 h-6 text-amber-300" />
            </div>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
              Perfil Astral y Calibración del Bot
            </h2>
            <p className="text-xs text-slate-400">
              Personaliza tus datos natales, números de la suerte y balance cuántico del oráculo.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Identity & Birthdate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                Tu Nombre / Alias
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-cosmos-950/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-sans text-sm"
                placeholder="Juan López"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                Fecha de Nacimiento (Carta Natal)
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-cosmos-950/80 border border-white/10 text-white focus:outline-none focus:border-purple-400 font-sans text-sm"
                required
              />
            </div>
          </div>

          {/* Natal Derived Badges */}
          <div className="p-4 rounded-2xl bg-cosmos-950/60 border border-white/10 flex flex-wrap items-center justify-around gap-4">
            <div className="text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Sendero de Vida (Life Path)</span>
              <div className="text-2xl font-display font-black text-amber-300">
                #{currentLifePath}
              </div>
            </div>

            <div className="h-8 w-px bg-white/10 hidden sm:block" />

            <div className="text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Signo Solar</span>
              <div className="text-lg font-display font-bold text-purple-300">
                {zodiac.sign} ({zodiac.element})
              </div>
            </div>

            <div className="h-8 w-px bg-white/10 hidden sm:block" />

            <div className="text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Afinidad Armónica</span>
              <div className="text-xs font-mono text-emerald-400 font-medium">
                {zodiac.luckyHarmony}
              </div>
            </div>
          </div>

          {/* Target Draw Date */}
          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Fecha del Sorteo a Predecir
            </label>
            <input
              type="date"
              value={formData.drawDate}
              onChange={(e) => setFormData({ ...formData, drawDate: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-cosmos-950/80 border border-white/10 text-white focus:outline-none focus:border-cyan-400 font-sans text-sm"
              required
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Las efemérides lunares y horas planetarias se calculan en base a este día específico.
            </span>
          </div>

          {/* Favorite Numbers Tagger */}
          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              Tus Números Favoritos / Amuletos
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="number"
                min="0"
                max="99"
                value={newFavInput}
                onChange={(e) => setNewFavInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFavorite();
                  }
                }}
                className="w-32 px-3 py-2 rounded-xl bg-cosmos-950/80 border border-white/10 text-white focus:outline-none focus:border-rose-400 font-mono text-sm"
                placeholder="Ej: 7"
              />
              <button
                type="button"
                onClick={handleAddFavorite}
                className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold transition-colors"
              >
                + Añadir
              </button>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[36px] p-3 rounded-xl bg-cosmos-950/50 border border-white/5">
              {formData.favoriteNumbers.length === 0 ? (
                <span className="text-xs text-slate-500 font-mono">
                  No has agregado números favoritos aún. Añade los que tengan significado para ti.
                </span>
              ) : (
                formData.favoriteNumbers.map((num) => (
                  <span
                    key={num}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold"
                  >
                    {num}
                    <button
                      type="button"
                      onClick={() => handleRemoveFavorite(num)}
                      className="hover:text-white transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Weighting Sliders */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-display font-bold text-white">
                Ponderación de los Motores Cuánticos
              </h3>
            </div>

            {/* Slider 1: History */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300">Análisis Estadístico e Histórico</span>
                <span className="text-cyan-400 font-bold">{formData.weights.history}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={formData.weights.history}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    weights: { ...formData.weights, history: parseInt(e.target.value, 10) },
                  })
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Slider 2: Astrology */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300">Posicionamientos Astrales & Fases Lunares</span>
                <span className="text-purple-400 font-bold">{formData.weights.astrology}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={formData.weights.astrology}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    weights: { ...formData.weights, astrology: parseInt(e.target.value, 10) },
                  })
                }
                className="w-full accent-purple-400 cursor-pointer"
              />
            </div>

            {/* Slider 3: Numerology */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300">Numerología Sagrada (Life Path & Universal)</span>
                <span className="text-amber-400 font-bold">{formData.weights.numerology}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={formData.weights.numerology}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    weights: { ...formData.weights, numerology: parseInt(e.target.value, 10) },
                  })
                }
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Slider 4: Favorites */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300">Resonancia de Números Favoritos</span>
                <span className="text-rose-400 font-bold">{formData.weights.favorites}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.weights.favorites}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    weights: { ...formData.weights, favorites: parseInt(e.target.value, 10) },
                  })
                }
                className="w-full accent-rose-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-mono text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-cosmos-950 font-display font-bold text-sm shadow-gold-glow transition-all"
            >
              <Check className="w-4 h-4" />
              Guardar y Calibrar Oráculo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
