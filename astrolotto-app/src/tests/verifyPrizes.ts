import { checkTicketPrize } from '../services/prizeChecker';
import { HISTORICAL_DRAWS } from '../data/historicalLotteryData';

console.log('Testing Prize Checker...');

// 1. Euromillones
const emDraw = HISTORICAL_DRAWS.euromillones[0];
const emWin = checkTicketPrize('euromillones', emDraw.numbers, emDraw.extra, emDraw);
console.log('EM Win:', emWin.category, emWin.prizeAmount, emWin.hasWon);
if (!emWin.hasWon || !emWin.isJackpot) throw new Error('EM Jackpot test failed');

// 2. Primitiva
const prDraw = HISTORICAL_DRAWS.primitiva[0];
const prWin = checkTicketPrize('primitiva', prDraw.numbers, prDraw.extra, prDraw);
console.log('PR Win:', prWin.category, prWin.prizeAmount, prWin.hasWon);
if (!prWin.hasWon || !prWin.isJackpot) throw new Error('PR Jackpot test failed');

// 3. Medellín Mayor
const medDraw = HISTORICAL_DRAWS.medellin[0];
const medMayor = checkTicketPrize('medellin', medDraw.numbers, medDraw.extra, medDraw);
console.log('Medellin Mayor:', medMayor.category, medMayor.prizeAmount, medMayor.hasWon);
if (!medMayor.hasWon || !medMayor.isJackpot) throw new Error('Medellin Mayor test failed');

// 4. Medellín Seco de 1.000 Millones
const secoWin = checkTicketPrize('medellin', [1, 9, 4, 0], [112], medDraw);
console.log('Medellin Seco 1000M:', secoWin.category, secoWin.prizeAmount, secoWin.hasWon);
if (!secoWin.hasWon || !secoWin.category.includes('1.000 Millones')) throw new Error('Seco test failed');

// 5. Medellín 4 cifras diferente serie
const difSerie = checkTicketPrize('medellin', medDraw.numbers, [999], medDraw);
console.log('Medellin Diferente Serie:', difSerie.category, difSerie.prizeAmount, difSerie.hasWon);
if (!difSerie.hasWon || !difSerie.category.includes('Diferente Serie')) throw new Error('Dif Serie test failed');

// 6. Medellín última cifra (la uña)
const unaWin = checkTicketPrize('medellin', [0, 0, 0, medDraw.numbers[3]], [999], medDraw);
console.log('Medellin Ultima Cifra:', unaWin.category, unaWin.prizeAmount, unaWin.hasWon);
if (!unaWin.hasWon || !unaWin.category.includes('Última Cifra')) throw new Error('Uña test failed');

console.log('🎉 ALL PRIZE CHECKER TESTS PASSED 100%!');
