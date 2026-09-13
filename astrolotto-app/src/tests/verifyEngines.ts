import { runPredictionEngine } from '../services/predictionEngine';
import { calculateMoonPhase, getDominantPlanetForDate, getZodiacSign } from '../services/astrologyEngine';
import { calculateLifePathNumber, calculateUniversalDayVibration, computeNumerologyBreakdown } from '../services/numerologyEngine';
import type { UserAstralProfile } from '../types/lottery';

async function runTests() {
  console.log('🌟 [TEST] Iniciando verificación algorítmica de AstroLotto AI...\n');

  // Test 1: Astrology calculations
  console.log('1. Verificando Motor Astrológico...');
  const moon = calculateMoonPhase('2026-09-15');
  console.log(`   - Fase lunar para 2026-09-15: ${moon.name} (${moon.illumination}% luz) ${moon.icon}`);
  if (!moon.name || moon.illumination < 0 || moon.illumination > 100) {
    throw new Error('Fallo en cálculo lunar');
  }

  const planet = getDominantPlanetForDate('2026-09-15'); // Tuesday -> Mars
  console.log(`   - Regente de martes: ${planet.name} ${planet.symbol}`);
  if (planet.name !== 'Marte') {
    throw new Error(`Planeta esperado Marte, recibido ${planet.name}`);
  }

  const zodiac = getZodiacSign('1990-07-15');
  console.log(`   - Signo natal para 15 de Julio: ${zodiac.sign} (${zodiac.element})`);
  if (zodiac.sign !== 'Cáncer') {
    throw new Error(`Signo esperado Cáncer, recibido ${zodiac.sign}`);
  }
  console.log('   ✅ Motor Astrológico validado.\n');

  // Test 2: Numerology calculations
  console.log('2. Verificando Motor de Numerología Sagrada...');
  const lifePath = calculateLifePathNumber('1990-07-15'); // 1+9+9+0=19->10->1, 7, 1+5=6 -> 1+7+6=14 -> 5
  console.log(`   - Sendero de Vida calculado: #${lifePath}`);
  if (lifePath < 1 || lifePath > 33) {
    throw new Error('Sendero de vida fuera de rango');
  }

  const univVib = calculateUniversalDayVibration('2026-09-15');
  console.log(`   - Vibración día universal: #${univVib}`);

  const breakdown = computeNumerologyBreakdown('1990-07-15', '2026-09-15');
  console.log(`   - Matriz armónica resonante generada con ${breakdown.harmoniousMatrix.length} nodos.`);
  if (breakdown.harmoniousMatrix.length === 0) {
    throw new Error('Matriz armónica vacía');
  }
  console.log('   ✅ Motor Numerológico validado.\n');

  const testProfile: UserAstralProfile = {
    name: 'Juan Test',
    birthDate: '1990-07-15',
    zodiacSign: 'Cáncer',
    lifePathNumber: lifePath,
    favoriteNumbers: [7, 14, 21, 33],
    luckyCharm: 'Trébol Cósmico',
    drawDate: '2026-09-15',
    weights: { history: 80, astrology: 80, numerology: 80, favorites: 60 },
  };

  // Test 3: Euromillones
  console.log('3. Verificando Síntesis para Euromillones...');
  const emResult = await runPredictionEngine('euromillones', testProfile, 3);
  if (emResult.tickets.length !== 3) throw new Error('Tickets Euromillones no coincide');
  for (const t of emResult.tickets) {
    if (t.mainNumbers.length !== 5) throw new Error(`Euromillones debe tener 5 números, tiene ${t.mainNumbers.length}`);
    if (t.extraNumbers.length !== 2) throw new Error(`Euromillones debe tener 2 estrellas, tiene ${t.extraNumbers.length}`);
    // Check ranges
    if (t.mainNumbers.some((n) => n < 1 || n > 50)) throw new Error('Números fuera de rango 1-50');
    if (t.extraNumbers.some((s) => s < 1 || s > 12)) throw new Error('Estrellas fuera de rango 1-12');
    // Check uniqueness
    if (new Set(t.mainNumbers).size !== 5) throw new Error('Números duplicados en Euromillones');
    if (new Set(t.extraNumbers).size !== 2) throw new Error('Estrellas duplicadas en Euromillones');
  }
  console.log(`   - 3 boletos generados correctamente. Ejemplo: [${emResult.tickets[0].mainNumbers.join(', ')}] + Estrellas [${emResult.tickets[0].extraNumbers.join(', ')}]`);
  console.log('   ✅ Euromillones validado.\n');

  // Test 4: La Primitiva
  console.log('4. Verificando Síntesis para La Primitiva...');
  const prResult = await runPredictionEngine('primitiva', testProfile, 3);
  if (prResult.tickets.length !== 3) throw new Error('Tickets Primitiva no coincide');
  for (const t of prResult.tickets) {
    if (t.mainNumbers.length !== 6) throw new Error(`Primitiva debe tener 6 números, tiene ${t.mainNumbers.length}`);
    if (t.extraNumbers.length !== 1) throw new Error(`Primitiva debe tener 1 reintegro, tiene ${t.extraNumbers.length}`);
    if (t.mainNumbers.some((n) => n < 1 || n > 49)) throw new Error('Números fuera de rango 1-49');
    if (t.extraNumbers.some((r) => r < 0 || r > 9)) throw new Error('Reintegro fuera de rango 0-9');
    if (new Set(t.mainNumbers).size !== 6) throw new Error('Números duplicados en Primitiva');
  }
  console.log(`   - 3 boletos generados correctamente. Ejemplo: [${prResult.tickets[0].mainNumbers.join(', ')}] + Reintegro [${prResult.tickets[0].extraNumbers.join(', ')}]`);
  console.log('   ✅ La Primitiva validada.\n');

  // Test 5: Lotería de Medellín
  console.log('5. Verificando Síntesis para Lotería de Medellín...');
  const medResult = await runPredictionEngine('medellin', testProfile, 3);
  if (medResult.tickets.length !== 3) throw new Error('Tickets Medellín no coincide');
  for (const t of medResult.tickets) {
    if (t.mainNumbers.length !== 4) throw new Error(`Medellín debe tener 4 dígitos, tiene ${t.mainNumbers.length}`);
    if (t.extraNumbers.length !== 1) throw new Error(`Medellín debe tener 1 serie, tiene ${t.extraNumbers.length}`);
    if (t.mainNumbers.some((d) => d < 0 || d > 9)) throw new Error('Dígito de Medellín fuera de rango 0-9');
    if (t.extraNumbers.some((s) => s < 0 || s > 999)) throw new Error('Serie de Medellín fuera de rango 0-999');
  }
  console.log(`   - 3 boletos generados correctamente. Ejemplo: Número [${medResult.tickets[0].mainNumbers.join('')}] + Serie [${medResult.tickets[0].extraNumbers[0].toString().padStart(3, '0')}]`);
  console.log('   ✅ Lotería de Medellín validada.\n');

  console.log('🎉 TODOS LOS MOTORES Y REGLAS PASARON SATISFACTORIAMENTE AL 100%.');
}

runTests().catch((err) => {
  console.error('❌ Error en pruebas:', err);
});
